'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Paket } from '@/lib/types';

// ─── Öne çıkan paket kartı ───────────────────────────────────────────────────

function PaketKarti({ paket }: { paket: Paket }) {
  return (
    <Link href={`/packages/${paket.id}`}>
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer h-full">
        {/* Klinik adı ve şehir */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#0f3460] mb-1">
              {paket.klinik.sehir}
            </p>
            <h3 className="text-base font-bold text-gray-900 leading-snug">
              {paket.baslik}
            </h3>
          </div>
          {paket.klinik.akredite && (
            <span className="ml-2 shrink-0 bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">
              JCI
            </span>
          )}
        </div>

        <p className="text-sm text-gray-500 mb-4">{paket.klinik.isim}</p>

        {/* Uzmanlık etiketleri */}
        <div className="flex flex-wrap gap-1 mb-4">
          {paket.klinik.uzmanlik.map((u) => (
            <span
              key={u}
              className="bg-blue-50 text-[#0f3460] text-xs px-2 py-0.5 rounded-full"
            >
              {u}
            </span>
          ))}
        </div>

        {/* Fiyat ve süre */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <span className="text-xl font-bold text-[#0f3460]">
            {paket.toplam_fiyat.toLocaleString('tr-TR')}€
          </span>
          <span className="text-sm text-gray-400">
            {paket.ucus_dahil ? '✈ Uçuş dahil · ' : ''}{paket.sure_gun} gün
          </span>
        </div>
      </div>
    </Link>
  );
}

// ─── Özellik kutusu ───────────────────────────────────────────────────────────

function OzellikKutusu({
  ikon,
  baslik,
  aciklama,
}: {
  ikon: string;
  baslik: string;
  aciklama: string;
}) {
  return (
    <div className="text-center px-6 py-8 bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="text-4xl mb-4">{ikon}</div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">{baslik}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{aciklama}</p>
    </div>
  );
}

// ─── Ana Sayfa ────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [paketler, setPaketler] = useState<Paket[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState(false);

  // İlk 3 paketi API'dan çek
  useEffect(() => {
    fetch('/api/packages')
      .then((res) => res.json())
      .then((json: { success: boolean; data: Paket[] }) => {
        if (json.success) {
          setPaketler(json.data.slice(0, 3));
        } else {
          setHata(true);
        }
      })
      .catch(() => setHata(true))
      .finally(() => setYukleniyor(false));
  }, []);

  return (
    <main className="min-h-screen bg-white">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section
        className="relative flex flex-col items-center justify-center text-center px-6 py-28 md:py-40"
        style={{ background: 'linear-gradient(135deg, #0f3460 0%, #16213e 100%)' }}
      >
        {/* Dekoratif daire */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full" />
          <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-white/5 rounded-full" />
        </div>

        <span className="relative inline-block bg-white/10 text-white text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded-full mb-6">
          Sağlık Turizmi
        </span>

        <h1 className="relative text-4xl md:text-6xl font-extrabold text-white leading-tight mb-4 max-w-3xl">
          Sağlık ile Tatilin <br className="hidden md:block" />
          <span className="text-blue-300">Buluştuğu Yer</span>
        </h1>

        <p className="relative text-lg md:text-xl text-blue-100 mb-10 max-w-xl">
          Uçak + Otel + Klinik — Hepsi Tek Pakette
        </p>

        <div className="relative flex flex-col sm:flex-row gap-4">
          <Link
            href="/packages"
            className="px-8 py-4 bg-white text-[#0f3460] font-bold rounded-xl hover:bg-blue-50 transition-colors text-base"
          >
            Paketleri Keşfet
          </Link>
          <Link
            href="/packages?chat=true"
            className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-xl hover:bg-white/10 transition-colors text-base"
          >
            ✨ AI ile Paket Bul
          </Link>
        </div>
      </section>

      {/* ── Öne Çıkan Paketler ───────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-3">
            Öne Çıkan Paketler
          </h2>
          <p className="text-gray-500">
            En çok tercih edilen sağlık turizmi paketleri
          </p>
        </div>

        {/* Yükleniyor durumu */}
        {yukleniyor && (
          <div className="flex justify-center items-center py-16">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-[#0f3460] border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-400 text-sm">Yükleniyor...</p>
            </div>
          </div>
        )}

        {/* Hata durumu */}
        {!yukleniyor && hata && (
          <div className="text-center py-16">
            <p className="text-red-500 font-medium">Paketler yüklenemedi</p>
            <p className="text-gray-400 text-sm mt-1">
              Lütfen sayfayı yenileyin
            </p>
          </div>
        )}

        {/* Paket kartları */}
        {!yukleniyor && !hata && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {paketler.map((paket) => (
                <PaketKarti key={paket.id} paket={paket} />
              ))}
            </div>

            <div className="text-center mt-10">
              <Link
                href="/packages"
                className="inline-block px-8 py-3 bg-[#0f3460] text-white font-semibold rounded-xl hover:bg-[#16213e] transition-colors"
              >
                Tüm Paketleri Gör →
              </Link>
            </div>
          </>
        )}
      </section>

      {/* ── Özellikler ───────────────────────────────────────────────────── */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">
              Neden HealthTour?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <OzellikKutusu
              ikon="🏥"
              baslik="JCI Akredite Klinikler"
              aciklama="Uluslararası Joint Commission akreditasyonuna sahip, güvenilir ve denetlenmiş kliniklerle çalışıyoruz."
            />
            <OzellikKutusu
              ikon="✈️"
              baslik="Uçak + Otel + Sağlık Tek Pakette"
              aciklama="Seyahatin tüm detaylarını tek rezervasyonla hallediyor, sana sadece iyileşmene odaklanmak kalıyor."
            />
            <OzellikKutusu
              ikon="🤖"
              baslik="AI Destekli Kişisel Öneri"
              aciklama="Sağlık şikayetini anlat, yapay zekamız sana en uygun klinik ve paket kombinasyonunu bulsun."
            />
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="text-center py-8 text-sm text-gray-400 border-t border-gray-100">
        © 2025 HealthTour — Sağlık turizmi demo platformu
      </footer>
    </main>
  );
}
