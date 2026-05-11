import { NextRequest, NextResponse } from 'next/server';
import { getPaketler, getPaketById } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id        = searchParams.get('id');
    const uzmanlik  = searchParams.get('uzmanlik') ?? undefined;
    const maxFiyat  = searchParams.get('max_fiyat');

    // Tek paket sorgusu
    if (id) {
      const data = await getPaketById(id);
      return NextResponse.json({ success: true, data });
    }

    // Liste sorgusu — filtreler opsiyonel
    const data = await getPaketler({
      uzmanlik,
      max_fiyat: maxFiyat ? Number(maxFiyat) : undefined,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    const mesaj = error instanceof Error ? error.message : 'Bilinmeyen hata';
    const tekPaket = new URL(req.url).searchParams.has('id');

    return NextResponse.json(
      {
        success: false,
        error: tekPaket ? 'Paket bulunamadı' : 'Paketler yüklenemedi',
        detay: mesaj,
      },
      { status: tekPaket ? 404 : 500 }
    );
  }
}
