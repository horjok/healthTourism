'use client';

import { useState, useMemo } from 'react';
import { useDilContext } from '@/lib/DilContext';
import { useCartStore } from '@/lib/cartStore';
import flights from '@/data/flights.json';

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
};

const DESTINATIONS = ['İstanbul', 'Antalya', 'İzmir'];
const AIRLINES = ['Tümü', 'Turkish Airlines', 'EasyJet', 'British Airways', 'Emirates', 'KLM', 'Lufthansa', 'Air France', 'Pegasus'];

export default function FlightsPage() {
  const { dil } = useDilContext();
  const tr = dil === 'tr';
  const { addItem } = useCartStore();

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
    <main className="min-h-screen bg-[#f8fafc]">

      {/* HEADER */}
      <section className="relative px-6 py-16 text-center overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0a1628 0%, #0f3460 100%)' }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div className="relative">
          <p className="text-blue-200/70 text-xs font-semibold uppercase tracking-widest mb-3">
            {tr ? 'Uçuş Ara' : 'Find Flights'}
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            {tr ? "Türkiye'ye Uçuşlar" : 'Flights to Turkey'}
          </h1>
          <p className="text-blue-100/70 text-lg">
            {tr ? "İstanbul, Antalya ve İzmir'e en uygun uçuşları bulun" : 'Find the best flights to Istanbul, Antalya and İzmir'}
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">

          {/* FİLTRELER */}
          <aside className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 h-fit sticky top-24">
            <h2 className="text-base font-bold text-gray-900 mb-6">
              {tr ? 'Filtrele' : 'Filter'}
            </h2>

            {/* Varış noktası */}
            <div className="mb-6">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                {tr ? 'Varış Noktası' : 'Destination'}
              </label>
              <div className="space-y-2">
                <button onClick={() => setDestination('')}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    destination === '' ? 'bg-[#0f3460] text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}>
                  {tr ? 'Tümü' : 'All'}
                </button>
                {DESTINATIONS.map(d => (
                  <button key={d} onClick={() => setDestination(d)}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      destination === d ? 'bg-[#0f3460] text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}>
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Havayolu */}
            <div className="mb-6">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                {tr ? 'Havayolu' : 'Airline'}
              </label>
              <select value={airline} onChange={e => setAirline(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f3460]/30 bg-white">
                {AIRLINES.map(a => (
                  <option key={a} value={a}>
                    {a === 'Tümü' ? (tr ? 'Tüm Havayolları' : 'All Airlines') : a}
                  </option>
                ))}
              </select>
            </div>

            {/* Maks fiyat */}
            <div className="mb-6">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                {tr ? `Maks. Fiyat: $${maxPrice}` : `Max. Price: $${maxPrice}`}
              </label>
              <input type="range" min="100" max="1000" step="50"
                value={maxPrice}
                onChange={e => setMaxPrice(Number(e.target.value))}
                className="w-full accent-[#0f3460]" />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>$100</span><span>$1000</span>
              </div>
            </div>

            {/* Direkt uçuş */}
            <div className="mb-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={directOnly}
                  onChange={e => setDirectOnly(e.target.checked)}
                  className="w-4 h-4 accent-[#0f3460]" />
                <span className="text-sm font-medium text-gray-700">
                  {tr ? 'Sadece direkt uçuşlar' : 'Direct flights only'}
                </span>
              </label>
            </div>

            {/* Sıralama */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                {tr ? 'Sırala' : 'Sort'}
              </label>
              <div className="flex gap-2">
                <button onClick={() => setSort('price')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                    sort === 'price' ? 'bg-[#0f3460] text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                  {tr ? 'En Ucuz' : 'Cheapest'}
                </button>
                <button onClick={() => setSort('duration')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                    sort === 'duration' ? 'bg-[#0f3460] text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                  {tr ? 'En Hızlı' : 'Fastest'}
                </button>
              </div>
            </div>
          </aside>

          {/* UÇUŞ LİSTESİ */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-500">
                <span className="font-bold text-gray-900">{filtered.length}</span>{' '}
                {tr ? 'uçuş bulundu' : 'flights found'}
              </p>
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
                <div className="text-5xl mb-4">✈️</div>
                <p className="text-gray-500 font-medium">{tr ? 'Uçuş bulunamadı' : 'No flights found'}</p>
                <p className="text-gray-400 text-sm mt-2">{tr ? 'Filtreleri değiştirmeyi deneyin' : 'Try changing the filters'}</p>
              </div>
            )}

            <div className="space-y-4">
              {filtered.map(f => {
                const isAdded = added.includes(f.id);
                return (
                  <div key={f.id}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 p-5">
                    <div className="flex items-center justify-between gap-4">

                      {/* Havayolu */}
                      <div className="flex items-center gap-3 w-40 shrink-0">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-black shrink-0"
                          style={{ background: f.color }}>
                          {f.airline.split(' ').map((w: string) => w[0]).join('').slice(0, 2)}
                        </div>
                        <span className="text-xs font-semibold text-gray-600 leading-tight">{f.airline}</span>
                      </div>

                      {/* Rota */}
                      <div className="flex-1 flex items-center justify-center gap-3">
                        <div className="text-center">
                          <div className="text-lg font-extrabold text-gray-900">{f.from_code}</div>
                          <div className="text-xs text-gray-400 max-w-[80px] truncate">{f.from}</div>
                        </div>
                        <div className="flex flex-col items-center gap-1 flex-1">
                          <div className="text-xs text-gray-400">{f.duration}</div>
                          <div className="flex items-center gap-1 w-full">
                            <div className="h-px bg-gray-300 flex-1" />
                            <span className="text-gray-400 text-sm">✈</span>
                            <div className="h-px bg-gray-300 flex-1" />
                          </div>
                          <div className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            f.direct ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {f.direct ? (tr ? 'Direkt' : 'Direct') : (tr ? 'Aktarmalı' : 'Connecting')}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-extrabold text-gray-900">{f.to_code}</div>
                          <div className="text-xs text-gray-400">{f.to}</div>
                        </div>
                      </div>

                      {/* Fiyat + buton */}
                      <div className="text-right shrink-0">
                        <div className="text-2xl font-extrabold text-[#0f3460]">${f.price}</div>
                        <div className="text-xs text-gray-400 mb-2">{tr ? 'kişi başı' : 'per person'}</div>
                        <button
                          onClick={() => addFlight(f)}
                          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                            isAdded
                              ? 'bg-green-500 text-white'
                              : 'bg-[#0f3460] text-white hover:bg-[#0a1628]'
                          }`}>
                          {isAdded ? '✓ ' + (tr ? 'Eklendi' : 'Added') : (tr ? 'Sepete Ekle' : 'Add to Cart')}
                        </button>
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