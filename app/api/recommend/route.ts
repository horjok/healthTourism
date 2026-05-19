// Gemini'den bağımsız, %100 deterministik öneri ucu.
// AI pipeline (/api/ai/chat) düşerse veya istemci hızlı bir tarama isterse devreye girer.
// Akış: ChatIstegi → cikarimYapFallback (kural tabanlı) → enIyiPaketleriBul (ağırlıklı skor) → sentezYazFallback (şablon Türkçe).
// Aynı PipelineSonucu zarfını üretir — chat route ile birebir uyumlu istemci tarafı.

import { NextRequest } from 'next/server';
import { cikarimYapFallback, sentezYazFallback, FALLBACK_UYARISI } from '@/lib/fallback';
import { enIyiPaketleriBul } from '@/lib/recommend';
import { ok, err, fail } from '@/lib/api-response';
import type { ChatIstegi, PipelineSonucu } from '@/lib/types';

// Deterministik akış olduğu için kısa tutuyoruz — yalnız DB sorgu süresini örter.
const RECOMMEND_TIMEOUT_MS = 8_000;

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ChatIstegi;

    if (!body.mesaj?.trim()) {
      return err('Mesaj boş olamaz', 400);
    }

    // AbortController ile DB sorgusunun asılı kalmamasını garantiliyoruz.
    const controller = new AbortController();
    const zamanasimi = setTimeout(() => controller.abort(), RECOMMEND_TIMEOUT_MS);

    try {
      const cikarim = cikarimYapFallback(body.mesaj, body.butce);

      // Kapsam dışı sorgu — pipeline'ı kısa devre yap, chat route ile aynı şekil.
      if (cikarim.kapsamDisi) {
        const data: PipelineSonucu = {
          uzmanlik_alani: 'kapsam_disi',
          oneri_ozeti: 'Sadece sağlık turizmi, klinik paketleri ve seyahat planlaması hakkında yardımcı olabilirim.',
          guvenilirlik_skoru: 0,
          uyarilar: [FALLBACK_UYARISI],
          onerilen_paketler: [],
          ham_analiz: { agent1: 'kapsam_disi', agent2: '', agent3: 'kural_tabanli' },
        };
        return ok(data);
      }

      const paketler = await enIyiPaketleriBul(cikarim);

      if (controller.signal.aborted) {
        return err('Öneri sorgusu zaman aşımına uğradı, lütfen tekrar deneyin', 504);
      }

      const ozetMetin = sentezYazFallback(body.mesaj, paketler);
      const ilkPaket = paketler[0];

      const uyarilar: string[] = [FALLBACK_UYARISI];
      if (paketler.length === 0) {
        uyarilar.push('Kriterlere uyan paket bulunamadı. Bütçenizi yükseltmeyi veya şehir filtresini kaldırmayı deneyin.');
      }

      const data: PipelineSonucu = {
        uzmanlik_alani: cikarim.uzmanlik,
        oneri_ozeti: ozetMetin,
        guvenilirlik_skoru: ilkPaket
          ? Math.round((ilkPaket.klinik.puan / 5) * 80 + (ilkPaket.klinik.akredite ? 20 : 0))
          : 0,
        uyarilar,
        onerilen_paketler: paketler.map((p) => ({
          paket_id: p.id,
          baslik: p.baslik,
          klinik_isim: p.klinik.isim,
          sehir: p.klinik.sehir,
          tahmini_fiyat: `${p.toplam_fiyat} €`,
          sure_gun: p.sure_gun,
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
          agent3: 'kural_tabanli_sentez',
        },
      };

      return ok(data);
    } finally {
      clearTimeout(zamanasimi);
    }
  } catch (error) {
    const isTimeout = error instanceof Error && error.name === 'AbortError';
    return fail(
      isTimeout ? 'Öneri sorgusu zaman aşımına uğradı, lütfen tekrar deneyin' : 'Öneri üretilemedi, lütfen tekrar deneyin',
      error,
      isTimeout ? 504 : 500,
    );
  }
}
