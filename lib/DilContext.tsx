'use client';

import { createContext, useContext, useState, useEffect } from 'react';

type Dil = 'tr' | 'en';

const DilContext = createContext<{
  dil: Dil;
  setDil: (d: Dil) => void;
}>({ dil: 'tr', setDil: () => {} });

export function DilProvider({ children }: { children: React.ReactNode }) {
  const [dil, setDilState] = useState<Dil>('tr');

  useEffect(() => {
    const kayitli = localStorage.getItem('healthtour_dil') as Dil;
    if (kayitli === 'tr' || kayitli === 'en') setDilState(kayitli);
  }, []);

  const setDil = (yeniDil: Dil) => {
    setDilState(yeniDil);
    localStorage.setItem('healthtour_dil', yeniDil);
  };

  return (
    <DilContext.Provider value={{ dil, setDil }}>
      {children}
    </DilContext.Provider>
  );
}

export function useDilContext() {
  return useContext(DilContext);
}