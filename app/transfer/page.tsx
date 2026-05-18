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

const STIL: Record<string, { ikon: string }> = {
  normal: { ikon: '🚐' },
  vip:    { ikon: '🚗' },
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
    <main className="min-h-screen" style={{ background: '#FDFBF7' }}>

      {/* HEADER */}
      <section className="relative overflow-hidden px-6 py-20 text-center"
        style={{ background: 'linear-gradient(135deg, #0D1E25 0%, #060f13 100%)' }}>
        {/* Görsel overlay */}
        <div className="absolute inset-0 opacity-15 mix-blend-luminosity"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1200)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
        {/* Selçuklu desen */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.05]">
          <svg className="h-full w-full"><defs><pattern id="seljuk-tr" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
            <g fill="none" stroke="white" strokeWidth="1">
              <rect x="25" y="25" width="50" height="50"/>
              <rect x="25" y="25" width="50" height="50" transform="rotate(45 50 50)"/>
            </g>
          </pattern></defs><rect width="100%" height="100%" fill="url(#seljuk-tr)"/></svg>
        </div>
        <div className="pointer-events-none absolute -top-20 -right-20 w-80 h-80 rounded-full blur-3xl" style={{ background: 'rgba(0,210,211,0.12)' }} />
        <div className="pointer-events-none absolute -bottom-20 -left-20 w-80 h-80 rounded-full blur-3xl" style={{ background: 'rgba(255,71,87,0.08)' }} />

        <div className="relative">
          <p className="text-[11px] font-bold uppercase tracking-widest mb-4" style={{ color: '#00D2D3' }}>
            {tr ? 'Transfer Seçimi' : 'Transfer Selection'}
          </p>
          <h1 className="font-serif text-4xl md:text-6xl font-bold text-white mb-4">
            {tr ? 'Transferinizi Seçin' : 'Choose Your Transfer'}
          </h1>
          <p className="text-lg max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.6)' }}>
            {tr ? 'Havalimanından otelinize ve kliniğinize konforlu ulaşım' : 'Comfortable transportation from airport to your hotel and clinic'}
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 py-12">

        {/* Rota göstergesi */}
        <div className="rounded-2xl p-5 mb-10 text-center" style={{ background: '#FDFBF7', border: '1px solid #e8e0d0' }}>
          <div className="flex items-center justify-center gap-2 text-sm font-semibold flex-wrap" style={{ color: '#3d5562' }}>
            {[
              { ikon: '✈️', label: tr ? 'Havalimanı' : 'Airport' },
              { ikon: '🏨', label: tr ? 'Otel' : 'Hotel' },
              { ikon: '🏥', label: tr ? 'Klinik' : 'Clinic' },
              { ikon: '🏨', label: tr ? 'Otel' : 'Hotel' },
              { ikon: '✈️', label: tr ? 'Havalimanı' : 'Airport' },
            ].map((item, i, arr) => (
              <span key={i} className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-full text-xs font-bold"
                  style={{ background: 'rgba(0,210,211,0.1)', color: '#00D2D3', border: '1px solid rgba(0,210,211,0.2)' }}>
                  {item.ikon} {item.label}
                </span>
                {i < arr.length - 1 && <span style={{ color: '#8aa0ad' }}>→</span>}
              </span>
            ))}
          </div>
        </div>

        {/* Yükleniyor */}
        {yukleniyor && (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: '#00D2D3', borderTopColor: 'transparent' }} />
          </div>
        )}

        {/* Transfer kartları */}
        {!yukleniyor && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              {transfers.map(t => {
                const stil = STIL[t.id] ?? { ikon: '🚌' };
                const ozellikler = tr ? t.ozellikler_tr : t.ozellikler_en;
                const isSelected = selected === t.id;

                return (
                  <button
                    key={t.id}
                    onClick={() => setSelected(t.id)}
                    className="relative text-left rounded-3xl p-7 transition-all duration-300 hover:-translate-y-1"
                    style={{
                      background: isSelected ? 'rgba(0,210,211,0.05)' : '#FDFBF7',
                      border: isSelected ? '2px solid #00D2D3' : '2px solid #e8e0d0',
                      boxShadow: isSelected ? '0 0 30px rgba(0,210,211,0.15)' : 'none',
                    }}>

                    {/* Önerilen rozeti */}
                    {t.oneri && (
                      <div className="absolute top-4 right-4 rounded-full px-3 py-1 text-xs font-bold text-[#0D1E25]"
                        style={{ background: '#00D2D3', boxShadow: '0 0 10px rgba(0,210,211,0.4)' }}>
                        {tr ? 'ÖNERİLEN' : 'RECOMMENDED'}
                      </div>
                    )}

                    {/* Seçildi işareti */}
                    {isSelected && (
                      <div className="absolute top-4 left-4 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ background: '#00D2D3' }}>✓</div>
                    )}

                    <div className="text-5xl mb-4">{stil.ikon}</div>
                    <h3 className="font-serif text-2xl mb-1" style={{ color: '#0D1E25' }}>
                      {tr ? t.baslik_tr : t.baslik_en}
                    </h3>
                    <p className="text-sm mb-5" style={{ color: '#8aa0ad' }}>
                      {tr ? t.aciklama_tr : t.aciklama_en}
                    </p>

                    <ul className="space-y-2 mb-6">
                      {ozellikler.map((o, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm" style={{ color: '#3d5562' }}>
                          <span style={{ color: '#00D2D3' }}>✓</span> {o}
                        </li>
                      ))}
                    </ul>

                    <div className="pt-4" style={{ borderTop: '1px solid #e8e0d0' }}>
                      <span className="font-serif text-3xl font-bold" style={{ color: '#FF4757' }}>
                        {formatla(t.fiyat)}
                      </span>
                      <span className="text-sm ml-2" style={{ color: '#8aa0ad' }}>
                        / {tr ? t.birim_tr : t.birim_en}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Sepete ekle */}
            <div className="text-center">
              {!isKlinikYoneticisi && (
                <button
                  onClick={handleAdd}
                  disabled={!selected || added}
                  className="inline-flex items-center gap-2 px-12 py-4 font-bold rounded-2xl text-lg transition-all"
                  style={{
                    background: added ? '#22c55e' : selected ? '#FF4757' : '#e8e0d0',
                    color: added || selected ? 'white' : '#8aa0ad',
                    cursor: !selected || added ? 'not-allowed' : 'pointer',
                    boxShadow: selected && !added ? '0 0 24px rgba(255,71,87,0.35)' : 'none',
                  }}
                  onMouseEnter={e => { if (selected && !added) (e.currentTarget as HTMLElement).style.background = '#e63950'; }}
                  onMouseLeave={e => { if (selected && !added) (e.currentTarget as HTMLElement).style.background = '#FF4757'; }}>
                  {added
                    ? '✓ ' + (tr ? 'Sepete Eklendi!' : 'Added to Cart!')
                    : tr ? 'Sepete Ekle →' : 'Add to Cart →'}
                </button>
              )}
              {!selected && (
                <p className="text-sm mt-3" style={{ color: '#8aa0ad' }}>
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