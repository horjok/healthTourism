import { requireRole } from '@/lib/auth-guard';
import { createAdminClient } from '@/lib/supabase-clients';
import { getTumRezervasyonlar } from '@/lib/supabase';
import { ok, fail } from '@/lib/api-response';

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
