'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDilContext } from '@/lib/DilContext';
import { useDoviz } from '@/lib/DovizContext';
import { useCartStore } from '@/lib/cartStore';
import { useKullaniciContext } from '@/lib/KullaniciContext';

type TransferDB = {
  id: string;
  baslik_tr: string;
  baslik_en: string;
  aciklama_tr: string;
  aciklama_en: string;
  fiyat: number;
  birim_tr: string;
  birim_en: string;
  ozellikler_tr: string[];
  ozellikler_en: string[];
  oneri: boolean;
};

const STIL: Record<string, { ikon: string; renk: string; aktifRenk: string }> = {
  normal: { ikon: '🚐', renk: 'border-gray-200', aktifRenk: 'border-[#0f3460] bg-blue-50' },
  vip:    { ikon: '🚗', renk: 'border-gray-200', aktifRenk: 'border-[#0f3460] bg-blue-50' },
};

export default function TransferPage() {
  const { dil } = useDilContext();
  const tr = dil === 'tr';
  const router = useRouter();
  const { addItem } = useCartStore();
  const { formatla } = useDoviz();
  const { isKlinikYoneticisi } = useKullaniciContext();

  const [transfers, setTransfers] = useState<TransferDB[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    fetch('/api/transferler')
      .then(r => r.json())
      .then(json => { if (json.success) setTransfers(json.data as TransferDB[]); })
      .finally(() => setYukleniyor(false));
  }, []);

  function handleAdd() {
    if (!selected) return;
    const t = transfers.find(t => t.id === selected);
    if (!t) return;
    addItem({
      id: `transfer-${selected}`,
      type: 'transfer',
      name: tr ? t.baslik_tr : t.baslik_en,
      detail: tr ? t.aciklama_tr : t.aciklama_en,
      unitPrice: t.fiyat,
      quantity: 1,
    });
    setAdded(true);
    setTimeout(() => router.push('/cart'), 1200);
  }

  return (
    <main className="min-h-screen bg-[#f8fafc]">

      {/* HEADER */}
      <section className="relative px-6 py-16 text-center overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0a1628 0%, #0f3460 100%)' }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1200)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div className="relative">
          <p className="text-blue-200/70 text-xs font-semibold uppercase tracking-widest mb-3">
            {tr ? 'Transfer Seçimi' : 'Transfer Selection'}
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            {tr ? 'Transferinizi Seçin' : 'Choose Your Transfer'}
          </h1>
          <p className="text-blue-100/70 text-lg max-w-xl mx-auto">
            {tr ? 'Havalimanından otelinize ve kliniğinize konforlu ulaşım' : 'Comfortable transportation from airport to your hotel and clinic'}
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 py-12">

        {/* Transfer rota göstergesi */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-8 text-center">
          <div className="flex items-center justify-center gap-2 text-sm font-semibold text-gray-600 flex-wrap">
            <span className="bg-blue-50 text-[#0f3460] px-3 py-1.5 rounded-full">✈️ {tr ? 'Havalimanı' : 'Airport'}</span>
            <span className="text-gray-300">→</span>
            <span className="bg-blue-50 text-[#0f3460] px-3 py-1.5 rounded-full">🏨 {tr ? 'Otel' : 'Hotel'}</span>
            <span className="text-gray-300">→</span>
            <span className="bg-blue-50 text-[#0f3460] px-3 py-1.5 rounded-full">🏥 {tr ? 'Klinik' : 'Clinic'}</span>
            <span className="text-gray-300">→</span>
            <span className="bg-blue-50 text-[#0f3460] px-3 py-1.5 rounded-full">🏨 {tr ? 'Otel' : 'Hotel'}</span>
            <span className="text-gray-300">→</span>
            <span className="bg-blue-50 text-[#0f3460] px-3 py-1.5 rounded-full">✈️ {tr ? 'Havalimanı' : 'Airport'}</span>
          </div>
        </div>

        {/* Yükleniyor */}
        {yukleniyor && (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-[#0f3460] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Transfer kartları */}
        {!yukleniyor && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {transfers.map(t => {
                const stil = STIL[t.id] ?? { ikon: '🚌', renk: 'border-gray-200', aktifRenk: 'border-[#0f3460] bg-blue-50' };
                const ozellikler = tr ? t.ozellikler_tr : t.ozellikler_en;
                return (
                  <button
                    key={t.id}
                    onClick={() => setSelected(t.id)}
                    className={`relative text-left rounded-3xl border-2 p-7 transition-all duration-200 hover:shadow-xl hover:-translate-y-1 ${
                      selected === t.id ? stil.aktifRenk : stil.renk + ' bg-white hover:border-gray-300'
                    }`}>

                    {t.oneri && (
                      <div className="absolute top-4 right-4 bg-amber-400 text-white text-xs font-bold px-3 py-1 rounded-full">
                        {tr ? 'ÖNERİLEN' : 'RECOMMENDED'}
                      </div>
                    )}

                    {selected === t.id && (
                      <div className="absolute top-4 left-4 w-6 h-6 bg-[#0f3460] rounded-full flex items-center justify-center text-white text-xs">✓</div>
                    )}

                    <div className="text-5xl mb-4">{stil.ikon}</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{tr ? t.baslik_tr : t.baslik_en}</h3>
                    <p className="text-sm text-gray-500 mb-5">{tr ? t.aciklama_tr : t.aciklama_en}</p>

                    <ul className="space-y-2 mb-6">
                      {ozellikler.map((o, i) => (
                        <li key={i} className="text-sm text-gray-600">{o}</li>
                      ))}
                    </ul>

                    <div className="pt-4 border-t border-gray-100">
                      <span className="text-3xl font-extrabold text-[#0f3460]">{formatla(t.fiyat)}</span>
                      <span className="text-sm text-gray-400 ml-2">/ {tr ? t.birim_tr : t.birim_en}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Sepete ekle butonu */}
            <div className="text-center">
              {!isKlinikYoneticisi && (
                <button
                  onClick={handleAdd}
                  disabled={!selected || added}
                  className={`px-12 py-4 font-bold rounded-2xl text-lg transition-all shadow-lg ${
                    added
                      ? 'bg-green-500 text-white'
                      : selected
                      ? 'bg-[#0f3460] text-white hover:bg-[#0a1628] hover:scale-105 hover:shadow-xl'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}>
                  {added
                    ? '✓ ' + (tr ? 'Sepete Eklendi!' : 'Added to Cart!')
                    : tr ? 'Sepete Ekle →' : 'Add to Cart →'}
                </button>
              )}

              {!selected && (
                <p className="text-sm text-gray-400 mt-3">
                  {tr ? 'Lütfen bir transfer seçeneği seçin' : 'Please select a transfer option'}
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
