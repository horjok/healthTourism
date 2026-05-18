import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getKlinikById, getPaketler } from '@/lib/supabase';
import type { Paket } from '@/lib/types';

// ISR: klinik detay sayfası 60sn boyunca static cache'lenir, sub-100ms TTFB
export const revalidate = 60;

// ─── Yardımcı bileşenler ──────────────────────────────────────────────────────

// Yıldız gösterimi — yarım yıldızı simüle etmek için doluluk yüzdesi
function YildizSkorу({ puan }: { puan: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => {
        const doluluk = Math.min(Math.max(puan - i, 0), 1); // 0, 0.x veya 1
        return (
          <span key={i} className="relative text-2xl leading-none">
            {/* Gri arka plan yıldızı */}
            <span className="text-gray-200">★</span>
            {/* Sarı doluluk */}
            <span
              className="absolute inset-0 overflow-hidden text-amber-400"
              style={{ width: `${doluluk * 100}%` }}
            >
              ★
            </span>
          </span>
        );
      })}
    </div>
  );
}

// Uzmanlık badge renk haritası
const UZMANLIK_RENK: Record<string, string> = {
  ortopedi:          'bg-blue-100   text-blue-700',
  'diş':             'bg-yellow-100 text-yellow-700',
  göz:               'bg-emerald-100 text-emerald-700',
  'estetik cerrahi': 'bg-pink-100   text-pink-700',
  kardiyoloji:       'bg-red-100    text-red-700',
  nöroloji:          'bg-purple-100 text-purple-700',
  onkoloji:          'bg-orange-100 text-orange-700',
};

function UzmanlikBadge({ alan }: { alan: string }) {
  const stil = UZMANLIK_RENK[alan.toLocaleLowerCase('tr-TR')] ?? 'bg-gray-100 text-gray-600';
  return (
    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${stil}`}>
      {alan}
    </span>
  );
}

// Güven göstergesi
function GuvenKarti({ ikon, baslik, aciklama }: { ikon: string; baslik: string; aciklama: string }) {
  return (
    <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
      <span className="text-2xl shrink-0">{ikon}</span>
      <div>
        <p className="text-sm font-bold text-gray-800">{baslik}</p>
        <p className="text-xs text-gray-500 mt-0.5">{aciklama}</p>
      </div>
    </div>
  );
}

// Paket kartı (klinik sayfasına özel, kompakt)
function PaketKarti({ paket }: { paket: Paket }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="text-base font-bold text-gray-800 leading-snug">{paket.baslik}</h3>
          <span className="text-lg font-extrabold text-[#0f3460] shrink-0">
            {paket.toplam_fiyat.toLocaleString('tr-TR')}€
          </span>
        </div>

        {/* Özellikler */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-xs text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full">
            🗓 {paket.sure_gun} gün
          </span>
          <span className="text-xs text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full">
            🏨 {paket.otel_isim}
          </span>
          {paket.ucus_dahil && (
            <span className="text-xs text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full font-semibold">
              ✈️ Uçuş dahil
            </span>
          )}
        </div>

        <Link
          href={`/booking?paket_id=${paket.id}`}
          className="block w-full py-2.5 text-center text-sm font-bold bg-[#0f3460] text-white rounded-xl hover:bg-[#16213e] transition-colors"
        >
          Paket Seç →
        </Link>
      </div>
    </div>
  );
}

// ─── Sayfa (Server Component) ─────────────────────────────────────────────────

export default async function KlinikDetayPage({
  params,
}: {
  params: { id: string };
}) {
  // Klinik verisini çek — bulunamazsa 404
  let klinik;
  try {
    klinik = await getKlinikById(params.id);
  } catch {
    notFound();
  }

  // Bu kliniğe ait paketleri çek
  const paketler: Paket[] = await getPaketler({ klinik_id: params.id }).catch(() => []);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* ── Üst başlık bandı ─────────────────────────────────────────────── */}
      <div style={{ background: 'linear-gradient(135deg, #0f3460, #16213e)' }}>
        <div className="max-w-5xl mx-auto px-6 py-8">
          <Link
            href="/packages"
            className="text-blue-200 hover:text-white text-sm transition-colors inline-block mb-4"
          >
            ← Paketlere Dön
          </Link>

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
                {klinik.isim}
              </h1>
              <p className="text-blue-200 mt-1 flex items-center gap-1.5 text-sm">
                📍 {klinik.sehir}
              </p>
            </div>

            {/* JCI rozeti */}
            {klinik.akredite && (
              <div className="flex items-center gap-2 bg-amber-400/20 border border-amber-400/40 px-4 py-2 rounded-xl shrink-0">
                <span className="text-amber-300 text-xl">★</span>
                <div>
                  <p className="text-amber-200 text-xs font-semibold">JCI Akredite</p>
                  <p className="text-amber-300/70 text-xs">Uluslararası Sertifikalı</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* ── Sol sütun ──────────────────────────────────────────────────── */}
          <div className="flex-1 space-y-6">

            {/* Güvenilirlik skoru */}
            <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">
                Güvenilirlik Skoru
              </h2>

              <div className="flex items-center gap-5 mb-4">
                {/* Büyük sayı */}
                <div className="text-center shrink-0">
                  <p className="text-5xl font-extrabold text-[#0f3460] leading-none">
                    {klinik.puan.toFixed(1)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">/ 5.0</p>
                </div>

                <div className="space-y-2">
                  {/* Yıldızlar */}
                  <YildizSkorу puan={klinik.puan} />

                  {/* Puan etiketi */}
                  <p className="text-sm text-gray-600">
                    {klinik.puan >= 4.5
                      ? 'Mükemmel'
                      : klinik.puan >= 4.0
                      ? 'Çok İyi'
                      : klinik.puan >= 3.5
                      ? 'İyi'
                      : 'Orta'}
                    {' '}— hasta memnuniyeti yüksek
                  </p>

                  {/* JCI rozeti (küçük) */}
                  {klinik.akredite && (
                    <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-full">
                      ★ JCI Akredite Klinik
                    </span>
                  )}
                </div>
              </div>

              {/* Uzmanlık alanları */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Uzmanlık Alanları
                </p>
                <div className="flex flex-wrap gap-2">
                  {klinik.uzmanlik.map((alan) => (
                    <UzmanlikBadge key={alan} alan={alan} />
                  ))}
                </div>
              </div>
            </section>

            {/* Fiyat aralığı */}
            <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
                Fiyat Aralığı
              </h2>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-extrabold text-[#0f3460]">
                  {klinik.fiyat_aralik}
                </span>
                <span className="text-sm text-gray-400">kişi başı tahmini</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Kesin fiyat seçilen paket ve hizmetlere göre değişir.
              </p>
            </section>

            {/* Güven göstergeleri */}
            <section>
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
                Neden Bu Klinik?
              </h2>
              <div className="grid sm:grid-cols-3 gap-3">
                <GuvenKarti
                  ikon="🌍"
                  baslik="Uluslararası Hasta Deneyimi"
                  aciklama="50+ ülkeden hastaya hizmet verilmiş deneyimli ekip"
                />
                <GuvenKarti
                  ikon="🕐"
                  baslik="7/24 Türkçe Destek"
                  aciklama="Türkçe konuşan koordinatörler her an yanınızda"
                />
                <GuvenKarti
                  ikon="💬"
                  baslik="Ücretsiz Ön Konsültasyon"
                  aciklama="Rezervasyon öncesi uzman görüşü ücretsiz alın"
                />
              </div>
            </section>

            {/* Bu kliniğin paketleri */}
            <section>
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
                Bu Kliniğin Paketleri
                {paketler.length > 0 && (
                  <span className="ml-2 bg-[#0f3460] text-white text-xs px-2 py-0.5 rounded-full normal-case font-bold">
                    {paketler.length}
                  </span>
                )}
              </h2>

              {paketler.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-8 text-center">
                  <p className="text-gray-400 text-sm">Bu kliniğe ait paket bulunamadı.</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {paketler.map((paket) => (
                    <PaketKarti key={paket.id} paket={paket} />
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* ── Sağ sütun (sticky) ─────────────────────────────────────────── */}
          <div className="lg:w-72 shrink-0 w-full lg:sticky lg:top-8 space-y-4">

            {/* Özet kart */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              <div
                className="px-5 py-4 text-center"
                style={{ background: 'linear-gradient(135deg, #0f3460, #16213e)' }}
              >
                <p className="text-blue-200 text-xs mb-0.5">Başlangıç Fiyatı</p>
                <p className="text-2xl font-extrabold text-white">
                  {klinik.fiyat_aralik}
                </p>
              </div>

              <div className="divide-y divide-gray-100 px-5">
                <div className="py-3 flex items-center justify-between">
                  <span className="text-xs text-gray-500">🏙 Şehir</span>
                  <span className="text-xs font-semibold text-gray-700">{klinik.sehir}</span>
                </div>
                <div className="py-3 flex items-center justify-between">
                  <span className="text-xs text-gray-500">⭐ Puan</span>
                  <span className="text-xs font-semibold text-gray-700">{klinik.puan} / 5.0</span>
                </div>
                <div className="py-3 flex items-center justify-between">
                  <span className="text-xs text-gray-500">📦 Paket sayısı</span>
                  <span className="text-xs font-semibold text-gray-700">{paketler.length} paket</span>
                </div>
                {klinik.akredite && (
                  <div className="py-3">
                    <span className="text-xs bg-amber-100 text-amber-700 font-bold px-2.5 py-1 rounded-full">
                      ★ JCI Akredite
                    </span>
                  </div>
                )}
              </div>

              <div className="px-5 py-4 border-t border-gray-100">
                {paketler.length > 0 ? (
                  <Link
                    href={`/booking?paket_id=${paketler[0].id}`}
                    className="block w-full py-3 text-center font-bold text-sm bg-[#0f3460] text-white rounded-xl hover:bg-[#16213e] transition-colors"
                  >
                    Paket Seç →
                  </Link>
                ) : (
                  <Link
                    href="/packages"
                    className="block w-full py-3 text-center font-bold text-sm bg-[#0f3460] text-white rounded-xl hover:bg-[#16213e] transition-colors"
                  >
                    Tüm Paketler →
                  </Link>
                )}
              </div>
            </div>

            {/* Mini güven listesi */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-2.5 shadow-sm">
              {[
                '✓ Güvenli ödeme',
                '✓ Ücretsiz iptal',
                '✓ 7/24 Türkçe destek',
                '✓ Onaylı klinik',
              ].map((m) => (
                <p key={m} className="text-xs text-gray-600 font-medium">{m}</p>
              ))}
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
