// SUNUCU TARAFI — istemci segregasyonu
// Üç ayrı factory: public (anon, cookie yok), session (anon + cookie/RLS), admin (service_role/RLS bypass).
// Client Component'lar @/lib/supabase-client kullanmalı; bu dosya yalnız Server Component + route handler içindir.
import 'server-only';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// ─── Public (anon, oturumsuz) ────────────────────────────────────────────────
// Klinik/paket gibi açık verileri okumak için. RLS public policy ile erişilebilir olmalı.
let _public: SupabaseClient | null = null;
export function getPublicSupabase(): SupabaseClient {
  if (!_public) {
    _public = createClient(URL_, ANON, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
  }
  return _public;
}

// ─── Session (anon + cookie, RLS açık) ───────────────────────────────────────
// Standart kullanıcı ve clinic_manager yazma/okuma yolları için. auth.uid() korunur.
export async function createServerSupabase(): Promise<SupabaseClient> {
  const store = await cookies();
  return createServerClient(URL_, ANON, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (toSet) => {
        // Route handler context'inde cookie yazma denemesi hata atabilir; sessizce geç
        try {
          toSet.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch { /* read-only context */ }
      },
    },
  }) as unknown as SupabaseClient;
}

// ─── Admin (service_role, RLS bypass) ────────────────────────────────────────
// YALNIZ requireRole(['super_admin']) doğrulamasından sonra kullanılır.
let _admin: SupabaseClient | null = null;
export function createAdminClient(): SupabaseClient {
  if (!_admin) {
    _admin = createClient(URL_, SERVICE, {
      auth: { autoRefreshToken: false, persistSession: false },
      global: { headers: { 'x-client-info': 'admin-bypass' } },
    });
  }
  return _admin;
}
