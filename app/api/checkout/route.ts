import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth-guard';
import { createServerSupabase } from '@/lib/supabase-clients';
import { createRezervasyon } from '@/lib/supabase';
import { generatePNR } from '@/lib/pnr';
import { ok, err, fail } from '@/lib/api-response';
import type { CartItem } from '@/lib/cartStore';
import type { ErisilebilirlikBilgisi, RezervasyonItemTipi } from '@/lib/types';

interface CheckoutIstegi {
  items: CartItem[];
  tarih: string;
  islem_id: string;
  erisilebilirlik?: ErisilebilirlikBilgisi | null;
}

export async function POST(req: NextRequest) {
  const guard = await requireAuth();
  if ('error' in guard) return guard.error;

  try {
    const body = (await req.json()) as CheckoutIstegi;

    if (!body.items?.length || !body.tarih || !body.islem_id) {
      return err('items, tarih ve islem_id zorunludur', 400);
    }

    // grup_kodu aynı siparişteki rezervasyon satırlarını birbirine bağlar
    const grup_kodu = generatePNR();
    const sb = await createServerSupabase();

    const rezervasyonlar = await Promise.all(
      body.items.map((item) =>
        createRezervasyon({
          kullanici_id: guard.ctx.userId, // ← daima oturumdan
          paket_id: item.type === 'package' ? item.id : null,
          tarih: body.tarih,
          durum: 'beklemede',
          takip_kodu: generatePNR(),
          item_tipi: item.type as RezervasyonItemTipi,
          item_isim: item.name,
          item_detay: item.detail ?? null,
          item_fiyat: item.lineTotal,
          grup_kodu,
          erisilebilirlik: body.erisilebilirlik ?? null,
        }, sb)
      )
    );

    return ok({ rezervasyonlar, islem_id: body.islem_id }, 201);
  } catch (e) {
    return fail('Rezervasyonlar oluşturulamadı', e);
  }
}
