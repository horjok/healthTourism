import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseForRoute, getClinicApplications, updateClinicApplication } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const durum = new URL(req.url).searchParams.get('durum') ?? undefined;
    const cookieStore = await cookies();
    const sb = createSupabaseForRoute(cookieStore);
    const data = await getClinicApplications(durum, sb);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    const mesaj = error instanceof Error ? error.message : 'Bilinmeyen hata';
    return NextResponse.json({ success: false, error: 'Başvurular alınamadı', detay: mesaj }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json() as {
      id: string;
      durum: 'approved' | 'rejected';
      admin_notu?: string;
      klinik_id?: string;
    };

    if (!body.id || !body.durum) {
      return NextResponse.json({ success: false, error: 'id ve durum zorunlu' }, { status: 400 });
    }

    if (body.durum === 'approved' && !body.klinik_id) {
      return NextResponse.json({ success: false, error: 'Onaylama için klinik_id zorunlu' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const sb = createSupabaseForRoute(cookieStore);
    const data = await updateClinicApplication(body.id, {
      durum: body.durum,
      admin_notu: body.admin_notu,
      klinik_id: body.klinik_id,
    }, sb);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    const mesaj = error instanceof Error ? error.message : 'Bilinmeyen hata';
    return NextResponse.json({ success: false, error: 'Başvuru güncellenemedi', detay: mesaj }, { status: 500 });
  }
}
