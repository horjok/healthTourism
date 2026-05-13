import { NextRequest, NextResponse } from 'next/server';
import { getPaketler } from '@/lib/supabase';
import type { Paket } from '@/lib/types';

// ─── İstek gövdesi ────────────────────────────────────────────────────────────

interface OneriIstegi {
  uzmanlik: string;
  butce: number;
  sehir_tercihi: string | null;
  akredite_tercih: boolean;
}

// ─── Puanlama algoritması ─────────────────────────────────────────────────────

function paketiPuanla(paket: Paket, istek: OneriIstegi): number {
  let puan = 0;

  // ── 1. Uzmanlık eşleşmesi (40 puan) ────────────────────────────────────────
  const klinikUzmanliklar = paket.klinik.uzmanlik.map((u) => u.toLocaleLowerCase('tr-TR'));
  const arananUzmanlik    = istek.uzmanlik.toLocaleLowerCase('tr-TR');

  if (klinikUzmanliklar.includes(arananUzmanlik)) {
    // Tam eşleşme
    puan += 40;
  } else if (klinikUzmanliklar.some((u) => u.includes(arananUzmanlik) || arananUzmanlik.includes(u))) {
    // Kısmi eşleşme (birisi diğerini içeriyorsa)
    puan += 20;
  }
  // Eşleşme yok: 0p

  // ── 2. Bütçe uygunluğu (30 puan) ───────────────────────────────────────────
  const fiyat = paket.toplam_fiyat;

  if (fiyat <= istek.butce) {
    // Bütçe içinde
    puan += 30;
  } else if (fiyat <= istek.butce * 1.20) {
    // %20'ye kadar üstünde
    puan += 15;
  }
  // %20'den fazla üstünde: 0p

  // ── 3. Klinik puanı (20 puan) ──────────────────────────────────────────────
  const klinikPuan = paket.klinik.puan;

  if (klinikPuan > 4.5) {
    puan += 20;
  } else if (klinikPuan >= 4.0) {
    puan += 15;
  } else if (klinikPuan >= 3.5) {
    puan += 10;
  }
  // 3.5 altı: 0p

  // ── 4. Akreditasyon (10 puan) ───────────────────────────────────────────────
  if (paket.klinik.akredite && istek.akredite_tercih) {
    // Akredite ve tercih ediliyor
    puan += 10;
  } else if (paket.klinik.akredite) {
    // Akredite ama tercih edilmiyor
    puan += 5;
  }

  return puan;
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    // Gövdeyi parse et
    const body = (await req.json()) as Partial<OneriIstegi>;

    // Zorunlu alan kontrolü
    if (!body.uzmanlik || body.butce === undefined || body.butce === null) {
      return NextResponse.json(
        { success: false, error: 'uzmanlik ve butce alanları zorunludur' },
        { status: 400 }
      );
    }

    const istek: OneriIstegi = {
      uzmanlik:        body.uzmanlik,
      butce:           Number(body.butce),
      sehir_tercihi:   body.sehir_tercihi ?? null,
      akredite_tercih: body.akredite_tercih ?? false,
    };

    // Tüm paketleri Supabase'den çek
    const paketler = await getPaketler();

    // Her pakete puan hesapla
    const puanMap: Record<string, number> = {};
    const puanliPaketler = paketler.map((paket) => {
      let puan = paketiPuanla(paket, istek);

      // Şehir tercihi bonusu — algoritmanın dışında küçük avantaj
      if (
        istek.sehir_tercihi &&
        paket.klinik.sehir.toLocaleLowerCase('tr-TR') ===
          istek.sehir_tercihi.toLocaleLowerCase('tr-TR')
      ) {
        puan += 5; // Tercih edilen şehirde: +5 bonus
      }

      puanMap[paket.id] = puan;
      return { paket, puan };
    });

    // Puana göre azalan sırada sırala, en yüksek 3'ü al
    puanliPaketler.sort((a, b) => b.puan - a.puan);
    const ilkUc = puanliPaketler.slice(0, 3);

    // Sıfır puanlı paket varsa çıktıya dahil etme (hiç eşleşmedi)
    const oneriler = ilkUc
      .filter(({ puan }) => puan > 0)
      .map(({ paket }) => paket);

    // Sadece önerilen paketlerin puanlarını döndür
    const donenPuanlar: Record<string, number> = {};
    oneriler.forEach((paket) => {
      donenPuanlar[paket.id] = puanMap[paket.id];
    });

    return NextResponse.json({
      success: true,
      data: {
        oneriler,
        puanlar: donenPuanlar,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Öneri hesaplanamadı, lütfen tekrar deneyin' },
      { status: 500 }
    );
  }
}
