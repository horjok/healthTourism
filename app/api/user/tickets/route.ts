import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseForRoute } from '@/lib/supabase';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sb = createSupabaseForRoute(cookieStore);

    const { data: { user }, error: authErr } = await sb.auth.getUser();
    if (authErr || !user) {
      return NextResponse.json({ success: false, error: 'Giriş yapmanız gerekiyor.' }, { status: 401 });
    }

    const { data, error } = await sb
      .from('tickets')
      .select('*')
      .eq('kullanici_id', user.id)
      .order('olusturma_tarihi', { ascending: false });

    if (error) throw new Error(error.message);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    const mesaj = error instanceof Error ? error.message : 'Bilinmeyen hata';
    return NextResponse.json({ success: false, error: 'Biletler alınamadı.', detay: mesaj }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sb = createSupabaseForRoute(cookieStore);

    const { data: { user }, error: authErr } = await sb.auth.getUser();
    if (authErr || !user) {
      return NextResponse.json({ success: false, error: 'Giriş yapmanız gerekiyor.' }, { status: 401 });
    }

    const body = await req.json() as { konu?: string; mesaj?: string };
    if (!body.konu?.trim() || !body.mesaj?.trim()) {
      return NextResponse.json({ success: false, error: 'Konu ve mesaj alanları zorunludur.' }, { status: 400 });
    }
    if (body.konu.trim().length > 120) {
      return NextResponse.json({ success: false, error: 'Konu en fazla 120 karakter olabilir.' }, { status: 400 });
    }
    if (body.mesaj.trim().length > 2000) {
      return NextResponse.json({ success: false, error: 'Mesaj en fazla 2000 karakter olabilir.' }, { status: 400 });
    }

    const { data, error } = await sb
      .from('tickets')
      .insert({
        kullanici_id: user.id,
        konu: body.konu.trim(),
        mesaj: body.mesaj.trim(),
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    const mesaj = error instanceof Error ? error.message : 'Bilinmeyen hata';
    return NextResponse.json({ success: false, error: 'Bilet oluşturulamadı.', detay: mesaj }, { status: 500 });
  }
}
