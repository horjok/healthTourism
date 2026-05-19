'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { User } from '@supabase/supabase-js';
import type { Rezervasyon, Ticket } from '@/lib/types';
import { getSupabaseClient } from '@/lib/supabase-client';
import DownloadTicketButton, { type BiletItem } from '@/components/ui/DownloadTicketButton';
import { useCartStore } from '@/lib/cartStore';
import { useChatContext } from '@/components/ui/ChatProvider';

// ─── Sabit veriler ─────────────────────────────────────────────────────────────

const DURUM_STILLER: Record<string, { etiket: string; stil: string }> = {
  beklemede:  { etiket: 'Onay Bekliyor', stil: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' },
  onaylandi:  { etiket: 'Onaylandı',     stil: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' },
  tamamlandi: { etiket: 'Tamamlandı',    stil: 'bg-cyan-50 text-cyan-700 ring-1 ring-cyan-200' },
  iptal:      { etiket: 'İptal',         stil: 'bg-rose-50 text-rose-600 ring-1 ring-rose-200' },
};

const ITEM_TIPI_IKON: Record<string, string> = {
  package: '🏥', flight: '✈️', transfer: '🚗', tour: '🎯', hotel: '🏨', health: '⚕️',
};

const ITEM_TIPI_ETIKET: Record<string, string> = {
  package: 'Paket', flight: 'Uçuş', transfer: 'Transfer', tour: 'Tur', hotel: 'Otel', health: 'Sağlık',
};

const ITEM_IMG: Record<string, string> = {
  package:  'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=600&q=80',
  hotel:    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80',
  flight:   'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=600&q=80',
  tour:     'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=600&q=80',
  transfer: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=600&q=80',
  health:   'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=600&q=80',
};

const CART_TYPE_IMG: Record<string, string> = {
  flight:   'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=120&q=80',
  hotel:    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=120&q=80',
  package:  'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=120&q=80',
  tour:     'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=120&q=80',
  transfer: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=120&q=80',
  health:   'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=120&q=80',
};

const TICKET_DURUM: Record<Ticket['durum'], { etiket: string; stil: string; dot: string }> = {
  acik:    { etiket: 'Açık',      stil: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',   dot: 'bg-amber-500'  },
  islemde: { etiket: 'İşlemde',   stil: 'bg-cyan-50 text-cyan-700 ring-1 ring-cyan-200',      dot: 'bg-cyan-500'   },
  kapali:  { etiket: 'Kapatıldı', stil: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200', dot: 'bg-emerald-500' },
};

const PROGRESS_STEPS = ['Onaylandı', 'Ödendi', 'Hazırlanıyor', 'Tamamlandı'];

function stepBg(durum: string, i: number): string {
  if (durum === 'tamamlandi') return 'bg-emerald-500';
  if (durum === 'iptal')      return i === 0 ? 'bg-rose-400' : 'bg-slate-200';
  if (durum === 'onaylandi') {
    if (i < 2) return 'bg-emerald-500';
    if (i === 2) return 'bg-amber-400';
    return 'bg-slate-200';
  }
  return i === 0 ? 'bg-amber-400' : 'bg-slate-200';
}

function stepText(durum: string, i: number): string {
  if (durum === 'tamamlandi') return 'text-emerald-700 font-bold';
  if (durum === 'iptal')      return i === 0 ? 'text-rose-700 font-bold' : 'text-slate-400';
  if (durum === 'onaylandi') {
    if (i < 2) return 'text-emerald-700 font-bold';
    if (i === 2) return 'text-amber-700 font-bold';
    return 'text-slate-400';
  }
  return i === 0 ? 'text-amber-700 font-bold' : 'text-slate-400';
}

function stepLabel(durum: string, i: number): string {
  if (durum === 'beklemede' && i === 0) return 'Onay Bekliyor';
  if (durum === 'iptal'     && i === 0) return 'İptal';
  return PROGRESS_STEPS[i];
}

// ─── Yorum Modalı ─────────────────────────────────────────────────────────────

interface YorumModalProps {
  klinikId: string;
  klinikIsim: string;
  onKapat: () => void;
  onBasari: () => void;
}

function YorumModali({ klinikId, klinikIsim, onKapat, onBasari }: YorumModalProps) {
  const [puan, setPuan] = useState(0);
  const [metin, setMetin] = useState('');
  const [gonderiyor, setGonderiyor] = useState(false);
  const [hata, setHata] = useState('');

  async function gonder() {
    if (puan === 0) { setHata('Lütfen bir puan seçin.'); return; }
    setGonderiyor(true);
    setHata('');
    try {
      const res = await fetch('/api/clinic/yorumlar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ klinik_id: klinikId, puan, yorum_metni: metin }),
      });
      const json = await res.json() as { success: boolean; error?: string };
      if (!json.success) throw new Error(json.error);
      onBasari();
    } catch (e) {
      setHata(e instanceof Error ? e.message : 'Yorum gönderilemedi.');
    } finally {
      setGonderiyor(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900">Yorum Yaz</h2>
            <p className="text-xs text-gray-500 mt-0.5">{klinikIsim}</p>
          </div>
          <button onClick={onKapat} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>

        {hata && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2 text-xs text-red-600">{hata}</div>
        )}

        <div>
          <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Puanınız</p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((y) => (
              <button key={y} onClick={() => setPuan(y)}
                className={`text-2xl transition-transform hover:scale-110 ${y <= puan ? 'text-amber-400' : 'text-gray-200'}`}>
                ★
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
            Yorumunuz (isteğe bağlı)
          </label>
          <textarea value={metin} onChange={(e) => setMetin(e.target.value)} maxLength={500} rows={4}
            placeholder="Deneyiminizi paylaşın..."
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0891b2]/30" />
        </div>

        <div className="flex gap-3 pt-1">
          <button onClick={onKapat}
            className="flex-1 py-2.5 border border-gray-300 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50">
            İptal
          </button>
          <button onClick={gonder} disabled={gonderiyor}
            className="flex-[2] py-2.5 bg-[#0f172a] text-white text-sm font-bold rounded-xl hover:bg-[#0f172a]/85 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {gonderiyor ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>Gönderiliyor...</span></>
            ) : 'Yorumu Gönder'}
          </button>
        </div>
      </div>
    </div>
  );
}

type Sekme = 'rezervasyonlar' | 'destek' | 'profil';

// ─── Profil sayfası ───────────────────────────────────────────────────────────

export default function ProfilePage() {
  const router = useRouter();

  const [kullanici, setKullanici]           = useState<User | null>(null);
  const [rezervasyonlar, setRezervasyonlar] = useState<Rezervasyon[]>([]);
  const [yukleniyor, setYukleniyor]         = useState(true);
  const [rezYukleniyor, setRezYukleniyor]   = useState(false);
  const [hata, setHata]                     = useState('');
  const [sekme, setSekme]                   = useState<Sekme>('rezervasyonlar');

  const [iptalDurum, setIptalDurum] = useState<Record<string, string>>({});
  const [silDurum, setSilDurum]     = useState<Record<string, string>>({});

  const [yorumModal, setYorumModal]           = useState<{ rezId: string; klinikId: string; klinikIsim: string } | null>(null);
  const [yorumGonderildi, setYorumGonderildi] = useState<Set<string>>(new Set());

  const [tickets, setTickets]                     = useState<Ticket[]>([]);
  const [ticketYukleniyor, setTicketYukleniyor]   = useState(false);
  const [yeniKonu, setYeniKonu]                   = useState('');
  const [yeniMesaj, setYeniMesaj]                 = useState('');
  const [ticketGonderiyor, setTicketGonderiyor]   = useState(false);
  const [ticketHata, setTicketHata]               = useState('');
  const [ticketBasari, setTicketBasari]           = useState(false);

  const [goruntulenenAd, setGoruntulenenAd] = useState('');
  const [adKaydediliyor, setAdKaydediliyor] = useState(false);
  const [adMesaj, setAdMesaj]               = useState<{ tur: 'basari' | 'hata'; metin: string } | null>(null);
  const [degisiklikVar, setDegisiklikVar]   = useState(false);

  const [tercihler, setTercihler] = useState<Record<string, boolean>>({
    'E-posta Bildirimleri': true,
    'SMS Bildirimleri': true,
    'WhatsApp Bildirimleri': false,
    'AI Kişisel Paket Önerileri': true,
  });

  const cartItems   = useCartStore(s => s.items);
  const cartTotal   = useCartStore(s => s.totalPrice());
  const cartCount   = useCartStore(s => s.totalItems());
  const { setChatAcik } = useChatContext();

  useEffect(() => {
    const supabase = getSupabaseClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.replace('/auth'); return; }
      setKullanici(data.user);
      setGoruntulenenAd(data.user.user_metadata?.display_name ?? '');
      setYukleniyor(false);

      setRezYukleniyor(true);
      setTicketYukleniyor(true);
      try {
        const [rezRes, ticketRes] = await Promise.all([
          fetch('/api/booking'),
          fetch('/api/user/tickets'),
        ]);
        const [rezJson, ticketJson] = await Promise.all([
          rezRes.json() as Promise<{ success: boolean; data?: Rezervasyon[]; error?: string }>,
          ticketRes.json() as Promise<{ success: boolean; data?: Ticket[] }>,
        ]);
        if (rezJson.success && rezJson.data) setRezervasyonlar(rezJson.data);
        else setHata('Rezervasyonlar yüklenemedi.');
        if (ticketJson.success && ticketJson.data) setTickets(ticketJson.data);
      } catch {
        setHata('Sunucuya bağlanılamadı.');
      } finally {
        setRezYukleniyor(false);
        setTicketYukleniyor(false);
      }
    });
  }, [router]);

  async function silRezervasyonu(rezId: string) {
    setSilDurum((prev) => ({ ...prev, [rezId]: 'yukleniyor' }));
    try {
      const res = await fetch('/api/booking', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: rezId }),
      });
      const json = await res.json() as { success: boolean; error?: string };
      if (!json.success) throw new Error(json.error);
      setRezervasyonlar((prev) => prev.filter((r) => r.id !== rezId));
      setSilDurum((prev) => { const s = { ...prev }; delete s[rezId]; return s; });
    } catch {
      setSilDurum((prev) => ({ ...prev, [rezId]: 'hata' }));
    }
  }

  async function iptalEt(rezId: string) {
    if (!kullanici) return;
    setIptalDurum((prev) => ({ ...prev, [rezId]: 'yukleniyor' }));
    const supabase = getSupabaseClient();
    try {
      const { data, error } = await supabase
        .from('rezervasyonlar')
        .update({ durum: 'iptal' })
        .eq('id', rezId)
        .eq('kullanici_id', kullanici.id)
        .select('*')
        .single();
      if (error) throw error;
      if (data) {
        setRezervasyonlar((prev) => prev.map((r) => (r.id === rezId ? { ...r, durum: 'iptal' } : r)));
        setIptalDurum((prev) => { const s = { ...prev }; delete s[rezId]; return s; });
      } else {
        setIptalDurum((prev) => ({ ...prev, [rezId]: 'hata' }));
      }
    } catch {
      setIptalDurum((prev) => ({ ...prev, [rezId]: 'hata' }));
    }
  }

  async function ticketGonder(e: React.FormEvent) {
    e.preventDefault();
    setTicketGonderiyor(true);
    setTicketHata('');
    setTicketBasari(false);
    try {
      const res = await fetch('/api/user/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ konu: yeniKonu.trim(), mesaj: yeniMesaj.trim() }),
      });
      const json = await res.json() as { success: boolean; data?: Ticket; error?: string };
      if (!json.success) throw new Error(json.error ?? 'Talep gönderilemedi.');
      if (json.data) setTickets((prev) => [json.data!, ...prev]);
      setYeniKonu('');
      setYeniMesaj('');
      setTicketBasari(true);
    } catch (err) {
      setTicketHata(err instanceof Error ? err.message : 'Talep gönderilemedi.');
    } finally {
      setTicketGonderiyor(false);
    }
  }

  async function profilKaydet(e: React.FormEvent) {
    e.preventDefault();
    setAdKaydediliyor(true);
    setAdMesaj(null);
    const supabase = getSupabaseClient();
    try {
      const { error } = await supabase.auth.updateUser({
        data: { display_name: goruntulenenAd.trim() },
      });
      if (error) throw error;
      setAdMesaj({ tur: 'basari', metin: 'Profiliniz güncellendi.' });
      setDegisiklikVar(false);
    } catch {
      setAdMesaj({ tur: 'hata', metin: 'Güncelleme başarısız oldu.' });
    } finally {
      setAdKaydediliyor(false);
    }
  }

  if (yukleniyor) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#f8fafc]">
        <div className="w-10 h-10 border-4 border-[#0891b2] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!kullanici) return null;

  const emailKisa       = kullanici.email ?? 'Kullanıcı';
  const gorIsim         = kullanici.user_metadata?.display_name || emailKisa.split('@')[0];
  const basTusu         = gorIsim[0]?.toUpperCase() ?? 'U';
  const uyelikTarihi    = kullanici.created_at
    ? new Date(kullanici.created_at).toLocaleDateString('tr-TR', { dateStyle: 'medium' })
    : '—';

  const aktifRezler = rezervasyonlar.filter(r => r.durum !== 'iptal');
  const yaklaşanRez = aktifRezler
    .filter(r => r.tarih && new Date(r.tarih).getTime() > Date.now())
    .sort((a, b) => new Date(a.tarih!).getTime() - new Date(b.tarih!).getTime())[0] ?? aktifRezler[0] ?? null;

  const gunFarki = yaklaşanRez?.tarih
    ? Math.ceil((new Date(yaklaşanRez.tarih).getTime() - Date.now()) / 86400000)
    : null;

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <style>{`
        .iznik-bg {
          background-image:
            radial-gradient(ellipse at top right, rgba(8,145,178,0.10), transparent 60%),
            radial-gradient(ellipse at bottom left, rgba(217,119,6,0.06), transparent 55%);
        }
        .glow-gold {
          box-shadow: 0 0 0 1px rgba(217,119,6,0.5), 0 0 24px -2px rgba(217,119,6,0.55), inset 0 1px 0 rgba(255,255,255,0.2);
        }
        .prof-toggle-on  { background: #f59e0b; }
        .prof-toggle-off { background: #e2e8f0; }
      `}</style>

      {yorumModal && (
        <YorumModali
          klinikId={yorumModal.klinikId}
          klinikIsim={yorumModal.klinikIsim}
          onKapat={() => setYorumModal(null)}
          onBasari={() => {
            setYorumGonderildi((prev) => new Set(prev).add(yorumModal.rezId));
            setYorumModal(null);
          }}
        />
      )}

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pb-16 md:pb-20"
        style={{ background: 'radial-gradient(ellipse at top right, rgba(8,145,178,0.35), transparent 55%), radial-gradient(ellipse at bottom left, rgba(217,119,6,0.18), transparent 50%), linear-gradient(180deg,#0a1124 0%,#0f172a 60%,#0a0f1f 100%)' }}>

        {/* Selçuklu yıldız deseni */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.06]">
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="seljuk-profil" x="0" y="0" width="140" height="140" patternUnits="userSpaceOnUse">
                <g fill="none" stroke="white" strokeWidth="1">
                  <rect x="40" y="40" width="60" height="60" />
                  <rect x="40" y="40" width="60" height="60" transform="rotate(45 70 70)" />
                  <polygon points="70,46 90,56 100,70 90,84 70,94 50,84 40,70 50,56" />
                </g>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#seljuk-profil)" />
          </svg>
        </div>

        <div className="relative mx-auto max-w-7xl px-6 pt-10 md:pt-14 lg:px-8">
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-2 text-xs font-medium text-white/50">
            <Link href="/" className="hover:text-white/80 transition">Ana Sayfa</Link>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            <span className="text-amber-300">Profilim</span>
          </div>

          {/* Avatar + isim + stats */}
          <div className="flex flex-col md:flex-row md:items-end gap-6 md:gap-8">
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="grid h-20 w-20 sm:h-24 sm:w-24 place-items-center rounded-full ring-2 ring-white/20 shadow-xl"
                  style={{ background: 'linear-gradient(135deg, #0891b2, #0e7490, #b45309)' }}>
                  <span className="font-serif text-4xl sm:text-5xl text-white" style={{ fontFamily: 'var(--font-dm-serif), serif' }}>
                    {basTusu}
                  </span>
                </div>
                <span className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full bg-amber-500 ring-2 ring-[#0f172a]">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </span>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-300 mb-1">Hoş Geldiniz</p>
                <h1 className="text-4xl sm:text-5xl tracking-tight text-white leading-none"
                  style={{ fontFamily: 'var(--font-dm-serif), serif' }}>
                  {gorIsim.split(' ')[0]} <span className="italic">{gorIsim.split(' ').slice(1).join(' ')}</span>
                </h1>
                <p className="mt-2 text-sm text-white/60" style={{ fontFamily: 'var(--font-geist-mono), monospace' }}>{emailKisa}</p>
              </div>
            </div>

            {/* Hızlı istatistikler */}
            <div className="md:ml-auto grid grid-cols-3 gap-3 sm:gap-4">
              <div className="rounded-xl bg-white/[0.06] ring-1 ring-white/10 backdrop-blur px-4 py-3 text-center min-w-[80px]">
                <div className="text-3xl text-white leading-none" style={{ fontFamily: 'var(--font-dm-serif), serif' }}>
                  {rezervasyonlar.length}
                </div>
                <div className="mt-1 text-[9px] font-bold uppercase tracking-[0.14em] text-white/50">Rezervasyon</div>
              </div>
              <div className="rounded-xl bg-white/[0.06] ring-1 ring-white/10 backdrop-blur px-4 py-3 text-center min-w-[80px]">
                <div className="text-3xl text-white leading-none" style={{ fontFamily: 'var(--font-dm-serif), serif' }}>
                  {cartCount}
                </div>
                <div className="mt-1 text-[9px] font-bold uppercase tracking-[0.14em] text-white/50">Sepet</div>
              </div>
              <div className="rounded-xl bg-amber-500/15 ring-1 ring-amber-400/30 backdrop-blur px-4 py-3 text-center min-w-[80px]">
                <div className="text-3xl text-amber-300 leading-none" style={{ fontFamily: 'var(--font-dm-serif), serif' }}>
                  0
                </div>
                <div className="mt-1 text-[9px] font-bold uppercase tracking-[0.14em] text-amber-300/80">Bonus €</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TABS ─────────────────────────────────────────────────────────── */}
      <section className="relative z-10 -mt-7">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="inline-flex flex-wrap items-center gap-1 rounded-2xl bg-white p-1.5 ring-1 ring-slate-200/70 shadow-[0_20px_40px_-20px_rgba(15,23,42,0.25)]">

            <button onClick={() => setSekme('rezervasyonlar')}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                sekme === 'rezervasyonlar'
                  ? 'bg-[#0f172a] text-white'
                  : 'text-slate-600 hover:bg-[#f8fafc] font-semibold'
              }`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>
              Rezervasyonlarım
              {rezervasyonlar.length > 0 && (
                <span className="ml-1 inline-grid h-5 min-w-5 px-1 place-items-center rounded-full bg-amber-500 text-[10px] font-bold text-[#0f172a]">
                  {rezervasyonlar.length}
                </span>
              )}
            </button>

            <button onClick={() => setSekme('destek')}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                sekme === 'destek'
                  ? 'bg-[#0f172a] text-white'
                  : 'text-slate-600 hover:bg-[#f8fafc] font-semibold'
              }`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1v-6h3zM3 19a2 2 0 0 0 2 2h1v-6H3z"/></svg>
              Destek Taleplerim
              {tickets.some(t => t.durum === 'islemde') && (
                <span className="ml-1 inline-grid h-5 min-w-5 px-1 place-items-center rounded-full bg-cyan-100 text-[10px] font-bold text-[#0891b2]">
                  {tickets.filter(t => t.durum === 'islemde').length}
                </span>
              )}
            </button>

            <button onClick={() => setSekme('profil')}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                sekme === 'profil'
                  ? 'bg-[#0f172a] text-white'
                  : 'text-slate-600 hover:bg-[#f8fafc] font-semibold'
              }`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>
              Profilimi Düzenle
            </button>
          </div>
        </div>
      </section>

      {/* ── İÇERİK ────────────────────────────────────────────────────────── */}
      <section className="iznik-bg relative pb-24">
        <div className="mx-auto max-w-7xl px-6 pt-10 lg:px-8">

          {/* ── REZERVASYONLARIM ─────────────────────────────────────── */}
          {sekme === 'rezervasyonlar' && (
            <div className="grid lg:grid-cols-[1fr_320px] gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-3xl text-[#0f172a]" style={{ fontFamily: 'var(--font-dm-serif), serif' }}>
                    Rezervasyonlarım
                  </h2>
                </div>

                {rezYukleniyor && (
                  <div className="flex items-center gap-3 py-12 justify-center">
                    <div className="w-7 h-7 border-2 border-[#0891b2] border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-400 text-sm">Rezervasyonlar yükleniyor...</p>
                  </div>
                )}

                {hata && !rezYukleniyor && (
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-sm text-red-600">{hata}</div>
                )}

                {!rezYukleniyor && !hata && rezervasyonlar.length === 0 && (
                  <div className="rounded-2xl bg-white ring-1 ring-slate-200/70 p-12 text-center">
                    <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-amber-50 ring-1 ring-amber-100">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M9 14h6M9 18h4"/></svg>
                    </div>
                    <h3 className="text-2xl text-[#0f172a] mb-2" style={{ fontFamily: 'var(--font-dm-serif), serif' }}>
                      Henüz rezervasyonunuz yok
                    </h3>
                    <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">
                      Sağlık turizmi paketlerimizi keşfedin, AI öneri ile size özel paketi bulun.
                    </p>
                    <div className="flex flex-wrap justify-center gap-3">
                      <Link href="/packages"
                        className="inline-flex items-center gap-2 rounded-full bg-[#0f172a] px-5 py-3 text-sm font-bold text-white hover:bg-[#0f172a]/85 transition">
                        Paketlere Göz At
                      </Link>
                      <button onClick={() => setChatAcik(true)}
                        className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-5 py-3 text-sm font-bold text-[#0f172a] glow-gold transition hover:bg-amber-400">
                        ✨ AI ile Paket Bul
                      </button>
                    </div>
                  </div>
                )}

                {/* Rezervasyon kartları */}
                {!rezYukleniyor && rezervasyonlar.length > 0 && (() => {
                  const gruplar = new Map<string, Rezervasyon[]>();
                  for (const r of rezervasyonlar) {
                    const k = r.grup_kodu ?? `solo-${r.id}`;
                    if (!gruplar.has(k)) gruplar.set(k, []);
                    gruplar.get(k)!.push(r);
                  }
                  const sirali = Array.from(gruplar.entries()).sort((a, b) => {
                    const ta = new Date(a[1][0].olusturma_tarihi ?? 0).getTime();
                    const tb = new Date(b[1][0].olusturma_tarihi ?? 0).getTime();
                    return tb - ta;
                  });

                  return (
                    <div className="space-y-4">
                      {sirali.map(([grupKodu, satirlar]) => {
                        const gercekGrup  = !grupKodu.startsWith('solo-');
                        const aktifSatir  = satirlar.find(r => r.durum !== 'iptal') ?? satirlar[0];
                        const itemTipi    = aktifSatir.item_tipi ?? 'package';
                        const grupDurum   = aktifSatir.durum;
                        const pnr         = gercekGrup ? grupKodu : (satirlar[0].takip_kodu ?? satirlar[0].id.slice(0, 8).toUpperCase());
                        const grupToplam  = satirlar.reduce((s, r) => s + (r.item_fiyat ?? r.paket?.toplam_fiyat ?? 0), 0);
                        const grupTarih   = satirlar[0]?.tarih;
                        const tumuIptal   = satirlar.every(r => r.durum === 'iptal');
                        const aktifSatirlar = satirlar.filter(r => r.durum !== 'iptal');
                        const biletItems: BiletItem[] = aktifSatirlar.map(r => ({
                          isim: r.item_isim ?? r.paket?.baslik ?? r.paket?.klinik?.isim ?? '—',
                          detay: r.item_detay ?? r.paket?.klinik?.sehir ?? null,
                          tip: r.item_tipi ?? 'package',
                          fiyat: r.item_fiyat ?? r.paket?.toplam_fiyat ?? 0,
                        }));
                        const biletToplam = aktifSatirlar.reduce((s, r) => s + (r.item_fiyat ?? r.paket?.toplam_fiyat ?? 0), 0);
                        const ilk = satirlar[0];
                        const biletAd    = ilk.alici_ad ?? gorIsim;
                        const biletEmail = ilk.alici_email ?? emailKisa;
                        const biletTel   = ilk.alici_telefon ?? undefined;
                        const { etiket: durumEtiket, stil: durumStil } = DURUM_STILLER[grupDurum] ?? { etiket: grupDurum, stil: 'bg-slate-100 text-slate-600' };

                        return (
                          <article key={grupKodu}
                            className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm hover:shadow-lg transition">
                            <div className="grid md:grid-cols-[180px_1fr]">
                              {/* Sol: fotoğraf */}
                              <div className="relative h-40 md:h-auto">
                                <img
                                  src={ITEM_IMG[itemTipi] ?? ITEM_IMG.package}
                                  alt=""
                                  className="absolute inset-0 h-full w-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/60 to-transparent" />
                                <span className={`absolute top-3 left-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${durumStil}`}>
                                  <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                                  {durumEtiket}
                                </span>
                              </div>

                              {/* Sağ: içerik */}
                              <div className="p-5 md:p-6 flex flex-col gap-3">
                                <div className="flex items-start justify-between gap-4">
                                  <div>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#0891b2] mb-1">
                                      {ITEM_TIPI_ETIKET[itemTipi] ?? itemTipi}
                                      {aktifSatir.item_detay && ` · ${aktifSatir.item_detay}`}
                                    </p>
                                    <h3 className="text-2xl text-[#0f172a] leading-tight"
                                      style={{ fontFamily: 'var(--font-dm-serif), serif' }}>
                                      {aktifSatir.item_isim ?? aktifSatir.paket?.baslik ?? aktifSatir.paket?.klinik?.isim ?? '—'}
                                    </h3>
                                    <p className="mt-1 text-sm text-slate-500">
                                      Rezervasyon No{' '}
                                      <span className="font-semibold text-[#0f172a]" style={{ fontFamily: 'var(--font-geist-mono), monospace' }}>
                                        #{pnr}
                                      </span>
                                    </p>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <div className="text-2xl text-[#0f172a] leading-none"
                                      style={{ fontFamily: 'var(--font-dm-serif), serif' }}>
                                      €{grupToplam.toLocaleString('tr-TR')}
                                    </div>
                                    <div className="mt-1 text-[10px] uppercase tracking-wider text-slate-400">
                                      {grupDurum === 'tamamlandi' ? 'Ödendi' : grupDurum === 'beklemede' ? 'Beklemede' : 'Onaylandı'}
                                    </div>
                                  </div>
                                </div>

                                {/* Meta bilgiler */}
                                <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                                  {grupTarih && (
                                    <span className="inline-flex items-center gap-1.5">
                                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                                      <span className="font-semibold text-[#0f172a]">
                                        {new Date(grupTarih).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}
                                      </span>
                                    </span>
                                  )}
                                  {aktifSatir.paket?.klinik?.sehir && (
                                    <span className="inline-flex items-center gap-1.5">
                                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>
                                      {aktifSatir.paket.klinik.sehir}
                                    </span>
                                  )}
                                  {satirlar.length > 1 && (
                                    <span className="inline-flex items-center gap-1.5">
                                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>
                                      {satirlar.length} öğe
                                    </span>
                                  )}
                                </div>

                                {/* İlerleme çubuğu */}
                                <div className="mt-1 grid grid-cols-4 gap-1.5">
                                  {PROGRESS_STEPS.map((_, i) => (
                                    <div key={i} className="flex flex-col items-start gap-1">
                                      <div className={`h-1 w-full rounded-full ${stepBg(grupDurum, i)}`} />
                                      <span className={`text-[10px] ${stepText(grupDurum, i)}`}>
                                        {stepLabel(grupDurum, i)}
                                      </span>
                                    </div>
                                  ))}
                                </div>

                                {/* İptal / silme aksiyonları */}
                                <div className="flex flex-wrap items-end gap-2 mt-1 pt-3 border-t border-slate-100">
                                  {!tumuIptal && biletItems.length > 0 && (
                                    <DownloadTicketButton
                                      kompakt
                                      grupKodu={pnr}
                                      items={biletItems}
                                      tarih={grupTarih ? new Date(grupTarih).toLocaleDateString('tr-TR') : undefined}
                                      yolcuAd={biletAd}
                                      yolcuEmail={biletEmail}
                                      yolcuTel={biletTel}
                                      toplam={biletToplam}
                                    />
                                  )}

                                  {satirlar.map((rez) => {
                                    const itemEtiket = ITEM_TIPI_ETIKET[rez.item_tipi ?? 'package'] ?? 'Öğe';
                                    const itemIsim = rez.item_isim ?? rez.paket?.baslik ?? rez.paket?.klinik?.isim ?? itemEtiket;
                                    const cokluSatir = satirlar.length > 1;

                                    const btnBase = 'h-9 min-w-[120px] inline-flex items-center justify-center gap-1.5 rounded-xl text-xs font-bold transition disabled:opacity-50 disabled:cursor-not-allowed';

                                    if (rez.durum === 'iptal') {
                                      const silYukleniyor = silDurum[rez.id] === 'yukleniyor';
                                      return (
                                        <div key={rez.id} className="flex flex-col gap-1">
                                          {cokluSatir && (
                                            <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400 pl-1">
                                              {ITEM_TIPI_IKON[rez.item_tipi ?? 'package']} {itemIsim}
                                            </span>
                                          )}
                                          <button onClick={() => silRezervasyonu(rez.id)} disabled={silYukleniyor}
                                            className={`${btnBase} bg-white ring-1 ring-slate-200 text-slate-500 hover:ring-rose-200 hover:text-rose-600`}>
                                            {silYukleniyor ? 'Siliniyor…' : (
                                              <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>Kaydı Sil</>
                                            )}
                                          </button>
                                        </div>
                                      );
                                    }
                                    if (rez.durum === 'tamamlandi') {
                                      const kId = rez.paket?.klinik?.id;
                                      const kIsim = rez.paket?.klinik?.isim;
                                      if (rez.item_tipi === 'package' && kId && kIsim) {
                                        return yorumGonderildi.has(rez.id) ? (
                                          <div key={rez.id} className="flex flex-col gap-1">
                                            {cokluSatir && (
                                              <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400 pl-1">
                                                {ITEM_TIPI_IKON['package']} {itemIsim}
                                              </span>
                                            )}
                                            <span className={`${btnBase} bg-emerald-50 ring-1 ring-emerald-200 text-emerald-700`}>
                                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                              Yorumunuz alındı
                                            </span>
                                          </div>
                                        ) : (
                                          <div key={rez.id} className="flex flex-col gap-1">
                                            {cokluSatir && (
                                              <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400 pl-1">
                                                {ITEM_TIPI_IKON['package']} {itemIsim}
                                              </span>
                                            )}
                                            <button
                                              onClick={() => setYorumModal({ rezId: rez.id, klinikId: kId, klinikIsim: kIsim })}
                                              className={`${btnBase} bg-amber-50 ring-1 ring-amber-200 text-amber-700 hover:bg-amber-100`}>
                                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                                              Yorum Yap
                                            </button>
                                          </div>
                                        );
                                      }
                                    }
                                    const iptalYukleniyor = iptalDurum[rez.id] === 'yukleniyor';
                                    const iptalHata = iptalDurum[rez.id] === 'hata';
                                    return (
                                      <div key={rez.id} className="flex flex-col gap-1">
                                        {cokluSatir && (
                                          <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400 pl-1">
                                            {ITEM_TIPI_IKON[rez.item_tipi ?? 'package']} {itemIsim}
                                          </span>
                                        )}
                                        {iptalHata && <span className="text-xs text-red-500 pl-1">İptal başarısız.</span>}
                                        <button onClick={() => iptalEt(rez.id)} disabled={iptalYukleniyor}
                                          className={`${btnBase} bg-white ring-1 ring-slate-200 text-slate-500 hover:ring-rose-300 hover:text-rose-600 hover:bg-rose-50`}>
                                          {iptalYukleniyor ? 'İptal ediliyor…' : (
                                            <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>İptal Et</>
                                          )}
                                        </button>
                                      </div>
                                    );
                                  })}

                                  {grupTarih && !tumuIptal && (
                                    <span className="ml-auto text-[10px] text-slate-400" style={{ fontFamily: 'var(--font-geist-mono), monospace' }}>
                                      {Math.ceil((new Date(grupTarih).getTime() - Date.now()) / 86400000)} gün kaldı
                                    </span>
                                  )}
                                </div>

                                {tumuIptal && (
                                  <p className="text-xs text-rose-600 font-semibold text-center pt-2 border-t border-rose-100">
                                    Bu siparişteki tüm öğeler iptal edildi
                                  </p>
                                )}
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  );
                })()}

                <Link href="/packages"
                  className="block mt-3 mx-auto w-fit text-center rounded-full border-2 border-dashed border-slate-300 px-5 py-3 text-sm font-bold text-slate-500 hover:border-[#0891b2] hover:text-[#0891b2] transition">
                  + Yeni Rezervasyon Yap
                </Link>
              </div>

              {/* Yan panel: yaklaşan yolculuk + sepet */}
              <aside className="space-y-4">
                {/* Yaklaşan Yolculuk */}
                <div className="rounded-2xl bg-white ring-1 ring-slate-200/70 p-5 shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#0891b2] mb-3">Yaklaşan Yolculuk</p>
                  {yaklaşanRez ? (
                    <>
                      <div className="rounded-xl overflow-hidden relative h-28 mb-3">
                        <img
                          src={ITEM_IMG[yaklaşanRez.item_tipi ?? 'package'] ?? ITEM_IMG.package}
                          alt=""
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/80 to-transparent" />
                        <div className="absolute bottom-2 left-3">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                            {yaklaşanRez.paket?.klinik?.sehir ?? 'Türkiye'}
                          </p>
                          <p className="text-lg text-white leading-tight" style={{ fontFamily: 'var(--font-dm-serif), serif' }}>
                            {yaklaşanRez.tarih
                              ? new Date(yaklaşanRez.tarih).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
                              : '—'}
                          </p>
                        </div>
                      </div>
                      <div className="text-center py-2">
                        <div className="text-4xl text-[#0f172a]" style={{ fontFamily: 'var(--font-dm-serif), serif' }}>
                          {gunFarki !== null && gunFarki > 0
                            ? <>{gunFarki}<span className="text-base text-slate-400 font-sans ml-1">gün</span></>
                            : gunFarki === 0 ? 'Bugün' : '—'}
                        </div>
                        <div className="mt-1 text-[10px] uppercase tracking-wider text-slate-500">kalan süre</div>
                      </div>
                      <div className="mt-3 grid grid-cols-3 gap-2">
                        {['Uçuş', 'Otel', 'Transfer'].map((label) => (
                          <div key={label} className="rounded-lg bg-[#f8fafc] ring-1 ring-slate-100 p-2 text-center">
                            <div className="text-[9px] font-bold uppercase tracking-wider text-slate-500">{label}</div>
                            <div className="text-xs font-bold text-emerald-600 mt-0.5">✓</div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="py-6 text-center">
                      <p className="text-sm text-slate-400">Yaklaşan yolculuğunuz yok.</p>
                      <Link href="/packages" className="mt-3 inline-block text-xs font-bold text-[#0891b2] hover:underline">
                        Paket ara →
                      </Link>
                    </div>
                  )}
                </div>

                {/* Sepet özeti */}
                <div className="rounded-2xl bg-white ring-1 ring-slate-200/70 p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#0891b2]">Sepetiniz</p>
                    <span className="text-[10px] font-bold text-slate-400">{cartCount} öğe</span>
                  </div>

                  {cartItems.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-4">Sepetiniz boş.</p>
                  ) : (
                    <>
                      <ul className="space-y-3 max-h-48 overflow-y-auto">
                        {cartItems.slice(0, 4).map((item) => (
                          <li key={item.id} className="flex items-center gap-3">
                            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-cyan-50 text-[#0891b2] ring-1 ring-cyan-100 overflow-hidden">
                              {CART_TYPE_IMG[item.type] ? (
                                <img src={CART_TYPE_IMG[item.type]} alt="" className="h-full w-full object-cover" />
                              ) : (
                                <span className="text-lg">{ITEM_TIPI_IKON[item.type] ?? '📦'}</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-[#0f172a] truncate">{item.name}</p>
                              <p className="text-[10px] text-slate-500">{item.detail}</p>
                            </div>
                            <span className="text-sm font-bold text-[#0f172a] shrink-0" style={{ fontFamily: 'var(--font-geist-mono), monospace' }}>
                              €{item.lineTotal.toLocaleString('tr-TR')}
                            </span>
                          </li>
                        ))}
                        {cartItems.length > 4 && (
                          <li className="text-center text-xs text-slate-400">+{cartItems.length - 4} daha</li>
                        )}
                      </ul>
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500">Toplam</span>
                        <span className="text-xl text-[#0f172a]" style={{ fontFamily: 'var(--font-dm-serif), serif' }}>
                          €{cartTotal.toLocaleString('tr-TR')}
                        </span>
                      </div>
                      <Link href="/cart"
                        className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-full bg-amber-500 px-4 py-2.5 text-sm font-bold text-[#0f172a] glow-gold hover:bg-amber-400 transition">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
                        Ödemeye Geç
                      </Link>
                    </>
                  )}
                </div>
              </aside>
            </div>
          )}

          {/* ── DESTEK TALEPLERİM ────────────────────────────────────── */}
          {sekme === 'destek' && (
            <div className="grid lg:grid-cols-[1fr_320px] gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-3xl text-[#0f172a]" style={{ fontFamily: 'var(--font-dm-serif), serif' }}>
                    Destek Taleplerim
                  </h2>
                </div>

                {/* Yeni talep formu */}
                <div className="rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm p-5 sm:p-6">
                  <h3 className="font-bold text-[#0f172a] text-sm mb-4">+ Yeni Destek Talebi Oluştur</h3>
                  <form onSubmit={ticketGonder} className="space-y-4">
                    {ticketBasari && (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm text-emerald-700 font-medium">
                        Talebiniz alındı. Ekibimiz en kısa sürede dönüş yapacaktır.
                      </div>
                    )}
                    {ticketHata && (
                      <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">{ticketHata}</div>
                    )}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 mb-1.5">Konu</label>
                      <input type="text" value={yeniKonu}
                        onChange={(e) => { setYeniKonu(e.target.value); setTicketBasari(false); }}
                        maxLength={120} placeholder="Talebinizin konusunu kısaca yazın" required
                        className="w-full rounded-xl border border-slate-200 bg-[#f8fafc]/50 px-3.5 py-2.5 text-sm font-medium text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#0891b2]/40 focus:border-[#0891b2]" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 mb-1.5">Mesaj</label>
                      <textarea value={yeniMesaj}
                        onChange={(e) => { setYeniMesaj(e.target.value); setTicketBasari(false); }}
                        maxLength={2000} rows={4} placeholder="Sorununuzu veya talebinizi detaylıca açıklayın..." required
                        className="w-full rounded-xl border border-slate-200 bg-[#f8fafc]/50 px-3.5 py-2.5 text-sm font-medium text-[#0f172a] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0891b2]/40 focus:border-[#0891b2] resize-none" />
                      <p className="text-xs text-slate-400 mt-1 text-right">{yeniMesaj.length}/2000</p>
                    </div>
                    <button type="submit" disabled={ticketGonderiyor}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#0f172a] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#0f172a]/85 disabled:opacity-60 disabled:cursor-not-allowed transition">
                      {ticketGonderiyor ? (
                        <><div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>Gönderiliyor...</span></>
                      ) : (
                        <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>Talebi Gönder</>
                      )}
                    </button>
                  </form>
                </div>

                {/* Mevcut talepler */}
                {ticketYukleniyor && (
                  <div className="flex items-center gap-3 py-8 justify-center">
                    <div className="w-6 h-6 border-2 border-[#0891b2] border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-400 text-sm">Talepler yükleniyor...</p>
                  </div>
                )}

                {!ticketYukleniyor && tickets.length === 0 && (
                  <div className="rounded-2xl bg-white ring-1 ring-slate-200/70 p-8 text-center">
                    <p className="text-slate-500 text-sm">Henüz destek talebiniz bulunmuyor.</p>
                  </div>
                )}

                {!ticketYukleniyor && tickets.length > 0 && (
                  <div className="space-y-3">
                    {tickets.map((ticket) => {
                      const { etiket, stil, dot } = TICKET_DURUM[ticket.durum];
                      const isIslemde = ticket.durum === 'islemde';
                      return (
                        <article key={ticket.id}
                          className={`rounded-2xl bg-white ring-1 shadow-sm hover:shadow-lg transition overflow-hidden ${
                            isIslemde ? 'ring-amber-200' : 'ring-slate-200'
                          }`}>
                          {isIslemde && (
                            <div className="px-5 py-2 bg-amber-50 border-b border-amber-100 flex items-center gap-2">
                              <span className="flex h-2 w-2 shrink-0">
                                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-amber-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                              </span>
                              <p className="text-xs font-semibold text-amber-700">Destek ekibi talebinizi inceliyor</p>
                            </div>
                          )}
                          <div className="p-5 sm:p-6">
                            <div className="flex items-start justify-between gap-4 mb-3">
                              <div className="flex items-start gap-3">
                                <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ring-1 ${
                                  ticket.durum === 'kapali'
                                    ? 'bg-emerald-50 text-emerald-700 ring-emerald-100'
                                    : ticket.durum === 'islemde'
                                    ? 'bg-cyan-50 text-[#0891b2] ring-cyan-100'
                                    : 'bg-amber-50 text-amber-700 ring-amber-100'
                                }`}>
                                  {ticket.durum === 'kapali' ? (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                  ) : (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                                  )}
                                </div>
                                <div>
                                  <h3 className="text-xl text-[#0f172a] leading-tight" style={{ fontFamily: 'var(--font-dm-serif), serif' }}>
                                    {ticket.konu}
                                  </h3>
                                  <p className="mt-1 text-sm text-slate-500">
                                    Talep{' '}
                                    <span className="font-semibold text-[#0f172a]" style={{ fontFamily: 'var(--font-geist-mono), monospace' }}>
                                      #{ticket.id.slice(0, 8).toUpperCase()}
                                    </span>
                                    {' · '}
                                    {new Date(ticket.olusturma_tarihi).toLocaleDateString('tr-TR', { dateStyle: 'medium' })}
                                  </p>
                                </div>
                              </div>
                              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider shrink-0 ${stil}`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
                                {etiket}
                              </span>
                            </div>

                            <p className="text-sm text-slate-600 leading-relaxed mb-4 line-clamp-2">{ticket.mesaj}</p>

                            {ticket.admin_yaniti && (
                              <div className="rounded-xl bg-[#f8fafc]/70 ring-1 ring-slate-100 p-4 mb-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-[#0891b2] to-amber-700 text-white text-xs font-bold">D</span>
                                  <span className="text-xs font-bold text-[#0f172a]">Destek Ekibi · HealthTour</span>
                                </div>
                                <p className="text-sm text-slate-600 leading-relaxed">{ticket.admin_yaniti}</p>
                              </div>
                            )}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Destek yan paneli */}
              <aside className="space-y-4">
                <div className="rounded-2xl bg-white ring-1 ring-slate-200/70 p-5 shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#0891b2] mb-3">Hızlı İletişim</p>
                  <ul className="space-y-2.5">
                    <li>
                      <a href="tel:+908503332211" className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-[#f8fafc]/70 transition">
                        <span className="grid h-9 w-9 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-[#0f172a]">7/24 Telefon</p>
                          <p className="text-[11px] text-slate-500" style={{ fontFamily: 'var(--font-geist-mono), monospace' }}>+90 850 333 22 11</p>
                        </div>
                      </a>
                    </li>
                    <li>
                      <button onClick={() => setChatAcik(true)}
                        className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-[#f8fafc]/70 transition text-left">
                        <span className="grid h-9 w-9 place-items-center rounded-full bg-cyan-100 text-[#0891b2]">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-[#0f172a]">Canlı Sohbet</p>
                          <p className="text-[11px] text-emerald-600 font-semibold">● AI asistan çevrimiçi</p>
                        </div>
                      </button>
                    </li>
                  </ul>
                </div>
              </aside>
            </div>
          )}

          {/* ── PROFİLİMİ DÜZENLE ────────────────────────────────────── */}
          {sekme === 'profil' && (
            <div className="grid lg:grid-cols-[1fr_320px] gap-6">
              <div className="space-y-6">

                {/* Profil Bilgileri */}
                <form onSubmit={profilKaydet}>
                  <div className="rounded-2xl bg-white ring-1 ring-slate-200/70 p-6 sm:p-8 shadow-sm">
                    <h2 className="text-3xl text-[#0f172a] mb-1" style={{ fontFamily: 'var(--font-dm-serif), serif' }}>
                      Profil Bilgileri
                    </h2>
                    <p className="text-sm text-slate-500 mb-6">Sağlık paketleriniz için kullanılır. Kimlik bilgileriniz şifrelenir.</p>

                    {adMesaj && (
                      <div className={`rounded-xl px-4 py-3 text-sm font-medium mb-5 ${
                        adMesaj.tur === 'basari'
                          ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                          : 'bg-red-50 border border-red-200 text-red-600'
                      }`}>
                        {adMesaj.metin}
                      </div>
                    )}

                    <div className="grid sm:grid-cols-2 gap-5">
                      <label className="block">
                        <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 mb-1.5">Görüntülenen Ad</span>
                        <input type="text" value={goruntulenenAd} maxLength={60}
                          onChange={(e) => {
                            setGoruntulenenAd(e.target.value.replace(/[<>"';&\\`]/g, ''));
                            setAdMesaj(null);
                            setDegisiklikVar(true);
                          }}
                          placeholder="Adınız soyadınız"
                          className="w-full rounded-xl border border-slate-200 bg-[#f8fafc]/50 px-3.5 py-2.5 text-sm font-medium text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#0891b2]/40 focus:border-[#0891b2]" />
                      </label>
                      <label className="block">
                        <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 mb-1.5">E-posta</span>
                        <input type="email" value={emailKisa} disabled
                          className="w-full rounded-xl border border-slate-200 bg-[#f8fafc] px-3.5 py-2.5 text-sm font-medium text-slate-400 cursor-not-allowed" />
                      </label>
                    </div>
                  </div>

                  {/* Tercihler */}
                  <div className="rounded-2xl bg-white ring-1 ring-slate-200/70 p-6 sm:p-8 shadow-sm mt-6">
                    <h2 className="text-3xl text-[#0f172a] mb-1" style={{ fontFamily: 'var(--font-dm-serif), serif' }}>
                      Tercihler
                    </h2>
                    <p className="text-sm text-slate-500 mb-6">Bildirim ve iletişim tercihleriniz.</p>

                    <div className="space-y-1">
                      {[
                        { label: 'E-posta Bildirimleri', desc: 'Rezervasyon onayları, kampanyalar' },
                        { label: 'SMS Bildirimleri', desc: 'Acil durum ve tedavi günü hatırlatmaları' },
                        { label: 'WhatsApp Bildirimleri', desc: 'Anlık güncellemeler' },
                        { label: 'AI Kişisel Paket Önerileri', desc: 'Tıbbi geçmişinize göre haftalık öneri' },
                      ].map(({ label, desc }) => {
                        const on = tercihler[label] ?? false;
                        return (
                          <div key={label} className="flex items-start justify-between gap-4 py-3 border-b border-slate-100 last:border-0">
                            <div>
                              <p className="text-sm font-bold text-[#0f172a]">{label}</p>
                              <p className="text-xs text-slate-500">{desc}</p>
                            </div>
                            <button
                              type="button"
                              role="switch"
                              aria-checked={on}
                              onClick={() => {
                                setTercihler(prev => ({ ...prev, [label]: !prev[label] }));
                                setDegisiklikVar(true);
                              }}
                              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${on ? 'bg-amber-500' : 'bg-slate-200'}`}>
                              <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${on ? 'translate-x-5' : 'translate-x-0.5'}`} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Sticky kaydet çubuğu */}
                  <div className="sticky bottom-4 z-20 rounded-2xl bg-white p-4 ring-1 ring-slate-200/70 shadow-[0_20px_40px_-10px_rgba(15,23,42,0.25)] flex items-center justify-between gap-3 mt-6">
                    {degisiklikVar ? (
                      <p className="text-xs text-slate-500">
                        <span className="font-bold text-amber-600">⚠</span> Kaydedilmemiş değişiklik var
                      </p>
                    ) : (
                      <p className="text-xs text-slate-400">Üyelik: {uyelikTarihi} · {rezervasyonlar.length} rezervasyon</p>
                    )}
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => { setDegisiklikVar(false); setAdMesaj(null); }}
                        className="rounded-full bg-white ring-1 ring-slate-200 px-4 py-2 text-xs font-bold text-slate-500 hover:ring-slate-300 transition">
                        Vazgeç
                      </button>
                      <button type="submit" disabled={adKaydediliyor}
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#0f172a] px-4 py-2 text-xs font-bold text-white hover:bg-[#0f172a]/85 disabled:opacity-60 disabled:cursor-not-allowed transition">
                        {adKaydediliyor ? (
                          <><div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>Kaydediliyor...</span></>
                        ) : (
                          <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Değişiklikleri Kaydet</>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Güvenlik + tehlikeli alan yan paneli */}
              <aside className="space-y-4">
                <div className="rounded-2xl bg-white ring-1 ring-slate-200/70 p-5 shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#0891b2] mb-3">Hesap Güvenliği</p>
                  <ul className="space-y-3">
                    <li className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-[#0f172a]">Şifre</p>
                        <p className="text-[11px] text-slate-500">Son değişiklik tarihi yok</p>
                      </div>
                    </li>
                    <li className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
                      <div>
                        <p className="text-sm font-bold text-[#0f172a]">Üyelik</p>
                        <p className="text-[11px] text-slate-500">{uyelikTarihi} tarihinde katıldı</p>
                      </div>
                    </li>
                    <li className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
                      <div>
                        <p className="text-sm font-bold text-[#0f172a]">Toplam Rezervasyon</p>
                        <p className="text-[11px] text-slate-500">{rezervasyonlar.length} adet</p>
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="rounded-2xl bg-rose-50 ring-1 ring-rose-100 p-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-rose-700 mb-2">Tehlikeli Alan</p>
                  <p className="text-sm text-rose-900/80 mb-3 leading-relaxed">
                    Hesabınızı kalıcı olarak silmek tüm rezervasyon geçmişinizi kaldırır. Geri alınamaz.
                  </p>
                  <button
                    onClick={() => window.confirm('Hesabınızı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.') && undefined}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white ring-1 ring-rose-200 px-3.5 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition">
                    Hesabı Sil
                  </button>
                </div>
              </aside>
            </div>
          )}

        </div>
      </section>
    </main>
  );
}
