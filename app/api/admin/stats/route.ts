import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createSupabaseForRoute, getAdminStats } from '@/lib/supabase';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sb = createSupabaseForRoute(cookieStore);
    const data = await getAdminStats(sb);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    const mesaj = error instanceof Error ? error.message : 'Bilinmeyen hata';
    return NextResponse.json({ success: false, error: 'İstatistikler alınamadı', detay: mesaj }, { status: 500 });
  }
}
