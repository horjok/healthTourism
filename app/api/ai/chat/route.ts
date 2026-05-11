import { NextRequest, NextResponse } from 'next/server';
import { getKlinikler } from '@/lib/supabase';
import { ajanPipelineCalıstır } from '@/lib/gemini';
import type { ChatIstegi } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ChatIstegi;

    if (!body.mesaj?.trim() || !body.butce || !body.tarih) {
      return NextResponse.json(
        { success: false, error: 'Mesaj, bütçe ve tarih zorunludur' },
        { status: 400 }
      );
    }

    const klinikler = await getKlinikler();

    // Klinik puanlarını pipeline'a context olarak gönder: { "Klinik Adı": "4.8" }
    const klinikPuanlari: Record<string, string> = Object.fromEntries(
      klinikler.map((k) => [k.isim, String(k.puan)])
    );

    const data = await ajanPipelineCalıstır(
      body.mesaj,
      klinikler,
      body.butce,
      body.tarih
    );

    return NextResponse.json({ success: true, data: { ...data, klinikPuanlari } });
  } catch (error) {
    console.error('AI Chat Hatası:', error);

    const detay = error instanceof Error ? error.message : String(error);
    const gelistirme = process.env.NODE_ENV === 'development';

    return NextResponse.json(
      {
        success: false,
        error: 'Analiz yapılamıyor',
        ...(gelistirme && { detay }),
      },
      { status: 500 }
    );
  }
}
