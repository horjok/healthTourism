'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase-client';
import type { Rezervasyon } from '@/lib/types';

const DURUM_RENK: Record<string, string> = {
  beklemede: 'bg-amber-100 text-amber-700',
  onaylandi: 'bg-green-100 text-green-700',
  iptal:     'bg-red-100 text-red-700',
};

export default function ClinicRezervasyonlar() {
  const router = useRouter();
  const [rezervasyonlar, setRezervasyonlar] = useState<Rezervasyon[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/auth'); return; }

      const { data: roleRow } = await supabase
        .from('user_roles')
        .select('klinik_id')
        .eq('kullanici_id', user.id)
        .single();

      if (!roleRow?.klinik_id) { setYukleniyor(false); return; }

      const res = await fetch(`/api/clinic/rezervasyonlar?klinik_id=${roleRow.klinik_id}`);
      const json = await res.json();
      if (json.success) setRezervasyonlar(json.data);
      setYukleniyor(false);
    });
  }, [router]);

  if (yukleniyor) return <p className="text-gray-500">Yükleniyor...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Rezervasyonlar
        <span className="ml-3 text-base font-normal text-gray-400">({rezervasyonlar.length})</span>
      </h1>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Paket', 'Tarih', 'Durum', 'Oluşturma'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rezervasyonlar.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">Rezervasyon yok</td></tr>
            )}
            {rezervasyonlar.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{r.paket?.baslik ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600">{r.tarih}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${DURUM_RENK[r.durum]}`}>
                    {r.durum}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">
                  {new Date(r.olusturma_tarihi).toLocaleDateString('tr-TR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
