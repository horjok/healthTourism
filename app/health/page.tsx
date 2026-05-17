'use client';

import { useState, useEffect } from 'react';
import { useDilContext } from '@/lib/DilContext';
import { useCartStore } from '@/lib/cartStore';
import { useKullaniciContext } from '@/lib/KullaniciContext';

type Operation = {
  id: string;
  category: string;
  name_tr: string;
  name_en: string;
  desc_tr: string;
  desc_en: string;
  duration_tr: string;
  duration_en: string;
  price_from: number;
};

type Clinic = {
  id: number;
  supabase_id?: string;
  name: string;
  city: string;
  stars: number;
  specialties: string[];
  rating: number;
  reviews: number;
  accredited: boolean;
  reliability: number;
  price_from: number;
  image: string;
  doctors: { name: string; title_tr: string; title_en: string; experience: number; languages: string[] }[];
};

const OPERATIONS: Operation[] = [
  // SAÇ EKİMİ
  { id: 'fue',    category: 'sac', name_tr: 'FUE Saç Ekimi',      name_en: 'FUE Hair Transplant',  desc_tr: 'Follükül ünitesi ekstraksiyonu, en yaygın yöntem',     desc_en: 'Follicular unit extraction, most common method',     duration_tr: '6-8 saat',    duration_en: '6-8 hours',   price_from: 1200 },
  { id: 'dhi',    category: 'sac', name_tr: 'DHI Saç Ekimi',      name_en: 'DHI Hair Transplant',  desc_tr: 'Kalem tekniği, daha hızlı iyileşme',                   desc_en: 'Pen technique, faster recovery',                    duration_tr: '6-8 saat',    duration_en: '6-8 hours',   price_from: 1400 },
  { id: 'safir',  category: 'sac', name_tr: 'Safir FUE',          name_en: 'Sapphire FUE',         desc_tr: 'Safir bıçakla minimal iz, premium sonuç',             desc_en: 'Sapphire blade, minimal scarring, premium result',  duration_tr: '7-9 saat',    duration_en: '7-9 hours',   price_from: 1600 },
  { id: 'mezot',  category: 'sac', name_tr: 'Saç Mezoterapisi',   name_en: 'Hair Mesotherapy',     desc_tr: 'İğnesiz beslenme tedavisi',                            desc_en: 'Non-invasive nutrition treatment',                  duration_tr: '1 saat',      duration_en: '1 hour',      price_from: 300  },
  // DİŞ
  { id: 'implant',  category: 'dis', name_tr: 'Dental İmplant',    name_en: 'Dental Implant',    desc_tr: 'Kayıp diş için kalıcı çözüm',          desc_en: 'Permanent solution for missing teeth',   duration_tr: '1-2 saat',  duration_en: '1-2 hours',  price_from: 800  },
  { id: 'hollywood',category: 'dis', name_tr: 'Hollywood Smile',   name_en: 'Hollywood Smile',   desc_tr: 'Porselen kaplamalar ile kusursuz gülüş', desc_en: 'Perfect smile with porcelain veneers',   duration_tr: '2-3 gün',   duration_en: '2-3 days',   price_from: 1200 },
  { id: 'zirkonyum',category: 'dis', name_tr: 'Zirkonyum Kaplama', name_en: 'Zirconia Crown',    desc_tr: 'Metal içermeyen, doğal görünüm',         desc_en: 'Metal-free, natural appearance',          duration_tr: '2-3 gün',   duration_en: '2-3 days',   price_from: 900  },
  { id: 'kanal',    category: 'dis', name_tr: 'Kanal Tedavisi',    name_en: 'Root Canal',        desc_tr: 'Enfekte diş kurtarma tedavisi',          desc_en: 'Infected tooth rescue treatment',         duration_tr: '1-2 saat',  duration_en: '1-2 hours',  price_from: 400  },
  // ESTETİK
  { id: 'rinoplasti', category: 'estetik', name_tr: 'Rinoplasti',    name_en: 'Rhinoplasty',     desc_tr: 'Burun estetiği ve düzeltme',               desc_en: 'Nose aesthetics and correction',       duration_tr: '2-3 saat', duration_en: '2-3 hours', price_from: 2500 },
  { id: 'lipo',       category: 'estetik', name_tr: 'Liposuction',   name_en: 'Liposuction',     desc_tr: 'Yağ alma ve vücut şekillendirme',          desc_en: 'Fat removal and body contouring',      duration_tr: '2-4 saat', duration_en: '2-4 hours', price_from: 2000 },
  { id: 'meme',       category: 'estetik', name_tr: 'Meme Estetiği', name_en: 'Breast Aesthetics',desc_tr: 'Büyütme, küçültme, dikleştirme',           desc_en: 'Augmentation, reduction, lift',        duration_tr: '2-3 saat', duration_en: '2-3 hours', price_from: 3000 },
  { id: 'bbl',        category: 'estetik', name_tr: 'BBL',           name_en: 'BBL',             desc_tr: 'Brezilya tipi kalça estetiği',              desc_en: 'Brazilian butt lift',                  duration_tr: '3-4 saat', duration_en: '3-4 hours', price_from: 3500 },
  // GÖZ
  { id: 'lasik',    category: 'goz', name_tr: 'LASIK',              name_en: 'LASIK',           desc_tr: 'Lazer ile miyopi, astigmat düzeltme', desc_en: 'Laser correction of myopia, astigmatism', duration_tr: '30 dakika', duration_en: '30 minutes', price_from: 1400 },
  { id: 'lasek',    category: 'goz', name_tr: 'LASEK',              name_en: 'LASEK',           desc_tr: 'Kornea zayıflığı olanlar için',        desc_en: 'For those with weak cornea',              duration_tr: '30 dakika', duration_en: '30 minutes', price_from: 1200 },
  { id: 'katarakt', category: 'goz', name_tr: 'Katarakt Ameliyatı', name_en: 'Cataract Surgery',desc_tr: 'Bulanık görme çözümü',                 desc_en: 'Solution for blurry vision',              duration_tr: '1 saat',    duration_en: '1 hour',    price_from: 1800 },
];

const CATEGORIES = [
  { id: 'sac',     icon: '💆', tr: 'Saç Ekimi',       en: 'Hair Transplant'    },
  { id: 'dis',     icon: '🦷', tr: 'Diş Sağlığı',     en: 'Dental Health'      },
  { id: 'estetik', icon: '✨', tr: 'Estetik Cerrahi', en: 'Aesthetic Surgery'  },
  { id: 'goz',     icon: '👁️', tr: 'Göz Tedavisi',    en: 'Eye Treatment'      },
];

export default function HealthPage() {
  const { dil } = useDilContext();
  const tr = dil === 'tr';
  const { addItem } = useCartStore();
  const { isKlinikYoneticisi } = useKullaniciContext();

  const [category, setCategory]           = useState('sac');
  const [selectedOp, setSelectedOp]       = useState<Operation | null>(null);
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [complaint, setComplaint]         = useState('');
  const [date, setDate]                   = useState('');
  const [expandedClinic, setExpandedClinic] = useState<number | null>(null);
  const [added, setAdded]                 = useState(false);
  const [starFilter, setStarFilter]       = useState(0);

  // Supabase'den çekilen klinikler
  const [tumKlinikler, setTumKlinikler]   = useState<Clinic[]>([]);
  const [klinikYukleniyor, setKlinikYukleniyor] = useState(true);
  const [klinikHata, setKlinikHata]       = useState(false);

  useEffect(() => {
    fetch('/api/health/klinikler')
      .then(r => r.json())
      .then(json => {
        if (json.success) setTumKlinikler(json.data as Clinic[]);
        else setKlinikHata(true);
      })
      .catch(() => setKlinikHata(true))
      .finally(() => setKlinikYukleniyor(false));
  }, []);

  const ops = OPERATIONS.filter(o => o.category === category);
  const clinics = tumKlinikler.filter(c =>
    c.specialties.includes(category) &&
    (starFilter === 0 || c.stars === starFilter)
  );

  function handleAdd() {
    if (!selectedOp || !selectedClinic) return;
    addItem({
      id:        `health-${selectedOp.id}-${selectedClinic.id}`,
      type:      'health',
      name:      `${tr ? selectedOp.name_tr : selectedOp.name_en} — ${selectedClinic.name}`,
      detail:    `${selectedClinic.city} · ${tr ? selectedOp.duration_tr : selectedOp.duration_en}${complaint ? ' · ' + complaint.slice(0, 40) : ''}`,
      unitPrice: selectedOp.price_from,
      quantity:  1,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <main className="min-h-screen bg-[#f8fafc]">

      {/* HEADER */}
      <section className="relative px-6 py-16 text-center overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0a1628 0%, #0f3460 100%)' }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div className="relative">
          <p className="text-blue-200/70 text-xs font-semibold uppercase tracking-widest mb-3">
            {tr ? 'Sağlık Hizmetleri' : 'Health Services'}
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            {tr ? 'Tedavinizi Planlayın' : 'Plan Your Treatment'}
          </h1>
          <p className="text-blue-100/70 text-lg max-w-xl mx-auto">
            {tr ? 'Şikayetinizi yazın, operasyon ve klinik seçin' : 'Describe your concern, select operation and clinic'}
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* ŞİKAYET YAZMA */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
          <h2 className="text-base font-bold text-gray-900 mb-1">
            {tr ? '📝 Sağlık Durumunuzu Belirtin' : '📝 Describe Your Health Concern'}
          </h2>
          <p className="text-sm text-gray-400 mb-4">
            {tr ? 'Şikayetinizi yazın veya aşağıdan kategori seçin' : 'Write your concern or select a category below'}
          </p>
          <textarea
            value={complaint}
            onChange={e => setComplaint(e.target.value)}
            placeholder={tr ? 'Örn: Saçlarım 3 yıldır dökülüyor, ön bölgede seyreklik var...' : 'E.g.: My hair has been falling out for 3 years, thinning in the front area...'}
            rows={3}
            maxLength={500}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f3460]/30 resize-none mb-3"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">{complaint.length}/500</span>
            <a href="/packages?chat=true"
              className="text-xs text-[#0f3460] font-semibold hover:underline">
              ✨ {tr ? 'AI ile analiz et →' : 'Analyze with AI →'}
            </a>
          </div>
        </div>

        {/* KATEGORİ SEÇİMİ */}
        <div className="mb-8">
          <h2 className="text-base font-bold text-gray-900 mb-4">
            {tr ? '1. Tedavi Kategorisi Seçin' : '1. Select Treatment Category'}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => { setCategory(cat.id); setSelectedOp(null); setSelectedClinic(null); }}
                className={`p-4 rounded-2xl border-2 text-left transition-all hover:scale-105 ${
                  category === cat.id
                    ? 'border-[#0f3460] bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}>
                <div className="text-3xl mb-2">{cat.icon}</div>
                <div className="text-sm font-bold text-gray-800">{tr ? cat.tr : cat.en}</div>
                {category === cat.id && (
                  <div className="w-2 h-2 bg-[#0f3460] rounded-full mt-2" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* OPERASYON SEÇİMİ */}
        <div className="mb-8">
          <h2 className="text-base font-bold text-gray-900 mb-4">
            {tr ? '2. Operasyon Seçin' : '2. Select Operation'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {ops.map(op => (
              <button key={op.id} onClick={() => setSelectedOp(op)}
                className={`p-4 rounded-2xl border-2 text-left transition-all ${
                  selectedOp?.id === op.id
                    ? 'border-[#0f3460] bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="text-sm font-bold text-gray-900 mb-0.5">
                      {tr ? op.name_tr : op.name_en}
                    </div>
                    <div className="text-xs text-gray-400 mb-2">
                      {tr ? op.desc_tr : op.desc_en}
                    </div>
                    <div className="flex gap-2">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        ⏱ {tr ? op.duration_tr : op.duration_en}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-base font-extrabold text-[#0f3460]">€{op.price_from.toLocaleString('tr-TR')}</div>
                    <div className="text-xs text-gray-400">{tr ? "'den başlayan" : 'from'}</div>
                  </div>
                </div>
                {selectedOp?.id === op.id && (
                  <div className="mt-2 text-xs text-[#0f3460] font-bold">✓ {tr ? 'Seçildi' : 'Selected'}</div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* KLİNİK SEÇİMİ */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900">
              {tr ? '3. Klinik Seçin' : '3. Select Clinic'}
            </h2>
            <div className="flex gap-2">
              <button onClick={() => setStarFilter(0)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${starFilter === 0 ? 'bg-[#0f3460] text-white' : 'bg-gray-100 text-gray-600'}`}>
                {tr ? 'Tümü' : 'All'}
              </button>
              {[5, 4, 3].map(s => (
                <button key={s} onClick={() => setStarFilter(s)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${starFilter === s ? 'bg-[#0f3460] text-white' : 'bg-gray-100 text-gray-600'}`}>
                  {s}★
                </button>
              ))}
            </div>
          </div>

          {/* Yükleniyor */}
          {klinikYukleniyor && (
            <div className="flex justify-center py-16">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-[#0f3460] border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-400 text-sm">{tr ? 'Klinikler yükleniyor...' : 'Loading clinics...'}</p>
              </div>
            </div>
          )}

          {/* Hata */}
          {!klinikYukleniyor && klinikHata && (
            <div className="text-center py-12 bg-red-50 rounded-2xl border border-red-100">
              <p className="text-red-500 font-semibold">{tr ? 'Klinikler yüklenemedi' : 'Could not load clinics'}</p>
              <p className="text-gray-400 text-sm mt-1">{tr ? 'Lütfen sayfayı yenileyin' : 'Please refresh the page'}</p>
            </div>
          )}

          {/* Klinik listesi */}
          {!klinikYukleniyor && !klinikHata && (
            <div className="space-y-4">
              {clinics.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                  <p className="text-4xl mb-3">🏥</p>
                  <p className="text-gray-600 font-medium">
                    {tr ? 'Bu kategoride klinik bulunamadı' : 'No clinics found in this category'}
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    {tr ? 'Farklı bir kategori seçin' : 'Try selecting a different category'}
                  </p>
                </div>
              ) : clinics.map(clinic => (
                <div key={clinic.id}
                  className={`bg-white rounded-2xl border-2 overflow-hidden transition-all ${
                    selectedClinic?.id === clinic.id ? 'border-[#0f3460]' : 'border-gray-100 hover:border-gray-200'
                  }`}>
                  <div className="flex items-stretch">
                    {/* Görsel */}
                    <div className="w-32 h-32 shrink-0 overflow-hidden">
                      <img src={clinic.image} alt={clinic.name}
                        className="w-full h-full object-cover" />
                    </div>

                    {/* Bilgi */}
                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-bold text-gray-900">{clinic.name}</h3>
                            {clinic.accredited && (
                              <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">JCI ✓</span>
                            )}
                          </div>
                          <div className="text-xs text-gray-400 mb-2">
                            {clinic.city} · {'★'.repeat(clinic.stars)} · ⭐ {clinic.rating} ({clinic.reviews})
                          </div>
                          <div className="flex gap-2 flex-wrap">
                            <span className="text-xs bg-blue-50 text-[#0f3460] px-2 py-0.5 rounded-full border border-blue-100">
                              🛡️ {tr ? 'Güvenilirlik' : 'Reliability'}: {clinic.reliability}%
                            </span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-lg font-extrabold text-[#0f3460]">€{clinic.price_from.toLocaleString('tr-TR')}</div>
                          <div className="text-xs text-gray-400">{tr ? "'den" : 'from'}</div>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => setSelectedClinic(selectedClinic?.id === clinic.id ? null : clinic)}
                          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                            selectedClinic?.id === clinic.id
                              ? 'bg-[#0f3460] text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}>
                          {selectedClinic?.id === clinic.id ? '✓ ' + (tr ? 'Seçildi' : 'Selected') : (tr ? 'Seç' : 'Select')}
                        </button>
                        <button
                          onClick={() => setExpandedClinic(expandedClinic === clinic.id ? null : clinic.id)}
                          className="px-4 py-2 text-xs font-bold rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all">
                          {tr ? 'Doktorlar' : 'Doctors'} {expandedClinic === clinic.id ? '▲' : '▼'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Doktorlar */}
                  {expandedClinic === clinic.id && (
                    <div className="border-t border-gray-100 px-4 py-4 bg-gray-50">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                        {tr ? 'Uzman Doktorlar' : 'Expert Doctors'}
                      </div>
                      <div className="space-y-3">
                        {clinic.doctors.map((doc, i) => (
                          <div key={i} className="flex items-center gap-3 bg-white rounded-xl p-3">
                            <div className="w-10 h-10 rounded-full bg-[#0f3460] text-white flex items-center justify-center text-sm font-bold shrink-0">
                              {doc.name.split(' ').pop()?.charAt(0)}
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-bold text-gray-900">{doc.name}</div>
                              <div className="text-xs text-gray-400">
                                {tr ? doc.title_tr : doc.title_en} · {doc.experience} {tr ? 'yıl' : 'yrs'}
                              </div>
                            </div>
                            <div className="flex gap-1">
                              {doc.languages.map(l => (
                                <span key={l} className="text-xs bg-blue-50 text-[#0f3460] px-1.5 py-0.5 rounded font-medium">{l}</span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* TARİH + SEPETE EKLE */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-bold text-gray-900 mb-4">
            {tr ? '4. Tarih Seçin ve Sepete Ekleyin' : '4. Select Date and Add to Cart'}
          </h2>

          <div className="mb-6">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
              {tr ? 'Tercih Ettiğiniz Tarih' : 'Preferred Date'}
            </label>
            <input type="date" value={date}
              min={new Date().toISOString().split('T')[0]}
              onChange={e => setDate(e.target.value)}
              className="w-full md:w-64 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f3460]/30" />
          </div>

          {/* Özet */}
          {(selectedOp || selectedClinic) && (
            <div className="bg-blue-50 rounded-xl p-4 mb-6 space-y-2">
              {selectedOp && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{tr ? 'Operasyon:' : 'Operation:'}</span>
                  <span className="font-bold text-gray-900">{tr ? selectedOp.name_tr : selectedOp.name_en}</span>
                </div>
              )}
              {selectedClinic && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{tr ? 'Klinik:' : 'Clinic:'}</span>
                  <span className="font-bold text-gray-900">{selectedClinic.name}</span>
                </div>
              )}
              {selectedOp && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{tr ? 'Başlangıç fiyatı:' : 'Starting price:'}</span>
                  <span className="font-extrabold text-[#0f3460]">€{selectedOp.price_from.toLocaleString('tr-TR')}</span>
                </div>
              )}
            </div>
          )}

          {!isKlinikYoneticisi && (
            <button
              onClick={handleAdd}
              disabled={!selectedOp || !selectedClinic || added}
              className={`w-full py-4 font-bold rounded-2xl text-base transition-all ${
                added
                  ? 'bg-green-500 text-white'
                  : selectedOp && selectedClinic
                  ? 'bg-[#0f3460] text-white hover:bg-[#0a1628] shadow-lg hover:scale-[1.02]'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}>
              {added
                ? '✓ ' + (tr ? 'Sepete Eklendi!' : 'Added to Cart!')
                : !selectedOp
                ? (tr ? 'Önce operasyon seçin' : 'Select an operation first')
                : !selectedClinic
                ? (tr ? 'Önce klinik seçin' : 'Select a clinic first')
                : (tr ? '🛒 Sepete Ekle' : '🛒 Add to Cart')}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
