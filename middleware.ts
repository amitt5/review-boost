import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth/session';

const protectedRoutes = '/dashboard';
const publicRoutes = ['/sign-in', '/sign-up'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtectedRoute = pathname.startsWith(protectedRoutes);
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // Verify token for all routes
  const payload = await verifyToken(request);

  // Redirect to sign-in if trying to access protected route without valid token
  if (isProtectedRoute && !payload) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  // Redirect to dashboard if trying to access public route with valid token
  if (isPublicRoute && payload) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
