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
    <>
      {/* Döviz + TR/EN seçiciler — sabit pozisyon */}
      <div style={{
        position: 'fixed', top: '12px', right: '220px', zIndex: 9999,
        display: 'flex', gap: '6px', alignItems: 'center',
      }}>
        {/* Döviz seçici */}
        <select
          value={para}
          onChange={e => setPara(e.target.value as Para)}
          style={{
            padding: '5px 8px', borderRadius: '9px', fontWeight: 'bold',
            fontSize: '12px', border: '1px solid #e5e7eb', cursor: 'pointer',
            background: '#f3f4f6', color: '#374151', outline: 'none',
          }}
        >
          {PARALAR.map(p => (
            <option key={p.kod} value={p.kod}>{p.etiket}</option>
          ))}
        </select>

        {/* TR/EN butonları */}
        <div style={{
          display: 'flex', gap: '2px', background: '#f3f4f6',
          borderRadius: '12px', padding: '3px'
        }}>
          <button
            onClick={() => setDil('tr')}
            style={{
              padding: '5px 12px', borderRadius: '9px', fontWeight: 'bold',
              fontSize: '12px', border: 'none', cursor: 'pointer',
              background: dil === 'tr' ? '#0f3460' : 'transparent',
              color: dil === 'tr' ? 'white' : '#666'
            }}>TR</button>
          <button
            onClick={() => setDil('en')}
            style={{
              padding: '5px 12px', borderRadius: '9px', fontWeight: 'bold',
              fontSize: '12px', border: 'none', cursor: 'pointer',
              background: dil === 'en' ? '#0f3460' : 'transparent',
              color: dil === 'en' ? 'white' : '#666'
            }}>EN</button>
        </div>
      </div>

      <nav className="sticky top-0 z-30 bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-6">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="text-xl font-extrabold text-[#0f3460] tracking-tight">
              Health<span className="text-blue-400">Tour</span>
            </span>
          </Link>

          {/* Orta linkler (masaüstü) */}
          <div className="hidden md:flex items-center gap-1">
            {LINKLER.map((link) => (
              <Link key={link.href} href={link.href}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  aktifMi(link.href)
                    ? 'bg-[#0f3460] text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-[#0f3460]'
                }`}>
                {link.etiket}
              </Link>
            ))}
            <button
              onClick={() => setChatAcik(true)}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-colors bg-gradient-to-r from-[#0f3460] to-blue-500 text-white hover:opacity-90"
            >
              {tr ? '✨ AI Öneri' : '✨ AI Suggestion'}
            </button>
          </div>

          {/* Sağ alan (masaüstü) */}
          <div className="hidden md:flex items-center gap-3">

            {/* Sepet ikonu — klinik yöneticisine gösterilmez */}
            {!isKlinikYoneticisi && (
              <Link href="/cart" className="relative p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <CartBadge />
              </Link>
            )}

            {yuklendi && kullanici ? (
              <>
                {rol === 'super_admin' && (
                  <Link href="/admin"
                    className="px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors border border-[#0f3460]/30 text-[#0f3460] hover:bg-[#0f3460] hover:text-white">
                    Admin
                  </Link>
                )}
                {rol === 'clinic_manager' && (
                  <Link href="/clinic"
                    className="px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors border border-[#0f3460]/30 text-[#0f3460] hover:bg-[#0f3460] hover:text-white">
                    {tr ? 'Klinik' : 'Clinic'}
                  </Link>
                )}
                <Link href="/profile"
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    pathname === '/profile'
                      ? 'bg-[#0f3460] text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-[#0f3460]'
                  }`}>
                  {t('nav.profil')}
                </Link>
                <button onClick={cikisYap}
                  className="px-4 py-2 border border-gray-300 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50 hover:text-red-600 hover:border-red-200 transition-colors">
                  {t('nav.cikis')}
                </button>
              </>
            ) : (
              <Link href="/auth"
                className="px-4 py-2 bg-[#0f3460] text-white text-sm font-semibold rounded-xl hover:bg-[#16213e] transition-colors">
                {t('nav.giris')}
              </Link>
            )}
          </div>

          {/* Hamburger (mobil) */}
          <div className="md:hidden flex items-center gap-2">
            {/* Mobil sepet — klinik yöneticisine gösterilmez */}
            {!isKlinikYoneticisi && (
              <Link href="/cart" className="relative p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <CartBadge />
              </Link>
            )}

            <button
              onClick={() => setMenuAcik((p) => !p)}
              className="flex flex-col justify-center items-center w-9 h-9 gap-1.5 rounded-xl hover:bg-gray-100 transition-colors">
              <span className={`block h-0.5 w-5 bg-gray-700 rounded-full transition-transform duration-200 ${menuAcik ? 'translate-y-2 rotate-45' : ''}`} />
              <span className={`block h-0.5 w-5 bg-gray-700 rounded-full transition-opacity duration-200 ${menuAcik ? 'opacity-0' : ''}`} />
              <span className={`block h-0.5 w-5 bg-gray-700 rounded-full transition-transform duration-200 ${menuAcik ? '-translate-y-2 -rotate-45' : ''}`} />
            </button>
          </div>
        </div>

        {/* Mobil menü */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ${menuAcik ? 'max-h-96 border-t border-gray-100' : 'max-h-0'}`}>
          <div className="px-6 py-3 flex flex-col gap-1">
            {LINKLER.map((link) => (
              <Link key={link.href} href={link.href}
                onClick={() => setMenuAcik(false)}
                className={`px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                  aktifMi(link.href)
                    ? 'bg-[#0f3460] text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}>
                {link.etiket}
              </Link>
            ))}
            <button
              onClick={() => { setChatAcik(true); setMenuAcik(false); }}
              className="text-left px-4 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-[#0f3460] to-blue-500 text-white"
            >
              {tr ? '✨ AI Öneri' : '✨ AI Suggestion'}
            </button>

            <div className="border-t border-gray-100 mt-1 pt-2">
              {kullanici ? (
                <>
                  {rol === 'super_admin' && (
                    <Link href="/admin" onClick={() => setMenuAcik(false)}
                      className="block px-4 py-3 rounded-xl text-sm font-semibold border border-[#0f3460]/30 text-[#0f3460] hover:bg-[#0f3460]/5">
                      {tr ? 'Admin Paneli' : 'Admin Panel'}
                    </Link>
                  )}
                  {rol === 'clinic_manager' && (
                    <Link href="/clinic" onClick={() => setMenuAcik(false)}
                      className="block px-4 py-3 rounded-xl text-sm font-semibold border border-[#0f3460]/30 text-[#0f3460] hover:bg-[#0f3460]/5">
                      {tr ? 'Klinik Paneli' : 'Clinic Panel'}
                    </Link>
                  )}
                  <Link href="/profile" onClick={() => setMenuAcik(false)}
                    className="block px-4 py-3 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">
                    {t('nav.profil')}
                  </Link>
                  <button onClick={cikisYap}
                    className="w-full text-left px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors">
                    {t('nav.cikis')}
                  </button>
                </>
              ) : (
                <Link href="/auth" onClick={() => setMenuAcik(false)}
                  className="block px-4 py-3 rounded-xl text-sm font-semibold text-[#0f3460] hover:bg-blue-50">
                  {t('nav.giris')}
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}