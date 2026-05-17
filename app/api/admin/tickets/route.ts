import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/auth-guard';
import { createAdminClient } from '@/lib/supabase-clients';
import { getTickets, updateTicket } from '@/lib/supabase';
import { ok, err, fail } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  const guard = await requireRole(['super_admin']);
  if ('error' in guard) return guard.error;

  try {
    const durum = new URL(req.url).searchParams.get('durum') ?? undefined;
    const data = await getTickets(durum, createAdminClient());
    return ok(data);
  } catch (e) {
    return fail('Biletler alınamadı', e);
  }
}

export async function PATCH(req: NextRequest) {
  const guard = await requireRole(['super_admin']);
  if ('error' in guard) return guard.error;

  try {
    const body = await req.json() as {
      id: string;
      durum?: 'acik' | 'islemde' | 'kapali';
      admin_yaniti?: string;
    };

    if (!body.id) return err('id zorunlu', 400);

    const data = await updateTicket(body.id, {
      durum: body.durum,
      admin_yaniti: body.admin_yaniti,
    }, createAdminClient());

    return ok(data);
  } catch (e) {
    return fail('Bilet güncellenemedi', e);
  }
}

export async function DELETE(req: NextRequest) {
  const guard = await requireRole(['super_admin']);
  if ('error' in guard) return guard.error;

  try {
    const { id } = await req.json() as { id?: string };
    if (!id) return err('id zorunlu', 400);

    const { error } = await createAdminClient().from('tickets').delete().eq('id', id);
    if (error) throw new Error(error.message);

    return ok({ id });
  } catch (e) {
    return fail('Bilet silinemedi', e);
  }
}
