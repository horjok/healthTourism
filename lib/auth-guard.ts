// Rol doğrulama guard'ı.
// Her korumalı route'un başında çağrılır; aksi 401/403 NextResponse döner.
import 'server-only';
import { NextResponse } from 'next/server';
import { createServerSupabase, createAdminClient } from './supabase-clients';
import type { KullaniciRolu } from './types';

export type AuthCtx = {
  userId: string;
  email: string | null;
  rol: KullaniciRolu;
  klinik_id: string | null;
};

export type GuardResult = { ctx: AuthCtx } | { error: NextResponse };

export async function requireRole(izinli: KullaniciRolu[]): Promise<GuardResult> {
  const sb = await createServerSupabase();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) {
    return { error: NextResponse.json({ success: false, error: 'Oturum açmanız gerekiyor' }, { status: 401 }) };
  }

  // Rol satırını admin client ile çek (kullanıcı kendi RLS'i ile rolünü göremeyebilir)
  const { data: row } = await createAdminClient()
    .from('user_roles')
    .select('rol, klinik_id')
    .eq('kullanici_id', user.id)
    .maybeSingle();

  const rol: KullaniciRolu = (row?.rol ?? 'user') as KullaniciRolu;
  if (!izinli.includes(rol)) {
    return { error: NextResponse.json({ success: false, error: 'Yetersiz yetki' }, { status: 403 }) };
  }

  return {
    ctx: { userId: user.id, email: user.email ?? null, rol, klinik_id: row?.klinik_id ?? null },
  };
}

// Sadece oturum açmış olmak yeterli olduğu durumlar için (rol gözetmez).
export async function requireAuth(): Promise<GuardResult> {
  return requireRole(['user', 'clinic_manager', 'super_admin']);
}
