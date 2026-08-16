import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const portalHomeByRole: Record<string, string> = {
  admin: '/admin/dashboard',
  super_admin: '/admin/dashboard',
  business: '/business/dashboard',
  user: '/user/dashboard',
  ambassador: '/ambassador/dashboard',
};

const portalRoles = ['admin', 'business', 'user', 'ambassador'];
const publicPaths = new Set(['/login', '/privacy', '/support']);

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const pathname = request.nextUrl.pathname;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({ request });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    if (publicPaths.has(pathname)) return response;

    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, is_banned')
    .eq('id', user.id)
    .single();

  if (profile?.is_banned) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    const redirect = NextResponse.redirect(url);
    redirect.cookies.delete('sb-access-token');
    redirect.cookies.delete('sb-refresh-token');
    return redirect;
  }

  const role = profile?.role ?? 'user';
  const roleHome = portalHomeByRole[role] ?? portalHomeByRole.user;

  if (pathname === '/' || pathname === '/login') {
    const url = request.nextUrl.clone();
    url.pathname = roleHome;
    return NextResponse.redirect(url);
  }

  const requestedPortal = pathname.split('/')[1];
  const isSuperAdmin = role === 'super_admin';

  if (portalRoles.includes(requestedPortal) && requestedPortal !== role && !isSuperAdmin) {
    const url = request.nextUrl.clone();
    url.pathname = roleHome;
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
