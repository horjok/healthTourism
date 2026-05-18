'use client';

import { useState, useEffect } from 'react';
import { useDilContext } from '@/lib/DilContext';
import { useCartStore } from '@/lib/cartStore';
import { useKullaniciContext } from '@/lib/KullaniciContext';

type Operation = {
  id: string; category: string;
  name_tr: string; name_en: string;
  desc_tr: string; desc_en: string;
  duration_tr: string; duration_en: string;
  price_from: number;
};

type Clinic = {
  id: number; supabase_id?: string; name: string; city: string; stars: number;
  specialties: string[]; rating: number; reviews: number; accredited: boolean;
  reliability: number; price_from: number; image: string;
  doctors: { name: string; title_tr: string; title_en: string; experience: number; languages: string[] }[];
};

const CATEGORIES = [
  { id: 'sac',     icon: '💆', tr: 'Saç Ekimi',       en: 'Hair Transplant'   },
  { id: 'dis',     icon: '🦷', tr: 'Diş Sağlığı',     en: 'Dental Health'     },
  { id: 'estetik', icon: '✨', tr: 'Estetik Cerrahi', en: 'Aesthetic Surgery' },
  { id: 'goz',     icon: '👁️', tr: 'Göz Tedavisi',    en: 'Eye Treatment'     },
];

export default function HealthPage() {
  const { dil } = useDilContext();
  const tr = dil === 'tr';
  const { addItem } = useCartStore();
  const { isKlinikYoneticisi } = useKullaniciContext();

  const [category, setCategory]             = useState('sac');
  const [selectedOp, setSelectedOp]         = useState<Operation | null>(null);
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [complaint, setComplaint]           = useState('');
  const [date, setDate]                     = useState('');
  const [expandedClinic, setExpandedClinic] = useState<number | null>(null);
  const [added, setAdded]                   = useState(false);
  const [starFilter, setStarFilter]         = useState(0);
  const [tumKlinikler, setTumKlinikler]     = useState<Clinic[]>([]);
  const [operasyonlar, setOperasyonlar]     = useState<Operation[]>([]);
  const [klinikYukleniyor, setKlinikYukleniyor] = useState(true);
  const [klinikHata, setKlinikHata]         = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/health/klinikler').then(r => r.json()),
      fetch('/api/saglik-operasyonlari').then(r => r.json()),
    ]).then(([klinikJson, opJson]) => {
      if (klinikJson.success) setTumKlinikler(klinikJson.data as Clinic[]);
      else setKlinikHata(true);
      if (opJson.success) setOperasyonlar(opJson.data as Operation[]);
    }).catch(() => setKlinikHata(true))
      .finally(() => setKlinikYukleniyor(false));
  }, []);

  const ops = operasyonlar.filter(o => o.category === category);
  const clinics = tumKlinikler.filter(c =>
    c.specialties.includes(category) && (starFilter === 0 || c.stars === starFilter)
  );

  function handleAdd() {
    if (!selectedOp || !selectedClinic) return;
    addItem({
      id: `health-${selectedOp.id}-${selectedClinic.id}`,
      type: 'health',
      name: `${tr ? selectedOp.name_tr : selectedOp.name_en} — ${selectedClinic.name}`,
      detail: `${selectedClinic.city} · ${tr ? selectedOp.duration_tr : selectedOp.duration_en}${complaint ? ' · ' + complaint.slice(0, 40) : ''}`,
      unitPrice: selectedOp.price_from,
      quantity: 1,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <main className="min-h-screen" style={{ background: '#FDFBF7' }}>

      {/* HEADER */}
      <section className="relative overflow-hidden px-6 py-20 text-center"
        style={{ background: 'linear-gradient(135deg, #0D1E25 0%, #060f13 100%)' }}>
        <div className="absolute inset-0 opacity-15 mix-blend-luminosity"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.05]">
          <svg className="h-full w-full"><defs><pattern id="seljuk-health" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
            <g fill="none" stroke="white" strokeWidth="1">
              <rect x="25" y="25" width="50" height="50"/>
              <rect x="25" y="25" width="50" height="50" transform="rotate(45 50 50)"/>
            </g>
          </pattern></defs><rect width="100%" height="100%" fill="url(#seljuk-health)"/></svg>
        </div>
        <div className="pointer-events-none absolute -top-20 -right-20 w-80 h-80 rounded-full blur-3xl" style={{ background: 'rgba(0,210,211,0.12)' }} />
        <div className="pointer-events-none absolute -bottom-20 -left-20 w-80 h-80 rounded-full blur-3xl" style={{ background: 'rgba(255,71,87,0.08)' }} />
        <div className="relative">
          <p className="text-[11px] font-bold uppercase tracking-widest mb-4" style={{ color: '#00D2D3' }}>
            {tr ? 'Sağlık Hizmetleri' : 'Health Services'}
          </p>
          <h1 className="font-serif text-4xl md:text-6xl font-bold text-white mb-4">
            {tr ? 'Tedavinizi Planlayın' : 'Plan Your Treatment'}
          </h1>
          <p className="text-lg max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.6)' }}>
            {tr ? 'Şikayetinizi yazın, operasyon ve klinik seçin' : 'Describe your concern, select operation and clinic'}
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">

        {/* 1 — ŞİKAYET */}
        <div className="rounded-2xl p-6" style={{ background: '#FDFBF7', border: '1px solid #e8e0d0' }}>
          <h2 className="font-serif text-2xl mb-1" style={{ color: '#0D1E25' }}>
            {tr ? '📝 Sağlık Durumunuzu Belirtin' : '📝 Describe Your Health Concern'}
          </h2>
          <p className="text-sm mb-4" style={{ color: '#8aa0ad' }}>
            {tr ? 'Şikayetinizi yazın veya aşağıdan kategori seçin' : 'Write your concern or select a category below'}
          </p>
          <textarea
            value={complaint}
            onChange={e => setComplaint(e.target.value)}
            placeholder={tr ? 'Örn: Saçlarım 3 yıldır dökülüyor...' : 'E.g.: My hair has been falling out for 3 years...'}
            rows={3} maxLength={500}
            className="w-full rounded-xl px-4 py-3 text-sm resize-none outline-none transition-all"
            style={{ border: '1px solid #e8e0d0', background: 'white', color: '#0D1E25' }}
            onFocus={e => (e.target.style.borderColor = '#00D2D3')}
            onBlur={e => (e.target.style.borderColor = '#e8e0d0')}
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs" style={{ color: '#8aa0ad' }}>{complaint.length}/500</span>
            <a href="/packages?chat=true" className="text-xs font-semibold transition-colors"
              style={{ color: '#00D2D3' }}>
              ✨ {tr ? 'AI ile analiz et →' : 'Analyze with AI →'}
            </a>
          </div>
        </div>

        {/* 2 — KATEGORİ */}
        <div>
          <h2 className="font-serif text-2xl mb-4" style={{ color: '#0D1E25' }}>
            {tr ? '1. Tedavi Kategorisi Seçin' : '1. Select Treatment Category'}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {CATEGORIES.map(cat => (
              <button key={cat.id}
                onClick={() => { setCategory(cat.id); setSelectedOp(null); setSelectedClinic(null); }}
                className="p-5 rounded-2xl text-left transition-all hover:scale-105"
                style={{
                  background: category === cat.id ? 'rgba(0,210,211,0.08)' : '#FDFBF7',
                  border: category === cat.id ? '2px solid #00D2D3' : '2px solid #e8e0d0',
                  boxShadow: category === cat.id ? '0 0 20px rgba(0,210,211,0.15)' : 'none',
                }}>
                <div className="text-3xl mb-2">{cat.icon}</div>
                <div className="text-sm font-bold" style={{ color: category === cat.id ? '#00D2D3' : '#0D1E25' }}>
                  {tr ? cat.tr : cat.en}
                </div>
                {category === cat.id && (
                  <div className="w-2 h-2 rounded-full mt-2" style={{ background: '#00D2D3' }} />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 3 — OPERASYON */}
        <div>
          <h2 className="font-serif text-2xl mb-4" style={{ color: '#0D1E25' }}>
            {tr ? '2. Operasyon Seçin' : '2. Select Operation'}
          </h2>
          {ops.length === 0 ? (
            <div className="text-center py-10 rounded-2xl" style={{ border: '1px solid #e8e0d0' }}>
              <p style={{ color: '#8aa0ad' }}>{tr ? 'Bu kategoride operasyon bulunamadı' : 'No operations in this category'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {ops.map(op => (
                <button key={op.id} onClick={() => setSelectedOp(op)}
                  className="p-4 rounded-2xl text-left transition-all hover:-translate-y-0.5"
                  style={{
                    background: selectedOp?.id === op.id ? 'rgba(0,210,211,0.06)' : '#FDFBF7',
                    border: selectedOp?.id === op.id ? '2px solid #00D2D3' : '2px solid #e8e0d0',
                  }}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="font-bold mb-0.5" style={{ color: '#0D1E25' }}>
                        {tr ? op.name_tr : op.name_en}
                      </div>
                      <div className="text-xs mb-2" style={{ color: '#8aa0ad' }}>
                        {tr ? op.desc_tr : op.desc_en}
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(0,210,211,0.1)', color: '#00D2D3', border: '1px solid rgba(0,210,211,0.2)' }}>
                        ⏱ {tr ? op.duration_tr : op.duration_en}
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-serif text-xl font-bold" style={{ color: '#FF4757' }}>
                        €{op.price_from.toLocaleString('tr-TR')}
                      </div>
                      <div className="text-xs" style={{ color: '#8aa0ad' }}>{tr ? "'den" : 'from'}</div>
                    </div>
                  </div>
                  {selectedOp?.id === op.id && (
                    <div className="text-xs font-bold mt-2" style={{ color: '#00D2D3' }}>✓ {tr ? 'Seçildi' : 'Selected'}</div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 4 — KLİNİK */}
        <div>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h2 className="font-serif text-2xl" style={{ color: '#0D1E25' }}>
              {tr ? '3. Klinik Seçin' : '3. Select Clinic'}
            </h2>
            <div className="flex gap-2">
              {[0, 5, 4, 3].map(s => (
                <button key={s} onClick={() => setStarFilter(s)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                  style={{
                    background: starFilter === s ? '#0D1E25' : 'transparent',
                    color: starFilter === s ? '#00D2D3' : '#3d5562',
                    border: starFilter === s ? '1px solid #0D1E25' : '1px solid #e8e0d0',
                  }}>
                  {s === 0 ? (tr ? 'Tümü' : 'All') : `${s}★`}
                </button>
              ))}
            </div>
          </div>

          {klinikYukleniyor && (
            <div className="flex justify-center py-10">
              <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin"
                style={{ borderColor: '#00D2D3', borderTopColor: 'transparent' }} />
            </div>
          )}

          {klinikHata && (
            <div className="text-center py-10 rounded-2xl" style={{ border: '1px solid rgba(255,71,87,0.2)', background: 'rgba(255,71,87,0.04)' }}>
              <p style={{ color: '#FF4757' }}>{tr ? 'Klinikler yüklenemedi' : 'Could not load clinics'}</p>
            </div>
          )}

          {!klinikYukleniyor && !klinikHata && (
            <div className="space-y-4">
              {clinics.length === 0 ? (
                <div className="text-center py-12 rounded-2xl" style={{ border: '1px solid #e8e0d0' }}>
                  <p className="text-4xl mb-3">🏥</p>
                  <p className="font-serif text-lg" style={{ color: '#0D1E25' }}>
                    {tr ? 'Bu kategoride klinik bulunamadı' : 'No clinics found in this category'}
                  </p>
                </div>
              ) : clinics.map(clinic => (
                <div key={clinic.id} className="rounded-2xl overflow-hidden transition-all"
                  style={{
                    border: selectedClinic?.id === clinic.id ? '2px solid #00D2D3' : '2px solid #e8e0d0',
                    background: '#FDFBF7',
                    boxShadow: selectedClinic?.id === clinic.id ? '0 0 20px rgba(0,210,211,0.1)' : 'none',
                  }}>
                  <div className="flex items-stretch">
                    <div className="w-32 h-32 shrink-0 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={clinic.image} alt={clinic.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold" style={{ color: '#0D1E25' }}>{clinic.name}</h3>
                            {clinic.accredited && (
                              <span className="rounded-full px-2 py-0.5 text-[10px] font-bold text-[#0D1E25]"
                                style={{ background: '#00D2D3' }}>JCI ✓</span>
                            )}
                          </div>
                          <div className="text-xs mb-2" style={{ color: '#8aa0ad' }}>
                            {clinic.city} · {'★'.repeat(clinic.stars)} · ⭐ {clinic.rating} ({clinic.reviews})
                          </div>
                          <span className="text-xs px-2 py-0.5 rounded-full"
                            style={{ background: 'rgba(0,210,211,0.1)', color: '#00D2D3', border: '1px solid rgba(0,210,211,0.2)' }}>
                            🛡️ {tr ? 'Güvenilirlik' : 'Reliability'}: {clinic.reliability}%
                          </span>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-serif text-xl font-bold" style={{ color: '#FF4757' }}>
                            €{clinic.price_from.toLocaleString('tr-TR')}
                          </div>
                          <div className="text-xs" style={{ color: '#8aa0ad' }}>{tr ? "'den" : 'from'}</div>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => setSelectedClinic(selectedClinic?.id === clinic.id ? null : clinic)}
                          className="px-4 py-2 text-xs font-bold rounded-xl transition-all"
                          style={{
                            background: selectedClinic?.id === clinic.id ? '#0D1E25' : 'transparent',
                            color: selectedClinic?.id === clinic.id ? '#00D2D3' : '#3d5562',
                            border: selectedClinic?.id === clinic.id ? '1px solid #0D1E25' : '1px solid #e8e0d0',
                          }}>
                          {selectedClinic?.id === clinic.id ? '✓ ' + (tr ? 'Seçildi' : 'Selected') : (tr ? 'Seç' : 'Select')}
                        </button>
                        <button
                          onClick={() => setExpandedClinic(expandedClinic === clinic.id ? null : clinic.id)}
                          className="px-4 py-2 text-xs font-bold rounded-xl transition-all"
                          style={{ background: 'transparent', color: '#3d5562', border: '1px solid #e8e0d0' }}>
                          {tr ? 'Doktorlar' : 'Doctors'} {expandedClinic === clinic.id ? '▲' : '▼'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {expandedClinic === clinic.id && (
                    <div className="px-4 py-4" style={{ borderTop: '1px solid #e8e0d0', background: '#F7F1E3' }}>
                      <div className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: '#8aa0ad' }}>
                        {tr ? 'Uzman Doktorlar' : 'Expert Doctors'}
                      </div>
                      <div className="space-y-2">
                        {clinic.doctors.map((doc, i) => (
                          <div key={i} className="flex items-center gap-3 rounded-xl p-3"
                            style={{ background: '#FDFBF7', border: '1px solid #e8e0d0' }}>
                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                              style={{ background: '#0D1E25', color: '#00D2D3' }}>
                              {doc.name.split(' ').pop()?.charAt(0)}
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-bold" style={{ color: '#0D1E25' }}>{doc.name}</div>
                              <div className="text-xs" style={{ color: '#8aa0ad' }}>
                                {tr ? doc.title_tr : doc.title_en} · {doc.experience} {tr ? 'yıl' : 'yrs'}
                              </div>
                            </div>
                            <div className="flex gap-1">
                              {doc.languages.map(l => (
                                <span key={l} className="text-xs px-1.5 py-0.5 rounded font-bold"
                                  style={{ background: 'rgba(0,210,211,0.1)', color: '#00D2D3' }}>{l}</span>
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

        {/* 5 — TARİH + SEPET */}
        <div className="rounded-2xl p-6" style={{ background: '#FDFBF7', border: '1px solid #e8e0d0' }}>
          <h2 className="font-serif text-2xl mb-4" style={{ color: '#0D1E25' }}>
            {tr ? '4. Tarih Seçin ve Sepete Ekleyin' : '4. Select Date and Add to Cart'}
          </h2>

          <div className="mb-6">
            <label className="block text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: '#8aa0ad' }}>
              {tr ? 'Tercih Ettiğiniz Tarih' : 'Preferred Date'}
            </label>
            <input type="date" value={date}
              min={new Date().toISOString().split('T')[0]}
              onChange={e => setDate(e.target.value)}
              className="w-full md:w-64 rounded-xl px-4 py-3 text-sm outline-none"
              style={{ border: '1px solid #e8e0d0', background: 'white', color: '#0D1E25' }} />
          </div>

          {(selectedOp || selectedClinic) && (
            <div className="rounded-xl p-4 mb-6 space-y-2"
              style={{ background: 'rgba(0,210,211,0.05)', border: '1px solid rgba(0,210,211,0.2)' }}>
              {selectedOp && (
                <div className="flex justify-between text-sm">
                  <span style={{ color: '#3d5562' }}>{tr ? 'Operasyon:' : 'Operation:'}</span>
                  <span className="font-bold" style={{ color: '#0D1E25' }}>{tr ? selectedOp.name_tr : selectedOp.name_en}</span>
                </div>
              )}
              {selectedClinic && (
                <div className="flex justify-between text-sm">
                  <span style={{ color: '#3d5562' }}>{tr ? 'Klinik:' : 'Clinic:'}</span>
                  <span className="font-bold" style={{ color: '#0D1E25' }}>{selectedClinic.name}</span>
                </div>
              )}
              {selectedOp && (
                <div className="flex justify-between text-sm">
                  <span style={{ color: '#3d5562' }}>{tr ? 'Başlangıç fiyatı:' : 'Starting price:'}</span>
                  <span className="font-serif text-lg font-bold" style={{ color: '#FF4757' }}>
                    €{selectedOp.price_from.toLocaleString('tr-TR')}
                  </span>
                </div>
              )}
            </div>
          )}

          {!isKlinikYoneticisi && (
            <button onClick={handleAdd}
              disabled={!selectedOp || !selectedClinic || added}
              className="w-full py-4 font-bold rounded-2xl text-base transition-all"
              style={{
                background: added ? '#22c55e' : selectedOp && selectedClinic ? '#FF4757' : '#e8e0d0',
                color: added || (selectedOp && selectedClinic) ? 'white' : '#8aa0ad',
                cursor: !selectedOp || !selectedClinic || added ? 'not-allowed' : 'pointer',
                boxShadow: selectedOp && selectedClinic && !added ? '0 0 24px rgba(255,71,87,0.35)' : 'none',
              }}
              onMouseEnter={e => { if (selectedOp && selectedClinic && !added) (e.currentTarget.style.background = '#e63950'); }}
              onMouseLeave={e => { if (selectedOp && selectedClinic && !added) (e.currentTarget.style.background = '#FF4757'); }}>
              {added
                ? '✓ ' + (tr ? 'Sepete Eklendi!' : 'Added to Cart!')
                : !selectedOp ? (tr ? 'Önce operasyon seçin' : 'Select an operation first')
                : !selectedClinic ? (tr ? 'Önce klinik seçin' : 'Select a clinic first')
                : (tr ? '🛒 Sepete Ekle' : '🛒 Add to Cart')}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}