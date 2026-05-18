import { getPublicSupabase } from '@/lib/supabase-clients';
import { ok, fail } from '@/lib/api-response';

export async function GET() {
  try {
    const sb = getPublicSupabase();
    const { data, error } = await sb.from('ucuslar').select('*').order('id');
    if (error) throw error;
    const mapped = (data ?? []).map((u) => ({
      id: u.id as number,
      airline: u.havayolu as string,
      from: u.kalkis_sehir as string,
      from_code: u.kalkis_kodu as string,
      to: u.varis_sehir as string,
      to_code: u.varis_kodu as string,
      duration: u.sure as string,
      price: u.fiyat as number,
      direct: u.direkt as boolean,
      color: u.renk as string,
      class: u.kabin as string,
    }));
    return ok(mapped);
  } catch (e) {
    return fail('Uçuşlar alınamadı', e);
  }
}
