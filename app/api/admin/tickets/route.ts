import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseForRoute, getTickets, updateTicket } from '@/lib/supabase';

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json() as { id?: string };
    if (!id) return NextResponse.json({ success: false, error: 'id zorunlu' }, { status: 400 });

    const cookieStore = await cookies();
    const sb = createSupabaseForRoute(cookieStore);
    const { error } = await sb.from('tickets').delete().eq('id', id);
    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true });
  } catch (error) {
    const mesaj = error instanceof Error ? error.message : 'Bilinmeyen hata';
    return NextResponse.json({ success: false, error: 'Bilet silinemedi.', detay: mesaj }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const durum = new URL(req.url).searchParams.get('durum') ?? undefined;
    const cookieStore = await cookies();
    const sb = createSupabaseForRoute(cookieStore);
    const data = await getTickets(durum, sb);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    const mesaj = error instanceof Error ? error.message : 'Bilinmeyen hata';
    return NextResponse.json({ success: false, error: 'Biletler alınamadı', detay: mesaj }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json() as {
      id: string;
      durum?: 'acik' | 'islemde' | 'kapali';
      admin_yaniti?: string;
    };

    if (!body.id) {
      return NextResponse.json({ success: false, error: 'id zorunlu' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const sb = createSupabaseForRoute(cookieStore);
    const data = await updateTicket(body.id, {
      durum: body.durum,
      admin_yaniti: body.admin_yaniti,
    }, sb);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    const mesaj = error instanceof Error ? error.message : 'Bilinmeyen hata';
    return NextResponse.json({ success: false, error: 'Bilet güncellenemedi', detay: mesaj }, { status: 500 });
  }
}
