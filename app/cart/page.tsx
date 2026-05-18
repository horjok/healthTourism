'use client';

import Link from 'next/link';
import { useCartStore } from '@/lib/cartStore';
import { useDilContext } from '@/lib/DilContext';
import { useDoviz } from '@/lib/DovizContext';

const TYPE_ICONS: Record<string, string> = {
  flight: '✈️', package: '🏥', transfer: '🚗',
  tour: '🎯', hotel: '🏨', health: '🩺',
};

export default function CartPage() {
  const { dil } = useDilContext();
  const tr = dil === 'tr';
  const { formatla } = useDoviz();
  const { items, passengers, removeItem, setPassengers, totalPrice, clearCart } = useCartStore();

  const tax = Math.round(totalPrice() * 0.08);
  const grand = totalPrice() + tax;

  return (
    <main className="min-h-screen" style={{ background: '#FDFBF7' }}>

      {/* HEADER */}
      <section className="relative overflow-hidden px-6 py-14"
        style={{ background: 'linear-gradient(135deg, #0D1E25 0%, #060f13 100%)' }}>
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.05]">
          <svg className="h-full w-full"><defs><pattern id="seljuk-cart" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
            <g fill="none" stroke="white" strokeWidth="1">
              <rect x="25" y="25" width="50" height="50"/>
              <rect x="25" y="25" width="50" height="50" transform="rotate(45 50 50)"/>
            </g>
          </pattern></defs><rect width="100%" height="100%" fill="url(#seljuk-cart)"/></svg>
        </div>
        <div className="pointer-events-none absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl" style={{ background: 'rgba(0,210,211,0.12)' }} />
        <div className="relative max-w-5xl mx-auto">
          <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: '#00D2D3' }}>
            {tr ? 'Alışveriş Sepeti' : 'Shopping Cart'}
          </p>
          <h1 className="font-serif text-4xl font-bold text-white mb-1">
            {tr ? 'Sepetim' : 'My Cart'}
          </h1>
          <p className="text-sm" style={{ color: '#8aa0ad' }}>
            {items.length} {tr ? 'ürün' : 'items'}
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {items.length === 0 ? (

          /* BOŞ SEPET */
          <div className="text-center py-24 rounded-3xl" style={{ background: '#FDFBF7', border: '1px solid #e8e0d0' }}>
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="font-serif text-2xl mb-2" style={{ color: '#0D1E25' }}>
              {tr ? 'Sepetiniz boş' : 'Your cart is empty'}
            </h2>
            <p className="text-sm mb-8" style={{ color: '#8aa0ad' }}>
              {tr ? 'Paket, uçuş veya tur ekleyerek başlayın' : 'Add a package, flight or tour to get started'}
            </p>
            <Link href="/packages"
              className="inline-block px-8 py-3 font-bold rounded-2xl text-white transition-all hover:scale-105"
              style={{ background: '#FF4757', boxShadow: '0 0 20px rgba(255,71,87,0.3)' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#e63950')}
              onMouseLeave={e => (e.currentTarget.style.background = '#FF4757')}>
              {tr ? 'Paketlere Bak →' : 'Browse Packages →'}
            </Link>
          </div>

        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">

            {/* SOL */}
            <div className="space-y-4">

              {/* YOLCU SAYISI */}
              <div className="rounded-2xl p-6" style={{ background: '#FDFBF7', border: '1px solid #e8e0d0' }}>
                <h2 className="font-serif text-xl mb-4" style={{ color: '#0D1E25' }}>
                  {tr ? 'Yolcu Sayısı' : 'Passengers'}
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {/* Yetişkin */}
                  <div className="rounded-2xl p-4" style={{ background: 'rgba(0,210,211,0.06)', border: '1px solid rgba(0,210,211,0.15)' }}>
                    <div className="text-sm font-semibold mb-3" style={{ color: '#3d5562' }}>
                      👤 {tr ? 'Yetişkin' : 'Adult'}
                      <span className="text-xs ml-1" style={{ color: '#8aa0ad' }}>(12+)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={() => setPassengers({ ...passengers, adult: Math.max(1, passengers.adult - 1) })}
                        className="w-9 h-9 rounded-full flex items-center justify-center text-lg font-bold transition-all"
                        style={{ background: 'white', border: '1px solid #e8e0d0', color: '#3d5562' }}>−</button>
                      <span className="text-2xl font-extrabold w-8 text-center" style={{ color: '#0D1E25' }}>{passengers.adult}</span>
                      <button onClick={() => setPassengers({ ...passengers, adult: passengers.adult + 1 })}
                        className="w-9 h-9 rounded-full flex items-center justify-center text-lg font-bold text-white transition-all"
                        style={{ background: '#00D2D3' }}>+</button>
                    </div>
                  </div>

                  {/* Çocuk */}
                  <div className="rounded-2xl p-4" style={{ background: 'rgba(255,71,87,0.04)', border: '1px solid rgba(255,71,87,0.12)' }}>
                    <div className="text-sm font-semibold mb-3" style={{ color: '#3d5562' }}>
                      👶 {tr ? 'Çocuk' : 'Child'}
                      <span className="text-xs ml-1" style={{ color: '#8aa0ad' }}>(2-11)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={() => setPassengers({ ...passengers, child: Math.max(0, passengers.child - 1) })}
                        className="w-9 h-9 rounded-full flex items-center justify-center text-lg font-bold transition-all"
                        style={{ background: 'white', border: '1px solid #e8e0d0', color: '#3d5562' }}>−</button>
                      <span className="text-2xl font-extrabold w-8 text-center" style={{ color: '#0D1E25' }}>{passengers.child}</span>
                      <button onClick={() => setPassengers({ ...passengers, child: passengers.child + 1 })}
                        className="w-9 h-9 rounded-full flex items-center justify-center text-lg font-bold text-white transition-all"
                        style={{ background: '#FF4757' }}>+</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* ÜRÜN LİSTESİ */}
              <div className="rounded-2xl overflow-hidden" style={{ background: '#FDFBF7', border: '1px solid #e8e0d0' }}>
                <div className="px-6 py-4" style={{ borderBottom: '1px solid #e8e0d0' }}>
                  <h2 className="font-serif text-xl" style={{ color: '#0D1E25' }}>
                    {tr ? 'Seçilen Hizmetler' : 'Selected Services'}
                  </h2>
                </div>
                <div>
                  {items.map((item, idx) => (
                    <div key={item.id} className="flex items-center gap-4 px-6 py-4"
                      style={{ borderBottom: idx < items.length - 1 ? '1px solid #F7F1E3' : 'none' }}>
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                        style={{ background: 'rgba(0,210,211,0.08)', border: '1px solid rgba(0,210,211,0.15)' }}>
                        {TYPE_ICONS[item.type] || '📦'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold truncate" style={{ color: '#0D1E25' }}>{item.name}</div>
                        <div className="text-xs mt-0.5 truncate" style={{ color: '#8aa0ad' }}>{item.detail}</div>
                        <div className="text-xs mt-0.5" style={{ color: '#8aa0ad' }}>
                          {formatla(item.unitPrice)} × {item.quantity}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-serif text-lg font-bold" style={{ color: '#FF4757' }}>
                          {formatla(item.lineTotal)}
                        </div>
                        <button onClick={() => removeItem(item.id)}
                          className="text-xs font-semibold mt-1 transition-colors"
                          style={{ color: '#8aa0ad' }}
                          onMouseEnter={e => (e.currentTarget.style.color = '#FF4757')}
                          onMouseLeave={e => (e.currentTarget.style.color = '#8aa0ad')}>
                          {tr ? 'Kaldır' : 'Remove'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button onClick={clearCart}
                className="text-sm font-semibold transition-colors"
                style={{ color: '#8aa0ad' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#FF4757')}
                onMouseLeave={e => (e.currentTarget.style.color = '#8aa0ad')}>
                🗑 {tr ? 'Sepeti temizle' : 'Clear cart'}
              </button>
            </div>

            {/* SAĞ — ÖZET */}
            <div className="h-fit sticky top-24">
              <div className="rounded-2xl p-6" style={{ background: '#FDFBF7', border: '1px solid #e8e0d0' }}>

                {/* Başlık şeridi */}
                <div className="h-1 w-full rounded-full mb-6" style={{ background: 'linear-gradient(90deg, #0D1E25, #00D2D3)' }} />

                <h2 className="font-serif text-xl mb-6" style={{ color: '#0D1E25' }}>
                  {tr ? 'Sipariş Özeti' : 'Order Summary'}
                </h2>

                <div className="space-y-3 mb-6">
                  {items.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="truncate mr-2" style={{ color: '#3d5562' }}>{item.name}</span>
                      <span className="font-semibold shrink-0" style={{ color: '#0D1E25' }}>{formatla(item.lineTotal)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm pt-3" style={{ borderTop: '1px solid #e8e0d0' }}>
                    <span style={{ color: '#3d5562' }}>{tr ? 'Ara toplam' : 'Subtotal'}</span>
                    <span className="font-semibold" style={{ color: '#0D1E25' }}>{formatla(totalPrice())}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: '#3d5562' }}>{tr ? 'Vergi (%8)' : 'Tax (8%)'}</span>
                    <span className="font-semibold" style={{ color: '#0D1E25' }}>{formatla(tax)}</span>
                  </div>
                  <div className="flex justify-between pt-3" style={{ borderTop: '1px solid #e8e0d0' }}>
                    <span className="font-bold" style={{ color: '#0D1E25' }}>{tr ? 'Toplam' : 'Total'}</span>
                    <span className="font-serif text-2xl font-bold" style={{ color: '#FF4757' }}>{formatla(grand)}</span>
                  </div>
                </div>

                {/* Yolcu bilgisi */}
                <div className="rounded-xl p-3 mb-6 text-xs font-medium"
                  style={{ background: 'rgba(0,210,211,0.06)', border: '1px solid rgba(0,210,211,0.15)', color: '#00D2D3' }}>
                  👥 {passengers.adult} {tr ? 'yetişkin' : 'adult'}
                  {passengers.child > 0 && `, ${passengers.child} ${tr ? 'çocuk' : 'child'}`}
                </div>

                <Link href="/booking"
                  className="block w-full py-4 font-bold rounded-2xl text-center text-white transition-all hover:scale-[1.02] text-base"
                  style={{ background: '#FF4757', boxShadow: '0 0 24px rgba(255,71,87,0.35)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#e63950')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#FF4757')}>
                  {tr ? 'Rezervasyonu Tamamla →' : 'Complete Reservation →'}
                </Link>

                <Link href="/packages"
                  className="block w-full py-3 text-center text-sm font-medium mt-3 transition-colors"
                  style={{ color: '#8aa0ad' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#3d5562')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#8aa0ad')}>
                  {tr ? '← Alışverişe devam et' : '← Continue shopping'}
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}