import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/auth-guard';
import { createAdminClient } from '@/lib/supabase-clients';
import { ok, err, fail } from '@/lib/api-response';
import type { KullaniciRolu, AdminKullanici } from '@/lib/types';

const izinliRoller: KullaniciRolu[] = ['user', 'clinic_manager', 'super_admin'];

export async function GET() {
  const guard = await requireRole(['super_admin']);
  if ('error' in guard) return guard.error;

  try {
    const admin = createAdminClient();

    const [{ data: users, error: usersError }, { data: roles }] = await Promise.all([
      admin.from('admin_kullanicilar_view').select('id, email, created_at'),
      admin.from('user_roles').select('kullanici_id, rol, klinik_id'),
    ]);

    if (usersError) throw new Error(usersError.message);

    const rolMap = new Map(
      (roles ?? []).map((r) => [r.kullanici_id, { rol: r.rol, klinik_id: r.klinik_id }])
    );

    const kullanicilar: AdminKullanici[] = (users ?? []).map(
      (u: { id: string; email: string; created_at: string }) => ({
        id: u.id,
        email: u.email ?? '',
        created_at: u.created_at,
        rol: rolMap.get(u.id)?.rol ?? null,
        klinik_id: rolMap.get(u.id)?.klinik_id ?? null,
      })
    );

    return ok(kullanicilar);
  } catch (e) {
    return fail('Kullanıcılar alınamadı', e);
  }
}

export async function POST(req: NextRequest) {
  const guard = await requireRole(['super_admin']);
  if ('error' in guard) return guard.error;

  try {
    const body = await req.json() as { email: string; sifre: string; rol?: KullaniciRolu; klinik_id?: string };

    if (!body.email || !body.sifre) return err('Email ve şifre zorunlu', 400);

    const admin = createAdminClient();

    const { data: newId, error } = await admin.rpc('admin_create_user', {
      p_email: body.email,
      p_password: body.sifre,
    });

    if (error) throw new Error(error.message);

    if (body.rol && body.rol !== 'user') {
      await admin.from('user_roles').insert({
        kullanici_id: newId as string,
        rol: body.rol,
        klinik_id: body.klinik_id ?? null,
      });
    }

    return ok({ id: newId, email: body.email }, 201);
  } catch (e) {
    return fail('Kullanıcı oluşturulamadı', e);
  }
}

export async function PATCH(req: NextRequest) {
  const guard = await requireRole(['super_admin']);
  if ('error' in guard) return guard.error;

  try {
    const body = await req.json() as { id: string; rol: KullaniciRolu; klinik_id?: string | null };

    if (!body.id || !body.rol) return err('id ve rol zorunlu', 400);
    if (!izinliRoller.includes(body.rol)) return err('Geçersiz rol', 400);

    // Kendi rolünü düşürmesini engelle (son super_admin kalmasın kazası)
    if (body.id === guard.ctx.userId && body.rol !== 'super_admin') {
      return err('Kendi super_admin rolünüzü düşüremezsiniz', 400);
    }

    const { error } = await createAdminClient().from('user_roles').upsert(
      { kullanici_id: body.id, rol: body.rol, klinik_id: body.klinik_id ?? null },
      { onConflict: 'kullanici_id' }
    );
    if (error) throw new Error(error.message);

    return ok({ id: body.id });
  } catch (e) {
    return fail('Kullanıcı güncellenemedi', e);
  }
}

export async function DELETE(req: NextRequest) {
  const guard = await requireRole(['super_admin']);
  if ('error' in guard) return guard.error;

  try {
    const id = new URL(req.url).searchParams.get('id');
    if (!id) return err('id zorunlu', 400);
    if (id === guard.ctx.userId) return err('Kendinizi silemezsiniz', 400);

    const admin = createAdminClient();
    await Promise.all([
      admin.rpc('admin_delete_user', { p_uid: id }),
      admin.from('user_roles').delete().eq('kullanici_id', id),
    ]);

    return ok({ id });
  } catch (e) {
    return fail('Kullanıcı silinemedi', e);
  }
}
