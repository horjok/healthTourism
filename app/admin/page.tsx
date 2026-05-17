'use client';

import { useCallback, useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase-client';
import type { AdminStats } from '@/lib/types';

const STAT_KARTI = [
  { key: 'toplam_kullanici'  as keyof AdminStats, label: 'Toplam Kullanıcı',   icon: '👥', renk: 'bg-blue-50  text-blue-700'  },
  { key: 'toplam_rezervasyon' as keyof AdminStats, label: 'Toplam Rezervasyon', icon: '📅', renk: 'bg-green-50 text-green-700' },
  { key: 'bekleyen_basvuru'  as keyof AdminStats, label: 'Bekleyen Başvuru',   icon: '🏥', renk: 'bg-amber-50 text-amber-700' },
  { key: 'acik_bilet'        as keyof AdminStats, label: 'Açık Bilet',         icon: '🎫', renk: 'bg-red-50   text-red-700'   },
];

export default function AdminDashboard() {
  const [stats, setStats]         = useState<AdminStats | null>(null);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [canli, setCanli]         = useState(false);

  const yukleStats = useCallback(async () => {
    const r = await fetch('/api/admin/stats');
    const j = await r.json();
    if (j.success) setStats(j.data);
  }, []);

  useEffect(() => {
    yukleStats().finally(() => setYukleniyor(false));

    const supabase = getSupabaseClient();
    const ch = supabase
      .channel('admin-dashboard-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clinic_applications' }, yukleStats)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets' },             yukleStats)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rezervasyonlar' },      yukleStats)
      .subscribe((durum) => setCanli(durum === 'SUBSCRIBED'));

    return () => { supabase.removeChannel(ch); };
  }, [yukleStats]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <span className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
          canli ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${canli ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
          {canli ? 'Canlı İzleme' : 'Bağlanıyor...'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-8">
        {STAT_KARTI.map((k) => (
          <div key={k.key} className={`rounded-2xl p-6 ${k.renk}`}>
            <p className="text-3xl mb-2">{k.icon}</p>
            <p className="text-3xl font-bold tabular-nums">
              {yukleniyor ? '—' : (stats?.[k.key] ?? 0)}
            </p>
            <p className="text-sm font-medium mt-1 opacity-80">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-sm text-blue-700">
        <strong>Gerçek zamanlı izleme aktif.</strong>{' '}
        Yeni başvuru, bilet veya rezervasyon geldiğinde sayaçlar otomatik güncellenir.
      </div>
    </div>
  );
}
