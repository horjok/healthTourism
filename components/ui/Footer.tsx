'use client';

import Link from 'next/link';
import { useDilContext } from '@/lib/DilContext';
import { useChatContext } from '@/components/ui/ChatProvider';

export default function Footer() {
  const { dil } = useDilContext();
  const { setChatAcik } = useChatContext();
  const tr = dil === 'tr';

  return (
    <footer
      className="relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg,#0a1124 0%,#060c18 100%)' }}
    >
      {/* Selçuklu desen — arka plan */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.04]">
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="seljuk-footer" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
              <g fill="none" stroke="white" strokeWidth="1">
                <rect x="30" y="30" width="60" height="60"/>
                <rect x="30" y="30" width="60" height="60" transform="rotate(45 60 60)"/>
                <polygon points="60,36 78,46 86,60 78,74 60,84 42,74 34,60 42,46"/>
              </g>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#seljuk-footer)"/>
        </svg>
      </div>
      <div className="pointer-events-none absolute -top-32 -right-32 h-[400px] w-[400px] rounded-full bg-aegean/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-[300px] w-[300px] rounded-full bg-amber-500/8 blur-3xl" />

      {/* ── Newsletter şeridi ─────────────────────────────── */}
      <div className="relative border-b border-white/[0.08]">
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-400 mb-1">
                {tr ? 'Bülten' : 'Newsletter'}
              </p>
              <h3 className="font-serif text-2xl text-white">
                {tr ? 'Kampanyaları kaçırmayın' : "Don't miss our deals"}
              </h3>
              <p className="mt-0.5 text-sm text-white/50">
                {tr
                  ? 'Haftalık sağlık turizmi haberleri ve özel fırsatlar.'
                  : 'Weekly health tourism news and exclusive deals.'}
              </p>
            </div>
            <form onSubmit={e => e.preventDefault()} className="flex w-full sm:w-auto gap-2 min-w-[320px]">
              <input
                type="email"
                placeholder={tr ? 'E-posta adresiniz' : 'Your email address'}
                className="flex-1 rounded-xl bg-white/[0.07] ring-1 ring-white/15 px-4 py-2.5 text-sm text-white placeholder:text-white/35 outline-none focus:ring-amber-400/50 transition"
              />
              <button
                type="submit"
                className="shrink-0 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-navy hover:bg-amber-400 transition"
              >
                {tr ? 'Abone Ol' : 'Subscribe'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ── Ana sütunlar ──────────────────────────────────── */}
      <div className="relative mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-5">

          {/* Marka sütunu */}
          <div className="col-span-2 lg:col-span-2">
            <div className="flex items-center gap-0.5 text-2xl font-bold tracking-tight">
              <span className="text-white">Health</span><span className="text-amber-400">Tour</span>
            </div>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/50">
              {tr
                ? 'Uçak, 5★ otel ve JCI akredite kliniği tek pakette buluşturan, yapay zeka destekli sağlık turizmi platformu.'
                : 'AI-powered health tourism platform combining flights, 5★ hotels and JCI clinics in one package.'}
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {[
                { label: 'JCI Certified', icon: '🏅' },
                { label: 'SSL Secured',   icon: '🔒' },
                { label: 'GDPR / KVKK',  icon: '🛡️' },
              ].map(b => (
                <span key={b.label} className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] ring-1 ring-white/10 px-3 py-1 text-[11px] font-semibold text-white/60">
                  <span>{b.icon}</span>{b.label}
                </span>
              ))}
            </div>

            <div className="mt-6 flex items-center gap-3">
              {[
                { label: 'Instagram', path: 'M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.975.975 1.246 2.242 1.308 3.608.058 1.266.069 1.646.069 4.85s-.011 3.584-.069 4.85c-.062 1.366-.333 2.633-1.308 3.608-.975.975-2.242 1.246-3.608 1.308-1.266.058-1.646.069-4.85.069s-3.584-.011-4.85-.069c-1.366-.062-2.633-.333-3.608-1.308-.975-.975-1.246-2.242-1.308-3.608C2.175 15.747 2.163 15.367 2.163 12s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608C4.516 2.497 5.783 2.225 7.15 2.163 8.416 2.105 8.796 2.163 12 2.163zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z' },
                { label: 'Facebook',  path: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' },
                { label: 'X / Twitter', path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z' },
                { label: 'LinkedIn',  path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 23.2 24 22.222 24h.003z' },
                { label: 'YouTube',   path: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z' },
              ].map(s => (
                <a
                  key={s.label}
                  href="#"
                  aria-label={s.label}
                  className="grid h-9 w-9 place-items-center rounded-full bg-white/[0.07] ring-1 ring-white/10 text-white/50 hover:bg-white/15 hover:text-white transition"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d={s.path}/>
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Hizmetler */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-400 mb-5">
              {tr ? 'Hizmetler' : 'Services'}
            </h4>
            <ul className="space-y-3 text-sm text-white/55">
              {[
                { label: tr ? 'Saç Ekimi'        : 'Hair Transplant',    href: '/packages?uzmanlik=saç ekimi' },
                { label: tr ? 'Diş Sağlığı'      : 'Dental Health',      href: '/packages?uzmanlik=diş tedavisi' },
                { label: tr ? 'Estetik Cerrahi'  : 'Aesthetic Surgery',  href: '/packages?uzmanlik=estetik cerrahi' },
                { label: tr ? 'Göz Tedavisi'     : 'Eye Treatment',      href: '/packages?uzmanlik=göz tedavisi' },
                { label: tr ? 'Ortopedi'         : 'Orthopedics',        href: '/packages?uzmanlik=ortopedi' },
                { label: tr ? 'Onkoloji'         : 'Oncology',           href: '/packages?uzmanlik=onkoloji' },
              ].map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-white transition">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Şirket */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-400 mb-5">
              {tr ? 'Şirket' : 'Company'}
            </h4>
            <ul className="space-y-3 text-sm text-white/55">
              {(tr
                ? ['Hakkımızda', 'Kariyer', 'Blog', 'Basın', 'Ortaklar', 'Yatırımcılar']
                : ['About Us',   'Careers', 'Blog', 'Press', 'Partners',  'Investors']
              ).map(l => (
                <li key={l}><a href="#" className="hover:text-white transition">{l}</a></li>
              ))}
            </ul>
          </div>

          {/* Destek */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-400 mb-5">
              {tr ? 'Destek' : 'Support'}
            </h4>
            <ul className="space-y-3 text-sm text-white/55">
              {[
                { label: tr ? 'Sık Sorulan Sorular' : 'FAQ',            href: '#' },
                { label: tr ? 'Rezervasyon'         : 'Booking',        href: '/booking' },
                { label: tr ? 'AI Asistanı'         : 'AI Assistant',   href: '#', isBtn: true },
                { label: tr ? 'Gizlilik Politikası' : 'Privacy Policy', href: '#' },
                { label: tr ? 'KVKK Aydınlatma'     : 'GDPR Notice',    href: '#' },
                { label: tr ? 'Kullanım Koşulları'  : 'Terms of Use',   href: '#' },
              ].map(l => (
                <li key={l.label}>
                  {l.isBtn
                    ? <button onClick={() => setChatAcik(true)} className="hover:text-white transition text-left">{l.label}</button>
                    : <Link href={l.href} className="hover:text-white transition">{l.label}</Link>
                  }
                </li>
              ))}
            </ul>

            <div className="mt-7 space-y-2 text-sm text-white/40">
              <p className="flex items-center gap-2">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A2 2 0 0 1 2.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                +90 212 000 00 00
              </p>
              <p className="flex items-center gap-2">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2"/>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
                info@healthtour.com
              </p>
              <p className="flex items-center gap-2">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a9 9 0 0 0-9 9c0 7 9 11 9 11s9-4 9-11a9 9 0 0 0-9-9Z"/>
                  <circle cx="12" cy="11" r="3"/>
                </svg>
                İstanbul, Türkiye
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Alt çizgi ─────────────────────────────────────── */}
      <div className="relative border-t border-white/[0.08]">
        <div className="mx-auto max-w-7xl px-6 py-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/30">
            <p>© 2026 HealthTour. {tr ? 'Tüm hakları saklıdır.' : 'All rights reserved.'}</p>
            <div className="flex items-center gap-4">
              {['TR', 'EN'].map(lang => (
                <span key={lang} className="font-mono hover:text-white/60 cursor-default transition">{lang}</span>
              ))}
            </div>
            <p className="text-center">
              {tr
                ? 'Bu bir demo platformdur — gerçek medikal tavsiye vermez.'
                : 'This is a demo platform — not real medical advice.'}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
