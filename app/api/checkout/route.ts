import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth-guard';
import { createServerSupabase } from '@/lib/supabase-clients';
import { generatePNR } from '@/lib/pnr';
import { ok, err, fail } from '@/lib/api-response';
import type { CartItem } from '@/lib/cartStore';
import type { ErisilebilirlikBilgisi, Rezervasyon } from '@/lib/types';

interface CheckoutIstegi {
  items: CartItem[];
  tarih: string;
  islem_id: string;
  erisilebilirlik?: ErisilebilirlikBilgisi | null;
  alici_ad?: string;
  alici_email?: string;
  alici_telefon?: string;
}

export async function POST(req: NextRequest) {
  const guard = await requireAuth();
  if ('error' in guard) return guard.error;

  try {
    const body = (await req.json()) as CheckoutIstegi;

    if (!body.items?.length || !body.tarih || !body.islem_id) {
      return err('items, tarih ve islem_id zorunludur', 400);
    }

    const grup_kodu = generatePNR();
    const sb = await createServerSupabase();

    // Atomik checkout — tek RPC, tek transaction, herhangi bir hata → tam rollback
    const { data: rezervasyonlar, error } = await sb.rpc('process_checkout_cart', {
      p_kullanici_id: guard.ctx.userId,
      p_grup_kodu: grup_kodu,
      p_tarih: body.tarih,
      p_items: body.items,
      p_erisilebilirlik: body.erisilebilirlik ?? null,
      p_alici_ad: body.alici_ad ?? null,
      p_alici_email: body.alici_email ?? null,
      p_alici_telefon: body.alici_telefon ?? null,
    });

    if (error) throw new Error(error.message);

    return ok({ rezervasyonlar: rezervasyonlar as Rezervasyon[], islem_id: body.islem_id }, 201);
  } catch (e) {
    return fail('Rezervasyonlar oluşturulamadı', e);
  }
}
