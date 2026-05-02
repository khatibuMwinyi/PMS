'use server';

import { prisma } from '@/core/database/client';
import { auth } from '@/core/auth';
import { UserRole } from '@prisma/client';

/**
 * Get all users with masked profiles for non-admin roles.
 * Admin can see full profiles including PII.
 * Non-admin users see masked data (phone hidden).
 */
export async function getUsers() {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const isAdmin = session.user.role === 'ADMIN';

  const users = await prisma.user.findMany({
    include: {
      ownerProfile: true,
      providerProfile: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  // Mask PII for non-admin users
  if (!isAdmin) {
    return users.map((user) => ({
      ...user,
      phone: maskPhone(user.phone),
      ownerProfile: user.ownerProfile
        ? {
            ...user.ownerProfile,
            // Mask owner PII if viewer is not admin
            firstName: isAdmin ? user.ownerProfile.firstName : '***',
            lastName: isAdmin ? user.ownerProfile.lastName : '***',
          }
        : null,
      providerProfile: user.providerProfile
        ? {
            ...user.providerProfile,
            // Mask business name for non-admin
            businessName: isAdmin ? user.providerProfile.businessName : '***',
          }
        : null,
    }));
  }

  return users;
}

/**
 * Get a single user by ID with role-based masking.
 */
export async function getUserById(userId: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const isAdmin = session.user.role === 'ADMIN';
  const isSelf = session.user.id === userId;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      ownerProfile: true,
      providerProfile: true,
      properties: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Only admin or self can see full profile
  if (!isAdmin && !isSelf) {
    return {
      ...user,
      phone: maskPhone(user.phone),
      ownerProfile: user.ownerProfile
        ? {
            ...user.ownerProfile,
            firstName: '***',
            lastName: '***',
          }
        : null,
      providerProfile: user.providerProfile
        ? {
            ...user.providerProfile,
            businessName: '***',
          }
        : null,
    };
  }

  return user;
}

/**
 * Mask phone number for privacy.
 * Shows only last 4 digits: +255 *** ****
 */
function maskPhone(phone: string | null): string | null {
  if (!phone) return null;
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length <= 4) return '***';
  return `${phone.substring(0, phone.length - 4)}****`;
}
