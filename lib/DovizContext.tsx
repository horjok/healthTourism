'use client';

import { createContext, useContext, useState } from 'react';

export type Para = 'EUR' | 'USD' | 'GBP' | 'TRY';

// EUR bazlı dönüşüm katsayıları
const KURLAR: Record<Para, number> = {
  EUR: 1.00,
  USD: 1.08,
  GBP: 0.86,
  TRY: 35.50,
};

const SEMBOLLER: Record<Para, string> = {
  EUR: '€',
  USD: '$',
  GBP: '£',
  TRY: '₺',
};

interface DovizContextType {
  para: Para;
  setPara: (p: Para) => void;
  cevir: (eurFiyat: number) => number;
  formatla: (eurFiyat: number) => string;
  sembol: string;
  kur: number;
}

const DovizContext = createContext<DovizContextType>({
  para:    'EUR',
  setPara: () => {},
  cevir:   (f) => f,
  formatla:(f) => `€${f.toLocaleString('tr-TR')}`,
  sembol:  '€',
  kur:     1.00,
});

export function DovizProvider({ children }: { children: React.ReactNode }) {
  const [para, setPara] = useState<Para>('EUR');

  function cevir(eurFiyat: number): number {
    return Math.round(eurFiyat * KURLAR[para]);
  }

  function formatla(eurFiyat: number): string {
    const tutar = cevir(eurFiyat);
    const sembol = SEMBOLLER[para];
    if (para === 'TRY') {
      return `${tutar.toLocaleString('tr-TR')} ₺`;
    }
    return `${sembol}${tutar.toLocaleString('tr-TR')}`;
  }

  return (
    <DovizContext.Provider value={{ para, setPara, cevir, formatla, sembol: SEMBOLLER[para], kur: KURLAR[para] }}>
      {children}
    </DovizContext.Provider>
  );
}

export function useDoviz() {
  return useContext(DovizContext);
}
