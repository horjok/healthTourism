import { NextRequest } from 'next/server';
import { requireAuth, requireRole } from '@/lib/auth-guard';
import { createAdminClient, getPublicSupabase } from '@/lib/supabase-clients';
import { getYorumlarByKlinik } from '@/lib/supabase';
import { ok, err, fail } from '@/lib/api-response';

// GET: klinik yorumları okuma.
// - klinik_manager: yalnız kendi kliniğinin yorumlarını okur (oturumdan klinik_id).
// - Diğer (public/auth fark etmez): URL'den klinik_id ile public liste.
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const klinikQuery = url.searchParams.get('klinik_id');

  // Önce oturumu dene; clinic_manager ise kendi kliniği üzerinden zorla
  const guard = await requireRole(['clinic_manager']);
  if (!('error' in guard) && guard.ctx.klinik_id) {
    try {
      const data = await getYorumlarByKlinik(guard.ctx.klinik_id, createAdminClient());
      return ok(data);
    } catch (e) {
      return fail('Yorumlar alınamadı', e);
    }
  }

  // Public okuma — RLS public select policy'e güvenir
  if (!klinikQuery) return err('klinik_id zorunlu', 400);
  try {
    const data = await getYorumlarByKlinik(klinikQuery, getPublicSupabase());
    return ok(data);
  } catch (e) {
    return fail('Yorumlar alınamadı', e);
  }
}

// POST: yorum ekleme — herhangi bir kimliği doğrulanmış kullanıcı yapabilir.
// kullanici_id daima oturumdan alınır (body'den GEÇİRİLEMEZ).
export async function POST(req: NextRequest) {
  const guard = await requireAuth();
  if ('error' in guard) return guard.error;

  try {
    const body = await req.json() as { klinik_id: string; puan: number; yorum_metni?: string };

    if (!body.klinik_id || !body.puan) return err('klinik_id ve puan zorunlu', 400);

    // RLS INSERT policy'sini bypass etmek için admin client; kullanici_id session'dan alındığı için güvenli.
    const admin = createAdminClient();
    const { data, error } = await admin
      .from('yorumlar')
      .insert({
        klinik_id: body.klinik_id,
        kullanici_id: guard.ctx.userId,
        puan: Math.min(5, Math.max(1, Math.round(body.puan))),
        yorum_metni: body.yorum_metni?.trim() ?? null,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return ok(data, 201);
  } catch (e) {
    return fail('Yorum eklenemedi', e);
  }
}
