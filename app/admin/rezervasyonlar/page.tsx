'use client';

import { useEffect, useState } from 'react';
import type { Rezervasyon } from '@/lib/types';

const DURUM_RENK: Record<string, string> = {
  beklemede: 'bg-amber-100 text-amber-700',
  onaylandi: 'bg-green-100 text-green-700',
  iptal:     'bg-red-100 text-red-700',
};

export default function AdminRezervasyonlar() {
  const [rezervasyonlar, setRezervasyonlar] = useState<Rezervasyon[]>([]);
  const [yukleniyor, setYukleniyor]         = useState(true);
  const [silinenId, setSilinenId]           = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/rezervasyonlar')
      .then((r) => r.json())
      .then((j) => { if (j.success) setRezervasyonlar(j.data); })
      .finally(() => setYukleniyor(false));
  }, []);

  async function rezervasyonSil(id: string) {
    if (!confirm('Bu rezervasyonu kalıcı olarak silmek istediğinize emin misiniz?')) return;
    setSilinenId(id);
    try {
      const r = await fetch(`/api/admin/rezervasyonlar?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      const j = await r.json();
      if (j.success) {
        setRezervasyonlar((prev) => prev.filter((x) => x.id !== id));
      } else {
        alert(j.error ?? 'Rezervasyon silinemedi');
      }
    } catch {
      alert('Bağlantı hatası, lütfen tekrar deneyin');
    } finally {
      setSilinenId(null);
    }
  }

  if (yukleniyor) return <p className="text-gray-500">Yükleniyor...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Tüm Rezervasyonlar
        <span className="ml-3 text-base font-normal text-gray-400">({rezervasyonlar.length})</span>
      </h1>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Paket', 'Klinik', 'Tarih', 'Durum', 'Oluşturma', ''].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rezervasyonlar.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Rezervasyon yok</td></tr>
            )}
            {rezervasyonlar.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{r.paket?.baslik ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600">{r.paket?.klinik?.isim ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600">{r.tarih}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${DURUM_RENK[r.durum]}`}>
                    {r.durum}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">
                  {new Date(r.olusturma_tarihi).toLocaleDateString('tr-TR')}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => rezervasyonSil(r.id)}
                    disabled={silinenId === r.id}
                    className="text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 px-2.5 py-1 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {silinenId === r.id ? 'Siliniyor...' : 'Sil'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
