import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import type { KullaniciRolu, AdminKullanici } from '@/lib/types';

const izinliRoller: KullaniciRolu[] = ['user', 'clinic_manager', 'super_admin'];

export async function GET() {
  try {
    const admin = getSupabaseAdmin();

    const [{ data: users, error: usersError }, { data: roles }] = await Promise.all([
      admin.from('admin_kullanicilar_view').select('id, email, created_at'),
      admin.from('user_roles').select('kullanici_id, rol, klinik_id'),
    ]);

    if (usersError) throw new Error(usersError.message);

    const rolMap = new Map(
      (roles ?? []).map((r) => [r.kullanici_id, { rol: r.rol, klinik_id: r.klinik_id }])
    );

    const kullanicilar: AdminKullanici[] = (users ?? []).map((u: { id: string; email: string; created_at: string }) => ({
      id: u.id,
      email: u.email ?? '',
      created_at: u.created_at,
      rol: rolMap.get(u.id)?.rol ?? null,
      klinik_id: rolMap.get(u.id)?.klinik_id ?? null,
    }));

    return NextResponse.json({ success: true, data: kullanicilar });
  } catch (error) {
    const mesaj = error instanceof Error ? error.message : 'Bilinmeyen hata';
    return NextResponse.json({ success: false, error: 'Kullanıcılar alınamadı', detay: mesaj }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { email: string; sifre: string; rol?: KullaniciRolu; klinik_id?: string };

    if (!body.email || !body.sifre) {
      return NextResponse.json({ success: false, error: 'Email ve şifre zorunlu' }, { status: 400 });
    }

    const admin = getSupabaseAdmin();

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

    return NextResponse.json({ success: true, data: { id: newId, email: body.email } }, { status: 201 });
  } catch (error) {
    const mesaj = error instanceof Error ? error.message : 'Bilinmeyen hata';
    return NextResponse.json({ success: false, error: 'Kullanıcı oluşturulamadı', detay: mesaj }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json() as { id: string; rol: KullaniciRolu; klinik_id?: string | null };

    if (!body.id || !body.rol) {
      return NextResponse.json({ success: false, error: 'id ve rol zorunlu' }, { status: 400 });
    }

    if (!izinliRoller.includes(body.rol)) {
      return NextResponse.json({ success: false, error: 'Geçersiz rol' }, { status: 400 });
    }

    const admin = getSupabaseAdmin();

    await admin.from('user_roles').upsert(
      {
        kullanici_id: body.id,
        rol: body.rol,
        klinik_id: body.klinik_id ?? null,
      },
      { onConflict: 'kullanici_id' }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    const mesaj = error instanceof Error ? error.message : 'Bilinmeyen hata';
    return NextResponse.json({ success: false, error: 'Kullanıcı güncellenemedi', detay: mesaj }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = new URL(req.url).searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'id zorunlu' }, { status: 400 });

    const admin = getSupabaseAdmin();

    await Promise.all([
      admin.rpc('admin_delete_user', { p_uid: id }),
      admin.from('user_roles').delete().eq('kullanici_id', id),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    const mesaj = error instanceof Error ? error.message : 'Bilinmeyen hata';
    return NextResponse.json({ success: false, error: 'Kullanıcı silinemedi', detay: mesaj }, { status: 500 });
  }
}
