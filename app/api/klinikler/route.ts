import { getKlinikler } from '@/lib/supabase';
import { ok, fail } from '@/lib/api-response';

// ISR: 60sn edge cache; public klinik listesi DB'yi sürekli sömürmesin
export const revalidate = 60;

export async function GET() {
  try {
    const data = await getKlinikler();
    return ok(data);
  } catch (e) {
    return fail('Klinikler alınamadı, lütfen tekrar deneyin', e);
  }
}
