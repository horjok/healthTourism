import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/auth-guard';
import { createAdminClient } from '@/lib/supabase-clients';
import { getClinicApplications, updateClinicApplication } from '@/lib/supabase';
import { ok, err, fail } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  const guard = await requireRole(['super_admin']);
  if ('error' in guard) return guard.error;

  try {
    const durum = new URL(req.url).searchParams.get('durum') ?? undefined;
    const data = await getClinicApplications(durum, createAdminClient());
    return ok(data);
  } catch (e) {
    return fail('Başvurular alınamadı', e);
  }
}

export async function PATCH(req: NextRequest) {
  const guard = await requireRole(['super_admin']);
  if ('error' in guard) return guard.error;

  try {
    const body = await req.json() as {
      id: string;
      durum: 'approved' | 'rejected';
      admin_notu?: string;
      klinik_id?: string;
    };

    if (!body.id || !body.durum) return err('id ve durum zorunlu', 400);
    if (body.durum === 'approved' && !body.klinik_id) {
      return err('Onaylama için klinik_id zorunlu', 400);
    }

    const data = await updateClinicApplication(body.id, {
      durum: body.durum,
      admin_notu: body.admin_notu,
      klinik_id: body.klinik_id,
    }, createAdminClient());

    return ok(data);
  } catch (e) {
    return fail('Başvuru güncellenemedi', e);
  }
}
