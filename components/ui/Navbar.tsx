'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/lib/supabase-client';

// Orta menü linkleri
const LINKLER = [
  { etiket: 'Paketler',  href: '/packages' },
  { etiket: 'AI Öneri', href: '/packages?chat=true' },
];

export default function Navbar() {
  const pathname  = usePathname();
  const router    = useRouter();
  const supabase  = getSupabaseClient();

  const [menuAcik, setMenuAcik]   = useState(false);
  const [kullanici, setKullanici] = useState<User | null>(null);
  const [yuklendi, setYuklendi]   = useState(false);

  // Auth durumunu dinle
  useEffect(() => {
    // Mevcut oturumu al
    supabase.auth.getUser().then(({ data }) => {
      setKullanici(data.user);
      setYuklendi(true);
    });

    // Oturum değişikliklerini izle (giriş/çıkış)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setKullanici(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  async function cikisYap() {
    await supabase.auth.signOut();
    setMenuAcik(false);
    router.push('/');
    router.refresh();
  }

  // Verilen href aktif sayfayla eşleşiyor mu?
  function aktifMi(href: string) {
    const temizHref = href.split('?')[0];
    return pathname === temizHref;
  }

  return (
    <nav className="sticky top-0 z-30 bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-6">

        {/* ── Logo ──────────────────────────────────────────────────────── */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="text-xl font-extrabold text-[#0f3460] tracking-tight">
            Health<span className="text-blue-400">Tour</span>
          </span>
        </Link>

        {/* ── Orta linkler (masaüstü) ───────────────────────────────────── */}
        <div className="hidden md:flex items-center gap-1">
          {LINKLER.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                aktifMi(link.href)
                  ? 'bg-[#0f3460] text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-[#0f3460]'
              }`}
            >
              {link.etiket}
            </Link>
          ))}
        </div>

        {/* ── Sağ alan (masaüstü) ───────────────────────────────────────── */}
        <div className="hidden md:flex items-center gap-2">
          {!yuklendi ? (
            // Auth durumu henüz belli değil — yer tutucu
            <div className="w-20 h-8 bg-gray-100 rounded-xl animate-pulse" />
          ) : kullanici ? (
            // Giriş yapılmış
            <>
              <Link
                href="/profile"
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  pathname === '/profile'
                    ? 'bg-[#0f3460] text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-[#0f3460]'
                }`}
              >
                Profilim
              </Link>
              <button
                onClick={cikisYap}
                className="px-4 py-2 border border-gray-300 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50 hover:text-red-600 hover:border-red-200 transition-colors"
              >
                Çıkış
              </button>
            </>
          ) : (
            // Giriş yapılmamış
            <Link
              href="/auth"
              className="px-4 py-2 bg-[#0f3460] text-white text-sm font-semibold rounded-xl hover:bg-[#16213e] transition-colors"
            >
              Giriş Yap
            </Link>
          )}
        </div>

        {/* ── Hamburger (mobil) ─────────────────────────────────────────── */}
        <button
          onClick={() => setMenuAcik((p) => !p)}
          className="md:hidden flex flex-col justify-center items-center w-9 h-9 gap-1.5 rounded-xl hover:bg-gray-100 transition-colors"
          aria-label={menuAcik ? 'Menüyü kapat' : 'Menüyü aç'}
        >
          <span className={`block h-0.5 w-5 bg-gray-700 rounded-full transition-transform duration-200 ${menuAcik ? 'translate-y-2 rotate-45' : ''}`} />
          <span className={`block h-0.5 w-5 bg-gray-700 rounded-full transition-opacity duration-200 ${menuAcik ? 'opacity-0' : ''}`} />
          <span className={`block h-0.5 w-5 bg-gray-700 rounded-full transition-transform duration-200 ${menuAcik ? '-translate-y-2 -rotate-45' : ''}`} />
        </button>
      </div>

      {/* ── Mobil menü ────────────────────────────────────────────────────── */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ${menuAcik ? 'max-h-80 border-t border-gray-100' : 'max-h-0'}`}>
        <div className="px-6 py-3 flex flex-col gap-1">
          {LINKLER.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuAcik(false)}
              className={`px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                aktifMi(link.href)
                  ? 'bg-[#0f3460] text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {link.etiket}
            </Link>
          ))}

          <div className="border-t border-gray-100 mt-1 pt-2">
            {kullanici ? (
              <>
                <Link
                  href="/profile"
                  onClick={() => setMenuAcik(false)}
                  className="block px-4 py-3 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Profilim
                </Link>
                <button
                  onClick={cikisYap}
                  className="w-full text-left px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"
                >
                  Çıkış Yap
                </button>
              </>
            ) : (
              <Link
                href="/auth"
                onClick={() => setMenuAcik(false)}
                className="block px-4 py-3 rounded-xl text-sm font-semibold text-[#0f3460] hover:bg-blue-50"
              >
                Giriş Yap
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
