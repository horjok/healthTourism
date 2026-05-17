'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase-client';
import type { ClinicApplication } from '@/lib/types';

const MENU = [
  { href: '/clinic', label: 'Dashboard', icon: '📊' },
  { href: '/clinic/paketler', label: 'Paketlerim', icon: '📦' },
  { href: '/clinic/rezervasyonlar', label: 'Rezervasyonlar', icon: '📅' },
  { href: '/clinic/yorumlar', label: 'Yorumlar', icon: '⭐' },
];

export default function ClinicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [basvuru, setBasvuru] = useState<ClinicApplication | null>(null);
  const [rol, setRol] = useState<string>('user');

  useEffect(() => {
    const supabase = getSupabaseClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;

      const { data: roleRow } = await supabase
        .from('user_roles')
        .select('rol')
        .eq('kullanici_id', user.id)
        .single();

      setRol(roleRow?.rol ?? 'user');

      if (roleRow?.rol !== 'clinic_manager') {
        const res = await fetch(`/api/clinic/application?kullanici_id=${user.id}`);
        const json = await res.json();
        if (json.success && json.data) setBasvuru(json.data);
      }
    });
  }, []);

  const onaylandi = rol === 'clinic_manager';
  const beklemede = basvuru?.durum === 'pending';

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 bg-[#0f3460] text-white flex flex-col shrink-0">
        <div className="px-5 py-6 border-b border-white/10">
          <p className="font-bold text-lg">Klinik Paneli</p>
          <p className="text-blue-300 text-xs mt-0.5">HealthTour</p>
        </div>

        {beklemede && !onaylandi ? (
          <div className="flex-1 flex flex-col p-4">
            <div className="bg-amber-500/20 border border-amber-400/30 rounded-xl p-3">
              <p className="text-amber-300 text-xs font-semibold">Başvurunuz İnceleniyor</p>
              <p className="text-amber-200 text-xs mt-1">Admin onayından sonra panele erişebilirsiniz.</p>
            </div>
          </div>
        ) : (
          <nav className="flex flex-col p-3 gap-1 flex-1">
            {MENU.map((m) => {
              const aktif = pathname === m.href || (m.href !== '/clinic' && pathname.startsWith(m.href));
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
        )}

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
