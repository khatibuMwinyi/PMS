import { auth } from '@/core/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default async function proxy(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;

  const protectedRoutes: Record<string, string[]> = {
    '/admin': ['ADMIN'],
    '/staff': ['ADMIN', 'STAFF'],
    '/owner': ['OWNER'],
    '/provider': ['PROVIDER'],
  };

  for (const [route, allowedRoles] of Object.entries(protectedRoutes)) {
    if (pathname.startsWith(route)) {
      if (!session?.user || !allowedRoles.includes(session.user.role)) {
        const url = new URL('/login', request.url);
        return NextResponse.redirect(url);
      }
    }
  }

  return NextResponse.next();
}
