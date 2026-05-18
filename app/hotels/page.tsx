'use client';

import { useState, useEffect } from 'react';
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

const CITIES = ['Antalya', 'İstanbul', 'İzmir'];

export default function HotelsPage() {
  const { dil } = useDilContext();
  const tr = dil === 'tr';
  const { addItem } = useCartStore();
  const { formatla } = useDoviz();
  const { isKlinikYoneticisi } = useKullaniciContext();

  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [city, setCity] = useState('Antalya');
  const [stars, setStars] = useState(0);
  const [maxPrice, setMaxPrice] = useState(700);
  const [nights, setNights] = useState<Record<number, number>>({});
  const [added, setAdded] = useState<number[]>([]);

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

  const filtered = hotels.filter(h => {
    if (h.city !== city) return false;
    if (stars > 0 && h.stars !== stars) return false;
    if (h.price_per_night > maxPrice) return false;
    return true;
  }).sort((a, b) => b.stars - a.stars);

  return (
    <main className="min-h-screen bg-[#f8fafc]">

      {/* HEADER */}
      <section className="relative px-6 py-16 text-center overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0a1628 0%, #0f3460 100%)' }}>
        <div className="absolute inset-0 opacity-15"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div className="relative">
          <p className="text-blue-200/70 text-xs font-semibold uppercase tracking-widest mb-3">
            {tr ? 'Konaklama' : 'Accommodation'}
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            {tr ? '5 Yıldızlı Konaklamanızı Seçin' : 'Choose Your Luxury Hotel'}
          </h1>
          <p className="text-blue-100/70 text-lg max-w-xl mx-auto">
            {tr ? 'Tedavinizin yanında en konforlu konaklama deneyimi' : 'The most comfortable stay alongside your treatment'}
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* Şehir seçimi */}
        <div className="flex gap-3 mb-6 flex-wrap">
          {CITIES.map(c => (
            <button key={c} onClick={() => setCity(c)}
              className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all ${
                city === c
                  ? 'bg-[#0f3460] text-white shadow-lg'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-[#0f3460] hover:text-[#0f3460]'
              }`}>
              {c}
            </button>
          ))}
        </div>

        {/* Yıldız filtresi + fiyat aralığı */}
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <div className="flex gap-2">
            <button onClick={() => setStars(0)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${stars === 0 ? 'bg-[#0f3460] text-white' : 'bg-white text-gray-500 border border-gray-200'}`}>
              {tr ? 'Tümü' : 'All'}
            </button>
            {[5, 4].map(s => (
              <button key={s} onClick={() => setStars(s)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${stars === s ? 'bg-[#0f3460] text-white' : 'bg-white text-gray-500 border border-gray-200'}`}>
                {'⭐'.repeat(s)}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-2xl px-4 py-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
              {tr ? `Maks. Fiyat: ${formatla(maxPrice)}/gece` : `Max. Price: ${formatla(maxPrice)}/night`}
            </span>
            <input type="range" min="50" max="700" step="50"
              value={maxPrice}
              onChange={e => setMaxPrice(Number(e.target.value))}
              className="w-32 accent-[#0f3460]" />
          </div>
        </div>

        {/* Yükleniyor */}
        {yukleniyor && (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-[#0f3460] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Otel kartları */}
        {!yukleniyor && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.length === 0 && (
              <div className="col-span-3 text-center py-20 text-gray-400">
                {tr ? 'Bu kriterlere uygun otel bulunamadı.' : 'No hotels found for these criteria.'}
              </div>
            )}
            {filtered.map(h => {
              const isAdded = added.includes(h.id);
              const n = getNights(h.id);
              return (
                <div key={h.id} className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">

                  {/* Görsel */}
                  <div className="relative h-48 overflow-hidden">
                    <img src={h.image} alt={h.name}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute top-3 right-3 bg-amber-400 text-white text-xs font-bold px-2 py-1 rounded-lg">
                      {'★'.repeat(h.stars)}
                    </div>
                    <div className="absolute bottom-3 left-3 text-white">
                      <div className="text-base font-bold leading-tight">{h.name}</div>
                      <div className="text-xs text-white/80">{h.city}</div>
                    </div>
                  </div>

                  <div className="p-5">
                    <p className="text-xs text-gray-400 mb-3">
                      {tr ? h.description_tr : h.description_en}
                    </p>

                    {/* Olanaklar */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {(tr ? h.amenities_tr : h.amenities_en).slice(0, 4).map(a => (
                        <span key={a} className="bg-blue-50 text-[#0f3460] text-xs px-2 py-0.5 rounded-full border border-blue-100">
                          {a}
                        </span>
                      ))}
                    </div>

                    {/* Fiyat + gece sayısı + buton */}
                    <div className="border-t border-gray-100 pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <span className="text-xl font-extrabold text-[#0f3460]">{formatla(h.price_per_night)}</span>
                          <span className="text-xs text-gray-400 ml-1">/ {tr ? 'gece' : 'night'}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-gray-700">{formatla(h.price_per_night * n)}</span>
                          <span className="text-xs text-gray-400 ml-1">{tr ? 'toplam' : 'total'}</span>
                        </div>
                      </div>

                      {/* Gece sayısı seçici */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-1.5">
                          <button
                            onClick={() => setNights(prev => ({ ...prev, [h.id]: Math.max(1, (prev[h.id] || 1) - 1) }))}
                            className="w-6 h-6 rounded-lg bg-white flex items-center justify-center text-sm font-bold text-gray-600 hover:bg-gray-50">
                            −
                          </button>
                          <span className="text-sm font-bold text-gray-800 w-6 text-center">{n}</span>
                          <button
                            onClick={() => setNights(prev => ({ ...prev, [h.id]: (prev[h.id] || 1) + 1 }))}
                            className="w-6 h-6 rounded-lg bg-white flex items-center justify-center text-sm font-bold text-gray-600 hover:bg-gray-50">
                            +
                          </button>
                          <span className="text-xs text-gray-500 ml-1">{tr ? 'gece' : 'nights'}</span>
                        </div>

                        {!isKlinikYoneticisi && (
                          <button
                            onClick={() => addHotel(h)}
                            className={`px-5 py-2.5 text-sm font-bold rounded-xl transition-all ${
                              isAdded
                                ? 'bg-green-500 text-white'
                                : 'bg-[#0f3460] text-white hover:bg-[#0a1628] hover:scale-105'
                            }`}>
                            {isAdded ? '✓ ' + (tr ? 'Eklendi' : 'Added') : (tr ? 'Sepete Ekle' : 'Add to Cart')}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
