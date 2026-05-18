import { getPaketler } from './supabase';
import type { CikarimSonucu, Paket } from './types';

// Ağırlıklı puanlama: bütçe uyumu 35 + klinik puanı 35 + JCI 20 + şehir eşleşmesi 10
function skorla(p: Paket, maxButce: number | null, terciSehir: string | null = null): number {
  let puan = 0;

  // Bütçe uyumu (35 puan)
  if (maxButce !== null) {
    if (p.toplam_fiyat <= maxButce) {
      puan += 35;
    } else {
      const asimOrani = (p.toplam_fiyat - maxButce) / maxButce;
      puan += Math.max(0, 35 * (1 - asimOrani * 2));
    }
  } else {
    puan += 17;
  }

  // Klinik puanı (35 puan) — 0-5 skalası → 0-35
  puan += (p.klinik.puan / 5) * 35;

  // JCI Akreditasyonu (20 puan)
  if (p.klinik.akredite) puan += 20;

  // Şehir tercihi bonus (10 puan) — kısıtlayıcı filtre değil, önceliklendirme
  if (terciSehir && p.klinik.sehir.toLowerCase() === terciSehir.toLowerCase()) puan += 10;

  return puan;
}

// Dört kaskad stratejiyle arama; her aşamada yeni eşsiz paketler eklenir
async function cokluStratejiAra(cikarim: CikarimSonucu): Promise<Map<string, Paket>> {
  const toplanan = new Map<string, Paket>();
  const ekle = (liste: Paket[]) => liste.forEach(p => toplanan.set(p.id, p));

  // Strateji 1: Klinik uzmanlığı + şehir (en kısıtlayıcı, en alakalı)
  ekle(await getPaketler({
    uzmanlik: cikarim.uzmanlik,
    ...(cikarim.sehir ? { sehir: cikarim.sehir } : {}),
  }));

  // Strateji 2: Şehir kısıtı gevşet — uzmanlık klinik bazında eşleşiyorsa tüm şehirler
  if (toplanan.size < 3 && cikarim.sehir) {
    ekle(await getPaketler({ uzmanlik: cikarim.uzmanlik }));
  }

  // Strateji 3: Paketin kendi uzmanlık alanı üzerinden ara (klinik filtresi atlanır)
  if (toplanan.size < 3) {
    ekle(await getPaketler({
      paket_uzmanlik: cikarim.uzmanlik,
      ...(cikarim.sehir ? { sehir: cikarim.sehir } : {}),
    }));
    // şehirsiz de dene
    if (toplanan.size < 3 && cikarim.sehir) {
      ekle(await getPaketler({ paket_uzmanlik: cikarim.uzmanlik }));
    }
  }

  // Strateji 4: Paket başlığında uzmanlık kelimesi geç (ILIKE) — en geniş kapsam
  if (toplanan.size < 3) {
    ekle(await getPaketler({ baslik_arama: cikarim.uzmanlik }));
  }

  return toplanan;
}

export async function enIyiPaketleriBul(cikarim: CikarimSonucu): Promise<Paket[]> {
  const sonucMap = await cokluStratejiAra(cikarim);
  const paketler = Array.from(sonucMap.values());

  if (paketler.length === 0) return [];

  return paketler
    .sort((a, b) => skorla(b, cikarim.maxButce, cikarim.sehir) - skorla(a, cikarim.maxButce, cikarim.sehir))
    .slice(0, 3);
}
