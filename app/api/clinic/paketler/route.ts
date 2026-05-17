import { NextRequest, NextResponse } from 'next/server';
import { createPaket, getPaketlerByKlinik } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const klinik_id = new URL(req.url).searchParams.get('klinik_id');
    if (!klinik_id) {
      return NextResponse.json({ success: false, error: 'klinik_id zorunlu' }, { status: 400 });
    }

    const data = await getPaketlerByKlinik(klinik_id);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    const mesaj = error instanceof Error ? error.message : 'Bilinmeyen hata';
    return NextResponse.json({ success: false, error: 'Paketler alınamadı', detay: mesaj }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.klinik_id || !body.baslik || !body.toplam_fiyat || !body.sure_gun) {
      return NextResponse.json({ success: false, error: 'Zorunlu alanlar eksik' }, { status: 400 });
    }

    const data = await createPaket({
      klinik_id: body.klinik_id,
      baslik: body.baslik,
      otel_isim: body.otel_isim ?? '',
      otel_dahil: body.otel_dahil ?? false,
      ucus_dahil: body.ucus_dahil ?? false,
      toplam_fiyat: Number(body.toplam_fiyat),
      sure_gun: Number(body.sure_gun),
      aciklama: body.aciklama ?? '',
    });

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    const mesaj = error instanceof Error ? error.message : 'Bilinmeyen hata';
    return NextResponse.json({ success: false, error: 'Paket oluşturulamadı', detay: mesaj }, { status: 500 });
  }
}
