'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { PipelineSonucu } from '@/lib/types';

// ─── Tipler ───────────────────────────────────────────────────────────────────

interface ChatEkraniProps {
  isOpen: boolean;
  onClose: () => void;
}

type Adim = 1 | 2 | 3 | 'sonuc' | 'hata';

// ─── Yardımcı: ay ve yıl seçenekleri ─────────────────────────────────────────

const AYLAR = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
];

const buYil = new Date().getFullYear();
const YILLAR = Array.from({ length: 3 }, (_, i) => buYil + i);

// ─── Adım göstergesi ─────────────────────────────────────────────────────────

function AdimGostergesi({ aktif }: { aktif: 1 | 2 | 3 }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {([1, 2, 3] as const).map((n) => (
        <div key={n} className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
              n < aktif
                ? 'bg-green-500 text-white'
                : n === aktif
                ? 'bg-[#0f3460] text-white'
                : 'bg-gray-100 text-gray-400'
            }`}
          >
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

// ─── Ana bileşen ─────────────────────────────────────────────────────────────

export default function ChatEkrani({ isOpen, onClose }: ChatEkraniProps) {
  const router = useRouter();

  const [adim, setAdim]         = useState<Adim>(1);
  const [sikayet, setSikayet]   = useState('');
  const [butce, setButce]       = useState('');
  const [ay, setAy]             = useState('');
  const [yil, setYil]           = useState(String(buYil));
  const [sonuc, setSonuc]       = useState<PipelineSonucu | null>(null);
  const [yukleniyor, setYukleniyor] = useState(false);

  // Paneli sıfırlayarak kapat
  function kapat() {
    onClose();
    // Animasyon bittikten sonra sıfırla
    setTimeout(() => {
      setAdim(1);
      setSikayet('');
      setButce('');
      setAy('');
      setYil(String(buYil));
      setSonuc(null);
      setYukleniyor(false);
    }, 300);
  }

  async function analizEt() {
    if (!sikayet.trim() || !butce || !ay) return;
    setYukleniyor(true);

    // Tarih formatı: YYYY-AA-01
    const tarih = `${yil}-${String(AYLAR.indexOf(ay) + 1).padStart(2, '0')}-01`;

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mesaj: sikayet, butce: Number(butce), tarih }),
      });

      const json = await res.json();

      if (json.success) {
        setSonuc(json.data as PipelineSonucu);
        setAdim('sonuc');
      } else {
        setAdim('hata');
      }
    } catch {
      setAdim('hata');
    } finally {
      setYukleniyor(false);
    }
  }

  // Sonuç ekranından paketlere git
  function paketlereGit() {
    if (!sonuc) return;
    kapat();
    router.push(`/packages?uzmanlik=${encodeURIComponent(sonuc.uzmanlik_alani)}`);
  }

  // ─── İçerik: adıma göre render ─────────────────────────────────────────────

  function icerik() {
    if (yukleniyor) {
      return (
        <div className="flex flex-col items-center justify-center flex-1 gap-5 py-12">
          <div className="flex gap-2">
            {[0, 150, 300].map((delay) => (
              <span
                key={delay}
                className="w-3 h-3 bg-[#0f3460] rounded-full animate-bounce"
                style={{ animationDelay: `${delay}ms` }}
              />
            ))}
          </div>
          <p className="text-gray-500 text-sm font-medium">AI analiz ediyor...</p>
          <p className="text-gray-400 text-xs text-center max-w-xs">
            Klinikler karşılaştırılıyor, en uygun paket bulunuyor
          </p>
        </div>
      );
    }

    if (adim === 'hata') {
      return (
        <div className="flex flex-col gap-4 flex-1">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
            <p className="text-red-600 font-semibold text-sm">⚠ Analiz yapılamadı</p>
            <p className="text-red-500 text-xs mt-1">
              Şu an analiz yapılamıyor, lütfen tekrar deneyin.
            </p>
          </div>
          <button
            onClick={() => setAdim(1)}
            className="text-sm text-[#0f3460] font-semibold hover:underline"
          >
            ← Başa dön
          </button>
        </div>
      );
    }

    if (adim === 'sonuc' && sonuc) {
      const ilkPaket = sonuc.onerilen_paketler[0];

      return (
        <div className="flex flex-col gap-4 flex-1 overflow-y-auto">
          {/* Sonuç kartları */}
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

          {/* Tavsiye */}
          <div className="bg-gray-50 rounded-2xl p-4">
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">Güvenilirlik Tavsiyesi</p>
            <p className="text-gray-700 text-sm leading-relaxed">{sonuc.oneri_ozeti}</p>
          </div>

          {/* Uyarılar */}
          {sonuc.uyarilar.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 space-y-1">
              {sonuc.uyarilar.map((u, i) => (
                <p key={i} className="text-yellow-700 text-xs">⚠ {u}</p>
              ))}
            </div>
          )}

          {/* Paketleri Gör butonu */}
          <button
            onClick={paketlereGit}
            className="w-full py-3.5 bg-[#0f3460] text-white font-bold rounded-xl hover:bg-[#16213e] transition-colors mt-auto"
          >
            Paketleri Gör →
          </button>

          <button
            onClick={() => { setAdim(1); setSonuc(null); }}
            className="text-sm text-center text-gray-400 hover:text-gray-600"
          >
            Yeniden analiz et
          </button>
        </div>
      );
    }

    // ─── Adım 1: Şikayet ─────────────────────────────────────────────────────

    if (adim === 1) {
      return (
        <div className="flex flex-col gap-4 flex-1">
          <AdimGostergesi aktif={1} />
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Size nasıl yardımcı olabiliriz?
            </label>
            <textarea
              rows={4}
              placeholder="ör. Sağlık durumunuzu ve beklentilerinizi paylaşın — diş tedavisi, göz ameliyatı, estetik müdahale veya check-up için size özel paket bulalım."
              value={sikayet}
              onChange={(e) => setSikayet(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0f3460]/30"
            />
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

    // ─── Adım 2: Bütçe ───────────────────────────────────────────────────────

    if (adim === 2) {
      return (
        <div className="flex flex-col gap-4 flex-1">
          <AdimGostergesi aktif={2} />
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Bütçeniz ne kadar? (€)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">€</span>
              <input
                type="number"
                placeholder="ör. 3000"
                value={butce}
                onChange={(e) => setButce(e.target.value)}
                min={0}
                className="w-full border border-gray-200 rounded-xl pl-8 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f3460]/30"
              />
            </div>
            {/* Hızlı seçim */}
            <div className="flex gap-2 mt-3">
              {[1000, 2000, 3000, 5000].map((b) => (
                <button
                  key={b}
                  onClick={() => setButce(String(b))}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                    butce === String(b)
                      ? 'bg-[#0f3460] text-white border-[#0f3460]'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-[#0f3460]/40'
                  }`}
                >
                  {b.toLocaleString()}€
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 mt-auto">
            <button
              onClick={() => setAdim(1)}
              className="flex-1 py-3 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
            >
              ← Geri
            </button>
            <button
              onClick={() => setAdim(3)}
              disabled={!butce}
              className="flex-1 py-3 bg-[#0f3460] text-white font-semibold rounded-xl hover:bg-[#16213e] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              İleri →
            </button>
          </div>
        </div>
      );
    }

    // ─── Adım 3: Tarih ───────────────────────────────────────────────────────

    return (
      <div className="flex flex-col gap-4 flex-1">
        <AdimGostergesi aktif={3} />
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Ne zaman gelmek istiyorsunuz?
          </label>
          <div className="flex gap-3">
            <select
              value={ay}
              onChange={(e) => setAy(e.target.value)}
              className="flex-1 border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f3460]/30 bg-white"
            >
              <option value="">Ay seçin</option>
              {AYLAR.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
            <select
              value={yil}
              onChange={(e) => setYil(e.target.value)}
              className="w-28 border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f3460]/30 bg-white"
            >
              {YILLAR.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex gap-3 mt-auto">
          <button
            onClick={() => setAdim(2)}
            className="flex-1 py-3 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
          >
            ← Geri
          </button>
          <button
            onClick={analizEt}
            disabled={!ay || yukleniyor}
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
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={kapat}
      />

      {/* Sağdan kayan drawer — tüm ekran boyutlarında tutarlı */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-md z-50 bg-white shadow-2xl flex flex-col
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Başlık */}
        <div
          className="flex items-center justify-between px-6 py-5 shrink-0 sm:rounded-tl-3xl"
          style={{ background: 'linear-gradient(135deg, #0f3460, #16213e)' }}
        >
          <div>
            <h2 className="text-white font-bold text-lg">✨ AI ile Paket Bul</h2>
            <p className="text-blue-200 text-xs mt-0.5">
              3 adımda kişisel öneri al
            </p>
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
