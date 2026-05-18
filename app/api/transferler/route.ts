import { getPublicSupabase } from '@/lib/supabase-clients';
import { ok, fail } from '@/lib/api-response';

export async function GET() {
  try {
    const sb = getPublicSupabase();
    const { data, error } = await sb.from('transferler').select('*');
    if (error) throw error;
    return ok(data ?? []);
  } catch (e) {
    return fail('Transferler alınamadı', e);
  }
}
