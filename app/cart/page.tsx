'use client';

import Link from 'next/link';
import { useCartStore } from '@/lib/cartStore';
import { useDilContext } from '@/lib/DilContext';

const TYPE_ICONS: Record<string, string> = {
  flight: '✈️',
  package: '🏥',
  transfer: '🚗',
  tour: '🎯',
};

export default function CartPage() {
  const { dil } = useDilContext();
  const tr = dil === 'tr';
  const { items, passengers, removeItem, setPassengers, totalPrice, clearCart } = useCartStore();

  const tax = Math.round(totalPrice() * 0.08);
  const grand = totalPrice() + tax;

  return (
    <main className="min-h-screen bg-[#f8fafc]">

      {/* HEADER */}
      <section className="px-6 py-10"
        style={{ background: 'linear-gradient(135deg, #0a1628 0%, #0f3460 100%)' }}>
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-extrabold text-white mb-1">
            {tr ? '🛒 Sepetim' : '🛒 My Cart'}
          </h1>
          <p className="text-blue-200/70 text-sm">
            {items.length} {tr ? 'ürün' : 'items'}
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {items.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-gray-100">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              {tr ? 'Sepetiniz boş' : 'Your cart is empty'}
            </h2>
            <p className="text-gray-400 mb-8">
              {tr ? 'Paket, uçuş veya tur ekleyerek başlayın' : 'Add a package, flight or tour to get started'}
            </p>
            <Link href="/packages"
              className="inline-block px-8 py-3 bg-[#0f3460] text-white font-bold rounded-2xl hover:bg-[#0a1628] transition-all">
              {tr ? 'Paketlere Bak →' : 'Browse Packages →'}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">

            {/* SOL — ÜRÜNLER */}
            <div className="space-y-4">

              {/* YOLCU SAYISI */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-base font-bold text-gray-900 mb-4">
                  {tr ? 'Yolcu Sayısı' : 'Passengers'}
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {/* Yetişkin */}
                  <div className="bg-blue-50 rounded-2xl p-4">
                    <div className="text-sm font-semibold text-gray-700 mb-3">
                      👤 {tr ? 'Yetişkin' : 'Adult'}
                      <span className="text-xs text-gray-400 ml-1">(12+)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setPassengers({ ...passengers, adult: Math.max(1, passengers.adult - 1) })}
                        className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-lg font-bold text-gray-600 hover:bg-gray-50">
                        −
                      </button>
                      <span className="text-2xl font-extrabold text-[#0f3460] w-6 text-center">{passengers.adult}</span>
                      <button
                        onClick={() => setPassengers({ ...passengers, adult: passengers.adult + 1 })}
                        className="w-8 h-8 rounded-full bg-[#0f3460] flex items-center justify-center text-lg font-bold text-white hover:bg-[#0a1628]">
                        +
                      </button>
                    </div>
                  </div>

                  {/* Çocuk */}
                  <div className="bg-purple-50 rounded-2xl p-4">
                    <div className="text-sm font-semibold text-gray-700 mb-3">
                      👶 {tr ? 'Çocuk' : 'Child'}
                      <span className="text-xs text-gray-400 ml-1">(2-11)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setPassengers({ ...passengers, child: Math.max(0, passengers.child - 1) })}
                        className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-lg font-bold text-gray-600 hover:bg-gray-50">
                        −
                      </button>
                      <span className="text-2xl font-extrabold text-[#0f3460] w-6 text-center">{passengers.child}</span>
                      <button
                        onClick={() => setPassengers({ ...passengers, child: passengers.child + 1 })}
                        className="w-8 h-8 rounded-full bg-[#0f3460] flex items-center justify-center text-lg font-bold text-white hover:bg-[#0a1628]">
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* ÜRÜN LİSTESİ */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="text-base font-bold text-gray-900">
                    {tr ? 'Seçilen Hizmetler' : 'Selected Services'}
                  </h2>
                </div>
                <div className="divide-y divide-gray-50">
                  {items.map(item => (
                    <div key={item.id} className="flex items-center gap-4 px-6 py-4">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-2xl shrink-0">
                        {TYPE_ICONS[item.type] || '📦'}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-bold text-gray-900">{item.name}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{item.detail}</div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          ${item.unitPrice} × {item.quantity}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-base font-extrabold text-[#0f3460]">${item.lineTotal}</div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-xs text-red-400 hover:text-red-600 mt-1 transition-colors">
                          {tr ? 'Kaldır' : 'Remove'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={clearCart}
                className="text-sm text-red-400 hover:text-red-600 transition-colors">
                {tr ? '🗑 Sepeti temizle' : '🗑 Clear cart'}
              </button>
            </div>

            {/* SAĞ — ÖZET */}
            <div className="h-fit sticky top-24">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-base font-bold text-gray-900 mb-6">
                  {tr ? 'Sipariş Özeti' : 'Order Summary'}
                </h2>

                <div className="space-y-3 mb-6">
                  {items.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-500 truncate mr-2">{item.name}</span>
                      <span className="font-semibold text-gray-800 shrink-0">${item.lineTotal}</span>
                    </div>
                  ))}
                  <div className="border-t border-gray-100 pt-3 flex justify-between text-sm">
                    <span className="text-gray-500">{tr ? 'Ara toplam' : 'Subtotal'}</span>
                    <span className="font-semibold">${totalPrice()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{tr ? 'Vergi (%8)' : 'Tax (8%)'}</span>
                    <span className="font-semibold">${tax}</span>
                  </div>
                  <div className="border-t border-gray-100 pt-3 flex justify-between">
                    <span className="font-bold text-gray-900">{tr ? 'Toplam' : 'Total'}</span>
                    <span className="text-2xl font-extrabold text-[#0f3460]">${grand}</span>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-xl p-3 mb-6 text-xs text-blue-700">
                  👥 {passengers.adult} {tr ? 'yetişkin' : 'adult'}
                  {passengers.child > 0 && `, ${passengers.child} ${tr ? 'çocuk' : 'child'}`}
                </div>

                <Link href="/booking"
                  className="block w-full py-4 bg-[#0f3460] text-white font-bold rounded-2xl text-center hover:bg-[#0a1628] transition-all shadow-lg hover:shadow-xl hover:scale-105 text-base">
                  {tr ? 'Rezervasyonu Tamamla →' : 'Complete Reservation →'}
                </Link>

                <Link href="/packages"
                  className="block w-full py-3 text-center text-sm text-gray-500 hover:text-gray-700 mt-3 transition-colors">
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