import { auth } from './index';
import { UserRole } from '@prisma/client';

/**
 * Server-side role guard that throws if the user is not authenticated
 * or does not have the required role.
 *
 * Usage:
 *   await requireRole('ADMIN');
 *   await requireRole(['OWNER', 'ADMIN']);
 */
export async function requireRole(role: UserRole | UserRole[]): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('UNAUTHORIZED: Authentication required');
  }

  const allowedRoles = Array.isArray(role) ? role : [role];
  if (!allowedRoles.includes(session.user.role as UserRole)) {
    throw new Error(`FORBIDDEN: Requires role(s): ${allowedRoles.join(', ')}`);
  }
}

/**
 * Server-side guard that returns the session if authenticated,
 * or throws if not. Does NOT check role.
 */
export async function requireAuth(): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('UNAUTHORIZED: Authentication required');
  }
}

/**
 * Helper to get the current session user ID (throws if missing).
 */
export async function getCurrentUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('UNAUTHORIZED: Authentication required');
  }
  return session.user.id;
}

/**
 * Helper to get the current session with role.
 * Returns the full session object or throws.
 */
export async function getSessionOrThrow() {
  const session = await auth();
  if (!session?.user) {
    throw new Error('UNAUTHORIZED: Authentication required');
  }
  return session;
}
