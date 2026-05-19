'use client';

import { createContext, useContext, useState, useEffect } from 'react';

export type Para = 'EUR' | 'USD' | 'GBP' | 'TRY';

// Fallback: API çekilemezse kullanılır
const FALLBACK_KURLAR: Record<Para, number> = {
  EUR: 1.00,
  USD: 1.16,
  GBP: 0.87,
  TRY: 52.94,
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
  kurYuklendi: boolean;
}

const DovizContext = createContext<DovizContextType>({
  para: 'EUR',
  setPara: () => {},
  cevir: (f) => f,
  formatla: (f) => `€${f.toLocaleString('tr-TR')}`,
  sembol: '€',
  kur: 1.00,
  kurYuklendi: false,
});

export function DovizProvider({ children }: { children: React.ReactNode }) {
  const [para, setPara] = useState<Para>('EUR');
  const [kurlar, setKurlar] = useState<Record<Para, number>>(FALLBACK_KURLAR);
  const [kurYuklendi, setKurYuklendi] = useState(false);

  useEffect(() => {
    // frankfurter.app — ECB verileri, key gerektirmez, ücretsiz
    fetch('https://api.frankfurter.app/latest?from=EUR&to=USD,GBP,TRY')
      .then(r => r.json())
      .then((json: { rates?: { USD?: number; GBP?: number; TRY?: number } }) => {
        if (json.rates?.USD && json.rates?.GBP && json.rates?.TRY) {
          setKurlar({
            EUR: 1.00,
            USD: json.rates.USD,
            GBP: json.rates.GBP,
            TRY: json.rates.TRY,
          });
        }
      })
      .catch(() => {
        // API ulaşılamazsa fallback kurlar zaten yüklü, sessizce devam
      })
      .finally(() => setKurYuklendi(true));
  }, []);

  function cevir(eurFiyat: number): number {
    return Math.round(eurFiyat * kurlar[para]);
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
    <DovizContext.Provider value={{ para, setPara, cevir, formatla, sembol: SEMBOLLER[para], kur: kurlar[para], kurYuklendi }}>
      {children}
    </DovizContext.Provider>
  );
}

export function useDoviz() {
  return useContext(DovizContext);
}
