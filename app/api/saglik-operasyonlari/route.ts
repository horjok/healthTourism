import { getPublicSupabase } from '@/lib/supabase-clients';
import { ok, fail } from '@/lib/api-response';

export async function GET() {
  try {
    const sb = getPublicSupabase();
    const { data, error } = await sb.from('saglik_operasyonlari').select('*');
    if (error) throw error;
    const mapped = (data ?? []).map((op) => ({
      id: op.id as string,
      category: op.kategori as string,
      name_tr: op.isim_tr as string,
      name_en: op.isim_en as string,
      desc_tr: op.aciklama_tr as string,
      desc_en: op.aciklama_en as string,
      duration_tr: op.sure_tr as string,
      duration_en: op.sure_en as string,
      price_from: op.baslangic_fiyat as number,
    }));
    return ok(mapped);
  } catch (e) {
    return fail('Sağlık operasyonları alınamadı', e);
  }
}
