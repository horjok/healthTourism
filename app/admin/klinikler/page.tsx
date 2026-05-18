'use client';

import { useEffect, useMemo, useState } from 'react';
import { KlinikDetayDrawer } from '@/components/admin/KlinikDetayDrawer';
import type { ClinicApplication, Klinik } from '@/lib/types';

// ─── Yardımcı tipler ────────────────────────────────────────────────────────

type SiraKey = 'klinik_isim' | 'sehir' | 'durum' | 'olusturma_tarihi';
type SiraYon = 'asc' | 'desc';

const DURUM_RENK: Record<string, string> = {
  pending:  'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100   text-red-700',
};

const DURUM_TR: Record<string, string> = {
  pending: 'Beklemede', approved: 'Onaylandı', rejected: 'Reddedildi',
};

function SiraOk({ aktif, yon }: { aktif: boolean; yon: SiraYon }) {
  if (!aktif) return <span className="text-gray-300 ml-1">↕</span>;
  return <span className="ml-1">{yon === 'asc' ? '↑' : '↓'}</span>;
}

// ─── Bileşen ────────────────────────────────────────────────────────────────

export default function AdminKlinikler() {
  const [basvurular, setBasvurular] = useState<ClinicApplication[]>([]);
  const [klinikler, setKlinikler]   = useState<Klinik[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [islemde, setIslemde]       = useState<string | null>(null);

  // Onay form state
  const [seciliId, setSeciliId]   = useState<string | null>(null);
  const [klinikId, setKlinikId]   = useState('');
  const [adminNotu, setAdminNotu] = useState('');

  // Drawer state
  const [drawerKlinikId, setDrawerKlinikId]     = useState<string | null>(null);
  const [drawerKlinikIsim, setDrawerKlinikIsim] = useState('');

  // Sıralama
  const [siraKey, setSiraKey] = useState<SiraKey>('olusturma_tarihi');
  const [siraYon, setSiraYon] = useState<SiraYon>('desc');

  // Filtre
  const [filUzmanlik, setFilUzmanlik] = useState('');
  const [filSehir, setFilSehir]       = useState('');
  const [filDurum, setFilDurum]       = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/applications').then((r) => r.json()),
      fetch('/api/klinikler').then((r) => r.json()),
    ]).then(([apps, klnk]) => {
      if (apps.success)  setBasvurular(apps.data);
      if (klnk.success)  setKlinikler(klnk.data);
    }).finally(() => setYukleniyor(false));
  }, []);

  // Dinamik filtre seçenekleri
  const uzmanliklar = useMemo(() => {
    const set = new Set<string>();
    basvurular.forEach((b) => b.uzmanlik.forEach((u) => set.add(u)));
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'tr'));
  }, [basvurular]);

  const sehirler = useMemo(() => {
    const set = new Set<string>();
    basvurular.forEach((b) => set.add(b.sehir));
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'tr'));
  }, [basvurular]);

  // Filtrelenmiş + sıralanmış veri
  const goster = useMemo(() => {
    return basvurular
      .filter((b) => !filUzmanlik || b.uzmanlik.includes(filUzmanlik))
      .filter((b) => !filSehir    || b.sehir === filSehir)
      .filter((b) => !filDurum    || b.durum === filDurum)
      .sort((a, b) => {
        const cmp = String(a[siraKey]).localeCompare(String(b[siraKey]), 'tr');
        return siraYon === 'asc' ? cmp : -cmp;
      });
  }, [basvurular, filUzmanlik, filSehir, filDurum, siraKey, siraYon]);

  function sirala(key: SiraKey) {
    if (siraKey === key) setSiraYon((y) => (y === 'asc' ? 'desc' : 'asc'));
    else { setSiraKey(key); setSiraYon('asc'); }
  }

  async function islemYap(id: string, durum: 'approved' | 'rejected') {
    if (durum === 'approved' && !klinikId) {
      alert('Onaylamak için bir klinik seçmelisiniz.');
      return;
    }
    setIslemde(id);
    const res = await fetch('/api/admin/applications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, durum, admin_notu: adminNotu, klinik_id: klinikId || undefined }),
    });
    const json = await res.json();
    if (json.success) {
      setBasvurular((prev) =>
        prev.map((b) => b.id === id ? { ...b, durum, admin_notu: adminNotu } : b)
      );
      setSeciliId(null); setKlinikId(''); setAdminNotu('');
    }
    setIslemde(null);
  }

  function drawerAc(b: ClinicApplication) {
    if (!b.klinik_id) return;
    setDrawerKlinikId(b.klinik_id);
    setDrawerKlinikIsim(b.klinik_isim);
  }

  if (yukleniyor) return <p className="text-gray-500 text-sm">Yükleniyor...</p>;

  return (
    <div>
      {/* Başlık */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-gray-900">
          Klinik Başvuruları
          <span className="ml-2 text-base font-normal text-gray-400">({goster.length}/{basvurular.length})</span>
        </h1>
      </div>

      {/* Filtre Çubuğu */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-5 shadow-sm flex flex-wrap gap-3 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-500">Uzmanlık</label>
          <select
            value={filUzmanlik}
            onChange={(e) => setFilUzmanlik(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f3460]/30 min-w-[160px]"
          >
            <option value="">Tümü</option>
            {uzmanliklar.map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-500">Şehir</label>
          <select
            value={filSehir}
            onChange={(e) => setFilSehir(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f3460]/30 min-w-[130px]"
          >
            <option value="">Tümü</option>
            {sehirler.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-500">Durum</label>
          <div className="flex gap-1.5">
            {['', 'pending', 'approved', 'rejected'].map((d) => (
              <button
                key={d}
                onClick={() => setFilDurum(d)}
                className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  filDurum === d
                    ? 'bg-[#0f3460] text-white border-[#0f3460]'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                }`}
              >
                {d ? DURUM_TR[d] : 'Tümü'}
              </button>
            ))}
          </div>
        </div>

        {(filUzmanlik || filSehir || filDurum) && (
          <button
            onClick={() => { setFilUzmanlik(''); setFilSehir(''); setFilDurum(''); }}
            className="text-xs text-gray-400 hover:text-gray-600 underline self-end pb-2"
          >
            Filtreleri temizle
          </button>
        )}
      </div>

      {/* Tablo */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {(
                [
                  { key: 'klinik_isim',      label: 'Klinik Adı'  },
                  { key: 'sehir',             label: 'Şehir'       },
                  { key: null,                label: 'Uzmanlık'    },
                  { key: 'durum',             label: 'Durum'       },
                  { key: 'olusturma_tarihi',  label: 'Tarih'       },
                  { key: null,                label: 'İşlem'       },
                ] as { key: SiraKey | null; label: string }[]
              ).map(({ key, label }) => (
                <th
                  key={label}
                  onClick={key ? () => sirala(key) : undefined}
                  className={`px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide select-none ${
                    key ? 'cursor-pointer hover:text-gray-800' : ''
                  }`}
                >
                  {label}
                  {key && <SiraOk aktif={siraKey === key} yon={siraYon} />}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {goster.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-gray-400 text-sm">
                  Bu filtrelere uygun başvuru bulunamadı.
                </td>
              </tr>
            )}
            {goster.map((b) => (
              <>
                <tr
                  key={b.id}
                  className={`hover:bg-gray-50 transition-colors ${seciliId === b.id ? 'bg-blue-50/40' : ''}`}
                >
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-900">{b.klinik_isim}</p>
                    <p className="text-xs text-gray-400">{b.iletisim_email}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{b.sehir}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {b.uzmanlik.slice(0, 2).map((u) => (
                        <span key={u} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{u}</span>
                      ))}
                      {b.uzmanlik.length > 2 && (
                        <span className="text-xs text-gray-400">+{b.uzmanlik.length - 2}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${DURUM_RENK[b.durum]}`}>
                      {DURUM_TR[b.durum]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {new Date(b.olusturma_tarihi).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {b.durum === 'approved' && b.klinik_id && (
                        <button
                          onClick={() => drawerAc(b)}
                          className="text-xs font-semibold text-[#0f3460] hover:underline"
                        >
                          Detay
                        </button>
                      )}
                      {b.durum === 'pending' && (
                        <button
                          onClick={() => setSeciliId(seciliId === b.id ? null : b.id)}
                          className="text-xs font-semibold text-gray-600 hover:underline"
                        >
                          {seciliId === b.id ? 'Kapat' : 'İşlem Yap'}
                        </button>
                      )}
                      {b.admin_notu && (
                        <span className="text-xs text-gray-400 italic truncate max-w-[120px]" title={b.admin_notu}>
                          Not: {b.admin_notu}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>

                {/* Satır içi onay paneli */}
                {seciliId === b.id && (
                  <tr key={`${b.id}-panel`} className="bg-blue-50/40">
                    <td colSpan={6} className="px-6 py-4">
                      <div className="flex flex-wrap gap-4 items-end">
                        <div className="flex flex-col gap-1 min-w-[220px]">
                          <label className="text-xs font-semibold text-gray-600">Mevcut Klinikle Eşleştir</label>
                          <select
                            value={klinikId}
                            onChange={(e) => setKlinikId(e.target.value)}
                            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f3460]/30"
                          >
                            <option value="">— Klinik seçin —</option>
                            {klinikler.map((k) => (
                              <option key={k.id} value={k.id}>{k.isim} ({k.sehir})</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex flex-col gap-1 flex-1 min-w-[180px]">
                          <label className="text-xs font-semibold text-gray-600">Admin Notu (opsiyonel)</label>
                          <input
                            type="text"
                            value={adminNotu}
                            onChange={(e) => setAdminNotu(e.target.value)}
                            placeholder="İç not..."
                            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f3460]/30"
                          />
                        </div>
                        <div className="flex gap-2 pb-0.5">
                          <button
                            onClick={() => islemYap(b.id, 'approved')}
                            disabled={islemde === b.id}
                            className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                          >
                            {islemde === b.id ? '...' : 'Onayla'}
                          </button>
                          <button
                            onClick={() => islemYap(b.id, 'rejected')}
                            disabled={islemde === b.id}
                            className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                          >
                            {islemde === b.id ? '...' : 'Reddet'}
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {/* Klinik detay drawer */}
      <KlinikDetayDrawer
        klinikId={drawerKlinikId}
        klinikIsim={drawerKlinikIsim}
        onKapat={() => { setDrawerKlinikId(null); setDrawerKlinikIsim(''); }}
      />
    </div>
  );
}
