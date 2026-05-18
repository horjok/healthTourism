'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase-client';
import type { ErisilebilirlikBilgisi, Rezervasyon } from '@/lib/types';

type Durum = Rezervasyon['durum'];

const DURUM_RENK: Record<Durum, string> = {
  beklemede:   'bg-amber-100 text-amber-700',
  onaylandi:   'bg-blue-100  text-blue-700',
  tamamlandi:  'bg-emerald-100 text-emerald-700',
  iptal:       'bg-red-100   text-red-700',
  arsivlendi:  'bg-gray-100  text-gray-500',
};

const DURUM_LABEL: Record<Durum, string> = {
  beklemede:   'Beklemede',
  onaylandi:   'Onaylandı',
  tamamlandi:  'Tamamlandı',
  iptal:       'İptal',
  arsivlendi:  'Arşivlendi',
};

const GECIS_KURALLARI: Record<Durum, Durum[]> = {
  beklemede:  ['onaylandi', 'iptal'],
  onaylandi:  ['tamamlandi', 'iptal'],
  tamamlandi: [],
  iptal:      [],
  arsivlendi: [],
};

// Tooltip: erisilebilirlik detayı için basit hover kutusu
function ErisilebilirlikHucresi({ veri }: { veri: ErisilebilirlikBilgisi | null | undefined }) {
  const [acik, setAcik] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  if (!veri?.gerekli) return <span className="text-gray-300 text-xs">—</span>;

  const etiketler = [...veri.fiziksel, ...veri.zihinsel, ...veri.tibbi];

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onMouseEnter={() => setAcik(true)}
        onMouseLeave={() => setAcik(false)}
        className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-1 rounded-lg font-semibold whitespace-nowrap"
      >
        ♿ {etiketler.length} not
      </button>
      {acik && (
        <div className="absolute left-0 top-7 z-30 w-52 bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-xs space-y-1">
          {etiketler.map((t) => (
            <span key={t} className="inline-block bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full mr-1 mb-1">{t}</span>
          ))}
          {veri.ek_not && <p className="text-gray-500 italic pt-1 border-t border-gray-100">{veri.ek_not}</p>}
          {veri.acil_ad && (
            <p className="text-gray-600 pt-1 border-t border-gray-100">
              🚨 {veri.acil_ad} · {veri.acil_telefon}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function ClinicRezervasyonlar() {
  const router = useRouter();
  const [klinikId, setKlinikId] = useState<string | null>(null);
  const [rezervasyonlar, setRezervasyonlar] = useState<Rezervasyon[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [guncelleniyor, setGuncelleniyor] = useState<string | null>(null);
  const [filtre, setFiltre] = useState<Durum | 'tumu'>('tumu');
  const [arsivGoster, setArsivGoster] = useState(false);

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

  const aktifRezervasyonlar = arsivGoster
    ? rezervasyonlar
    : rezervasyonlar.filter((r) => r.durum !== 'arsivlendi');

  const gorunen = filtre === 'tumu'
    ? aktifRezervasyonlar
    : aktifRezervasyonlar.filter((r) => r.durum === filtre);

  if (yukleniyor) return <p className="text-gray-500 text-sm">Yükleniyor...</p>;

  if (!klinikId) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 text-sm">Bu hesaba bağlı bir klinik bulunamadı.</p>
      </div>
    );
  }

  const gorulecekler = arsivGoster ? rezervasyonlar : rezervasyonlar.filter((r) => r.durum !== 'arsivlendi');
  const arsivSayisi = rezervasyonlar.filter((r) => r.durum === 'arsivlendi').length;

  const sayimlar = (['tumu', 'beklemede', 'onaylandi', 'tamamlandi', 'iptal'] as const).map((d) => ({
    key: d,
    label: d === 'tumu' ? 'Tümü' : DURUM_LABEL[d],
    sayi: d === 'tumu' ? gorulecekler.length : gorulecekler.filter((r) => r.durum === d).length,
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-gray-900">
          Rezervasyonlar
          <span className="ml-2 text-base font-normal text-gray-400">({gorulecekler.length})</span>
        </h1>
        <button
          onClick={() => { setArsivGoster((p) => !p); setFiltre('tumu'); }}
          className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-colors ${
            arsivGoster
              ? 'bg-gray-200 text-gray-700 border-gray-300'
              : 'text-gray-500 border-gray-200 hover:border-gray-400'
          }`}
        >
          {arsivGoster ? 'Arşivi Gizle' : `Arşiv (${arsivSayisi})`}
        </button>
      </div>

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
              {['Müşteri', 'Paket / Hizmet', 'Takip Kodu', 'Tarih', 'Erişilebilirlik', 'Durum', 'İşlem'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {gorunen.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-gray-400 text-sm">
                  {filtre === 'tumu' ? 'Rezervasyon yok' : `${DURUM_LABEL[filtre as Durum]} rezervasyon yok`}
                </td>
              </tr>
            ) : gorunen.map((r) => {
              const gecisler = GECIS_KURALLARI[r.durum];
              const islemde  = guncelleniyor === r.id;

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

                  {/* Paket / Hizmet */}
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900 line-clamp-1 max-w-[180px]">
                      {r.item_isim ?? r.paket?.baslik ?? '—'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {r.item_tipi ?? 'package'}{r.paket?.sure_gun ? ` · ${r.paket.sure_gun} gün` : ''}
                    </p>
                  </td>

                  {/* Takip Kodu */}
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-lg">
                      {r.takip_kodu ?? '—'}
                    </span>
                    {r.grup_kodu && r.grup_kodu !== r.takip_kodu && (
                      <p className="text-[10px] text-gray-400 mt-0.5 font-mono">grp: {r.grup_kodu}</p>
                    )}
                  </td>

                  {/* Tarih */}
                  <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                    <p>{r.tarih}</p>
                    <p className="text-gray-400">{new Date(r.olusturma_tarihi).toLocaleDateString('tr-TR')}</p>
                  </td>

                  {/* Erişilebilirlik */}
                  <td className="px-4 py-3">
                    <ErisilebilirlikHucresi veri={r.erisilebilirlik} />
                  </td>

                  {/* Durum */}
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${DURUM_RENK[r.durum]}`}>
                      {DURUM_LABEL[r.durum]}
                    </span>
                  </td>

                  {/* İşlem */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {gecisler.length > 0 && (
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
                      )}
                      {r.durum !== 'arsivlendi' ? (
                        <button
                          disabled={islemde}
                          onClick={() => durumGuncelle(r.id, 'arsivlendi')}
                          title="Arşivle"
                          className="text-xs text-gray-400 hover:text-gray-700 border border-gray-200 hover:border-gray-400 rounded-lg px-2 py-1.5 transition-colors disabled:opacity-40"
                        >
                          Arşivle
                        </button>
                      ) : (
                        <span className="text-xs text-gray-300 italic">Arşivde</span>
                      )}
                    </div>
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
