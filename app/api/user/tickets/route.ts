import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth-guard';
import { createServerSupabase } from '@/lib/supabase-clients';
import { ok, err, fail } from '@/lib/api-response';

export async function GET() {
  const guard = await requireAuth();
  if ('error' in guard) return guard.error;

  try {
    const sb = await createServerSupabase();
    const { data, error } = await sb
      .from('tickets')
      .select('*')
      .eq('kullanici_id', guard.ctx.userId)
      .order('olusturma_tarihi', { ascending: false });

    if (error) throw new Error(error.message);
    return ok(data);
  } catch (e) {
    return fail('Biletler alınamadı', e);
  }
}

export async function POST(req: NextRequest) {
  const guard = await requireAuth();
  if ('error' in guard) return guard.error;

  try {
    const body = await req.json() as { konu?: string; mesaj?: string };
    if (!body.konu?.trim() || !body.mesaj?.trim()) {
      return err('Konu ve mesaj alanları zorunludur', 400);
    }
    if (body.konu.trim().length > 120)    return err('Konu en fazla 120 karakter olabilir', 400);
    if (body.mesaj.trim().length > 2000)  return err('Mesaj en fazla 2000 karakter olabilir', 400);

    const sb = await createServerSupabase();
    const { data, error } = await sb
      .from('tickets')
      .insert({
        kullanici_id: guard.ctx.userId, // ← daima oturumdan
        konu: body.konu.trim(),
        mesaj: body.mesaj.trim(),
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return ok(data, 201);
  } catch (e) {
    return fail('Bilet oluşturulamadı', e);
  }
}
