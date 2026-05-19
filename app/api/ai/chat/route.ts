import { NextRequest, NextResponse } from 'next/server';
import { cikarimYap, sentezYaz } from '@/lib/gemini';
import { cikarimYapFallback, sentezYazFallback, FALLBACK_UYARISI } from '@/lib/fallback';
import { enIyiPaketleriBul } from '@/lib/recommend';
import { createServerSupabase, createAdminClient } from '@/lib/supabase-clients';
import type { ChatIstegi, CikarimSonucu, PipelineSonucu, KullaniciRolu } from '@/lib/types';

// Tüm pipeline için üst sınır — bireysel agent timeout (15s × 2) + işlem tamponu
const PIPELINE_TIMEOUT_MS = 35_000;

// Rol bazlı saatlik istek limitleri
const LIMITLER: Record<string, number> = {
  super_admin:    Infinity,
  user:           24,
  clinic_manager: 24,
  ip:             12, // kimlik doğrulanmamış
};

interface KimlikBilgisi {
  identifier: string;
  rol: KullaniciRolu | 'ip';
}

async function kimlikBelirle(req: NextRequest): Promise<KimlikBilgisi> {
  try {
    const sb = await createServerSupabase();
    const { data: { user } } = await sb.auth.getUser();
    if (user) {
      const { data: row } = await createAdminClient()
        .from('user_roles')
        .select('rol')
        .eq('kullanici_id', user.id)
        .maybeSingle();
      const rol = (row?.rol ?? 'user') as KullaniciRolu;
      return { identifier: user.id, rol };
    }
  } catch { /* oturum yoksa IP'ye düş */ }

  // x-forwarded-for zincirinin ilk adresi gerçek istemci IP'sidir
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
  return { identifier: ip, rol: 'ip' };
}

async function hizSiniriKontrol(identifier: string, limit: number): Promise<boolean> {
  if (limit === Infinity) return true;

  const admin = createAdminClient();
  const { count } = await admin
    .from('ai_usage_logs')
    .select('id', { count: 'exact', head: true })
    .eq('identifier', identifier)
    .gte('created_at', new Date(Date.now() - 3_600_000).toISOString());

  return (count ?? 0) < limit;
}

function kullaniciyaLogEkle(identifier: string): void {
  // Fire-and-forget — pipeline'ı bloke etmez
  void Promise.resolve(
    createAdminClient().from('ai_usage_logs').insert({ identifier })
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ChatIstegi;

    if (!body.mesaj?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Mesaj boş olamaz' },
        { status: 400 }
      );
    }

    // ─── Hız Sınırı Kontrolü ─────────────────────────────────────────────────
    const { identifier, rol } = await kimlikBelirle(req);
    const limit = LIMITLER[rol] ?? LIMITLER.ip;

    const izinli = await hizSiniriKontrol(identifier, limit);
    if (!izinli) {
      return NextResponse.json(
        { success: false, error: 'Saatlik yapay zeka kullanım limitinize ulaştınız. Lütfen bir saat sonra tekrar deneyin.' },
        { status: 429 }
      );
    }

    // İzin verildi — log asenkron kaydedilir, pipeline beklenmez
    kullaniciyaLogEkle(identifier);

    // ─── Pipeline ─────────────────────────────────────────────────────────────
    const controller = new AbortController();
    const pipelineTimeout = setTimeout(() => controller.abort(), PIPELINE_TIMEOUT_MS);

    if (controller.signal.aborted) {
      return NextResponse.json(
        { success: false, error: 'Analiz zaman aşımına uğradı, lütfen tekrar deneyin' },
        { status: 504 }
      );
    }

    // Agent 1: Kullanıcı metninden uzmanlik + bütçe + şehir çıkar.
    // Gemini patlarsa kural tabanlı yedeğe düş — pipeline kesilmez, yalnız bozulmuş modda devam eder.
    let cikarim: CikarimSonucu;
    let bozulmusMod = false;
    try {
      cikarim = await cikarimYap(body.mesaj, body.butce);
    } catch (e) {
      console.warn('Gemini cikarimYap başarısız, kural tabanlı yedeğe geçiliyor:', e instanceof Error ? e.message : e);
      cikarim = cikarimYapFallback(body.mesaj, body.butce);
      bozulmusMod = true;
    }

    // Kapsam dışı sorgu — pipeline'ı kısa devre yap
    if (cikarim.kapsamDisi) {
      clearTimeout(pipelineTimeout);
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

    // Agent 2: Gerçek paketleri sıcak Türkçeyle sun (0 paket → özür).
    // Gemini patlarsa şablon tabanlı yedek devreye girer — özet eksik kalmaz.
    let ozetMetin: string;
    try {
      ozetMetin = await sentezYaz(body.mesaj, paketler);
    } catch (e) {
      console.warn('Gemini sentezYaz başarısız, kural tabanlı yedeğe geçiliyor:', e instanceof Error ? e.message : e);
      ozetMetin = sentezYazFallback(body.mesaj, paketler);
      bozulmusMod = true;
    }

    const ilkPaket = paketler[0];

    const data: PipelineSonucu = {
      uzmanlik_alani: cikarim.uzmanlik,
      oneri_ozeti: ozetMetin,
      guvenilirlik_skoru: ilkPaket
        ? Math.round((ilkPaket.klinik.puan / 5) * 80 + (ilkPaket.klinik.akredite ? 20 : 0))
        : 0,
      uyarilar: [
        ...(bozulmusMod ? [FALLBACK_UYARISI] : []),
        ...(paketler.length === 0
          ? ['Kriterlere uyan paket bulunamadı. Bütçenizi yükseltmeyi veya şehir filtresini kaldırmayı deneyin.']
          : []),
      ],
      onerilen_paketler: paketler.map(p => ({
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
