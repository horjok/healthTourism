'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { PipelineSonucu } from '@/lib/types';
import { useDoviz } from '@/lib/DovizContext';
import { useChatContext } from '@/components/ui/ChatProvider';
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
  const { onAcilMesaj, setOnAcilMesaj } = useChatContext();

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

  // Panel'den gelen ön-dolu mesajı uygula: adım 1'i atla, adım 2'den başla
  useEffect(() => {
    if (!isOpen || !onAcilMesaj) return;
    setSikayet(onAcilMesaj);
    setAdim(2);
    setOnAcilMesaj('');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

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
      const paketVar = sonuc.onerilen_paketler.length > 0;
      return (
        <div className="flex flex-col gap-4 flex-1 overflow-y-auto">

          {/* AI özet metni */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">✨</span>
              <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide">AI Değerlendirmesi</p>
              <span className="ml-auto text-xs bg-white text-purple-600 font-bold px-2 py-0.5 rounded-full border border-purple-100">
                %{sonuc.guvenilirlik_skoru} güvenilir
              </span>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed">{sonuc.oneri_ozeti}</p>
          </div>

          {/* Uyarılar */}
          {sonuc.uyarilar.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-3 space-y-1">
              {sonuc.uyarilar.map((u, i) => <p key={i} className="text-yellow-700 text-xs">⚠ {u}</p>)}
            </div>
          )}

          {/* Paket kartları */}
          {paketVar ? (
            <div className="flex flex-col gap-3">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">
                Önerilen Paketler ({sonuc.onerilen_paketler.length})
              </p>
              {sonuc.onerilen_paketler.map((p, idx) => (
                <div
                  key={p.paket_id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                >
                  {/* Kart başlığı */}
                  <div className="flex items-center gap-2 px-4 pt-3 pb-2">
                    <span className="w-5 h-5 rounded-full bg-[#0f3460] text-white text-xs font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <p className="text-sm font-bold text-gray-900 leading-tight flex-1">{p.baslik}</p>
                  </div>

                  {/* Meta bilgiler */}
                  <div className="flex items-center gap-3 px-4 pb-2 text-xs text-gray-500 flex-wrap">
                    <span>📍 {p.sehir}</span>
                    <span>🏥 {p.klinik_isim}</span>
                    <span>📅 {p.sure_gun} gün</span>
                  </div>

                  {/* Avantaj etiketleri */}
                  <div className="flex flex-wrap gap-1.5 px-4 pb-3">
                    {p.avantajlar.map((a, i) => (
                      <span key={i} className="bg-blue-50 text-[#0f3460] text-xs px-2 py-0.5 rounded-full border border-blue-100">
                        {a}
                      </span>
                    ))}
                  </div>

                  {/* Fiyat + inceleme butonu */}
                  <div className="flex items-center justify-between px-4 py-3 border-t border-gray-50 bg-gray-50/50">
                    <span className="text-lg font-extrabold text-[#0f3460]">{p.tahmini_fiyat}</span>
                    <button
                      onClick={() => { kapat(); router.push(`/packages/${p.paket_id}`); }}
                      className="text-xs font-bold px-4 py-2 bg-[#0f3460] text-white rounded-xl hover:bg-[#16213e] transition-colors"
                    >
                      İncele →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-2xl p-5 text-center text-sm text-gray-500">
              Kriterlere uygun paket bulunamadı. Bütçenizi yükseltmeyi veya şehir filtresini kaldırmayı deneyin.
            </div>
          )}

          <button onClick={() => { setAdim(1); setSonuc(null); }}
            className="text-sm text-center text-gray-400 hover:text-gray-600 mt-auto pt-1">
            ← Yeniden analiz et
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
