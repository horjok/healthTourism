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

  // 1) Auth state — yalnızca senkron state güncellemesi.
  //    ÖNEMLİ: onAuthStateChange callback'i içinde ASLA başka bir Supabase
  //    çağrısı (DB select, getUser vs.) await edilmemeli; GoTrue kilidi
  //    serbest kalmaz ve sonraki tüm istekler tıkanır (deadlock).
  useEffect(() => {
    const supabase = getSupabaseClient();
    let iptalEdildi = false;

    supabase.auth.getSession().then(({ data }) => {
      if (iptalEdildi) return;
      setKullanici(data.session?.user ?? null);
      setYuklendi(true);
    }).catch(() => { if (!iptalEdildi) setYuklendi(true); });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      // Sadece senkron set — DB sorgusu aşağıdaki effect'te.
      setKullanici(session?.user ?? null);
      setYuklendi(true);
    });

    return () => {
      iptalEdildi = true;
      subscription.unsubscribe();
    };
  }, []);

  // 2) Rol fetch — kullanıcı değiştiğinde callback dışında, normal effect içinde.
  useEffect(() => {
    if (!kullanici) { setRol('user'); return; }
    const supabase = getSupabaseClient();
    let iptalEdildi = false;
    supabase
      .from('user_roles')
      .select('rol')
      .eq('kullanici_id', kullanici.id)
      .maybeSingle()
      .then(({ data }) => {
        if (iptalEdildi) return;
        setRol((data?.rol as KullaniciRolTipi) ?? 'user');
      });
    return () => { iptalEdildi = true; };
  }, [kullanici]);

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
