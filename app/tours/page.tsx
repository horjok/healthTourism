'use client';

import { useState } from 'react';
import { useDilContext } from '@/lib/DilContext';
import { useDoviz } from '@/lib/DovizContext';
import { useCartStore } from '@/lib/cartStore';
import { useKullaniciContext } from '@/lib/KullaniciContext';

type Tour = {
  id: number; city: string; category: string;
  name_tr: string; name_en: string;
  desc_tr: string; desc_en: string;
  duration_tr: string; duration_en: string;
  price: number; image: string;
};

const TOURS: Tour[] = [
  { id: 1,  city: 'Antalya',  category: 'Deniz',      name_tr: 'Tekne Turu',              name_en: 'Boat Tour',                  desc_tr: 'Antalya körfezi, 4 saat, öğle yemeği dahil', desc_en: 'Antalya bay, 4 hours, lunch included',          duration_tr: '4 saat',   duration_en: '4 hours',   price: 45,  image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600' },
  { id: 2,  city: 'Antalya',  category: 'Kültür',     name_tr: 'Kaleiçi Tarihi Tur',       name_en: 'Kaleiçi Historical Tour',    desc_tr: 'Hadrian Kapısı, antik liman, rehberli',       desc_en: "Hadrian's Gate, ancient harbor, guided",       duration_tr: '3 saat',   duration_en: '3 hours',   price: 25,  image: 'https://images.unsplash.com/photo-1589561253898-768105ca91a8?w=600' },
  { id: 3,  city: 'Antalya',  category: 'Eğlence',    name_tr: 'Aquapark',                 name_en: 'Aquapark',                   desc_tr: 'Sınırsız eğlence, tam gün',                   desc_en: 'Unlimited fun, full day',                      duration_tr: 'Tam gün',  duration_en: 'Full day',  price: 60,  image: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=600' },
  { id: 4,  city: 'Antalya',  category: 'Macera',     name_tr: 'Jeep Safari',              name_en: 'Jeep Safari',                desc_tr: 'Toroslar, şelale, çamur banyosu',             desc_en: 'Taurus Mountains, waterfall, mud bath',        duration_tr: '6 saat',   duration_en: '6 hours',   price: 55,  image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600' },
  { id: 5,  city: 'Antalya',  category: 'Spa',        name_tr: 'Türk Hamamı & Spa',        name_en: 'Turkish Bath & Spa',         desc_tr: 'Geleneksel kese-köpük, masaj',                desc_en: 'Traditional scrub, foam massage',              duration_tr: '2 saat',   duration_en: '2 hours',   price: 40,  image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600' },
  { id: 6,  city: 'Antalya',  category: 'Macera',     name_tr: 'ATV Safari',               name_en: 'ATV Safari',                 desc_tr: 'Gün batımı turları, plaj, orman',             desc_en: 'Sunset tours, beach, forest',                  duration_tr: '3 saat',   duration_en: '3 hours',   price: 50,  image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600' },
  { id: 7,  city: 'Antalya',  category: 'Doğa',       name_tr: 'Saklıkent Kanyonu',        name_en: 'Saklıkent Canyon',           desc_tr: 'Doğa yürüyüşü, nehir geçişi',                desc_en: 'Nature walk, river crossing',                  duration_tr: '8 saat',   duration_en: '8 hours',   price: 45,  image: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600' },
  { id: 8,  city: 'Antalya',  category: 'Deniz',      name_tr: 'Dalış Dersi',              name_en: 'Diving Lesson',              desc_tr: 'Başlangıç seviye, ekipman dahil',             desc_en: 'Beginner level, equipment included',           duration_tr: '3 saat',   duration_en: '3 hours',   price: 70,  image: 'https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?w=600' },
  { id: 9,  city: 'Antalya',  category: 'Gastronomi', name_tr: 'Gastronomi Turu',          name_en: 'Gastronomy Tour',            desc_tr: '5 durak, yerel lezzetler',                    desc_en: '5 stops, local delicacies',                    duration_tr: '4 saat',   duration_en: '4 hours',   price: 35,  image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600' },
  { id: 10, city: 'Antalya',  category: 'Macera',     name_tr: 'Sahil Bisiklet Turu',      name_en: 'Coastal Bike Tour',          desc_tr: 'Sahil şeridi boyunca',                        desc_en: 'Along the coastline',                          duration_tr: '2 saat',   duration_en: '2 hours',   price: 20,  image: 'https://images.unsplash.com/photo-1558618047-f4e73e82dccc?w=600' },
  { id: 11, city: 'İstanbul', category: 'Kültür',     name_tr: 'Boğaz Turu',               name_en: 'Bosphorus Tour',             desc_tr: 'Gün batımı, 2 saat, ikram dahil',             desc_en: 'Sunset, 2 hours, refreshments included',      duration_tr: '2 saat',   duration_en: '2 hours',   price: 35,  image: 'https://images.unsplash.com/photo-1527838832700-5059252407fa?w=600' },
  { id: 12, city: 'İstanbul', category: 'Kültür',     name_tr: 'Tarihi Yarımada Turu',     name_en: 'Historical Peninsula Tour',  desc_tr: 'Sultanahmet, Ayasofya, Kapalıçarşı',          desc_en: 'Sultanahmet, Hagia Sophia, Grand Bazaar',      duration_tr: '4 saat',   duration_en: '4 hours',   price: 30,  image: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=600' },
  { id: 13, city: 'İstanbul', category: 'Kültür',     name_tr: 'Galata Sanat Turu',        name_en: 'Galata Art Tour',            desc_tr: 'Modern müzeler, galeri, kafe',                desc_en: 'Modern museums, gallery, cafe',                duration_tr: '3 saat',   duration_en: '3 hours',   price: 25,  image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=600' },
  { id: 14, city: 'İstanbul', category: 'Gastronomi', name_tr: "Boğaz'da Akşam Yemeği",    name_en: 'Bosphorus Dinner',           desc_tr: 'Fine dining, canlı müzik',                    desc_en: 'Fine dining, live music',                      duration_tr: '3 saat',   duration_en: '3 hours',   price: 85,  image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600' },
  { id: 15, city: 'İstanbul', category: 'Spa',        name_tr: 'Çemberlitaş Hamamı',       name_en: 'Çemberlitaş Hammam',         desc_tr: '400 yıllık hamam deneyimi',                   desc_en: '400-year-old hammam experience',               duration_tr: '2 saat',   duration_en: '2 hours',   price: 50,  image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600' },
  { id: 16, city: 'İstanbul', category: 'Macera',     name_tr: 'Helikopter Turu',          name_en: 'Helicopter Tour',            desc_tr: "İstanbul'u havadan görün",                    desc_en: 'See Istanbul from the air',                    duration_tr: '1 saat',   duration_en: '1 hour',    price: 180, image: 'https://images.unsplash.com/photo-1534269222346-5a896154c41d?w=600' },
  { id: 17, city: 'İstanbul', category: 'Doğa',       name_tr: 'Prens Adaları Turu',       name_en: 'Princes Islands Tour',       desc_tr: 'Bisiklet, fayton, deniz',                     desc_en: 'Cycling, carriage, sea',                       duration_tr: 'Tam gün',  duration_en: 'Full day',  price: 55,  image: 'https://images.unsplash.com/photo-1527838832700-5059252407fa?w=600' },
  { id: 18, city: 'İstanbul', category: 'Kültür',     name_tr: 'Sema Töreni',              name_en: 'Whirling Dervishes',         desc_tr: 'Mevlevi sema gösterisi',                      desc_en: 'Mevlevi sufi ceremony',                        duration_tr: '2 saat',   duration_en: '2 hours',   price: 30,  image: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=600' },
  { id: 19, city: 'İstanbul', category: 'Gastronomi', name_tr: 'Boğaz Kahvaltısı',         name_en: 'Bosphorus Breakfast',        desc_tr: 'Tekne üstü Türk kahvaltısı',                  desc_en: 'Turkish breakfast on a boat',                  duration_tr: '2 saat',   duration_en: '2 hours',   price: 45,  image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600' },
  { id: 20, city: 'İstanbul', category: 'Alışveriş',  name_tr: 'Grand Bazaar Turu',        name_en: 'Grand Bazaar Tour',          desc_tr: 'Rehberli alışveriş turu',                     desc_en: 'Guided shopping tour',                         duration_tr: '2 saat',   duration_en: '2 hours',   price: 0,   image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=600' },
  { id: 21, city: 'İzmir',    category: 'Kültür',     name_tr: 'Efes Antik Kenti',         name_en: 'Ephesus Ancient City',       desc_tr: 'Rehberli antik şehir turu',                   desc_en: 'Guided ancient city tour',                     duration_tr: '5 saat',   duration_en: '5 hours',   price: 50,  image: 'https://images.unsplash.com/photo-1589561253898-768105ca91a8?w=600' },
  { id: 22, city: 'İzmir',    category: 'Doğa',       name_tr: 'Çeşme Plaj Turu',          name_en: 'Çeşme Beach Tour',           desc_tr: 'Kristal berraklığında deniz',                  desc_en: 'Crystal clear sea',                            duration_tr: 'Tam gün',  duration_en: 'Full day',  price: 30,  image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600' },
  { id: 23, city: 'İzmir',    category: 'Kültür',     name_tr: 'Kemeraltı Çarşısı',        name_en: 'Kemeraltı Bazaar',           desc_tr: 'Tarihi çarşı rehberli tur',                   desc_en: 'Historical bazaar guided tour',                duration_tr: '2 saat',   duration_en: '2 hours',   price: 20,  image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=600' },
  { id: 24, city: 'İzmir',    category: 'Gastronomi', name_tr: 'İzmir Lezzetleri Turu',    name_en: 'İzmir Food Tour',            desc_tr: 'Boyoz, kumru, midye turu',                    desc_en: 'Boyoz, kumru, mussel tour',                    duration_tr: '3 saat',   duration_en: '3 hours',   price: 35,  image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600' },
  { id: 25, city: 'İzmir',    category: 'Doğa',       name_tr: 'Pamukkale Günü',           name_en: 'Pamukkale Day Trip',         desc_tr: 'Beyaz traverten havuzları',                   desc_en: 'White travertine pools',                       duration_tr: 'Tam gün',  duration_en: 'Full day',  price: 65,  image: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600' },
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

  function getQty(id: number) { return quantities[id] || 1; }

  function addTour(t: Tour) {
    const qty = getQty(t.id);
    addItem({
      id: `tour-${t.id}`, type: 'tour',
      name: tr ? t.name_tr : t.name_en,
      detail: `${city} · ${tr ? t.duration_tr : t.duration_en}${startDate ? ` · ${startDate}` : ''}${endDate ? ` → ${endDate}` : ''}`,
      unitPrice: t.price, quantity: qty,
    });
  }

  return (
    <main className="min-h-screen" style={{ background: '#FDFBF7' }}>

      {/* HEADER */}
      <section className="relative overflow-hidden px-6 py-20 text-center"
        style={{ background: 'linear-gradient(135deg, #0D1E25 0%, #060f13 100%)' }}>
        <div className="absolute inset-0 opacity-15 mix-blend-luminosity"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1527838832700-5059252407fa?w=1200)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.05]">
          <svg className="h-full w-full"><defs><pattern id="seljuk-tours" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
            <g fill="none" stroke="white" strokeWidth="1">
              <rect x="25" y="25" width="50" height="50"/>
              <rect x="25" y="25" width="50" height="50" transform="rotate(45 50 50)"/>
            </g>
          </pattern></defs><rect width="100%" height="100%" fill="url(#seljuk-tours)"/></svg>
        </div>
        <div className="pointer-events-none absolute -top-20 -right-20 w-80 h-80 rounded-full blur-3xl" style={{ background: 'rgba(0,210,211,0.12)' }} />
        <div className="pointer-events-none absolute -bottom-20 -left-20 w-80 h-80 rounded-full blur-3xl" style={{ background: 'rgba(255,71,87,0.08)' }} />
        <div className="relative">
          <p className="text-[11px] font-bold uppercase tracking-widest mb-4" style={{ color: '#00D2D3' }}>
            {tr ? 'Aktiviteler & Turlar' : 'Activities & Tours'}
          </p>
          <h1 className="font-serif text-4xl md:text-6xl font-bold text-white mb-4">
            {tr ? 'Tedavinizin Yanında Keşfedin' : 'Explore Beyond Your Treatment'}
          </h1>
          <p className="text-lg max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.6)' }}>
            {tr ? 'İstanbul, Antalya ve İzmir\'de unutulmaz deneyimler' : 'Unforgettable experiences in Istanbul, Antalya and İzmir'}
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* Şehir tabları */}
        <div className="flex gap-3 mb-6 flex-wrap">
          {CITIES.map(c => (
            <button key={c} onClick={() => { setCity(c); setCategory(tr ? 'Tümü' : 'All'); }}
              className="px-6 py-3 rounded-2xl text-sm font-bold transition-all hover:scale-105"
              style={{
                background: city === c ? '#0D1E25' : 'transparent',
                color: city === c ? '#00D2D3' : '#3d5562',
                border: city === c ? '2px solid #0D1E25' : '2px solid #e8e0d0',
                boxShadow: city === c ? '0 0 20px rgba(0,210,211,0.15)' : 'none',
              }}>
              {c}
            </button>
          ))}
        </div>

        {/* Filtreler */}
        <div className="flex flex-wrap gap-3 mb-8 items-center">
          {/* Kategori filtreleri */}
          <div className="flex gap-2 flex-wrap flex-1">
            {CATEGORIES.map((cat) => (
              <button key={cat} onClick={() => setCategory(cat)}
                className="px-4 py-2 rounded-xl text-xs font-bold transition-all"
                style={{
                  background: category === cat ? '#0D1E25' : 'transparent',
                  color: category === cat ? '#00D2D3' : '#3d5562',
                  border: category === cat ? '1px solid #0D1E25' : '1px solid #e8e0d0',
                }}>
                {cat}
              </button>
            ))}
          </div>

          {/* Tarih aralığı */}
          <div className="flex items-center gap-2 rounded-2xl px-4 py-2"
            style={{ background: '#FDFBF7', border: '1px solid #e8e0d0' }}>
            <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#8aa0ad' }}>
              {tr ? 'Başlangıç' : 'Start'}
            </span>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="text-sm focus:outline-none bg-transparent" style={{ color: '#0D1E25' }} />
          </div>
          <div className="flex items-center gap-2 rounded-2xl px-4 py-2"
            style={{ background: '#FDFBF7', border: '1px solid #e8e0d0' }}>
            <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#8aa0ad' }}>
              {tr ? 'Bitiş' : 'End'}
            </span>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
              min={startDate || new Date().toISOString().split('T')[0]}
              className="text-sm focus:outline-none bg-transparent" style={{ color: '#0D1E25' }} />
          </div>

          {/* Fiyat slider */}
          <div className="flex items-center gap-3 rounded-2xl px-4 py-2"
            style={{ background: '#FDFBF7', border: '1px solid #e8e0d0' }}>
            <span className="text-[11px] font-bold uppercase tracking-wider whitespace-nowrap" style={{ color: '#8aa0ad' }}>
              {tr ? `Maks: ${formatla(maxPrice)}` : `Max: ${formatla(maxPrice)}`}
            </span>
            <input type="range" min="0" max="200" step="10"
              value={maxPrice} onChange={e => setMaxPrice(Number(e.target.value))}
              className="w-24" style={{ accentColor: '#FF4757' }} />
          </div>
        </div>

        {/* Tur kartları */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 rounded-2xl" style={{ border: '1px solid #e8e0d0' }}>
            <p className="text-4xl mb-3">🎯</p>
            <p className="font-serif text-xl" style={{ color: '#0D1E25' }}>
              {tr ? 'Bu kriterlere uygun tur bulunamadı' : 'No tours found for these criteria'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(t => {
              const cartItem = items.find(i => i.id === `tour-${t.id}`);
              const qty = getQty(t.id);
              return (
                <article key={t.id}
                  className="group overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                  style={{ background: '#FDFBF7', border: '1px solid #e8e0d0' }}>

                  {/* Görsel — magazine cover style */}
                  <div className="relative overflow-hidden" style={{ aspectRatio: '16/9' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={t.image} alt={tr ? t.name_tr : t.name_en}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0D1E25]/70 to-transparent" />

                    {/* Kategori rozeti */}
                    <span className="absolute top-3 left-3 rounded-full px-3 py-1 text-[10px] font-bold text-[#0D1E25]"
                      style={{ background: '#00D2D3', boxShadow: '0 0 8px rgba(0,210,211,0.4)' }}>
                      {tr ? t.category : CATEGORIES_EN[CATEGORIES_TR.indexOf(t.category)]}
                    </span>

                    {/* Süre */}
                    <span className="absolute bottom-3 right-3 text-white text-xs font-semibold rounded-lg px-2 py-1"
                      style={{ background: 'rgba(13,30,37,0.7)', backdropFilter: 'blur(8px)' }}>
                      ⏱ {tr ? t.duration_tr : t.duration_en}
                    </span>
                  </div>

                  <div className="p-5">
                    <h3 className="font-serif text-xl mb-1" style={{ color: '#0D1E25' }}>
                      {tr ? t.name_tr : t.name_en}
                    </h3>
                    <p className="text-xs mb-4" style={{ color: '#8aa0ad' }}>
                      {tr ? t.desc_tr : t.desc_en}
                    </p>

                    <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid #e8e0d0' }}>
                      <div>
                        {t.price === 0 ? (
                          <span className="font-serif text-xl font-bold" style={{ color: '#00D2D3' }}>
                            {tr ? 'Ücretsiz' : 'Free'}
                          </span>
                        ) : (
                          <>
                            <span className="font-serif text-xl font-bold" style={{ color: '#FF4757' }}>
                              {formatla(t.price)}
                            </span>
                            <span className="text-xs ml-1" style={{ color: '#8aa0ad' }}>
                              /{tr ? 'kişi' : 'person'}
                            </span>
                          </>
                        )}
                      </div>

                      {!isKlinikYoneticisi && (cartItem ? (
                        <div className="flex flex-col items-end gap-1.5">
                          <div className="flex items-center gap-1 rounded-xl px-2 py-1"
                            style={{ background: 'rgba(0,210,211,0.08)', border: '1px solid rgba(0,210,211,0.2)' }}>
                            <button onClick={() => decrementQuantity(`tour-${t.id}`)}
                              className="w-6 h-6 rounded-lg flex items-center justify-center text-sm font-bold transition-colors"
                              style={{ background: 'white', color: '#3d5562' }}>−</button>
                            <span className="text-sm font-bold w-5 text-center" style={{ color: '#0D1E25' }}>
                              {cartItem.quantity}
                            </span>
                            <button onClick={() => incrementQuantity(`tour-${t.id}`)}
                              className="w-6 h-6 rounded-lg flex items-center justify-center text-sm font-bold transition-colors"
                              style={{ background: 'white', color: '#3d5562' }}>+</button>
                          </div>
                          <button onClick={() => removeItem(`tour-${t.id}`)}
                            className="text-xs font-bold transition-colors"
                            style={{ color: '#FF4757' }}>
                            {tr ? 'Sepetten Çıkar' : 'Remove'}
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 rounded-xl px-2 py-1"
                            style={{ background: '#F7F1E3', border: '1px solid #e8e0d0' }}>
                            <button
                              onClick={() => setQuantities(q => ({ ...q, [t.id]: Math.max(1, (q[t.id] || 1) - 1) }))}
                              className="w-6 h-6 rounded-lg flex items-center justify-center text-sm font-bold"
                              style={{ background: 'white', color: '#3d5562' }}>−</button>
                            <span className="text-sm font-bold w-5 text-center" style={{ color: '#0D1E25' }}>{qty}</span>
                            <button
                              onClick={() => setQuantities(q => ({ ...q, [t.id]: (q[t.id] || 1) + 1 }))}
                              className="w-6 h-6 rounded-lg flex items-center justify-center text-sm font-bold"
                              style={{ background: 'white', color: '#3d5562' }}>+</button>
                          </div>
                          <button onClick={() => addTour(t)}
                            className="px-4 py-2 text-xs font-bold rounded-xl text-white transition-all hover:scale-105"
                            style={{ background: '#FF4757', boxShadow: '0 0 10px rgba(255,71,87,0.3)' }}
                            onMouseEnter={e => (e.currentTarget.style.background = '#e63950')}
                            onMouseLeave={e => (e.currentTarget.style.background = '#FF4757')}>
                            {tr ? 'Ekle' : 'Add'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}