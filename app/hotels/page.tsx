'use client';

import { useState } from 'react';
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

const HOTELS: Hotel[] = [
  // ANTALYA 5★
  { id: 1, name: 'Rixos Premium Belek', city: 'Antalya', stars: 5, price_per_night: 420, amenities_tr: ['Havuz', 'Spa', 'Plaj', 'Fine Dining', 'Aquapark'], amenities_en: ['Pool', 'Spa', 'Beach', 'Fine Dining', 'Aquapark'], image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', description_tr: 'Ultra lüks, show programları, aqua, fine dining', description_en: 'Ultra luxury, show programs, aqua, fine dining' },
  { id: 2, name: 'Maxx Royal Belek', city: 'Antalya', stars: 5, price_per_night: 380, amenities_tr: ['Golf', 'Spa', 'Özel Plaj', '7 Restoran'], amenities_en: ['Golf', 'Spa', 'Private Beach', '7 Restaurants'], image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800', description_tr: 'Golf sahası, 7 restoran, özel plaj, lüks spa', description_en: 'Golf course, 7 restaurants, private beach, luxury spa' },
  { id: 3, name: 'Regnum Carya Golf & Spa', city: 'Antalya', stars: 5, price_per_night: 340, amenities_tr: ['Golf', 'Tenis', 'Spa', '11 Restoran'], amenities_en: ['Golf', 'Tennis', 'Spa', '11 Restaurants'], image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', description_tr: 'Golf, tenis, spa, 11 restoran, özel plaj', description_en: 'Golf, tennis, spa, 11 restaurants, private beach' },
  { id: 4, name: 'Vikingen Infinity Resort', city: 'Antalya', stars: 5, price_per_night: 220, amenities_tr: ['Sonsuz Havuz', 'Plaj', 'Spa', 'Her Şey Dahil'], amenities_en: ['Infinity Pool', 'Beach', 'Spa', 'All Inclusive'], image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800', description_tr: 'Ultra all-inclusive, sonsuz havuz, plaj, spa', description_en: 'Ultra all-inclusive, infinity pool, beach, spa' },
  { id: 5, name: 'Paloma Grida Resort', city: 'Antalya', stars: 5, price_per_night: 195, amenities_tr: ['Aquapark', 'Tiyatro', 'Çocuk Kulübü', 'Spa'], amenities_en: ['Aquapark', 'Theatre', 'Kids Club', 'Spa'], image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800', description_tr: 'Aquapark, tiyatro, çocuk kulübü, lüks oda', description_en: 'Aquapark, theatre, kids club, luxury room' },
  { id: 6, name: 'Eftalya Ocean Hotel', city: 'Antalya', stars: 5, price_per_night: 175, amenities_tr: ['Deniz Manzarası', '4 Havuz', 'Spa', 'Her Şey Dahil'], amenities_en: ['Sea View', '4 Pools', 'Spa', 'All Inclusive'], image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800', description_tr: 'Deniz manzarası, 4 havuz, spa, her şey dahil', description_en: 'Sea view, 4 pools, spa, all inclusive' },
  // ANTALYA 4★
  { id: 7, name: 'Titanic Beach Lara', city: 'Antalya', stars: 4, price_per_night: 110, amenities_tr: ['Plaj', 'Aquapark', 'Animasyon', 'Her Şey Dahil'], amenities_en: ['Beach', 'Aquapark', 'Animation', 'All Inclusive'], image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800', description_tr: 'Plaj, aquapark, animasyon, her şey dahil', description_en: 'Beach, aquapark, animation, all inclusive' },
  { id: 8, name: 'Crowne Plaza Antalya', city: 'Antalya', stars: 4, price_per_night: 95, amenities_tr: ['Şehir Merkezi', 'Spa', 'Fitness', 'Transfer'], amenities_en: ['City Center', 'Spa', 'Fitness', 'Transfer'], image: 'https://images.unsplash.com/photo-1586611292717-f828b167408c?w=800', description_tr: 'Şehir merkezi, spa, fitness, transfer', description_en: 'City center, spa, fitness, transfer' },
  // İSTANBUL 5★
  { id: 9, name: 'Çırağan Palace Kempinski', city: 'İstanbul', stars: 5, price_per_night: 650, amenities_tr: ['Saray', 'Boğaz Manzarası', 'Ultra Lüks', 'Spa'], amenities_en: ['Palace', 'Bosphorus View', 'Ultra Luxury', 'Spa'], image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800', description_tr: 'Tarihi saray, Boğaz manzarası, ultra lüks', description_en: 'Historic palace, Bosphorus view, ultra luxury' },
  { id: 10, name: 'Four Seasons Boğaziçi', city: 'İstanbul', stars: 5, price_per_night: 580, amenities_tr: ['Boğaz Manzarası', 'Fine Dining', 'Spa', 'Havuz'], amenities_en: ['Bosphorus View', 'Fine Dining', 'Spa', 'Pool'], image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800', description_tr: 'Boğaz manzarası, fine dining, spa', description_en: 'Bosphorus view, fine dining, spa' },
  { id: 11, name: 'Mandarin Oriental İstanbul', city: 'İstanbul', stars: 5, price_per_night: 520, amenities_tr: ['Boğaz Manzarası', 'Spa', 'Infinity Havuz'], amenities_en: ['Bosphorus View', 'Spa', 'Infinity Pool'], image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800', description_tr: 'Boğaz manzarası, spa, infinity havuz', description_en: 'Bosphorus view, spa, infinity pool' },
  { id: 12, name: 'Hilton Istanbul Bosphorus', city: 'İstanbul', stars: 5, price_per_night: 290, amenities_tr: ['5 Restoran', 'Spa', 'Fitness', 'Boğaz Manzarası'], amenities_en: ['5 Restaurants', 'Spa', 'Fitness', 'Bosphorus View'], image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800', description_tr: 'Boğaz manzarası, 5 restoran, spa, fitness', description_en: 'Bosphorus view, 5 restaurants, spa, fitness' },
  // İSTANBUL 4★
  { id: 13, name: 'The Marmara Taksim', city: 'İstanbul', stars: 4, price_per_night: 160, amenities_tr: ['Taksim Merkezi', 'Şehir Manzarası', 'Modern'], amenities_en: ['Taksim Center', 'City View', 'Modern'], image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800', description_tr: 'Taksim merkezi, şehir manzarası, modern', description_en: 'Taksim center, city view, modern' },
  { id: 14, name: 'Mercure Istanbul', city: 'İstanbul', stars: 4, price_per_night: 120, amenities_tr: ['Merkezi Konum', 'Restoran', 'Fitness'], amenities_en: ['Central Location', 'Restaurant', 'Fitness'], image: 'https://images.unsplash.com/photo-1586611292717-f828b167408c?w=800', description_tr: 'Merkezi konum, modern oda, restoran', description_en: 'Central location, modern room, restaurant' },
  // İZMİR
  { id: 15, name: 'İzmir Palas Hotel', city: 'İzmir', stars: 4, price_per_night: 85, amenities_tr: ['Havuz', 'Restoran', 'Deniz Manzarası'], amenities_en: ['Pool', 'Restaurant', 'Sea View'], image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', description_tr: 'Havuz, restoran, deniz manzarası', description_en: 'Pool, restaurant, sea view' },
  { id: 16, name: 'Swissôtel İzmir', city: 'İzmir', stars: 5, price_per_night: 180, amenities_tr: ['Körfez Manzarası', 'Spa', 'Fitness', 'Restoran'], amenities_en: ['Bay View', 'Spa', 'Fitness', 'Restaurant'], image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800', description_tr: 'Körfez manzarası, spa, fitness, restoran', description_en: 'Bay view, spa, fitness, restaurant' },
];

const CITIES = ['Antalya', 'İstanbul', 'İzmir'];

export default function HotelsPage() {
  const { dil } = useDilContext();
  const tr = dil === 'tr';
  const { addItem } = useCartStore();
  const { formatla } = useDoviz();
  const { isKlinikYoneticisi } = useKullaniciContext();

  const [city, setCity] = useState('Antalya');
  const [stars, setStars] = useState(0);
  const [maxPrice, setMaxPrice] = useState(700);
  const [nights, setNights] = useState<Record<number, number>>({});
  const [added, setAdded] = useState<number[]>([]);

  function getNights(id: number) {
    return nights[id] || 1;
  }

  function addHotel(h: Hotel) {
    const n = getNights(h.id);
    addItem({
      id: `hotel-${h.id}`,
      type: 'package',
      name: h.name,
      detail: `${h.city} · ${h.stars}★ · ${n} ${tr ? 'gece' : 'nights'} · ${formatla(h.price_per_night)}/${tr ? 'gece' : 'night'}`,
      unitPrice: h.price_per_night * n,
      quantity: 1,
    });
    setAdded(prev => [...prev, h.id]);
    setTimeout(() => setAdded(prev => prev.filter(id => id !== h.id)), 2000);
  }

  const filtered = HOTELS.filter(h => {
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

        {/* Otel kartları */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
      </div>
    </main>
  );
}