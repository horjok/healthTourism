'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const MENU = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/kullanicilar', label: 'Kullanıcılar', icon: '👥' },
  { href: '/admin/rezervasyonlar', label: 'Rezervasyonlar', icon: '📅' },
  { href: '/admin/tickets', label: 'Destek Biletleri', icon: '🎫' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 bg-[#0f3460] text-white flex flex-col shrink-0">
        <div className="px-5 py-6 border-b border-white/10">
          <p className="font-bold text-lg">Admin Panel</p>
          <p className="text-blue-300 text-xs mt-0.5">HealthTour</p>
        </div>
        <nav className="flex flex-col p-3 gap-1 flex-1">
          {MENU.map((m) => {
            const aktif = pathname === m.href || (m.href !== '/admin' && pathname.startsWith(m.href));
            return (
              <Link
                key={m.href}
                href={m.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  aktif ? 'bg-white/20 text-white' : 'text-blue-200 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span>{m.icon}</span>
                {m.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-blue-300 hover:bg-white/10 hover:text-white transition-colors"
          >
            ← Siteye Dön
          </Link>
        </div>
      </aside>
      <main className="flex-1 p-8 bg-gray-50 overflow-y-auto">{children}</main>
    </div>
  );
}
