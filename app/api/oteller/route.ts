import { getPublicSupabase } from '@/lib/supabase-clients';
import { ok, fail } from '@/lib/api-response';

export async function GET() {
  try {
    const sb = getPublicSupabase();
    const { data, error } = await sb.from('oteller').select('*').order('id');
    if (error) throw error;
    const mapped = (data ?? []).map((o) => ({
      id: o.id as number,
      name: o.isim as string,
      city: o.sehir as string,
      stars: o.yildiz as number,
      price_per_night: o.gecelik_fiyat as number,
      amenities_tr: (o.olanaklar_tr ?? []) as string[],
      amenities_en: (o.olanaklar_en ?? []) as string[],
      image: o.fotograf_url as string,
      description_tr: o.aciklama_tr as string,
      description_en: o.aciklama_en as string,
    }));
    return ok(mapped);
  } catch (e) {
    return fail('Oteller alınamadı', e);
  }
}
