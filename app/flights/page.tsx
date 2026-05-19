'use client';

import { useState, useEffect, useMemo } from 'react';
import Footer from '@/components/ui/Footer';
import { useDilContext } from '@/lib/DilContext';
import { useDoviz } from '@/lib/DovizContext';
import { useCartStore } from '@/lib/cartStore';
import { useKullaniciContext } from '@/lib/KullaniciContext';

type Flight = {
  id: number;
  airline: string;
  from: string;
  from_code: string;
  to: string;
  to_code: string;
  duration: string;
  price: number;
  direct: boolean;
  color: string;
  class: string;
};

const AIRLINE_META: Record<string, { from: string; to: string }> = {
  'EasyJet':          { from: '#f97316', to: '#ea580c' },
  'Pegasus':          { from: '#f59e0b', to: '#d97706' },
  'Turkish Airlines': { from: '#ef4444', to: '#b91c1c' },
  'SunExpress':       { from: '#eab308', to: '#f97316' },
  'Ryanair':          { from: '#3b82f6', to: '#0369a1' },
  'British Airways':  { from: '#1e40af', to: '#1e3a8a' },
  'Emirates':         { from: '#d97706', to: '#92400e' },
  'KLM':              { from: '#0891b2', to: '#0e7490' },
  'Lufthansa':        { from: '#f59e0b', to: '#1e40af' },
  'Air France':       { from: '#3b82f6', to: '#dc2626' },
};

const DEST_LABELS: Record<string, string> = {
  'İstanbul': 'IST/SAW',
  'Antalya':  'AYT',
  'İzmir':    'ADB',
};

function airlineInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function airlineGradient(name: string, fallback: string) {
  const m = AIRLINE_META[name];
  if (m) return `linear-gradient(135deg, ${m.from}, ${m.to})`;
  return fallback || '#0f172a';
}

export default function FlightsPage() {
  const { dil } = useDilContext();
  const tr = dil === 'tr';
  const { addItem, incrementQuantity, decrementQuantity, removeItem } = useCartStore();
  const items = useCartStore(s => s.items);
  const { formatla } = useDoviz();
  const { isKlinikYoneticisi } = useKullaniciContext();

  const [flightList, setFlightList] = useState<Flight[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [destination, setDestination] = useState('');
  const [origin, setOrigin] = useState('');
  const [airline, setAirline] = useState('');
  const [cabinClass, setCabinClass] = useState('');
  const [directOnly, setDirectOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [sort, setSort] = useState<'price' | 'duration'>('price');

  useEffect(() => {
    fetch('/api/ucuslar')
      .then(r => r.json())
      .then(json => { if (json.success) setFlightList(json.data as Flight[]); })
      .finally(() => setYukleniyor(false));
  }, []);

  const ORIGINS  = useMemo(() => Array.from(new Set(flightList.map(f => f.from))).sort(), [flightList]);
  const AIRLINES = useMemo(() => Array.from(new Set(flightList.map(f => f.airline))).sort(), [flightList]);
  const CABINS   = useMemo(() => Array.from(new Set(flightList.map(f => f.class))).sort(), [flightList]);
  const DESTINATIONS = ['İstanbul', 'Antalya', 'İzmir'];

  function addFlight(f: Flight) {
    addItem({
      id: `flight-${f.id}`,
      type: 'flight',
      name: `${f.airline} — ${f.from_code} → ${f.to_code}`,
      detail: `${f.from} → ${f.to} · ${f.duration} · ${f.direct ? (tr ? 'Direkt' : 'Direct') : (tr ? 'Aktarmalı' : 'Connecting')} · ${f.class}`,
      unitPrice: f.price,
      quantity: 1,
    });
  }

  const filtered = useMemo(() => {
    let list = flightList;
    if (destination) list = list.filter(f => f.to === destination || (destination === 'İstanbul' && (f.to_code === 'IST' || f.to_code === 'SAW')));
    if (origin)      list = list.filter(f => f.from === origin);
    if (airline)     list = list.filter(f => f.airline === airline);
    if (cabinClass)  list = list.filter(f => f.class === cabinClass);
    if (directOnly)  list = list.filter(f => f.direct);
    list = list.filter(f => f.price <= maxPrice);
    if (sort === 'price') list = [...list].sort((a, b) => a.price - b.price);
    return list;
  }, [flightList, destination, origin, airline, cabinClass, directOnly, maxPrice, sort]);

  const priceSliderPct = ((maxPrice - 100) / (1000 - 100)) * 100;

  return (
    <main className="min-h-screen" style={{ fontFamily: 'var(--font-manrope), system-ui, sans-serif', background: '#f8fafc' }}>
      <style>{`
        .flight-row { position: relative; }
        .flight-row::before {
          content: ""; position: absolute; inset: -1px; border-radius: 1.25rem;
          background: linear-gradient(120deg, transparent 30%, rgba(217,119,6,0.5), rgba(8,145,178,0.5), transparent 70%);
          background-size: 200% 100%; background-position: 100% 0;
          opacity: 0; transition: opacity .5s ease, background-position 1.2s ease; z-index: 0; pointer-events: none;
        }
        .flight-row:hover::before { opacity: 1; background-position: 0 0; }
        .flight-row > * { position: relative; z-index: 1; }
        .flight-path {
          background-image: linear-gradient(to right, #cbd5e1 50%, transparent 50%);
          background-size: 10px 1px; background-repeat: repeat-x; background-position: center;
        }
        .priceslider { -webkit-appearance: none; appearance: none; background: transparent; width: 100%; }
        .priceslider::-webkit-slider-runnable-track {
          height: 6px; border-radius: 9999px;
          background: linear-gradient(90deg, #d97706 var(--p, 100%), #e2e8f0 var(--p, 100%));
        }
        .priceslider::-webkit-slider-thumb {
          -webkit-appearance: none; height: 18px; width: 18px; border-radius: 9999px;
          background: #0f172a; border: 2px solid #d97706; margin-top: -6px;
          box-shadow: 0 2px 6px rgba(15,23,42,.2); cursor: pointer;
        }
        .priceslider::-moz-range-track { height: 6px; border-radius: 9999px; background: #e2e8f0; }
        .priceslider::-moz-range-thumb {
          height: 18px; width: 18px; border-radius: 9999px;
          background: #0f172a; border: 2px solid #d97706; cursor: pointer;
        }
        .flt-check { appearance: none; width: 18px; height: 18px; border-radius: 5px;
          border: 1.5px solid #cbd5e1; background: #fff; cursor: pointer;
          display: inline-grid; place-items: center; }
        .flt-check:checked { background: #0f172a; border-color: #0f172a; }
        .flt-check:checked::after { content: ""; width: 8px; height: 8px; background: #d97706; border-radius: 2px; }
      `}</style>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden pb-20 md:pb-24"
        style={{
          background: 'radial-gradient(ellipse at top right, rgba(8,145,178,0.35), transparent 55%), radial-gradient(ellipse at bottom left, rgba(217,119,6,0.18), transparent 50%), linear-gradient(180deg,#0a1124 0%,#0f172a 60%,#0a0f1f 100%)',
        }}>
        {/* uçak fotoğrafı */}
        <div className="absolute inset-0 opacity-25 mix-blend-luminosity"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=2400&q=80)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
        {/* Selçuklu yıldız deseni */}
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.06]">
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="seljuk-flights" x="0" y="0" width="140" height="140" patternUnits="userSpaceOnUse">
                <g fill="none" stroke="white" strokeWidth="1">
                  <rect x="40" y="40" width="60" height="60"/>
                  <rect x="40" y="40" width="60" height="60" transform="rotate(45 70 70)"/>
                  <polygon points="70,46 90,56 100,70 90,84 70,94 50,84 40,70 50,56"/>
                </g>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#seljuk-flights)"/>
          </svg>
        </div>
        {/* Kesik çizgili yay */}
        <svg aria-hidden className="pointer-events-none absolute right-0 bottom-8 hidden md:block opacity-30" width="520" height="160" viewBox="0 0 520 160" fill="none">
          <path d="M10 140 Q 260 -20 510 140" stroke="#fcd34d" strokeWidth="1.5" strokeDasharray="4 6"/>
          <circle cx="10" cy="140" r="3" fill="#0891b2"/>
          <circle cx="510" cy="140" r="3" fill="#d97706"/>
          <g transform="translate(260 30) rotate(15)">
            <path d="M0 0 L18 -4 L24 -10 L28 -10 L24 0 L28 10 L24 10 L18 4 Z" fill="#fcd34d"/>
          </g>
        </svg>

        <div className="relative mx-auto max-w-7xl px-6 pt-10 md:pt-16 lg:px-8">
          {/* breadcrumb */}
          <div className="mb-6 flex items-center gap-2 text-xs font-medium text-white/50">
            <a href="/" className="hover:text-white/80 transition">{tr ? 'Ana Sayfa' : 'Home'}</a>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            <span className="text-amber-300">{tr ? 'Uçuşlar' : 'Flights'}</span>
          </div>

          <div className="max-w-3xl">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-amber-300">
              {tr ? 'Uçuş Ara · İstanbul · Antalya · İzmir' : 'Find Flights · Istanbul · Antalya · İzmir'}
            </p>
            <h1 style={{ fontFamily: 'var(--font-dm-serif), Georgia, serif' }}
              className="text-5xl sm:text-6xl md:text-7xl tracking-tight text-white leading-[0.95]">
              {tr ? "Türkiye'ye " : 'Flights to '}
              <span className="italic" style={{ background: 'linear-gradient(90deg,#67e8f9,#fde68a,#fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {tr ? 'Uçuşlar' : 'Turkey'}
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-base sm:text-lg text-white/65">
              {tr
                ? 'Tedavinizin başlangıç noktasına en uygun fiyatlı, direkt ya da aktarmalı uçuşları tek panelde karşılaştırın.'
                : 'Compare direct and connecting flights to your treatment destination at the best prices.'}
            </p>
          </div>
        </div>
      </section>

      {/* ── QUICK SEARCH BAR ── */}
      <section className="relative -mt-12 md:-mt-14 z-10 px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-2xl bg-white p-4 sm:p-5 shadow-[0_30px_50px_-20px_rgba(15,23,42,0.25)] ring-1 ring-slate-200/70">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <label className="block">
              <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 mb-1.5">{tr ? 'Nereden' : 'From'}</span>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-500" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="10" r="3"/><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0"/></svg>
                <select value={origin} onChange={e => setOrigin(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-[#f8fafc]/50 pl-9 pr-3.5 py-2.5 text-sm font-medium text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400 appearance-none">
                  <option value="">{tr ? 'Tüm Kalkışlar' : 'All Origins'}</option>
                  {ORIGINS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </label>
            <label className="block">
              <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 mb-1.5">{tr ? 'Nereye' : 'To'}</span>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="10" r="3"/><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0"/></svg>
                <select value={destination} onChange={e => setDestination(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-[#f8fafc]/50 pl-9 pr-3.5 py-2.5 text-sm font-medium text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400 appearance-none">
                  <option value="">{tr ? 'Türkiye (tüm şehirler)' : 'Turkey (all cities)'}</option>
                  {DESTINATIONS.map(d => <option key={d} value={d}>{d} ({DEST_LABELS[d]})</option>)}
                </select>
              </div>
            </label>
            <label className="block">
              <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 mb-1.5">{tr ? 'Gidiş' : 'Depart'}</span>
              <input type="date" defaultValue="2026-06-12"
                className="w-full rounded-xl border border-slate-200 bg-[#f8fafc]/50 px-3.5 py-2.5 text-sm font-medium text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400"/>
            </label>
            <label className="block">
              <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 mb-1.5">{tr ? 'Dönüş' : 'Return'}</span>
              <input type="date" defaultValue="2026-06-19"
                className="w-full rounded-xl border border-slate-200 bg-[#f8fafc]/50 px-3.5 py-2.5 text-sm font-medium text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400"/>
            </label>
            <div className="flex items-end">
              <button className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#0f172a] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#0f172a]/90 transition">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                {tr ? 'Uçuş Ara' : 'Search'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── MAIN GRID ── */}
      <section style={{ background: 'radial-gradient(ellipse at top right, rgba(8,145,178,0.06), transparent 60%), radial-gradient(ellipse at bottom left, rgba(217,119,6,0.04), transparent 55%)' }}>
        <div className="mx-auto max-w-7xl px-6 pt-12 pb-24 lg:px-8 grid lg:grid-cols-[300px_1fr] gap-8">

          {/* ── FİLTRE SİDEBAR ── */}
          <aside className="lg:sticky lg:top-6 lg:self-start rounded-2xl bg-white p-6 ring-1 ring-slate-200/70 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 style={{ fontFamily: 'var(--font-dm-serif), Georgia, serif' }} className="text-2xl text-[#0f172a]">
                {tr ? 'Filtrele' : 'Filter'}
              </h3>
              <button
                onClick={() => { setOrigin(''); setDestination(''); setAirline(''); setCabinClass(''); setDirectOnly(false); setMaxPrice(1000); setSort('price'); }}
                className="text-[11px] font-semibold text-slate-400 hover:text-cyan-500 transition">
                {tr ? 'Sıfırla' : 'Reset'}
              </button>
            </div>

            {/* Kalkış */}
            <label className="block mb-4">
              <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 mb-1.5">{tr ? 'Kalkış Yeri' : 'Origin'}</span>
              <div className="relative">
                <select value={origin} onChange={e => setOrigin(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-[#f8fafc]/50 px-3.5 py-2.5 pr-9 text-sm font-medium text-[#0f172a] appearance-none focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400">
                  <option value="">{tr ? 'Tüm Kalkışlar' : 'All Origins'}</option>
                  {ORIGINS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
                <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </div>
            </label>

            {/* Varış noktası pills */}
            <div className="mb-4">
              <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 mb-2">{tr ? 'Varış Noktası' : 'Destination'}</span>
              <div className="flex flex-col gap-1.5">
                {[{ label: tr ? 'Tümü' : 'All', val: '' }, ...DESTINATIONS.map(d => ({ label: d, val: d }))].map(({ label, val }) => (
                  <button key={val} onClick={() => setDestination(val)}
                    className={`text-left rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
                      destination === val
                        ? 'bg-[#0f172a] text-white font-bold'
                        : 'bg-[#f8fafc]/50 border border-slate-200 text-slate-700 hover:border-cyan-400 hover:text-cyan-500'
                    }`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Havayolu */}
            <label className="block mb-4">
              <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 mb-1.5">{tr ? 'Havayolu' : 'Airline'}</span>
              <div className="relative">
                <select value={airline} onChange={e => setAirline(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-[#f8fafc]/50 px-3.5 py-2.5 pr-9 text-sm font-medium text-[#0f172a] appearance-none focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400">
                  <option value="">{tr ? 'Tüm Havayolları' : 'All Airlines'}</option>
                  {AIRLINES.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
                <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </div>
            </label>

            {/* Kabin sınıfı */}
            <label className="block mb-5">
              <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 mb-1.5">{tr ? 'Kabin Sınıfı' : 'Cabin Class'}</span>
              <div className="relative">
                <select value={cabinClass} onChange={e => setCabinClass(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-[#f8fafc]/50 px-3.5 py-2.5 pr-9 text-sm font-medium text-[#0f172a] appearance-none focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400">
                  <option value="">{tr ? 'Tüm Sınıflar' : 'All Classes'}</option>
                  {CABINS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </div>
            </label>

            {/* Maks. Fiyat slider */}
            <div className="mb-5">
              <div className="flex items-baseline justify-between mb-1.5">
                <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">{tr ? 'Maks. Fiyat' : 'Max Price'}</span>
                <span style={{ fontFamily: 'var(--font-dm-serif), Georgia, serif' }} className="text-lg text-[#0f172a]">{formatla(maxPrice)}</span>
              </div>
              <input
                type="range" min="100" max="1000" step="10"
                value={maxPrice}
                onChange={e => setMaxPrice(Number(e.target.value))}
                className="priceslider"
                style={{ '--p': `${priceSliderPct}%` } as React.CSSProperties}
              />
              <div className="mt-1 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>{formatla(100)}</span><span>{formatla(1000)}</span>
              </div>
            </div>

            {/* Direkt uçuş checkbox */}
            <label className="flex items-center gap-2.5 cursor-pointer mb-5">
              <input type="checkbox" checked={directOnly} onChange={e => setDirectOnly(e.target.checked)} className="flt-check"/>
              <span className="text-sm font-semibold text-[#0f172a]">{tr ? 'Sadece direkt uçuşlar' : 'Direct flights only'}</span>
            </label>

            {/* Sıralama */}
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 mb-2">{tr ? 'Sırala' : 'Sort'}</span>
              <div className="grid grid-cols-2 gap-2">
                {(['price', 'duration'] as const).map(s => (
                  <button key={s} onClick={() => setSort(s)}
                    className={`rounded-xl px-3 py-2.5 text-xs font-bold transition ${
                      sort === s
                        ? 'bg-[#0f172a] text-white'
                        : 'bg-[#f8fafc]/50 border border-slate-200 text-slate-700 hover:border-cyan-400 hover:text-cyan-500'
                    }`}>
                    {s === 'price' ? (tr ? 'En Ucuz' : 'Cheapest') : (tr ? 'En Hızlı' : 'Fastest')}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* ── UÇUŞ LİSTESİ ── */}
          <div>
            <div className="mb-6 flex items-end justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-500">{tr ? 'Sonuçlar' : 'Results'}</p>
                <h2 style={{ fontFamily: 'var(--font-dm-serif), Georgia, serif' }} className="text-3xl sm:text-4xl tracking-tight text-[#0f172a] mt-1">
                  {yukleniyor
                    ? <span className="text-slate-400 text-2xl font-sans font-medium">{tr ? 'Yükleniyor...' : 'Loading...'}</span>
                    : <><span>{filtered.length}</span>{' '}<span className="text-slate-400 font-sans text-2xl font-medium">{tr ? 'uçuş bulundu' : 'flights found'}</span></>
                  }
                </h2>
              </div>
            </div>

            {yukleniyor && (
              <div className="flex justify-center py-20">
                <div className="w-10 h-10 border-4 border-[#0f172a] border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {!yukleniyor && filtered.length === 0 && (
              <div className="text-center py-16 text-slate-500 rounded-2xl bg-white ring-1 ring-slate-200">
                <div style={{ fontFamily: 'var(--font-dm-serif), Georgia, serif' }} className="text-2xl text-[#0f172a] mb-2">
                  {tr ? 'Sonuç bulunamadı' : 'No results found'}
                </div>
                <div className="text-sm">{tr ? 'Fiyat üst sınırını yükseltmeyi veya filtreleri gevşetmeyi deneyin.' : 'Try raising the max price or relaxing the filters.'}</div>
              </div>
            )}

            <div className="space-y-3">
              {filtered.map(f => {
                const cartItem = items.find(i => i.id === `flight-${f.id}`);
                const grad = airlineGradient(f.airline, f.color);
                const initials = airlineInitials(f.airline);
                return (
                  <article key={f.id} className="flight-row group block rounded-2xl">
                    <div className="relative rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm hover:shadow-lg transition-shadow duration-300">
                      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] items-center gap-4 md:gap-6 p-4 md:p-5">

                        {/* Havayolu */}
                        <div className="flex items-center gap-3 md:w-44">
                          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-white font-bold text-lg ring-1 ring-white/30 shadow-sm"
                            style={{ background: grad }}>
                            {initials}
                          </span>
                          <div>
                            <div className="text-sm font-bold text-[#0f172a]">{f.airline}</div>
                            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                              {f.from_code}{f.to_code}
                            </div>
                          </div>
                        </div>

                        {/* Rota */}
                        <div className="flex items-center gap-4 md:gap-6">
                          {/* kalkış */}
                          <div className="text-left min-w-0">
                            <div className="font-mono text-2xl md:text-3xl font-bold text-[#0f172a] leading-none">{f.from_code}</div>
                            <div className="mt-1 text-xs text-slate-500 truncate">{f.from}</div>
                          </div>

                          {/* yol çizgisi */}
                          <div className="flex-1 flex flex-col items-center min-w-0">
                            <div className="text-[11px] font-semibold text-slate-500 mb-1">{f.duration}</div>
                            <div className="relative w-full h-px flex items-center">
                              <span className="absolute left-0 h-1.5 w-1.5 rounded-full bg-cyan-500"></span>
                              <span className="absolute inset-x-2 h-px flight-path"></span>
                              <span className="absolute right-0 h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                              <svg className="absolute left-1/2 -translate-x-1/2 text-amber-500" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1L15 22v-1.5L13 19v-5.5z"/>
                              </svg>
                            </div>
                            <div className="mt-2 flex items-center gap-1.5 flex-wrap justify-center">
                              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ${
                                f.direct
                                  ? 'bg-emerald-50 text-emerald-700 ring-emerald-100'
                                  : 'bg-amber-50 text-amber-700 ring-amber-100'
                              }`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${f.direct ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                                {f.direct ? (tr ? 'Direkt' : 'Direct') : (tr ? '1 Aktarma' : '1 Stop')}
                              </span>
                              <span className="inline-flex items-center rounded-full bg-cyan-50 text-cyan-600 ring-1 ring-cyan-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                                {f.class}
                              </span>
                            </div>
                          </div>

                          {/* varış */}
                          <div className="text-right min-w-0">
                            <div className="font-mono text-2xl md:text-3xl font-bold text-[#0f172a] leading-none">{f.to_code}</div>
                            <div className="mt-1 text-xs text-slate-500 truncate">{f.to}</div>
                          </div>
                        </div>

                        {/* Fiyat + sepet */}
                        <div className="md:text-right md:w-40 flex md:flex-col items-center md:items-end justify-between md:justify-center gap-2">
                          <div>
                            <div style={{ fontFamily: 'var(--font-dm-serif), Georgia, serif' }} className="text-3xl text-[#0f172a] leading-none">
                              {formatla(f.price)}
                            </div>
                            <div className="mt-1 text-[10px] uppercase tracking-wider text-slate-400">{tr ? 'kişi başı' : 'per person'}</div>
                          </div>
                          {!isKlinikYoneticisi && (cartItem ? (
                            <div className="flex flex-col items-end gap-2">
                              <div className="flex items-center gap-1 bg-slate-100 rounded-xl px-2 py-1">
                                <button onClick={() => decrementQuantity(`flight-${f.id}`)}
                                  className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-sm font-bold text-slate-600 hover:bg-slate-50">−</button>
                                <span className="text-sm font-bold text-slate-800 w-5 text-center">{cartItem.quantity}</span>
                                <button onClick={() => incrementQuantity(`flight-${f.id}`)}
                                  className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-sm font-bold text-slate-600 hover:bg-slate-50">+</button>
                              </div>
                              <button onClick={() => removeItem(`flight-${f.id}`)}
                                className="px-4 py-1.5 text-xs font-bold rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-all border border-red-200">
                                {tr ? 'Sepetten Çıkar' : 'Remove'}
                              </button>
                            </div>
                          ) : (
                            <button onClick={() => addFlight(f)}
                              className="inline-flex items-center gap-1.5 rounded-full bg-[#0f172a] px-4 py-2 text-xs font-bold text-white hover:bg-[#0f172a]/85 transition">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
                              {tr ? 'Sepete Ekle' : 'Add to Cart'}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
