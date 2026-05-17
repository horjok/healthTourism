'use client';

import { useState } from 'react';
import { useDilContext } from '@/lib/DilContext';
import { useDoviz } from '@/lib/DovizContext';
import { useCartStore } from '@/lib/cartStore';
import { useKullaniciContext } from '@/lib/KullaniciContext';

type Tour = {
  id: number;
  city: string;
  category: string;
  name_tr: string;
  name_en: string;
  desc_tr: string;
  desc_en: string;
  duration_tr: string;
  duration_en: string;
  price: number;
  image: string;
};

const TOURS: Tour[] = [
  // ANTALYA
  { id: 1, city: 'Antalya', category: 'Deniz', name_tr: 'Tekne Turu', name_en: 'Boat Tour', desc_tr: 'Antalya körfezi, 4 saat, öğle yemeği dahil', desc_en: 'Antalya bay, 4 hours, lunch included', duration_tr: '4 saat', duration_en: '4 hours', price: 45, image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600' },
  { id: 2, city: 'Antalya', category: 'Kültür', name_tr: 'Kaleiçi Tarihi Tur', name_en: 'Kaleiçi Historical Tour', desc_tr: 'Hadrian Kapısı, antik liman, rehberli', desc_en: "Hadrian's Gate, ancient harbor, guided", duration_tr: '3 saat', duration_en: '3 hours', price: 25, image: 'https://images.unsplash.com/photo-1589561253898-768105ca91a8?w=600' },
  { id: 3, city: 'Antalya', category: 'Eğlence', name_tr: 'Aquapark (Land of Legends)', name_en: 'Aquapark (Land of Legends)', desc_tr: 'Sınırsız eğlence, tam gün', desc_en: 'Unlimited fun, full day', duration_tr: 'Tam gün', duration_en: 'Full day', price: 60, image: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=600' },
  { id: 4, city: 'Antalya', category: 'Macera', name_tr: 'Jeep Safari', name_en: 'Jeep Safari', desc_tr: 'Toroslar, şelale, çamur banyosu', desc_en: 'Taurus Mountains, waterfall, mud bath', duration_tr: '6 saat', duration_en: '6 hours', price: 55, image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600' },
  { id: 5, city: 'Antalya', category: 'Spa', name_tr: 'Türk Hamamı & Spa', name_en: 'Turkish Bath & Spa', desc_tr: 'Geleneksel kese-köpük, masaj', desc_en: 'Traditional scrub, foam massage', duration_tr: '2 saat', duration_en: '2 hours', price: 40, image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600' },
  { id: 6, city: 'Antalya', category: 'Macera', name_tr: 'ATV Safari', name_en: 'ATV Safari', desc_tr: 'Gün batımı turları, plaj, orman', desc_en: 'Sunset tours, beach, forest', duration_tr: '3 saat', duration_en: '3 hours', price: 50, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600' },
  { id: 7, city: 'Antalya', category: 'Doğa', name_tr: 'Saklıkent Kanyonu', name_en: 'Saklıkent Canyon', desc_tr: 'Doğa yürüyüşü, nehir geçişi', desc_en: 'Nature walk, river crossing', duration_tr: '8 saat', duration_en: '8 hours', price: 45, image: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600' },
  { id: 8, city: 'Antalya', category: 'Deniz', name_tr: 'Dalış Dersi', name_en: 'Diving Lesson', desc_tr: 'Başlangıç seviye, ekipman dahil', desc_en: 'Beginner level, equipment included', duration_tr: '3 saat', duration_en: '3 hours', price: 70, image: 'https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?w=600' },
  { id: 9, city: 'Antalya', category: 'Gastronomi', name_tr: 'Gastronomi Turu', name_en: 'Gastronomy Tour', desc_tr: '5 durak, yerel lezzetler', desc_en: '5 stops, local delicacies', duration_tr: '4 saat', duration_en: '4 hours', price: 35, image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600' },
  { id: 10, city: 'Antalya', category: 'Macera', name_tr: 'Sahil Bisiklet Turu', name_en: 'Coastal Bike Tour', desc_tr: 'Sahil şeridi boyunca', desc_en: 'Along the coastline', duration_tr: '2 saat', duration_en: '2 hours', price: 20, image: 'https://images.unsplash.com/photo-1558618047-f4e73e82dccc?w=600' },

  // İSTANBUL
  { id: 11, city: 'İstanbul', category: 'Kültür', name_tr: 'Boğaz Turu', name_en: 'Bosphorus Tour', desc_tr: 'Gün batımı, 2 saat, ikram dahil', desc_en: 'Sunset, 2 hours, refreshments included', duration_tr: '2 saat', duration_en: '2 hours', price: 35, image: 'https://images.unsplash.com/photo-1527838832700-5059252407fa?w=600' },
  { id: 12, city: 'İstanbul', category: 'Kültür', name_tr: 'Tarihi Yarımada Turu', name_en: 'Historical Peninsula Tour', desc_tr: 'Sultanahmet, Ayasofya, Kapalıçarşı', desc_en: 'Sultanahmet, Hagia Sophia, Grand Bazaar', duration_tr: '4 saat', duration_en: '4 hours', price: 30, image: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=600' },
  { id: 13, city: 'İstanbul', category: 'Kültür', name_tr: 'Galata Sanat Turu', name_en: 'Galata Art Tour', desc_tr: 'Modern müzeler, galeri, kafe', desc_en: 'Modern museums, gallery, cafe', duration_tr: '3 saat', duration_en: '3 hours', price: 25, image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=600' },
  { id: 14, city: 'İstanbul', category: 'Gastronomi', name_tr: "Boğaz'da Akşam Yemeği", name_en: 'Bosphorus Dinner', desc_tr: 'Fine dining, canlı müzik', desc_en: 'Fine dining, live music', duration_tr: '3 saat', duration_en: '3 hours', price: 85, image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600' },
  { id: 15, city: 'İstanbul', category: 'Spa', name_tr: 'Çemberlitaş Hamamı', name_en: 'Çemberlitaş Hammam', desc_tr: '400 yıllık hamam deneyimi', desc_en: '400-year-old hammam experience', duration_tr: '2 saat', duration_en: '2 hours', price: 50, image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600' },
  { id: 16, city: 'İstanbul', category: 'Macera', name_tr: 'Helikopter Turu', name_en: 'Helicopter Tour', desc_tr: "İstanbul'u havadan görün", desc_en: 'See Istanbul from the air', duration_tr: '1 saat', duration_en: '1 hour', price: 180, image: 'https://images.unsplash.com/photo-1534269222346-5a896154c41d?w=600' },
  { id: 17, city: 'İstanbul', category: 'Doğa', name_tr: 'Prens Adaları Turu', name_en: 'Princes Islands Tour', desc_tr: 'Bisiklet, fayton, deniz', desc_en: 'Cycling, carriage, sea', duration_tr: 'Tam gün', duration_en: 'Full day', price: 55, image: 'https://images.unsplash.com/photo-1527838832700-5059252407fa?w=600' },
  { id: 18, city: 'İstanbul', category: 'Kültür', name_tr: 'Sema Töreni', name_en: 'Whirling Dervishes', desc_tr: 'Mevlevi sema gösterisi', desc_en: 'Mevlevi sufi ceremony', duration_tr: '2 saat', duration_en: '2 hours', price: 30, image: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=600' },
  { id: 19, city: 'İstanbul', category: 'Gastronomi', name_tr: 'Boğaz Kahvaltısı', name_en: 'Bosphorus Breakfast', desc_tr: 'Tekne üstü Türk kahvaltısı', desc_en: 'Turkish breakfast on a boat', duration_tr: '2 saat', duration_en: '2 hours', price: 45, image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600' },
  { id: 20, city: 'İstanbul', category: 'Alışveriş', name_tr: 'Grand Bazaar Turu', name_en: 'Grand Bazaar Tour', desc_tr: 'Rehberli alışveriş turu', desc_en: 'Guided shopping tour', duration_tr: '2 saat', duration_en: '2 hours', price: 0, image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=600' },

  // İZMİR
  { id: 21, city: 'İzmir', category: 'Kültür', name_tr: 'Efes Antik Kenti', name_en: 'Ephesus Ancient City', desc_tr: 'Rehberli antik şehir turu', desc_en: 'Guided ancient city tour', duration_tr: '5 saat', duration_en: '5 hours', price: 50, image: 'https://images.unsplash.com/photo-1589561253898-768105ca91a8?w=600' },
  { id: 22, city: 'İzmir', category: 'Doğa', name_tr: 'Çeşme Plaj Turu', name_en: 'Çeşme Beach Tour', desc_tr: 'Kristal berraklığında deniz', desc_en: 'Crystal clear sea', duration_tr: 'Tam gün', duration_en: 'Full day', price: 30, image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600' },
  { id: 23, city: 'İzmir', category: 'Kültür', name_tr: 'Kemeraltı Çarşısı', name_en: 'Kemeraltı Bazaar', desc_tr: 'Tarihi çarşı rehberli tur', desc_en: 'Historical bazaar guided tour', duration_tr: '2 saat', duration_en: '2 hours', price: 20, image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=600' },
  { id: 24, city: 'İzmir', category: 'Gastronomi', name_tr: 'İzmir Lezzetleri Turu', name_en: 'İzmir Food Tour', desc_tr: 'Boyoz, kumru, midye turu', desc_en: 'Boyoz, kumru, mussel tour', duration_tr: '3 saat', duration_en: '3 hours', price: 35, image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600' },
  { id: 25, city: 'İzmir', category: 'Doğa', name_tr: 'Pamukkale Günü', name_en: 'Pamukkale Day Trip', desc_tr: 'Beyaz traverten havuzları', desc_en: 'White travertine pools', duration_tr: 'Tam gün', duration_en: 'Full day', price: 65, image: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600' },
];

const CITIES = ['Antalya', 'İstanbul', 'İzmir'];
const CATEGORIES_TR = ['Tümü', 'Kültür', 'Deniz', 'Macera', 'Spa', 'Gastronomi', 'Doğa', 'Eğlence', 'Alışveriş'];
const CATEGORIES_EN = ['All', 'Culture', 'Sea', 'Adventure', 'Spa', 'Gastronomy', 'Nature', 'Entertainment', 'Shopping'];

export default function ToursPage() {
  const { dil } = useDilContext();
  const tr = dil === 'tr';
  const { addItem, incrementQuantity, decrementQuantity, removeItem } = useCartStore();
  const items = useCartStore(s => s.items);
  const { formatla } = useDoviz();
  const { isKlinikYoneticisi } = useKullaniciContext();

  const [city, setCity] = useState('Antalya');
  const [category, setCategory] = useState('Tümü');
  const [maxPrice, setMaxPrice] = useState(200);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [quantities, setQuantities] = useState<Record<number, number>>({});

  const CATEGORIES = tr ? CATEGORIES_TR : CATEGORIES_EN;

  const filtered = TOURS.filter(t => {
    if (t.city !== city) return false;
    if (t.price > maxPrice) return false;
    if (category === 'Tümü' || category === 'All') return true;
    const idx = (tr ? CATEGORIES_TR : CATEGORIES_EN).indexOf(category);
    return t.category === CATEGORIES_TR[idx];
  });

  function getQty(id: number) {
    return quantities[id] || 1;
  }

  function addTour(t: Tour) {
    const qty = getQty(t.id);
    addItem({
      id: `tour-${t.id}`,
      type: 'tour',
      name: tr ? t.name_tr : t.name_en,
      detail: `${city} · ${tr ? t.duration_tr : t.duration_en}`,
      unitPrice: t.price,
      quantity: qty,
    });
  }

  return (
    <main className="min-h-screen bg-[#f8fafc]">

      {/* HEADER */}
      <section className="relative px-6 py-16 text-center overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0a1628 0%, #0f3460 100%)' }}>
        <div className="absolute inset-0 opacity-15"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1527838832700-5059252407fa?w=1200)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div className="relative">
          <p className="text-blue-200/70 text-xs font-semibold uppercase tracking-widest mb-3">
            {tr ? 'Aktiviteler & Turlar' : 'Activities & Tours'}
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            {tr ? 'Tedavinizin Yanında Keşfedin' : 'Explore Beyond Your Treatment'}
          </h1>
          <p className="text-blue-100/70 text-lg max-w-xl mx-auto">
            {tr ? 'İstanbul, Antalya ve İzmir\'de unutulmaz deneyimler' : 'Unforgettable experiences in Istanbul, Antalya and İzmir'}
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* Şehir seçimi */}
        <div className="flex gap-3 mb-6 flex-wrap">
          {CITIES.map(c => (
            <button key={c} onClick={() => { setCity(c); setCategory(tr ? 'Tümü' : 'All'); }}
              className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all ${
                city === c
                  ? 'bg-[#0f3460] text-white shadow-lg'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-[#0f3460] hover:text-[#0f3460]'
              }`}>
              {c}
            </button>
          ))}
        </div>

        {/* Kategori filtreleri + tarih aralığı + fiyat */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button key={cat} onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                category === cat
                  ? 'bg-[#0f3460] text-white'
                  : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300'
              }`}>
              {cat}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-4 mb-8">
          {/* Tarih aralığı */}
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-2xl px-4 py-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {tr ? 'Başlangıç' : 'Start'}
            </span>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
              className="text-sm text-gray-700 focus:outline-none bg-transparent" />
          </div>
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-2xl px-4 py-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {tr ? 'Bitiş' : 'End'}
            </span>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
              className="text-sm text-gray-700 focus:outline-none bg-transparent" />
          </div>
          {/* Fiyat aralığı */}
          <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-2xl px-4 py-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
              {tr ? `Maks. Fiyat: ${formatla(maxPrice)}` : `Max. Price: ${formatla(maxPrice)}`}
            </span>
            <input type="range" min="0" max="200" step="10"
              value={maxPrice}
              onChange={e => setMaxPrice(Number(e.target.value))}
              className="w-28 accent-[#0f3460]" />
          </div>
        </div>

        {/* Tur kartları */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(t => {
            const cartItem = items.find(i => i.id === `tour-${t.id}`);
            const qty = getQty(t.id);
            return (
              <div key={t.id} className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="relative h-44 overflow-hidden">
                  <img src={t.image} alt={tr ? t.name_tr : t.name_en}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur text-[#0f3460] text-xs font-bold px-3 py-1 rounded-full">
                    {tr ? t.category : CATEGORIES_EN[CATEGORIES_TR.indexOf(t.category)]}
                  </span>
                  <span className="absolute bottom-3 right-3 text-white text-xs font-semibold bg-black/30 backdrop-blur px-2 py-1 rounded-lg">
                    ⏱ {tr ? t.duration_tr : t.duration_en}
                  </span>
                </div>

                <div className="p-5">
                  <h3 className="font-bold text-gray-900 mb-1">{tr ? t.name_tr : t.name_en}</h3>
                  <p className="text-xs text-gray-400 mb-4">{tr ? t.desc_tr : t.desc_en}</p>

                  <div className="flex items-center justify-between">
                    <div>
                      {t.price === 0 ? (
                        <span className="text-xl font-extrabold text-green-600">{tr ? 'Ücretsiz' : 'Free'}</span>
                      ) : (
                        <>
                          <span className="text-xl font-extrabold text-[#0f3460]">{formatla(t.price)}</span>
                          <span className="text-xs text-gray-400 ml-1">/{tr ? 'kişi' : 'person'}</span>
                        </>
                      )}
                    </div>

                    {!isKlinikYoneticisi && (cartItem ? (
                      <div className="flex flex-col items-end gap-1.5">
                        <div className="flex items-center gap-1 bg-gray-100 rounded-xl px-2 py-1">
                          <button onClick={() => decrementQuantity(`tour-${t.id}`)}
                            className="w-6 h-6 rounded-lg bg-white flex items-center justify-center text-sm font-bold text-gray-600 hover:bg-gray-50">−</button>
                          <span className="text-sm font-bold text-gray-800 w-5 text-center">{cartItem.quantity}</span>
                          <button onClick={() => incrementQuantity(`tour-${t.id}`)}
                            className="w-6 h-6 rounded-lg bg-white flex items-center justify-center text-sm font-bold text-gray-600 hover:bg-gray-50">+</button>
                        </div>
                        <button onClick={() => removeItem(`tour-${t.id}`)}
                          className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors">
                          {tr ? 'Sepetten Çıkar' : 'Remove'}
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 bg-gray-100 rounded-xl px-2 py-1">
                          <button onClick={() => setQuantities(q => ({ ...q, [t.id]: Math.max(1, (q[t.id] || 1) - 1) }))}
                            className="w-6 h-6 rounded-lg bg-white flex items-center justify-center text-sm font-bold text-gray-600 hover:bg-gray-50">−</button>
                          <span className="text-sm font-bold text-gray-800 w-5 text-center">{qty}</span>
                          <button onClick={() => setQuantities(q => ({ ...q, [t.id]: (q[t.id] || 1) + 1 }))}
                            className="w-6 h-6 rounded-lg bg-white flex items-center justify-center text-sm font-bold text-gray-600 hover:bg-gray-50">+</button>
                        </div>
                        <button onClick={() => addTour(t)}
                          className="px-4 py-2 text-xs font-bold rounded-xl bg-[#0f3460] text-white hover:bg-[#0a1628] transition-all">
                          {tr ? 'Ekle' : 'Add'}
                        </button>
                      </div>
                    ))}
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