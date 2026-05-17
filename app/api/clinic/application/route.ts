import { NextRequest, NextResponse } from 'next/server';
import { createClinicApplication, getClinicApplication } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const kullanici_id = new URL(req.url).searchParams.get('kullanici_id');
    if (!kullanici_id) {
      return NextResponse.json({ success: false, error: 'kullanici_id zorunlu' }, { status: 400 });
    }

    const data = await getClinicApplication(kullanici_id);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    const mesaj = error instanceof Error ? error.message : 'Bilinmeyen hata';
    return NextResponse.json({ success: false, error: 'Başvuru bilgisi alınamadı', detay: mesaj }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      kullanici_id: string;
      klinik_isim: string;
      iletisim_email: string;
      uzmanlik: string[];
      sehir: string;
      aciklama?: string;
    };

    if (!body.kullanici_id || !body.klinik_isim || !body.iletisim_email || !body.uzmanlik?.length || !body.sehir) {
      return NextResponse.json({ success: false, error: 'Zorunlu alanlar eksik' }, { status: 400 });
    }

    const data = await createClinicApplication({
      kullanici_id: body.kullanici_id,
      klinik_isim: body.klinik_isim,
      iletisim_email: body.iletisim_email,
      uzmanlik: body.uzmanlik,
      sehir: body.sehir,
      aciklama: body.aciklama ?? null,
    });

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    const mesaj = error instanceof Error ? error.message : 'Bilinmeyen hata';
    return NextResponse.json({ success: false, error: 'Başvuru oluşturulamadı', detay: mesaj }, { status: 500 });
  }
}
