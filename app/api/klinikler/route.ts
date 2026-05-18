import { getKlinikler } from '@/lib/supabase';
import { ok, fail } from '@/lib/api-response';

export async function GET() {
  try {
    const data = await getKlinikler();
    return ok(data);
  } catch (e) {
    return fail('Klinikler alınamadı, lütfen tekrar deneyin', e);
  }
}
