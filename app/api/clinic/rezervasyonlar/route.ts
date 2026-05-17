import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getRezervasyonlarByKlinik, updateRezervasyonDurum, createSupabaseForRoute, getSupabaseAdmin } from '@/lib/supabase';
import type { Rezervasyon } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const klinik_id = new URL(req.url).searchParams.get('klinik_id');
    if (!klinik_id) {
      return NextResponse.json({ success: false, error: 'klinik_id zorunlu' }, { status: 400 });
    }

    const data = await getRezervasyonlarByKlinik(klinik_id);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    const mesaj = error instanceof Error ? error.message : 'Bilinmeyen hata';
    return NextResponse.json({ success: false, error: 'Rezervasyonlar alınamadı', detay: mesaj }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const sb = createSupabaseForRoute(cookieStore);
    const admin = getSupabaseAdmin();

    // Oturum doğrula
    const { data: { user } } = await sb.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Oturum açmanız gerekiyor' }, { status: 401 });
    }

    // Kullanıcının klinik_manager rolünü ve klinik_id'sini admin client ile kontrol et (RLS bypass)
    const { data: roleRow } = await admin
      .from('user_roles')
      .select('klinik_id, rol')
      .eq('kullanici_id', user.id)
      .single();

    if (!roleRow?.klinik_id || roleRow.rol !== 'clinic_manager') {
      return NextResponse.json({ success: false, error: 'Yetersiz yetki' }, { status: 403 });
    }

    const body = await req.json() as { id: string; durum: Rezervasyon['durum'] };
    if (!body.id || !body.durum) {
      return NextResponse.json({ success: false, error: 'id ve durum zorunludur' }, { status: 400 });
    }

    const izinliDurumlar: Rezervasyon['durum'][] = ['beklemede', 'onaylandi', 'tamamlandi', 'iptal'];
    if (!izinliDurumlar.includes(body.durum)) {
      return NextResponse.json({ success: false, error: 'Geçersiz durum değeri' }, { status: 400 });
    }

    // Admin client ile güncelle — RLS'i bypass eder, sahiplik doğrulaması updateRezervasyonDurum içinde yapılır
    const data = await updateRezervasyonDurum(body.id, body.durum, roleRow.klinik_id, admin);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    const mesaj = error instanceof Error ? error.message : 'Bilinmeyen hata';
    return NextResponse.json({ success: false, error: 'Durum güncellenemedi', detay: mesaj }, { status: 500 });
  }
}
