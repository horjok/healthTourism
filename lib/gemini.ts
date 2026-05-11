import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Klinik, PipelineSonucu, PaketOnerisi } from './types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const geminiModel = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

// ─── Yardımcı fonksiyonlar ────────────────────────────────────────────────────

// Gemini bazen JSON'u ```json ``` bloğuna sarar — temizle
function jsonTemizle(metin: string): string {
  return metin.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
}

// Her agent için 15 saniyelik timeout
function withTimeout<T>(promise: Promise<T>, hatamesaji: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(hatamesaji)), 15_000)
    ),
  ]);
}

// ─── Agent 1: Sağlık Analizi ─────────────────────────────────────────────────

interface SaglikAnalizi {
  uzmanlik: string;
  aciklama: string;
  oncelik: 'dusuk' | 'orta' | 'yuksek';
}

async function saglikAnalizEt(mesaj: string): Promise<SaglikAnalizi> {
  const prompt = `Sen bir sağlık turizmi danışmanısın. Kullanıcının şikayetini analiz et ve hangi tıbbi uzmanlık alanına ihtiyaç duyduğunu belirle.

Kullanıcı şikayeti: "${mesaj}"

Yanıtını SADECE şu JSON formatında ver, başka hiçbir şey yazma:
{
  "uzmanlik": "diş | göz | ortopedi | kardiyoloji | estetik cerrahi",
  "aciklama": "kısa Türkçe açıklama (max 2 cümle)",
  "oncelik": "dusuk | orta | yuksek"
}`;

  const result = await withTimeout(
    geminiModel.generateContent(prompt),
    'Sağlık analizi zaman aşımına uğradı, lütfen tekrar deneyin'
  );

  const ham = result.response.text();

  try {
    return JSON.parse(jsonTemizle(ham)) as SaglikAnalizi;
  } catch {
    // JSON parse başarısız olursa fallback
    return { uzmanlik: 'genel', aciklama: ham.slice(0, 200), oncelik: 'orta' };
  }
}

// ─── Agent 2: Paket Planlama ──────────────────────────────────────────────────

interface PaketPlani {
  onerilen_paketler: PaketOnerisi[];
  gerekce: string;
}

async function paketPlanla(
  uzmanlik: string,
  mesaj: string,
  klinikler: Klinik[],
  butce?: number,
  tarih?: string
): Promise<PaketPlani> {
  const prompt = `Sen bir sağlık turizmi paket planlayıcısısın. Aşağıdaki bilgilere göre en uygun 2-3 paketi öner.

Gerekli uzmanlık: "${uzmanlik}"
Kullanıcı şikayeti: "${mesaj}"
Bütçe: ${butce ? butce + '€' : 'Belirtilmemiş'}
Tarih: ${tarih || 'Esnek'}

Mevcut klinikler (JSON):
${JSON.stringify(
  klinikler.map((k) => ({
    isim: k.isim,
    sehir: k.sehir,
    uzmanlik: k.uzmanlik,
    puan: k.puan,
    akredite: k.akredite,
    fiyat_aralik: k.fiyat_aralik,
  })),
  null,
  2
)}

Yanıtını SADECE şu JSON formatında ver, başka hiçbir şey yazma:
{
  "onerilen_paketler": [
    {
      "klinik_isim": "klinik adı",
      "tahmini_fiyat": "fiyat aralığı €",
      "avantajlar": ["avantaj 1", "avantaj 2", "avantaj 3"]
    }
  ],
  "gerekce": "neden bu klinikleri önerdiğini 2-3 cümle ile açıkla"
}`;

  const result = await withTimeout(
    geminiModel.generateContent(prompt),
    'Paket planlaması zaman aşımına uğradı, lütfen tekrar deneyin'
  );

  const ham = result.response.text();

  try {
    return JSON.parse(jsonTemizle(ham)) as PaketPlani;
  } catch {
    return {
      onerilen_paketler: [{ klinik_isim: 'Belirsiz', tahmini_fiyat: '-', avantajlar: [] }],
      gerekce: ham.slice(0, 300),
    };
  }
}

// ─── Agent 3: Güvenilirlik Kontrolü ──────────────────────────────────────────

interface GuvenilirlikRaporu {
  guvenilirlik_skoru: number;
  uyarilar: string[];
  onay: boolean;
  ozet: string;
}

async function guvenilirlikKontrol(
  onerilen: PaketOnerisi[],
  klinikler: Klinik[]
): Promise<GuvenilirlikRaporu> {
  const ilgiliKlinikler = klinikler.filter((k) =>
    onerilen.some((o) => o.klinik_isim === k.isim)
  );

  const prompt = `Sen bir sağlık turizmi güvenilirlik uzmanısın. Önerilen klinikleri değerlendir ve 0-100 arası güvenilirlik skoru ver.

Önerilen klinikler:
${JSON.stringify(
  ilgiliKlinikler.map((k) => ({
    isim: k.isim,
    puan: k.puan,
    akredite: k.akredite,
    sehir: k.sehir,
  })),
  null,
  2
)}

Değerlendirme kriterleri:
- Akreditasyon durumu (akredite = +20 puan)
- Klinik puanı (5 üzerinden)
- Şehir erişilebilirliği

Yanıtını SADECE şu JSON formatında ver, başka hiçbir şey yazma:
{
  "guvenilirlik_skoru": 0-100 arası tam sayı,
  "uyarilar": ["uyarı varsa buraya yaz", "akredite değilse mutlaka belirt"],
  "onay": true veya false,
  "ozet": "kısa Türkçe değerlendirme (1-2 cümle)"
}`;

  const result = await withTimeout(
    geminiModel.generateContent(prompt),
    'Güvenilirlik kontrolü zaman aşımına uğradı, lütfen tekrar deneyin'
  );

  const ham = result.response.text();

  try {
    return JSON.parse(jsonTemizle(ham)) as GuvenilirlikRaporu;
  } catch {
    return {
      guvenilirlik_skoru: 70,
      uyarilar: [],
      onay: true,
      ozet: ham.slice(0, 200),
    };
  }
}

// ─── Ana Pipeline ─────────────────────────────────────────────────────────────

export async function ajanPipelineCalıstır(
  mesaj: string,
  klinikler: Klinik[],
  butce?: number,
  tarih?: string
): Promise<PipelineSonucu> {
  // Agent 1 → Agent 2 → Agent 3 — sıralı, paralel değil
  const analiz = await saglikAnalizEt(mesaj);
  const plan = await paketPlanla(analiz.uzmanlik, mesaj, klinikler, butce, tarih);
  const rapor = await guvenilirlikKontrol(plan.onerilen_paketler, klinikler);

  return {
    uzmanlik_alani: analiz.uzmanlik,
    oneri_ozeti: rapor.ozet,
    guvenilirlik_skoru: rapor.guvenilirlik_skoru,
    uyarilar: rapor.uyarilar,
    onerilen_paketler: plan.onerilen_paketler,
    ham_analiz: {
      agent1: analiz.aciklama,
      agent2: plan.gerekce,
      agent3: rapor.ozet,
    },
  };
}

// ─── Bağlantı Testi ───────────────────────────────────────────────────────────

export async function testBaglanti(): Promise<string> {
  const result = await geminiModel.generateContent(
    'Merhaba, sağlık turizmi hakkında bir cümle yaz.'
  );
  return result.response.text();
}

// tsx lib/gemini.ts ile doğrudan çalıştırıldığında bağlantıyı test et
if (require.main === module) {
  testBaglanti()
    .then((cevap) => console.log('Gemini yanıtı:', cevap))
    .catch((hata) => console.error('Bağlantı hatası:', hata));
}
