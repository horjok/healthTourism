'use client';

import { useState } from 'react';
import { processMockPayment } from '@/lib/mock-payment';
import type { CartItem } from '@/lib/cartStore';

interface MockOdemeFormuProps {
  tutar: number;
  tarih: string;
  items: CartItem[];
  onSuccess: (islemId: string) => void;
  onError: () => void;
}

// "XXXX XXXX XXXX XXXX" formatı
function kartNoFormatla(ham: string): string {
  const sadece = ham.replace(/\D/g, '').slice(0, 16);
  return sadece.replace(/(.{4})(?=.)/g, '$1 ');
}

// "AA/YY" formatı
function sonKullanmaFormatla(ham: string): string {
  const sadece = ham.replace(/\D/g, '').slice(0, 4);
  if (sadece.length >= 3) return `${sadece.slice(0, 2)}/${sadece.slice(2)}`;
  return sadece;
}

// Kart ağını kart numarasının ilk rakamına göre tahmin eder
function kartAgiTespit(no: string): string {
  const ilkIki = no.replace(/\D/g, '').slice(0, 2);
  if (no.startsWith('4')) return 'VISA';
  if (['51','52','53','54','55'].includes(ilkIki)) return 'MC';
  if (['34','37'].includes(ilkIki)) return 'AMEX';
  return '';
}

async function konfetiFirlat() {
  const confetti = (await import('canvas-confetti')).default;
  confetti({
    particleCount: 160,
    spread: 80,
    origin: { y: 0.6 },
    colors: ['#0f3460', '#16213e', '#60a5fa', '#34d399', '#fbbf24', '#f472b6'],
  });
  // İkinci dalga — biraz gecikmeli
  setTimeout(() => {
    confetti({ particleCount: 80, angle: 60, spread: 55, origin: { x: 0 } });
    confetti({ particleCount: 80, angle: 120, spread: 55, origin: { x: 1 } });
  }, 300);
}

export default function MockOdemeFormu({ tutar, tarih, items, onSuccess, onError }: MockOdemeFormuProps) {
  const [kartAdi, setKartAdi]         = useState('');
  const [kartNo, setKartNo]           = useState('');
  const [sonKullanma, setSonKullanma] = useState('');
  const [cvv, setCvv]                 = useState('');

  const [isleniyor, setIsleniyor] = useState(false);
  const [asamaMesaj, setAsamaMesaj] = useState('');

  async function odemeYap() {
    setIsleniyor(true);
    try {
      // 1 — 2 saniyelik mock gecikme
      setAsamaMesaj('Ödeme İşleniyor...');
      const sonuc = await processMockPayment(tutar);

      // 2 — Supabase'e rezervasyonları kaydet
      setAsamaMesaj('Rezervasyon Oluşturuluyor...');
      await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, tarih, islem_id: sonuc.islem_id }),
      });

      // 3 — Konfeti + kısa animasyon süresi
      setAsamaMesaj('Tamamlandı! 🎉');
      await konfetiFirlat();
      await new Promise<void>((r) => setTimeout(r, 800));

      onSuccess(sonuc.islem_id);
    } catch {
      onError();
    } finally {
      setIsleniyor(false);
      setAsamaMesaj('');
    }
  }

  const ag = kartAgiTespit(kartNo);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

      {/* Tutar bandı */}
      <div
        className="px-6 py-5 text-center relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f3460, #16213e)' }}
      >
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #60a5fa 0%, transparent 60%), radial-gradient(circle at 80% 20%, #a78bfa 0%, transparent 50%)' }}
        />
        <p className="text-blue-200 text-sm font-medium mb-1 relative z-10">Ödenecek Tutar</p>
        <p className="text-4xl font-extrabold text-white relative z-10">
          €{tutar.toLocaleString('tr-TR')}
        </p>
        <p className="text-blue-300 text-xs mt-1 relative z-10">
          {items.length} hizmet · {tarih}
        </p>
      </div>

      {/* Kart formu */}
      <div className="px-6 py-6 space-y-4">

        {/* Kart üzerindeki isim */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
            Kart Üzerindeki İsim
          </label>
          <input
            type="text"
            placeholder="AD SOYAD"
            value={kartAdi}
            maxLength={60}
            disabled={isleniyor}
            onChange={(e) => setKartAdi(e.target.value.toLocaleUpperCase('tr-TR'))}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0f3460]/30 focus:border-[#0f3460] uppercase disabled:opacity-50 disabled:bg-gray-50"
          />
        </div>

        {/* Kart numarası + ağ rozeti */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
              Kart Numarası
            </label>
            {ag && (
              <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                {ag}
              </span>
            )}
          </div>
          <input
            type="text"
            inputMode="numeric"
            placeholder="1234 5678 9012 3456"
            value={kartNo}
            maxLength={19}
            disabled={isleniyor}
            onChange={(e) => setKartNo(kartNoFormatla(e.target.value))}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0f3460]/30 focus:border-[#0f3460] font-mono tracking-widest disabled:opacity-50 disabled:bg-gray-50"
          />
        </div>

        {/* Son kullanma + CVV */}
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
              Son Kullanma
            </label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="AA/YY"
              value={sonKullanma}
              maxLength={5}
              disabled={isleniyor}
              onChange={(e) => setSonKullanma(sonKullanmaFormatla(e.target.value))}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0f3460]/30 font-mono disabled:opacity-50 disabled:bg-gray-50"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
              CVV
            </label>
            <input
              type="password"
              inputMode="numeric"
              placeholder="•••"
              value={cvv}
              maxLength={4}
              disabled={isleniyor}
              onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0f3460]/30 font-mono disabled:opacity-50 disabled:bg-gray-50"
            />
          </div>
        </div>

        {/* Ödeme butonu */}
        <button
          type="button"
          onClick={odemeYap}
          disabled={isleniyor}
          className="w-full mt-2 py-4 bg-[#0f3460] text-white font-bold rounded-xl hover:bg-[#16213e] transition-colors disabled:opacity-80 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-base"
        >
          {isleniyor ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
              <span>{asamaMesaj}</span>
            </>
          ) : (
            <>
              <span>🔒</span>
              <span>Ödemeyi Tamamla — €{tutar.toLocaleString('tr-TR')}</span>
            </>
          )}
        </button>

        {/* Kabul edilen kartlar */}
        <div className="flex items-center justify-center gap-3 pt-1">
          {['VISA', 'MC', 'AMEX', 'TROY'].map((k) => (
            <span key={k} className="text-[10px] font-bold text-gray-400 border border-gray-200 rounded px-1.5 py-0.5">
              {k}
            </span>
          ))}
        </div>
      </div>

      {/* Alt güvenlik uyarısı */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-center gap-2">
        <span className="text-gray-400 text-xs">🔒</span>
        <p className="text-xs text-gray-400">
          256-bit SSL şifrelemesi — Demo ortamı, gerçek ödeme yapılmaz.
        </p>
      </div>
    </div>
  );
}
