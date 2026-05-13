'use client';

import { useState } from 'react';
import { processMockPayment } from '@/lib/mock-payment';

interface MockOdemeFormuProps {
  tutar: number;
  onSuccess: (islemId: string) => void;
  onError: () => void;
}

// Kart numarasını "XXXX XXXX XXXX XXXX" formatına çevirir
function kartNoFormatla(ham: string): string {
  const sadece = ham.replace(/\D/g, '').slice(0, 16);
  return sadece.replace(/(.{4})(?=.)/g, '$1 ');
}

// Son kullanma tarihini "MM/YY" formatına çevirir
function sonKullanmaFormatla(ham: string): string {
  const sadece = ham.replace(/\D/g, '').slice(0, 4);
  if (sadece.length >= 3) return `${sadece.slice(0, 2)}/${sadece.slice(2)}`;
  return sadece;
}

export default function MockOdemeFormu({ tutar, onSuccess, onError }: MockOdemeFormuProps) {
  // Görsel form alanları — doğrulama yok, sadece gösteriş
  const [kartAdi, setKartAdi]           = useState('');
  const [kartNo, setKartNo]             = useState('');
  const [sonKullanma, setSonKullanma]   = useState('');
  const [cvv, setCvv]                   = useState('');

  const [isleniyor, setIsleniyor]       = useState(false);

  async function odemeYap() {
    setIsleniyor(true);
    try {
      const sonuc = await processMockPayment(tutar);
      onSuccess(sonuc.islem_id);
    } catch {
      onError();
    } finally {
      setIsleniyor(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Tutar bandı */}
      <div
        className="px-6 py-5 text-center"
        style={{ background: 'linear-gradient(135deg, #0f3460, #16213e)' }}
      >
        <p className="text-blue-200 text-sm font-medium mb-1">Ödenecek Tutar</p>
        <p className="text-4xl font-extrabold text-white">
          €{tutar.toLocaleString('tr-TR')}
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
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0f3460]/30 focus:border-[#0f3460] bg-white uppercase disabled:opacity-50"
          />
        </div>

        {/* Kart numarası */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
            Kart Numarası
          </label>
          <input
            type="text"
            inputMode="numeric"
            placeholder="1234 5678 9012 3456"
            value={kartNo}
            maxLength={19}
            disabled={isleniyor}
            onChange={(e) => setKartNo(kartNoFormatla(e.target.value))}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0f3460]/30 focus:border-[#0f3460] bg-white font-mono tracking-widest disabled:opacity-50"
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
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0f3460]/30 focus:border-[#0f3460] bg-white font-mono disabled:opacity-50"
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
              maxLength={3}
              disabled={isleniyor}
              onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0f3460]/30 focus:border-[#0f3460] bg-white font-mono disabled:opacity-50"
            />
          </div>
        </div>

        {/* Ödeme butonu */}
        <button
          type="button"
          onClick={odemeYap}
          disabled={isleniyor}
          className="w-full mt-2 py-4 bg-[#0f3460] text-white font-bold rounded-xl hover:bg-[#16213e] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-base"
        >
          {isleniyor ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>İşleniyor...</span>
            </>
          ) : (
            <>
              <span>🔒</span>
              <span>Ödemeyi Tamamla</span>
            </>
          )}
        </button>
      </div>

      {/* Alt uyarı */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 text-center">
        <p className="text-xs text-gray-500">
          🔒 Bu demo ortamıdır. Gerçek ödeme işlemi yapılmamaktadır.
        </p>
      </div>
    </div>
  );
}
