'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase-client';
import type { Yorum } from '@/lib/types';

const YILDIZ_RENK: Record<number, string> = {
  5: 'text-emerald-500',
  4: 'text-green-500',
  3: 'text-amber-500',
  2: 'text-orange-500',
  1: 'text-red-500',
};

function YildizGoster({ puan }: { puan: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${i <= puan ? YILDIZ_RENK[puan] ?? 'text-amber-400' : 'text-gray-200'}`}
          fill="currentColor" viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="ml-1 text-xs font-bold text-gray-700">{puan}/5</span>
    </div>
  );
}

function PuanDagilimi({ yorumlar }: { yorumlar: Yorum[] }) {
  const toplam = yorumlar.length;
  if (toplam === 0) return null;

  return (
    <div className="space-y-1.5">
      {[5, 4, 3, 2, 1].map((p) => {
        const sayi = yorumlar.filter((y) => y.puan === p).length;
        const yuzde = toplam > 0 ? (sayi / toplam) * 100 : 0;
        return (
          <div key={p} className="flex items-center gap-2 text-xs">
            <span className="w-3 text-gray-600 font-semibold">{p}</span>
            <svg className="w-3 h-3 text-amber-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full transition-all duration-500"
                style={{ width: `${yuzde}%` }}
              />
            </div>
            <span className="w-6 text-right text-gray-500">{sayi}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function ClinicYorumlar() {
  const router = useRouter();
  const [yorumlar, setYorumlar] = useState<Yorum[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [filtrePuan, setFiltrePuan] = useState<number | null>(null);

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

        const res = await fetch(`/api/clinic/yorumlar?klinik_id=${roleRow.klinik_id}`);
        const json = await res.json();
        if (json.success) setYorumlar(json.data);
      } catch {
        // hata sessizce geç, yukleniyor false'a döner
      } finally {
        setYukleniyor(false);
      }
    })();
  }, [router]);

  const gorunen = filtrePuan !== null
    ? yorumlar.filter((y) => y.puan === filtrePuan)
    : yorumlar;

  const ortPuan = yorumlar.length > 0
    ? (yorumlar.reduce((acc, y) => acc + y.puan, 0) / yorumlar.length).toFixed(1)
    : null;

  if (yukleniyor) {
    return <p className="text-gray-500 text-sm">Yükleniyor...</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Yorumlar
          <span className="ml-2 text-base font-normal text-gray-400">({yorumlar.length})</span>
        </h1>
      </div>

      {yorumlar.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <p className="text-4xl mb-3">⭐</p>
          <p className="text-gray-500 font-medium">Henüz yorum yok</p>
          <p className="text-gray-400 text-sm mt-1">Hasta değerlendirmeleri burada görünecek</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sol — özet */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Özet</p>
              <div className="text-center mb-4">
                <p className="text-5xl font-extrabold text-gray-900">{ortPuan}</p>
                <p className="text-xs text-gray-400 mt-1">{yorumlar.length} değerlendirme</p>
              </div>
              <PuanDagilimi yorumlar={yorumlar} />
            </div>

            {/* Puan filtresi */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Filtrele</p>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => setFiltrePuan(null)}
                  className={`text-left text-sm px-3 py-1.5 rounded-lg transition-colors ${
                    filtrePuan === null ? 'bg-[#0f3460] text-white' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Tümü
                </button>
                {[5, 4, 3, 2, 1].map((p) => (
                  <button
                    key={p}
                    onClick={() => setFiltrePuan(p === filtrePuan ? null : p)}
                    className={`text-left text-sm px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                      filtrePuan === p ? 'bg-[#0f3460] text-white' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {'★'.repeat(p)}{'☆'.repeat(5 - p)} <span className="ml-auto text-xs">{yorumlar.filter(y => y.puan === p).length}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sağ — yorum listesi */}
          <div className="lg:col-span-3 space-y-3">
            {gorunen.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                <p className="text-gray-400 text-sm">Bu puan için yorum yok</p>
              </div>
            ) : gorunen.map((y) => (
              <div key={y.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0f3460] to-[#16213e] flex items-center justify-center shrink-0">
                        <span className="text-white text-xs font-bold">
                          {y.kullanici_id.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">Hasta #{y.kullanici_id.slice(-6)}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(y.olusturma_tarihi).toLocaleDateString('tr-TR', {
                            day: 'numeric', month: 'long', year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                    <YildizGoster puan={y.puan} />
                    {y.yorum_metni && (
                      <p className="mt-2 text-sm text-gray-700 leading-relaxed">{y.yorum_metni}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
