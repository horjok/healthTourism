import { NextRequest, NextResponse } from 'next/server';
import { getPaketById, createRezervasyon, getKullaniciRezervasyonlari } from '@/lib/supabase';
import { processMockPayment } from '@/lib/mock-payment';

interface BookingIstegi {
  paket_id: string;
  kullanici_id: string;
  tarih: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as BookingIstegi;

    if (!body.paket_id || !body.kullanici_id || !body.tarih) {
      return NextResponse.json(
        { success: false, error: 'Paket, kullanıcı ve tarih bilgileri zorunludur' },
        { status: 400 }
      );
    }

    // Paketi doğrula — bulunamazsa supabase.ts hata fırlatır
    let paket;
    try {
      paket = await getPaketById(body.paket_id);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Paket bulunamadı' },
        { status: 404 }
      );
    }

    // Önce rezervasyon oluştur, sonra ödemeyi işle
    const rezervasyon = await createRezervasyon({
      kullanici_id: body.kullanici_id,
      paket_id: body.paket_id,
      tarih: body.tarih,
      durum: 'beklemede',
    });

    const odeme = await processMockPayment(paket.toplam_fiyat);

    return NextResponse.json({ success: true, data: { rezervasyon, odeme } });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Rezervasyon oluşturulamadı' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const kullanici_id = searchParams.get('kullanici_id');

    if (!kullanici_id) {
      return NextResponse.json(
        { success: false, error: 'kullanici_id parametresi zorunludur' },
        { status: 400 }
      );
    }

    const data = await getKullaniciRezervasyonlari(kullanici_id);
    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Rezervasyonlar getirilemedi' },
      { status: 500 }
    );
  }
}
