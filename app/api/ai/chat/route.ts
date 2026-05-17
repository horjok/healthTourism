import { NextRequest, NextResponse } from 'next/server';
import { cikarimYap, sentezYaz } from '@/lib/gemini';
import { enIyiPaketleriBul } from '@/lib/recommend';
import type { ChatIstegi, PipelineSonucu } from '@/lib/types';

// Tüm pipeline için üst sınır — bireysel agent timeout (15s × 2) + işlem tamponu
const PIPELINE_TIMEOUT_MS = 35_000;

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ChatIstegi;

    if (!body.mesaj?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Mesaj boş olamaz' },
        { status: 400 }
      );
    }

    // Tüm pipeline için AbortController — Vercel 504 yerine kendi 504'ümüzü göndeririz
    const controller = new AbortController();
    const pipelineTimeout = setTimeout(() => controller.abort(), PIPELINE_TIMEOUT_MS);

    if (controller.signal.aborted) {
      return NextResponse.json(
        { success: false, error: 'Analiz zaman aşımına uğradı, lütfen tekrar deneyin' },
        { status: 504 }
      );
    }

    // Agent 1: Kullanıcı metninden uzmanlik + bütçe + şehir çıkar
    const cikarim = await cikarimYap(body.mesaj, body.butce);

    // Kapsam dışı sorgu — pipeline'ı kısa devre yap
    if (cikarim.kapsamDisi) {
      return NextResponse.json({
        success: true,
        data: {
          uzmanlik_alani: 'kapsam_disi',
          oneri_ozeti: 'Sadece sağlık turizmi, klinik paketleri ve seyahat planlaması hakkında yardımcı olabilirim.',
          guvenilirlik_skoru: 0,
          uyarilar: [],
          onerilen_paketler: [],
          ham_analiz: { agent1: 'kapsam_disi', agent2: '', agent3: '' },
        } satisfies PipelineSonucu,
      });
    }

    // Deterministik Algoritma: ağırlıklı skor ile top-3 paket
    const paketler = await enIyiPaketleriBul(cikarim);

    // Agent 2: Gerçek paketleri sıcak Türkçeyle sun (0 paket → özür)
    const ozetMetin = await sentezYaz(body.mesaj, paketler);

    const ilkPaket = paketler[0];

    // ChatEkrani PipelineSonucu şeklini bekliyor — geriye dönük uyumluluk korunuyor
    const data: PipelineSonucu = {
      uzmanlik_alani: cikarim.uzmanlik,
      oneri_ozeti: ozetMetin,
      guvenilirlik_skoru: ilkPaket
        ? Math.round((ilkPaket.klinik.puan / 5) * 80 + (ilkPaket.klinik.akredite ? 20 : 0))
        : 0,
      uyarilar: paketler.length === 0
        ? ['Kriterlere uyan paket bulunamadı. Bütçenizi yükseltmeyi veya şehir filtresini kaldırmayı deneyin.']
        : [],
      onerilen_paketler: paketler.map(p => ({
        klinik_isim: p.klinik.isim,
        tahmini_fiyat: `${p.toplam_fiyat} €`,
        avantajlar: [
          p.klinik.akredite ? 'JCI Akredite' : 'Deneyimli Ekip',
          `${p.klinik.puan}/5.0 hasta memnuniyeti`,
          p.otel_dahil ? 'Otel dahil' : '',
          p.ucus_dahil ? 'Uçuş dahil' : '',
        ].filter(Boolean),
      })),
      ham_analiz: {
        agent1: JSON.stringify(cikarim),
        agent2: `${paketler.length} paket bulundu`,
        agent3: ozetMetin.slice(0, 200),
      },
    };

    clearTimeout(pipelineTimeout);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    const isTimeout =
      error instanceof Error &&
      (error.name === 'AbortError' || error.message.includes('zaman aşımına'));

    const detay = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        success: false,
        error: isTimeout
          ? 'Analiz zaman aşımına uğradı, lütfen tekrar deneyin'
          : 'Analiz yapılamıyor, lütfen tekrar deneyin',
        ...(process.env.NODE_ENV === 'development' && { detay }),
      },
      { status: isTimeout ? 504 : 500 }
    );
  }
}
