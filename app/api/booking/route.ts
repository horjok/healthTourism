import { NextRequest, NextResponse } from 'next/server';
import { getPaketById, createRezervasyon, getKullaniciRezervasyonlari, cancelRezervasyonById } from '@/lib/supabase';
import { processMockPayment } from '@/lib/mock-payment';
import { generatePNR } from '@/lib/pnr';

interface BookingIstegi {
  paket_id?: string;
  kullanici_id: string;
  tarih: string;
  sepet_ozeti?: Record<string, unknown>[];
  toplam_fiyat?: number;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as BookingIstegi;

    if (!body.kullanici_id || !body.tarih) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı ve tarih bilgileri zorunludur' },
        { status: 400 }
      );
    }

    if (!body.paket_id && !body.sepet_ozeti?.length) {
      return NextResponse.json(
        { success: false, error: 'Paket veya sepet bilgisi zorunludur' },
        { status: 400 }
      );
    }

    const takip_kodu = generatePNR();
    let tutar = body.toplam_fiyat ?? 0;

    if (body.paket_id) {
      let paket;
      try {
        paket = await getPaketById(body.paket_id);
      } catch {
        return NextResponse.json({ success: false, error: 'Paket bulunamadı' }, { status: 404 });
      }
      tutar = paket.toplam_fiyat;
    }

    const rezervasyon = await createRezervasyon({
      kullanici_id: body.kullanici_id,
      paket_id: body.paket_id ?? null,
      tarih: body.tarih,
      durum: 'beklemede',
      takip_kodu,
      sepet_ozeti: body.sepet_ozeti ?? null,
    });

    const odeme = await processMockPayment(tutar);

    return NextResponse.json({ success: true, data: { rezervasyon, odeme } });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Rezervasyon oluşturulamadı' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = (await req.json()) as { id: string; kullanici_id: string };

    if (!body.id || !body.kullanici_id) {
      return NextResponse.json(
        { success: false, error: 'id ve kullanici_id zorunludur' },
        { status: 400 }
      );
    }

    const data = await cancelRezervasyonById(body.id, body.kullanici_id);
    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Rezervasyon iptal edilemedi' },
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
