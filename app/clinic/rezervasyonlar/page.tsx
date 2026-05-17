'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase-client';
import type { Rezervasyon } from '@/lib/types';

type Durum = Rezervasyon['durum'];

const DURUM_RENK: Record<Durum, string> = {
  beklemede:  'bg-amber-100 text-amber-700',
  onaylandi:  'bg-blue-100  text-blue-700',
  tamamlandi: 'bg-emerald-100 text-emerald-700',
  iptal:      'bg-red-100   text-red-700',
};

const DURUM_LABEL: Record<Durum, string> = {
  beklemede:  'Beklemede',
  onaylandi:  'Onaylandı',
  tamamlandi: 'Tamamlandı',
  iptal:      'İptal',
};

const GECIS_KURALLARI: Record<Durum, Durum[]> = {
  beklemede:  ['onaylandi', 'iptal'],
  onaylandi:  ['tamamlandi', 'iptal'],
  tamamlandi: [],
  iptal:      [],
};

export default function ClinicRezervasyonlar() {
  const router = useRouter();
  const [klinikId, setKlinikId] = useState<string | null>(null);
  const [rezervasyonlar, setRezervasyonlar] = useState<Rezervasyon[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [guncelleniyor, setGuncelleniyor] = useState<string | null>(null);
  const [filtre, setFiltre] = useState<Durum | 'tumu'>('tumu');

  useEffect(() => {
    const supabase = getSupabaseClient();
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.push('/auth'); return; }

        const { data: roleRow } = await supabase
          .from('user_roles')
          .select('klinik_id')
          .eq('kullanici_id', user.id)
          .single();

        if (!roleRow?.klinik_id) return;
        setKlinikId(roleRow.klinik_id);

        const res = await fetch(`/api/clinic/rezervasyonlar?klinik_id=${roleRow.klinik_id}`);
        const json = await res.json();
        if (json.success) setRezervasyonlar(json.data);
      } catch {
        // hata sessizce geç, yukleniyor false'a döner
      } finally {
        setYukleniyor(false);
      }
    })();
  }, [router]);

  async function durumGuncelle(rezervasyonId: string, yeniDurum: Durum) {
    if (!klinikId) return;
    setGuncelleniyor(rezervasyonId);

    const res = await fetch('/api/clinic/rezervasyonlar', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: rezervasyonId, durum: yeniDurum, klinik_id: klinikId }),
    });
    const json = await res.json();

    if (json.success) {
      setRezervasyonlar((prev) =>
        prev.map((r) => r.id === rezervasyonId ? { ...r, durum: yeniDurum } : r)
      );
    }
    setGuncelleniyor(null);
  }

  const gorunen = filtre === 'tumu'
    ? rezervasyonlar
    : rezervasyonlar.filter((r) => r.durum === filtre);

  if (yukleniyor) return <p className="text-gray-500 text-sm">Yükleniyor...</p>;

  if (!klinikId) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 text-sm">Bu hesaba bağlı bir klinik bulunamadı.</p>
      </div>
    );
  }

  const sayimlar = (['tumu', 'beklemede', 'onaylandi', 'tamamlandi', 'iptal'] as const).map((d) => ({
    key: d,
    label: d === 'tumu' ? 'Tümü' : DURUM_LABEL[d],
    sayi: d === 'tumu' ? rezervasyonlar.length : rezervasyonlar.filter((r) => r.durum === d).length,
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-5">
        Rezervasyonlar
        <span className="ml-2 text-base font-normal text-gray-400">({rezervasyonlar.length})</span>
      </h1>

      {/* Durum filtre çubuğu */}
      <div className="flex flex-wrap gap-2 mb-5">
        {sayimlar.map(({ key, label, sayi }) => (
          <button
            key={key}
            onClick={() => setFiltre(key)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors ${
              filtre === key
                ? 'bg-[#0f3460] text-white border-[#0f3460]'
                : 'text-gray-600 border-gray-200 hover:border-gray-400'
            }`}
          >
            {label} <span className="ml-1 opacity-75">({sayi})</span>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Müşteri', 'Paket', 'Takip Kodu', 'Tarih', 'Durum', 'İşlem'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {gorunen.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-gray-400 text-sm">
                  {filtre === 'tumu' ? 'Rezervasyon yok' : `${DURUM_LABEL[filtre as Durum]} rezervasyon yok`}
                </td>
              </tr>
            ) : gorunen.map((r) => {
              const gecisler = GECIS_KURALLARI[r.durum];
              const islemde = guncelleniyor === r.id;

              return (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  {/* Müşteri */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#0f3460] to-[#16213e] flex items-center justify-center shrink-0">
                        <span className="text-white text-[10px] font-bold">
                          {r.kullanici_id.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 font-mono">#{r.kullanici_id.slice(-8)}</span>
                    </div>
                  </td>

                  {/* Paket */}
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900 line-clamp-1 max-w-[180px]">
                      {r.paket?.baslik ?? '—'}
                    </p>
                    {r.paket?.sure_gun && (
                      <p className="text-xs text-gray-400">{r.paket.sure_gun} gün</p>
                    )}
                  </td>

                  {/* Takip Kodu / PNR */}
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-lg">
                      {r.takip_kodu ?? '—'}
                    </span>
                  </td>

                  {/* Tarih */}
                  <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                    <p>{r.tarih}</p>
                    <p className="text-gray-400">
                      {new Date(r.olusturma_tarihi).toLocaleDateString('tr-TR')}
                    </p>
                  </td>

                  {/* Durum */}
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${DURUM_RENK[r.durum]}`}>
                      {DURUM_LABEL[r.durum]}
                    </span>
                  </td>

                  {/* İşlem */}
                  <td className="px-4 py-3">
                    {gecisler.length > 0 ? (
                      <select
                        disabled={islemde}
                        defaultValue=""
                        onChange={(e) => {
                          if (e.target.value) durumGuncelle(r.id, e.target.value as Durum);
                          e.target.value = '';
                        }}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#0f3460]/30 disabled:opacity-50 cursor-pointer"
                      >
                        <option value="" disabled>{islemde ? 'Güncelleniyor...' : 'Durum Değiştir'}</option>
                        {gecisler.map((d) => (
                          <option key={d} value={d}>{DURUM_LABEL[d]}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
