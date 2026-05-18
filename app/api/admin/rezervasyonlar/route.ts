import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/auth-guard';
import { createAdminClient } from '@/lib/supabase-clients';
import { getTumRezervasyonlar } from '@/lib/supabase';
import { ok, err, fail } from '@/lib/api-response';

export async function GET() {
  const guard = await requireRole(['super_admin']);
  if ('error' in guard) return guard.error;

  try {
    const data = await getTumRezervasyonlar(createAdminClient());
    return ok(data);
  } catch (e) {
    return fail('Rezervasyonlar alınamadı', e);
  }
}

export async function DELETE(req: NextRequest) {
  const guard = await requireRole(['super_admin']);
  if ('error' in guard) return guard.error;

  try {
    const id = new URL(req.url).searchParams.get('id');
    if (!id) return err('id zorunlu', 400);

    // Admin client RLS'i bypass eder — super_admin tüm rezervasyonları silebilir
    const admin = createAdminClient();
    const { error } = await admin.from('rezervasyonlar').delete().eq('id', id);
    if (error) throw new Error(error.message);

    return ok({ id });
  } catch (e) {
    return fail('Rezervasyon silinemedi', e);
  }
}
