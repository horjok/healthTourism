'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Paket } from '@/lib/types';
import { useDilContext } from '@/lib/DilContext';
import { useDoviz } from '@/lib/DovizContext';
import { useChatContext } from '@/components/ui/ChatProvider';

const YORUMLAR = [
  { ad: 'James W.',  kod: 'GB', ulke: 'İngiltere',       puan: 5, yorum: 'FUE saç ekimi için İstanbul\'a geldim. Klinik muhteşemdi. HealthTour süreci baştan sona yönetti.' },
  { ad: 'Sophie L.', kod: 'DE', ulke: 'Almanya',         puan: 5, yorum: 'Hollywood Smile işlemim için Türkiye\'yi seçtim. Almanya\'daki fiyatların çok altında, aynı kalite.' },
  { ad: 'Ahmed K.',  kod: 'SA', ulke: 'Suudi Arabistan', puan: 5, yorum: 'LASIK için geldiğimde her şey organize edilmişti. Otel, transfer, klinik — hepsi mükemmeldi.' },
  { ad: 'Emma T.',   kod: 'NL', ulke: 'Hollanda',        puan: 4, yorum: 'Rinoplasti için Türkiye\'yi tercih ettim. Doktorlar çok profesyoneldi, iyileşme süreci hızlıydı.' },
  { ad: 'Carlos M.', kod: 'ES', ulke: 'İspanya',         puan: 5, yorum: 'Diş implantı için geldim, Almanya\'da ödeyeceğimin üçte birine yaptırdım. Kalitenin farkı yok.' },
  { ad: 'Maria V.',  kod: 'IT', ulke: 'İtalya',          puan: 5, yorum: 'Estetik cerrahi için en iyi tercihi yaptım. Her şey çok iyi planlanmıştı. Muhteşem bir deneyimdi!' },
  { ad: 'David H.',  kod: 'US', ulke: 'ABD',             puan: 4, yorum: 'Ortopedi için İstanbul\'a geldim. Amerika\'daki maliyetle kıyaslanmaz. Çok rahat bir süreçti.' },
  { ad: 'Fatima A.', kod: 'AE', ulke: 'BAE',             puan: 5, yorum: 'Onkoloji tedavisi için Türkiye\'ye geldim. Doktorlar dünya standartlarında, klinik son teknolojiye sahip.' },
];

const MAG_KATEGORILER = [
  {
    slug: 'saç ekimi',
    sehir: 'İstanbul · 7 gün',
    baslik: 'Saç Ekimi',
    alt: 'FUE · DHI · Safir',
    fiyat: '€2.190',
    foto: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=900&q=80',
    jci: true,
  },
  {
    slug: 'diş tedavisi',
    sehir: 'Antalya · 5 gün',
    baslik: 'Diş Sağlığı',
    alt: 'İmplant · Hollywood Smile',
    fiyat: '€3.450',
    foto: 'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&w=900&q=80',
    jci: true,
  },
  {
    slug: 'estetik cerrahi',
    sehir: 'İzmir · 6 gün',
    baslik: 'Estetik Cerrahi',
    alt: 'Rinoplasti · Liposuction',
    fiyat: '€2.890',
    foto: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=900&q=80',
    jci: true,
  },
  {
    slug: 'göz tedavisi',
    sehir: 'İzmir · 3 gün',
    baslik: 'Göz Tedavisi',
    alt: 'LASIK · Katarakt',
    fiyat: '€1.290',
    foto: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=900&q=80',
    jci: false,
  },
];

function PaketKarti({ paket, dil }: { paket: Paket; dil: 'tr' | 'en' }) {
  const { formatla } = useDoviz();
  return (
    <Link href={`/packages/${paket.id}`}>
      <article className="overflow-hidden rounded-2xl bg-pearl ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-xl cursor-pointer">
        <div className="relative h-44 bg-navy overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy/80 to-aegean/40" />
          <span className="absolute left-3 bottom-3 inline-flex items-center rounded-full bg-white/10 ring-1 ring-white/20 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
            {paket.klinik.sehir}
          </span>
          {paket.klinik.akredite && (
            <span className="absolute right-3 bottom-3 inline-flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-1 text-[11px] font-bold text-navy glow-gold">
              JCI ✓
            </span>
          )}
        </div>
        <div className="p-5">
          <h3 className="font-serif text-2xl text-navy">{paket.baslik}</h3>
          <p className="mt-0.5 text-sm text-slate-500">{paket.klinik.isim}</p>
          <div className="mt-3">
            <span className="inline-flex items-center rounded-full bg-cyan-50 px-2.5 py-1 text-[11px] font-medium text-aegean ring-1 ring-cyan-100">
              {paket.uzmanlik}
            </span>
          </div>
          <div className="mt-5 flex items-end justify-between border-t border-slate-200 pt-4">
            <div>
              <div className="text-[11px] text-slate-500">{dil === 'tr' ? 'Toplam fiyat' : 'Total price'}</div>
              <div className="font-serif text-3xl text-navy">{formatla(paket.toplam_fiyat)}</div>
            </div>
            <div className="text-xs text-slate-500">{paket.sure_gun} {dil === 'tr' ? 'gün' : 'days'}</div>
          </div>
        </div>
      </article>
    </Link>
  );
}

const SEHIRLER = ['İstanbul', 'Ankara', 'İzmir', 'Antalya', 'Bursa'];

export default function HomePage() {
  const { dil } = useDilContext();
  const { setChatAcik, setOnAcilMesaj } = useChatContext();
  const [paketler, setPaketler] = useState<Paket[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState(false);

  // Panel arama alanları
  const [tedaviMetni, setTedaviMetni] = useState('');
  const [sehirSecim, setSehirSecim] = useState('İstanbul');
  const [panelTarih, setPanelTarih] = useState('');

  useEffect(() => {
    fetch('/api/packages')
      .then((res) => res.json())
      .then((json: { success: boolean; data: Paket[] }) => {
        if (json.success) setPaketler(json.data.slice(0, 3));
        else setHata(true);
      })
      .catch(() => setHata(true))
      .finally(() => setYukleniyor(false));
  }, []);

  const tr = dil === 'tr';
  const tumYorumlar = [...YORUMLAR, ...YORUMLAR];

  function paketBul(tedavi?: string) {
    const metin = tedavi ?? tedaviMetni;
    if (!metin.trim()) { setChatAcik(true); return; }
    // Şehir ve tarihi mesaja ekle; AI pipeline cikarimYap bunları metinden çıkarır
    const parcalar = [metin.trim()];
    if (sehirSecim) parcalar.push(sehirSecim);
    if (panelTarih) parcalar.push(`tarih: ${panelTarih}`);
    setOnAcilMesaj(parcalar.join(', '));
    setChatAcik(true);
  }

  return (
    <main className="min-h-screen bg-pearl text-navy antialiased">

      {/* ─── HERO ─────────────────────────────────────────────────────── */}
      <section className="hero-bg grain relative overflow-hidden pb-44">
        {/* Riviera fotoğrafı, düşük opaklık */}
        <div
          className="absolute inset-0 opacity-40 mix-blend-luminosity"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1602002418816-5c0aeef426aa?auto=format&fit=crop&w=2400&q=80')", backgroundSize: 'cover', backgroundPosition: 'center' }}
        />
        {/* Koyu gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-navy/40 via-navy/60 to-navy" />

        {/* Selçuklu yıldız motifi */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.06]">
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="seljuk-hero" x="0" y="0" width="140" height="140" patternUnits="userSpaceOnUse">
                <g fill="none" stroke="white" strokeWidth="1">
                  <rect x="40" y="40" width="60" height="60"/>
                  <rect x="40" y="40" width="60" height="60" transform="rotate(45 70 70)"/>
                  <polygon points="70,46 90,56 100,70 90,84 70,94 50,84 40,70 50,56"/>
                </g>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#seljuk-hero)"/>
          </svg>
        </div>

        <div className="relative mx-auto max-w-7xl px-6 pt-24 lg:px-8 lg:pt-32">
          <div className="mx-auto max-w-5xl text-center">
            {/* Eyebrow */}
            <div className="mb-9 inline-flex items-center gap-2.5 rounded-full bg-white/[0.06] ring-1 ring-white/15 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-amber-300 backdrop-blur-md">
              {tr ? 'DÜNYA STANDARTLARINDA SAĞLIK TURİZMİ' : 'WORLD-CLASS HEALTH TOURISM'}
            </div>

            {/* Ana başlık */}
            <h1 className="font-serif text-balance text-[64px] leading-[0.95] tracking-tight text-white sm:text-7xl md:text-8xl lg:text-[112px]">
              {tr ? 'Sağlık ile Tatilin' : 'Where Health Meets'}
              <span className="block italic">
                <span className="bg-gradient-to-r from-cyan-300 via-amber-200 to-amber-400 bg-clip-text text-transparent">
                  {tr ? 'Buluştuğu Yer' : 'Your Holiday'}
                </span>
              </span>
            </h1>

            <p className="mx-auto mt-8 max-w-xl text-lg font-medium text-white/75 sm:text-xl">
              {tr
                ? 'Uçak · 5★ Resort · JCI Akredite Klinikler — yapay zekâ destekli tek paket.'
                : 'Flight · 5★ Resort · JCI Clinics — one AI-powered package.'}
            </p>

            {/* Tedavi chip'leri */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-2 gap-y-2 text-[13px] font-medium text-white/65">
              {['Saç ekimi', 'Diş', 'Estetik', 'Göz tedavisi', 'Ortopedi'].map((chip) => (
                <span key={chip} className={`rounded-full px-3 py-1 ring-1 ${chip === 'Estetik' ? 'bg-amber-500/15 text-amber-200 ring-amber-400/30' : 'bg-white/5 ring-white/10'}`}>
                  {chip}
                </span>
              ))}
            </div>

            {/* İstatistikler */}
            <div className="mt-14 grid grid-cols-2 gap-y-8 sm:grid-cols-4 sm:gap-x-10">
              <div className="text-center">
                <div className="font-serif text-5xl text-white sm:text-6xl">500<span className="text-amber-400">+</span></div>
                <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">{tr ? 'Akredite Klinik' : 'Accredited Clinics'}</div>
              </div>
              <div className="text-center">
                <div className="font-serif text-5xl text-white sm:text-6xl">50<span className="text-amber-400">+</span></div>
                <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">{tr ? 'Ülkeden Hasta' : 'Countries'}</div>
              </div>
              <div className="text-center">
                <div className="font-serif text-5xl text-white sm:text-6xl"><span className="text-amber-400">%</span>98</div>
                <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">{tr ? 'Memnuniyet' : 'Satisfaction'}</div>
              </div>
              <div className="text-center">
                <div className="font-serif text-5xl text-white sm:text-6xl">200<span className="text-amber-400">+</span></div>
                <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">{tr ? 'Uzman Doktor' : 'Expert Doctors'}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── YÜZEN CAM AI ARAMA PANELİ ───────────────────────────────── */}
      <section className="relative -mt-28 z-20">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div
            className="relative rounded-3xl border border-white/20 bg-white/10 p-2 backdrop-blur-2xl shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)]"
            style={{ backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.14), rgba(255,255,255,0.06))' }}
          >
            {/* İç kart */}
            <div className="rounded-[20px] bg-navy/85 ring-1 ring-white/10 p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-600/40">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>
                      <path d="M20 3v4"/><path d="M22 5h-4"/>
                    </svg>
                  </span>
                  <div>
                    <div className="text-sm font-bold text-white">{tr ? 'AI Asistanı' : 'AI Assistant'}</div>
                    <div className="text-[11px] text-white/60">
                      {tr ? 'Şikayetinizi yazın, 60 saniyede özel paket hazırlasın' : 'Describe your concern, get a custom package in 60s'}
                    </div>
                  </div>
                </div>
                <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-500/15 ring-1 ring-emerald-400/30 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  {tr ? '7/24 çevrimiçi' : '24/7 online'}
                </span>
              </div>

              <div className="grid gap-2 sm:grid-cols-12">
                {/* Tedavi */}
                <div className="sm:col-span-4 rounded-xl bg-white/5 ring-1 ring-white/10 px-4 py-3">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-white/50">
                    {tr ? 'Tedavi' : 'Treatment'}
                  </label>
                  <div className="flex items-center gap-2 mt-0.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-cyan-300 shrink-0"><circle cx="12" cy="12" r="9"/><path d="M12 7v10M7 12h10"/></svg>
                    <input
                      value={tedaviMetni}
                      onChange={(e) => setTedaviMetni(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && paketBul()}
                      className="w-full bg-transparent text-sm font-medium text-white placeholder-white/40 outline-none"
                      placeholder={tr ? 'Örn. Saç ekimi, Hollywood Smile' : 'E.g. Hair transplant, veneers'}
                    />
                  </div>
                </div>
                {/* Şehir */}
                <div className="sm:col-span-3 rounded-xl bg-white/5 ring-1 ring-white/10 px-4 py-3">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-white/50">{tr ? 'Şehir' : 'City'}</label>
                  <div className="flex items-center gap-2 mt-0.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-300 shrink-0"><path d="M20 10c0 7-8 12-8 12s-8-5-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    <select
                      value={sehirSecim}
                      onChange={(e) => setSehirSecim(e.target.value)}
                      className="w-full bg-transparent text-sm font-medium text-white outline-none cursor-pointer appearance-none [color-scheme:dark]"
                    >
                      {SEHIRLER.map((s) => (
                        <option key={s} value={s} className="bg-navy text-white">{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
                {/* Tarih */}
                <div className="sm:col-span-3 rounded-xl bg-white/5 ring-1 ring-white/10 px-4 py-3">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-white/50">{tr ? 'Tarih' : 'Date'}</label>
                  <div className="flex items-center gap-2 mt-0.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-300 shrink-0"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                    <input
                      type="date"
                      value={panelTarih}
                      onChange={(e) => setPanelTarih(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full bg-transparent text-sm font-medium text-white outline-none [color-scheme:dark]"
                    />
                  </div>
                </div>
                {/* CTA */}
                <button
                  onClick={() => paketBul()}
                  className="sm:col-span-2 group inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-500 px-4 py-3 text-sm font-bold text-navy glow-gold transition hover:bg-amber-400"
                >
                  {tr ? 'Paket Bul' : 'Find Package'}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition group-hover:translate-x-0.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </button>
              </div>

              {/* Popüler öneriler */}
              <div className="mt-4 flex flex-wrap items-center gap-2 text-[12px]">
                <span className="text-white/50">{tr ? 'Popüler:' : 'Popular:'}</span>
                {['FUE saç ekimi', 'Hollywood Smile', 'LASIK', 'Liposuction'].map((chip) => (
                  <button
                    key={chip}
                    onClick={() => paketBul(chip)}
                    className="rounded-full bg-white/5 ring-1 ring-white/10 px-3 py-1 text-white/80 hover:bg-white/10 transition"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── MAGAZİN KATEGORİ KARTLARI ───────────────────────────────── */}
      <section className="relative mx-auto max-w-7xl px-6 pt-24 pb-24 lg:px-8">
        <div className="flex items-end justify-between gap-6 mb-10">
          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-aegean">Health &amp; Holiday</p>
            <h2 className="font-serif text-5xl tracking-tight text-navy sm:text-6xl">
              {tr ? 'İhtisas alanları, ' : 'Specialties, '}<span className="italic">premium</span>{tr ? ' deneyim.' : ' experience.'}
            </h2>
          </div>
          <Link href="/packages" className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-navy hover:text-aegean transition">
            {tr ? 'Tümünü gör' : 'View all'}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {MAG_KATEGORILER.map((kat) => (
            <Link key={kat.slug} href={`/packages?uzmanlik=${kat.slug}`} className="mag-card group block rounded-2xl">
              <article className="relative aspect-[3/4] overflow-hidden rounded-2xl ring-1 ring-slate-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={kat.foto}
                  alt={kat.baslik}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/40 to-transparent" />
                {kat.jci && (
                  <span className="absolute top-4 left-4 inline-flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-navy glow-gold">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="m12 2 3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z"/></svg>
                    JCI Certified
                  </span>
                )}
                <div className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-white/15 ring-1 ring-white/25 backdrop-blur text-white">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17 17 7M7 7h10v10"/></svg>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-300">{kat.sehir}</div>
                  <h3 className="font-serif text-3xl leading-tight mt-1">{kat.baslik}</h3>
                  <p className="mt-1.5 text-[13px] text-white/75">{kat.alt}</p>
                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-white/55">{tr ? 'Başlangıç' : 'From'}</div>
                      <div className="font-serif text-2xl text-white">{kat.fiyat}</div>
                    </div>
                    <span className="rounded-full bg-white/15 ring-1 ring-white/25 px-3 py-1.5 text-[11px] font-semibold backdrop-blur">
                      {tr ? 'İncele →' : 'Explore →'}
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── POPÜLER PAKETLER ─────────────────────────────────────────── */}
      <section className="relative bg-white border-y border-slate-200/70 overflow-hidden">
        {/* İznik çini arka plan */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.05]">
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="iznik-paket" x="0" y="0" width="160" height="160" patternUnits="userSpaceOnUse">
                <g fill="none" stroke="#0891b2" strokeWidth="1.2">
                  <rect x="50" y="50" width="60" height="60"/>
                  <rect x="50" y="50" width="60" height="60" transform="rotate(45 80 80)"/>
                  <polygon points="80,56 98,64 106,80 98,96 80,104 62,96 54,80 62,64"/>
                  <circle cx="80" cy="80" r="3" fill="#d97706" stroke="none"/>
                  <path d="M80 30 Q90 40 80 50 Q70 40 80 30Z"/>
                  <path d="M80 130 Q90 120 80 110 Q70 120 80 130Z"/>
                  <path d="M30 80 Q40 90 50 80 Q40 70 30 80Z"/>
                  <path d="M130 80 Q120 90 110 80 Q120 70 130 80Z"/>
                </g>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#iznik-paket)"/>
          </svg>
        </div>
        <div className="pointer-events-none absolute -top-32 -left-32 h-[400px] w-[400px] rounded-full bg-cyan-100/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-32 h-[400px] w-[400px] rounded-full bg-amber-100/40 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 py-24 lg:px-8">
          <div className="flex items-end justify-between gap-6 mb-10">
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-aegean">{tr ? 'Öne Çıkanlar' : 'Featured'}</p>
              <h2 className="font-serif text-5xl tracking-tight text-navy sm:text-6xl">{tr ? 'Popüler Paketler' : 'Popular Packages'}</h2>
            </div>
            <Link href="/packages" className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-navy hover:text-aegean transition">
              {tr ? 'Tümünü gör' : 'View all'}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </Link>
          </div>

          {yukleniyor && (
            <div className="flex justify-center py-16">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-aegean border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-400 text-sm">{tr ? 'Yükleniyor...' : 'Loading...'}</p>
              </div>
            </div>
          )}

          {!yukleniyor && hata && (
            <div className="text-center py-16 bg-red-50 rounded-2xl border border-red-100">
              <p className="text-red-500 font-semibold">{tr ? 'Paketler yüklenemedi' : 'Could not load packages'}</p>
              <p className="text-slate-400 text-sm mt-2">{tr ? 'Lütfen sayfayı yenileyin' : 'Please refresh the page'}</p>
            </div>
          )}

          {!yukleniyor && !hata && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {paketler.map((paket) => <PaketKarti key={paket.id} paket={paket} dil={dil} />)}
            </div>
          )}
        </div>
      </section>

      {/* ─── NEDEN HEALTHTOUR ─────────────────────────────────────────── */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center mb-14">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-aegean">{tr ? 'Neden Biz?' : 'Why Us?'}</p>
            <h2 className="font-serif text-5xl tracking-tight text-navy sm:text-6xl">
              {tr ? 'Neden ' : 'Why '}<span className="italic">HealthTour?</span>
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              {tr ? 'Güvenilir, hızlı ve kişiselleştirilmiş sağlık turizmi deneyimi' : 'Reliable, fast and personalized health tourism experience'}
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                renk: 'bg-cyan-50/60 ring-cyan-100',
                ikonBg: 'bg-cyan-100 ring-cyan-200',
                ikonRenk: 'text-aegean',
                foto: 'https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=1000&q=80',
                baslik: tr ? 'JCI Akredite Klinikler' : 'JCI Accredited Clinics',
                aciklama: tr ? 'Uluslararası Joint Commission akreditasyonuna sahip, güvenilir klinikler.' : 'Internationally accredited and audited clinics.',
                ikon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
                    <path d="m9 12 2 2 4-4"/>
                  </svg>
                ),
              },
              {
                renk: 'bg-amber-50/70 ring-amber-100',
                ikonBg: 'bg-amber-100 ring-amber-200',
                ikonRenk: 'text-amber-700',
                foto: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1000&q=80',
                baslik: tr ? 'Uçak + Otel + Sağlık' : 'Flight + Hotel + Health',
                aciklama: tr ? 'Seyahatin tüm detaylarını tek rezervasyonla hallediyor.' : 'Handle all travel details in one booking.',
                ikon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>
                  </svg>
                ),
              },
              {
                renk: 'bg-emerald-50 ring-emerald-100',
                ikonBg: 'bg-emerald-100 ring-emerald-200',
                ikonRenk: 'text-emerald-700',
                foto: 'https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?auto=format&fit=crop&w=1000&q=80',
                baslik: tr ? 'AI Destekli Öneri' : 'AI-Powered Recommendation',
                aciklama: tr ? 'Şikayetini anlat, yapay zekamız en uygun paketi bulsun.' : 'Describe your concern, our AI finds the best package.',
                ikon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/>
                  </svg>
                ),
              },
            ].map((o) => (
              <article key={o.baslik} className={`overflow-hidden rounded-2xl ring-1 transition hover:-translate-y-1 hover:shadow-xl ${o.renk}`}>
                <div className="h-44 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={o.foto} alt={o.baslik} className="h-full w-full object-cover" />
                </div>
                <div className="p-6">
                  <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ring-1 ${o.ikonBg} ${o.ikonRenk}`}>
                    {o.ikon}
                  </div>
                  <h3 className="font-serif text-2xl text-navy">{o.baslik}</h3>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">{o.aciklama}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ─── MÜŞTERİ YORUMLARI (marquee) ─────────────────────────────── */}
      <section className="relative bg-white border-y border-slate-200/70 py-20 md:py-24 overflow-hidden">
        {/* İznik yorum motifi */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.045]">
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="iznik-yorum" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse" patternTransform="rotate(15)">
                <g fill="none" stroke="#0f172a" strokeWidth="1">
                  <rect x="60" y="60" width="80" height="80"/>
                  <rect x="60" y="60" width="80" height="80" transform="rotate(45 100 100)"/>
                  <polygon points="100,68 124,78 134,100 124,122 100,132 76,122 66,100 76,78"/>
                  <circle cx="100" cy="100" r="4" fill="#d97706" stroke="none"/>
                  <circle cx="100" cy="100" r="12"/>
                </g>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#iznik-yorum)"/>
          </svg>
        </div>
        <div className="pointer-events-none absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-cyan-50/60 to-transparent" />
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-amber-50/40 to-transparent" />

        <div className="relative mx-auto max-w-7xl px-6 text-center lg:px-8 mb-10 md:mb-12">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-aegean">{tr ? 'Müşteri Yorumları' : 'Customer Reviews'}</p>
          <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl tracking-tight text-navy">
            {tr ? 'Onlar ' : 'What Do '}<span className="italic">{tr ? 'Ne Diyor?' : 'They Say?'}</span>
          </h2>
        </div>

        <div className="relative">
          <div className="flex animate-marquee gap-5 sm:gap-6 w-max">
            {tumYorumlar.map((y, i) => (
              <article key={i} className="w-[300px] sm:w-[340px] shrink-0 rounded-2xl bg-pearl p-5 sm:p-6 ring-1 ring-slate-200">
                <div className="flex items-center gap-0.5 text-base">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <span key={s} className={s < y.puan ? 'text-amber-500' : 'text-slate-300'}>★</span>
                  ))}
                </div>
                <p className="mt-3 font-serif text-lg leading-snug text-navy italic">&ldquo;{y.yorum}&rdquo;</p>
                <div className="mt-5 flex items-center gap-3 border-t border-slate-200 pt-4">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-aegean to-navy text-sm font-bold text-white">
                    {y.ad.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-navy">{y.ad}</div>
                    <div className="text-xs text-slate-500"><span className="font-mono">{y.kod}</span> {y.ulke}</div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ─── GÜVEN BANDI ──────────────────────────────────────────────── */}
      <section className="py-16">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-y-10 px-6 sm:grid-cols-4 lg:px-8">
          {[
            {
              renk: 'bg-amber-50 ring-amber-200', ikonRenk: 'text-amber-600',
              baslik: tr ? 'JCI Sertifikası' : 'JCI Certificate',
              aciklama: tr ? 'Uluslararası akreditasyon' : 'International accreditation',
              ikon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>,
            },
            {
              renk: 'bg-cyan-50 ring-cyan-200', ikonRenk: 'text-aegean',
              baslik: tr ? 'Gizlilik Garantisi' : 'Privacy Guarantee',
              aciklama: tr ? 'Verileriniz korunur' : 'Your data is protected',
              ikon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
            },
            {
              renk: 'bg-rose-50 ring-rose-200', ikonRenk: 'text-rose-600',
              baslik: tr ? '7/24 Destek' : '24/7 Support',
              aciklama: tr ? 'Her an yanınızdayız' : 'Always here for you',
              ikon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
            },
            {
              renk: 'bg-emerald-50 ring-emerald-200', ikonRenk: 'text-emerald-600',
              baslik: tr ? 'Güvenli Ödeme' : 'Secure Payment',
              aciklama: tr ? 'SSL korumalı işlem' : 'SSL protected transaction',
              ikon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>,
            },
          ].map((g) => (
            <div key={g.baslik} className="text-center">
              <div className={`mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl ring-1 ${g.renk} ${g.ikonRenk}`}>
                {g.ikon}
              </div>
              <div className="text-sm font-bold text-navy">{g.baslik}</div>
              <div className="mt-1 text-xs text-slate-500">{g.aciklama}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA BANNER ───────────────────────────────────────────────── */}
      <section className="px-6 pb-24 lg:px-8">
        <div
          className="relative mx-auto max-w-6xl overflow-hidden rounded-[36px] px-6 py-20 text-center shadow-[0_35px_80px_-15px_rgba(15,23,42,0.6)] sm:px-16 sm:py-24"
          style={{ background: 'radial-gradient(ellipse at top left, rgba(8,145,178,0.35), transparent 55%), radial-gradient(ellipse at bottom right, rgba(217,119,6,0.30), transparent 60%), linear-gradient(180deg,#0a1124 0%,#0f172a 100%)' }}
        >
          <div
            className="absolute inset-0 opacity-25 mix-blend-overlay"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1602002418816-5c0aeef426aa?auto=format&fit=crop&w=1800&q=80')", backgroundSize: 'cover', backgroundPosition: 'center' }}
          />
          {/* Selçuklu desen */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.06]">
            <svg className="h-full w-full">
              <defs>
                <pattern id="seljuk-cta" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                  <g fill="none" stroke="white" strokeWidth="1">
                    <rect x="25" y="25" width="50" height="50"/>
                    <rect x="25" y="25" width="50" height="50" transform="rotate(45 50 50)"/>
                  </g>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#seljuk-cta)"/>
            </svg>
          </div>
          <div className="pointer-events-none absolute -top-10 right-10 h-40 w-40 rounded-full bg-amber-400/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-10 left-10 h-40 w-40 rounded-full bg-cyan-400/25 blur-3xl" />

          <div className="relative">
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.22em] text-amber-300">
              {tr ? 'AI Destekli Sistem' : 'AI-Powered System'}
            </p>
            <h2 className="font-serif text-5xl tracking-tight text-white sm:text-7xl">
              {tr ? 'Hemen ' : 'Get Started '}<span className="italic bg-gradient-to-r from-amber-200 to-amber-400 bg-clip-text text-transparent">{tr ? 'Başlayın' : 'Now'}</span>
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-base text-white/70 sm:text-lg">
              {tr
                ? 'AI asistanımız şikayetinizi analiz edip size özel paket önersin — ücretsiz ve dakikalar içinde.'
                : 'Our AI assistant analyzes your concern and suggests a personalized package — free, in minutes.'}
            </p>
            <button
              onClick={() => setChatAcik(true)}
              className="group relative mt-10 inline-flex items-center gap-2 rounded-full bg-amber-500 px-9 py-4 text-base font-bold text-navy glow-gold transition hover:-translate-y-0.5 hover:bg-amber-400"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>
                <path d="M20 3v4"/><path d="M22 5h-4"/>
              </svg>
              {tr ? 'AI ile Paket Bul — Ücretsiz' : 'Find Package with AI — Free'}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition group-hover:translate-x-0.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </button>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ───────────────────────────────────────────────────── */}
      <footer className="bg-navy py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-6 lg:flex-row lg:items-center lg:px-8">
          <div>
            <div className="flex items-center gap-0.5 text-xl font-bold tracking-tight">
              <span className="text-white">Health</span><span className="text-amber-400">Tour</span>
            </div>
            <p className="mt-1 text-xs text-white/50">{tr ? 'Sağlık turizmi demo platformu' : 'Health tourism demo platform'}</p>
          </div>
          <ul className="flex flex-wrap items-center gap-6 text-sm text-white/70">
            <li><Link href="/packages" className="hover:text-white transition">{tr ? 'Paketler' : 'Packages'}</Link></li>
            <li><button onClick={() => setChatAcik(true)} className="hover:text-white transition">{tr ? 'AI Öneri' : 'AI Suggestion'}</button></li>
            <li><Link href="/auth" className="hover:text-white transition">{tr ? 'Giriş Yap' : 'Sign In'}</Link></li>
          </ul>
          <div className="text-xs text-white/40">© 2026 HealthTour</div>
        </div>
      </footer>
    </main>
  );
}
