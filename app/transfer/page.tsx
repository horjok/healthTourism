'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Footer from '@/components/ui/Footer';
import { useDilContext } from '@/lib/DilContext';
import { useDoviz } from '@/lib/DovizContext';
import { useCartStore } from '@/lib/cartStore';
import { useKullaniciContext } from '@/lib/KullaniciContext';
import { useChatContext } from '@/components/ui/ChatProvider';

type TransferDB = {
  id: string;
  baslik_tr: string;
  baslik_en: string;
  aciklama_tr: string;
  aciklama_en: string;
  fiyat: number;
  birim_tr: string;
  birim_en: string;
  ozellikler_tr: string[];
  ozellikler_en: string[];
  oneri: boolean;
};

export default function TransferPage() {
  const { dil } = useDilContext();
  const tr = dil === 'tr';
  const router = useRouter();
  const { addItem } = useCartStore();
  const { formatla } = useDoviz();
  const { isKlinikYoneticisi } = useKullaniciContext();
  const { setChatAcik } = useChatContext();

  const [transfers, setTransfers] = useState<TransferDB[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [addedId, setAddedId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/transferler')
      .then(r => r.json())
      .then(json => { if (json.success) setTransfers(json.data as TransferDB[]); })
      .finally(() => setYukleniyor(false));
  }, []);

  function handleAdd(transferId: string) {
    if (isKlinikYoneticisi) return;
    const t = transfers.find(t => t.id === transferId);
    if (!t) return;
    addItem({
      id: `transfer-${transferId}`,
      type: 'transfer',
      name: tr ? t.baslik_tr : t.baslik_en,
      detail: tr ? t.aciklama_tr : t.aciklama_en,
      unitPrice: t.fiyat,
      quantity: 1,
    });
    setAddedId(transferId);
    setTimeout(() => router.push('/cart'), 1200);
  }

  const standartTransfer = transfers.find(t => !t.oneri);
  const vipTransfer = transfers.find(t => t.oneri);

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <style>{`
        .glow-gold { box-shadow: 0 0 0 1px rgba(217,119,6,0.5), 0 0 24px -2px rgba(217,119,6,0.55), inset 0 1px 0 rgba(255,255,255,0.2); }
        .iznik-bg {
          background-image:
            radial-gradient(ellipse at top right, rgba(8,145,178,0.10), transparent 60%),
            radial-gradient(ellipse at bottom left, rgba(217,119,6,0.06), transparent 55%);
        }
        .tier-card { position: relative; }
        .tier-card::before {
          content:""; position:absolute; inset:-1px; border-radius:1.5rem;
          background: linear-gradient(120deg, transparent 30%, rgba(217,119,6,0.55), rgba(8,145,178,0.55), transparent 70%);
          background-size:200% 100%; background-position:100% 0; opacity:0;
          transition: opacity .5s ease, background-position 1.2s ease; z-index:0; pointer-events:none;
        }
        .tier-card:hover::before { opacity:1; background-position:0 0; }
        .tier-card > * { position: relative; z-index: 1; }
        .flow-arrow {
          background-image: linear-gradient(to right, rgba(15,23,42,.35) 50%, transparent 50%);
          background-size: 8px 1.5px; background-repeat: repeat-x; background-position: center;
        }
      `}</style>

      {/* HERO */}
      <section className="relative overflow-hidden pb-20 md:pb-24" style={{
        background: 'radial-gradient(ellipse at top right, rgba(8,145,178,0.35), transparent 55%), radial-gradient(ellipse at bottom left, rgba(217,119,6,0.18), transparent 50%), linear-gradient(180deg,#0a1124 0%,#0f172a 60%,#0a0f1f 100%)'
      }}>
        <div className="absolute inset-0 opacity-25 mix-blend-luminosity"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=2400&q=80')", backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.06]">
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="seljuk-tr" x="0" y="0" width="140" height="140" patternUnits="userSpaceOnUse">
                <g fill="none" stroke="white" strokeWidth="1">
                  <rect x="40" y="40" width="60" height="60"/>
                  <rect x="40" y="40" width="60" height="60" transform="rotate(45 70 70)"/>
                  <polygon points="70,46 90,56 100,70 90,84 70,94 50,84 40,70 50,56"/>
                </g>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#seljuk-tr)"/>
          </svg>
        </div>

        <div className="relative mx-auto max-w-7xl px-6 pt-10 md:pt-14 lg:px-8">
          <div className="mb-6 flex items-center gap-2 text-xs font-medium text-white/50">
            <a href="/" className="hover:text-white/80 transition">{tr ? 'Ana Sayfa' : 'Home'}</a>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            <span className="text-amber-300">Transfer</span>
          </div>
          <div className="max-w-3xl">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-amber-300">
              {tr ? 'Private & Shuttle Transfer · 7/24 Hizmet' : 'Private & Shuttle Transfer · 24/7 Service'}
            </p>
            <h1 className="text-5xl sm:text-6xl md:text-7xl tracking-tight text-white leading-[0.95]"
              style={{ fontFamily: 'var(--font-dm-serif)' }}>
              {tr
                ? <>{`Transferinizi `}<span className="italic bg-gradient-to-r from-cyan-300 via-amber-200 to-amber-400 bg-clip-text text-transparent">Seçin</span></>
                : <>{`Choose Your `}<span className="italic bg-gradient-to-r from-cyan-300 via-amber-200 to-amber-400 bg-clip-text text-transparent">Transfer</span></>}
            </h1>
            <p className="mt-5 max-w-xl text-base sm:text-lg text-white/65">
              {tr
                ? 'Havalimanından otelinize ve kliniğinize konforlu ulaşım — Türkçe-İngilizce şoför rehberlik hizmeti dahil.'
                : 'Comfortable transportation from airport to your hotel and clinic — Turkish-English speaking driver guide included.'}
            </p>
          </div>
        </div>
      </section>

      {/* ROUTE FLOW */}
      <section className="relative -mt-12 md:-mt-14 z-10 px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-2xl bg-white p-5 sm:p-6 shadow-[0_30px_50px_-20px_rgba(15,23,42,0.25)] ring-1 ring-slate-200/70">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#0891b2] mb-4 text-center sm:text-left">
            {tr ? 'Yolculuk Akışı' : 'Journey Flow'}
          </p>
          <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-cyan-50 ring-1 ring-cyan-100 pl-1.5 pr-3.5 py-1.5">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-[#0891b2] text-white">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>
              </span>
              <span className="text-sm font-bold text-[#0f172a]">{tr ? 'Havalimanı' : 'Airport'}</span>
            </div>
            <span className="hidden sm:block flex-1 h-px flow-arrow"></span>
            <span className="block sm:hidden text-slate-300">→</span>

            <div className="inline-flex items-center gap-2 rounded-full bg-[#f8fafc] ring-1 ring-slate-200 pl-1.5 pr-3.5 py-1.5">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-amber-500 text-white">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"/></svg>
              </span>
              <span className="text-sm font-bold text-[#0f172a]">{tr ? 'Otel' : 'Hotel'}</span>
            </div>
            <span className="hidden sm:block flex-1 h-px flow-arrow"></span>
            <span className="block sm:hidden text-slate-300">→</span>

            <div className="inline-flex items-center gap-2 rounded-full bg-[#0f172a] text-white ring-1 ring-[#0f172a] pl-1.5 pr-3.5 py-1.5 shadow-md">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-amber-500 text-[#0f172a]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/></svg>
              </span>
              <span className="text-sm font-bold">{tr ? 'Klinik' : 'Clinic'}</span>
            </div>
            <span className="hidden sm:block flex-1 h-px flow-arrow"></span>
            <span className="block sm:hidden text-slate-300">→</span>

            <div className="inline-flex items-center gap-2 rounded-full bg-[#f8fafc] ring-1 ring-slate-200 pl-1.5 pr-3.5 py-1.5">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-amber-500 text-white">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01"/></svg>
              </span>
              <span className="text-sm font-bold text-[#0f172a]">{tr ? 'Otel' : 'Hotel'}</span>
            </div>
            <span className="hidden sm:block flex-1 h-px flow-arrow"></span>
            <span className="block sm:hidden text-slate-300">→</span>

            <div className="inline-flex items-center gap-2 rounded-full bg-cyan-50 ring-1 ring-cyan-100 pl-1.5 pr-3.5 py-1.5">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-[#0891b2] text-white">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>
              </span>
              <span className="text-sm font-bold text-[#0f172a]">{tr ? 'Havalimanı' : 'Airport'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION HEADER */}
      <section className="iznik-bg relative">
        <div className="mx-auto max-w-7xl px-6 pt-14 lg:px-8">
          <div className="flex items-end justify-between gap-4 mb-8">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#0891b2]">
                {tr ? 'Transfer Seçenekleri' : 'Transfer Options'}
              </p>
              <h2 className="text-3xl sm:text-4xl tracking-tight text-[#0f172a] mt-1"
                style={{ fontFamily: 'var(--font-dm-serif)' }}>
                {tr
                  ? <>Konforunuza göre <span className="italic">seçin</span></>
                  : <>Choose by your <span className="italic">comfort</span></>}
              </h2>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-700 ring-1 ring-emerald-100 font-bold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                {tr ? '7/24 Hizmet' : '24/7 Service'}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-amber-700 ring-1 ring-amber-100 font-bold">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="m12 2 3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z"/></svg>
                {tr ? 'JCI Klinik Onaylı' : 'JCI Clinic Approved'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* TIER CARDS */}
      <section className="relative mx-auto max-w-7xl px-6 pb-24 lg:px-8">
        {yukleniyor ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-[#0891b2] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2">

              {/* STANDART / SHUTTLE */}
              {standartTransfer && (
                <article className="tier-card group rounded-3xl bg-white ring-1 ring-slate-200 shadow-sm hover:shadow-xl transition-shadow duration-300">
                  <div className="rounded-3xl p-6 sm:p-8 flex flex-col">
                    <div className="relative h-44 sm:h-52 rounded-2xl overflow-hidden mb-6 bg-gradient-to-br from-cyan-50 via-[#f8fafc] to-cyan-100 ring-1 ring-cyan-100">
                      <svg aria-hidden="true" className="absolute inset-0 h-full w-full opacity-[0.08]" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                          <pattern id="seljuk-shuttle" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                            <g fill="none" stroke="#0891b2" strokeWidth="1">
                              <rect x="15" y="15" width="30" height="30"/>
                              <rect x="15" y="15" width="30" height="30" transform="rotate(45 30 30)"/>
                            </g>
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#seljuk-shuttle)"/>
                      </svg>
                      <div className="absolute inset-0 grid place-items-center">
                        <div className="grid h-24 w-24 place-items-center rounded-2xl bg-white ring-1 ring-cyan-100 shadow-sm">
                          <svg width="54" height="54" viewBox="0 0 24 24" fill="none" stroke="#0891b2" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/>
                            <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3"/>
                            <circle cx="7" cy="18" r="2"/>
                            <path d="M9 18h5"/>
                            <circle cx="16" cy="18" r="2"/>
                          </svg>
                        </div>
                      </div>
                      <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-white/95 backdrop-blur px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#0891b2] ring-1 ring-cyan-100">
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        {tr ? 'Paylaşımlı' : 'Shared'}
                      </span>
                      <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-white/90 backdrop-blur px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#0f172a] ring-1 ring-slate-200">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>
                        8–12 {tr ? 'kişi' : 'people'}
                      </span>
                    </div>

                    <div className="mb-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#0891b2] mb-1">Shuttle Transfer</p>
                      <h3 className="text-3xl sm:text-4xl text-[#0f172a] leading-tight" style={{ fontFamily: 'var(--font-dm-serif)' }}>
                        {tr ? standartTransfer.baslik_tr : standartTransfer.baslik_en}
                      </h3>
                      <p className="mt-1.5 text-sm text-slate-500">{tr ? standartTransfer.aciklama_tr : standartTransfer.aciklama_en}</p>
                    </div>

                    <ul className="space-y-2.5 mb-6 flex-1">
                      {(tr ? standartTransfer.ozellikler_tr : standartTransfer.ozellikler_en).map((o, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-cyan-50 text-[#0891b2] ring-1 ring-cyan-100">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                          </span>
                          <p className="text-sm font-semibold text-[#0f172a] pt-0.5">{o}</p>
                        </li>
                      ))}
                    </ul>

                    <div className="border-t border-slate-100 pt-5 flex items-end justify-between gap-3">
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-slate-500">{tr ? 'Başlangıç' : 'Starting from'}</div>
                        <div className="text-4xl text-[#0f172a] leading-none" style={{ fontFamily: 'var(--font-dm-serif)' }}>
                          {formatla(standartTransfer.fiyat)}
                          <span className="ml-1 text-xs font-sans font-medium text-slate-400">/ {tr ? standartTransfer.birim_tr : standartTransfer.birim_en}</span>
                        </div>
                      </div>
                      {!isKlinikYoneticisi && (
                        <button
                          onClick={() => handleAdd(standartTransfer.id)}
                          disabled={addedId === standartTransfer.id}
                          className={`inline-flex items-center gap-1.5 rounded-full px-4 py-3 text-sm font-bold transition ${
                            addedId === standartTransfer.id
                              ? 'bg-emerald-600 text-white'
                              : 'bg-white ring-1 ring-[#0f172a]/15 text-[#0f172a] hover:bg-[#0f172a] hover:text-white'
                          }`}>
                          {addedId === standartTransfer.id ? (
                            <>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                              {tr ? 'Eklendi' : 'Added'}
                            </>
                          ) : (
                            <>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
                              {tr ? 'Seç' : 'Select'}
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              )}

              {/* VIP / PRIVATE */}
              {vipTransfer && (
                <article className="tier-card group relative rounded-3xl bg-white ring-2 ring-amber-400 shadow-xl hover:shadow-2xl transition-shadow duration-300">
                  <span className="absolute -top-3 right-6 inline-flex items-center gap-1 rounded-full bg-amber-500 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#0f172a] glow-gold z-10">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="m12 2 3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z"/></svg>
                    {tr ? 'Önerilen' : 'Recommended'}
                  </span>

                  <div className="rounded-3xl p-6 sm:p-8 flex flex-col">
                    <div className="relative h-44 sm:h-52 rounded-2xl overflow-hidden mb-6 bg-gradient-to-br from-amber-50 via-[#f8fafc] to-[#0f172a]/5 ring-1 ring-amber-100">
                      <svg aria-hidden="true" className="absolute inset-0 h-full w-full opacity-[0.10]" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                          <pattern id="seljuk-private" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                            <g fill="none" stroke="#d97706" strokeWidth="1">
                              <rect x="15" y="15" width="30" height="30"/>
                              <rect x="15" y="15" width="30" height="30" transform="rotate(45 30 30)"/>
                              <polygon points="30,18 40,24 44,30 40,36 30,42 20,36 16,30 20,24"/>
                            </g>
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#seljuk-private)"/>
                      </svg>
                      <div className="absolute inset-0 grid place-items-center">
                        <div className="relative grid h-24 w-24 place-items-center rounded-2xl bg-white ring-1 ring-amber-200 shadow-md">
                          <svg width="54" height="54" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2"/>
                            <circle cx="6.5" cy="16.5" r="2.5"/>
                            <circle cx="16.5" cy="16.5" r="2.5"/>
                          </svg>
                          <svg className="absolute -top-2 -right-2 text-amber-500" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="m12 2 3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z"/></svg>
                        </div>
                      </div>
                      <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#0f172a] ring-1 ring-amber-300/40 glow-gold">
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><path d="m12 2 3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z"/></svg>
                        Premium
                      </span>
                      <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-white/95 backdrop-blur px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#0f172a] ring-1 ring-amber-200">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>
                        1–4 {tr ? 'kişi · Özel' : 'people · Private'}
                      </span>
                    </div>

                    <div className="mb-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-600 mb-1">Private Transfer</p>
                      <h3 className="text-3xl sm:text-4xl text-[#0f172a] leading-tight" style={{ fontFamily: 'var(--font-dm-serif)' }}>
                        {tr ? vipTransfer.baslik_tr : vipTransfer.baslik_en}
                      </h3>
                      <p className="mt-1.5 text-sm text-slate-500">{tr ? vipTransfer.aciklama_tr : vipTransfer.aciklama_en}</p>
                    </div>

                    <ul className="space-y-2.5 mb-6 flex-1">
                      {(tr ? vipTransfer.ozellikler_tr : vipTransfer.ozellikler_en).map((o, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-amber-50 text-amber-700 ring-1 ring-amber-100">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                          </span>
                          <p className="text-sm font-semibold text-[#0f172a] pt-0.5">{o}</p>
                        </li>
                      ))}
                    </ul>

                    <div className="border-t border-amber-100 pt-5 flex items-end justify-between gap-3">
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-slate-500">{tr ? 'Başlangıç' : 'Starting from'}</div>
                        <div className="text-4xl text-[#0f172a] leading-none" style={{ fontFamily: 'var(--font-dm-serif)' }}>
                          {formatla(vipTransfer.fiyat)}
                          <span className="ml-1 text-xs font-sans font-medium text-slate-400">/ {tr ? vipTransfer.birim_tr : vipTransfer.birim_en}</span>
                        </div>
                      </div>
                      {!isKlinikYoneticisi && (
                        <button
                          onClick={() => handleAdd(vipTransfer.id)}
                          disabled={addedId === vipTransfer.id}
                          className={`inline-flex items-center gap-1.5 rounded-full px-5 py-3 text-sm font-bold transition ${
                            addedId === vipTransfer.id
                              ? 'bg-emerald-600 text-white'
                              : 'bg-amber-500 text-[#0f172a] glow-gold hover:bg-amber-400 hover:-translate-y-0.5'
                          }`}>
                          {addedId === vipTransfer.id ? (
                            <>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                              {tr ? 'Eklendi' : 'Added'}
                            </>
                          ) : (
                            <>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/></svg>
                              {tr ? 'Private Seç' : 'Select Private'}
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              )}
            </div>

            {/* TRUST ROW */}
            <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  iconBg: 'bg-cyan-50 text-[#0891b2] ring-cyan-100',
                  title: tr ? 'Uçuş Takipli' : 'Flight Tracking',
                  desc: tr ? 'Gecikme durumunda ek ücret yok' : 'No extra charge for delays',
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>
                    </svg>
                  ),
                },
                {
                  iconBg: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
                  title: tr ? 'Lisanslı Şoför' : 'Licensed Driver',
                  desc: tr ? 'Sigorta + sağlık kontrolü' : 'Insurance + health check',
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/>
                    </svg>
                  ),
                },
                {
                  iconBg: 'bg-amber-50 text-amber-700 ring-amber-100',
                  title: tr ? 'GPS Canlı Takip' : 'GPS Live Tracking',
                  desc: tr ? 'Yakınınızdakini bilgilendirin' : 'Keep your family informed',
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                  ),
                },
                {
                  iconBg: 'bg-rose-50 text-rose-700 ring-rose-100',
                  title: tr ? '7/24 Destek' : '24/7 Support',
                  desc: tr ? 'Türkçe & İngilizce çağrı hattı' : 'Turkish & English call line',
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                  ),
                },
              ].map((item, i) => (
                <div key={i} className="rounded-2xl bg-white ring-1 ring-slate-200/70 p-5 shadow-sm">
                  <div className={`grid h-10 w-10 place-items-center rounded-xl ring-1 mb-3 ${item.iconBg}`}>
                    {item.icon}
                  </div>
                  <p className="text-xl text-[#0f172a] leading-tight" style={{ fontFamily: 'var(--font-dm-serif)' }}>{item.title}</p>
                  <p className="mt-1 text-xs text-slate-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
      <Footer />
    </main>
  );
}
