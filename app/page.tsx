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
  { slug: 'saç ekimi',      sehir: 'İstanbul · 7 gün', baslik: 'Saç Ekimi',       alt: 'FUE · DHI · Safir',         fiyat: '€2.190', foto: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=900&q=80', jci: true },
  { slug: 'diş tedavisi',   sehir: 'Antalya · 5 gün',  baslik: 'Diş Sağlığı',    alt: 'İmplant · Hollywood Smile', fiyat: '€3.450', foto: 'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&w=900&q=80', jci: true },
  { slug: 'estetik cerrahi',sehir: 'İzmir · 6 gün',    baslik: 'Estetik Cerrahi',alt: 'Rinoplasti · Liposuction',  fiyat: '€2.890', foto: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=900&q=80', jci: true },
  { slug: 'göz tedavisi',   sehir: 'İzmir · 3 gün',    baslik: 'Göz Tedavisi',   alt: 'LASIK · Katarakt',          fiyat: '€1.290', foto: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=900&q=80', jci: false },
];

function PaketKarti({ paket, dil }: { paket: Paket; dil: 'tr' | 'en' }) {
  const { formatla } = useDoviz();
  return (
    <Link href={`/packages/${paket.id}`}>
      <article className="overflow-hidden rounded-2xl cursor-pointer transition hover:-translate-y-1 hover:shadow-xl"
        style={{ background: '#FDFBF7', border: '1px solid #e8e0d0' }}>
        <div className="relative h-44 overflow-hidden" style={{ background: '#0D1E25' }}>
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #0D1E25, rgba(0,210,211,0.2))' }} />
          <div className="absolute inset-0 flex items-center justify-center text-7xl opacity-10">🏥</div>
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
            <span className="rounded-full px-3 py-1 text-[11px] font-bold text-[#0D1E25]"
              style={{ background: '#00D2D3' }}>
              {paket.klinik.sehir}
            </span>
            {paket.klinik.akredite && (
              <span className="rounded-full px-3 py-1 text-[11px] font-bold text-white"
                style={{ background: '#FF4757' }}>JCI ✓</span>
            )}
          </div>
        </div>
        <div className="p-5">
          <h3 className="font-serif text-xl leading-tight mb-1" style={{ color: '#0D1E25' }}>{paket.baslik}</h3>
          <p className="text-sm mb-3" style={{ color: '#8aa0ad' }}>{paket.klinik.isim}</p>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {paket.klinik.uzmanlik.slice(0, 3).map(u => (
              <span key={u} className="text-xs px-2.5 py-0.5 rounded-full"
                style={{ background: 'rgba(0,210,211,0.1)', color: '#00D2D3', border: '1px solid rgba(0,210,211,0.2)' }}>{u}</span>
            ))}
          </div>
          <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid #e8e0d0' }}>
            <div>
              <p className="text-[11px] mb-0.5" style={{ color: '#8aa0ad' }}>{dil === 'tr' ? 'Toplam fiyat' : 'Total price'}</p>
              <span className="font-serif text-2xl font-bold" style={{ color: '#FF4757' }}>{formatla(paket.toplam_fiyat)}</span>
            </div>
            <div className="text-right">
              <p className="text-[11px]" style={{ color: '#8aa0ad' }}>{paket.sure_gun} {dil === 'tr' ? 'gün' : 'days'}</p>
              {paket.ucus_dahil && <span className="text-xs font-medium" style={{ color: '#00D2D3' }}>✈ {dil === 'tr' ? 'Uçuş dahil' : 'Flight included'}</span>}
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

const SEHIRLER = ['İstanbul', 'Ankara', 'İzmir', 'Antalya', 'Bursa'];

export default function HomePage() {
  const { dil, setDil } = useDilContext();
  const { setChatAcik, setOnAcilMesaj } = useChatContext();
  const tr = dil === 'tr';

  const [paketler, setPaketler] = useState<Paket[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState(false);
  const [tedaviMetni, setTedaviMetni] = useState('');
  const [sehirSecim, setSehirSecim] = useState('İstanbul');
  const [panelTarih, setPanelTarih] = useState('');

  useEffect(() => {
    fetch('/api/packages')
      .then(r => r.json())
      .then((json: { success: boolean; data: Paket[] }) => {
        if (json.success) setPaketler(json.data.slice(0, 3));
        else setHata(true);
      })
      .catch(() => setHata(true))
      .finally(() => setYukleniyor(false));
  }, []);

  const tumYorumlar = [...YORUMLAR, ...YORUMLAR];

  function paketBul(tedavi?: string) {
    const metin = tedavi ?? tedaviMetni;
    if (!metin.trim()) { setChatAcik(true); return; }
    const parcalar = [metin.trim()];
    if (sehirSecim) parcalar.push(sehirSecim);
    if (panelTarih) parcalar.push(`tarih: ${panelTarih}`);
    setOnAcilMesaj(parcalar.join(', '));
    setChatAcik(true);
  }

  return (
    <main className="min-h-screen antialiased" style={{ background: '#FDFBF7', color: '#0D1E25' }}>

      {/* ─── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pb-44"
        style={{ background: 'linear-gradient(180deg, #0D1E25 0%, #060f13 100%)' }}>
        <div className="absolute inset-0 opacity-25 mix-blend-luminosity"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1602002418816-5c0aeef426aa?auto=format&fit=crop&w=2400&q=80')", backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(13,30,37,0.4) 0%, rgba(13,30,37,0.7) 60%, #0D1E25 100%)' }} />

        {/* Selçuklu desen */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.05]">
          <svg className="h-full w-full"><defs><pattern id="seljuk-hero" x="0" y="0" width="140" height="140" patternUnits="userSpaceOnUse">
            <g fill="none" stroke="white" strokeWidth="1">
              <rect x="40" y="40" width="60" height="60"/>
              <rect x="40" y="40" width="60" height="60" transform="rotate(45 70 70)"/>
              <polygon points="70,46 90,56 100,70 90,84 70,94 50,84 40,70 50,56"/>
            </g>
          </pattern></defs><rect width="100%" height="100%" fill="url(#seljuk-hero)"/></svg>
        </div>

        <div className="pointer-events-none absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full blur-3xl" style={{ background: 'rgba(0,210,211,0.1)' }} />
        <div className="pointer-events-none absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full blur-3xl" style={{ background: 'rgba(255,71,87,0.08)' }} />

        <div className="relative mx-auto max-w-7xl px-6 pt-24 lg:px-8 lg:pt-32">
          <div className="mx-auto max-w-5xl text-center">

            <div className="mb-9 inline-flex items-center gap-2.5 rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] backdrop-blur-md"
              style={{ background: 'rgba(0,210,211,0.1)', border: '1px solid rgba(0,210,211,0.2)', color: '#00D2D3' }}>
              <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: '#00D2D3' }} />
              {tr ? 'DÜNYA STANDARTLARINDA SAĞLIK TURİZMİ' : 'WORLD-CLASS HEALTH TOURISM'}
            </div>

            <h1 className="font-serif text-balance leading-[0.95] tracking-tight text-white"
              style={{ fontSize: 'clamp(56px, 10vw, 112px)' }}>
              {tr ? 'Sağlık ile Tatilin' : 'Where Health Meets'}
              <span className="block italic" style={{
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                backgroundImage: 'linear-gradient(135deg, #00D2D3, #7fffd4, #FF4757)',
                backgroundClip: 'text',
              }}>
                {tr ? 'Buluştuğu Yer' : 'Your Holiday'}
              </span>
            </h1>

            <p className="mx-auto mt-8 max-w-xl text-lg font-medium sm:text-xl" style={{ color: 'rgba(255,255,255,0.65)' }}>
              {tr ? 'Uçak · 5★ Resort · JCI Akredite Klinikler — yapay zekâ destekli tek paket.' : 'Flight · 5★ Resort · JCI Clinics — one AI-powered package.'}
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-[13px] font-medium" style={{ color: 'rgba(255,255,255,0.55)' }}>
              {['Saç ekimi', 'Diş', 'Estetik', 'Göz tedavisi', 'Ortopedi'].map(chip => (
                <span key={chip} className="rounded-full px-3 py-1"
                  style={{ background: chip === 'Estetik' ? 'rgba(255,71,87,0.15)' : 'rgba(255,255,255,0.05)', color: chip === 'Estetik' ? '#FF4757' : undefined, border: chip === 'Estetik' ? '1px solid rgba(255,71,87,0.3)' : '1px solid rgba(255,255,255,0.1)' }}>
                  {chip}
                </span>
              ))}
            </div>

            {/* İstatistikler */}
            <div className="mt-14 grid grid-cols-2 gap-y-8 sm:grid-cols-4 sm:gap-x-10">
              {[
                { sayi: '500', ek: '+', label: tr ? 'Akredite Klinik' : 'Accredited Clinics' },
                { sayi: '50',  ek: '+', label: tr ? 'Ülkeden Hasta' : 'Countries' },
                { sayi: '%98', ek: '',  label: tr ? 'Memnuniyet' : 'Satisfaction' },
                { sayi: '200', ek: '+', label: tr ? 'Uzman Doktor' : 'Expert Doctors' },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <div className="font-serif text-white" style={{ fontSize: 'clamp(36px, 5vw, 56px)' }}>
                    {s.sayi}<span style={{ color: '#00D2D3' }}>{s.ek}</span>
                  </div>
                  <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: 'rgba(255,255,255,0.4)' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── YÜZEN AI PANEL ───────────────────────────────────────────── */}
      <section className="relative -mt-28 z-20">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="relative rounded-3xl p-2 backdrop-blur-2xl"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(0,210,211,0.2)', boxShadow: '0 35px 60px -15px rgba(0,0,0,0.5)' }}>
            <div className="rounded-[20px] p-5 sm:p-6" style={{ background: 'rgba(13,30,37,0.92)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-9 w-9 place-items-center rounded-xl"
                    style={{ background: 'linear-gradient(135deg, #00D2D3, #0891b2)', boxShadow: '0 0 20px rgba(0,210,211,0.4)' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>
                      <path d="M20 3v4"/><path d="M22 5h-4"/>
                    </svg>
                  </span>
                  <div>
                    <div className="text-sm font-bold text-white">{tr ? 'AI Asistanı' : 'AI Assistant'}</div>
                    <div className="text-[11px]" style={{ color: 'rgba(255,255,255,0.45)' }}>
                      {tr ? 'Şikayetinizi yazın, 60 saniyede özel paket hazırlasın' : 'Describe your concern, get a custom package in 60s'}
                    </div>
                  </div>
                </div>
                <span className="hidden sm:inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold"
                  style={{ background: 'rgba(0,210,211,0.1)', color: '#00D2D3', border: '1px solid rgba(0,210,211,0.25)' }}>
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: '#00D2D3' }} />
                  {tr ? '7/24 çevrimiçi' : '24/7 online'}
                </span>
              </div>

              <div className="grid gap-2 sm:grid-cols-12">
                <div className="sm:col-span-4 rounded-xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <label className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>{tr ? 'Tedavi' : 'Treatment'}</label>
                  <div className="flex items-center gap-2 mt-0.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00D2D3" strokeWidth="2" className="shrink-0"><circle cx="12" cy="12" r="9"/><path d="M12 7v10M7 12h10"/></svg>
                    <input value={tedaviMetni} onChange={e => setTedaviMetni(e.target.value)} onKeyDown={e => e.key === 'Enter' && paketBul()}
                      className="w-full bg-transparent text-sm font-medium text-white placeholder-white/30 outline-none"
                      placeholder={tr ? 'Örn. Saç ekimi, Hollywood Smile' : 'E.g. Hair transplant, veneers'} />
                  </div>
                </div>
                <div className="sm:col-span-3 rounded-xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <label className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>{tr ? 'Şehir' : 'City'}</label>
                  <div className="flex items-center gap-2 mt-0.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00D2D3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M20 10c0 7-8 12-8 12s-8-5-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    <select value={sehirSecim} onChange={e => setSehirSecim(e.target.value)}
                      className="w-full bg-transparent text-sm font-medium text-white outline-none cursor-pointer appearance-none [color-scheme:dark]">
                      {SEHIRLER.map(s => <option key={s} value={s} style={{ background: '#0D1E25' }}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="sm:col-span-3 rounded-xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <label className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>{tr ? 'Tarih' : 'Date'}</label>
                  <div className="flex items-center gap-2 mt-0.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00D2D3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                    <input type="date" value={panelTarih} onChange={e => setPanelTarih(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full bg-transparent text-sm font-medium text-white outline-none [color-scheme:dark]" />
                  </div>
                </div>
                <button onClick={() => paketBul()}
                  className="sm:col-span-2 group inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-3 text-sm font-bold text-white transition-all hover:scale-105"
                  style={{ background: '#FF4757', boxShadow: '0 0 20px rgba(255,71,87,0.4)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#e63950')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#FF4757')}>
                  {tr ? 'Paket Bul' : 'Find'}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition group-hover:translate-x-0.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </button>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2 text-[12px]">
                <span style={{ color: 'rgba(255,255,255,0.35)' }}>{tr ? 'Popüler:' : 'Popular:'}</span>
                {['FUE saç ekimi', 'Hollywood Smile', 'LASIK', 'Liposuction'].map(chip => (
                  <button key={chip} onClick={() => paketBul(chip)}
                    className="rounded-full px-3 py-1 transition-all text-white/70 hover:text-[#00D2D3]"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
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
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em]" style={{ color: '#00D2D3' }}>Health &amp; Holiday</p>
            <h2 className="font-serif text-5xl tracking-tight sm:text-6xl" style={{ color: '#0D1E25' }}>
              {tr ? 'İhtisas alanları, ' : 'Specialties, '}<span className="italic">premium</span>{tr ? ' deneyim.' : ' experience.'}
            </h2>
          </div>
          <Link href="/packages" className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold transition-colors"
            style={{ color: '#0D1E25' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#00D2D3')}
            onMouseLeave={e => (e.currentTarget.style.color = '#0D1E25')}>
            {tr ? 'Tümünü gör' : 'View all'}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {MAG_KATEGORILER.map(kat => (
            <Link key={kat.slug} href={`/packages?uzmanlik=${kat.slug}`} className="group block rounded-2xl">
              <article className="relative overflow-hidden rounded-2xl" style={{ aspectRatio: '3/4', boxShadow: '0 4px 24px rgba(13,30,37,0.12)' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={kat.foto} alt={kat.baslik}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #0D1E25 0%, rgba(13,30,37,0.4) 50%, transparent 100%)' }} />
                {kat.jci && (
                  <span className="absolute top-4 left-4 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#0D1E25]"
                    style={{ background: '#00D2D3', boxShadow: '0 0 12px rgba(0,210,211,0.5)' }}>
                    ★ JCI Certified
                  </span>
                )}
                <div className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full text-white"
                  style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17 17 7M7 7h10v10"/></svg>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] mb-1" style={{ color: '#00D2D3' }}>{kat.sehir}</div>
                  <h3 className="font-serif text-3xl leading-tight">{kat.baslik}</h3>
                  <p className="mt-1.5 text-[13px]" style={{ color: 'rgba(255,255,255,0.65)' }}>{kat.alt}</p>
                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.45)' }}>{tr ? 'Başlangıç' : 'From'}</div>
                      <div className="font-serif text-2xl text-white">{kat.fiyat}</div>
                    </div>
                    <span className="rounded-full px-3 py-1.5 text-[11px] font-semibold text-white"
                      style={{ background: 'rgba(255,71,87,0.8)', backdropFilter: 'blur(8px)' }}>
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
      <section className="relative border-y overflow-hidden" style={{ background: '#FDFBF7', borderColor: '#e8e0d0' }}>
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.03]">
          <svg className="h-full w-full"><defs><pattern id="iznik-paket" x="0" y="0" width="160" height="160" patternUnits="userSpaceOnUse">
            <g fill="none" stroke="#0D1E25" strokeWidth="1.2">
              <rect x="50" y="50" width="60" height="60"/>
              <rect x="50" y="50" width="60" height="60" transform="rotate(45 80 80)"/>
              <circle cx="80" cy="80" r="3" fill="#00D2D3" stroke="none"/>
            </g>
          </pattern></defs><rect width="100%" height="100%" fill="url(#iznik-paket)"/></svg>
        </div>
        <div className="pointer-events-none absolute -top-32 -left-32 h-[400px] w-[400px] rounded-full blur-3xl" style={{ background: 'rgba(0,210,211,0.06)' }} />
        <div className="pointer-events-none absolute -bottom-32 -right-32 h-[400px] w-[400px] rounded-full blur-3xl" style={{ background: 'rgba(255,71,87,0.05)' }} />

        <div className="relative mx-auto max-w-7xl px-6 py-24 lg:px-8">
          <div className="flex items-end justify-between gap-6 mb-10">
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em]" style={{ color: '#00D2D3' }}>{tr ? 'Öne Çıkanlar' : 'Featured'}</p>
              <h2 className="font-serif text-5xl tracking-tight sm:text-6xl" style={{ color: '#0D1E25' }}>{tr ? 'Popüler Paketler' : 'Popular Packages'}</h2>
            </div>
            <Link href="/packages" className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold transition-colors"
              style={{ color: '#0D1E25' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#00D2D3')}
              onMouseLeave={e => (e.currentTarget.style.color = '#0D1E25')}>
              {tr ? 'Tümünü gör' : 'View all'}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </Link>
          </div>

          {yukleniyor && (
            <div className="flex justify-center py-16">
              <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin"
                style={{ borderColor: '#00D2D3', borderTopColor: 'transparent' }} />
            </div>
          )}
          {!yukleniyor && hata && (
            <div className="text-center py-16 rounded-2xl" style={{ border: '1px solid rgba(255,71,87,0.2)', background: 'rgba(255,71,87,0.04)' }}>
              <p style={{ color: '#FF4757' }}>{tr ? 'Paketler yüklenemedi' : 'Could not load packages'}</p>
            </div>
          )}
          {!yukleniyor && !hata && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {paketler.map(paket => <PaketKarti key={paket.id} paket={paket} dil={dil} />)}
            </div>
          )}
        </div>
      </section>

      {/* ─── NEDEN HEALTHTOUR ─────────────────────────────────────────── */}
      <section className="py-24" style={{ background: '#F7F1E3' }}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center mb-14">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em]" style={{ color: '#00D2D3' }}>{tr ? 'Neden Biz?' : 'Why Us?'}</p>
            <h2 className="font-serif text-5xl tracking-tight sm:text-6xl" style={{ color: '#0D1E25' }}>
              {tr ? 'Neden ' : 'Why '}<span className="italic">HealthTour?</span>
            </h2>
            <p className="mt-4 text-lg" style={{ color: '#3d5562' }}>
              {tr ? 'Güvenilir, hızlı ve kişiselleştirilmiş sağlık turizmi deneyimi' : 'Reliable, fast and personalized health tourism experience'}
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { ikonBg: 'rgba(0,210,211,0.08)', ikonBorder: 'rgba(0,210,211,0.2)', ikonRenk: '#00D2D3', foto: 'https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=1000&q=80', baslik: tr ? 'JCI Akredite Klinikler' : 'JCI Accredited Clinics', aciklama: tr ? 'Uluslararası Joint Commission akreditasyonuna sahip, güvenilir klinikler.' : 'Internationally accredited and audited clinics.', border: 'rgba(0,210,211,0.15)', bg: 'rgba(0,210,211,0.03)' },
              { ikonBg: 'rgba(255,71,87,0.08)', ikonBorder: 'rgba(255,71,87,0.2)', ikonRenk: '#FF4757', foto: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1000&q=80', baslik: tr ? 'Uçak + Otel + Sağlık' : 'Flight + Hotel + Health', aciklama: tr ? 'Seyahatin tüm detaylarını tek rezervasyonla hallediyor.' : 'Handle all travel details in one booking.', border: 'rgba(255,71,87,0.12)', bg: 'rgba(255,71,87,0.03)' },
              { ikonBg: 'rgba(13,30,37,0.06)', ikonBorder: 'rgba(13,30,37,0.15)', ikonRenk: '#0D1E25', foto: 'https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?auto=format&fit=crop&w=1000&q=80', baslik: tr ? 'AI Destekli Öneri' : 'AI-Powered Recommendation', aciklama: tr ? 'Şikayetini anlat, yapay zekamız en uygun paketi bulsun.' : 'Describe your concern, our AI finds the best package.', border: 'rgba(13,30,37,0.1)', bg: 'rgba(13,30,37,0.02)' },
            ].map(o => (
              <article key={o.baslik} className="overflow-hidden rounded-2xl transition hover:-translate-y-1 hover:shadow-xl"
                style={{ background: o.bg, border: `1px solid ${o.border}` }}>
                <div className="h-44 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={o.foto} alt={o.baslik} className="h-full w-full object-cover" />
                </div>
                <div className="p-6">
                  <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl text-xl"
                    style={{ background: o.ikonBg, border: `1px solid ${o.ikonBorder}`, color: o.ikonRenk }}>
                    {o.ikonRenk === '#00D2D3' ? '🏥' : o.ikonRenk === '#FF4757' ? '✈️' : '🤖'}
                  </div>
                  <h3 className="font-serif text-2xl mb-2" style={{ color: '#0D1E25' }}>{o.baslik}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#3d5562' }}>{o.aciklama}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ─── MÜŞTERİ YORUMLARI ────────────────────────────────────────── */}
      <section className="relative border-y py-20 md:py-24 overflow-hidden" style={{ background: '#F7F1E3', borderColor: '#e8e0d0' }}>
        <div className="relative mx-auto max-w-7xl px-6 text-center lg:px-8 mb-12">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em]" style={{ color: '#00D2D3' }}>{tr ? 'Müşteri Yorumları' : 'Customer Reviews'}</p>
          <h2 className="font-serif text-4xl sm:text-5xl tracking-tight" style={{ color: '#0D1E25' }}>
            {tr ? 'Onlar ' : 'What Do '}<span className="italic">{tr ? 'Ne Diyor?' : 'They Say?'}</span>
          </h2>
        </div>
        <div className="overflow-hidden">
          <div className="flex animate-marquee gap-5 sm:gap-6 w-max">
            {tumYorumlar.map((y, i) => (
              <article key={i} className="w-[300px] sm:w-[340px] shrink-0 rounded-2xl p-5 sm:p-6"
                style={{ background: '#FDFBF7', border: '1px solid #e8e0d0' }}>
                <div className="flex items-center gap-0.5 text-base mb-3">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <span key={s} style={{ color: s < y.puan ? '#FF4757' : '#e8e0d0' }}>★</span>
                  ))}
                </div>
                <p className="font-serif text-lg leading-snug italic mb-5" style={{ color: '#0D1E25' }}>&ldquo;{y.yorum}&rdquo;</p>
                <div className="flex items-center gap-3 pt-4" style={{ borderTop: '1px solid #e8e0d0' }}>
                  <div className="grid h-10 w-10 place-items-center rounded-full text-sm font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, #00D2D3, #0D1E25)' }}>
                    {y.ad.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold" style={{ color: '#0D1E25' }}>{y.ad}</div>
                    <div className="text-xs" style={{ color: '#8aa0ad' }}><span className="font-mono">{y.kod}</span> {y.ulke}</div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ─── GÜVEN BANDI ──────────────────────────────────────────────── */}
      <section className="py-16" style={{ background: '#FDFBF7' }}>
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-y-10 px-6 sm:grid-cols-4 lg:px-8">
          {[
            { bg: 'rgba(0,210,211,0.08)', border: 'rgba(0,210,211,0.2)', renk: '#00D2D3', baslik: tr ? 'JCI Sertifikası' : 'JCI Certificate', aciklama: tr ? 'Uluslararası akreditasyon' : 'International accreditation', ikon: '🏆' },
            { bg: 'rgba(13,30,37,0.05)', border: 'rgba(13,30,37,0.1)', renk: '#0D1E25', baslik: tr ? 'Gizlilik Garantisi' : 'Privacy Guarantee', aciklama: tr ? 'Verileriniz korunur' : 'Your data is protected', ikon: '🔒' },
            { bg: 'rgba(255,71,87,0.06)', border: 'rgba(255,71,87,0.15)', renk: '#FF4757', baslik: tr ? '7/24 Destek' : '24/7 Support', aciklama: tr ? 'Her an yanınızdayız' : 'Always here for you', ikon: '📞' },
            { bg: 'rgba(0,210,211,0.06)', border: 'rgba(0,210,211,0.15)', renk: '#00D2D3', baslik: tr ? 'Güvenli Ödeme' : 'Secure Payment', aciklama: tr ? 'SSL korumalı işlem' : 'SSL protected transaction', ikon: '💳' },
          ].map(g => (
            <div key={g.baslik} className="text-center">
              <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl text-2xl"
                style={{ background: g.bg, border: `1px solid ${g.border}` }}>
                {g.ikon}
              </div>
              <div className="text-sm font-bold" style={{ color: '#0D1E25' }}>{g.baslik}</div>
              <div className="mt-1 text-xs" style={{ color: '#8aa0ad' }}>{g.aciklama}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA BANNER ───────────────────────────────────────────────── */}
      <section className="px-6 pb-24 lg:px-8">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[36px] px-6 py-20 text-center sm:px-16 sm:py-24"
          style={{ background: 'radial-gradient(ellipse at top left, rgba(0,210,211,0.3), transparent 55%), radial-gradient(ellipse at bottom right, rgba(255,71,87,0.25), transparent 60%), linear-gradient(180deg, #0D1E25 0%, #060f13 100%)', boxShadow: '0 35px 80px -15px rgba(13,30,37,0.7)' }}>
          <div className="absolute inset-0 opacity-15 mix-blend-overlay"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1602002418816-5c0aeef426aa?auto=format&fit=crop&w=1800&q=80')", backgroundSize: 'cover', backgroundPosition: 'center' }} />
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.05]">
            <svg className="h-full w-full"><defs><pattern id="seljuk-cta" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <g fill="none" stroke="white" strokeWidth="1"><rect x="25" y="25" width="50" height="50"/><rect x="25" y="25" width="50" height="50" transform="rotate(45 50 50)"/></g>
            </pattern></defs><rect width="100%" height="100%" fill="url(#seljuk-cta)"/></svg>
          </div>
          <div className="pointer-events-none absolute -top-10 right-10 h-40 w-40 rounded-full blur-3xl" style={{ background: 'rgba(0,210,211,0.3)' }} />
          <div className="pointer-events-none absolute -bottom-10 left-10 h-40 w-40 rounded-full blur-3xl" style={{ background: 'rgba(255,71,87,0.25)' }} />

          <div className="relative">
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.22em]" style={{ color: '#00D2D3' }}>
              {tr ? 'AI Destekli Sistem' : 'AI-Powered System'}
            </p>
            <h2 className="font-serif text-5xl tracking-tight text-white sm:text-7xl">
              {tr ? 'Hemen ' : 'Get Started '}
              <span className="italic" style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundImage: 'linear-gradient(135deg, #00D2D3, #7fffd4)', backgroundClip: 'text' }}>
                {tr ? 'Başlayın' : 'Now'}
              </span>
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-base sm:text-lg" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {tr ? 'AI asistanımız şikayetinizi analiz edip size özel paket önersin — ücretsiz ve dakikalar içinde.' : 'Our AI assistant analyzes your concern and suggests a personalized package — free, in minutes.'}
            </p>
            <button onClick={() => setChatAcik(true)}
              className="group relative mt-10 inline-flex items-center gap-2 rounded-full px-9 py-4 text-base font-bold text-white transition hover:-translate-y-0.5 hover:scale-105"
              style={{ background: '#FF4757', boxShadow: '0 0 30px rgba(255,71,87,0.5)' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#e63950')}
              onMouseLeave={e => (e.currentTarget.style.background = '#FF4757')}>
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
      <footer className="py-12" style={{ background: '#060f13' }}>
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-6 lg:flex-row lg:items-center lg:px-8">
          <div>
            <div className="flex items-center gap-0.5 font-serif text-2xl font-bold">
              <span className="text-white">Health</span><span style={{ color: '#00D2D3' }}>Tour</span>
            </div>
            <p className="mt-1 text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{tr ? 'Sağlık turizmi demo platformu' : 'Health tourism demo platform'}</p>
          </div>
          <ul className="flex flex-wrap items-center gap-6 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
            {[
              { label: tr ? 'Paketler' : 'Packages', href: '/packages' },
              { label: tr ? 'Sağlık' : 'Health', href: '/health' },
              { label: tr ? 'Oteller' : 'Hotels', href: '/hotels' },
              { label: tr ? 'Uçuşlar' : 'Flights', href: '/flights' },
              { label: tr ? 'Turlar' : 'Tours', href: '/tours' },
            ].map(l => (
              <li key={l.label}>
                <Link href={l.href} className="transition-colors hover:text-[#00D2D3]">{l.label}</Link>
              </li>
            ))}
            <li>
              <button onClick={() => setChatAcik(true)} className="transition-colors hover:text-[#00D2D3]">
                {tr ? 'AI Öneri' : 'AI Suggestion'}
              </button>
            </li>
          </ul>
          <div className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>© 2026 HealthTour</div>
        </div>
      </footer>
    </main>
  );
}