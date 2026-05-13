'use server';

import { prisma } from '@/core/database/client';
import { auth } from '@/core/auth';
import { propertyRepository } from './repositories';

export async function getOwnerProperties() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'OWNER') {
    throw new Error('Unauthorized');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { ownerProfile: true },
  });

  if (!user?.ownerProfile) {
    return [];
  }

  return propertyRepository.findByOwner(user.ownerProfile.id);
}

export async function getPropertyById(propertyId: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  if (session.user.role === 'OWNER') {
    const ownerProfile = await prisma.ownerProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (!ownerProfile) {
      throw new Error('Owner profile not found');
    }
    return propertyRepository.findByIdAndOwner(propertyId, ownerProfile.id);
  }

  if (!['ADMIN', 'STAFF'].includes(session.user.role)) {
    throw new Error('Unauthorized');
  }

  return propertyRepository.findById(propertyId);
}

export async function getAllProperties() {
  const session = await auth();
  if (!session?.user || !['ADMIN', 'STAFF'].includes(session.user.role)) {
    throw new Error('Unauthorized');
  }

  return propertyRepository.findAllWithOwner();
}