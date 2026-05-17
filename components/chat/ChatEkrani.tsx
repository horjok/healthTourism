'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { PipelineSonucu } from '@/lib/types';
import { useDoviz } from '@/lib/DovizContext';
import TurkeyFlightLoader from './TurkeyFlightLoader';

interface ChatEkraniProps {
  isOpen: boolean;
  onClose: () => void;
}

type Adim = 1 | 2 | 3 | 'sonuc' | 'hata';

const TARIH_SECENEKLERI = [
  { etiket: '1 Ay İçinde', ay: 1 },
  { etiket: '3 Ay İçinde', ay: 3 },
  { etiket: '6 Ay İçinde', ay: 6 },
  { etiket: 'Tarih Esnek',  ay: 0 },
];

// EUR bazlı slider sınırları — görüntü kur ile çarpılır
const SLIDER_MIN_EUR  = 500;
const SLIDER_MAX_EUR  = 15_000;
const SLIDER_ADIM_EUR = 100;

// ─── Adım Göstergesi ─────────────────────────────────────────────────────────

function AdimGostergesi({ aktif }: { aktif: 1 | 2 | 3 }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {([1, 2, 3] as const).map((n) => (
        <div key={n} className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
            n < aktif  ? 'bg-green-500 text-white'  :
            n === aktif ? 'bg-[#0f3460] text-white' :
            'bg-gray-100 text-gray-400'
          }`}>
            {n < aktif ? '✓' : n}
          </div>
          {n < 3 && (
            <div className={`h-0.5 w-8 rounded-full ${n < aktif ? 'bg-green-400' : 'bg-gray-100'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Ana Bileşen ─────────────────────────────────────────────────────────────

export default function ChatEkrani({ isOpen, onClose }: ChatEkraniProps) {
  const router = useRouter();
  const { sembol, kur, para } = useDoviz();

  const [adim, setAdim]               = useState<Adim>(1);
  const [sikayet, setSikayet]         = useState('');
  const [butceEur, setButceEur]       = useState(3000);   // daima EUR cinsinden
  const [butceEsnek, setButceEsnek]   = useState(false);
  const [tarihSecim, setTarihSecim]   = useState('');
  const [sonuc, setSonuc]             = useState<PipelineSonucu | null>(null);
  const [yukleniyor, setYukleniyor]   = useState(false);
  const [dinliyor, setDinliyor]       = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tanimaRef = useRef<any>(null);

  function kapat() {
    onClose();
    setTimeout(() => {
      setAdim(1); setSikayet(''); setButceEur(3000); setButceEsnek(false);
      setTarihSecim(''); setSonuc(null); setYukleniyor(false);
      tanimaRef.current?.stop(); setDinliyor(false);
    }, 300);
  }

  // Web Speech API — sadece istemci tarafında, TR dil modeli
  function mikrofon() {
    if (typeof window === 'undefined') return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
    if (!SR) return;
    if (dinliyor) { tanimaRef.current?.stop(); setDinliyor(false); return; }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const r: any = new SR();
    r.lang = 'tr-TR'; r.continuous = false; r.interimResults = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    r.onresult = (e: any) =>
      setSikayet(p => `${p} ${e.results[0][0].transcript}`.trim().slice(0, 300));
    r.onend = () => setDinliyor(false);
    r.start();
    tanimaRef.current = r;
    setDinliyor(true);
  }

  async function analizEt() {
    if (!sikayet.trim() || !tarihSecim) return;
    setYukleniyor(true);
    const secim = TARIH_SECENEKLERI.find(t => t.etiket === tarihSecim);
    const tarih = secim?.ay
      ? (() => { const d = new Date(); d.setMonth(d.getMonth() + secim.ay); return d.toISOString().split('T')[0]; })()
      : undefined;
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mesaj: sikayet, butce: butceEsnek ? undefined : butceEur, tarih }),
      });
      const json = await res.json();
      if (json.success) { setSonuc(json.data as PipelineSonucu); setAdim('sonuc'); }
      else setAdim('hata');
    } catch { setAdim('hata'); }
    finally { setYukleniyor(false); }
  }

  function paketlereGit() {
    if (!sonuc) return;
    kapat();
    router.push(`/packages?uzmanlik=${encodeURIComponent(sonuc.uzmanlik_alani)}`);
  }

  // Slider değerleri — EUR baz, kur ile lokalleştir
  const butceLokale = Math.round(butceEur * kur);
  const sliderMin   = Math.round(SLIDER_MIN_EUR  * kur);
  const sliderMax   = Math.round(SLIDER_MAX_EUR  * kur);
  const sliderAdim  = Math.max(1, Math.round(SLIDER_ADIM_EUR * kur));

  // ─── İçerik: adıma göre render ─────────────────────────────────────────────

  function icerik() {

    if (yukleniyor) return <TurkeyFlightLoader />;

    if (adim === 'hata') {
      return (
        <div className="flex flex-col gap-4 flex-1">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
            <p className="text-red-600 font-semibold text-sm">⚠ Analiz yapılamadı</p>
            <p className="text-red-500 text-xs mt-1">Şu an analiz yapılamıyor, lütfen tekrar deneyin.</p>
          </div>
          <button onClick={() => setAdim(1)} className="text-sm text-[#0f3460] font-semibold hover:underline">
            ← Başa dön
          </button>
        </div>
      );
    }

    if (adim === 'sonuc' && sonuc) {
      const ilkPaket = sonuc.onerilen_paketler[0];
      return (
        <div className="flex flex-col gap-4 flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 rounded-2xl p-4">
              <p className="text-xs text-blue-500 font-semibold uppercase tracking-wide mb-1">Uzmanlık</p>
              <p className="text-[#0f3460] font-bold capitalize">{sonuc.uzmanlik_alani}</p>
            </div>
            <div className="bg-purple-50 rounded-2xl p-4">
              <p className="text-xs text-purple-500 font-semibold uppercase tracking-wide mb-1">Güvenilirlik</p>
              <p className="text-purple-700 font-bold">%{sonuc.guvenilirlik_skoru}</p>
            </div>
            {ilkPaket && (
              <>
                <div className="bg-green-50 rounded-2xl p-4">
                  <p className="text-xs text-green-500 font-semibold uppercase tracking-wide mb-1">Önerilen Klinik</p>
                  <p className="text-green-700 font-bold text-sm leading-snug">{ilkPaket.klinik_isim}</p>
                </div>
                <div className="bg-amber-50 rounded-2xl p-4">
                  <p className="text-xs text-amber-500 font-semibold uppercase tracking-wide mb-1">Tahmini Maliyet</p>
                  <p className="text-amber-700 font-bold text-sm">{ilkPaket.tahmini_fiyat}</p>
                </div>
              </>
            )}
          </div>
          <div className="bg-gray-50 rounded-2xl p-4">
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">AI Değerlendirmesi</p>
            <p className="text-gray-700 text-sm leading-relaxed">{sonuc.oneri_ozeti}</p>
          </div>
          {sonuc.uyarilar.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 space-y-1">
              {sonuc.uyarilar.map((u, i) => <p key={i} className="text-yellow-700 text-xs">⚠ {u}</p>)}
            </div>
          )}
          <button onClick={paketlereGit}
            className="w-full py-3.5 bg-[#0f3460] text-white font-bold rounded-xl hover:bg-[#16213e] transition-colors mt-auto">
            Paketleri Gör →
          </button>
          <button onClick={() => { setAdim(1); setSonuc(null); }}
            className="text-sm text-center text-gray-400 hover:text-gray-600">
            Yeniden analiz et
          </button>
        </div>
      );
    }

    // ─── Adım 1: Şikayet + mikrofon + karakter sayacı ────────────────────────

    if (adim === 1) {
      const kalan = 300 - sikayet.length;
      return (
        <div className="flex flex-col gap-4 flex-1">
          <AdimGostergesi aktif={1} />
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Size nasıl yardımcı olabiliriz?
            </label>
            <div className="relative">
              <textarea
                rows={4}
                maxLength={300}
                placeholder="ör. Sağlık durumunuzu ve beklentilerinizi paylaşın — diş tedavisi, göz ameliyatı, estetik müdahale veya check-up için size özel paket bulalım."
                value={sikayet}
                onChange={(e) => setSikayet(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-12 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0f3460]/30"
              />
              {/* Mikrofon: kırmızı+pulse = aktif kayıt, gri = pasif */}
              <button
                type="button"
                onClick={mikrofon}
                title={dinliyor ? 'Kaydı durdur' : 'Sesle gir (Türkçe)'}
                className={`absolute right-3 bottom-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  dinliyor
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-gray-100 text-gray-500 hover:bg-[#0f3460] hover:text-white'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-7a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>
            </div>
            {/* Karakter sayacı — 50 altında kırmızıya döner */}
            <div className="flex justify-end mt-1">
              <span className={`text-xs font-medium ${kalan < 50 ? 'text-red-400' : 'text-gray-400'}`}>
                {sikayet.length}/300
              </span>
            </div>
          </div>
          <button
            onClick={() => setAdim(2)}
            disabled={!sikayet.trim()}
            className="w-full py-3 bg-[#0f3460] text-white font-semibold rounded-xl hover:bg-[#16213e] transition-colors disabled:opacity-40 disabled:cursor-not-allowed mt-auto"
          >
            İleri →
          </button>
        </div>
      );
    }

    // ─── Adım 2: Range slider + Bütçem Esnek toggle ──────────────────────────

    if (adim === 2) {
      return (
        <div className="flex flex-col gap-5 flex-1">
          <AdimGostergesi aktif={2} />
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-semibold text-gray-700">
                Bütçeniz ne kadar? ({para})
              </label>
              {/* Esnek bütçe pill toggle */}
              <button
                onClick={() => setButceEsnek(v => !v)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                  butceEsnek
                    ? 'bg-[#0f3460] text-white border-[#0f3460]'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-[#0f3460]/50'
                }`}
              >
                {butceEsnek ? '✓ Bütçem Esnek' : 'Bütçem Esnek'}
              </button>
            </div>

            {butceEsnek ? (
              <div className="bg-blue-50 rounded-2xl p-5 text-center">
                <p className="text-2xl mb-1">🎯</p>
                <p className="text-[#0f3460] font-semibold text-sm">Bütçe kısıtı uygulanmayacak</p>
                <p className="text-blue-400 text-xs mt-1">En iyi seçenekler kalite puanına göre sıralanacak</p>
              </div>
            ) : (
              <>
                {/* Büyük bütçe göstergesi */}
                <div className="text-center mb-5">
                  <span className="text-4xl font-extrabold text-[#0f3460]">
                    {butceLokale.toLocaleString('tr-TR')}
                  </span>
                  <span className="text-xl font-bold text-[#0f3460] ml-1">{sembol}</span>
                </div>
                {/* Range slider */}
                <input
                  type="range"
                  min={sliderMin}
                  max={sliderMax}
                  step={sliderAdim}
                  value={butceLokale}
                  onChange={e => setButceEur(Math.round(Number(e.target.value) / kur))}
                  className="w-full cursor-pointer accent-[#0f3460]"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1.5">
                  <span>{sliderMin.toLocaleString('tr-TR')}{sembol}</span>
                  <span>{sliderMax.toLocaleString('tr-TR')}{sembol}</span>
                </div>
              </>
            )}
          </div>
          <div className="flex gap-3 mt-auto">
            <button onClick={() => setAdim(1)}
              className="flex-1 py-3 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors">
              ← Geri
            </button>
            <button onClick={() => setAdim(3)}
              className="flex-1 py-3 bg-[#0f3460] text-white font-semibold rounded-xl hover:bg-[#16213e] transition-colors">
              İleri →
            </button>
          </div>
        </div>
      );
    }

    // ─── Adım 3: Tarih pill butonları ────────────────────────────────────────

    return (
      <div className="flex flex-col gap-5 flex-1">
        <AdimGostergesi aktif={3} />
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Ne zaman gelmek istiyorsunuz?
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {TARIH_SECENEKLERI.map(({ etiket }) => (
              <button
                key={etiket}
                onClick={() => setTarihSecim(etiket)}
                className={`py-3.5 px-4 rounded-2xl text-sm font-semibold border transition-all ${
                  tarihSecim === etiket
                    ? 'bg-[#0f3460] text-white border-[#0f3460] scale-[1.02]'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-[#0f3460]/40 hover:bg-blue-50'
                }`}
              >
                {etiket}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-3 mt-auto">
          <button onClick={() => setAdim(2)}
            className="flex-1 py-3 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors">
            ← Geri
          </button>
          <button
            onClick={analizEt}
            disabled={!tarihSecim || yukleniyor}
            className="flex-1 py-3 bg-[#0f3460] text-white font-semibold rounded-xl hover:bg-[#16213e] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Analiz Et ✨
          </button>
        </div>
      </div>
    );
  }

  // ─── Panel ───────────────────────────────────────────────────────────────

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-x-0 bottom-0 z-40 bg-black/40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        style={{ top: '64px' }}
        onClick={kapat}
      />

      {/* Sağdan kayan drawer */}
      <div
        className={`fixed right-0 bottom-0 w-full max-w-md z-50 bg-white shadow-2xl flex flex-col
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ top: '64px' }}
      >
        {/* Başlık */}
        <div
          className="flex items-center justify-between px-6 py-5 shrink-0"
          style={{ background: 'linear-gradient(135deg, #0f3460, #16213e)' }}
        >
          <div>
            <h2 className="text-white font-bold text-lg">✨ AI ile Paket Bul</h2>
            <p className="text-blue-200 text-xs mt-0.5">3 adımda kişisel öneri al</p>
          </div>
          <button
            onClick={kapat}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Kapat"
          >
            ✕
          </button>
        </div>

        {/* İçerik */}
        <div className="flex flex-col flex-1 px-6 py-6 overflow-y-auto min-h-0">
          {icerik()}
        </div>
      </div>
    </>
  );
}
