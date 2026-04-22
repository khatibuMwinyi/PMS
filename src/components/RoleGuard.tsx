'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface RoleGuardProps {
  allowedRoles: string[]; // e.g. ['ADMIN']
  children: React.ReactNode;
}

/**
 * Client‑side guard that redirects unauthenticated users or those without the required role to /login.
 * Used when a page is rendered as a client component or when a quick guard is needed.
 * Server‑side protection should also be applied via `getServerSideProps` or middleware.
 */
export default function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const router = useRouter();
  const { data: session, status } = useSession({
    required: false,
  });

  useEffect(() => {
    if (status === 'loading') return; // still checking session
    if (!session) {
      router.replace('/login');
      return;
    }
    const userRole = (session.user as any)?.role;
    if (!allowedRoles.includes(userRole)) {
      router.replace('/login');
    }
  }, [status, session, router, allowedRoles]);

  // While loading or unauthorized, render nothing to avoid flicker
  if (status === 'loading' || !session) return null;
  const userRole = (session.user as any)?.role;
  if (!allowedRoles.includes(userRole)) return null;

  return <>{children}</>;
}
