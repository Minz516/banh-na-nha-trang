import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAuthToken } from '@/lib/auth-edge';

export async function middleware(request: NextRequest) {
  // Extract token from cookie (matches API cookie name)
  const token = request.cookies.get('accessToken')?.value;
  
  const pathname = request.nextUrl.pathname;

  // Protect account routes
  if (pathname.startsWith('/account') || pathname.startsWith('/checkout')) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const payload = await verifyAuthToken(token);
    if (!payload || payload.role !== 'customer') {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Prevent logged-in users from seeing login/register pages
  if (pathname === '/login' || pathname === '/register') {
    if (token) {
      const payload = await verifyAuthToken(token);
      if (payload && payload.role === 'customer') {
        return NextResponse.redirect(new URL('/account', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/account/:path*',
    '/checkout/:path*',
    '/login',
    '/register'
  ]
};
