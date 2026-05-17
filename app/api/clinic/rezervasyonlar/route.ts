import { NextRequest, NextResponse } from 'next/server';
import { getRezervasyonlarByKlinik } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const klinik_id = new URL(req.url).searchParams.get('klinik_id');
    if (!klinik_id) {
      return NextResponse.json({ success: false, error: 'klinik_id zorunlu' }, { status: 400 });
    }

    const data = await getRezervasyonlarByKlinik(klinik_id);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    const mesaj = error instanceof Error ? error.message : 'Bilinmeyen hata';
    return NextResponse.json({ success: false, error: 'Rezervasyonlar alınamadı', detay: mesaj }, { status: 500 });
  }
}
