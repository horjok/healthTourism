'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/lib/supabase-client';

type KullaniciRolTipi = 'user' | 'clinic_manager' | 'super_admin';

type KullaniciContextDeger = {
  kullanici: User | null;
  rol: KullaniciRolTipi;
  yuklendi: boolean;
  isKlinikYoneticisi: boolean;
};

const KullaniciContext = createContext<KullaniciContextDeger>({
  kullanici: null,
  rol: 'user',
  yuklendi: false,
  isKlinikYoneticisi: false,
});

export function KullaniciProvider({ children }: { children: React.ReactNode }) {
  const [kullanici, setKullanici] = useState<User | null>(null);
  const [rol, setRol] = useState<KullaniciRolTipi>('user');
  const [yuklendi, setYuklendi] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseClient();

    supabase.auth.getUser().then(async ({ data }) => {
      setKullanici(data.user);
      if (data.user) {
        const { data: roleRow } = await supabase
          .from('user_roles')
          .select('rol')
          .eq('kullanici_id', data.user.id)
          .maybeSingle();
        setRol((roleRow?.rol as KullaniciRolTipi) ?? 'user');
      }
      setYuklendi(true);
    }).catch(() => setYuklendi(true));

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        setKullanici(session?.user ?? null);
        if (session?.user) {
          const { data: roleRow } = await supabase
            .from('user_roles')
            .select('rol')
            .eq('kullanici_id', session.user.id)
            .maybeSingle();
          setRol((roleRow?.rol as KullaniciRolTipi) ?? 'user');
        } else {
          setRol('user');
        }
      } finally {
        setYuklendi(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <KullaniciContext.Provider value={{
      kullanici,
      rol,
      yuklendi,
      isKlinikYoneticisi: rol === 'clinic_manager',
    }}>
      {children}
    </KullaniciContext.Provider>
  );
}

export function useKullaniciContext() {
  return useContext(KullaniciContext);
}
