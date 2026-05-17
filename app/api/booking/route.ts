import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth-guard';
import { createServerSupabase, getPublicSupabase } from '@/lib/supabase-clients';
import {
  getPaketById, createRezervasyon, getKullaniciRezervasyonlari, cancelRezervasyonById,
} from '@/lib/supabase';
import { processMockPayment } from '@/lib/mock-payment';
import { generatePNR } from '@/lib/pnr';
import { ok, err, fail } from '@/lib/api-response';

interface BookingIstegi {
  paket_id?: string;
  tarih: string;
  sepet_ozeti?: Record<string, unknown>[];
  toplam_fiyat?: number;
}

export async function POST(req: NextRequest) {
  const guard = await requireAuth();
  if ('error' in guard) return guard.error;

  try {
    const body = (await req.json()) as BookingIstegi;

    if (!body.tarih) return err('Tarih zorunludur', 400);
    if (!body.paket_id && !body.sepet_ozeti?.length) {
      return err('Paket veya sepet bilgisi zorunludur', 400);
    }

    let tutar = body.toplam_fiyat ?? 0;
    if (body.paket_id) {
      try {
        const paket = await getPaketById(body.paket_id, getPublicSupabase());
        tutar = paket.toplam_fiyat;
      } catch {
        return err('Paket bulunamadı', 404);
      }
    }

    const sb = await createServerSupabase();
    const rezervasyon = await createRezervasyon({
      kullanici_id: guard.ctx.userId, // ← daima oturumdan
      paket_id: body.paket_id ?? null,
      tarih: body.tarih,
      durum: 'beklemede',
      takip_kodu: generatePNR(),
      sepet_ozeti: body.sepet_ozeti ?? null,
    }, sb);

    const odeme = await processMockPayment(tutar);
    return ok({ rezervasyon, odeme }, 201);
  } catch (e) {
    return fail('Rezervasyon oluşturulamadı', e);
  }
}

export async function PATCH(req: NextRequest) {
  const guard = await requireAuth();
  if ('error' in guard) return guard.error;

  try {
    const body = (await req.json()) as { id: string };
    if (!body.id) return err('id zorunludur', 400);

    const sb = await createServerSupabase();
    // kullanici_id eşleşmesi cancelRezervasyonById içinde zorlanır
    const data = await cancelRezervasyonById(body.id, guard.ctx.userId, sb);
    return ok(data);
  } catch (e) {
    return fail('Rezervasyon iptal edilemedi', e);
  }
}

export async function GET() {
  const guard = await requireAuth();
  if ('error' in guard) return guard.error;

  try {
    const sb = await createServerSupabase();
    const data = await getKullaniciRezervasyonlari(guard.ctx.userId, sb);
    return ok(data);
  } catch (e) {
    return fail('Rezervasyonlar getirilemedi', e);
  }
}
