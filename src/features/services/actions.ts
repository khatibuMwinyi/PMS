'use server';

import { prisma } from '@/core/database/client';
import { auth } from '@/core/auth';
import { CreateServiceTypeSchema, UpdateServiceTypeSchema } from './types';

export async function acceptAssignment(assignmentId: string) {
  const session = await auth();
  if (session?.user.role !== 'PROVIDER') throw new Error('Unauthorized');

  const provider = await prisma.providerProfile.findUnique({
    where: { userId: session.user.id }
  });

  if (!provider) throw new Error('Provider context missing');

  return await prisma.$transaction(async (tx) => {
    const assignment = await tx.assignment.findUnique({ where: { id: assignmentId } });

    if (!assignment || assignment.status !== 'PENDING_ACCEPTANCE') {
      throw new Error("Assignment no longer available");
    }

    // Safe Update via Version Check (Optimistic Concurrency)
    const updated = await tx.assignment.updateMany({
      where: {
        id: assignmentId,
        version: assignment.version,
        status: 'PENDING_ACCEPTANCE'
      },
      data: {
        status: 'ACCEPTED',
        providerId: provider.id,
        transitionedAt: new Date(),
        version: { increment: 1 }
      }
    });

    if (updated.count === 0) throw new Error("Conflict: Assignment accepted by another provider.");
    return { success: true };
  });
}

// ─── Admin Service Type CRUD ─────────────────────────────

export async function createServiceType(formData: FormData) {
  const session = await auth();
  if (session?.user.role !== 'ADMIN') {
    throw new Error('Unauthorized: Admin access required');
  }

  const raw = {
    name:        formData.get('name'),
    description: formData.get('description'),
    basePrice:   formData.get('basePrice'),
    priceUnit:   formData.get('priceUnit'),
    category:    formData.get('category'),
    rules:       formData.get('rules'),
  };

  const validated = CreateServiceTypeSchema.parse({
    ...raw,
    basePrice: raw.basePrice ? parseFloat(raw.basePrice as string) : undefined,
    rules: raw.rules ? JSON.parse(raw.rules as string) : undefined,
  });

  const serviceType = await prisma.serviceType.create({
    data: {
      name:        validated.name,
      description: validated.description,
      basePrice:   validated.basePrice,
      priceUnit:   validated.priceUnit,
      frequency:   validated.frequency,
      category:    validated.category,
      rules:       validated.rules || {},
      isActive:    validated.isActive ?? true,
    },
  });

  return { success: true, serviceType };
}

export async function updateServiceType(id: string, formData: FormData) {
  const session = await auth();
  if (session?.user.role !== 'ADMIN') {
    throw new Error('Unauthorized: Admin access required');
  }

  const raw = {
    name:        formData.get('name'),
    description: formData.get('description'),
    basePrice:   formData.get('basePrice'),
    priceUnit:   formData.get('priceUnit'),
    category:    formData.get('category'),
    rules:       formData.get('rules'),
    isActive:    formData.get('isActive'),
  };

  const validated = UpdateServiceTypeSchema.parse({
    ...raw,
    basePrice: raw.basePrice ? parseFloat(raw.basePrice as string) : undefined,
    rules: raw.rules ? JSON.parse(raw.rules as string) : undefined,
    isActive: raw.isActive === 'true' ? true : raw.isActive === 'false' ? false : undefined,
  });

  const serviceType = await prisma.serviceType.update({
    where: { id },
    data: {
      ...(validated.name !== undefined && { name: validated.name }),
      ...(validated.description !== undefined && { description: validated.description }),
      ...(validated.basePrice !== undefined && { basePrice: validated.basePrice }),
      ...(validated.priceUnit !== undefined && { priceUnit: validated.priceUnit }),
      ...(validated.frequency !== undefined && { frequency: validated.frequency }),
      ...(validated.category !== undefined && { category: validated.category }),
      ...(validated.rules !== undefined && { rules: validated.rules }),
      ...(validated.isActive !== undefined && { isActive: validated.isActive }),
    },
  });

  return { success: true, serviceType };
}

export async function deactivateServiceType(id: string) {
  const session = await auth();
  if (session?.user.role !== 'ADMIN') {
    throw new Error('Unauthorized: Admin access required');
  }

  await prisma.serviceType.update({
    where: { id },
    data: { isActive: false },
  });

  return { success: true };
}

export async function getServiceTypes(includeInactive: boolean = false) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  return await prisma.serviceType.findMany({
    where: includeInactive ? {} : { isActive: true },
    orderBy: { createdAt: 'desc' },
  });
}