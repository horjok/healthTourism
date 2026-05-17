'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDilContext } from '@/lib/DilContext';
import { useDoviz } from '@/lib/DovizContext';
import { useCartStore } from '@/lib/cartStore';
import { useKullaniciContext } from '@/lib/KullaniciContext';

export default function TransferPage() {
  const { dil } = useDilContext();
  const tr = dil === 'tr';
  const router = useRouter();
  const { addItem } = useCartStore();
  const { formatla } = useDoviz();
  const { isKlinikYoneticisi } = useKullaniciContext();
  const [selected, setSelected] = useState<'normal' | 'vip' | null>(null);
  const [added, setAdded] = useState(false);

  const TRANSFERS = [
    {
      id: 'normal',
      ikon: '🚐',
      baslik: tr ? 'Standart Transfer' : 'Standard Transfer',
      aciklama: tr ? 'Konforlu minibüs veya sedan araç' : 'Comfortable minibus or sedan vehicle',
      fiyat: 30,
      birim: tr ? 'kişi başı' : 'per person',
      ozellikler: [
        tr ? '✓ Havalimanı karşılama' : '✓ Airport pickup',
        tr ? '✓ Otel transferi' : '✓ Hotel transfer',
        tr ? '✓ Klinik transferi' : '✓ Clinic transfer',
      ],
      renk: 'border-gray-200',
      aktifRenk: 'border-[#0f3460] bg-blue-50',
      oneri: false,
    },
    {
      id: 'vip',
      ikon: '🚗',
      baslik: tr ? 'VIP Transfer' : 'VIP Transfer',
      aciklama: tr ? 'Lüks Mercedes, özel şoför' : 'Luxury Mercedes, private driver',
      fiyat: 80,
      birim: tr ? 'araç başı' : 'per vehicle',
      ozellikler: [
        tr ? '✓ Özel karşılama tabelası' : '✓ Private welcome sign',
        tr ? '✓ İkram servisi' : '✓ Refreshment service',
        tr ? '✓ 7/24 şoför' : '✓ 24/7 driver',
        tr ? '✓ Havalimanı fast-track' : '✓ Airport fast-track',
        tr ? '✓ Çocuk koltuğu (isteğe bağlı)' : '✓ Child seat (optional)',
      ],
      renk: 'border-gray-200',
      aktifRenk: 'border-[#0f3460] bg-blue-50',
      oneri: true,
    },
  ];

  function handleAdd() {
    if (!selected) return;
    const t = TRANSFERS.find(t => t.id === selected)!;
    addItem({
      id: `transfer-${selected}`,
      type: 'transfer',
      name: t.baslik,
      detail: t.aciklama,
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

        {/* Transfer kartları */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {TRANSFERS.map(t => (
            <button
              key={t.id}
              onClick={() => setSelected(t.id as 'normal' | 'vip')}
              className={`relative text-left rounded-3xl border-2 p-7 transition-all duration-200 hover:shadow-xl hover:-translate-y-1 ${
                selected === t.id ? t.aktifRenk : t.renk + ' bg-white hover:border-gray-300'
              }`}>

              {t.oneri && (
                <div className="absolute top-4 right-4 bg-amber-400 text-white text-xs font-bold px-3 py-1 rounded-full">
                  {tr ? 'ÖNERİLEN' : 'RECOMMENDED'}
                </div>
              )}

              {selected === t.id && (
                <div className="absolute top-4 left-4 w-6 h-6 bg-[#0f3460] rounded-full flex items-center justify-center text-white text-xs">✓</div>
              )}

              <div className="text-5xl mb-4">{t.ikon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">{t.baslik}</h3>
              <p className="text-sm text-gray-500 mb-5">{t.aciklama}</p>

              <ul className="space-y-2 mb-6">
                {t.ozellikler.map((o, i) => (
                  <li key={i} className="text-sm text-gray-600">{o}</li>
                ))}
              </ul>

              <div className="pt-4 border-t border-gray-100">
                <span className="text-3xl font-extrabold text-[#0f3460]">{formatla(t.fiyat)}</span>
                <span className="text-sm text-gray-400 ml-2">/ {t.birim}</span>
              </div>
            </button>
          ))}
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
      </div>
    </main>
  );
}