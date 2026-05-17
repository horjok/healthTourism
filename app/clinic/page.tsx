'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase-client';
import type { Paket, Rezervasyon } from '@/lib/types';

export default function ClinicDashboard() {
  const router = useRouter();
  const [klinikId, setKlinikId] = useState<string | null>(null);
  const [paketler, setPaketler] = useState<Paket[]>([]);
  const [rezervasyonlar, setRezervasyonlar] = useState<Rezervasyon[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/auth'); return; }

      const { data: roleRow } = await supabase
        .from('user_roles')
        .select('rol, klinik_id')
        .eq('kullanici_id', user.id)
        .single();

      if (!roleRow?.klinik_id) { setYukleniyor(false); return; }
      setKlinikId(roleRow.klinik_id);

      const [pRes, rRes] = await Promise.all([
        fetch(`/api/clinic/paketler?klinik_id=${roleRow.klinik_id}`).then((r) => r.json()),
        fetch(`/api/clinic/rezervasyonlar?klinik_id=${roleRow.klinik_id}`).then((r) => r.json()),
      ]);

      if (pRes.success) setPaketler(pRes.data);
      if (rRes.success) setRezervasyonlar(rRes.data);
      setYukleniyor(false);
    });
  }, [router]);

  const toplamGelir = rezervasyonlar
    .filter((r) => r.durum === 'onaylandi')
    .reduce((acc, r) => acc + (r.paket?.toplam_fiyat ?? 0), 0);

  if (yukleniyor) return <p className="text-gray-500">Yükleniyor...</p>;

  if (!klinikId) {
    return (
      <div className="max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Klinik Paneli</h1>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <p className="text-amber-700 font-semibold">Başvurunuz henüz onaylanmadı.</p>
          <p className="text-amber-600 text-sm mt-1">Admin onayından sonra dashboard verileriniz burada görünecek.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Klinik Dashboard</h1>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-50 rounded-2xl p-5">
          <p className="text-2xl font-bold text-blue-700">{paketler.length}</p>
          <p className="text-sm text-blue-500 font-medium mt-1">Aktif Paket</p>
        </div>
        <div className="bg-green-50 rounded-2xl p-5">
          <p className="text-2xl font-bold text-green-700">{rezervasyonlar.length}</p>
          <p className="text-sm text-green-500 font-medium mt-1">Toplam Rezervasyon</p>
        </div>
        <div className="bg-purple-50 rounded-2xl p-5">
          <p className="text-2xl font-bold text-purple-700">€{toplamGelir.toLocaleString()}</p>
          <p className="text-sm text-purple-500 font-medium mt-1">Onaylanan Gelir</p>
        </div>
      </div>

      {/* Son rezervasyonlar */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100">
          <p className="font-bold text-gray-900">Son Rezervasyonlar</p>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {['Paket', 'Tarih', 'Durum'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rezervasyonlar.slice(0, 5).map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-3 font-medium text-gray-900">{r.paket?.baslik ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600">{r.tarih}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    r.durum === 'onaylandi' ? 'bg-green-100 text-green-700' :
                    r.durum === 'beklemede' ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {r.durum}
                  </span>
                </td>
              </tr>
            ))}
            {rezervasyonlar.length === 0 && (
              <tr><td colSpan={3} className="px-4 py-6 text-center text-gray-400 text-sm">Henüz rezervasyon yok</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
