'use client';

import { useEffect, useState, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Paket } from '@/lib/types';
import { useDoviz } from '@/lib/DovizContext';
import { useCartStore } from '@/lib/cartStore';
import { useChatContext } from '@/components/ui/ChatProvider';
import { useDilContext } from '@/lib/DilContext';
import { paketBaslikCevir } from '@/lib/translations';
import { useKullaniciContext } from '@/lib/KullaniciContext';

// ─── Uzmanlık çevirileri (TR → EN) ───────────────────────────────────────────

const UZMANLIK_EN: Record<string, string> = {
  'Ortopedi': 'Orthopedics',
  'diş': 'Dentistry',
  'göz': 'Ophthalmology',
  'estetik cerrahi': 'Aesthetic Surgery',
  'kardiyoloji': 'Cardiology',
  'nöroloji': 'Neurology',
  'dermatoloji': 'Dermatology',
  'saç ekimi': 'Hair Transplant',
  'onkoloji': 'Oncology',
  'psikiyatri': 'Psychiatry',
};

// ─── Filtre state tipi ────────────────────────────────────────────────────────

interface FiltreState {
  uzmanlik: string;
  maxFiyat: string; // EUR cinsinden (API'ye gönderilir)
  sehir: string;
  ucusDahil: boolean;
  otelDahil: boolean;
  transferDahil: boolean;
  akredite: boolean;
  minPuan: string;
}

const BOSH_FILTRE: FiltreState = {
  uzmanlik: '',
  maxFiyat: '',
  sehir: '',
  ucusDahil: false,
  otelDahil: false,
  transferDahil: false,
  akredite: false,
  minPuan: '',
};

type SiraType = 'oneri' | 'fiyat_asc' | 'fiyat_desc' | 'puan' | 'sure';
const SAYFA_BASINA = 12;

// ─── Yıldız bileşeni ─────────────────────────────────────────────────────────

function Yildizlar({ puan }: { puan: number }) {
  const tam = Math.floor(puan);
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={i < tam ? 'text-amber-400' : 'text-slate-200'}
          width="11" height="11" viewBox="0 0 24 24" fill="currentColor"
        >
          <path d="m12 2 3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" />
        </svg>
      ))}
    </span>
  );
}

// ─── Paket kartı ──────────────────────────────────────────────────────────────

function PaketKarti({
  paket,
  onUzmanlikSec,
}: {
  paket: Paket;
  onUzmanlikSec: (u: string) => void;
}) {
  const { formatla } = useDoviz();
  const { addItem, items, incrementQuantity, decrementQuantity, removeItem } = useCartStore();
  const { dil } = useDilContext();
  const { isKlinikYoneticisi } = useKullaniciContext();
  const tr = dil === 'tr';

  const sepetItem = items.find((i) => i.id === paket.id);
  const adet = sepetItem?.quantity ?? 0;

  function sepeteEkle() {
    addItem({
      id: paket.id,
      type: 'package',
      name: paket.baslik,
      detail: `${paket.sure_gun} ${tr ? 'gün' : 'days'} · ${paket.klinik.isim} · ${paket.klinik.sehir}`,
      unitPrice: paket.toplam_fiyat,
      quantity: 1,
    });
  }

  const baslik = paketBaslikCevir(paket.baslik, dil);
  const foto = paket.klinik.fotograf_url;

  return (
    <div className="pkg-card group relative block rounded-2xl">
      <article className="relative overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm transition-shadow duration-300 hover:shadow-xl flex flex-col h-full">
        <Link href={`/packages/${paket.id}`} className="relative block h-48 overflow-hidden">
          {foto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={foto}
              alt={paket.klinik.isim}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-aegean/30 to-navy" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/20 to-navy/10" />

          {/* sol üst: JCI rozet */}
          <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5">
            {paket.klinik.akredite && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-navy pkg-glow-gold">
                <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
                  <path d="m12 2 3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" />
                </svg>
                JCI Certified
              </span>
            )}
          </div>

          {/* sağ alt: şehir + olanaklar */}
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-300">
              {paket.klinik.sehir}
            </span>
            <div className="flex items-center gap-1.5">
              {paket.otel_dahil && (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/15 ring-1 ring-white/25 backdrop-blur px-2 py-0.5 text-[10px] font-semibold text-white">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="4" y="2" width="16" height="20" rx="2" />
                  </svg>
                  {tr ? 'Otel' : 'Hotel'}
                </span>
              )}
              {paket.ucus_dahil && (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/15 ring-1 ring-white/25 backdrop-blur px-2 py-0.5 text-[10px] font-semibold text-white">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2 16l8-2 6 6 2-1-4-7 4-1 3 2 1-1-8-7 1-3 1-1-2-1-2 2-7-1-1 1 2 3-7 4-1 2z" />
                  </svg>
                  {tr ? 'Uçuş' : 'Flight'}
                </span>
              )}
            </div>
          </div>
        </Link>

        <div className="p-5 flex-1 flex flex-col">
          <Link href={`/packages/${paket.id}`} className="block">
            <h3 className="font-serif text-[22px] leading-tight text-navy hover:text-aegean transition-colors">
              {baslik}
            </h3>
          </Link>
          <p className="mt-1 text-sm text-slate-500">{paket.klinik.isim}</p>

          {/* Tıklanabilir uzmanlık rozetleri */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {paket.klinik.uzmanlik.map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => onUzmanlikSec(u)}
                title={tr ? `${u} ile filtrele` : `Filter by ${UZMANLIK_EN[u] ?? u}`}
                className="inline-flex items-center rounded-full bg-cyan-50 px-2.5 py-0.5 text-[11px] font-medium text-aegean ring-1 ring-cyan-100 hover:ring-aegean transition-all cursor-pointer"
              >
                {tr ? u : (UZMANLIK_EN[u] ?? u)}
              </button>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
              {paket.sure_gun} {tr ? 'gün' : 'days'}
            </span>
            <span className="inline-flex items-center gap-1">
              <Yildizlar puan={paket.klinik.puan} />
              <span className="ml-1 font-semibold text-navy">{paket.klinik.puan.toFixed(1)}</span>
            </span>
          </div>

          <div className="mt-5 flex items-end justify-between border-t border-slate-100 pt-4 gap-2">
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-wider text-slate-500">
                {tr ? 'Başlangıç' : 'From'}
              </div>
              <div className="font-serif text-2xl text-navy leading-none">
                {formatla(paket.toplam_fiyat)}
                <span className="ml-1 text-xs font-sans font-medium text-slate-400">
                  / {tr ? 'kişi' : 'person'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href={`/packages/${paket.id}`}
                className="rounded-full bg-white ring-1 ring-slate-200 px-3 py-2 text-xs font-bold text-navy hover:ring-aegean hover:text-aegean transition"
              >
                {tr ? 'İncele' : 'View'}
              </Link>
              {!isKlinikYoneticisi && (
                adet === 0 ? (
                  <button
                    type="button"
                    onClick={sepeteEkle}
                    className="inline-flex items-center gap-1 rounded-full bg-navy px-3 py-2 text-xs font-bold text-white hover:bg-navy/85 transition"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                    {tr ? 'Sepete' : 'Add'}
                  </button>
                ) : (
                  <div className="flex items-center gap-1">
                    <div className="flex items-center bg-slate-50 border border-slate-200 rounded-full overflow-hidden">
                      <button
                        type="button"
                        onClick={() => (adet > 1 ? decrementQuantity(paket.id) : removeItem(paket.id))}
                        aria-label={tr ? 'Azalt' : 'Decrease'}
                        className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition"
                      >
                        −
                      </button>
                      <span className="px-2 min-w-[24px] text-center text-xs font-bold text-navy tabular-nums">{adet}</span>
                      <button
                        type="button"
                        onClick={() => incrementQuantity(paket.id)}
                        aria-label={tr ? 'Arttır' : 'Increase'}
                        className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition"
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(paket.id)}
                      aria-label={tr ? 'Sepetten çıkar' : 'Remove'}
                      className="w-7 h-7 flex items-center justify-center rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                    >
                      ✕
                    </button>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}

// ─── Filtre paneli (hero ile örtüşür) ────────────────────────────────────────

function FiltrePanel({
  filtreler,
  yukleniyor,
  toplam,
  uzmanliklar,
  sehirler,
  onChange,
}: {
  filtreler: FiltreState;
  yukleniyor: boolean;
  toplam: number;
  uzmanliklar: string[];
  sehirler: string[];
  onChange: (f: FiltreState) => void;
}) {
  const { sembol, kur } = useDoviz();
  const { dil } = useDilContext();
  const tr = dil === 'tr';

  // lokal.maxFiyat seçili döviz cinsinden tutulur (gösterim için)
  const [lokal, setLokal] = useState<FiltreState>({
    ...filtreler,
    maxFiyat: filtreler.maxFiyat
      ? String(Math.round(Number(filtreler.maxFiyat) * kur))
      : '',
  });

  useEffect(() => {
    setLokal({
      ...filtreler,
      maxFiyat: filtreler.maxFiyat
        ? String(Math.round(Number(filtreler.maxFiyat) * kur))
        : '',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filtreler.uzmanlik, filtreler.maxFiyat, filtreler.sehir,
    filtreler.ucusDahil, filtreler.otelDahil, filtreler.transferDahil, filtreler.akredite, filtreler.minPuan,
    kur,
  ]);

  const set = <K extends keyof FiltreState>(k: K, v: FiltreState[K]) =>
    setLokal((prev) => ({ ...prev, [k]: v }));

  const aktifSayisi = Object.entries(lokal).filter(([, v]) => v !== '' && v !== false).length;

  function filtrele() {
    const eurMax = lokal.maxFiyat
      ? String(Math.round(Number(lokal.maxFiyat) / kur))
      : '';
    onChange({ ...lokal, maxFiyat: eurMax });
  }

  function temizle() {
    setLokal(BOSH_FILTRE);
    onChange(BOSH_FILTRE);
  }

  // Chip'ler tıklamayla anlık filtreyi tetikler
  function toggleChip(k: 'ucusDahil' | 'otelDahil' | 'transferDahil' | 'akredite') {
    const yeniLokal = { ...lokal, [k]: !lokal[k] };
    setLokal(yeniLokal);
    const eurMax = yeniLokal.maxFiyat
      ? String(Math.round(Number(yeniLokal.maxFiyat) / kur))
      : '';
    onChange({ ...yeniLokal, maxFiyat: eurMax });
  }

  const chip = (aktif: boolean) =>
    aktif
      ? 'inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-3.5 py-2 text-xs font-bold text-amber-700 transition'
      : 'inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:border-aegean hover:text-aegean transition';

  return (
    <div className="rounded-2xl bg-white p-5 sm:p-6 shadow-[0_30px_50px_-20px_rgba(15,23,42,0.25)] ring-1 ring-slate-200/70">
      {/* inputs row */}
      <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="block">
          <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 mb-1.5">
            {tr ? 'Uzmanlık' : 'Specialty'}
          </span>
          <div className="relative">
            <select
              value={lokal.uzmanlik}
              onChange={(e) => set('uzmanlik', e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-pearl/50 px-3.5 py-2.5 pr-9 text-sm font-medium text-navy appearance-none focus:outline-none focus:ring-2 focus:ring-aegean/40 focus:border-aegean"
            >
              <option value="">{tr ? 'Tüm Uzmanlıklar' : 'All Specialties'}</option>
              {uzmanliklar.map((u) => (
                <option key={u} value={u}>{tr ? u : (UZMANLIK_EN[u] ?? u)}</option>
              ))}
            </select>
            <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>
        </label>

        <label className="block">
          <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 mb-1.5">
            {tr ? 'Şehir' : 'City'}
          </span>
          <div className="relative">
            <select
              value={lokal.sehir}
              onChange={(e) => set('sehir', e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-pearl/50 px-3.5 py-2.5 pr-9 text-sm font-medium text-navy appearance-none focus:outline-none focus:ring-2 focus:ring-aegean/40 focus:border-aegean"
            >
              <option value="">{tr ? 'Tüm Şehirler' : 'All Cities'}</option>
              {sehirler.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>
        </label>

        <label className="block">
          <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 mb-1.5">
            {tr ? `Maks. Fiyat (${sembol})` : `Max. Price (${sembol})`}
          </span>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400">{sembol}</span>
            <input
              type="number"
              placeholder={tr
                ? `ör. ${Math.round(3000 * kur).toLocaleString('tr-TR')}`
                : `e.g. ${Math.round(3000 * kur).toLocaleString('en-US')}`}
              value={lokal.maxFiyat}
              onChange={(e) => set('maxFiyat', e.target.value)}
              min={0}
              className="w-full rounded-xl border border-slate-200 bg-pearl/50 pl-8 pr-3.5 py-2.5 text-sm font-medium text-navy placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-aegean/40 focus:border-aegean"
            />
          </div>
        </label>

        <label className="block">
          <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 mb-1.5">
            {tr ? 'Min. Puan' : 'Min. Rating'}
          </span>
          <div className="relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-400" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2 15 9l7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" />
            </svg>
            <input
              type="number"
              placeholder={tr ? 'ör. 4' : 'e.g. 4'}
              value={lokal.minPuan}
              onChange={(e) => set('minPuan', e.target.value)}
              min={0}
              max={5}
              step={0.1}
              className="w-full rounded-xl border border-slate-200 bg-pearl/50 pl-9 pr-3.5 py-2.5 text-sm font-medium text-navy placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-aegean/40 focus:border-aegean"
            />
          </div>
        </label>
      </div>

      {/* chip + filter row */}
      <div className="mt-5 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => toggleChip('ucusDahil')} className={chip(lokal.ucusDahil)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
            </svg>
            {tr ? 'Uçuş Dahil' : 'Flight Included'}
          </button>
          <button onClick={() => toggleChip('otelDahil')} className={chip(lokal.otelDahil)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 22v-6.57" /><path d="M14 15.43V22" /><path d="M15 16a5 5 0 0 0-6 0" />
              <rect x="4" y="2" width="16" height="20" rx="2" />
            </svg>
            {tr ? 'Otel Dahil' : 'Hotel Included'}
          </button>
          <button onClick={() => toggleChip('transferDahil')} className={chip(lokal.transferDahil)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3" />
              <rect x="9" y="11" width="14" height="10" rx="1" />
              <circle cx="12" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
            </svg>
            {tr ? 'Transfer Dahil' : 'Transfer Included'}
          </button>
          <button onClick={() => toggleChip('akredite')} className={chip(lokal.akredite)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-amber-500">
              <path d="m12 2 3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" />
            </svg>
            {tr ? 'JCI Akredite' : 'JCI Accredited'}
          </button>
          {aktifSayisi > 0 && (
            <button
              onClick={temizle}
              className="ml-1 inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-navy transition"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
              {tr ? `Filtreleri temizle (${aktifSayisi})` : `Clear filters (${aktifSayisi})`}
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-xs text-slate-500">
            {tr ? `${toplam} sonuç` : `${toplam} results`}
          </span>
          <button
            onClick={filtrele}
            disabled={yukleniyor}
            className="inline-flex items-center gap-2 rounded-xl bg-navy px-5 py-2.5 text-sm font-bold text-white hover:bg-navy/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            {yukleniyor ? (tr ? 'Aranıyor...' : 'Searching...') : (tr ? 'Filtrele' : 'Filter')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── İç sayfa bileşeni ────────────────────────────────────────────────────────

function PackagesInner() {
  const searchParams = useSearchParams();
  const { setChatAcik } = useChatContext();
  const router = useRouter();
  const { dil } = useDilContext();
  const tr = dil === 'tr';

  function urldenFiltre(): FiltreState {
    return {
      uzmanlik: searchParams.get('uzmanlik') ?? '',
      maxFiyat: searchParams.get('max_fiyat') ?? '',
      sehir: searchParams.get('sehir') ?? '',
      ucusDahil: searchParams.get('ucus_dahil') === 'true',
      otelDahil: searchParams.get('otel_dahil') === 'true',
      transferDahil: searchParams.get('transfer_dahil') === 'true',
      akredite: searchParams.get('akredite') === 'true',
      minPuan: searchParams.get('min_puan') ?? '',
    };
  }

  const [filtreler, setFiltreler] = useState<FiltreState>(urldenFiltre);
  const [paketler, setPaketler] = useState<Paket[]>([]);
  const [tumPaketler, setTumPaketler] = useState<Paket[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState(false);
  const [sira, setSira] = useState<SiraType>('oneri');
  const [sayfa, setSayfa] = useState(1);

  useEffect(() => {
    fetch('/api/packages')
      .then((r) => r.json())
      .then((json: { success: boolean; data: Paket[] }) => {
        if (json.success) setTumPaketler(json.data);
      })
      .catch(() => { });
  }, []);

  const uzmanliklar = useMemo(() => {
    const set = new Set<string>();
    tumPaketler.forEach((p) => p.klinik.uzmanlik.forEach((u) => set.add(u)));
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'tr'));
  }, [tumPaketler]);

  const sehirler = useMemo(() => {
    const set = new Set<string>();
    tumPaketler.forEach((p) => set.add(p.klinik.sehir));
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'tr'));
  }, [tumPaketler]);

  function apiFetch(f: FiltreState) {
    setYukleniyor(true);
    setHata(false);
    const p = new URLSearchParams();
    if (f.uzmanlik) p.set('uzmanlik', f.uzmanlik);
    if (f.maxFiyat) p.set('max_fiyat', f.maxFiyat);
    if (f.sehir) p.set('sehir', f.sehir);
    if (f.ucusDahil) p.set('ucus_dahil', 'true');
    if (f.otelDahil) p.set('otel_dahil', 'true');
    if (f.transferDahil) p.set('transfer_dahil', 'true');
    if (f.akredite) p.set('akredite', 'true');
    if (f.minPuan) p.set('min_puan', f.minPuan);
    fetch(`/api/packages${p.size ? '?' + p.toString() : ''}`)
      .then((r) => r.json())
      .then((json: { success: boolean; data: Paket[] }) => {
        if (json.success) setPaketler(json.data);
        else setHata(true);
      })
      .catch(() => setHata(true))
      .finally(() => setYukleniyor(false));
  }

  useEffect(() => {
    const f = urldenFiltre();
    setFiltreler(f);
    apiFetch(f);
    setSayfa(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()]);

  function urlGuncelle(f: FiltreState) {
    const p = new URLSearchParams();
    if (f.uzmanlik) p.set('uzmanlik', f.uzmanlik);
    if (f.maxFiyat) p.set('max_fiyat', f.maxFiyat);
    if (f.sehir) p.set('sehir', f.sehir);
    if (f.ucusDahil) p.set('ucus_dahil', 'true');
    if (f.otelDahil) p.set('otel_dahil', 'true');
    if (f.transferDahil) p.set('transfer_dahil', 'true');
    if (f.akredite) p.set('akredite', 'true');
    if (f.minPuan) p.set('min_puan', f.minPuan);
    router.replace(`/packages${p.size ? '?' + p.toString() : ''}`, { scroll: false });
  }

  function uzmanlikSec(u: string) {
    urlGuncelle({ ...BOSH_FILTRE, uzmanlik: u });
  }

  // ─── Sıralama (client-side) ──────────────────────────────────────────────
  const siraliPaketler = useMemo(() => {
    const arr = [...paketler];
    switch (sira) {
      case 'fiyat_asc': return arr.sort((a, b) => a.toplam_fiyat - b.toplam_fiyat);
      case 'fiyat_desc': return arr.sort((a, b) => b.toplam_fiyat - a.toplam_fiyat);
      case 'puan': return arr.sort((a, b) => b.klinik.puan - a.klinik.puan);
      case 'sure': return arr.sort((a, b) => a.sure_gun - b.sure_gun);
      default: return arr;
    }
  }, [paketler, sira]);

  // ─── Sayfalama ───────────────────────────────────────────────────────────
  const toplamSayfa = Math.max(1, Math.ceil(siraliPaketler.length / SAYFA_BASINA));
  const gosterilenler = siraliPaketler.slice(
    (sayfa - 1) * SAYFA_BASINA,
    sayfa * SAYFA_BASINA,
  );
  const baslangic = siraliPaketler.length === 0 ? 0 : (sayfa - 1) * SAYFA_BASINA + 1;
  const bitis = Math.min(sayfa * SAYFA_BASINA, siraliPaketler.length);

  // sayfa numarası üretici (max 5 kutu görünür)
  const sayfaListesi = useMemo<(number | 'gap')[]>(() => {
    if (toplamSayfa <= 5) {
      return Array.from({ length: toplamSayfa }, (_, i) => i + 1);
    }
    const liste: (number | 'gap')[] = [1];
    if (sayfa > 3) liste.push('gap');
    const baslangic = Math.max(2, sayfa - 1);
    const bitis = Math.min(toplamSayfa - 1, sayfa + 1);
    for (let i = baslangic; i <= bitis; i++) liste.push(i);
    if (sayfa < toplamSayfa - 2) liste.push('gap');
    liste.push(toplamSayfa);
    return liste;
  }, [toplamSayfa, sayfa]);

  return (
    <>
      <style jsx global>{`
        .pkg-glow-gold {
          box-shadow:
            0 0 0 1px rgba(217,119,6,0.5),
            0 0 24px -2px rgba(217,119,6,0.55),
            inset 0 1px 0 rgba(255,255,255,0.2);
        }
        .pkg-grain::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background-image: radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px);
          background-size: 3px 3px;
          mix-blend-mode: overlay;
          opacity: 0.5;
        }
        .pkg-iznik-bg {
          background-image:
            radial-gradient(ellipse at top right, rgba(8,145,178,0.10), transparent 60%),
            radial-gradient(ellipse at bottom left, rgba(217,119,6,0.06), transparent 55%);
        }
        .pkg-card::before {
          content: "";
          position: absolute;
          inset: -1px;
          border-radius: 1.25rem;
          background: linear-gradient(120deg, transparent 30%, rgba(217,119,6,0.55), rgba(8,145,178,0.55), transparent 70%);
          background-size: 200% 100%;
          background-position: 100% 0;
          opacity: 0;
          transition: opacity .5s ease, background-position 1.2s ease;
          z-index: 0;
          pointer-events: none;
        }
        .pkg-card:hover::before { opacity: 1; background-position: 0 0; }
        .pkg-card > * { position: relative; z-index: 1; }
      `}</style>

      <main className="bg-pearl text-navy min-h-screen">
        {/* ─── HERO ─────────────────────────────────────────────────── */}
        <section
          className="pkg-grain relative overflow-hidden pb-20 md:pb-24"
          style={{
            background:
              'radial-gradient(ellipse at top right, rgba(8,145,178,0.35), transparent 55%), radial-gradient(ellipse at bottom left, rgba(217,119,6,0.18), transparent 50%), linear-gradient(180deg,#0a1124 0%,#0f172a 60%,#0a0f1f 100%)',
          }}
        >
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.06]">
            <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="seljuk-paketler" x="0" y="0" width="140" height="140" patternUnits="userSpaceOnUse">
                  <g fill="none" stroke="white" strokeWidth="1">
                    <rect x="40" y="40" width="60" height="60" />
                    <rect x="40" y="40" width="60" height="60" transform="rotate(45 70 70)" />
                    <polygon points="70,46 90,56 100,70 90,84 70,94 50,84 40,70 50,56" />
                  </g>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#seljuk-paketler)" />
            </svg>
          </div>

          <div className="relative mx-auto max-w-7xl px-6 pt-16 md:pt-20 lg:px-8">
            <div className="mb-6 flex items-center gap-2 text-xs font-medium text-white/50">
              <Link href="/" className="hover:text-white/80 transition">
                {tr ? 'Ana Sayfa' : 'Home'}
              </Link>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6" />
              </svg>
              <span className="text-amber-300">{tr ? 'Tüm Paketler' : 'All Packages'}</span>
            </div>

            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div>
                <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-amber-300">
                  {tr ? 'Akredite Tıp · Lüks Konaklama' : 'Accredited Care · Luxury Stay'}
                </p>
                <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl tracking-tight text-white leading-[0.95]">
                  {tr ? 'Tüm ' : 'All '}
                  <span className="italic bg-gradient-to-r from-cyan-300 via-amber-200 to-amber-400 bg-clip-text text-transparent">
                    {tr ? 'Paketler' : 'Packages'}
                  </span>
                </h1>
                <p className="mt-4 text-base sm:text-lg text-white/65">
                  <span className="font-serif text-2xl text-white">{tumPaketler.length}</span>{' '}
                  {tr
                    ? 'paket — JCI akredite klinikler, 5 ★ otel ve özel transfer.'
                    : 'packages — JCI accredited clinics, 5★ hotels & private transfers.'}
                </p>
              </div>
              <button
                onClick={() => setChatAcik(true)}
                className="group relative inline-flex items-center gap-2 self-start md:self-end rounded-full bg-amber-500 px-6 py-3.5 text-sm font-bold text-navy pkg-glow-gold transition hover:-translate-y-0.5 hover:bg-amber-400 whitespace-nowrap"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
                  <path d="M20 3v4" /><path d="M22 5h-4" />
                </svg>
                {tr ? 'AI ile Paket Bul' : 'Find with AI'}
              </button>
            </div>
          </div>
        </section>

        {/* ─── FİLTRELER (hero ile örtüşür) ─────────────────────────── */}
        <section className="relative -mt-12 md:-mt-14 z-10 px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <FiltrePanel
              filtreler={filtreler}
              yukleniyor={yukleniyor}
              toplam={siraliPaketler.length}
              uzmanliklar={uzmanliklar}
              sehirler={sehirler}
              onChange={urlGuncelle}
            />
          </div>
        </section>

        {/* ─── SONUÇLAR BAŞLIĞI + SIRALAMA ──────────────────────────── */}
        <section className="pkg-iznik-bg relative">
          <div className="mx-auto max-w-7xl px-6 pt-12 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-aegean">
                  {tr ? 'Sonuçlar' : 'Results'}
                </p>
                <h2 className="font-serif text-3xl sm:text-4xl tracking-tight text-navy mt-1">
                  {tr ? 'Size özel paketler' : 'Packages for you'}
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <label className="hidden sm:block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {tr ? 'Sırala' : 'Sort'}
                </label>
                <div className="relative">
                  <select
                    value={sira}
                    onChange={(e) => setSira(e.target.value as SiraType)}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 pr-9 text-sm font-semibold text-navy appearance-none focus:outline-none focus:ring-2 focus:ring-aegean/40 focus:border-aegean"
                  >
                    <option value="oneri">{tr ? 'Önerilenler' : 'Recommended'}</option>
                    <option value="fiyat_asc">{tr ? 'Fiyat: düşükten yükseğe' : 'Price: low to high'}</option>
                    <option value="fiyat_desc">{tr ? 'Fiyat: yüksekten düşüğe' : 'Price: high to low'}</option>
                    <option value="puan">{tr ? 'Puana göre' : 'By rating'}</option>
                    <option value="sure">{tr ? 'Süreye göre' : 'By duration'}</option>
                  </select>
                  <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── PAKET GRID ────────────────────────────────────────────── */}
        <section className="relative mx-auto max-w-7xl px-6 pb-16 lg:px-8">
          {yukleniyor && (
            <div className="flex justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-navy border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-400 text-sm">{tr ? 'Yükleniyor...' : 'Loading...'}</p>
              </div>
            </div>
          )}

          {!yukleniyor && hata && (
            <div className="text-center py-20">
              <p className="text-red-500 font-medium">
                {tr ? 'Paketler yüklenemedi' : 'Failed to load packages'}
              </p>
              <p className="text-slate-400 text-sm mt-1">
                {tr ? 'Lütfen sayfayı yenileyin' : 'Please refresh the page'}
              </p>
            </div>
          )}

          {!yukleniyor && !hata && siraliPaketler.length === 0 && (
            <div className="text-center py-20">
              <p className="text-3xl mb-3">🔍</p>
              <p className="text-navy font-medium">
                {tr ? 'Bu kriterlere uygun paket bulunamadı' : 'No packages found for these criteria'}
              </p>
              <p className="text-slate-400 text-sm mt-1">
                {tr
                  ? 'Filtreleri değiştirmeyi ya da AI öneri aracını denemeyi deneyin'
                  : 'Try changing the filters or use the AI recommendation tool'}
              </p>
            </div>
          )}

          {!yukleniyor && !hata && gosterilenler.length > 0 && (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {gosterilenler.map((paket) => (
                  <PaketKarti
                    key={paket.id}
                    paket={paket}
                    onUzmanlikSec={uzmanlikSec}
                  />
                ))}
              </div>

              {/* ─── Sayfalama ──────────────────────────────────────── */}
              {toplamSayfa > 1 && (
                <div className="mt-14 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
                  <p className="text-sm text-slate-500">
                    <span className="font-bold text-navy">{baslangic}–{bitis}</span>{' '}
                    {tr
                      ? `· ${siraliPaketler.length} paket içinden`
                      : `· of ${siraliPaketler.length} packages`}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSayfa((s) => Math.max(1, s - 1))}
                      disabled={sayfa === 1}
                      aria-label={tr ? 'Önceki sayfa' : 'Previous'}
                      className="grid h-10 w-10 place-items-center rounded-full bg-white ring-1 ring-slate-200 text-slate-400 hover:text-navy hover:ring-aegean transition disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m15 18-6-6 6-6" />
                      </svg>
                    </button>
                    {sayfaListesi.map((p, i) =>
                      p === 'gap' ? (
                        <span key={`gap-${i}`} className="px-2 text-slate-400">…</span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => setSayfa(p)}
                          className={
                            p === sayfa
                              ? 'h-10 min-w-10 rounded-full bg-navy text-sm font-bold text-white px-3'
                              : 'h-10 min-w-10 rounded-full bg-white ring-1 ring-slate-200 text-sm font-semibold text-navy px-3 hover:ring-aegean transition'
                          }
                        >
                          {p}
                        </button>
                      )
                    )}
                    <button
                      onClick={() => setSayfa((s) => Math.min(toplamSayfa, s + 1))}
                      disabled={sayfa === toplamSayfa}
                      aria-label={tr ? 'Sonraki sayfa' : 'Next'}
                      className="grid h-10 w-10 place-items-center rounded-full bg-white ring-1 ring-slate-200 text-navy hover:text-aegean hover:ring-aegean transition disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </section>

        {/* ─── CTA STRIP ─────────────────────────────────────────────── */}
        <section className="px-6 pb-24 lg:px-8">
          <div
            className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl px-6 py-12 sm:px-12 sm:py-14 shadow-[0_30px_60px_-15px_rgba(15,23,42,0.5)]"
            style={{
              background:
                'radial-gradient(ellipse at top left, rgba(8,145,178,0.35), transparent 55%), radial-gradient(ellipse at bottom right, rgba(217,119,6,0.28), transparent 60%), linear-gradient(180deg,#0a1124 0%,#0f172a 100%)',
            }}
          >
            <div className="pointer-events-none absolute -top-10 right-10 h-32 w-32 rounded-full bg-amber-400/30 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-10 left-10 h-32 w-32 rounded-full bg-cyan-400/25 blur-3xl" />
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-8">
              <div className="flex-1">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-amber-300">
                  {tr ? 'Aradığınızı bulamadınız mı?' : "Didn't find what you need?"}
                </p>
                <h3 className="font-serif text-3xl sm:text-4xl tracking-tight text-white">
                  {tr ? (
                    <>AI <span className="italic">size özel</span> hazırlasın</>
                  ) : (
                    <>Let AI <span className="italic">tailor</span> it for you</>
                  )}
                </h3>
              </div>
              <button
                onClick={() => setChatAcik(true)}
                className="group inline-flex items-center gap-2 self-start sm:self-auto rounded-full bg-amber-500 px-6 py-3.5 text-sm font-bold text-navy pkg-glow-gold transition hover:-translate-y-0.5 hover:bg-amber-400 whitespace-nowrap"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
                  <path d="M20 3v4" /><path d="M22 5h-4" />
                </svg>
                {tr ? 'AI Paket Bul' : 'Find with AI'}
              </button>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

// ─── Sayfa ────────────────────────────────────────────────────────────────────

export default function PackagesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-screen bg-pearl">
          <div className="w-10 h-10 border-4 border-navy border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <PackagesInner />
    </Suspense>
  );
}
