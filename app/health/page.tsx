'use client';

import { Fragment, useState, useEffect } from 'react';
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

// Tasarımdan birebir alınan kategori SVG path'leri — emoji yerine ince çizgi ikon
const CATEGORIES: { id: string; tr: string; en: string; paths: string[]; circles?: { cx: number; cy: number; r: number }[] }[] = [
  { id: 'sac',     tr: 'Saç Ekimi',       en: 'Hair Transplant',
    paths: ['M12 2c4 0 7 3 7 7 0 3-2 5-3.5 6-1 .7-1.5 1.5-1.5 3v1H10v-1c0-1.5-.5-2.3-1.5-3C7 14 5 12 5 9c0-4 3-7 7-7Z', 'M9 18h6'] },
  { id: 'dis',     tr: 'Diş Sağlığı',     en: 'Dental Health',
    paths: ['M12 5c-3 0-4-2-6-2-2 0-3 2-3 5 0 4 2 4 3 8 1 3 2 6 4 6 1 0 1-2 2-2s1 2 2 2c2 0 3-3 4-6 1-4 3-4 3-8 0-3-1-5-3-5-2 0-3 2-6 2Z'] },
  { id: 'estetik', tr: 'Estetik Cerrahi', en: 'Aesthetic Surgery',
    paths: ['M12 3v4', 'M12 17v4', 'M3 12h4', 'M17 12h4', 'M5.6 5.6l2.8 2.8', 'M15.6 15.6l2.8 2.8', 'M5.6 18.4l2.8-2.8', 'M15.6 8.4l2.8-2.8'] },
  { id: 'goz',     tr: 'Göz Tedavisi',    en: 'Eye Treatment',
    paths: ['M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z'], circles: [{ cx: 12, cy: 12, r: 3 }] },
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
    c.specialties.includes(category) &&
    (starFilter === 0 || c.stars === starFilter)
  );

  // Mevcut adımı hesapla — progress ribbon'da aktif noktayı belirler
  const currentStep = !selectedOp ? 2 : !selectedClinic ? 3 : !date ? 4 : 4;

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

  // Tahmini toplam — operasyon + klinik başlangıcı, 200€ bundle indirimi (tasarım örneği)
  const total = selectedOp
    ? selectedClinic
      ? selectedOp.price_from + selectedClinic.price_from - 200
      : selectedOp.price_from
    : null;

  const adimlar = [
    { n: 1, label: tr ? 'Kategori'  : 'Category'  },
    { n: 2, label: tr ? 'Operasyon' : 'Operation' },
    { n: 3, label: tr ? 'Klinik'    : 'Clinic'    },
    { n: 4, label: tr ? 'Tarih'     : 'Date'      },
  ];

  return (
    <>
      {/* Tasarım sayfasına özel mikro animasyon/blend sınıfları — globals.css'i kirletmemek için inline */}
      <style jsx global>{`
        .ht-step-line {
          background-image: linear-gradient(to right, rgba(15,23,42,0.10) 50%, transparent 0%);
          background-size: 10px 1px; background-repeat: repeat-x;
        }
        .ht-grain::after {
          content: ""; position: absolute; inset: 0; pointer-events: none;
          background-image: radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px);
          background-size: 3px 3px; mix-blend-mode: overlay; opacity: 0.5;
        }
        .ht-glow-gold {
          box-shadow: 0 0 0 1px rgba(217,119,6,0.5), 0 0 24px -2px rgba(217,119,6,0.55), inset 0 1px 0 rgba(255,255,255,0.2);
        }
        .ht-iznik-bg {
          background-image:
            radial-gradient(ellipse at top right, rgba(8,145,178,0.10), transparent 60%),
            radial-gradient(ellipse at bottom left, rgba(217,119,6,0.06), transparent 55%);
        }
        .ht-card { transition: transform .25s ease, box-shadow .25s ease, border-color .25s ease; }
        .ht-card:hover { transform: translateY(-2px); box-shadow: 0 14px 30px -16px rgba(15,23,42,0.18); }
        .ht-card[data-on="true"] {
          border-color: #0891b2;
          box-shadow: 0 0 0 3px rgba(8,145,178,0.10), 0 14px 30px -16px rgba(8,145,178,0.30);
        }
      `}</style>

      <main className="bg-pearl text-navy antialiased min-h-screen">

        {/* ─── HERO ─────────────────────────────────────────── */}
        <section className="ht-grain relative overflow-hidden pb-28 md:pb-32"
          style={{ background: 'radial-gradient(ellipse at top right, rgba(8,145,178,0.35), transparent 55%), radial-gradient(ellipse at bottom left, rgba(217,119,6,0.18), transparent 50%), linear-gradient(180deg,#0a1124 0%,#0f172a 60%,#0a0f1f 100%)' }}>
          {/* Klinik fotoğrafı düşük blend ile arkada */}
          <div className="absolute inset-0 opacity-25 mix-blend-luminosity"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=2400&q=80')", backgroundSize: 'cover', backgroundPosition: 'center' }} />
          {/* Selçuklu yıldızı watermark */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.06]">
            <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="seljuk-saglik" x="0" y="0" width="140" height="140" patternUnits="userSpaceOnUse">
                  <g fill="none" stroke="white" strokeWidth="1">
                    <rect x="40" y="40" width="60" height="60" />
                    <rect x="40" y="40" width="60" height="60" transform="rotate(45 70 70)" />
                    <polygon points="70,46 90,56 100,70 90,84 70,94 50,84 40,70 50,56" />
                  </g>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#seljuk-saglik)" />
            </svg>
          </div>

          <div className="relative mx-auto max-w-7xl px-6 pt-32 md:pt-40 lg:px-8 text-center">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-amber-300">
              {tr ? 'Sağlık Hizmetleri' : 'Health Services'}
            </p>
            <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl tracking-tight text-white leading-[0.95]">
              {tr ? 'Tedavinizi ' : 'Plan Your '}
              <span className="italic bg-gradient-to-r from-cyan-300 via-amber-200 to-amber-400 bg-clip-text text-transparent">
                {tr ? 'Planlayın' : 'Treatment'}
              </span>
            </h1>
            <p className="mt-5 mx-auto max-w-xl text-base sm:text-lg text-white/65">
              {tr
                ? <>Şikayetinizi yazın, operasyonunuzu seçin ve <span className="font-serif italic text-white">akredite</span> klinik ile tarihinizi belirleyin.</>
                : <>Describe your concern, choose your operation and set a date with an <span className="font-serif italic text-white">accredited</span> clinic.</>}
            </p>

            {/* Adım ribbon — currentStep ile dinamik */}
            <ol className="mt-10 mx-auto max-w-3xl flex items-center justify-between gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">
              {adimlar.map((a, i) => (
                <Fragment key={a.n}>
                  <li className="flex items-center gap-2">
                    <span className={`grid h-6 w-6 place-items-center rounded-full text-[11px] font-bold ${
                      a.n <= currentStep
                        ? 'bg-amber-500 text-navy'
                        : 'bg-white/15 ring-1 ring-white/20 text-white'
                    }`}>{a.n}</span>
                    <span className={`hidden sm:inline ${a.n === currentStep ? 'text-white' : ''}`}>{a.label}</span>
                  </li>
                  {i < adimlar.length - 1 && <li className="flex-1 ht-step-line h-px" aria-hidden="true" />}
                </Fragment>
              ))}
            </ol>
          </div>
        </section>

        {/* ─── AI ANALİZ KARTI (hero üzerine taşar) ────────── */}
        <section className="relative -mt-16 md:-mt-20 z-10 px-6 lg:px-8">
          <div className="mx-auto max-w-4xl rounded-3xl bg-white p-6 sm:p-8 shadow-[0_30px_60px_-20px_rgba(15,23,42,0.30)] ring-1 ring-slate-200/70">
            <div className="flex items-start gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-aegean to-amber-700 ring-1 ring-white/40 text-white">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
                  <path d="M20 3v4" /><path d="M22 5h-4" />
                </svg>
              </span>
              <div className="flex-1">
                <h2 className="font-serif text-2xl text-navy tracking-tight leading-tight">
                  {tr ? 'Sağlık durumunuzu belirtin' : 'Describe your health concern'}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {tr
                    ? 'Şikayetinizi yazın veya aşağıdan kategori seçin. AI sizin için uygun operasyonları önersin.'
                    : 'Write your concern or pick a category below. AI will suggest suitable operations.'}
                </p>
              </div>
            </div>

            <div className="mt-5 relative">
              <textarea
                value={complaint}
                onChange={e => setComplaint(e.target.value)}
                maxLength={500}
                placeholder={tr
                  ? 'Örn: Saçlarım 3 yıldır dökülüyor, ön bölgede seyreklik var...'
                  : 'E.g.: My hair has been thinning for 3 years, especially in the front...'}
                className="w-full min-h-[120px] resize-none rounded-2xl border border-slate-200 bg-pearl/50 px-4 py-3.5 text-sm font-medium text-navy placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-aegean/40 focus:border-aegean"
              />
            </div>

            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-slate-400">{complaint.length}/500</span>
              <a href={`/packages?chat=true${complaint ? `&q=${encodeURIComponent(complaint)}` : ''}`}
                className="inline-flex items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-sm font-bold text-white hover:bg-navy/85 transition">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-amber-300">
                  <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
                  <path d="M20 3v4" /><path d="M22 5h-4" />
                </svg>
                {tr ? 'AI ile analiz et' : 'Analyze with AI'}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
              </a>
            </div>
          </div>
        </section>

        {/* ─── ANA BUILDER ──────────────────────────────────── */}
        <div className="ht-iznik-bg relative px-6 lg:px-8 pt-20 pb-28">
          <div className="mx-auto max-w-4xl space-y-16">

            {/* ── ADIM 1: KATEGORİ ───────────────────────────── */}
            <section>
              <header className="mb-6 flex items-end justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-aegean">{tr ? 'Adım 1' : 'Step 1'}</p>
                  <h2 className="mt-1 font-serif text-3xl sm:text-4xl tracking-tight text-navy">
                    {tr ? <>Tedavi <span className="italic">kategorisi</span> seçin</> : <>Select a <span className="italic">category</span></>}
                  </h2>
                </div>
                <p className="hidden sm:block text-sm text-slate-500">
                  {tr ? 'Aşağıdaki uzmanlıklardan birini seçerek başlayın.' : 'Pick one of the specialties below to begin.'}
                </p>
              </header>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {CATEGORIES.map(cat => {
                  const on = category === cat.id;
                  const sayi = operasyonlar.filter(o => o.category === cat.id).length;
                  return (
                    <button
                      key={cat.id}
                      data-on={on}
                      onClick={() => { setCategory(cat.id); setSelectedOp(null); setSelectedClinic(null); }}
                      className="ht-card text-left rounded-2xl bg-white border-2 border-slate-200 p-5 relative"
                    >
                      <div className="flex items-start justify-between">
                        <span className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-cyan-50 to-amber-50 ring-1 ring-slate-200 text-aegean">
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            {cat.paths.map((d, i) => <path key={i} d={d} />)}
                            {cat.circles?.map((c, i) => <circle key={i} cx={c.cx} cy={c.cy} r={c.r} />)}
                          </svg>
                        </span>
                        <span className={`grid h-6 w-6 place-items-center rounded-full bg-aegean text-white transition ${on ? 'opacity-100' : 'opacity-0'}`}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                        </span>
                      </div>
                      <div className="mt-5">
                        <div className="font-serif text-xl text-navy leading-tight">{tr ? cat.tr : cat.en}</div>
                        <div className="mt-0.5 text-xs text-slate-500">
                          {sayi > 0 ? `${sayi} ${tr ? 'operasyon' : 'operations'}` : (tr ? 'Hazırlanıyor' : 'Coming soon')}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* ── ADIM 2: OPERASYON ──────────────────────────── */}
            <section>
              <header className="mb-6 flex items-end justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-aegean">{tr ? 'Adım 2' : 'Step 2'}</p>
                  <h2 className="mt-1 font-serif text-3xl sm:text-4xl tracking-tight text-navy">
                    {tr ? <>Operasyon <span className="italic">seçin</span></> : <>Select an <span className="italic">operation</span></>}
                  </h2>
                </div>
                <p className="hidden sm:block text-sm text-slate-500">
                  {tr ? 'Süre ve başlangıç fiyatları gösterilir.' : 'Duration and starting prices shown.'}
                </p>
              </header>

              {ops.length === 0 ? (
                <div className="rounded-2xl bg-white ring-1 ring-slate-200 p-8 text-center text-sm text-slate-500">
                  {tr ? 'Bu kategoride henüz operasyon listelenmedi.' : 'No operations listed for this category yet.'}
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {ops.map(op => {
                    const on = selectedOp?.id === op.id;
                    return (
                      <button
                        key={op.id}
                        data-on={on}
                        onClick={() => setSelectedOp(op)}
                        className="ht-card text-left rounded-2xl bg-white border-2 border-slate-200 p-5"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="font-serif text-[20px] text-navy leading-tight">{tr ? op.name_tr : op.name_en}</div>
                            <div className="mt-1 text-xs text-slate-500">{tr ? op.desc_tr : op.desc_en}</div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{tr ? "'den" : 'from'}</div>
                            <div className="font-serif text-2xl text-navy leading-none">€{op.price_from.toLocaleString('tr-TR')}</div>
                          </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-pearl ring-1 ring-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                            {tr ? op.duration_tr : op.duration_en}
                          </span>
                          <span className={`inline-flex items-center gap-1 text-[11px] font-bold text-aegean transition ${on ? 'opacity-100' : 'opacity-0'}`}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                            {tr ? 'Seçildi' : 'Selected'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>

            {/* ── ADIM 3: KLİNİK ─────────────────────────────── */}
            <section>
              <header className="mb-6 flex items-end justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-aegean">{tr ? 'Adım 3' : 'Step 3'}</p>
                  <h2 className="mt-1 font-serif text-3xl sm:text-4xl tracking-tight text-navy">
                    {tr ? <>Klinik <span className="italic">seçin</span></> : <>Select a <span className="italic">clinic</span></>}
                  </h2>
                </div>
                <div className="flex items-center gap-1 rounded-full bg-white p-1 ring-1 ring-slate-200">
                  <button
                    onClick={() => setStarFilter(0)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${starFilter === 0 ? 'bg-navy text-white' : 'text-slate-600 hover:text-navy'}`}
                  >{tr ? 'Tümü' : 'All'}</button>
                  {[5, 4, 3].map(s => (
                    <button
                      key={s}
                      onClick={() => setStarFilter(s)}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${starFilter === s ? 'bg-navy text-white' : 'text-slate-600 hover:text-navy'}`}
                    >{s}★</button>
                  ))}
                </div>
              </header>

              {klinikYukleniyor && (
                <div className="flex justify-center py-16">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-aegean border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-400 text-sm">{tr ? 'Klinikler yükleniyor...' : 'Loading clinics...'}</p>
                  </div>
                </div>
              )}

              {!klinikYukleniyor && klinikHata && (
                <div className="text-center py-12 bg-red-50 rounded-2xl border border-red-100">
                  <p className="text-red-500 font-semibold">{tr ? 'Klinikler yüklenemedi' : 'Could not load clinics'}</p>
                  <p className="text-slate-400 text-sm mt-1">{tr ? 'Lütfen sayfayı yenileyin' : 'Please refresh the page'}</p>
                </div>
              )}

              {!klinikYukleniyor && !klinikHata && (
                <div className="space-y-4">
                  {clinics.length === 0 ? (
                    <div className="rounded-2xl bg-white ring-1 ring-slate-200 p-8 text-center text-sm text-slate-500">
                      {tr ? 'Bu filtre için klinik bulunamadı.' : 'No clinics for this filter.'}
                    </div>
                  ) : clinics.map(clinic => {
                    const on = selectedClinic?.id === clinic.id;
                    return (
                      <article
                        key={clinic.id}
                        data-on={on}
                        className="ht-card rounded-2xl bg-white border-2 border-slate-200 overflow-hidden"
                      >
                        <div className="flex flex-col sm:flex-row">
                          {/* Görsel */}
                          <div className="relative h-44 sm:h-auto sm:w-56 shrink-0 overflow-hidden">
                            <img src={clinic.image} alt={clinic.name} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-navy/40 via-transparent to-transparent" />
                            {clinic.accredited && (
                              <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-navy ht-glow-gold">
                                <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><path d="m12 2 3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" /></svg>
                                JCI
                              </span>
                            )}
                          </div>

                          {/* Gövde */}
                          <div className="flex-1 p-5 sm:p-6 flex flex-col">
                            <div className="flex items-start justify-between gap-4">
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3 className="font-serif text-[22px] text-navy leading-tight">{clinic.name}</h3>
                                  {clinic.accredited && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 ring-1 ring-emerald-100">JCI ✓</span>
                                  )}
                                </div>
                                <div className="mt-1 flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                                  <span className="inline-flex items-center gap-1">
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a9 9 0 0 0-9 9c0 7 9 11 9 11s9-4 9-11a9 9 0 0 0-9-9Z" /><circle cx="12" cy="11" r="3" /></svg>
                                    {clinic.city}
                                  </span>
                                  <span className="text-slate-300">·</span>
                                  <span className="inline-flex items-center gap-0.5">
                                    {[0, 1, 2, 3, 4].map(i => (
                                      <svg key={i} className={i < Math.floor(clinic.rating) ? 'text-amber-400' : 'text-slate-200'} width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="m12 2 3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" /></svg>
                                    ))}
                                  </span>
                                  <span className="font-bold text-navy">{clinic.rating}</span>
                                  <span className="text-slate-400">({clinic.reviews.toLocaleString('tr-TR')})</span>
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{tr ? "'den" : 'from'}</div>
                                <div className="font-serif text-2xl text-navy leading-none">€{clinic.price_from.toLocaleString('tr-TR')}</div>
                              </div>
                            </div>

                            {/* Güvenilirlik barı */}
                            <div className="mt-4">
                              <div className="flex items-center justify-between text-[11px] font-semibold mb-1">
                                <span className="inline-flex items-center gap-1.5 text-aegean">
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1 3 5v6c0 6 4 11 9 12 5-1 9-6 9-12V5l-9-4Z" /></svg>
                                  {tr ? 'Güvenilirlik' : 'Reliability'}
                                </span>
                                <span className="text-navy">{clinic.reliability}%</span>
                              </div>
                              <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                <div className="h-full rounded-full bg-gradient-to-r from-aegean to-cyan-300" style={{ width: `${clinic.reliability}%` }} />
                              </div>
                            </div>

                            {/* Aksiyonlar */}
                            <div className="mt-5 flex items-center justify-between gap-2 flex-wrap">
                              <button
                                onClick={() => setExpandedClinic(expandedClinic === clinic.id ? null : clinic.id)}
                                className="text-xs inline-flex items-center gap-1.5 rounded-full bg-pearl ring-1 ring-slate-200 px-3 py-1.5 font-semibold text-slate-700 hover:ring-aegean hover:text-aegean transition"
                              >
                                {tr ? 'Doktorlar' : 'Doctors'}
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`transition ${expandedClinic === clinic.id ? 'rotate-180' : ''}`}><path d="m6 9 6 6 6-6" /></svg>
                              </button>
                              <button
                                onClick={() => setSelectedClinic(on ? null : clinic)}
                                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition ${
                                  on ? 'bg-aegean text-white' : 'bg-navy text-white hover:bg-navy/85'
                                }`}
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                                {on ? (tr ? 'Seçildi' : 'Selected') : (tr ? 'Seç' : 'Select')}
                              </button>
                            </div>

                            {/* Doktor listesi */}
                            {expandedClinic === clinic.id && (
                              <ul className="mt-4 space-y-1.5 text-[12px] text-slate-600 pl-1 border-t border-slate-100 pt-3">
                                {clinic.doctors.map((doc, i) => (
                                  <li key={i} className="flex items-center gap-2 flex-wrap">
                                    <span className={`grid h-6 w-6 place-items-center rounded-full text-[10px] font-bold ${
                                      i % 2 === 0
                                        ? 'bg-cyan-50 ring-1 ring-cyan-100 text-aegean'
                                        : 'bg-amber-50 ring-1 ring-amber-100 text-amber-700'
                                    }`}>DR</span>
                                    <span className="font-semibold text-navy">{doc.name}</span>
                                    <span className="text-slate-400">— {tr ? doc.title_tr : doc.title_en} · {doc.experience} {tr ? 'yıl' : 'yrs'}</span>
                                    {doc.languages.length > 0 && (
                                      <span className="flex gap-1 ml-auto">
                                        {doc.languages.map(l => (
                                          <span key={l} className="text-[10px] bg-pearl ring-1 ring-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-medium">{l}</span>
                                        ))}
                                      </span>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>

            {/* ── ADIM 4: TARİH + SEPETE EKLE ────────────────── */}
            <section>
              <header className="mb-6">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-aegean">{tr ? 'Adım 4' : 'Step 4'}</p>
                <h2 className="mt-1 font-serif text-3xl sm:text-4xl tracking-tight text-navy">
                  {tr ? <>Tarih seçin ve <span className="italic">sepete ekleyin</span></> : <>Pick a date and <span className="italic">add to cart</span></>}
                </h2>
              </header>

              <div className="rounded-2xl bg-white p-6 sm:p-8 ring-1 ring-slate-200 shadow-sm">
                <div className="grid sm:grid-cols-2 gap-6 items-end">
                  <label className="block">
                    <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 mb-1.5">
                      {tr ? 'Tercih ettiğiniz tarih' : 'Preferred date'}
                    </span>
                    <div className="relative">
                      <svg className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
                      <input
                        type="date"
                        value={date}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={e => setDate(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-pearl/50 pl-10 pr-3.5 py-3 text-sm font-medium text-navy focus:outline-none focus:ring-2 focus:ring-aegean/40 focus:border-aegean"
                      />
                    </div>
                  </label>

                  <div className="rounded-xl bg-pearl/70 ring-1 ring-slate-200/60 px-4 py-3">
                    <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                      {tr ? 'Tahmini toplam' : 'Estimated total'}
                    </div>
                    <div className="mt-1 flex items-baseline gap-1">
                      <span className="font-serif text-3xl text-navy leading-none">
                        {total !== null ? `€${total.toLocaleString('tr-TR')}` : '€—'}
                      </span>
                      <span className="text-xs text-slate-400">/{tr ? 'kişi başlangıç' : 'per person from'}</span>
                    </div>
                    <p className="mt-2 text-[11px] text-slate-500">
                      {!selectedOp
                        ? (tr ? 'Önce operasyon ve klinik seçin.' : 'Pick an operation and clinic first.')
                        : !selectedClinic
                        ? `${tr ? selectedOp.name_tr : selectedOp.name_en} · ${tr ? 'klinik seçimi sonrası kesinleşir.' : 'finalised after clinic.'}`
                        : `${tr ? selectedOp.name_tr : selectedOp.name_en} · ${selectedClinic.name} · ${selectedClinic.city}`}
                    </p>
                  </div>
                </div>

                {!isKlinikYoneticisi && (
                  <button
                    onClick={handleAdd}
                    disabled={!selectedOp || !selectedClinic || added}
                    className={`mt-6 w-full inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-4 text-sm font-bold transition ${
                      added
                        ? 'bg-emerald-500 text-white'
                        : selectedOp && selectedClinic
                        ? 'bg-amber-500 text-navy ht-glow-gold hover:bg-amber-400 hover:-translate-y-0.5'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" /></svg>
                    {added
                      ? (tr ? 'Sepete Eklendi!' : 'Added to Cart!')
                      : !selectedOp
                      ? (tr ? 'Önce operasyon seçin' : 'Select an operation first')
                      : !selectedClinic
                      ? (tr ? 'Önce klinik seçin' : 'Select a clinic first')
                      : (tr ? 'Sepete Ekle' : 'Add to Cart')}
                  </button>
                )}
              </div>
            </section>
          </div>
        </div>

        {/* ─── CTA STRIP (Paketler ile tutarlı) ─────────────── */}
        <section className="px-6 pb-24 lg:px-8">
          <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl px-6 py-12 sm:px-12 sm:py-14 shadow-[0_30px_60px_-15px_rgba(15,23,42,0.5)]"
            style={{ background: 'radial-gradient(ellipse at top left, rgba(8,145,178,0.35), transparent 55%), radial-gradient(ellipse at bottom right, rgba(217,119,6,0.28), transparent 60%), linear-gradient(180deg,#0a1124 0%,#0f172a 100%)' }}>
            <div className="pointer-events-none absolute -top-10 right-10 h-32 w-32 rounded-full bg-amber-400/30 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-10 left-10 h-32 w-32 rounded-full bg-cyan-400/25 blur-3xl" />
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-8">
              <div className="flex-1">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-amber-300">
                  {tr ? 'Hazır bir paket mi tercih edersiniz?' : 'Prefer a ready-made package?'}
                </p>
                <h3 className="font-serif text-3xl sm:text-4xl tracking-tight text-white">
                  {tr ? <>Klinik + Otel + Uçuş <span className="italic">tek paket</span></> : <>Clinic + Hotel + Flight <span className="italic">one package</span></>}
                </h3>
              </div>
              <a href="/packages"
                className="group inline-flex items-center gap-2 self-start sm:self-auto rounded-full bg-amber-500 px-6 py-3.5 text-sm font-bold text-navy ht-glow-gold transition hover:-translate-y-0.5 hover:bg-amber-400 whitespace-nowrap">
                {tr ? 'Paketleri Gör' : 'View Packages'}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
