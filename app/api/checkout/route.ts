import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseForRoute, createRezervasyon } from '@/lib/supabase';
import type { CartItem } from '@/lib/cartStore';

interface CheckoutIstegi {
  items: CartItem[];
  tarih: string;
  islem_id: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CheckoutIstegi;

    if (!body.items?.length || !body.tarih || !body.islem_id) {
      return NextResponse.json(
        { success: false, error: 'items, tarih ve islem_id zorunludur.' },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const sb = createSupabaseForRoute(cookieStore);
    const { data: { user } } = await sb.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Giriş yapmanız gerekiyor.' },
        { status: 401 }
      );
    }

    // Yalnızca 'package' tipindeki sepet öğeleri rezervasyona dönüşür
    const paketItems = body.items.filter((i) => i.type === 'package');

    const rezervasyonlar = await Promise.all(
      paketItems.map((item) =>
        createRezervasyon({
          kullanici_id: user.id,
          paket_id: item.id,
          tarih: body.tarih,
          durum: 'beklemede',
        })
      )
    );

    return NextResponse.json({ success: true, data: { rezervasyonlar, islem_id: body.islem_id } });
  } catch (error) {
    const mesaj = error instanceof Error ? error.message : 'Bilinmeyen hata';
    return NextResponse.json(
      { success: false, error: 'Rezervasyonlar oluşturulamadı.', detay: mesaj },
      { status: 500 }
    );
  }
}
