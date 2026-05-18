'use client';

import { useEffect, useState, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Paket } from '@/lib/types';
import { useDoviz } from '@/lib/DovizContext';
import { useCartStore } from '@/lib/cartStore';
import { useChatContext } from '@/components/ui/ChatProvider';
import { useDilContext } from '@/lib/DilContext';
import { paketBaslikCevir } from '@/lib/translations';
import { useKullaniciContext } from '@/lib/KullaniciContext';

const UZMANLIK_EN: Record<string, string> = {
  'Ortopedi': 'Orthopedics', 'diş': 'Dentistry', 'göz': 'Ophthalmology',
  'estetik cerrahi': 'Aesthetic Surgery', 'kardiyoloji': 'Cardiology',
  'nöroloji': 'Neurology', 'dermatoloji': 'Dermatology',
  'saç ekimi': 'Hair Transplant', 'onkoloji': 'Oncology', 'psikiyatri': 'Psychiatry',
};

interface FiltreState {
  uzmanlik: string; maxFiyat: string; sehir: string;
  ucusDahil: boolean; otelDahil: boolean; akredite: boolean; minPuan: string;
}

const BOSH_FILTRE: FiltreState = {
  uzmanlik: '', maxFiyat: '', sehir: '',
  ucusDahil: false, otelDahil: false, akredite: false, minPuan: '',
};

// ─── Paket Kartı ──────────────────────────────────────────────────────────────
function PaketKarti({ paket, onUzmanlikSec }: { paket: Paket; onUzmanlikSec: (u: string) => void }) {
  const { formatla } = useDoviz();
  const { addItem, items, incrementQuantity, decrementQuantity, removeItem } = useCartStore();
  const { dil } = useDilContext();
  const { isKlinikYoneticisi } = useKullaniciContext();
  const tr = dil === 'tr';
  const sepetItem = items.find(i => i.id === paket.id);
  const adet = sepetItem?.quantity ?? 0;

  function sepeteEkle() {
    addItem({
      id: paket.id, type: 'package',
      name: paket.baslik,
      detail: `${paket.sure_gun} ${tr ? 'gün' : 'days'} · ${paket.klinik.isim} · ${paket.klinik.sehir}`,
      unitPrice: paket.toplam_fiyat, quantity: 1,
    });
  }

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
      style={{ background: '#FDFBF7', border: '1px solid #e8e0d0' }}>

      {/* Üst renkli şerit */}
      <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #0D1E25, #00D2D3)' }} />

      <div className="p-5 flex-1">
        <div className="flex items-start justify-between mb-3 gap-2">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: '#00D2D3' }}>
              {paket.klinik.sehir}
            </p>
            <h3 className="font-serif text-xl leading-tight text-[#0D1E25]">
              {paketBaslikCevir(paket.baslik, dil)}
            </h3>
          </div>
          <div className="flex flex-col gap-1 shrink-0">
            {paket.klinik.akredite && (
              <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold text-[#0D1E25]"
                style={{ background: '#00D2D3', boxShadow: '0 0 8px rgba(0,210,211,0.4)' }}>
                ★ JCI
              </span>
            )}
            {paket.ucus_dahil && (
              <span className="rounded-full px-2.5 py-1 text-[10px] font-bold text-white"
                style={{ background: '#0D1E25' }}>
                ✈ {tr ? 'Uçuş' : 'Flight'}
              </span>
            )}
            {paket.otel_dahil && (
              <span className="rounded-full px-2.5 py-1 text-[10px] font-bold text-white"
                style={{ background: '#162d38' }}>
                🏨 {tr ? 'Otel' : 'Hotel'}
              </span>
            )}
          </div>
        </div>

        <p className="text-sm mb-3" style={{ color: '#8aa0ad' }}>{paket.klinik.isim}</p>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {paket.klinik.uzmanlik.map(u => (
            <button key={u} type="button" onClick={() => onUzmanlikSec(u)}
              className="text-xs font-medium px-2.5 py-0.5 rounded-full transition-all hover:scale-105"
              style={{ background: 'rgba(0,210,211,0.1)', color: '#00D2D3', border: '1px solid rgba(0,210,211,0.2)' }}>
              {tr ? u : (UZMANLIK_EN[u] ?? u)}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 text-sm" style={{ color: '#8aa0ad' }}>
          <span>🗓 {paket.sure_gun} {tr ? 'gün' : 'days'}</span>
          <span>⭐ {paket.klinik.puan}</span>
        </div>
      </div>

      <div className="px-5 py-4 flex items-center justify-between gap-3"
        style={{ borderTop: '1px solid #e8e0d0' }}>
        <div>
          <span className="font-serif text-2xl font-bold" style={{ color: '#FF4757' }}>
            {formatla(paket.toplam_fiyat)}
          </span>
          <span className="text-xs ml-1" style={{ color: '#8aa0ad' }}>/ {tr ? 'kişi' : 'person'}</span>
        </div>
        <div className="flex gap-2 shrink-0">
          <Link href={`/packages/${paket.id}`}
            className="px-3 py-2 text-sm font-semibold rounded-xl transition-colors"
            style={{ border: '1px solid #e8e0d0', color: '#3d5562' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = '#00D2D3')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = '#e8e0d0')}>
            {tr ? 'İncele' : 'View'}
          </Link>
          {!isKlinikYoneticisi && (
            adet === 0 ? (
              <button type="button" onClick={sepeteEkle}
                className="px-3 py-2 text-sm font-bold rounded-xl text-white transition-all hover:scale-105"
                style={{ background: '#FF4757', boxShadow: '0 0 12px rgba(255,71,87,0.3)' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#e63950')}
                onMouseLeave={e => (e.currentTarget.style.background = '#FF4757')}>
                + {tr ? 'Sepete Ekle' : 'Add'}
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <div className="flex items-center rounded-xl overflow-hidden"
                  style={{ border: '1px solid #e8e0d0', background: '#FDFBF7' }}>
                  <button type="button"
                    onClick={() => adet > 1 ? decrementQuantity(paket.id) : removeItem(paket.id)}
                    className="w-8 h-8 flex items-center justify-center transition-colors hover:bg-gray-100"
                    style={{ color: '#3d5562' }}>−</button>
                  <span className="px-2 min-w-[28px] text-center text-sm font-bold" style={{ color: '#0D1E25' }}>{adet}</span>
                  <button type="button" onClick={() => incrementQuantity(paket.id)}
                    className="w-8 h-8 flex items-center justify-center transition-colors hover:bg-gray-100"
                    style={{ color: '#3d5562' }}>+</button>
                </div>
                <button type="button" onClick={() => removeItem(paket.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl transition-colors"
                  style={{ color: '#8aa0ad' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#FF4757'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,71,87,0.08)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#8aa0ad'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                  ✕
                </button>
              </div>
            )
          )}
        </div>
      </div>
    </article>
  );
}

// ─── Filtre Paneli ────────────────────────────────────────────────────────────
function FiltrePanel({ filtreler, yukleniyor, uzmanliklar, sehirler, onChange }: {
  filtreler: FiltreState; yukleniyor: boolean;
  uzmanliklar: string[]; sehirler: string[];
  onChange: (f: FiltreState) => void;
}) {
  const { sembol, kur } = useDoviz();
  const { dil } = useDilContext();
  const tr = dil === 'tr';

  const [lokal, setLokal] = useState<FiltreState>({
    ...filtreler,
    maxFiyat: filtreler.maxFiyat ? String(Math.round(Number(filtreler.maxFiyat) * kur)) : '',
  });

  useEffect(() => {
    setLokal({ ...filtreler, maxFiyat: filtreler.maxFiyat ? String(Math.round(Number(filtreler.maxFiyat) * kur)) : '' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtreler.uzmanlik, filtreler.maxFiyat, filtreler.sehir, filtreler.ucusDahil, filtreler.otelDahil, filtreler.akredite, filtreler.minPuan, kur]);

  const set = <K extends keyof FiltreState>(k: K, v: FiltreState[K]) => setLokal(prev => ({ ...prev, [k]: v }));
  const aktifSayisi = Object.entries(lokal).filter(([, v]) => v !== '' && v !== false).length;

  function filtrele() {
    const eurMax = lokal.maxFiyat ? String(Math.round(Number(lokal.maxFiyat) / kur)) : '';
    onChange({ ...lokal, maxFiyat: eurMax });
  }

  function temizle() { setLokal(BOSH_FILTRE); onChange(BOSH_FILTRE); }

  const inputStyle = {
    width: '100%', border: '1px solid #e8e0d0', borderRadius: '12px',
    padding: '10px 14px', fontSize: '14px', background: '#FDFBF7',
    color: '#0D1E25', outline: 'none',
  };

  return (
    <div className="rounded-2xl p-5 space-y-4" style={{ background: '#FDFBF7', border: '1px solid #e8e0d0' }}>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5" style={{ color: '#8aa0ad' }}>
            {tr ? 'Uzmanlık' : 'Specialty'}
          </label>
          <select value={lokal.uzmanlik} onChange={e => set('uzmanlik', e.target.value)} style={inputStyle}>
            <option value="">{tr ? 'Tüm Uzmanlıklar' : 'All Specialties'}</option>
            {uzmanliklar.map(u => <option key={u} value={u}>{tr ? u : (UZMANLIK_EN[u] ?? u)}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5" style={{ color: '#8aa0ad' }}>
            {tr ? 'Şehir' : 'City'}
          </label>
          <select value={lokal.sehir} onChange={e => set('sehir', e.target.value)} style={inputStyle}>
            <option value="">{tr ? 'Tüm Şehirler' : 'All Cities'}</option>
            {sehirler.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5" style={{ color: '#8aa0ad' }}>
            {tr ? `Maks. Fiyat (${sembol})` : `Max. Price (${sembol})`}
          </label>
          <input type="number" style={inputStyle}
            placeholder={tr ? `ör. ${Math.round(3000 * kur).toLocaleString('tr-TR')}` : `e.g. ${Math.round(3000 * kur).toLocaleString('en-US')}`}
            value={lokal.maxFiyat} onChange={e => set('maxFiyat', e.target.value)} min={0} />
        </div>
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5" style={{ color: '#8aa0ad' }}>
            {tr ? 'Min. Puan' : 'Min. Rating'}
          </label>
          <input type="number" style={inputStyle}
            placeholder={tr ? 'ör. 4' : 'e.g. 4'}
            value={lokal.minPuan} onChange={e => set('minPuan', e.target.value)} min={0} max={5} step={0.1} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2 flex-1">
          {([
            { key: 'ucusDahil', tr: '✈ Uçuş Dahil', en: '✈ Flight Included' },
            { key: 'otelDahil', tr: '🏨 Otel Dahil', en: '🏨 Hotel Included' },
            { key: 'akredite', tr: '★ JCI Akredite', en: '★ JCI Accredited' },
          ] as { key: keyof FiltreState; tr: string; en: string }[]).map(({ key, tr: labelTr, en: labelEn }) => (
            <label key={key}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold cursor-pointer transition-all"
              style={{
                background: lokal[key] ? '#0D1E25' : 'transparent',
                color: lokal[key] ? '#00D2D3' : '#3d5562',
                border: lokal[key] ? '1px solid #0D1E25' : '1px solid #e8e0d0',
              }}>
              <input type="checkbox" checked={lokal[key] as boolean}
                onChange={e => set(key, e.target.checked as FiltreState[typeof key])} className="sr-only" />
              {dil === 'tr' ? labelTr : labelEn}
            </label>
          ))}
        </div>
        <div className="flex gap-2 shrink-0">
          {aktifSayisi > 0 && (
            <button onClick={temizle} className="text-sm px-3 py-2 rounded-xl transition-colors"
              style={{ color: '#8aa0ad' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#FF4757')}
              onMouseLeave={e => (e.currentTarget.style.color = '#8aa0ad')}>
              {tr ? `Temizle (${aktifSayisi})` : `Clear (${aktifSayisi})`}
            </button>
          )}
          <button onClick={filtrele} disabled={yukleniyor}
            className="px-6 py-2.5 text-sm font-bold rounded-xl text-white transition-all hover:scale-105 disabled:opacity-50"
            style={{ background: '#FF4757', boxShadow: '0 0 16px rgba(255,71,87,0.3)' }}
            onMouseEnter={e => !yukleniyor && (e.currentTarget.style.background = '#e63950')}
            onMouseLeave={e => (e.currentTarget.style.background = '#FF4757')}>
            {yukleniyor ? (tr ? 'Aranıyor...' : 'Searching...') : (tr ? 'Filtrele' : 'Filter')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Ana İçerik ───────────────────────────────────────────────────────────────
function PackagesInner() {
  const searchParams = useSearchParams();
  const { setChatAcik } = useChatContext();
  const router = useRouter();
  const { dil } = useDilContext();
  const tr = dil === 'tr';

  function urldenFiltre(): FiltreState {
    return {
      uzmanlik: searchParams.get('uzmanlik') ?? '',
      maxFiyat: searchParams.get('max_fiyat') ?? '',
      sehir: searchParams.get('sehir') ?? '',
      ucusDahil: searchParams.get('ucus_dahil') === 'true',
      otelDahil: searchParams.get('otel_dahil') === 'true',
      akredite: searchParams.get('akredite') === 'true',
      minPuan: searchParams.get('min_puan') ?? '',
    };
  }

  const [filtreler, setFiltreler] = useState<FiltreState>(urldenFiltre);
  const [paketler, setPaketler] = useState<Paket[]>([]);
  const [tumPaketler, setTumPaketler] = useState<Paket[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState(false);

  useEffect(() => {
    fetch('/api/packages')
      .then(r => r.json())
      .then((json: { success: boolean; data: Paket[] }) => { if (json.success) setTumPaketler(json.data); })
      .catch(() => {});
  }, []);

  const uzmanliklar = useMemo(() => {
    const set = new Set<string>();
    tumPaketler.forEach(p => p.klinik.uzmanlik.forEach(u => set.add(u)));
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'tr'));
  }, [tumPaketler]);

  const sehirler = useMemo(() => {
    const set = new Set<string>();
    tumPaketler.forEach(p => set.add(p.klinik.sehir));
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'tr'));
  }, [tumPaketler]);

  function apiFetch(f: FiltreState) {
    setYukleniyor(true); setHata(false);
    const p = new URLSearchParams();
    if (f.uzmanlik) p.set('uzmanlik', f.uzmanlik);
    if (f.maxFiyat) p.set('max_fiyat', f.maxFiyat);
    if (f.sehir) p.set('sehir', f.sehir);
    if (f.ucusDahil) p.set('ucus_dahil', 'true');
    if (f.otelDahil) p.set('otel_dahil', 'true');
    if (f.akredite) p.set('akredite', 'true');
    if (f.minPuan) p.set('min_puan', f.minPuan);
    fetch(`/api/packages${p.size ? '?' + p.toString() : ''}`)
      .then(r => r.json())
      .then((json: { success: boolean; data: Paket[] }) => {
        if (json.success) setPaketler(json.data); else setHata(true);
      })
      .catch(() => setHata(true))
      .finally(() => setYukleniyor(false));
  }

  useEffect(() => {
    const f = urldenFiltre();
    setFiltreler(f);
    apiFetch(f);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()]);

  function urlGuncelle(f: FiltreState) {
    const p = new URLSearchParams();
    if (f.uzmanlik) p.set('uzmanlik', f.uzmanlik);
    if (f.maxFiyat) p.set('max_fiyat', f.maxFiyat);
    if (f.sehir) p.set('sehir', f.sehir);
    if (f.ucusDahil) p.set('ucus_dahil', 'true');
    if (f.otelDahil) p.set('otel_dahil', 'true');
    if (f.akredite) p.set('akredite', 'true');
    if (f.minPuan) p.set('min_puan', f.minPuan);
    router.replace(`/packages${p.size ? '?' + p.toString() : ''}`, { scroll: false });
  }

  function uzmanlikSec(u: string) { urlGuncelle({ ...BOSH_FILTRE, uzmanlik: u }); }

  return (
    <main className="min-h-screen" style={{ background: '#FDFBF7' }}>

      {/* HEADER */}
      <section className="relative overflow-hidden px-6 py-16" style={{ background: 'linear-gradient(135deg, #0D1E25 0%, #060f13 100%)' }}>
        {/* Selçuklu desen */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.05]">
          <svg className="h-full w-full"><defs><pattern id="seljuk-pkg" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
            <g fill="none" stroke="white" strokeWidth="1">
              <rect x="25" y="25" width="50" height="50"/>
              <rect x="25" y="25" width="50" height="50" transform="rotate(45 50 50)"/>
            </g>
          </pattern></defs><rect width="100%" height="100%" fill="url(#seljuk-pkg)"/></svg>
        </div>
        <div className="pointer-events-none absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl" style={{ background: 'rgba(0,210,211,0.15)' }} />
        <div className="pointer-events-none absolute -bottom-20 -left-20 w-64 h-64 rounded-full blur-3xl" style={{ background: 'rgba(255,71,87,0.1)' }} />

        <div className="relative max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: '#00D2D3' }}>
              {tr ? 'Sağlık Turizmi' : 'Health Tourism'}
            </p>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-2">
              {tr ? 'Tüm Paketler' : 'All Packages'}
            </h1>
            <p className="text-sm" style={{ color: '#8aa0ad' }}>
              {yukleniyor
                ? (tr ? 'Aranıyor...' : 'Searching...')
                : tr ? `${paketler.length} paket bulundu` : `${paketler.length} packages found`}
            </p>
          </div>
          <button onClick={() => setChatAcik(true)}
            className="inline-flex items-center gap-2 px-6 py-3 font-bold rounded-xl text-white transition-all hover:scale-105 whitespace-nowrap"
            style={{ background: '#FF4757', boxShadow: '0 0 20px rgba(255,71,87,0.4)' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#e63950')}
            onMouseLeave={e => (e.currentTarget.style.background = '#FF4757')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>
            </svg>
            {tr ? 'AI ile Paket Bul' : 'Find with AI'}
          </button>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <FiltrePanel filtreler={filtreler} yukleniyor={yukleniyor}
          uzmanliklar={uzmanliklar} sehirler={sehirler} onChange={urlGuncelle} />

        {yukleniyor && (
          <div className="flex justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#00D2D3', borderTopColor: 'transparent' }} />
              <p className="text-sm" style={{ color: '#8aa0ad' }}>{tr ? 'Yükleniyor...' : 'Loading...'}</p>
            </div>
          </div>
        )}

        {!yukleniyor && hata && (
          <div className="text-center py-20 rounded-2xl" style={{ background: 'rgba(255,71,87,0.05)', border: '1px solid rgba(255,71,87,0.15)' }}>
            <p className="font-semibold" style={{ color: '#FF4757' }}>{tr ? 'Paketler yüklenemedi' : 'Failed to load packages'}</p>
          </div>
        )}

        {!yukleniyor && !hata && paketler.length === 0 && (
          <div className="text-center py-20">
            <p className="text-3xl mb-3">🔍</p>
            <p className="font-serif text-xl mb-2" style={{ color: '#0D1E25' }}>
              {tr ? 'Bu kriterlere uygun paket bulunamadı' : 'No packages found'}
            </p>
            <p className="text-sm" style={{ color: '#8aa0ad' }}>
              {tr ? 'Filtreleri değiştirmeyi ya da AI öneri aracını deneyin' : 'Try changing the filters or use AI recommendation'}
            </p>
          </div>
        )}

        {!yukleniyor && !hata && paketler.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paketler.map(paket => (
              <PaketKarti key={paket.id} paket={paket} onUzmanlikSec={uzmanlikSec} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default function PackagesPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen" style={{ background: '#FDFBF7' }}>
        <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#00D2D3', borderTopColor: 'transparent' }} />
      </div>
    }>
      <PackagesInner />
    </Suspense>
  );
}