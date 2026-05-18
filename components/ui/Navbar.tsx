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
  const { setChatAcik } = useChatContext();
  const { kullanici, rol, yuklendi, isKlinikYoneticisi } = useKullaniciContext();
  const [menuAcik, setMenuAcik] = useState(false);

  const PARALAR: { kod: Para; etiket: string }[] = [
    { kod: 'EUR', etiket: '€ EUR' },
    { kod: 'USD', etiket: '$ USD' },
    { kod: 'GBP', etiket: '£ GBP' },
    { kod: 'TRY', etiket: '₺ TRY' },
  ];

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

  const isAnaKayfa = pathname === '/';

  // Navbar'ın tema renkleri
  const navBg = isAnaKayfa ? 'bg-[#0D1E25]/90 backdrop-blur-md border-b border-white/10' : 'bg-white shadow-sm border-b border-gray-100';
  const linkBase = isAnaKayfa ? 'text-white/80 hover:bg-white/10 hover:text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-[#0D1E25]';
  const linkAktif = isAnaKayfa ? 'bg-white/15 text-white' : 'bg-[#0D1E25] text-white';
  const iconColor = isAnaKayfa ? 'text-white/80' : 'text-gray-600';

  return (
    <nav className={`sticky top-0 z-30 transition-colors ${navBg}`}>

      {/* ÜST BAR — döviz + dil (sadece masaüstü) */}
      <div className={`hidden md:flex items-center justify-end gap-2 px-6 pt-1.5 pb-0 max-w-6xl mx-auto`}>
        {/* Döviz seçici */}
        <select
          value={para}
          onChange={e => setPara(e.target.value as Para)}
          className={`text-[11px] font-semibold px-2 py-1 rounded-lg border outline-none cursor-pointer transition-colors ${
            isAnaKayfa
              ? 'bg-white/10 border-white/15 text-white backdrop-blur-sm'
              : 'bg-gray-100 border-gray-200 text-gray-700'
          }`}
        >
          {PARALAR.map(p => (
            <option key={p.kod} value={p.kod} style={{ background: '#0D1E25', color: 'white' }}>{p.etiket}</option>
          ))}
        </select>

        {/* TR / EN */}
        <div className={`flex gap-0.5 p-0.5 rounded-lg ${isAnaKayfa ? 'bg-white/10' : 'bg-gray-100'}`}>
          {(['tr', 'en'] as const).map(d => (
            <button
              key={d}
              onClick={() => setDil(d)}
              className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all ${
                dil === d
                  ? isAnaKayfa ? 'bg-white text-[#0D1E25]' : 'bg-[#0D1E25] text-white'
                  : isAnaKayfa ? 'text-white/60 hover:text-white' : 'text-gray-500 hover:text-gray-700'
              }`}>
              {d.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* ANA NAV SATIRI */}
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="shrink-0">
          <span className={`text-xl font-extrabold tracking-tight ${isAnaKayfa ? 'text-white' : 'text-[#0D1E25]'}`}>
            Health<span className={isAnaKayfa ? 'text-[#00D2D3]' : 'text-[#00D2D3]'}>Tour</span>
          </span>
        </Link>

        {/* Orta linkler (masaüstü) */}
        <div className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
          {LINKLER.map(link => (
            <Link key={link.href} href={link.href}
              className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition-colors ${
                aktifMi(link.href) ? linkAktif : linkBase
              }`}>
              {link.etiket}
            </Link>
          ))}
          <button
            onClick={() => setChatAcik(true)}
            className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition-colors ml-1 ${
              isAnaKayfa
                ? 'bg-[#FF4757] text-white hover:bg-[#e63950]'
                : 'bg-[#FF4757] text-white hover:bg-[#e63950]'
            }`}
            style={{ boxShadow: '0 0 12px rgba(255,71,87,0.3)' }}>
            ✨ {tr ? 'AI Öneri' : 'AI'}
          </button>
        </div>

        {/* Sağ alan */}
        <div className="hidden md:flex items-center gap-2 shrink-0">

          {/* Sepet */}
          {!isKlinikYoneticisi && (
            <Link href="/cart" className={`relative p-2 rounded-xl transition-colors hover:bg-white/10 ${iconColor}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <CartBadge />
            </Link>
          )}

          {/* Auth */}
          {yuklendi && kullanici ? (
            <>
              {rol === 'super_admin' && (
                <Link href="/admin" className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${isAnaKayfa ? 'border border-white/20 text-white hover:bg-white/10' : 'border border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
                  Admin
                </Link>
              )}
              {rol === 'clinic_manager' && (
                <Link href="/clinic" className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${isAnaKayfa ? 'border border-white/20 text-white hover:bg-white/10' : 'border border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
                  {tr ? 'Klinik' : 'Clinic'}
                </Link>
              )}
              <Link href="/profile"
                className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition-colors ${pathname === '/profile' ? linkAktif : linkBase}`}>
                {t('nav.profil')}
              </Link>
              <button onClick={cikisYap}
                className={`px-3 py-1.5 text-sm font-semibold rounded-xl transition-colors ${isAnaKayfa ? 'border border-white/20 text-white/70 hover:text-red-400 hover:border-red-400/40' : 'border border-gray-300 text-gray-600 hover:text-red-600 hover:border-red-200'}`}>
                {t('nav.cikis')}
              </button>
            </>
          ) : (
            <Link href="/auth"
              className={`px-3 py-1.5 text-sm font-semibold rounded-xl transition-colors ${isAnaKayfa ? 'bg-white/10 border border-white/20 text-white hover:bg-white/15' : 'bg-[#0D1E25] text-white hover:bg-[#162d38]'}`}>
              {t('nav.giris')}
            </Link>
          )}
        </div>

        {/* Mobil sağ */}
        <div className="md:hidden flex items-center gap-2">
          {!isKlinikYoneticisi && (
            <Link href="/cart" className={`relative p-2 rounded-xl ${iconColor}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <CartBadge />
            </Link>
          )}
          <button
            onClick={() => setMenuAcik(p => !p)}
            className={`flex flex-col justify-center items-center w-9 h-9 gap-1.5 rounded-xl ${isAnaKayfa ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}>
            <span className={`block h-0.5 w-5 rounded-full transition-transform duration-200 ${isAnaKayfa ? 'bg-white' : 'bg-gray-700'} ${menuAcik ? 'translate-y-2 rotate-45' : ''}`} />
            <span className={`block h-0.5 w-5 rounded-full transition-opacity duration-200 ${isAnaKayfa ? 'bg-white' : 'bg-gray-700'} ${menuAcik ? 'opacity-0' : ''}`} />
            <span className={`block h-0.5 w-5 rounded-full transition-transform duration-200 ${isAnaKayfa ? 'bg-white' : 'bg-gray-700'} ${menuAcik ? '-translate-y-2 -rotate-45' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobil menü */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ${menuAcik ? 'max-h-[500px]' : 'max-h-0'} ${isAnaKayfa ? 'border-t border-white/10' : 'border-t border-gray-100'}`}>
        <div className="px-6 py-3 flex flex-col gap-1">

          {/* Mobil döviz + dil */}
          <div className="flex items-center gap-2 py-2 mb-1">
            <select
              value={para}
              onChange={e => setPara(e.target.value as Para)}
              className={`text-xs font-semibold px-2 py-1.5 rounded-lg border outline-none ${isAnaKayfa ? 'bg-white/10 border-white/15 text-white' : 'bg-gray-100 border-gray-200 text-gray-700'}`}>
              {PARALAR.map(p => (
                <option key={p.kod} value={p.kod} style={{ background: '#0D1E25', color: 'white' }}>{p.etiket}</option>
              ))}
            </select>
            <div className={`flex gap-0.5 p-0.5 rounded-lg ${isAnaKayfa ? 'bg-white/10' : 'bg-gray-100'}`}>
              {(['tr', 'en'] as const).map(d => (
                <button key={d} onClick={() => setDil(d)}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${dil === d ? (isAnaKayfa ? 'bg-white text-[#0D1E25]' : 'bg-[#0D1E25] text-white') : (isAnaKayfa ? 'text-white/60' : 'text-gray-500')}`}>
                  {d.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {LINKLER.map(link => (
            <Link key={link.href} href={link.href}
              onClick={() => setMenuAcik(false)}
              className={`px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${aktifMi(link.href) ? linkAktif : linkBase}`}>
              {link.etiket}
            </Link>
          ))}

          <button
            onClick={() => { setChatAcik(true); setMenuAcik(false); }}
            className="text-left px-4 py-3 rounded-xl text-sm font-semibold bg-[#FF4757] text-white">
            ✨ {tr ? 'AI Öneri' : 'AI Suggestion'}
          </button>

          <div className={`border-t mt-1 pt-2 ${isAnaKayfa ? 'border-white/10' : 'border-gray-100'}`}>
            {kullanici ? (
              <>
                {rol === 'super_admin' && (
                  <Link href="/admin" onClick={() => setMenuAcik(false)}
                    className="block px-4 py-3 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">
                    {tr ? 'Admin Paneli' : 'Admin Panel'}
                  </Link>
                )}
                {rol === 'clinic_manager' && (
                  <Link href="/clinic" onClick={() => setMenuAcik(false)}
                    className="block px-4 py-3 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">
                    {tr ? 'Klinik Paneli' : 'Clinic Panel'}
                  </Link>
                )}
                <Link href="/profile" onClick={() => setMenuAcik(false)}
                  className="block px-4 py-3 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">
                  {t('nav.profil')}
                </Link>
                <button onClick={cikisYap}
                  className="w-full text-left px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50">
                  {t('nav.cikis')}
                </button>
              </>
            ) : (
              <Link href="/auth" onClick={() => setMenuAcik(false)}
                className="block px-4 py-3 rounded-xl text-sm font-semibold text-[#0D1E25] hover:bg-gray-50">
                {t('nav.giris')}
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}