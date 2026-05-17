'use client';

import { useEffect, useState, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Paket } from '@/lib/types';
import ChatEkrani from '@/components/chat/ChatEkrani';
import { useDoviz } from '@/lib/DovizContext';
import { useCartStore } from '@/lib/cartStore';

// ─── Uzmanlık rozet renkleri ──────────────────────────────────────────────────

const UZMANLIK_RENK: Record<string, string> = {
  'ortopedi':        'bg-blue-100 text-blue-700 hover:ring-blue-400',
  'diş':             'bg-yellow-100 text-yellow-700 hover:ring-yellow-400',
  'göz':             'bg-green-100 text-green-700 hover:ring-green-400',
  'estetik cerrahi': 'bg-pink-100 text-pink-700 hover:ring-pink-400',
  'kardiyoloji':     'bg-red-100 text-red-700 hover:ring-red-400',
  'nöroloji':        'bg-purple-100 text-purple-700 hover:ring-purple-400',
  'dermatoloji':     'bg-teal-100 text-teal-700 hover:ring-teal-400',
  'saç ekimi':       'bg-orange-100 text-orange-700 hover:ring-orange-400',
  'onkoloji':        'bg-rose-100 text-rose-700 hover:ring-rose-400',
  'psikiyatri':      'bg-indigo-100 text-indigo-700 hover:ring-indigo-400',
};

// ─── Filtre state tipi ────────────────────────────────────────────────────────

interface FiltreState {
  uzmanlik: string;
  maxFiyat: string; // EUR cinsinden (API'ye gönderilir)
  sehir: string;
  ucusDahil: boolean;
  otelDahil: boolean;
  akredite: boolean;
  minPuan: string;
}

const BOSH_FILTRE: FiltreState = {
  uzmanlik:  '',
  maxFiyat:  '',
  sehir:     '',
  ucusDahil: false,
  otelDahil: false,
  akredite:  false,
  minPuan:   '',
};

// ─── Paket kartı ──────────────────────────────────────────────────────────────

function PaketKarti({
  paket,
  onUzmanlikSec,
}: {
  paket: Paket;
  onUzmanlikSec: (u: string) => void;
}) {
  const { formatla } = useDoviz();
  const { addItem, items } = useCartStore();
  const [eklendi, setEklendi] = useState(false);

  const sepette = items.some((i) => i.id === paket.id);

  function sepeteEkle() {
    addItem({
      id: paket.id,
      type: 'package',
      name: paket.baslik,
      detail: `${paket.sure_gun} gün · ${paket.klinik.isim} · ${paket.klinik.sehir}`,
      unitPrice: paket.toplam_fiyat,
      quantity: 1,
    });
    setEklendi(true);
    setTimeout(() => setEklendi(false), 2000);
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
      <div className="p-5 flex-1">
        <div className="flex items-start justify-between mb-2 gap-2">
          <div className="min-w-0">
            <p className="text-xs text-[#0f3460] font-semibold uppercase tracking-wide mb-1">
              {paket.klinik.sehir}
            </p>
            <h3 className="font-bold text-gray-900 text-base leading-snug">{paket.baslik}</h3>
          </div>
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
            {paket.otel_dahil && (
              <span className="bg-emerald-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                🏨 Otel
              </span>
            )}
          </div>
        </div>

        <p className="text-sm text-gray-400 mb-3">{paket.klinik.isim}</p>

        {/* Tıklanabilir uzmanlık rozetleri */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {paket.klinik.uzmanlik.map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => onUzmanlikSec(u)}
              title={`${u} ile filtrele`}
              className={`text-xs font-medium px-2.5 py-0.5 rounded-full transition-all hover:ring-2 hover:ring-offset-1 cursor-pointer ${
                UZMANLIK_RENK[u] ?? 'bg-gray-100 text-gray-600 hover:ring-gray-400'
              }`}
            >
              {u}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span>🗓 {paket.sure_gun} gün</span>
          <span>⭐ {paket.klinik.puan}</span>
        </div>
      </div>

      <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between gap-3">
        <div className="shrink-0">
          <span className="text-2xl font-extrabold text-[#0f3460]">
            {formatla(paket.toplam_fiyat)}
          </span>
          <span className="text-xs text-gray-400 ml-1">/ kişi</span>
        </div>
        <div className="flex gap-2 shrink-0">
          <Link
            href={`/packages/${paket.id}`}
            className="px-3 py-2 border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:border-gray-400 transition-colors"
          >
            İncele
          </Link>
          <button
            type="button"
            onClick={sepeteEkle}
            className={`px-3 py-2 text-sm font-semibold rounded-xl transition-colors ${
              eklendi || sepette
                ? 'bg-green-500 text-white'
                : 'bg-[#0f3460] text-white hover:bg-[#16213e]'
            }`}
          >
            {eklendi ? '✓ Eklendi' : sepette ? '✓ Sepette' : '+ Sepete Ekle'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Filtre paneli ────────────────────────────────────────────────────────────

function FiltrePanel({
  filtreler,
  yukleniyor,
  uzmanliklar,
  sehirler,
  onChange,
}: {
  filtreler: FiltreState;
  yukleniyor: boolean;
  uzmanliklar: string[];
  sehirler: string[];
  onChange: (f: FiltreState) => void;
}) {
  const { sembol, kur } = useDoviz();

  // lokal.maxFiyat seçili döviz cinsinden tutulur (gösterim için)
  const [lokal, setLokal] = useState<FiltreState>({
    ...filtreler,
    maxFiyat: filtreler.maxFiyat
      ? String(Math.round(Number(filtreler.maxFiyat) * kur))
      : '',
  });

  // Dış filtreler veya döviz kuru değişince lokal maxFiyat'ı güncelle
  // filtreler.maxFiyat her zaman EUR'dur
  useEffect(() => {
    setLokal({
      ...filtreler,
      maxFiyat: filtreler.maxFiyat
        ? String(Math.round(Number(filtreler.maxFiyat) * kur))
        : '',
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filtreler.uzmanlik, filtreler.maxFiyat, filtreler.sehir,
    filtreler.ucusDahil, filtreler.otelDahil, filtreler.akredite, filtreler.minPuan,
    kur,
  ]);

  const set = <K extends keyof FiltreState>(k: K, v: FiltreState[K]) =>
    setLokal((prev) => ({ ...prev, [k]: v }));

  const aktifSayisi = Object.entries(lokal).filter(([, v]) => v !== '' && v !== false).length;

  // maxFiyat'ı EUR'a çevirerek parent'a ilet
  function filtrele() {
    const eurMax = lokal.maxFiyat
      ? String(Math.round(Number(lokal.maxFiyat) / kur))
      : '';
    onChange({ ...lokal, maxFiyat: eurMax });
  }

  function temizle() {
    setLokal(BOSH_FILTRE);
    onChange(BOSH_FILTRE);
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
      {/* Satır 1: dropdown'lar + sayısal girdiler */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Uzmanlık</label>
          <select
            value={lokal.uzmanlik}
            onChange={(e) => set('uzmanlik', e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0f3460]/30"
          >
            <option value="">Tüm Uzmanlıklar</option>
            {uzmanliklar.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Şehir</label>
          <select
            value={lokal.sehir}
            onChange={(e) => set('sehir', e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0f3460]/30"
          >
            <option value="">Tüm Şehirler</option>
            {sehirler.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
            Maks. Fiyat ({sembol})
          </label>
          <input
            type="number"
            placeholder={`ör. ${Math.round(3000 * kur).toLocaleString('tr-TR')}`}
            value={lokal.maxFiyat}
            onChange={(e) => set('maxFiyat', e.target.value)}
            min={0}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f3460]/30"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Min. Puan</label>
          <input
            type="number"
            placeholder="ör. 4"
            value={lokal.minPuan}
            onChange={(e) => set('minPuan', e.target.value)}
            min={0}
            max={5}
            step={0.1}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f3460]/30"
          />
        </div>
      </div>

      {/* Satır 2: toggle checkbox'lar + butonlar */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex flex-wrap gap-3 flex-1">
          {(
            [
              { key: 'ucusDahil', label: '✈ Uçuş Dahil' },
              { key: 'otelDahil', label: '🏨 Otel Dahil' },
              { key: 'akredite',  label: '★ JCI Akredite' },
            ] as { key: keyof FiltreState; label: string }[]
          ).map(({ key, label }) => (
            <label
              key={key}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer text-sm font-medium transition-colors select-none ${
                lokal[key]
                  ? 'bg-[#0f3460] text-white border-[#0f3460]'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-[#0f3460]/40'
              }`}
            >
              <input
                type="checkbox"
                checked={lokal[key] as boolean}
                onChange={(e) => set(key, e.target.checked as FiltreState[typeof key])}
                className="sr-only"
              />
              {label}
            </label>
          ))}
        </div>

        <div className="flex gap-2 shrink-0">
          {aktifSayisi > 0 && (
            <button
              onClick={temizle}
              className="text-sm text-gray-400 hover:text-gray-600 px-3 py-2 whitespace-nowrap"
            >
              Temizle ({aktifSayisi})
            </button>
          )}
          <button
            onClick={filtrele}
            disabled={yukleniyor}
            className="px-6 py-2.5 bg-[#0f3460] text-white text-sm font-semibold rounded-xl hover:bg-[#16213e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {yukleniyor ? 'Aranıyor...' : 'Filtrele'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── İç sayfa bileşeni ────────────────────────────────────────────────────────

function PackagesInner() {
  const searchParams = useSearchParams();
  const router       = useRouter();

  function urldenFiltre(): FiltreState {
    return {
      uzmanlik:  searchParams.get('uzmanlik')   ?? '',
      maxFiyat:  searchParams.get('max_fiyat')  ?? '',
      sehir:     searchParams.get('sehir')       ?? '',
      ucusDahil: searchParams.get('ucus_dahil') === 'true',
      otelDahil: searchParams.get('otel_dahil') === 'true',
      akredite:  searchParams.get('akredite')   === 'true',
      minPuan:   searchParams.get('min_puan')   ?? '',
    };
  }

  const urlChat = searchParams.get('chat') === 'true';

  const [filtreler, setFiltreler]     = useState<FiltreState>(urldenFiltre);
  const [paketler, setPaketler]       = useState<Paket[]>([]);
  const [tumPaketler, setTumPaketler] = useState<Paket[]>([]);
  const [yukleniyor, setYukleniyor]   = useState(true);
  const [hata, setHata]               = useState(false);
  const [chatAcik, setChatAcik]       = useState(urlChat);

  // Filtre seçenekleri için tüm paketleri bir kez çek
  useEffect(() => {
    fetch('/api/packages')
      .then((r) => r.json())
      .then((json: { success: boolean; data: Paket[] }) => {
        if (json.success) setTumPaketler(json.data);
      })
      .catch(() => {});
  }, []);

  // Tüm paketlerden benzersiz uzmanlıkları ve şehirleri türet
  const uzmanliklar = useMemo(() => {
    const set = new Set<string>();
    tumPaketler.forEach((p) => p.klinik.uzmanlik.forEach((u) => set.add(u)));
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'tr'));
  }, [tumPaketler]);

  const sehirler = useMemo(() => {
    const set = new Set<string>();
    tumPaketler.forEach((p) => set.add(p.klinik.sehir));
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'tr'));
  }, [tumPaketler]);

  useEffect(() => { if (urlChat) setChatAcik(true); }, [urlChat]);

  function apiFetch(f: FiltreState) {
    setYukleniyor(true);
    setHata(false);
    const p = new URLSearchParams();
    if (f.uzmanlik)  p.set('uzmanlik',   f.uzmanlik);
    if (f.maxFiyat)  p.set('max_fiyat',  f.maxFiyat); // EUR cinsinden
    if (f.sehir)     p.set('sehir',      f.sehir);
    if (f.ucusDahil) p.set('ucus_dahil', 'true');
    if (f.otelDahil) p.set('otel_dahil', 'true');
    if (f.akredite)  p.set('akredite',   'true');
    if (f.minPuan)   p.set('min_puan',   f.minPuan);
    fetch(`/api/packages${p.size ? '?' + p.toString() : ''}`)
      .then((r) => r.json())
      .then((json: { success: boolean; data: Paket[] }) => {
        if (json.success) setPaketler(json.data);
        else setHata(true);
      })
      .catch(() => setHata(true))
      .finally(() => setYukleniyor(false));
  }

  // URL değişince state + fetch güncelle
  useEffect(() => {
    const f = urldenFiltre();
    setFiltreler(f);
    apiFetch(f);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()]);

  function urlGuncelle(f: FiltreState, chat = chatAcik) {
    const p = new URLSearchParams();
    if (f.uzmanlik)  p.set('uzmanlik',   f.uzmanlik);
    if (f.maxFiyat)  p.set('max_fiyat',  f.maxFiyat);
    if (f.sehir)     p.set('sehir',      f.sehir);
    if (f.ucusDahil) p.set('ucus_dahil', 'true');
    if (f.otelDahil) p.set('otel_dahil', 'true');
    if (f.akredite)  p.set('akredite',   'true');
    if (f.minPuan)   p.set('min_puan',   f.minPuan);
    if (chat)        p.set('chat',        'true');
    router.replace(`/packages${p.size ? '?' + p.toString() : ''}`, { scroll: false });
  }

  function uzmanlikSec(u: string) {
    const yeni = { ...BOSH_FILTRE, uzmanlik: u };
    urlGuncelle(yeni);
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <ChatEkrani isOpen={chatAcik} onClose={() => setChatAcik(false)} />

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
        <FiltrePanel
          filtreler={filtreler}
          yukleniyor={yukleniyor}
          uzmanliklar={uzmanliklar}
          sehirler={sehirler}
          onChange={urlGuncelle}
        />

        {yukleniyor && (
          <div className="flex justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-[#0f3460] border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-400 text-sm">Yükleniyor...</p>
            </div>
          </div>
        )}

        {!yukleniyor && hata && (
          <div className="text-center py-20">
            <p className="text-red-500 font-medium">Paketler yüklenemedi</p>
            <p className="text-gray-400 text-sm mt-1">Lütfen sayfayı yenileyin</p>
          </div>
        )}

        {!yukleniyor && !hata && paketler.length === 0 && (
          <div className="text-center py-20">
            <p className="text-3xl mb-3">🔍</p>
            <p className="text-gray-600 font-medium">Bu kriterlere uygun paket bulunamadı</p>
            <p className="text-gray-400 text-sm mt-1">
              Filtreleri değiştirmeyi ya da AI öneri aracını denemeyi deneyin
            </p>
          </div>
        )}

        {!yukleniyor && !hata && paketler.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paketler.map((paket) => (
              <PaketKarti
                key={paket.id}
                paket={paket}
                onUzmanlikSec={uzmanlikSec}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

// ─── Sayfa ────────────────────────────────────────────────────────────────────

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
