import { getKlinikler } from '@/lib/supabase';

// Uzmanlik değerlerini health sayfası kategori ID'lerine eşler
const UZMANLIK_KATEGORI: Record<string, string[]> = {
  'estetik tıp ve kozmetoloji': ['estetik', 'sac'],
  'estetik cerrahi':            ['estetik'],
  'diş tedavisi':               ['dis'],
  'oftalmoloji':                ['goz'],
};

// Fiyat aralığından min fiyatı çıkar (ör. "€1.200 – €3.500" → 1200)
function parseMinFiyat(aralik: string): number {
  const match = aralik.replace(/\./g, '').match(/[\d]+/);
  return match ? parseInt(match[0], 10) : 1000;
}

// Puandan yıldıza çevir
function puanToYildiz(puan: number): number {
  if (puan >= 4.8) return 5;
  if (puan >= 4.5) return 4;
  if (puan >= 4.0) return 3;
  return 2;
}

// Güvenilirlik skoru hesapla
function guvenilirlik(puan: number, akredite: boolean): number {
  const base = Math.round(puan * 18);
  return akredite ? Math.min(99, base + 5) : Math.min(92, base);
}

// Uzmanlığa göre örnek doktor oluştur
const DOKTOR_HAVUZU: Record<string, { isim: string; unvan_tr: string; unvan_en: string; deneyim: number; diller: string[] }[]> = {
  estetik: [
    { isim: 'Prof. Dr. Nazım Cerkes',    unvan_tr: 'Plastik Cerrah',          unvan_en: 'Plastic Surgeon',         deneyim: 25, diller: ['TR', 'EN', 'FR'] },
    { isim: 'Dr. Süleyman Taş',          unvan_tr: 'Estetik Cerrahi Uzmanı',  unvan_en: 'Aesthetic Surgery Spec.', deneyim: 12, diller: ['TR', 'EN'] },
  ],
  sac: [
    { isim: 'Dr. Selahattin Tulunay',    unvan_tr: 'Saç Ekimi Uzmanı',       unvan_en: 'Hair Transplant Spec.',   deneyim: 15, diller: ['TR', 'EN', 'AR'] },
    { isim: 'Dr. Emre Yıldız',           unvan_tr: 'Dermatoloji Uzmanı',      unvan_en: 'Dermatologist',           deneyim: 9,  diller: ['TR', 'EN'] },
  ],
  dis: [
    { isim: 'Dr. Murat Atalay',          unvan_tr: 'Diş Hekimi',             unvan_en: 'Dentist',                 deneyim: 14, diller: ['TR', 'EN', 'DE'] },
    { isim: 'Dt. Selin Korkmaz',         unvan_tr: 'Ortodonti Uzmanı',        unvan_en: 'Orthodontist',            deneyim: 8,  diller: ['TR', 'EN'] },
  ],
  goz: [
    { isim: 'Prof. Dr. Cem Mocan',       unvan_tr: 'Göz Uzmanı',             unvan_en: 'Eye Specialist',          deneyim: 20, diller: ['TR', 'EN'] },
    { isim: 'Dr. Ayşe Kara',             unvan_tr: 'Retina Uzmanı',          unvan_en: 'Retina Specialist',       deneyim: 11, diller: ['TR', 'EN', 'AR'] },
  ],
  default: [
    { isim: 'Dr. Mehmet Yılmaz',         unvan_tr: 'Uzman Hekim',            unvan_en: 'Specialist Physician',    deneyim: 10, diller: ['TR', 'EN'] },
  ],
};

function doktorSec(kategoriler: string[]) {
  const kategori = kategoriler[0] ?? 'default';
  return (DOKTOR_HAVUZU[kategori] ?? DOKTOR_HAVUZU.default).slice(0, 2).map(d => ({
    name:       d.isim,
    title_tr:   d.unvan_tr,
    title_en:   d.unvan_en,
    experience: d.deneyim,
    languages:  d.diller,
  }));
}

export async function GET() {
  try {
    const klinikler = await getKlinikler();

    const mapped = klinikler.map((k, idx) => {
      // uzmanlik dizisini kategori ID'lerine çevir
      const kategoriler = Array.from(new Set(
        k.uzmanlik.flatMap(u => UZMANLIK_KATEGORI[u] ?? [])
      ));

      return {
        id:           idx + 1,
        supabase_id:  k.id,
        name:         k.isim,
        city:         k.sehir,
        stars:        puanToYildiz(k.puan),
        specialties:  kategoriler,
        rating:       k.puan,
        reviews:      Math.floor(k.puan * 200 + idx * 37),
        accredited:   k.akredite,
        reliability:  guvenilirlik(k.puan, k.akredite),
        price_from:   parseMinFiyat(k.fiyat_aralik),
        image:        k.fotograf_url || 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800',
        doctors:      doktorSec(kategoriler),
      };
    });

    return Response.json({ success: true, data: mapped });
  } catch {
    return Response.json(
      { success: false, error: 'Klinikler alınamadı, lütfen tekrar deneyin' },
      { status: 500 }
    );
  }
}
