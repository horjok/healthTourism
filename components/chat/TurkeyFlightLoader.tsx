'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useState } from 'react';

const MESAJLAR = [
  'Rotasyon hesaplanıyor...',
  'JCI onaylı klinikler taranıyor...',
  'Paketler karşılaştırılıyor...',
  'En uygun seçenekler sıralanıyor...',
  'Neredeyse hazır...',
];

const GUZERGAH = [
  { isim: 'İstanbul',  x: 20, y: 25 },
  { isim: 'Kocaeli',   x: 25, y: 27 },
  { isim: 'Sakarya',   x: 28, y: 28 },
  { isim: 'Bursa',     x: 23, y: 35 },
  { isim: 'İzmir',     x: 10, y: 55 },
  { isim: 'Antalya',   x: 32, y: 80 },
  { isim: 'Konya',     x: 45, y: 65 },
  { isim: 'Ankara',    x: 45, y: 40 },
  { isim: 'Adana',     x: 65, y: 75 },
  { isim: 'Gaziantep', x: 75, y: 75 },
];

const KEY_ROT = GUZERGAH.map((c, i) => {
  const next = GUZERGAH[(i + 1) % GUZERGAH.length];
  return Math.atan2(next.y - c.y, next.x - c.x) * (180 / Math.PI);
});

const DISTANCES = GUZERGAH.map((c, i) => {
  const next = GUZERGAH[(i + 1) % GUZERGAH.length];
  return Math.hypot(next.x - c.x, next.y - c.y);
});
const TOTAL = DISTANCES.reduce((a, b) => a + b, 0);
const KEY_TIMES = DISTANCES.reduce<number[]>(
  (acc, d) => [...acc, acc[acc.length - 1] + d / TOTAL],
  [0]
);

const KEY_LEFT = [...GUZERGAH.map(c => `${c.x}%`), `${GUZERGAH[0].x}%`];
const KEY_TOP  = [...GUZERGAH.map(c => `${c.y}%`), `${GUZERGAH[0].y}%`];
const KEY_R    = [...KEY_ROT, KEY_ROT[0]];

const TRAVEL = {
  duration: 12,
  repeat: Infinity,
  repeatType: 'loop' as const,
  ease: 'linear' as const,
  times: KEY_TIMES,
};

export default function TurkeyFlightLoader() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIdx(i => (i + 1) % MESAJLAR.length), 2200);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col items-center gap-5 py-8 select-none">
      <div className="w-full max-w-2xl bg-white">
        {/* Map container */}
        <div className="relative w-full aspect-video">
          {/* Subtle gradient vignette over the map */}
          <Image
            src="/turkey-map.png"
            alt="Türkiye haritası"
            fill
            className="object-contain opacity-80"
            style={{ filter: 'saturate(0.6) brightness(1.05)' }}
            priority
          />
          {/* Inner radial fade to blend edges into the card */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse at center, transparent 55%, rgba(255,255,255,0.72) 100%)',
            }}
          />

          {/* Airplane — centered on waypoint */}
          <motion.div
            className="absolute z-10"
            style={{ translateX: '-50%', translateY: '-50%' }}
            animate={{ left: KEY_LEFT, top: KEY_TOP }}
            transition={TRAVEL}
          >
            {/* World-space oscillation */}
            <motion.div
              animate={{ y: [-4, 4, -4] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <motion.svg
                width="32"
                height="32"
                viewBox="-14 -14 28 28"
                animate={{ rotate: KEY_R }}
                transition={TRAVEL}
                style={{
                  transformOrigin: 'center',
                  filter:
                    'drop-shadow(0 0 6px rgba(99,102,241,0.7)) drop-shadow(0 2px 4px rgba(30,27,75,0.4))',
                }}
                aria-hidden="true"
              >
                {/* Fuselage */}
                <ellipse cx="1" cy="0" rx="10" ry="2.2" fill="url(#planeGrad)" />
                {/* Nose cone */}
                <path d="M 11,-1.2 L 14.5,0 L 11,1.2 Z" fill="#6366f1" />
                {/* Wings */}
                <path d="M 2,-2.2 L -6,-10.5 L -8.5,-9 L -2,-2.2 Z" fill="url(#wingGrad)" />
                <path d="M 2,2.2 L -6,10.5 L -8.5,9 L -2,2.2 Z" fill="url(#wingGrad)" />
                {/* Tail fins */}
                <path d="M -7,-2 L -11.5,-6 L -11.5,-3.5 L -7,-1 Z" fill="#818cf8" />
                <path d="M -7,2 L -11.5,6 L -11.5,3.5 L -7,1 Z" fill="#818cf8" />
                <defs>
                  <linearGradient id="planeGrad" x1="-1" y1="0" x2="1" y2="0" gradientUnits="objectBoundingBox">
                    <stop offset="0%" stopColor="#4f46e5" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                  <linearGradient id="wingGrad" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
                    <stop offset="0%" stopColor="#4f46e5" />
                    <stop offset="100%" stopColor="#818cf8" />
                  </linearGradient>
                </defs>
              </motion.svg>
            </motion.div>
          </motion.div>
        </div>

        {/* Status bar */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center gap-3">
          {/* Pulsing dot */}
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-indigo-500" />
          </span>
          <div className="h-5 overflow-hidden flex-1">
            <AnimatePresence mode="wait">
              <motion.p
                key={idx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="text-sm font-medium text-slate-600 tracking-wide"
              >
                {MESAJLAR[idx]}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
