import { NextRequest, NextResponse } from 'next/server';
import { getPaketler, getPaketById } from '@/lib/supabase';

// ISR: 60 sn'de bir Vercel edge cache invalidate edilir, DB yükü düşer
export const revalidate = 60;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id        = searchParams.get('id');
    const uzmanlik  = searchParams.get('uzmanlik') ?? undefined;
    const maxFiyat  = searchParams.get('max_fiyat');
    const klinikId  = searchParams.get('klinik_id') ?? undefined;
    const sehir     = searchParams.get('sehir') ?? undefined;
    const minPuan   = searchParams.get('min_puan');
    const ucusDahil      = searchParams.get('ucus_dahil');
    const otelDahil      = searchParams.get('otel_dahil');
    const transferDahil  = searchParams.get('transfer_dahil');
    const akredite       = searchParams.get('akredite');

    if (id) {
      const data = await getPaketById(id);
      return NextResponse.json({ success: true, data });
    }

    const data = await getPaketler({
      uzmanlik,
      max_fiyat: maxFiyat  ? Number(maxFiyat)  : undefined,
      min_puan:  minPuan   ? Number(minPuan)   : undefined,
      klinik_id: klinikId,
      sehir,
      ucus_dahil:      ucusDahil     === 'true' ? true : ucusDahil     === 'false' ? false : undefined,
      otel_dahil:      otelDahil     === 'true' ? true : otelDahil     === 'false' ? false : undefined,
      transfer_dahil:  transferDahil === 'true' ? true : transferDahil === 'false' ? false : undefined,
      akredite:        akredite      === 'true' ? true : akredite      === 'false' ? false : undefined,
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
