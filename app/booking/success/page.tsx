'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

// ─── Konfeti tanecikleri ───────────────────────────────────────────────────────

// Her tanecik için sabit rastgele değerler (hydration uyumsuzluğunu önler)
const KONFETI: { left: string; delay: string; dur: string; renk: string; dondur: string; boyut: string }[] = [
  { left: '5%',  delay: '0s',    dur: '2.8s', renk: '#f87171', dondur: '320deg', boyut: '8px'  },
  { left: '10%', delay: '0.3s',  dur: '3.1s', renk: '#60a5fa', dondur: '240deg', boyut: '6px'  },
  { left: '18%', delay: '0.1s',  dur: '2.5s', renk: '#34d399', dondur: '180deg', boyut: '10px' },
  { left: '25%', delay: '0.5s',  dur: '3.4s', renk: '#fbbf24', dondur: '400deg', boyut: '7px'  },
  { left: '32%', delay: '0.2s',  dur: '2.9s', renk: '#a78bfa', dondur: '260deg', boyut: '9px'  },
  { left: '40%', delay: '0.7s',  dur: '3.2s', renk: '#f472b6', dondur: '200deg', boyut: '6px'  },
  { left: '48%', delay: '0s',    dur: '2.6s', renk: '#38bdf8', dondur: '340deg', boyut: '8px'  },
  { left: '55%', delay: '0.4s',  dur: '3.0s', renk: '#fb923c', dondur: '280deg', boyut: '7px'  },
  { left: '63%', delay: '0.15s', dur: '2.7s', renk: '#4ade80', dondur: '220deg', boyut: '10px' },
  { left: '70%', delay: '0.6s',  dur: '3.3s', renk: '#f87171', dondur: '160deg', boyut: '6px'  },
  { left: '78%', delay: '0.25s', dur: '2.8s', renk: '#818cf8', dondur: '380deg', boyut: '8px'  },
  { left: '85%', delay: '0.45s', dur: '3.1s', renk: '#fcd34d', dondur: '300deg', boyut: '9px'  },
  { left: '92%', delay: '0.1s',  dur: '2.5s', renk: '#2dd4bf', dondur: '240deg', boyut: '7px'  },
  { left: '15%', delay: '0.8s',  dur: '3.5s', renk: '#c084fc', dondur: '420deg', boyut: '6px'  },
  { left: '37%', delay: '0.55s', dur: '3.0s', renk: '#fb7185', dondur: '200deg', boyut: '8px'  },
  { left: '58%', delay: '0.35s', dur: '2.9s', renk: '#facc15', dondur: '260deg', boyut: '10px' },
  { left: '75%', delay: '0.65s', dur: '3.2s', renk: '#34d399', dondur: '180deg', boyut: '7px'  },
  { left: '90%', delay: '0.2s',  dur: '2.6s', renk: '#60a5fa', dondur: '320deg', boyut: '9px'  },
];

function Konfeti() {
  return (
    <>
      <style>{`
        @keyframes konfeti-dus {
          0% {
            transform: translateY(-20px) rotate(0deg);
            opacity: 1;
          }
          80% {
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(var(--dondur));
            opacity: 0;
          }
        }
        .konfeti-tanek {
          position: fixed;
          top: -10px;
          border-radius: 2px;
          animation: konfeti-dus var(--dur) var(--delay) ease-in both;
          pointer-events: none;
          z-index: 50;
        }
      `}</style>

      {KONFETI.map((t, i) => (
        <span
          key={i}
          className="konfeti-tanek"
          style={{
            left: t.left,
            width: t.boyut,
            height: t.boyut,
            backgroundColor: t.renk,
            '--dur': t.dur,
            '--delay': t.delay,
            '--dondur': t.dondur,
          } as React.CSSProperties}
        />
      ))}
    </>
  );
}

// ─── Sayfa içeriği ─────────────────────────────────────────────────────────────

function BasariIcerigi() {
  const searchParams = useSearchParams();
  const islemId = searchParams.get('id') ?? '';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-16 text-center">
      <Konfeti />

      {/* Yeşil tik */}
      <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-6 relative z-10">
        <svg
          className="w-12 h-12 text-green-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      {/* Başlık */}
      <h1 className="text-3xl font-extrabold text-gray-900 mb-2 relative z-10">
        Rezervasyonunuz Alındı!
      </h1>
      <p className="text-gray-500 mb-8 max-w-xs relative z-10">
        Rezervasyonunuz başarıyla oluşturuldu. İyi sağlıklar dileriz!
      </p>

      {/* İşlem no kartı */}
      {islemId && (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm px-8 py-5 mb-8 relative z-10">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            İşlem No
          </p>
          <p className="text-base font-mono font-bold text-[#0f3460] break-all">
            {islemId}
          </p>
        </div>
      )}

      {/* Butonlar */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs relative z-10">
        <Link
          href="/profile"
          className="flex-1 text-center px-6 py-3.5 bg-[#0f3460] text-white font-bold rounded-xl hover:bg-[#16213e] transition-colors"
        >
          Rezervasyonlarıma Git
        </Link>
        <Link
          href="/"
          className="flex-1 text-center px-6 py-3.5 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
        >
          Ana Sayfaya Dön
        </Link>
      </div>
    </div>
  );
}

// ─── Sayfa (Suspense sarmalayıcı) ─────────────────────────────────────────────

export default function BasariSayfasi() {
  return (
    <main className="min-h-screen bg-gray-50 overflow-hidden">
      <Suspense
        fallback={
          <div className="flex justify-center items-center min-h-screen">
            <div className="w-10 h-10 border-4 border-[#0f3460] border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <BasariIcerigi />
      </Suspense>
    </main>
  );
}
