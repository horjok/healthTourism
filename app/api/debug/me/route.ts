import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: () => {},
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ oturum: false, hata: authError?.message ?? 'Oturum bulunamadı' });
    }

    const { data: roleRow, error: roleError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('kullanici_id', user.id)
      .single();

    return Response.json({
      oturum: true,
      kullanici_id: user.id,
      email: user.email,
      user_roles_satiri: roleRow ?? null,
      user_roles_hata: roleError?.message ?? null,
    });
  } catch (e) {
    return Response.json({ hata: String(e) }, { status: 500 });
  }
}
