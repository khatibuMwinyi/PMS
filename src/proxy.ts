import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * Proxy (replaces deprecated middleware) to enforce role‑based access control.
 * It runs on the Node.js runtime for all incoming requests and redirects
 * unauthenticated users or users with insufficient roles to the login page.
 */
export default async function proxy(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = request.nextUrl;

  // Publicly accessible paths – no redirect
  const publicPaths = ['/login', '/register', '/', '/marketing', '/api'];
  if (publicPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // If no auth token, send to login
  if (!token) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  const role = (token as any).role;

  // Map of route prefixes to required role
  const roleRoutes: Record<string, string> = {
    '/admin': 'ADMIN',
    '/owner': 'OWNER',
    '/provider': 'PROVIDER',
  };

  for (const [prefix, requiredRole] of Object.entries(roleRoutes)) {
    if (pathname.startsWith(prefix) && role !== requiredRole) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/owner/:path*', '/provider/:path*'],
};
