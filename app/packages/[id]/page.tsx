'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Paket } from '@/lib/types';

// ─── Skeleton loader ─────────────────────────────────────────────────────────

function SkeletonBlok({ className }: { className?: string }) {
  return (
    <div className={`bg-gray-200 rounded-xl animate-pulse ${className ?? ''}`} />
  );
}

function SkeletonSayfa() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* Geri link */}
      <SkeletonBlok className="h-4 w-32 mb-8" />

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Sol sütun */}
        <div className="flex-1 space-y-5">
          <SkeletonBlok className="h-10 w-3/4" />
          <SkeletonBlok className="h-5 w-1/2" />
          <div className="flex gap-2">
            <SkeletonBlok className="h-6 w-20 rounded-full" />
            <SkeletonBlok className="h-6 w-24 rounded-full" />
          </div>
          <SkeletonBlok className="h-36 w-full" />
          <SkeletonBlok className="h-5 w-2/3" />
          <SkeletonBlok className="h-5 w-1/2" />
          <SkeletonBlok className="h-5 w-1/3" />
        </div>

        {/* Sağ sütun */}
        <div className="lg:w-80 shrink-0">
          <SkeletonBlok className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

// ─── Bilgi satırı ─────────────────────────────────────────────────────────────

function BilgiSatiri({
  ikon,
  etiket,
  deger,
}: {
  ikon: string;
  etiket: string;
  deger: string;
}) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
      <span className="text-xl w-7 shrink-0">{ikon}</span>
      <span className="text-sm text-gray-500 w-28 shrink-0">{etiket}</span>
      <span className="text-sm font-semibold text-gray-800">{deger}</span>
    </div>
  );
}

// ─── Güven rozeti ─────────────────────────────────────────────────────────────

function GuvenRozeti({ ikon, metin }: { ikon: string; metin: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <span className="text-green-500 font-bold">{ikon}</span>
      {metin}
    </div>
  );
}

// ─── Uzmanlık rozet rengi ─────────────────────────────────────────────────────

const UZMANLIK_RENK: Record<string, string> = {
  'ortopedi':        'bg-blue-100 text-blue-700',
  'diş':             'bg-yellow-100 text-yellow-700',
  'göz':             'bg-green-100 text-green-700',
  'estetik cerrahi': 'bg-pink-100 text-pink-700',
  'kardiyoloji':     'bg-red-100 text-red-700',
};

// ─── Ana sayfa ────────────────────────────────────────────────────────────────

export default function PackageDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [paket, setPaket]         = useState<Paket | null>(null);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [bulunamadi, setBulunamadi] = useState(false);

  useEffect(() => {
    fetch(`/api/packages?id=${params.id}`)
      .then((res) => res.json())
      .then((json: { success: boolean; data: Paket }) => {
        if (json.success && json.data) {
          setPaket(json.data);
        } else {
          setBulunamadi(true);
        }
      })
      .catch(() => setBulunamadi(true))
      .finally(() => setYukleniyor(false));
  }, [params.id]);

  // Yükleniyor
  if (yukleniyor) {
    return (
      <main className="min-h-screen bg-white">
        <div
          className="h-2"
          style={{ background: 'linear-gradient(90deg, #0f3460, #16213e)' }}
        />
        <SkeletonSayfa />
      </main>
    );
  }

  // Bulunamadı
  if (bulunamadi || !paket) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-6xl mb-6">🔍</p>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Bu paket mevcut değil
          </h1>
          <p className="text-gray-500 mb-8">
            Aradığınız paket kaldırılmış veya hiç eklenmemiş olabilir.
          </p>
          <Link
            href="/packages"
            className="inline-block px-6 py-3 bg-[#0f3460] text-white font-semibold rounded-xl hover:bg-[#16213e] transition-colors"
          >
            ← Tüm Paketlere Dön
          </Link>
        </div>
      </main>
    );
  }

  const { klinik } = paket;

  return (
    <main className="min-h-screen bg-white">
      {/* Üst bant */}
      <div style={{ background: 'linear-gradient(135deg, #0f3460, #16213e)' }}>
        <div className="max-w-6xl mx-auto px-6 py-6">
          <button
            onClick={() => router.back()}
            className="text-blue-200 hover:text-white text-sm transition-colors"
          >
            ← Geri dön
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col lg:flex-row gap-10 items-start">

          {/* ── Sol sütun ──────────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">

            {/* Klinik adı */}
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-3">
              {klinik.isim}
            </h1>

            {/* Şehir + uzmanlık */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="flex items-center gap-1 text-gray-500 text-sm">
                📍 {klinik.sehir}
              </span>
              {klinik.uzmanlik.map((u) => (
                <span
                  key={u}
                  className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    UZMANLIK_RENK[u] ?? 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {u}
                </span>
              ))}
              {klinik.akredite && (
                <span className="flex items-center gap-1 bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full">
                  ★ JCI Akredite
                </span>
              )}
            </div>

            {/* Paket başlığı */}
            <p className="text-lg text-[#0f3460] font-semibold mb-6">
              {paket.baslik}
            </p>

            {/* Açıklama */}
            <div className="bg-gray-50 rounded-2xl p-6 mb-8">
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">
                Paket Hakkında
              </h2>
              <p className="text-gray-700 leading-relaxed">{paket.aciklama}</p>
            </div>

            {/* Detay bilgileri */}
            <div className="bg-white border border-gray-100 rounded-2xl px-6 mb-8 shadow-sm">
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide pt-5 pb-2">
                Paket Detayları
              </h2>
              <BilgiSatiri ikon="🏨" etiket="Otel"        deger={paket.otel_isim} />
              <BilgiSatiri ikon="🗓"  etiket="Süre"        deger={`${paket.sure_gun} gün`} />
              <BilgiSatiri
                ikon="✈️"
                etiket="Uçuş"
                deger={paket.ucus_dahil ? 'Dahil' : 'Dahil değil'}
              />
              <BilgiSatiri
                ikon="⭐"
                etiket="Klinik Puanı"
                deger={`${klinik.puan} / 5`}
              />
              <BilgiSatiri
                ikon="💰"
                etiket="Fiyat Aralığı"
                deger={klinik.fiyat_aralik}
              />
            </div>

            {/* Klinik puanı görsel */}
            <div className="flex items-center gap-3 mb-2">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    className={`text-xl ${
                      i < Math.round(klinik.puan) ? 'text-amber-400' : 'text-gray-200'
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="text-sm text-gray-500">
                {klinik.puan} puan
              </span>
            </div>
          </div>

          {/* ── Sağ sütun (sticky) ─────────────────────────────────────────── */}
          <div className="lg:w-80 shrink-0 w-full lg:sticky lg:top-8">
            <div className="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">

              {/* Fiyat */}
              <div
                className="px-6 py-6 text-center"
                style={{ background: 'linear-gradient(135deg, #0f3460, #16213e)' }}
              >
                <p className="text-blue-200 text-sm mb-1">Toplam Paket Fiyatı</p>
                <p className="text-4xl font-extrabold text-white">
                  {paket.toplam_fiyat.toLocaleString('tr-TR')}€
                </p>
                <p className="text-blue-300 text-xs mt-1">kişi başı / tüm dahil</p>
              </div>

              {/* Rezervasyon butonu */}
              <div className="px-6 py-5 space-y-4">
                <Link
                  href={`/booking?paket_id=${paket.id}`}
                  className="block w-full py-4 bg-[#0f3460] text-white text-center font-bold rounded-xl hover:bg-[#16213e] transition-colors text-base"
                >
                  Rezervasyon Yap →
                </Link>

                <p className="text-xs text-center text-gray-400">
                  Ücretsiz iptal · Kredi kartı gerekmez
                </p>

                {/* Güven rozetleri */}
                <div className="border-t border-gray-100 pt-4 space-y-2.5">
                  <GuvenRozeti ikon="✓" metin="Güvenli Ödeme" />
                  <GuvenRozeti ikon="✓" metin="Ücretsiz İptal" />
                  <GuvenRozeti ikon="✓" metin="7/24 Destek" />
                </div>
              </div>
            </div>

            {/* Tüm paketlere dön */}
            <Link
              href="/packages"
              className="block text-center text-sm text-gray-400 hover:text-gray-600 mt-4 transition-colors"
            >
              ← Tüm Paketlere Dön
            </Link>
          </div>

        </div>
      </div>
    </main>
  );
}
