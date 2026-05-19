'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase-client';
import { useDilContext } from '@/lib/DilContext';
import { useDil } from '@/lib/i18n';
import { useDoviz, type Para } from '@/lib/DovizContext';
import { useCartStore } from '@/lib/cartStore';
import { useChatContext } from '@/components/ui/ChatProvider';
import { useKullaniciContext } from '@/lib/KullaniciContext';

function CartBadge() {
  const [mounted, setMounted] = useState(false);
  const totalItems = useCartStore(s => s.totalItems());

  useEffect(() => setMounted(true), []);

  if (!mounted || totalItems === 0) return null;
  return (
    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
      {totalItems > 9 ? '9+' : totalItems}
    </span>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { dil, setDil } = useDilContext();
  const { t } = useDil();
  const { para, setPara } = useDoviz();
  const tr = dil === 'tr';

  const PARALAR: { kod: Para; etiket: string }[] = [
    { kod: 'EUR', etiket: '€ EUR' },
    { kod: 'USD', etiket: '$ USD' },
    { kod: 'GBP', etiket: '£ GBP' },
    { kod: 'TRY', etiket: '₺ TRY' },
  ];

  const { setChatAcik } = useChatContext();
  const { kullanici, rol, yuklendi, isKlinikYoneticisi } = useKullaniciContext();
  const [menuAcik, setMenuAcik] = useState(false);

  const LINKLER = [
    { etiket: tr ? 'Sağlık' : 'Health', href: '/health' },
    { etiket: tr ? 'Paketler' : 'Packages', href: '/packages' },
    { etiket: tr ? 'Oteller' : 'Hotels', href: '/hotels' },
    { etiket: tr ? 'Uçuşlar' : 'Flights', href: '/flights' },
    { etiket: tr ? 'Transfer' : 'Transfer', href: '/transfer' },
    { etiket: tr ? 'Turlar' : 'Tours', href: '/tours' },
  ];

  async function cikisYap() {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    setMenuAcik(false);
    router.push('/');
    router.refresh();
  }

  function aktifMi(href: string) {
    return pathname === href.split('?')[0];
  }

  return (
    <nav className="sticky top-0 z-30 bg-[#0f172a]/95 backdrop-blur-md border-b border-white/10">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-6">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="text-xl font-extrabold tracking-tight text-white">
            Health<span className="text-amber-400">Tour</span>
          </span>
        </Link>

        {/* Orta linkler (masaüstü) */}
        <div className="hidden md:flex items-center gap-1">
          {LINKLER.map((link) => (
            <Link key={link.href} href={link.href}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                aktifMi(link.href)
                  ? 'bg-white/15 text-white'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}>
              {link.etiket}
            </Link>
          ))}
          <button
            onClick={() => setChatAcik(true)}
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-colors bg-amber-500 text-[#0f172a] hover:bg-amber-400 glow-gold whitespace-nowrap"
          >
            {tr ? '✨ AI Öneri' : '✨ AI Suggestion'}
          </button>
        </div>

        {/* Sağ alan (masaüstü) */}
        <div className="hidden md:flex items-center gap-3">

          {/* Döviz seçici */}
          <select
            value={para}
            onChange={e => setPara(e.target.value as Para)}
            className="text-xs font-bold rounded-xl px-2 py-1.5 outline-none cursor-pointer bg-white/10 text-white border border-white/20 backdrop-blur-md"
          >
            {PARALAR.map(p => (
              <option key={p.kod} value={p.kod} style={{ background: '#0f172a', color: 'white' }}>{p.etiket}</option>
            ))}
          </select>

          {/* TR/EN butonları */}
          <div className="flex gap-0.5 rounded-xl p-0.5 bg-white/10 border border-white/15 backdrop-blur-md">
            {(['tr', 'en'] as const).map(kod => (
              <button
                key={kod}
                onClick={() => setDil(kod)}
                className={`px-3 py-1 rounded-[9px] text-xs font-bold transition-colors ${
                  dil === kod
                    ? 'bg-white text-[#0f172a]'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                {kod.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Sepet ikonu — klinik yöneticisine gösterilmez */}
          {!isKlinikYoneticisi && (
            <Link href="/cart" className="relative p-2 rounded-xl transition-colors text-white/80 hover:bg-white/10">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <CartBadge />
            </Link>
          )}

          {yuklendi && kullanici ? (
            <>
              {rol === 'super_admin' && (
                <Link href="/admin"
                  className="px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors border border-white/20 text-white hover:bg-white/10">
                  Admin
                </Link>
              )}
              {rol === 'clinic_manager' && (
                <Link href="/clinic"
                  className="px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors border border-white/20 text-white hover:bg-white/10">
                  {tr ? 'Klinik' : 'Clinic'}
                </Link>
              )}
              <Link href="/profile"
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  pathname === '/profile'
                    ? 'bg-white/15 text-white'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}>
                {t('nav.profil')}
              </Link>
              <button onClick={cikisYap}
                className="inline-flex items-center px-4 py-2 text-sm font-semibold rounded-xl transition-colors border border-white/20 text-white/70 hover:border-red-400/50 hover:text-red-400">
                {t('nav.cikis')}
              </button>
            </>
          ) : (
            <Link href="/auth"
              className="px-4 py-2 text-sm font-semibold rounded-xl transition-colors bg-amber-500 text-[#0f172a] hover:bg-amber-400 whitespace-nowrap">
              {t('nav.giris')}
            </Link>
          )}
        </div>

        {/* Hamburger (mobil) */}
        <div className="md:hidden flex items-center gap-2">
          {!isKlinikYoneticisi && (
            <Link href="/cart" className="relative p-2 rounded-xl transition-colors text-white/80 hover:bg-white/10">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <CartBadge />
            </Link>
          )}

          <button
            onClick={() => setMenuAcik((p) => !p)}
            className="flex flex-col justify-center items-center w-9 h-9 gap-1.5 rounded-xl transition-colors hover:bg-white/10">
            <span className={`block h-0.5 w-5 rounded-full transition-transform duration-200 bg-white ${menuAcik ? 'translate-y-2 rotate-45' : ''}`} />
            <span className={`block h-0.5 w-5 rounded-full transition-opacity duration-200 bg-white ${menuAcik ? 'opacity-0' : ''}`} />
            <span className={`block h-0.5 w-5 rounded-full transition-transform duration-200 bg-white ${menuAcik ? '-translate-y-2 -rotate-45' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobil menü */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ${menuAcik ? 'max-h-[32rem]' : 'max-h-0'} border-t border-white/10`}>
        <div className="px-6 py-3 flex flex-col gap-1">
          {LINKLER.map((link) => (
            <Link key={link.href} href={link.href}
              onClick={() => setMenuAcik(false)}
              className={`px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                aktifMi(link.href)
                  ? 'bg-white/15 text-white'
                  : 'text-white/80 hover:bg-white/10'
              }`}>
              {link.etiket}
            </Link>
          ))}
          <button
            onClick={() => { setChatAcik(true); setMenuAcik(false); }}
            className="text-left px-4 py-3 rounded-xl text-sm font-semibold bg-amber-500 text-[#0f172a]"
          >
            {tr ? '✨ AI Öneri' : '✨ AI Suggestion'}
          </button>

          {/* Döviz + Dil seçiciler (mobil) */}
          <div className="flex items-center gap-2 py-2 border-t border-white/10 mt-1">
            <select
              value={para}
              onChange={e => setPara(e.target.value as Para)}
              className="flex-1 text-xs font-bold rounded-xl px-2 py-2 outline-none cursor-pointer bg-white/10 text-white border border-white/20"
            >
              {PARALAR.map(p => (
                <option key={p.kod} value={p.kod} style={{ background: '#0f172a', color: 'white' }}>{p.etiket}</option>
              ))}
            </select>
            <div className="flex gap-0.5 rounded-xl p-0.5 bg-white/10 border border-white/15">
              {(['tr', 'en'] as const).map(kod => (
                <button
                  key={kod}
                  onClick={() => setDil(kod)}
                  className={`px-3 py-1.5 rounded-[9px] text-xs font-bold transition-colors ${
                    dil === kod ? 'bg-white text-[#0f172a]' : 'text-white/70'
                  }`}
                >
                  {kod.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-white/10 mt-1 pt-2">
            {kullanici ? (
              <>
                {rol === 'super_admin' && (
                  <Link href="/admin" onClick={() => setMenuAcik(false)}
                    className="block px-4 py-3 rounded-xl text-sm font-semibold border border-white/20 text-white hover:bg-white/10">
                    {tr ? 'Admin Paneli' : 'Admin Panel'}
                  </Link>
                )}
                {rol === 'clinic_manager' && (
                  <Link href="/clinic" onClick={() => setMenuAcik(false)}
                    className="block px-4 py-3 rounded-xl text-sm font-semibold border border-white/20 text-white hover:bg-white/10">
                    {tr ? 'Klinik Paneli' : 'Clinic Panel'}
                  </Link>
                )}
                <Link href="/profile" onClick={() => setMenuAcik(false)}
                  className="block px-4 py-3 rounded-xl text-sm font-semibold text-white/80 hover:bg-white/10">
                  {t('nav.profil')}
                </Link>
                <button onClick={cikisYap}
                  className="w-full text-left px-4 py-3 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-400/10 transition-colors">
                  {t('nav.cikis')}
                </button>
              </>
            ) : (
              <Link href="/auth" onClick={() => setMenuAcik(false)}
                className="block px-4 py-3 rounded-xl text-sm font-semibold bg-amber-500 text-[#0f172a] text-center">
                {t('nav.giris')}
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
