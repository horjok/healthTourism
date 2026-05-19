'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseClient } from '@/lib/supabase-client';

type Sekme = 'giris' | 'kayit';

// Supabase hata kodu veya mesajını Türkçeye çevir
function hataMesaji(hata: string): string {
  if (hata.includes('Invalid login credentials'))  return 'E-posta veya şifre hatalı.';
  if (hata.includes('Email not confirmed'))        return 'E-posta adresinizi onaylamanız gerekiyor.';
  if (hata.includes('User already registered'))    return 'Bu e-posta adresi zaten kayıtlı.';
  if (hata.includes('email_address_invalid'))      return 'Geçersiz e-posta adresi formatı.';
  if (hata.includes('is invalid'))                 return 'Geçersiz e-posta adresi formatı.';
  if (hata.includes('Password should be'))         return 'Şifre en az 6 karakter olmalıdır.';
  if (hata.includes('Unable to validate'))         return 'Geçersiz e-posta adresi.';
  if (hata.includes('signup is disabled'))         return 'Kayıt şu an kapalı.';
  if (hata.includes('rate limit'))                 return 'Çok fazla deneme. Lütfen biraz bekleyin.';
  if (hata.includes('over_email_send_rate_limit')) return 'Çok fazla deneme. Lütfen biraz bekleyin.';
  return 'Bir hata oluştu. Lütfen tekrar deneyin.';
}

// Şifre gücü puanı (0-4)
function sifreGucu(s: string): number {
  let skor = 0;
  if (s.length >= 8) skor++;
  if (/[A-Z]/.test(s)) skor++;
  if (/[0-9]/.test(s)) skor++;
  if (/[^A-Za-z0-9]/.test(s)) skor++;
  return skor;
}

export default function AuthPage() {
  const router = useRouter();

  const [sekme, setSekme]           = useState<Sekme>('giris');
  const [email, setEmail]           = useState('');
  const [sifre, setSifre]           = useState('');
  const [ad, setAd]                 = useState('');
  const [soyad, setSoyad]           = useState('');
  const [sifreGoster, setSifreGoster] = useState(false);
  const [kosulOnay, setKosulOnay]   = useState(false);
  const [gonderiyor, setGonderiyor] = useState(false);
  const [hata, setHata]             = useState('');
  const [basarili, setBasarili]     = useState('');

  function sekmeGec(yeni: Sekme) {
    setSekme(yeni);
    setHata('');
    setBasarili('');
  }

  async function gonderFormu(e: React.FormEvent) {
    e.preventDefault();
    setHata('');
    setBasarili('');

    if (sekme === 'kayit' && !kosulOnay) {
      setHata('Devam etmek için kullanım koşullarını kabul etmeniz gerekiyor.');
      return;
    }

    setGonderiyor(true);
    const supabase = getSupabaseClient();

    try {
      if (sekme === 'giris') {
        const { error } = await supabase.auth.signInWithPassword({ email, password: sifre });
        if (error) { setHata(hataMesaji(`${error.code ?? ''} ${error.message}`)); return; }
        router.push('/');
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password: sifre,
          options: {
            data: {
              ad: ad || undefined,
              soyad: soyad || undefined,
            },
          },
        });
        if (error) { setHata(hataMesaji(`${error.code ?? ''} ${error.message}`)); return; }
        setBasarili('Hesabınız oluşturuldu! Giriş yapabilirsiniz.');
        setSekme('giris');
        setSifre('');
      }
    } finally {
      setGonderiyor(false);
    }
  }

  async function sifremiUnuttum() {
    setHata('');
    setBasarili('');
    if (!email) {
      setHata('Lütfen önce e-posta adresinizi girin.');
      return;
    }
    setGonderiyor(true);
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) {
        setHata(hataMesaji(`${error.code ?? ''} ${error.message}`));
      } else {
        setBasarili('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.');
      }
    } finally {
      setGonderiyor(false);
    }
  }

  const guc = sifre ? sifreGucu(sifre) : 0;
  const gucEtiket =
    !sifre ? '8+ karakter, büyük harf, rakam ve sembol önerilir.' :
    guc <= 1 ? 'Çok zayıf' :
    guc === 2 ? 'Zayıf' :
    guc === 3 ? 'Orta' : 'Güçlü';
  const gucEtiketRenk =
    !sifre ? 'text-slate-400' :
    guc <= 1 ? 'text-rose-500' :
    guc === 2 ? 'text-amber-600' :
    guc === 3 ? 'text-cyan-700' : 'text-emerald-600';

  return (
    <>
      <style jsx global>{`
        .auth-glow-gold {
          box-shadow:
            0 0 0 1px rgba(217,119,6,0.5),
            0 0 24px -2px rgba(217,119,6,0.55),
            inset 0 1px 0 rgba(255,255,255,0.2);
        }
        .auth-grain::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background-image: radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px);
          background-size: 3px 3px;
          mix-blend-mode: overlay;
          opacity: 0.5;
        }
        .auth-hero-panel {
          background:
            radial-gradient(ellipse at top right, rgba(8,145,178,0.45), transparent 55%),
            radial-gradient(ellipse at bottom left, rgba(217,119,6,0.22), transparent 50%),
            linear-gradient(180deg, #0a1124 0%, #0f172a 60%, #0a0f1f 100%);
        }
      `}</style>

      <main className="bg-pearl text-navy antialiased min-h-screen">
        <div className="grid lg:grid-cols-2 min-h-screen">
          {/* ─── SOL: BRAND PANEL ─────────────────────────────── */}
          <aside className="auth-hero-panel auth-grain relative overflow-hidden hidden lg:flex flex-col p-12 xl:p-14">
            <div
              className="absolute inset-0 opacity-30 mix-blend-luminosity"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1602002418816-5c0aeef426aa?auto=format&fit=crop&w=2000&q=80')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-navy/30 via-navy/60 to-navy/95" />

            <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.07]">
              <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="seljuk-auth" x="0" y="0" width="160" height="160" patternUnits="userSpaceOnUse">
                    <g fill="none" stroke="white" strokeWidth="1">
                      <rect x="50" y="50" width="60" height="60" />
                      <rect x="50" y="50" width="60" height="60" transform="rotate(45 80 80)" />
                      <polygon points="80,56 100,66 110,80 100,94 80,104 60,94 50,80 60,66" />
                    </g>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#seljuk-auth)" />
              </svg>
            </div>

            <div className="pointer-events-none absolute -top-32 -right-32 h-[400px] w-[400px] rounded-full bg-amber-400/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-32 -left-32 h-[400px] w-[400px] rounded-full bg-cyan-400/20 blur-3xl" />

            {/* Logo */}
            <Link href="/" className="relative flex items-center gap-2 text-xl font-bold tracking-tight self-start">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-aegean to-amber-700 ring-1 ring-white/20">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" />
                  <path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27" />
                </svg>
              </span>
              <span className="text-white">Health<span className="text-amber-400">Tour</span></span>
            </Link>

            <div className="flex-1" />

            <div className="relative">
              <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.22em] text-amber-300">
                Sağlığa Hoş Geldiniz
              </p>
              <h2 className="font-serif text-5xl xl:text-6xl tracking-tight text-white leading-[1.02]">
                Akdeniz lüksü,<br />
                <span className="italic bg-gradient-to-r from-cyan-300 via-amber-200 to-amber-400 bg-clip-text text-transparent">
                  akredite tıp.
                </span>
              </h2>
              <p className="mt-5 text-base text-white/65 max-w-md">
                Hesabınızla paketlerinizi yönetin, rezervasyonlarınızı takip edin ve AI konsiyerjle
                60 saniyede özel paket alın.
              </p>

              <ul className="mt-10 space-y-3.5">
                {[
                  'JCI akredite 200+ klinik ağı',
                  'Uçuş + 5 ★ otel + transfer tek pakette',
                  '7/24 Türkçe & İngilizce konsiyerj',
                ].map((t) => (
                  <li key={t} className="flex items-start gap-3">
                    <span className="mt-0.5 grid h-6 w-6 place-items-center rounded-full bg-amber-500/20 ring-1 ring-amber-400/40 shrink-0">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-amber-300">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    </span>
                    <span className="text-sm text-white/80">{t}</span>
                  </li>
                ))}
              </ul>

              {/* Testimonial */}
              <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md p-5">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} className="text-amber-400" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="m12 2 3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" />
                    </svg>
                  ))}
                </div>
                <p className="mt-2 font-serif text-base italic text-white/85 leading-snug">
                  &ldquo;FUE saç ekimi için İstanbul&apos;a geldim. Klinik muhteşemdi, HealthTour
                  süreci baştan sona yönetti.&rdquo;
                </p>
                <div className="mt-3 flex items-center gap-2.5">
                  <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-aegean to-navy text-xs font-bold text-white">
                    J
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">James W.</div>
                    <div className="text-[11px] text-white/50">
                      <span className="font-mono">GB</span> İngiltere
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative mt-10 flex items-center gap-6 text-[11px] text-white/50">
              <span className="inline-flex items-center gap-1.5">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                256-bit SSL
              </span>
              <span className="inline-flex items-center gap-1.5">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                </svg>
                KVKK uyumlu
              </span>
              <span className="inline-flex items-center gap-1.5">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
                7/24 destek
              </span>
            </div>
          </aside>

          {/* ─── SAĞ: FORM ─────────────────────────────────────── */}
          <section className="relative flex flex-col px-6 py-8 sm:px-10 lg:px-12 xl:px-16">
            {/* Mobile mini-nav */}
            <div className="flex items-center justify-between lg:hidden mb-6">
              <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-aegean to-amber-700">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" />
                  </svg>
                </span>
                <span className="text-navy">Health<span className="text-aegean">Tour</span></span>
              </Link>
              <Link href="/" className="text-xs font-semibold text-slate-500 hover:text-navy transition inline-flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m15 18-6-6 6-6" />
                </svg>
                Ana Sayfa
              </Link>
            </div>

            {/* desktop back link */}
            <div className="hidden lg:flex items-center justify-between mb-2">
              <Link href="/" className="text-xs font-semibold text-slate-500 hover:text-navy transition inline-flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m15 18-6-6 6-6" />
                </svg>
                Ana Sayfaya Dön
              </Link>
            </div>

            <div className="flex-1 flex items-center">
              <div className="w-full max-w-md mx-auto">
                {/* Title */}
                <div className="mb-8">
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-aegean mb-3">
                    {sekme === 'giris' ? 'Hesabınız' : 'Yeni Hesap'}
                  </p>
                  <h1 className="font-serif text-4xl sm:text-5xl tracking-tight text-navy leading-[1.05]">
                    {sekme === 'giris' ? (
                      <>Tekrar <span className="italic">hoş geldiniz</span></>
                    ) : (
                      <>Aramıza <span className="italic">katılın</span></>
                    )}
                  </h1>
                  <p className="mt-3 text-sm text-slate-500">
                    {sekme === 'giris'
                      ? 'Devam etmek için giriş yapın veya yeni bir hesap oluşturun.'
                      : 'Birkaç saniyede hesabınızı oluşturun, paketlerinizi keşfedin.'}
                  </p>
                </div>

                {/* Tabs */}
                <div className="relative mb-7 grid grid-cols-2 rounded-full bg-slate-100 p-1 ring-1 ring-slate-200">
                  <button
                    type="button"
                    onClick={() => sekmeGec('giris')}
                    className={
                      sekme === 'giris'
                        ? 'relative z-10 rounded-full bg-navy py-2.5 text-sm font-bold text-white transition'
                        : 'relative z-10 rounded-full py-2.5 text-sm font-semibold text-slate-500 hover:text-navy transition'
                    }
                  >
                    Giriş Yap
                  </button>
                  <button
                    type="button"
                    onClick={() => sekmeGec('kayit')}
                    className={
                      sekme === 'kayit'
                        ? 'relative z-10 rounded-full bg-navy py-2.5 text-sm font-bold text-white transition'
                        : 'relative z-10 rounded-full py-2.5 text-sm font-semibold text-slate-500 hover:text-navy transition'
                    }
                  >
                    Kayıt Ol
                  </button>
                </div>

                {/* Mesajlar */}
                {basarili && (
                  <div className="mb-5 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3">
                    <p className="text-sm text-emerald-700">{basarili}</p>
                  </div>
                )}
                {hata && (
                  <div className="mb-5 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3">
                    <p className="text-sm text-rose-600">{hata}</p>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={gonderFormu} className="space-y-5">
                  {/* Kayıt: Ad & Soyad */}
                  {sekme === 'kayit' && (
                    <div className="grid grid-cols-2 gap-3">
                      <label className="block">
                        <span className="block text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500 mb-1.5">Ad</span>
                        <input
                          type="text"
                          autoComplete="given-name"
                          placeholder="Ahmet"
                          value={ad}
                          maxLength={60}
                          onChange={(e) => setAd(e.target.value.replace(/[<>"';&\\`\n\r]/g, ''))}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-medium text-navy placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-aegean/40 focus:border-aegean transition"
                        />
                      </label>
                      <label className="block">
                        <span className="block text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500 mb-1.5">Soyad</span>
                        <input
                          type="text"
                          autoComplete="family-name"
                          placeholder="Yılmaz"
                          value={soyad}
                          maxLength={60}
                          onChange={(e) => setSoyad(e.target.value.replace(/[<>"';&\\`\n\r]/g, ''))}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-medium text-navy placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-aegean/40 focus:border-aegean transition"
                        />
                      </label>
                    </div>
                  )}

                  {/* E-posta */}
                  <label className="block">
                    <span className="block text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500 mb-1.5">
                      E-posta Adresi
                    </span>
                    <div className="relative">
                      <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="4" width="20" height="16" rx="2" />
                        <path d="m22 7-10 5L2 7" />
                      </svg>
                      <input
                        type="email"
                        required
                        autoComplete="email"
                        placeholder="ornek@email.com"
                        value={email}
                        maxLength={100}
                        onChange={(e) => setEmail(e.target.value.replace(/[<>"';&\\`\n\r]/g, ''))}
                        className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 py-3 text-sm font-medium text-navy placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-aegean/40 focus:border-aegean transition"
                      />
                    </div>
                  </label>

                  {/* Şifre */}
                  <label className="block">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Şifre</span>
                      {sekme === 'giris' && (
                        <button
                          type="button"
                          onClick={sifremiUnuttum}
                          disabled={gonderiyor}
                          className="text-xs font-semibold text-aegean hover:text-navy transition disabled:opacity-50"
                        >
                          Şifremi unuttum
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                      <input
                        type={sifreGoster ? 'text' : 'password'}
                        required
                        autoComplete={sekme === 'giris' ? 'current-password' : 'new-password'}
                        placeholder={sekme === 'giris' ? '••••••••' : 'En az 8 karakter'}
                        value={sifre}
                        minLength={6}
                        maxLength={72}
                        onChange={(e) => setSifre(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-10 py-3 text-sm font-medium text-navy placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-aegean/40 focus:border-aegean transition"
                      />
                      <button
                        type="button"
                        onClick={() => setSifreGoster((v) => !v)}
                        aria-label={sifreGoster ? 'Şifreyi gizle' : 'Şifreyi göster'}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-navy transition"
                      >
                        {sifreGoster ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                            <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                            <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                            <path d="M2 2l20 20" />
                          </svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        )}
                      </button>
                    </div>

                    {/* Şifre gücü göstergesi (kayıt) */}
                    {sekme === 'kayit' && (
                      <>
                        <div className="mt-2 grid grid-cols-4 gap-1.5">
                          {[0, 1, 2, 3].map((i) => {
                            const aktif = i < guc;
                            const renk =
                              !aktif ? 'bg-slate-200' :
                              guc <= 1 ? 'bg-rose-500' :
                              guc === 2 ? 'bg-amber-500' :
                              guc === 3 ? 'bg-cyan-500' : 'bg-emerald-500';
                            return <span key={i} className={`h-1 rounded-full transition-colors ${renk}`} />;
                          })}
                        </div>
                        <p className={`mt-1.5 text-[11px] font-medium ${gucEtiketRenk}`}>{gucEtiket}</p>
                      </>
                    )}
                  </label>

                  {/* Kayıt: koşullar */}
                  {sekme === 'kayit' && (
                    <label className="flex items-start gap-2.5 text-xs text-slate-600 select-none cursor-pointer leading-relaxed">
                      <span className="relative inline-flex h-4 w-4 items-center justify-center mt-0.5">
                        <input
                          type="checkbox"
                          checked={kosulOnay}
                          onChange={(e) => setKosulOnay(e.target.checked)}
                          className="peer absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <span className="h-4 w-4 rounded border-2 border-slate-300 peer-checked:border-aegean peer-checked:bg-aegean transition flex items-center justify-center">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="opacity-0 peer-checked:opacity-100">
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                        </span>
                      </span>
                      <span>
                        Kullanım koşullarını ve gizlilik politikasını okudum, kabul ediyorum.
                      </span>
                    </label>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={gonderiyor}
                    className={
                      sekme === 'giris'
                        ? 'w-full rounded-xl bg-navy py-3.5 text-sm font-bold text-white shadow-lg shadow-navy/25 hover:bg-navy/90 transition inline-flex items-center justify-center gap-2 group disabled:opacity-60 disabled:cursor-not-allowed'
                        : 'w-full rounded-xl bg-amber-500 py-3.5 text-sm font-bold text-navy auth-glow-gold hover:bg-amber-400 transition inline-flex items-center justify-center gap-2 group disabled:opacity-60 disabled:cursor-not-allowed'
                    }
                  >
                    {gonderiyor ? (
                      <>
                        <div className={`w-4 h-4 border-2 ${sekme === 'giris' ? 'border-white' : 'border-navy'} border-t-transparent rounded-full animate-spin`} />
                        <span>{sekme === 'giris' ? 'Giriş yapılıyor...' : 'Hesap oluşturuluyor...'}</span>
                      </>
                    ) : (
                      <>
                        {sekme === 'giris' ? 'Giriş Yap' : 'Hesap Oluştur'}
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition group-hover:translate-x-0.5">
                          <path d="M5 12h14" />
                          <path d="m12 5 7 7-7 7" />
                        </svg>
                      </>
                    )}
                  </button>

                  {sekme === 'kayit' && (
                    <p className="text-[11px] text-center text-slate-400">
                      Bu bir hackathon demosudur. Gerçek e-posta doğrulaması devre dışıdır.
                    </p>
                  )}
                </form>

                {/* Alt geçiş */}
                <p className="mt-6 text-center text-sm text-slate-500">
                  {sekme === 'giris' ? (
                    <>
                      Hesabınız yok mu?{' '}
                      <button
                        type="button"
                        onClick={() => sekmeGec('kayit')}
                        className="font-bold text-navy hover:text-aegean transition"
                      >
                        Kayıt olun
                      </button>
                    </>
                  ) : (
                    <>
                      Hesabınız var mı?{' '}
                      <button
                        type="button"
                        onClick={() => sekmeGec('giris')}
                        className="font-bold text-navy hover:text-aegean transition"
                      >
                        Giriş yapın
                      </button>
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="text-center text-[11px] text-slate-400 mt-8">
              © 2026 HealthTour
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
