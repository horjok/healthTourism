import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/auth-guard';
import { createAdminClient } from '@/lib/supabase-clients';
import { createPaket, getPaketlerByKlinik } from '@/lib/supabase';
import { ok, err, fail } from '@/lib/api-response';

export async function GET() {
  const guard = await requireRole(['clinic_manager']);
  if ('error' in guard) return guard.error;
  const { klinik_id } = guard.ctx;
  if (!klinik_id) return err('Klinik atanmamış', 403);

  try {
    const data = await getPaketlerByKlinik(klinik_id, createAdminClient());
    return ok(data);
  } catch (e) {
    return fail('Paketler alınamadı', e);
  }
}

export async function POST(req: NextRequest) {
  const guard = await requireRole(['clinic_manager']);
  if ('error' in guard) return guard.error;
  const { klinik_id } = guard.ctx;
  if (!klinik_id) return err('Klinik atanmamış', 403);

  try {
    const body = await req.json();
    if (!body.baslik || !body.toplam_fiyat || !body.sure_gun) {
      return err('Zorunlu alanlar eksik', 400);
    }

    // klinik_id daima ctx'ten — body'den GEÇİRİLEMEZ (cross-tenant yazımı engeller)
    const data = await createPaket({
      klinik_id,
      baslik: body.baslik,
      otel_isim: body.otel_isim ?? '',
      otel_dahil: body.otel_dahil ?? false,
      ucus_dahil: body.ucus_dahil ?? false,
      transfer_dahil: body.transfer_dahil ?? false,
      uzmanlik: body.uzmanlik ?? '',
      toplam_fiyat: Number(body.toplam_fiyat),
      sure_gun: Number(body.sure_gun),
      aciklama: body.aciklama ?? '',
    }, createAdminClient());

    return ok(data, 201);
  } catch (e) {
    return fail('Paket oluşturulamadı', e);
  }
}
