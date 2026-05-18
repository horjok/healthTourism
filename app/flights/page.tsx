'use client';

import { useState, useMemo } from 'react';
import { useDilContext } from '@/lib/DilContext';
import { useCartStore } from '@/lib/cartStore';
import { useKullaniciContext } from '@/lib/KullaniciContext';
import flights from '@/data/flights.json';

type Flight = {
  id: number; airline: string; from: string; from_code: string;
  to: string; to_code: string; duration: string;
  price: number; direct: boolean; color: string;
};

const DESTINATIONS = ['İstanbul', 'Antalya', 'İzmir'];
const AIRLINES = ['Tümü', 'Turkish Airlines', 'EasyJet', 'British Airways', 'Emirates', 'KLM', 'Lufthansa', 'Air France', 'Pegasus'];

export default function FlightsPage() {
  const { dil } = useDilContext();
  const tr = dil === 'tr';
  const { addItem } = useCartStore();
  const { isKlinikYoneticisi } = useKullaniciContext();

  const [destination, setDestination] = useState('');
  const [airline, setAirline] = useState('Tümü');
  const [directOnly, setDirectOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [sort, setSort] = useState<'price' | 'duration'>('price');
  const [added, setAdded] = useState<number[]>([]);

  function addFlight(f: Flight) {
    addItem({
      id: `flight-${f.id}`,
      type: 'flight',
      name: `${f.airline} — ${f.from_code} → ${f.to_code}`,
      detail: `${f.from} → ${f.to} · ${f.duration} · ${f.direct ? (tr ? 'Direkt' : 'Direct') : (tr ? 'Aktarmalı' : 'Connecting')}`,
      unitPrice: f.price,
      quantity: 1,
    });
    setAdded(prev => [...prev, f.id]);
    setTimeout(() => setAdded(prev => prev.filter(id => id !== f.id)), 2000);
  }

  const filtered = useMemo(() => {
    let list = flights as Flight[];
    if (destination) list = list.filter(f => f.to === destination);
    if (airline !== 'Tümü') list = list.filter(f => f.airline === airline);
    if (directOnly) list = list.filter(f => f.direct);
    list = list.filter(f => f.price <= maxPrice);
    if (sort === 'price') list = [...list].sort((a, b) => a.price - b.price);
    return list;
  }, [destination, airline, directOnly, maxPrice, sort]);

  return (
    <main className="min-h-screen" style={{ background: '#FDFBF7' }}>

      {/* HEADER */}
      <section className="relative overflow-hidden px-6 py-20 text-center"
        style={{ background: 'linear-gradient(135deg, #0D1E25 0%, #060f13 100%)' }}>
        <div className="absolute inset-0 opacity-15 mix-blend-luminosity"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.05]">
          <svg className="h-full w-full"><defs><pattern id="seljuk-flights" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
            <g fill="none" stroke="white" strokeWidth="1">
              <rect x="25" y="25" width="50" height="50"/>
              <rect x="25" y="25" width="50" height="50" transform="rotate(45 50 50)"/>
            </g>
          </pattern></defs><rect width="100%" height="100%" fill="url(#seljuk-flights)"/></svg>
        </div>
        <div className="pointer-events-none absolute -top-20 -right-20 w-80 h-80 rounded-full blur-3xl" style={{ background: 'rgba(0,210,211,0.12)' }} />
        <div className="pointer-events-none absolute -bottom-20 -left-20 w-80 h-80 rounded-full blur-3xl" style={{ background: 'rgba(255,71,87,0.08)' }} />
        <div className="relative">
          <p className="text-[11px] font-bold uppercase tracking-widest mb-4" style={{ color: '#00D2D3' }}>
            {tr ? 'Uçuş Ara' : 'Find Flights'}
          </p>
          <h1 className="font-serif text-4xl md:text-6xl font-bold text-white mb-4">
            {tr ? "Türkiye'ye Uçuşlar" : 'Flights to Turkey'}
          </h1>
          <p className="text-lg max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.6)' }}>
            {tr ? "İstanbul, Antalya ve İzmir'e en uygun uçuşları bulun" : 'Find the best flights to Istanbul, Antalya and İzmir'}
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">

          {/* FİLTRELER */}
          <aside className="rounded-3xl p-6 h-fit sticky top-24 space-y-6"
            style={{ background: '#FDFBF7', border: '1px solid #e8e0d0' }}>
            <h2 className="font-serif text-xl" style={{ color: '#0D1E25' }}>
              {tr ? 'Filtrele' : 'Filter'}
            </h2>

            {/* Varış noktası */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: '#8aa0ad' }}>
                {tr ? 'Varış Noktası' : 'Destination'}
              </label>
              <div className="space-y-2">
                <button onClick={() => setDestination('')}
                  className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                  style={{ background: destination === '' ? '#0D1E25' : 'transparent', color: destination === '' ? '#00D2D3' : '#3d5562', border: destination === '' ? '1px solid #0D1E25' : '1px solid #e8e0d0' }}>
                  {tr ? 'Tümü' : 'All'}
                </button>
                {DESTINATIONS.map(d => (
                  <button key={d} onClick={() => setDestination(d)}
                    className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                    style={{ background: destination === d ? '#0D1E25' : 'transparent', color: destination === d ? '#00D2D3' : '#3d5562', border: destination === d ? '1px solid #0D1E25' : '1px solid #e8e0d0' }}>
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Havayolu */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: '#8aa0ad' }}>
                {tr ? 'Havayolu' : 'Airline'}
              </label>
              <select value={airline} onChange={e => setAirline(e.target.value)}
                className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                style={{ border: '1px solid #e8e0d0', background: '#FDFBF7', color: '#0D1E25' }}>
                {AIRLINES.map(a => (
                  <option key={a} value={a}>{a === 'Tümü' ? (tr ? 'Tüm Havayolları' : 'All Airlines') : a}</option>
                ))}
              </select>
            </div>

            {/* Maks fiyat */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: '#8aa0ad' }}>
                {tr ? `Maks. Fiyat: $${maxPrice}` : `Max. Price: $${maxPrice}`}
              </label>
              <input type="range" min="100" max="1000" step="50"
                value={maxPrice} onChange={e => setMaxPrice(Number(e.target.value))}
                className="w-full" style={{ accentColor: '#FF4757' }} />
              <div className="flex justify-between text-xs mt-1" style={{ color: '#8aa0ad' }}>
                <span>$100</span><span>$1000</span>
              </div>
            </div>

            {/* Direkt uçuş */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={directOnly} onChange={e => setDirectOnly(e.target.checked)}
                style={{ accentColor: '#00D2D3', width: '16px', height: '16px' }} />
              <span className="text-sm font-medium" style={{ color: '#3d5562' }}>
                {tr ? 'Sadece direkt uçuşlar' : 'Direct flights only'}
              </span>
            </label>

            {/* Sıralama */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: '#8aa0ad' }}>
                {tr ? 'Sırala' : 'Sort'}
              </label>
              <div className="flex gap-2">
                {(['price', 'duration'] as const).map(s => (
                  <button key={s} onClick={() => setSort(s)}
                    className="flex-1 py-2 rounded-xl text-xs font-bold transition-all"
                    style={{ background: sort === s ? '#0D1E25' : 'transparent', color: sort === s ? '#00D2D3' : '#3d5562', border: sort === s ? '1px solid #0D1E25' : '1px solid #e8e0d0' }}>
                    {s === 'price' ? (tr ? 'En Ucuz' : 'Cheapest') : (tr ? 'En Hızlı' : 'Fastest')}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* UÇUŞ LİSTESİ */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm" style={{ color: '#8aa0ad' }}>
                <span className="font-bold" style={{ color: '#0D1E25' }}>{filtered.length}</span>{' '}
                {tr ? 'uçuş bulundu' : 'flights found'}
              </p>
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-20 rounded-3xl" style={{ border: '1px solid #e8e0d0' }}>
                <div className="text-5xl mb-4">✈️</div>
                <p className="font-serif text-xl mb-2" style={{ color: '#0D1E25' }}>{tr ? 'Uçuş bulunamadı' : 'No flights found'}</p>
                <p className="text-sm" style={{ color: '#8aa0ad' }}>{tr ? 'Filtreleri değiştirmeyi deneyin' : 'Try changing the filters'}</p>
              </div>
            )}

            <div className="space-y-4">
              {filtered.map(f => {
                const isAdded = added.includes(f.id);
                return (
                  <div key={f.id} className="rounded-2xl p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg"
                    style={{ background: '#FDFBF7', border: '1px solid #e8e0d0' }}>
                    <div className="flex items-center justify-between gap-4">

                      {/* Havayolu */}
                      <div className="flex items-center gap-3 w-40 shrink-0">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-black shrink-0"
                          style={{ background: f.color }}>
                          {f.airline.split(' ').map((w: string) => w[0]).join('').slice(0, 2)}
                        </div>
                        <span className="text-xs font-semibold leading-tight" style={{ color: '#3d5562' }}>{f.airline}</span>
                      </div>

                      {/* Rota */}
                      <div className="flex-1 flex items-center justify-center gap-3">
                        <div className="text-center">
                          <div className="text-lg font-extrabold" style={{ color: '#0D1E25' }}>{f.from_code}</div>
                          <div className="text-xs max-w-[80px] truncate" style={{ color: '#8aa0ad' }}>{f.from}</div>
                        </div>
                        <div className="flex flex-col items-center gap-1 flex-1">
                          <div className="text-xs" style={{ color: '#8aa0ad' }}>{f.duration}</div>
                          <div className="flex items-center gap-1 w-full">
                            <div className="h-px flex-1" style={{ background: '#e8e0d0' }} />
                            <span style={{ color: '#8aa0ad' }}>✈</span>
                            <div className="h-px flex-1" style={{ background: '#e8e0d0' }} />
                          </div>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                            style={{
                              background: f.direct ? 'rgba(0,210,211,0.1)' : 'rgba(255,71,87,0.08)',
                              color: f.direct ? '#00D2D3' : '#FF4757',
                              border: f.direct ? '1px solid rgba(0,210,211,0.2)' : '1px solid rgba(255,71,87,0.15)',
                            }}>
                            {f.direct ? (tr ? 'Direkt' : 'Direct') : (tr ? 'Aktarmalı' : 'Connecting')}
                          </span>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-extrabold" style={{ color: '#0D1E25' }}>{f.to_code}</div>
                          <div className="text-xs" style={{ color: '#8aa0ad' }}>{f.to}</div>
                        </div>
                      </div>

                      {/* Fiyat + buton */}
                      <div className="text-right shrink-0">
                        <div className="font-serif text-2xl font-bold" style={{ color: '#FF4757' }}>${f.price}</div>
                        <div className="text-xs mb-2" style={{ color: '#8aa0ad' }}>{tr ? 'kişi başı' : 'per person'}</div>
                        {!isKlinikYoneticisi && (
                          <button onClick={() => addFlight(f)}
                            className="px-4 py-2 text-xs font-bold rounded-xl text-white transition-all hover:scale-105"
                            style={{
                              background: isAdded ? '#22c55e' : '#FF4757',
                              boxShadow: isAdded ? 'none' : '0 0 12px rgba(255,71,87,0.3)',
                            }}
                            onMouseEnter={e => { if (!isAdded) (e.currentTarget.style.background = '#e63950'); }}
                            onMouseLeave={e => { if (!isAdded) (e.currentTarget.style.background = '#FF4757'); }}>
                            {isAdded ? '✓ ' + (tr ? 'Eklendi' : 'Added') : (tr ? 'Sepete Ekle' : 'Add to Cart')}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}