'use client';

import { useState, useEffect } from 'react';
import Footer from '@/components/ui/Footer';
import { useDilContext } from '@/lib/DilContext';
import { useDoviz } from '@/lib/DovizContext';
import { useCartStore } from '@/lib/cartStore';
import { useKullaniciContext } from '@/lib/KullaniciContext';

type Hotel = {
  id: number;
  name: string;
  city: string;
  stars: number;
  price_per_night: number;
  amenities_tr: string[];
  amenities_en: string[];
  image: string;
  description_tr: string;
  description_en: string;
};

type SortKey = 'recommended' | 'price_asc' | 'price_desc' | 'stars';

const CITIES = ['Antalya', 'İstanbul', 'İzmir'];

function StarRow({ n, size = 11 }: { n: number; size?: number }) {
  return (
    <>
      {Array.from({ length: n }).map((_, i) => (
        <svg key={i} className="text-amber-400" width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
          <path d="m12 2 3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z"/>
        </svg>
      ))}
    </>
  );
}

export default function HotelsPage() {
  const { dil } = useDilContext();
  const tr = dil === 'tr';
  const { addItem } = useCartStore();
  const { formatla } = useDoviz();
  const { isKlinikYoneticisi } = useKullaniciContext();

  const [hotels, setHotels]       = useState<Hotel[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [city, setCity]           = useState('Antalya');
  const [stars, setStars]         = useState(0);
  const [maxPrice, setMaxPrice]   = useState(700);
  const [sortKey, setSortKey]     = useState<SortKey>('recommended');
  const [nights, setNights]       = useState<Record<number, number>>({});
  const [added, setAdded]         = useState<number[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);

  useEffect(() => {
    fetch('/api/oteller')
      .then(r => r.json())
      .then(json => { if (json.success) setHotels(json.data as Hotel[]); })
      .finally(() => setYukleniyor(false));
  }, []);

  function getNights(id: number) { return nights[id] || 1; }

  function addHotel(h: Hotel) {
    const n = getNights(h.id);
    addItem({
      id: `hotel-${h.id}`,
      type: 'hotel',
      name: h.name,
      detail: `${h.city} · ${h.stars}★ · ${n} ${tr ? 'gece' : 'nights'} · ${formatla(h.price_per_night)}/${tr ? 'gece' : 'night'}`,
      unitPrice: h.price_per_night * n,
      quantity: 1,
    });
    setAdded(prev => [...prev, h.id]);
    setTimeout(() => setAdded(prev => prev.filter(id => id !== h.id)), 2000);
  }

  function toggleFav(id: number) {
    setFavorites(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  const priceSliderPct = ((maxPrice - 100) / (1500 - 100)) * 100;

  let filtered = hotels.filter(h => {
    if (h.city !== city) return false;
    if (stars > 0 && h.stars < stars) return false;
    if (h.price_per_night > maxPrice) return false;
    return true;
  });

  if (sortKey === 'price_asc')  filtered = [...filtered].sort((a, b) => a.price_per_night - b.price_per_night);
  if (sortKey === 'price_desc') filtered = [...filtered].sort((a, b) => b.price_per_night - a.price_per_night);
  if (sortKey === 'stars')      filtered = [...filtered].sort((a, b) => b.stars - a.stars);

  return (
    <main className="min-h-screen" style={{ fontFamily: 'var(--font-manrope), system-ui, sans-serif', background: '#f8fafc' }}>
      <style>{`
        .hotel-card { position: relative; }
        .hotel-card::before {
          content: ""; position: absolute; inset: -1px; border-radius: 1.25rem;
          background: linear-gradient(120deg, transparent 30%, rgba(217,119,6,0.55), rgba(8,145,178,0.55), transparent 70%);
          background-size: 200% 100%; background-position: 100% 0;
          opacity: 0; transition: opacity .5s ease, background-position 1.2s ease; z-index: 0; pointer-events: none;
        }
        .hotel-card:hover::before { opacity: 1; background-position: 0 0; }
        .hotel-card > * { position: relative; z-index: 1; }
        .htl-slider { -webkit-appearance: none; appearance: none; background: transparent; flex: 1; }
        .htl-slider::-webkit-slider-runnable-track {
          height: 6px; border-radius: 9999px;
          background: linear-gradient(90deg, #d97706 var(--p, 40%), #e2e8f0 var(--p, 40%));
        }
        .htl-slider::-webkit-slider-thumb {
          -webkit-appearance: none; height: 18px; width: 18px; border-radius: 9999px;
          background: #0f172a; border: 2px solid #d97706; margin-top: -6px;
          box-shadow: 0 2px 6px rgba(15,23,42,.2); cursor: pointer;
        }
        .htl-slider::-moz-range-track { height: 6px; border-radius: 9999px; background: #e2e8f0; }
        .htl-slider::-moz-range-thumb {
          height: 18px; width: 18px; border-radius: 9999px;
          background: #0f172a; border: 2px solid #d97706; cursor: pointer;
        }
      `}</style>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden pb-20 md:pb-24"
        style={{ background: 'radial-gradient(ellipse at top right, rgba(8,145,178,0.35), transparent 55%), radial-gradient(ellipse at bottom left, rgba(217,119,6,0.18), transparent 50%), linear-gradient(180deg,#0a1124 0%,#0f172a 60%,#0a0f1f 100%)' }}>
        {/* riviera photo */}
        <div className="absolute inset-0 opacity-25 mix-blend-luminosity"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1602002418816-5c0aeef426aa?auto=format&fit=crop&w=2400&q=80)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
        {/* Selçuklu yıldız deseni */}
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.06]">
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="seljuk-oteller" x="0" y="0" width="140" height="140" patternUnits="userSpaceOnUse">
                <g fill="none" stroke="white" strokeWidth="1">
                  <rect x="40" y="40" width="60" height="60"/>
                  <rect x="40" y="40" width="60" height="60" transform="rotate(45 70 70)"/>
                  <polygon points="70,46 90,56 100,70 90,84 70,94 50,84 40,70 50,56"/>
                </g>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#seljuk-oteller)"/>
          </svg>
        </div>

        <div className="relative mx-auto max-w-7xl px-6 pt-10 md:pt-16 lg:px-8">
          {/* breadcrumb */}
          <div className="mb-6 flex items-center gap-2 text-xs font-medium text-white/50">
            <a href="/" className="hover:text-white/80 transition">{tr ? 'Ana Sayfa' : 'Home'}</a>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            <span className="text-amber-300">{tr ? 'Konaklama' : 'Hotels'}</span>
          </div>

          <div className="max-w-3xl">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-amber-300">
              {tr ? 'Konaklama · 5★ Resort & Şehir Otelleri' : 'Accommodation · 5★ Resorts & City Hotels'}
            </p>
            <h1 style={{ fontFamily: 'var(--font-dm-serif), Georgia, serif' }}
              className="text-5xl sm:text-6xl md:text-7xl tracking-tight text-white leading-[0.95]">
              {tr ? '5 ' : '5★ '}<span className="italic" style={{ background: 'linear-gradient(90deg,#67e8f9,#fde68a,#fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {tr ? 'Yıldızlı' : 'Star'}
              </span>{tr ? ' Konaklamanızı ' : ' Hotels '}<span className="italic">{tr ? 'Seçin' : 'in Turkey'}</span>
            </h1>
            <p className="mt-5 max-w-xl text-base sm:text-lg text-white/65">
              {tr
                ? 'Tedavinizin yanında, klinik kapısına yakın en konforlu konaklama deneyimi — özenle seçilmiş resort\'lar ve şehir otelleri.'
                : 'The most comfortable stay alongside your treatment — handpicked resorts and city hotels near your clinic.'}
            </p>
          </div>
        </div>
      </section>

      {/* ── FILTER BAR (overlapping hero) ── */}
      <section className="relative -mt-12 md:-mt-14 z-10 px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-2xl bg-white p-5 sm:p-6 shadow-[0_30px_50px_-20px_rgba(15,23,42,0.25)] ring-1 ring-slate-200/70">

          {/* Şehir pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-2 hidden sm:inline text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">{tr ? 'Şehir' : 'City'}</span>
            {CITIES.map(c => (
              <button key={c} onClick={() => setCity(c)}
                className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                  city === c
                    ? 'bg-[#0f172a] text-white ring-1 ring-[#0f172a]/10'
                    : 'bg-white border border-slate-200 text-slate-700 hover:border-cyan-400 hover:text-cyan-500'
                }`}>
                {c === city && (
                  <svg className="inline -mt-0.5 mr-1" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                )}
                {c}
              </button>
            ))}
          </div>

          <div className="my-5 h-px w-full bg-slate-100" />

          {/* Yıldız + fiyat + sıralama */}
          <div className="flex flex-col lg:flex-row lg:items-center gap-5">
            {/* Yıldız pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">{tr ? 'Yıldız' : 'Stars'}</span>
              {[{ val: 0, label: tr ? 'Tümü' : 'All' }, { val: 5 }, { val: 4 }].map(({ val, label }) => (
                <button key={val} onClick={() => setStars(val)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition inline-flex items-center gap-0.5 ${
                    stars === val
                      ? 'bg-[#0f172a] text-white'
                      : 'bg-white border border-slate-200 text-slate-700 hover:border-cyan-400 hover:text-cyan-500'
                  }`}>
                  {val === 0 ? label : <StarRow n={val} size={12} />}
                </button>
              ))}
            </div>

            <div className="hidden lg:block h-8 w-px bg-slate-200" />

            {/* Fiyat slider */}
            <div className="flex-1 flex items-center gap-4">
              <div className="flex items-center gap-2 whitespace-nowrap">
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">{tr ? 'Maks. Fiyat' : 'Max Price'}</span>
                <span style={{ fontFamily: 'var(--font-dm-serif), Georgia, serif' }} className="text-xl text-[#0f172a]">{formatla(maxPrice)}</span>
                <span className="text-xs text-slate-400">/ {tr ? 'gece' : 'night'}</span>
              </div>
              <input
                type="range" min="100" max="1500" step="10"
                value={maxPrice}
                onChange={e => setMaxPrice(Number(e.target.value))}
                className="htl-slider"
                style={{ '--p': `${priceSliderPct}%` } as React.CSSProperties}
              />
            </div>

            {/* Sonuç sayısı */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-slate-500">{filtered.length} {tr ? 'sonuç' : 'results'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── RESULTS HEADER ── */}
      <section style={{ background: 'radial-gradient(ellipse at top right, rgba(8,145,178,0.08), transparent 60%), radial-gradient(ellipse at bottom left, rgba(217,119,6,0.05), transparent 55%)' }}>
        <div className="mx-auto max-w-7xl px-6 pt-14 lg:px-8">
          <div className="flex items-end justify-between gap-4 mb-8">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-500">{tr ? 'Konaklama' : 'Hotels'}</p>
              <h2 style={{ fontFamily: 'var(--font-dm-serif), Georgia, serif' }} className="text-3xl sm:text-4xl tracking-tight text-[#0f172a] mt-1">
                {city} · <span className="italic">{tr ? 'size özel oteller' : 'hotels for you'}</span>
              </h2>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <label className="hidden sm:block text-xs font-semibold uppercase tracking-wider text-slate-500">{tr ? 'Sırala' : 'Sort'}</label>
              <div className="relative">
                <select value={sortKey} onChange={e => setSortKey(e.target.value as SortKey)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 pr-9 text-sm font-semibold text-[#0f172a] appearance-none focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400">
                  <option value="recommended">{tr ? 'Önerilenler' : 'Recommended'}</option>
                  <option value="price_asc">{tr ? 'Fiyat: düşükten yükseğe' : 'Price: low to high'}</option>
                  <option value="price_desc">{tr ? 'Fiyat: yüksekten düşüğe' : 'Price: high to low'}</option>
                  <option value="stars">{tr ? 'Puana göre' : 'By rating'}</option>
                </select>
                <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOTEL GRID ── */}
      <section className="relative mx-auto max-w-7xl px-6 pb-24 lg:px-8">

        {yukleniyor && (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-[#0f172a] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!yukleniyor && filtered.length === 0 && (
          <div className="text-center py-16">
            <div style={{ fontFamily: 'var(--font-dm-serif), Georgia, serif' }} className="text-2xl text-[#0f172a] mb-2">
              {tr ? 'Sonuç bulunamadı' : 'No results found'}
            </div>
            <div className="text-sm text-slate-500">{tr ? 'Fiyat üst sınırını yükseltmeyi veya yıldız filtresini değiştirmeyi deneyin.' : 'Try raising the max price or changing the stars filter.'}</div>
          </div>
        )}

        {!yukleniyor && filtered.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map(h => {
              const isAdded  = added.includes(h.id);
              const isFav    = favorites.includes(h.id);
              const n        = getNights(h.id);
              const amenities = (tr ? h.amenities_tr : h.amenities_en) || [];

              return (
                <div key={h.id} className="hotel-card group block rounded-2xl">
                  <article className="relative overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm transition-shadow duration-300 hover:shadow-xl">

                    {/* Görsel */}
                    <div className="relative h-52 overflow-hidden">
                      <img src={h.image} alt={h.name} loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"/>
                      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(15,23,42,0.85) 0%, rgba(15,23,42,0.3) 50%, rgba(15,23,42,0.1) 100%)' }}/>

                      {/* Yıldız pill + badge */}
                      <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5">
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-500 px-2 py-1 ring-1 ring-amber-300/50 shadow-lg shadow-amber-500/30">
                          <StarRow n={h.stars} size={11} />
                        </span>
                        {amenities[0] && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-cyan-600 ring-1 ring-cyan-200/50 backdrop-blur">
                            {amenities[0]}
                          </span>
                        )}
                      </div>

                      {/* Favori butonu */}
                      <button
                        onClick={() => toggleFav(h.id)}
                        aria-label={tr ? 'Favori' : 'Favourite'}
                        className={`absolute top-3 right-3 grid h-8 w-8 place-items-center rounded-full bg-white/15 backdrop-blur ring-1 ring-white/25 hover:bg-white/25 transition ${isFav ? 'text-amber-400' : 'text-white'}`}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill={isFav ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/>
                        </svg>
                      </button>

                      {/* Şehir + otel adı */}
                      <div className="absolute bottom-3 left-4 right-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-300 mb-1">{h.city}</p>
                        <h3 style={{ fontFamily: 'var(--font-dm-serif), Georgia, serif' }} className="text-2xl text-white leading-tight drop-shadow">{h.name}</h3>
                      </div>
                    </div>

                    {/* İçerik */}
                    <div className="p-5">
                      <p className="text-sm text-slate-500">{tr ? h.description_tr : h.description_en}</p>

                      {/* Olanaklar / Tags */}
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {amenities.slice(0, 4).map(a => (
                          <span key={a} className="inline-flex items-center rounded-full bg-cyan-50 px-2.5 py-0.5 text-[11px] font-medium text-cyan-600 ring-1 ring-cyan-100">
                            {a}
                          </span>
                        ))}
                      </div>

                      {/* Fiyat + gece + sepet */}
                      <div className="mt-5 flex items-end justify-between border-t border-slate-100 pt-4">
                        <div>
                          <div className="text-[10px] uppercase tracking-wider text-slate-500">{tr ? 'Gecelik' : 'Per night'}</div>
                          <div style={{ fontFamily: 'var(--font-dm-serif), Georgia, serif' }} className="text-3xl text-[#0f172a] leading-none">
                            {formatla(h.price_per_night)}
                            <span className="ml-1 text-xs font-sans font-medium text-slate-400">/{tr ? 'gece' : 'night'}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {/* Gece sayısı seçici */}
                          <div className="inline-flex items-center rounded-full ring-1 ring-slate-200 bg-white">
                            <button
                              onClick={() => setNights(prev => ({ ...prev, [h.id]: Math.max(1, (prev[h.id] || 1) - 1) }))}
                              className="grid h-8 w-8 place-items-center text-slate-500 hover:text-[#0f172a]">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/></svg>
                            </button>
                            <span className="min-w-6 text-center text-sm font-bold text-[#0f172a]">{n}</span>
                            <button
                              onClick={() => setNights(prev => ({ ...prev, [h.id]: (prev[h.id] || 1) + 1 }))}
                              className="grid h-8 w-8 place-items-center text-slate-500 hover:text-[#0f172a]">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
                            </button>
                          </div>

                          {/* Sepete Ekle */}
                          {!isKlinikYoneticisi && (
                            <button onClick={() => addHotel(h)}
                              className={`inline-flex items-center gap-1 rounded-full px-3.5 py-2 text-xs font-bold transition ${
                                isAdded
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-[#0f172a] text-white hover:bg-[#0f172a]/85'
                              }`}>
                              {isAdded ? (
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                              ) : (
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
                              )}
                              {isAdded ? (tr ? 'Eklendi' : 'Added') : (tr ? 'Ekle' : 'Add')}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                </div>
              );
            })}
          </div>
        )}
      </section>
      <Footer />
    </main>
  );
}
