"use server";

import { prisma } from '@/core/database/client';
import { auth } from '@/core/auth';

export async function getOwnerProperties() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'OWNER') {
    throw new Error('Unauthorized');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      ownerProfile: {
        include: {
          properties: {
            include: {
              units: true,
            },
          },
        },
      },
    },
  });

  return user?.ownerProfile?.properties || [];
}

export async function getPropertyById(propertyId: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  return await prisma.property.findUnique({
    where: { id: propertyId },
    include: {
      units: true,
      owner: true,
    },
  });
}

export async function getAllProperties() {
  const session = await auth();
  if (!session?.user || !['ADMIN', 'STAFF'].includes(session.user.role)) {
    throw new Error('Unauthorized');
  }

  return await prisma.property.findMany({
    include: {
      owner: true,
      units: true,
    },
  });
}