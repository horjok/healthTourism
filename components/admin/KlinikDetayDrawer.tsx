'use client';

import { useEffect, useState } from 'react';
import type { Klinik, Paket, Rezervasyon } from '@/lib/types';

interface Props {
  klinikId: string | null;
  klinikIsim: string;
  onKapat: () => void;
}

const DURUM_RENK: Record<string, string> = {
  beklemede: 'bg-amber-100 text-amber-700',
  onaylandi: 'bg-green-100 text-green-700',
  iptal: 'bg-red-100 text-red-700',
};

type Sekme = 'profil' | 'paketler' | 'rezervasyonlar';

export function KlinikDetayDrawer({ klinikId, klinikIsim, onKapat }: Props) {
  const [klinik, setKlinik] = useState<Klinik | null>(null);
  const [paketler, setPaketler] = useState<Paket[]>([]);
  const [rezervasyonlar, setRezervasyonlar] = useState<Rezervasyon[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [sekme, setSekme] = useState<Sekme>('profil');

  useEffect(() => {
    if (!klinikId) return;
    setYukleniyor(true);
    setSekme('profil');

    Promise.all([
      fetch(`/api/klinikler/${klinikId}`).then((r) => r.json()),
      fetch(`/api/clinic/paketler?klinik_id=${klinikId}`).then((r) => r.json()),
      fetch('/api/admin/rezervasyonlar').then((r) => r.json()),
    ]).then(([kl, pk, rv]) => {
      if (kl.success) setKlinik(kl.data);
      if (pk.success) setPaketler(pk.data);
      if (rv.success) {
        setRezervasyonlar(
          (rv.data as Rezervasyon[]).filter((r) => r.paket?.klinik?.id === klinikId)
        );
      }
    }).finally(() => setYukleniyor(false));
  }, [klinikId]);

  if (!klinikId) return null;

  const toplamGelir = rezervasyonlar.reduce(
    (s, r) => s + (r.paket?.toplam_fiyat ?? 0), 0
  );

  const sekmeler: { key: Sekme; label: string }[] = [
    { key: 'profil', label: 'Profil' },
    { key: 'paketler', label: `Paketler (${paketler.length})` },
    { key: 'rezervasyonlar', label: `Rezervasyonlar (${rezervasyonlar.length})` },
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onKapat} />
      <div className="fixed right-0 top-0 h-full w-full max-w-xl bg-white shadow-2xl z-50 flex flex-col">

        {/* Başlık */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <p className="font-bold text-gray-900 text-lg leading-tight">{klinikIsim}</p>
            {klinik && (
              <p className="text-sm text-gray-500 mt-0.5">
                {klinik.sehir} · ⭐ {klinik.puan}
                {klinik.akredite && <span className="ml-2 text-green-600 font-medium">✓ Akredite</span>}
              </p>
            )}
          </div>
          <button
            onClick={onKapat}
            className="text-gray-400 hover:text-gray-700 text-2xl leading-none ml-4 mt-0.5"
          >
            &times;
          </button>
        </div>

        {/* Sekmeler */}
        <div className="flex border-b border-gray-100 px-6 shrink-0">
          {sekmeler.map((s) => (
            <button
              key={s.key}
              onClick={() => setSekme(s.key)}
              className={`py-3 px-3 text-sm font-semibold border-b-2 -mb-px transition-colors ${
                sekme === s.key
                  ? 'border-[#0f3460] text-[#0f3460]'
                  : 'border-transparent text-gray-400 hover:text-gray-700'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* İçerik */}
        <div className="flex-1 overflow-y-auto p-6">
          {yukleniyor && (
            <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
              Yükleniyor...
            </div>
          )}

          {/* Profil */}
          {!yukleniyor && sekme === 'profil' && klinik && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Şehir', value: klinik.sehir },
                  { label: 'Puan', value: `⭐ ${klinik.puan}` },
                  { label: 'Fiyat Aralığı', value: klinik.fiyat_aralik },
                  {
                    label: 'Akreditasyon',
                    value: klinik.akredite ? '✓ Akredite' : '— Yok',
                    renk: klinik.akredite ? 'text-green-600' : 'text-gray-500',
                  },
                ].map((item) => (
                  <div key={item.label} className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-400 font-medium mb-1">{item.label}</p>
                    <p className={`font-semibold text-gray-800 ${item.renk ?? ''}`}>{item.value}</p>
                  </div>
                ))}
              </div>

              <div>
                <p className="text-xs text-gray-400 font-medium mb-2">Uzmanlık Alanları</p>
                <div className="flex flex-wrap gap-2">
                  {klinik.uzmanlik.map((u) => (
                    <span
                      key={u}
                      className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium"
                    >
                      {u}
                    </span>
                  ))}
                </div>
              </div>

              {klinik.fotograf_url && (
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-2">Fotoğraf</p>
                  <img
                    src={klinik.fotograf_url}
                    alt={klinik.isim}
                    className="w-full h-40 object-cover rounded-xl"
                  />
                </div>
              )}
            </div>
          )}

          {/* Paketler */}
          {!yukleniyor && sekme === 'paketler' && (
            <div className="space-y-3">
              {paketler.length === 0 && (
                <p className="text-gray-400 text-sm text-center py-8">Bu klinik için paket bulunamadı.</p>
              )}
              {paketler.map((p) => (
                <div key={p.id} className="border border-gray-100 rounded-xl p-4 hover:border-gray-200 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold text-gray-900 text-sm leading-snug">{p.baslik}</p>
                    <p className="font-bold text-[#0f3460] shrink-0">€{p.toplam_fiyat.toLocaleString()}</p>
                  </div>
                  <div className="flex gap-3 mt-2 text-xs text-gray-500">
                    <span>{p.sure_gun} gün</span>
                    {p.otel_dahil && <span>· 🏨 Otel</span>}
                    {p.ucus_dahil && <span>· ✈ Uçuş</span>}
                  </div>
                  {p.aciklama && (
                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">{p.aciklama}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Rezervasyonlar */}
          {!yukleniyor && sekme === 'rezervasyonlar' && (
            <div className="space-y-3">
              {rezervasyonlar.length === 0 && (
                <p className="text-gray-400 text-sm text-center py-8">Bu klinik için rezervasyon bulunamadı.</p>
              )}
              {rezervasyonlar.map((r) => (
                <div
                  key={r.id}
                  className="border border-gray-100 rounded-xl p-4 flex items-center justify-between gap-3"
                >
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{r.paket?.baslik ?? '—'}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {r.tarih} · {new Date(r.olusturma_tarihi).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${DURUM_RENK[r.durum]}`}>
                    {r.durum}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer istatistikler */}
        {!yukleniyor && (
          <div className="border-t border-gray-100 px-6 py-4 bg-gray-50 grid grid-cols-3 gap-4 text-center shrink-0">
            <div>
              <p className="text-xl font-bold text-gray-900">{paketler.length}</p>
              <p className="text-xs text-gray-400 mt-0.5">Paket</p>
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{rezervasyonlar.length}</p>
              <p className="text-xs text-gray-400 mt-0.5">Rezervasyon</p>
            </div>
            <div>
              <p className="text-xl font-bold text-[#0f3460]">€{toplamGelir.toLocaleString()}</p>
              <p className="text-xs text-gray-400 mt-0.5">Toplam Gelir</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
