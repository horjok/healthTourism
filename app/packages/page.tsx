'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Paket } from '@/lib/types';
import ChatEkrani from '@/components/chat/ChatEkrani';

// ─── Uzmanlık seçenekleri ─────────────────────────────────────────────────────

const UZMANLIK_SECENEKLERI = [
  { deger: '', etiket: 'Tümü' },
  { deger: 'ortopedi',        etiket: 'Ortopedi' },
  { deger: 'diş',             etiket: 'Diş' },
  { deger: 'göz',             etiket: 'Göz' },
  { deger: 'estetik cerrahi', etiket: 'Estetik' },
  { deger: 'kardiyoloji',     etiket: 'Kardiyoloji' },
];

// Uzmanlığa göre rozet rengi
const UZMANLIK_RENK: Record<string, string> = {
  'ortopedi':        'bg-blue-100 text-blue-700',
  'diş':             'bg-yellow-100 text-yellow-700',
  'göz':             'bg-green-100 text-green-700',
  'estetik cerrahi': 'bg-pink-100 text-pink-700',
  'kardiyoloji':     'bg-red-100 text-red-700',
};

// ─── Paket kartı ──────────────────────────────────────────────────────────────

function PaketKarti({ paket }: { paket: Paket }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
      {/* Üst bilgi */}
      <div className="p-5 flex-1">
        <div className="flex items-start justify-between mb-2 gap-2">
          <div className="min-w-0">
            <p className="text-xs text-[#0f3460] font-semibold uppercase tracking-wide mb-1">
              {paket.klinik.sehir}
            </p>
            <h3 className="font-bold text-gray-900 text-base leading-snug">
              {paket.baslik}
            </h3>
          </div>

          {/* Rozetler */}
          <div className="flex flex-col gap-1 shrink-0">
            {paket.klinik.akredite && (
              <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">
                ★ JCI
              </span>
            )}
            {paket.ucus_dahil && (
              <span className="bg-[#0f3460] text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                ✈ Uçuş
              </span>
            )}
          </div>
        </div>

        <p className="text-sm text-gray-400 mb-3">{paket.klinik.isim}</p>

        {/* Uzmanlık rozetleri */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {paket.klinik.uzmanlik.map((u) => (
            <span
              key={u}
              className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                UZMANLIK_RENK[u] ?? 'bg-gray-100 text-gray-600'
              }`}
            >
              {u}
            </span>
          ))}
        </div>

        {/* Süre */}
        <p className="text-sm text-gray-500">
          🗓 {paket.sure_gun} gün
        </p>
      </div>

      {/* Alt kısım: fiyat + buton */}
      <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
        <div>
          <span className="text-2xl font-extrabold text-[#0f3460]">
            {paket.toplam_fiyat.toLocaleString('tr-TR')}€
          </span>
          <span className="text-xs text-gray-400 ml-1">/ kişi</span>
        </div>
        <Link
          href={`/packages/${paket.id}`}
          className="px-4 py-2 bg-[#0f3460] text-white text-sm font-semibold rounded-xl hover:bg-[#16213e] transition-colors"
        >
          İncele →
        </Link>
      </div>
    </div>
  );
}

// ─── Filtre paneli ────────────────────────────────────────────────────────────

interface FiltrePaneliProps {
  uzmanlik: string;
  maxFiyat: string;
  yukleniyor: boolean;
  onChange: (uzmanlik: string, maxFiyat: string) => void;
}

function FiltrePanel({ uzmanlik, maxFiyat, yukleniyor, onChange }: FiltrePaneliProps) {
  const [lokalUzmanlik, setLokalUzmanlik] = useState(uzmanlik);
  const [lokalMaxFiyat, setLokalMaxFiyat] = useState(maxFiyat);

  // Dışarıdan gelen prop değişince yerel state'i senkronize et (chatbot yönlendirmesi)
  useEffect(() => { setLokalUzmanlik(uzmanlik); }, [uzmanlik]);
  useEffect(() => { setLokalMaxFiyat(maxFiyat); }, [maxFiyat]);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col sm:flex-row gap-4 items-end shadow-sm">
      {/* Uzmanlık dropdown */}
      <div className="flex-1 min-w-0">
        <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
          Uzmanlık
        </label>
        <select
          value={lokalUzmanlik}
          onChange={(e) => setLokalUzmanlik(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f3460]/30 bg-white"
        >
          {UZMANLIK_SECENEKLERI.map((s) => (
            <option key={s.deger} value={s.deger}>
              {s.etiket}
            </option>
          ))}
        </select>
      </div>

      {/* Max fiyat input */}
      <div className="flex-1 min-w-0">
        <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
          Maks. Fiyat (€)
        </label>
        <input
          type="number"
          placeholder="ör. 3000"
          value={lokalMaxFiyat}
          onChange={(e) => setLokalMaxFiyat(e.target.value)}
          min={0}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f3460]/30"
        />
      </div>

      {/* Filtrele butonu */}
      <button
        onClick={() => onChange(lokalUzmanlik, lokalMaxFiyat)}
        disabled={yukleniyor}
        className="px-6 py-2.5 bg-[#0f3460] text-white text-sm font-semibold rounded-xl hover:bg-[#16213e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
      >
        {yukleniyor ? 'Aranıyor...' : 'Filtrele'}
      </button>

      {/* Temizle */}
      {(lokalUzmanlik || lokalMaxFiyat) && (
        <button
          onClick={() => {
            setLokalUzmanlik('');
            setLokalMaxFiyat('');
            onChange('', '');
          }}
          className="text-sm text-gray-400 hover:text-gray-600 whitespace-nowrap"
        >
          Temizle
        </button>
      )}
    </div>
  );
}

// ─── İç sayfa bileşeni (useSearchParams burada) ───────────────────────────────

function PackagesInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // URL'den primitive değerleri çıkar — bunlar stable string'ler, React deps için güvenli
  const urlUzmanlik = searchParams.get('uzmanlik') ?? '';
  const urlMaxFiyat = searchParams.get('max_fiyat') ?? '';
  const urlChat     = searchParams.get('chat') === 'true';

  const [paketler, setPaketler]     = useState<Paket[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata]             = useState(false);
  const [chatAcik, setChatAcik]     = useState(urlChat);

  // chat param değişince paneli aç
  useEffect(() => {
    if (urlChat) setChatAcik(true);
  }, [urlChat]);

  // Filtre state'leri (FiltrePanel'e prop olarak geçer)
  const [uzmanlik, setUzmanlik] = useState(urlUzmanlik);
  const [maxFiyat, setMaxFiyat] = useState(urlMaxFiyat);

  // ─── Sadece API fetch — URL güncelleme burada YOK (döngüyü önler) ───────────
  function apiFetch(yeniUzmanlik: string, yeniMaxFiyat: string) {
    setYukleniyor(true);
    setHata(false);
    const params = new URLSearchParams();
    if (yeniUzmanlik) params.set('uzmanlik', yeniUzmanlik);
    if (yeniMaxFiyat) params.set('max_fiyat', yeniMaxFiyat);
    fetch(`/api/packages${params.size ? '?' + params.toString() : ''}`)
      .then((res) => res.json())
      .then((json: { success: boolean; data: Paket[] }) => {
        if (json.success) setPaketler(json.data);
        else setHata(true);
      })
      .catch(() => setHata(true))
      .finally(() => setYukleniyor(false));
  }

  // URL değişince (chatbot push dahil) state + fetch güncelle
  useEffect(() => {
    setUzmanlik(urlUzmanlik);
    setMaxFiyat(urlMaxFiyat);
    apiFetch(urlUzmanlik, urlMaxFiyat);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlUzmanlik, urlMaxFiyat]);

  // Kullanıcı filtreyi değiştirince: URL güncelle (bu da yukarıdaki effect'i tetikler)
  function filtreDegisti(yeniUzmanlik: string, yeniMaxFiyat: string) {
    const params = new URLSearchParams();
    if (yeniUzmanlik) params.set('uzmanlik', yeniUzmanlik);
    if (yeniMaxFiyat) params.set('max_fiyat', yeniMaxFiyat);
    if (chatAcik)     params.set('chat', 'true');
    router.replace(`/packages${params.size ? '?' + params.toString() : ''}`, { scroll: false });
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Chat paneli — isOpen ile kontrol edilir, DOM'dan kaldırılmaz (animasyon için) */}
      <ChatEkrani isOpen={chatAcik} onClose={() => setChatAcik(false)} />

      {/* Başlık */}
      <div style={{ background: 'linear-gradient(135deg, #0f3460, #16213e)' }} className="px-6 py-12">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white">Tüm Paketler</h1>
            <p className="text-blue-200 text-sm mt-1">
              {yukleniyor ? 'Aranıyor...' : `${paketler.length} paket bulundu`}
            </p>
          </div>
          <button
            onClick={() => setChatAcik(true)}
            className="px-5 py-2.5 bg-white text-[#0f3460] text-sm font-bold rounded-xl hover:bg-blue-50 transition-colors"
          >
            ✨ AI ile Paket Bul
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* Filtre paneli */}
        <FiltrePanel
          uzmanlik={uzmanlik}
          maxFiyat={maxFiyat}
          yukleniyor={yukleniyor}
          onChange={filtreDegisti}
        />

        {/* Yükleniyor */}
        {yukleniyor && (
          <div className="flex justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-[#0f3460] border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-400 text-sm">Yükleniyor...</p>
            </div>
          </div>
        )}

        {/* Hata */}
        {!yukleniyor && hata && (
          <div className="text-center py-20">
            <p className="text-red-500 font-medium">Paketler yüklenemedi</p>
            <p className="text-gray-400 text-sm mt-1">Lütfen sayfayı yenileyin</p>
          </div>
        )}

        {/* Boş sonuç */}
        {!yukleniyor && !hata && paketler.length === 0 && (
          <div className="text-center py-20">
            <p className="text-3xl mb-3">🔍</p>
            <p className="text-gray-600 font-medium">Bu kriterlere uygun paket bulunamadı</p>
            <p className="text-gray-400 text-sm mt-1">
              Filtreleri değiştirmeyi ya da AI öneri aracını denemeyi deneyin
            </p>
          </div>
        )}

        {/* Paket grid */}
        {!yukleniyor && !hata && paketler.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paketler.map((paket) => (
              <PaketKarti key={paket.id} paket={paket} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

// ─── Sayfa (Suspense sarmalayıcı — useSearchParams zorunluluğu) ───────────────

export default function PackagesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-screen">
          <div className="w-10 h-10 border-4 border-[#0f3460] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <PackagesInner />
    </Suspense>
  );
}
