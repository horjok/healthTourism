import { getPaketler } from './supabase';
import type { CikarimSonucu, Paket } from './types';

// Ağırlıklı puanlama: bütçe uyumu 40 + klinik puanı 40 + JCI 20
function skorla(p: Paket, maxButce: number | null): number {
  let puan = 0;

  // Bütçe uyumu (40 puan)
  if (maxButce !== null) {
    if (p.toplam_fiyat <= maxButce) {
      puan += 40;
    } else {
      // Bütçe aşımı oransal ceza — 2× aşımda 0 puan
      const asimOrani = (p.toplam_fiyat - maxButce) / maxButce;
      puan += Math.max(0, 40 * (1 - asimOrani * 2));
    }
  } else {
    puan += 20; // Bütçe verilmemişse nötr
  }

  // Klinik puanı (40 puan) — Supabase 0-5 skalası → 0-40
  puan += (p.klinik.puan / 5) * 40;

  // JCI Akreditasyonu (20 puan)
  if (p.klinik.akredite) puan += 20;

  return puan;
}

export async function enIyiPaketleriBul(cikarim: CikarimSonucu): Promise<Paket[]> {
  const paketler = await getPaketler({
    uzmanlik: cikarim.uzmanlik,
    ...(cikarim.sehir ? { sehir: cikarim.sehir } : {}),
  });

  if (paketler.length === 0) return [];

  return paketler
    .sort((a, b) => skorla(b, cikarim.maxButce) - skorla(a, cikarim.maxButce))
    .slice(0, 3);
}
