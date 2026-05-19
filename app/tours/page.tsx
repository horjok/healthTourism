'use client';

import { useState } from 'react';
import Footer from '@/components/ui/Footer';
import { useDilContext } from '@/lib/DilContext';
import { useDoviz } from '@/lib/DovizContext';
import { useCartStore } from '@/lib/cartStore';
import { useKullaniciContext } from '@/lib/KullaniciContext';
import { useChatContext } from '@/components/ui/ChatProvider';

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
  durationMin: number;
  price: number;
  image: string;
};

type CatMeta = {
  dotBg: string;
  pillBg: string;
  pillTxt: string;
  pillRing: string;
};

const CAT_META: Record<string, CatMeta> = {
  'Kültür':     { dotBg: 'bg-amber-500',   pillBg: 'bg-amber-50',   pillTxt: 'text-amber-700',   pillRing: 'ring-amber-200' },
  'Deniz':      { dotBg: 'bg-cyan-500',     pillBg: 'bg-cyan-50',    pillTxt: 'text-aegean',       pillRing: 'ring-cyan-200' },
  'Macera':     { dotBg: 'bg-orange-500',   pillBg: 'bg-orange-50',  pillTxt: 'text-orange-700',  pillRing: 'ring-orange-200' },
  'Spa':        { dotBg: 'bg-rose-400',     pillBg: 'bg-rose-50',    pillTxt: 'text-rose-700',    pillRing: 'ring-rose-200' },
  'Gastronomi': { dotBg: 'bg-red-500',      pillBg: 'bg-red-50',     pillTxt: 'text-red-700',     pillRing: 'ring-red-200' },
  'Doğa':       { dotBg: 'bg-emerald-500',  pillBg: 'bg-emerald-50', pillTxt: 'text-emerald-700', pillRing: 'ring-emerald-200' },
  'Eğlence':    { dotBg: 'bg-violet-500',   pillBg: 'bg-violet-50',  pillTxt: 'text-violet-700',  pillRing: 'ring-violet-200' },
  'Alışveriş':  { dotBg: 'bg-slate-500',    pillBg: 'bg-slate-100',  pillTxt: 'text-slate-700',   pillRing: 'ring-slate-200' },
};

const TOURS: Tour[] = [
  // ANTALYA
  { id: 1,  city: 'Antalya',  category: 'Deniz',      name_tr: 'Tekne Turu',               name_en: 'Boat Tour',               desc_tr: 'Antalya körfezi, 4 saat, öğle yemeği dahil',    desc_en: 'Antalya bay, 4 hours, lunch included',          duration_tr: '4 saat',    duration_en: '4 hours',   durationMin: 240, price: 45,  image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&q=80' },
  { id: 2,  city: 'Antalya',  category: 'Kültür',     name_tr: 'Kaleiçi Tarihi Tur',        name_en: 'Kaleiçi Historical Tour',  desc_tr: 'Hadrian Kapısı, antik liman, rehberli',         desc_en: "Hadrian's Gate, ancient harbor, guided",        duration_tr: '3 saat',    duration_en: '3 hours',   durationMin: 180, price: 25,  image: 'https://images.unsplash.com/photo-1527838832700-5059252407fa?auto=format&fit=crop&w=800&q=80' },
  { id: 3,  city: 'Antalya',  category: 'Eğlence',    name_tr: 'Aquapark (Land of Legends)', name_en: 'Aquapark (Land of Legends)', desc_tr: 'Sınırsız eğlence, tam gün',                 desc_en: 'Unlimited fun, full day',                       duration_tr: 'Tam gün',   duration_en: 'Full day',  durationMin: 540, price: 60,  image: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=800&q=80' },
  { id: 4,  city: 'Antalya',  category: 'Macera',     name_tr: 'Jeep Safari',               name_en: 'Jeep Safari',             desc_tr: 'Toroslar, şelale, çamur banyosu',              desc_en: 'Taurus Mountains, waterfall, mud bath',         duration_tr: '6 saat',    duration_en: '6 hours',   durationMin: 360, price: 55,  image: 'https://images.unsplash.com/photo-1533632359083-0185df1be85d?auto=format&fit=crop&w=800&q=80' },
  { id: 5,  city: 'Antalya',  category: 'Spa',        name_tr: 'Türk Hamamı & Spa',         name_en: 'Turkish Bath & Spa',      desc_tr: 'Geleneksel kese-köpük, masaj',                 desc_en: 'Traditional scrub, foam massage',               duration_tr: '2 saat',    duration_en: '2 hours',   durationMin: 120, price: 40,  image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80' },
  { id: 6,  city: 'Antalya',  category: 'Macera',     name_tr: 'ATV Safari',                name_en: 'ATV Safari',              desc_tr: 'Gün batımı turları, plaj, orman',              desc_en: 'Sunset tours, beach, forest',                   duration_tr: '3 saat',    duration_en: '3 hours',   durationMin: 180, price: 50,  image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=800&q=80' },
  { id: 7,  city: 'Antalya',  category: 'Doğa',       name_tr: 'Düden Şelalesi Doğa Yürüyüşü', name_en: 'Düden Waterfall Nature Walk', desc_tr: 'Sakin patika, doktor onaylı tempo', desc_en: 'Calm trail, doctor-approved pace',             duration_tr: '2 saat',    duration_en: '2 hours',   durationMin: 120, price: 30,  image: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=800&q=80' },
  { id: 8,  city: 'Antalya',  category: 'Deniz',      name_tr: 'Şnorkel ve Mavi Mağara',    name_en: 'Snorkel & Blue Cave',     desc_tr: 'Kemer kıyısı, ekipman dahil',                  desc_en: 'Kemer coast, equipment included',               duration_tr: '5 saat',    duration_en: '5 hours',   durationMin: 300, price: 70,  image: 'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?auto=format&fit=crop&w=800&q=80' },
  { id: 9,  city: 'Antalya',  category: 'Gastronomi', name_tr: 'Akdeniz Mutfağı Akşam Yemeği', name_en: 'Mediterranean Dinner', desc_tr: 'Şef menüsü, balık, meze, içecek',             desc_en: "Chef's menu, fish, meze, drinks",               duration_tr: '3 saat',    duration_en: '3 hours',   durationMin: 180, price: 65,  image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80' },
  { id: 10, city: 'Antalya',  category: 'Alışveriş',  name_tr: 'Kapalı Çarşı Tur + Kahve',  name_en: 'Bazaar Tour + Coffee',    desc_tr: 'Yerel rehber, baharat, deri, hediyelik',       desc_en: 'Local guide, spices, leather, souvenirs',       duration_tr: '4 saat',    duration_en: '4 hours',   durationMin: 240, price: 35,  image: 'https://images.unsplash.com/photo-1605723517503-3cadb5818a0c?auto=format&fit=crop&w=800&q=80' },
  { id: 11, city: 'Antalya',  category: 'Kültür',     name_tr: 'Aspendos Antik Tiyatro',    name_en: 'Aspendos Ancient Theatre', desc_tr: 'Roma dönemi, rehberliören yeri',             desc_en: 'Roman era, guided archaeological site',         duration_tr: '5 saat',    duration_en: '5 hours',   durationMin: 300, price: 55,  image: 'https://images.unsplash.com/photo-1576487248805-cf45f6bcc67f?auto=format&fit=crop&w=800&q=80' },
  { id: 12, city: 'Antalya',  category: 'Eğlence',    name_tr: 'Delfin & Yunus Şovu',       name_en: 'Dolphin Show',            desc_tr: 'Yarım gün, aileler için',                      desc_en: 'Half day, family-friendly',                     duration_tr: '3 saat',    duration_en: '3 hours',   durationMin: 180, price: 38,  image: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?auto=format&fit=crop&w=800&q=80' },

  // İSTANBUL
  { id: 21, city: 'İstanbul', category: 'Kültür',     name_tr: 'Ayasofya & Sultanahmet',    name_en: 'Hagia Sophia & Sultanahmet', desc_tr: 'Rehberli, Topkapı Sarayı dahil',            desc_en: 'Guided, Topkapı Palace included',               duration_tr: '5 saat',    duration_en: '5 hours',   durationMin: 300, price: 55,  image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=800&q=80' },
  { id: 22, city: 'İstanbul', category: 'Deniz',      name_tr: 'Boğaz Turu Akşam',          name_en: 'Bosphorus Evening Cruise', desc_tr: 'Yat, akşam yemeği, müzik',                    desc_en: 'Yacht, dinner, live music',                     duration_tr: '4 saat',    duration_en: '4 hours',   durationMin: 240, price: 75,  image: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=800&q=80' },
  { id: 23, city: 'İstanbul', category: 'Alışveriş',  name_tr: 'Kapalıçarşı + Mısır Çarşısı', name_en: 'Grand Bazaar + Spice Bazaar', desc_tr: 'Yerel rehber, baharat, takı',            desc_en: 'Local guide, spices, jewelry',                  duration_tr: '4 saat',    duration_en: '4 hours',   durationMin: 240, price: 30,  image: 'https://images.unsplash.com/photo-1605723517503-3cadb5818a0c?auto=format&fit=crop&w=800&q=80' },
  { id: 24, city: 'İstanbul', category: 'Gastronomi', name_tr: 'Karaköy Yemek Turu',        name_en: 'Karaköy Food Tour',       desc_tr: '7 durak, sokak lezzetleri',                    desc_en: '7 stops, street food delicacies',               duration_tr: '3 saat',    duration_en: '3 hours',   durationMin: 180, price: 60,  image: 'https://images.unsplash.com/photo-1555126634-323283e090fa?auto=format&fit=crop&w=800&q=80' },
  { id: 25, city: 'İstanbul', category: 'Spa',        name_tr: 'Çemberlitaş Hamamı',        name_en: 'Çemberlitaş Hammam',      desc_tr: '16. yy hamamı, masaj paketi',                  desc_en: '16th century hammam, massage package',          duration_tr: '2 saat',    duration_en: '2 hours',   durationMin: 120, price: 55,  image: 'https://images.unsplash.com/photo-1610552050890-fe99536c2615?auto=format&fit=crop&w=800&q=80' },
  { id: 26, city: 'İstanbul', category: 'Doğa',       name_tr: 'Belgrad Ormanı Bisiklet',   name_en: 'Belgrade Forest Cycling', desc_tr: 'Kolay parkur, rehberli',                       desc_en: 'Easy trail, guided',                            duration_tr: '3 saat',    duration_en: '3 hours',   durationMin: 180, price: 40,  image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80' },

  // İZMİR
  { id: 31, city: 'İzmir',    category: 'Kültür',     name_tr: 'Efes Antik Kenti',          name_en: 'Ephesus Ancient City',    desc_tr: 'Rehberli, Meryem Ana Evi dahil',               desc_en: 'Guided, House of Virgin Mary included',         duration_tr: 'Tam gün',   duration_en: 'Full day',  durationMin: 540, price: 70,  image: 'https://images.unsplash.com/photo-1589824549824-7e1c75c01a35?auto=format&fit=crop&w=800&q=80' },
  { id: 32, city: 'İzmir',    category: 'Doğa',       name_tr: 'Pamukkale Travertenler',    name_en: 'Pamukkale Travertines',   desc_tr: 'Termal, Hierapolisören yeri',                  desc_en: 'Thermal pools, Hierapolis ancient site',        duration_tr: 'Tam gün',   duration_en: 'Full day',  durationMin: 540, price: 85,  image: 'https://images.unsplash.com/photo-1564507004663-b6dfb3c824d5?auto=format&fit=crop&w=800&q=80' },
  { id: 33, city: 'İzmir',    category: 'Deniz',      name_tr: 'Çeşme Tekne Turu',          name_en: 'Çeşme Boat Tour',         desc_tr: 'Ilıca koyu, yüzme, öğle yemeği',              desc_en: 'Ilıca bay, swimming, lunch',                    duration_tr: '5 saat',    duration_en: '5 hours',   durationMin: 300, price: 55,  image: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=800&q=80' },
  { id: 34, city: 'İzmir',    category: 'Gastronomi', name_tr: 'Alaçatı Şarap Tadımı',      name_en: 'Alaçatı Wine Tasting',    desc_tr: '3 üzüm, peynir eşliği',                        desc_en: '3 grape varieties, cheese pairing',             duration_tr: '3 saat',    duration_en: '3 hours',   durationMin: 180, price: 65,  image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80' },
  { id: 35, city: 'İzmir',    category: 'Alışveriş',  name_tr: 'Kemeraltı Çarşı Tur',       name_en: 'Kemeraltı Bazaar Tour',   desc_tr: 'Tarihi çarşı, yerel ürünler',                  desc_en: 'Historical bazaar, local products',             duration_tr: '3 saat',    duration_en: '3 hours',   durationMin: 180, price: 25,  image: 'https://images.unsplash.com/photo-1604762524889-3e2fcc145683?auto=format&fit=crop&w=800&q=80' },
  { id: 36, city: 'İzmir',    category: 'Macera',     name_tr: 'Sığacık Yelken Dersi',      name_en: 'Sığacık Sailing Lesson',  desc_tr: 'Başlangıç seviyesi, ekipman dahil',            desc_en: 'Beginner level, equipment included',            duration_tr: '4 saat',    duration_en: '4 hours',   durationMin: 240, price: 80,  image: 'https://images.unsplash.com/photo-1500627964684-141351970a7f?auto=format&fit=crop&w=800&q=80' },
];

const CITIES = ['Antalya', 'İstanbul', 'İzmir'];
const CATEGORIES_TR = ['Tümü', 'Kültür', 'Deniz', 'Macera', 'Spa', 'Gastronomi', 'Doğa', 'Eğlence', 'Alışveriş'];
const CATEGORIES_EN = ['All',   'Culture', 'Sea',   'Adventure', 'Spa', 'Gastronomy', 'Nature', 'Entertainment', 'Shopping'];

type SortKey = 'default' | 'price-asc' | 'price-desc' | 'duration';

export default function ToursPage() {
  const { dil } = useDilContext();
  const tr = dil === 'tr';
  const { addItem, incrementQuantity, decrementQuantity, removeItem } = useCartStore();
  const items = useCartStore(s => s.items);
  const { formatla } = useDoviz();
  const { isKlinikYoneticisi } = useKullaniciContext();
  const { setChatAcik } = useChatContext();

  const [city, setCity] = useState('Antalya');
  const [category, setCategory] = useState('');
  const [maxPrice, setMaxPrice] = useState(200);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sort, setSort] = useState<SortKey>('default');
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  const CATEGORIES = tr ? CATEGORIES_TR : CATEGORIES_EN;

  let filtered = TOURS.filter(t => {
    if (t.city !== city) return false;
    if (t.price > maxPrice) return false;
    if (!category) return true;
    const idx = tr
      ? CATEGORIES_TR.indexOf(category)
      : CATEGORIES_EN.indexOf(category);
    return t.category === CATEGORIES_TR[idx];
  });

  if (sort === 'price-asc')  filtered = [...filtered].sort((a, b) => a.price - b.price);
  if (sort === 'price-desc') filtered = [...filtered].sort((a, b) => b.price - a.price);
  if (sort === 'duration')   filtered = [...filtered].sort((a, b) => a.durationMin - b.durationMin);

  function getQty(id: number) { return quantities[id] || 1; }

  function addTour(t: Tour) {
    addItem({
      id: `tour-${t.id}`,
      type: 'tour',
      name: tr ? t.name_tr : t.name_en,
      detail: `${city} · ${tr ? t.duration_tr : t.duration_en}`,
      unitPrice: t.price,
      quantity: getQty(t.id),
    });
  }

  function toggleFav(id: number) {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  }

  const sliderPct = Math.round(((maxPrice - 10) / (200 - 10)) * 100);

  return (
    <main className="min-h-screen bg-pearl font-sans">

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section
        className="grain relative overflow-hidden pb-20 md:pb-24"
        style={{
          background:
            'radial-gradient(ellipse at top right, rgba(8,145,178,0.35), transparent 55%), radial-gradient(ellipse at bottom left, rgba(217,119,6,0.18), transparent 50%), linear-gradient(180deg,#0a1124 0%,#0f172a 60%,#0a0f1f 100%)',
        }}
      >
        {/* Antalya background image */}
        <div
          className="absolute inset-0 opacity-25 mix-blend-luminosity"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1527838832700-5059252407fa?auto=format&fit=crop&w=2400&q=80')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        {/* Seljuk watermark */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.06] seljuk-bg"
        />

        <div className="relative mx-auto max-w-7xl px-6 pt-14 md:pt-20 lg:px-8">
          {/* breadcrumb */}
          <div className="mb-6 flex items-center gap-2 text-xs font-medium text-white/50">
            <a href="/" className="hover:text-white/80 transition">
              {tr ? 'Ana Sayfa' : 'Home'}
            </a>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            <span className="text-amber-300">{tr ? 'Aktiviteler & Turlar' : 'Activities & Tours'}</span>
          </div>

          <div className="max-w-3xl">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-amber-300">
              {tr ? 'Aktiviteler & Turlar · Akdeniz Kültürü' : 'Activities & Tours · Mediterranean Culture'}
            </p>
            <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl tracking-tight text-white leading-[0.95]">
              {tr ? (
                <>Tedavinizin Yanında{' '}
                  <span className="italic bg-gradient-to-r from-cyan-300 via-amber-200 to-amber-400 bg-clip-text text-transparent">Keşfedin</span>
                </>
              ) : (
                <>Explore Beyond{' '}
                  <span className="italic bg-gradient-to-r from-cyan-300 via-amber-200 to-amber-400 bg-clip-text text-transparent">Your Treatment</span>
                </>
              )}
            </h1>
            <p className="mt-5 max-w-xl text-base sm:text-lg text-white/65">
              {tr
                ? "İstanbul, Antalya ve İzmir'de unutulmaz deneyimler — yerel rehberler, küçük gruplar, doktor onaylı sakin aktiviteler."
                : 'Unforgettable experiences in Istanbul, Antalya and İzmir — local guides, small groups, doctor-approved calm activities.'}
            </p>
          </div>
        </div>
      </section>

      {/* ── FILTERS (overlapping hero) ──────────────────────── */}
      <section className="relative -mt-12 md:-mt-14 z-10 px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-2xl bg-white p-5 sm:p-6 shadow-[0_30px_50px_-20px_rgba(15,23,42,0.25)] ring-1 ring-slate-200/70">

          {/* City tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-2 hidden sm:inline text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
              {tr ? 'Şehir' : 'City'}
            </span>
            {CITIES.map(c => (
              <button
                key={c}
                onClick={() => { setCity(c); setCategory(''); }}
                className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                  city === c
                    ? 'bg-navy text-white'
                    : 'bg-white border border-slate-200 text-slate-700 hover:border-aegean hover:text-aegean'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="my-5 h-px w-full bg-slate-100" />

          {/* Category chips */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
              {tr ? 'Kategori' : 'Category'}
            </span>
            {CATEGORIES.map((cat, i) => {
              const isAll = i === 0;
              const active = isAll ? !category : category === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setCategory(isAll ? '' : cat)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                    active
                      ? 'bg-navy text-white'
                      : 'bg-white border border-slate-200 text-slate-700 hover:border-aegean hover:text-aegean'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          <div className="my-5 h-px w-full bg-slate-100" />

          {/* Date + price row */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_2fr_auto]">
            <label className="block">
              <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 mb-1.5">
                {tr ? 'Başlangıç' : 'Start'}
              </span>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-pearl/50 px-3.5 py-2.5 text-sm font-medium text-navy focus:outline-none focus:ring-2 focus:ring-aegean/40 focus:border-aegean"
              />
            </label>
            <label className="block">
              <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 mb-1.5">
                {tr ? 'Bitiş' : 'End'}
              </span>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-pearl/50 px-3.5 py-2.5 text-sm font-medium text-navy focus:outline-none focus:ring-2 focus:ring-aegean/40 focus:border-aegean"
              />
            </label>
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <div className="flex items-baseline justify-between mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                    {tr ? 'Maks. Fiyat' : 'Max Price'}
                  </span>
                  <span className="font-serif text-lg text-navy">{formatla(maxPrice)}</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="200"
                  step="5"
                  value={maxPrice}
                  onChange={e => setMaxPrice(Number(e.target.value))}
                  className="price-slider"
                  style={{ '--p': `${sliderPct}%` } as React.CSSProperties}
                />
              </div>
            </div>
            <div className="flex items-end">
              <span className="hidden sm:inline-flex items-center rounded-full bg-cyan-50 px-3 py-2 text-xs font-bold text-aegean ring-1 ring-cyan-100 whitespace-nowrap">
                {filtered.length} {tr ? 'sonuç' : 'results'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── RESULTS HEADER ──────────────────────────────────── */}
      <section
        className="relative"
        style={{
          background:
            'radial-gradient(ellipse at top right, rgba(8,145,178,0.10), transparent 60%), radial-gradient(ellipse at bottom left, rgba(217,119,6,0.06), transparent 55%)',
        }}
      >
        <div className="mx-auto max-w-7xl px-6 pt-14 lg:px-8">
          <div className="flex items-end justify-between gap-4 mb-8">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-aegean">
                {tr ? 'Aktiviteler' : 'Activities'}
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl tracking-tight text-navy mt-1">
                {city}{' '}
                <span className="italic text-slate-400">·</span>{' '}
                <span className="italic">{tr ? 'size özel deneyimler' : 'experiences for you'}</span>
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <label className="hidden sm:block text-xs font-semibold uppercase tracking-wider text-slate-500">
                {tr ? 'Sırala' : 'Sort'}
              </label>
              <div className="relative">
                <select
                  value={sort}
                  onChange={e => setSort(e.target.value as SortKey)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 pr-9 text-sm font-semibold text-navy appearance-none focus:outline-none focus:ring-2 focus:ring-aegean/40 focus:border-aegean"
                >
                  <option value="default">{tr ? 'Önerilenler' : 'Recommended'}</option>
                  <option value="price-asc">{tr ? 'Fiyat: düşükten yükseğe' : 'Price: low to high'}</option>
                  <option value="price-desc">{tr ? 'Fiyat: yüksekten düşüğe' : 'Price: high to low'}</option>
                  <option value="duration">{tr ? 'Süreye göre' : 'By duration'}</option>
                </select>
                <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TOUR GRID ────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 pb-24 lg:px-8">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="font-serif text-2xl text-navy mb-2">
              {tr ? 'Sonuç bulunamadı' : 'No results found'}
            </div>
            <div className="text-sm text-slate-500">
              {tr ? 'Kategori veya fiyat üst sınırını değiştirmeyi deneyin.' : 'Try adjusting the category or price limit.'}
            </div>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map(t => {
              const meta = CAT_META[t.category] ?? CAT_META['Kültür'];
              const catLabel = tr ? t.category : CATEGORIES_EN[CATEGORIES_TR.indexOf(t.category)];
              const cartItem = items.find(i => i.id === `tour-${t.id}`);
              const qty = getQty(t.id);
              const isFav = favorites.has(t.id);

              return (
                <div key={t.id} className="mag-card group">
                  <article className="relative overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm transition-shadow duration-300 hover:shadow-xl">

                    {/* Image */}
                    <div className="relative h-52 overflow-hidden">
                      <img
                        src={t.image}
                        alt={tr ? t.name_tr : t.name_en}
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/20 to-navy/0" />

                      {/* Category badge */}
                      <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-navy ring-1 ring-white/40 backdrop-blur">
                        <span className={`h-1.5 w-1.5 rounded-full ${meta.dotBg}`} />
                        {catLabel}
                      </span>

                      {/* Favorite */}
                      <button
                        onClick={() => toggleFav(t.id)}
                        aria-label={tr ? 'Favori' : 'Favorite'}
                        className={`absolute top-3 right-3 grid h-8 w-8 place-items-center rounded-full bg-white/15 backdrop-blur ring-1 ring-white/25 transition hover:bg-white/25 ${isFav ? 'text-amber-400' : 'text-white'}`}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill={isFav ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/></svg>
                      </button>

                      {/* Duration badge */}
                      <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-navy/80 backdrop-blur px-2.5 py-1 text-[10px] font-bold text-white ring-1 ring-white/15">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        {tr ? t.duration_tr : t.duration_en}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h3 className="font-serif text-[22px] leading-tight text-navy">
                        {tr ? t.name_tr : t.name_en}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {tr ? t.desc_tr : t.desc_en}
                      </p>

                      <div className="mt-4 flex items-end justify-between border-t border-slate-100 pt-4">
                        <div>
                          {t.price === 0 ? (
                            <>
                              <div className="font-serif text-3xl text-emerald-600 leading-none">
                                {tr ? 'Ücretsiz' : 'Free'}
                              </div>
                              <div className="mt-1 text-[10px] uppercase tracking-wider text-slate-400">
                                {city} · {catLabel}
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="font-serif text-3xl text-navy leading-none">
                                {formatla(t.price)}
                                <span className="ml-1 text-xs font-sans font-medium text-slate-400">
                                  /{tr ? 'kişi' : 'person'}
                                </span>
                              </div>
                              <div className="mt-1 text-[10px] uppercase tracking-wider text-slate-400">
                                {city} · {catLabel}
                              </div>
                            </>
                          )}
                        </div>

                        {!isKlinikYoneticisi && (
                          cartItem ? (
                            <div className="flex flex-col items-end gap-1.5">
                              <div className="inline-flex items-center rounded-full ring-1 ring-slate-200 bg-white">
                                <button
                                  onClick={() => decrementQuantity(`tour-${t.id}`)}
                                  className="grid h-8 w-8 place-items-center text-slate-500 hover:text-navy"
                                >
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/></svg>
                                </button>
                                <span className="min-w-6 text-center text-sm font-bold text-navy">{cartItem.quantity}</span>
                                <button
                                  onClick={() => incrementQuantity(`tour-${t.id}`)}
                                  className="grid h-8 w-8 place-items-center text-slate-500 hover:text-navy"
                                >
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
                                </button>
                              </div>
                              <button
                                onClick={() => removeItem(`tour-${t.id}`)}
                                className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors"
                              >
                                {tr ? 'Sepetten Çıkar' : 'Remove'}
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <div className="inline-flex items-center rounded-full ring-1 ring-slate-200 bg-white">
                                <button
                                  onClick={() => setQuantities(q => ({ ...q, [t.id]: Math.max(1, (q[t.id] || 1) - 1) }))}
                                  className="grid h-8 w-8 place-items-center text-slate-500 hover:text-navy"
                                >
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/></svg>
                                </button>
                                <span className="min-w-6 text-center text-sm font-bold text-navy">{qty}</span>
                                <button
                                  onClick={() => setQuantities(q => ({ ...q, [t.id]: (q[t.id] || 1) + 1 }))}
                                  className="grid h-8 w-8 place-items-center text-slate-500 hover:text-navy"
                                >
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
                                </button>
                              </div>
                              <button
                                onClick={() => addTour(t)}
                                className="inline-flex items-center gap-1 rounded-full bg-navy px-3.5 py-2 text-xs font-bold text-white hover:bg-navy/85 transition"
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
                                {tr ? 'Ekle' : 'Add'}
                              </button>
                            </div>
                          )
                        )}
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
