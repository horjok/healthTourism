// AI motoru (Gemini) ulaşılamadığında devreye giren kural tabanlı yedek katman.
// Agent 1 (cikarimYap) ve Agent 2 (sentezYaz) için drop-in fallback'ler.
// Hızlı, deterministik, dış servise bağımlı değil — pipeline'ın crash-yerine-bozulmuş-mod ile sürmesini sağlar.

import type { CikarimSonucu, Paket } from './types';

// ─── Uzmanlık anahtar kelime haritası ─────────────────────────────────────────
// Hedef: kullanıcı serbest metnini DB'deki kategorilere ipucu seviyesinde eşle.
// Anahtarlar Türkçe/İngilizce karışık, normalize edilmiş halde aranır.
const UZMANLIK_HARITA: ReadonlyArray<readonly [string, readonly string[]]> = [
  ['Saç Ekimi',    ['sac', 'kel', 'dokul', 'hair', 'fue', 'dhi', 'safir', 'greft']],
  ['Diş',          ['dis', 'implant', 'kanal', 'kron', 'beyazlatma', 'dental', 'gulus', 'hollywood', 'veneer', 'lamine']],
  ['Estetik',      ['estetik', 'burun', 'rinoplasti', 'meme', 'liposuction', 'lipo', 'karin germe', 'botoks', 'dolgu', 'bbl', 'mommy', 'facelift', 'jinekomasti']],
  ['Göz',          ['goz', 'lasik', 'smile', 'katarakt', 'lens', 'miyop', 'astigmat', 'glokom', 'retina', 'keratokonus']],
  ['Kardiyoloji',  ['kalp', 'kardiyak', 'bypass', 'stent', 'anjiyo', 'aritmi', 'kapak', 'pacemaker', 'pil']],
  ['Ortopedi',     ['diz', 'kalca', 'omurga', 'protez', 'eklem', 'sakatlik', 'meniskus', 'fitik', 'omuz', 'spor yaralanma']],
  ['Onkoloji',     ['kanser', 'tumor', 'kemoterapi', 'radyoterapi', 'onkoloji', 'metastaz', 'pet-ct', 'immunoterapi']],
  ['Nöroloji',     ['migren', 'epilepsi', 'inme', 'felc', 'parkinson', 'alzheimer', 'demans', 'multipl skleroz', 'anevrizma']],
  ['Üroloji',      ['prostat', 'bobrek', 'mesane', 'idrar', 'uroloji', 'sunnet', 'hipospadias']],
  ['Bariatrik',    ['mide', 'obezite', 'kilo verme', 'tup mide', 'gastric', 'gastrik', 'balon']],
  ['Psikiyatri',   ['depresyon', 'anksiyete', 'panik', 'terapi', 'psikolog', 'psikiyatri', 'travma', 'ptsd', 'otizm', 'dehb', 'bagimlilik']],
  ['IVF',          ['ivf', 'tup bebek', 'kisirlik', 'yumurta', 'icsi', 'embriyo']],
  ['KBB',          ['kbb', 'sinuzit', 'bademcik', 'horlama', 'apne', 'septoplasti', 'koklear', 'isitme']],
  ['Check-up',     ['check-up', 'checkup', 'check up', 'tarama', 'genel kontrol', 'saglik taramasi']],
  ['Fizik Tedavi', ['fizik tedavi', 'rehabilitasyon', 'rehab', 'fizyoterapi', 'fizyoterapist']],
  ['Genel Cerrahi',['hemoroid', 'fissur', 'fistul', 'pilonidal', 'reflu', 'hernia']],
];

// Spesifik uzmanlık eşleşmesi olmasa da metnin sağlık bağlamında olduğunu gösteren ipuçları.
// Bu kelimeler varsa "kapsam dışı" sayma — geniş arama ile devam et.
const SAGLIK_BAGLAM: readonly string[] = [
  'klinik', 'doktor', 'tedavi', 'ameliyat', 'saglik', 'hastane',
  'paket', 'check', 'tarama', 'rehab', 'tibbi', 'tip ',
];

// DB'de yer alan şehirler — yalnız 'sehir' filtresi olarak güvenle kullanılabilir.
const SEHIR_LISTE: readonly string[] = [
  'İstanbul', 'Ankara', 'İzmir', 'Antalya', 'Bursa',
  'Adana', 'Konya', 'Gaziantep', 'Kayseri', 'Eskişehir',
];

// ─── Yardımcılar ──────────────────────────────────────────────────────────────

// Türkçe karakterleri ASCII'ye indirir; case-insensitive eşleştirme için.
function normalize(s: string): string {
  return s
    .toLocaleLowerCase('tr-TR')
    .replace(/[ıİ]/g, 'i')
    .replace(/[şŞ]/g, 's')
    .replace(/[çÇ]/g, 'c')
    .replace(/[ğĞ]/g, 'g')
    .replace(/[üÜ]/g, 'u')
    .replace(/[öÖ]/g, 'o');
}

function uzmanlikCikar(metin: string): string | null {
  const norm = normalize(metin);
  for (const [hedef, anahtarlar] of UZMANLIK_HARITA) {
    if (anahtarlar.some((a) => norm.includes(a))) return hedef;
  }
  return null;
}

function saglikBaglaminda(metin: string): boolean {
  const norm = normalize(metin);
  return SAGLIK_BAGLAM.some((k) => norm.includes(k));
}

function sehirCikar(metin: string): string | null {
  const norm = normalize(metin);
  for (const sehir of SEHIR_LISTE) {
    if (norm.includes(normalize(sehir))) return sehir;
  }
  return null;
}

// "5000 euro", "10.000 TL", "3000$", "2500€", "5 bin €" formatlarını yakalar.
// Kullanıcı butçe parametresi geldiyse onu öncelikle alır.
function butceCikar(metin: string, kullaniciButcesi?: number): number | null {
  if (typeof kullaniciButcesi === 'number' && kullaniciButcesi > 0) {
    return kullaniciButcesi;
  }

  const desen = /(\d{1,3}(?:[.,]\d{3})*|\d+)\s*(bin|k|euro|eur|€|tl|₺|usd|\$|gbp|£)/i;
  const m = metin.match(desen);
  if (!m) return null;

  const rakam = m[1].replace(/[.,]/g, '');
  let n = parseInt(rakam, 10);
  if (Number.isNaN(n)) return null;

  // "5 bin" veya "5k" → 5000
  if (/^(bin|k)$/i.test(m[2]) && n < 1000) n *= 1000;
  return n > 0 ? n : null;
}

// ─── Agent 1 yedeği ───────────────────────────────────────────────────────────

// Gemini cikarimYap çağrısı patladığında çağrılır. Çıktısı CikarimSonucu —
// üst akış (enIyiPaketleriBul + sentezYaz) hiçbir değişiklik olmadan tüketebilir.
export function cikarimYapFallback(mesaj: string, butce?: number): CikarimSonucu {
  const uzmanlik = uzmanlikCikar(mesaj);

  // Ne spesifik uzmanlık ne genel sağlık bağlamı → kapsam dışı kabul
  if (!uzmanlik && !saglikBaglaminda(mesaj)) {
    return { uzmanlik: '', maxButce: null, sehir: null, kapsamDisi: true };
  }

  // Sağlık bağlamı var ama spesifik kategori yakalanamadıysa Check-up'a düş
  // (enIyiPaketleriBul kaskadı Strateji 3-4 üzerinden zaten geniş eşleşme yapar).
  return {
    uzmanlik: uzmanlik ?? 'Check-up',
    maxButce: butceCikar(mesaj, butce),
    sehir: sehirCikar(mesaj),
  };
}

// ─── Agent 2 yedeği ───────────────────────────────────────────────────────────

// Gemini sentezYaz çağrısı patladığında çağrılır. Şablon tabanlı Türkçe özet üretir.
// Üst akış string bekler — drop-in uyumlu.
export function sentezYazFallback(_mesaj: string, paketler: Paket[]): string {
  if (paketler.length === 0) {
    return 'Tarif ettiğiniz kriterlere uyan paket bulamadık. Bütçe aralığını genişletmeyi ya da farklı bir şehir denemeyi öneririz.';
  }

  const ilk = paketler[0];
  const klinikAdi = ilk.klinik.isim;
  const sehir = ilk.klinik.sehir;
  const puan = ilk.klinik.puan.toFixed(1);
  const jci = ilk.klinik.akredite ? 'JCI akredite ' : '';
  const cogul = paketler.length > 1 ? `${paketler.length} paket` : 'bir paket';

  const eklentiler: string[] = [];
  if (ilk.ucus_dahil) eklentiler.push('uçuş dahil');
  if (ilk.otel_dahil) eklentiler.push('otel dahil');
  if (ilk.transfer_dahil) eklentiler.push('transfer dahil');
  const eklentiMetin = eklentiler.length > 0 ? `, ${eklentiler.join(', ')}` : '';

  return (
    `İhtiyacınıza uygun ${cogul} hazırladık. ` +
    `Öne çıkan seçenek ${sehir}'da ${jci}${klinikAdi} ile "${ilk.baslik}" — ` +
    `${ilk.sure_gun} gün, ${ilk.toplam_fiyat}€${eklentiMetin}. ` +
    `Klinik hasta memnuniyeti ${puan}/5. ` +
    `Bu öneri, yapay zeka motoru geçici olarak ulaşılamadığı için kural tabanlı sistemle hazırlandı; ` +
    `kesinleştirmeden önce klinik ile detayları görüşmenizi öneririz.`
  );
}

// ─── Kullanıcıya gösterilen mod sinyali ───────────────────────────────────────

// PipelineSonucu.uyarilar dizisine eklenir; UI bunu sarı bir bant olarak gösterebilir.
export const FALLBACK_UYARISI =
  'Yapay zeka motoru geçici olarak ulaşılamıyor — öneriler kural tabanlı algoritma ile üretildi.';
