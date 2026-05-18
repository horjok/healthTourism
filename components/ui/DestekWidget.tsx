'use client';

import { useState } from 'react';

type Adim = 'kapali' | 'form' | 'basarili';

interface FormHata {
  konu?: string;
  mesaj?: string;
}

function validasyonYap(konu: string, mesaj: string): FormHata {
  const h: FormHata = {};
  if (!konu.trim()) h.konu = 'Konu zorunludur.';
  else if (konu.trim().length < 5) h.konu = 'En az 5 karakter girin.';
  else if (konu.trim().length > 120) h.konu = 'En fazla 120 karakter olabilir.';

  if (!mesaj.trim()) h.mesaj = 'Mesaj zorunludur.';
  else if (mesaj.trim().length < 10) h.mesaj = 'En az 10 karakter girin.';
  else if (mesaj.trim().length > 2000) h.mesaj = 'En fazla 2000 karakter olabilir.';
  return h;
}

function HataYazisi({ mesaj }: { mesaj?: string }) {
  if (!mesaj) return null;
  return <p className="text-xs text-red-500 mt-1">{mesaj}</p>;
}

export default function DestekWidget({ chatAcik = false }: { chatAcik?: boolean }) {
  const [adim, setAdim]       = useState<Adim>('kapali');
  const [konu, setKonu]       = useState('');
  const [mesaj, setMesaj]     = useState('');
  const [hatalar, setHatalar] = useState<FormHata>({});
  const [gonderiyor, setGonderiyor] = useState(false);
  const [sunucuHata, setSunucuHata] = useState('');

  function sifirla() {
    setKonu(''); setMesaj(''); setHatalar({}); setSunucuHata('');
  }

  async function gonder(e: React.FormEvent) {
    e.preventDefault();
    const h = validasyonYap(konu, mesaj);
    if (Object.keys(h).length > 0) { setHatalar(h); return; }

    setGonderiyor(true);
    setSunucuHata('');
    try {
      const r = await fetch('/api/user/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ konu, mesaj }),
      });
      const json = await r.json();
      if (json.success) {
        setAdim('basarili');
        sifirla();
      } else {
        setSunucuHata(json.error ?? 'Bir hata oluştu, lütfen tekrar deneyin.');
      }
    } catch {
      setSunucuHata('Bağlantı hatası. Lütfen tekrar deneyin.');
    } finally {
      setGonderiyor(false);
    }
  }

  return (
    <div
      className="fixed bottom-6 z-50 flex flex-col items-end gap-3 transition-[right] duration-300 ease-in-out"
      style={{ right: chatAcik ? 'calc(28rem + 1.5rem)' : '1.5rem' }}
    >

      {/* Form paneli */}
      {(adim === 'form' || adim === 'basarili') && (
        <div className="w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">

          {/* Başlık */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#0f3460]">
            <p className="text-white font-semibold text-sm">Destek Talebi</p>
            <button
              onClick={() => { setAdim('kapali'); sifirla(); }}
              className="text-white/70 hover:text-white text-lg leading-none"
            >
              &times;
            </button>
          </div>

          {adim === 'basarili' ? (
            <div className="p-6 text-center">
              <p className="text-3xl mb-3">✅</p>
              <p className="font-semibold text-gray-900 mb-1">Talebiniz Alındı!</p>
              <p className="text-sm text-gray-500 mb-4">En kısa sürede ekibimiz yanıt verecektir.</p>
              <button
                onClick={() => { setAdim('form'); }}
                className="text-sm text-[#0f3460] hover:underline font-medium"
              >
                Yeni Talep Oluştur
              </button>
            </div>
          ) : (
            <form onSubmit={gonder} noValidate className="p-4 space-y-3">
              {sunucuHata && (
                <div className="text-xs bg-red-50 text-red-600 rounded-lg px-3 py-2 border border-red-100">
                  {sunucuHata}
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Konu</label>
                <input
                  type="text"
                  value={konu}
                  onChange={(e) => { setKonu(e.target.value); setHatalar((h) => ({ ...h, konu: undefined })); }}
                  placeholder="Örn: Rezervasyon iptal sorunu"
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f3460]/30 ${
                    hatalar.konu ? 'border-red-400' : 'border-gray-200'
                  }`}
                />
                <HataYazisi mesaj={hatalar.konu} />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Mesaj</label>
                <textarea
                  value={mesaj}
                  onChange={(e) => { setMesaj(e.target.value); setHatalar((h) => ({ ...h, mesaj: undefined })); }}
                  placeholder="Sorununuzu detaylıca açıklayın..."
                  rows={4}
                  className={`w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0f3460]/30 ${
                    hatalar.mesaj ? 'border-red-400' : 'border-gray-200'
                  }`}
                />
                <div className="flex justify-between items-start mt-0.5">
                  <HataYazisi mesaj={hatalar.mesaj} />
                  <span className="text-xs text-gray-400 ml-auto">{mesaj.length}/2000</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={gonderiyor}
                className="w-full py-2.5 bg-[#0f3460] text-white text-sm font-semibold rounded-lg hover:bg-[#16213e] disabled:opacity-50 transition-colors"
              >
                {gonderiyor ? 'Gönderiliyor...' : 'Talep Gönder'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* FAB butonu */}
      <button
        onClick={() => setAdim(adim === 'kapali' ? 'form' : 'kapali')}
        className="w-14 h-14 rounded-full bg-[#0f3460] text-white shadow-xl hover:bg-[#16213e] transition-colors flex items-center justify-center text-2xl"
        aria-label="Destek Talebi Oluştur"
      >
        {adim !== 'kapali' ? '×' : '💬'}
      </button>
    </div>
  );
}
