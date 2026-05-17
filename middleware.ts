import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request: { headers: request.headers } });
  const { pathname } = request.nextUrl;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL('/auth?unauthorized=1', request.url));
  }

  // SECURITY DEFINER fonksiyon — RLS bypass ederek güvenilir rol kontrolü
  const { data: isSuperAdmin } = await supabase.rpc('is_super_admin');

  if (pathname.startsWith('/admin') && !isSuperAdmin) {
    return NextResponse.redirect(new URL('/?unauthorized=1', request.url));
  }

  if (pathname.startsWith('/clinic') && !pathname.startsWith('/clinic/onboarding') && !isSuperAdmin) {
    const { data: klinikId } = await supabase.rpc('get_kullanici_klinik_id');
    if (!klinikId) {
      return NextResponse.redirect(new URL('/clinic/onboarding', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/clinic/:path*'],
};
