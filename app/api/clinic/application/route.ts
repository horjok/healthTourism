import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth-guard';
import { createServerSupabase } from '@/lib/supabase-clients';
import { createClinicApplication, getClinicApplication } from '@/lib/supabase';
import { ok, err, fail } from '@/lib/api-response';

// kullanici_id daima oturumdan alınır — başkasının başvurusu görüntülenemez/oluşturulamaz.
export async function GET() {
  const guard = await requireAuth();
  if ('error' in guard) return guard.error;

  try {
    const sb = await createServerSupabase();
    const data = await getClinicApplication(guard.ctx.userId, sb);
    return ok(data);
  } catch (e) {
    return fail('Başvuru bilgisi alınamadı', e);
  }
}

export async function POST(req: NextRequest) {
  const guard = await requireAuth();
  if ('error' in guard) return guard.error;

  try {
    const body = await req.json() as {
      klinik_isim: string;
      iletisim_email: string;
      uzmanlik: string[];
      sehir: string;
      aciklama?: string;
    };

    if (!body.klinik_isim || !body.iletisim_email || !body.uzmanlik?.length || !body.sehir) {
      return err('Zorunlu alanlar eksik', 400);
    }

    const sb = await createServerSupabase();
    const data = await createClinicApplication({
      kullanici_id: guard.ctx.userId, // body'den DEĞİL, oturumdan
      klinik_isim: body.klinik_isim,
      iletisim_email: body.iletisim_email,
      uzmanlik: body.uzmanlik,
      sehir: body.sehir,
      aciklama: body.aciklama ?? null,
    }, sb);

    return ok(data, 201);
  } catch (e) {
    return fail('Başvuru oluşturulamadı', e);
  }
}
