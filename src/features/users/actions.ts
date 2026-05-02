'use server';

import { prisma } from '@/core/database/client';
import bcrypt from 'bcryptjs';
import {
  OwnerRegisterSchema,
  ProviderRegisterSchema,
  type OwnerRegisterInput,
  type ProviderRegisterInput,
} from './types';

// Helper to write audit event
async function writeAudit(params: {
  actorId: string;
  entityType: string;
  entityId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'STATUS_CHANGE';
  oldValue?: any;
  newValue?: any;
}) {
  try {
    await prisma.auditEvent.create({
      data: {
        actorId: params.actorId,
        entityType: params.entityType,
        entityId: params.entityId,
        action: params.action,
        oldValue: params.oldValue ?? null,
        newValue: params.newValue ?? null,
      },
    });
  } catch (error) {
    console.error('Failed to write audit event:', error);
  }
}

export async function registerOwner(data: OwnerRegisterInput) {
  const validated = OwnerRegisterSchema.parse(data);
  const passwordHash = await bcrypt.hash(validated.password, 12);

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email: validated.email }] },
  });
  if (existing) throw new Error('An account with this email already exists.');

  const user = await prisma.user.create({
    data: {
      email:        validated.email,
      phone:        validated.phone,
      passwordHash,
      role:         'OWNER',
      ownerProfile: {
        create: {
          firstName: validated.firstName,
          lastName:  validated.lastName,
        },
      },
    },
  });

  // Write audit event
  await writeAudit({
    actorId: user.id,
    entityType: 'User',
    entityId: user.id,
    action: 'CREATE',
    newValue: { email: user.email, role: user.role },
  });

  // Fire AUTH_REGISTER event
  const { fireAuthRegisterEvent } = await import('@/core/events');
  await fireAuthRegisterEvent({
    userId: user.id,
    email: validated.email,
    role: 'OWNER',
  });

  return { success: true };
}

export async function registerProvider(data: ProviderRegisterInput) {
  const validated = ProviderRegisterSchema.parse(data);
  const passwordHash = await bcrypt.hash(validated.password, 12);

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email: validated.email }] },
  });
  if (existing) throw new Error('An account with this email already exists.');

  const user = await prisma.user.create({
    data: {
      email:           validated.email,
      phone:           validated.phone,
      passwordHash,
      role:            'PROVIDER',
      providerProfile: {
        create: {
          businessName:      validated.businessName,
          serviceCategories: validated.serviceCategories,
          operationalZones:  validated.operationalZones,
        },
      },
    },
  });

  // Write audit event
  await writeAudit({
    actorId: user.id,
    entityType: 'User',
    entityId: user.id,
    action: 'CREATE',
    newValue: { email: user.email, role: user.role },
  });

  // Fire AUTH_REGISTER event
  const { fireAuthRegisterEvent } = await import('@/core/events');
  await fireAuthRegisterEvent({
    userId: user.id,
    email: validated.email,
    role: 'PROVIDER',
  });

  return { success: true };
}

// ─── Account Lifecycle Actions (Admin) ─────────────────────────────

export async function activateUser(userId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized: Admin access required');
  }

  const userBefore = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, status: true },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { status: 'ACTIVE' },
  });

  // Write audit event
  await writeAudit({
    actorId: session.user.id,
    entityType: 'User',
    entityId: userId,
    action: 'STATUS_CHANGE',
    oldValue: userBefore ? { status: userBefore.status } : null,
    newValue: { status: 'ACTIVE' },
  });

  return { success: true };
}

export async function suspendUser(userId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized: Admin access required');
  }

  const userBefore = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, status: true },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { status: 'SUSPENDED' },
  });

  // Write audit event
  await writeAudit({
    actorId: session.user.id,
    entityType: 'User',
    entityId: userId,
    action: 'STATUS_CHANGE',
    oldValue: userBefore ? { status: userBefore.status } : null,
    newValue: { status: 'SUSPENDED' },
  });

  return { success: true };
}

export async function getUsers() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized: Admin access required');
  }

  return await prisma.user.findMany({
    include: {
      ownerProfile: true,
      providerProfile: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}