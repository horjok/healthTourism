import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/auth-guard';
import { createAdminClient } from '@/lib/supabase-clients';
import { getRezervasyonlarByKlinik, updateRezervasyonDurum } from '@/lib/supabase';
import { ok, err, fail } from '@/lib/api-response';
import type { Rezervasyon } from '@/lib/types';

const izinliDurumlar: Rezervasyon['durum'][] = ['beklemede', 'onaylandi', 'tamamlandi', 'iptal'];

export async function GET() {
  const guard = await requireRole(['clinic_manager']);
  if ('error' in guard) return guard.error;
  const { klinik_id } = guard.ctx;
  if (!klinik_id) return err('Klinik atanmamış', 403);

  try {
    // klinik_id daima oturumdan; query parametresi yok sayılır
    const data = await getRezervasyonlarByKlinik(klinik_id, createAdminClient());
    return ok(data);
  } catch (e) {
    return fail('Rezervasyonlar alınamadı', e);
  }
}

export async function PATCH(req: NextRequest) {
  const guard = await requireRole(['clinic_manager']);
  if ('error' in guard) return guard.error;
  const { klinik_id } = guard.ctx;
  if (!klinik_id) return err('Klinik atanmamış', 403);

  try {
    const body = await req.json() as { id: string; durum: Rezervasyon['durum'] };

    if (!body.id || !body.durum) return err('id ve durum zorunlu', 400);
    if (!izinliDurumlar.includes(body.durum)) return err('Geçersiz durum değeri', 400);

    // updateRezervasyonDurum içinde klinik sahiplik doğrulaması yapılır
    const data = await updateRezervasyonDurum(body.id, body.durum, klinik_id, createAdminClient());
    return ok(data);
  } catch (e) {
    return fail('Durum güncellenemedi', e);
  }
}
