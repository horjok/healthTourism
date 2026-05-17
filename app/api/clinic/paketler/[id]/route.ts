import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/auth-guard';
import { createAdminClient } from '@/lib/supabase-clients';
import { assertPaketKlinikSahipligi, deletePaket, updatePaket } from '@/lib/supabase';
import { ok, err, fail } from '@/lib/api-response';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireRole(['clinic_manager']);
  if ('error' in guard) return guard.error;
  const { klinik_id } = guard.ctx;
  if (!klinik_id) return err('Klinik atanmamış', 403);

  try {
    const admin = createAdminClient();
    // Önce paket gerçekten bu kliniğe ait mi doğrula — başka kliniğin paketini güncellemeyi engelle
    await assertPaketKlinikSahipligi(params.id, klinik_id, admin);

    const body = await req.json();
    // klinik_id güncellemesini reddet
    delete body.klinik_id;

    const data = await updatePaket(params.id, body, admin);
    return ok(data);
  } catch (e) {
    return fail('Paket güncellenemedi', e);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireRole(['clinic_manager']);
  if ('error' in guard) return guard.error;
  const { klinik_id } = guard.ctx;
  if (!klinik_id) return err('Klinik atanmamış', 403);

  try {
    const admin = createAdminClient();
    await assertPaketKlinikSahipligi(params.id, klinik_id, admin);
    await deletePaket(params.id, admin);
    return ok({ id: params.id });
  } catch (e) {
    return fail('Paket silinemedi', e);
  }
}
