'use server';

import { prisma } from '@/core/database/client';
import { auth } from '@/core/auth';
import { serviceRepository } from './repositories';
import { CreateServiceTypeSchema, UpdateServiceTypeSchema } from './schemas';

export async function acceptAssignment(assignmentId: string) {
  const session = await auth();
  if (session?.user.role !== 'PROVIDER') throw new Error('Unauthorized');

  const provider = await prisma.providerProfile.findUnique({
    where: { userId: session.user.id }
  });

  if (!provider) throw new Error('Provider context missing');

  const { serviceService } = await import('./services');
  return serviceService.acceptAssignment(assignmentId, provider.id);
}

// Admin Service Type CRUD

export async function createServiceType(formData: FormData) {
  const session = await auth();
  if (session?.user.role !== 'ADMIN') {
    throw new Error('Unauthorized: Admin access required');
  }

  const raw = {
    name:         formData.get('name'),
    description:  formData.get('description'),
    basePrice:    formData.get('basePrice'),
    priceUnit:    formData.get('priceUnit'),
    pricingRules: formData.get('pricingRules'),
  };

  const validated = CreateServiceTypeSchema.parse({
    ...raw,
    basePrice: raw.basePrice ? parseFloat(raw.basePrice as string) : undefined,
    pricingRules: raw.pricingRules ? JSON.parse(raw.pricingRules as string) : undefined,
  });

  const serviceType = await serviceRepository.createServiceType({
    name:         validated.name,
    description:  validated.description,
    basePrice:    validated.basePrice,
    priceUnit:    validated.priceUnit,
    pricingRules: validated.pricingRules || {},
    isActive:     validated.isActive ?? true,
  });

  return { success: true, serviceType };
}

export async function updateServiceType(id: string, formData: FormData) {
  const session = await auth();
  if (session?.user.role !== 'ADMIN') {
    throw new Error('Unauthorized: Admin access required');
  }

  const raw = {
    name:         formData.get('name'),
    description:  formData.get('description'),
    basePrice:    formData.get('basePrice'),
    priceUnit:    formData.get('priceUnit'),
    pricingRules: formData.get('pricingRules'),
    isActive:     formData.get('isActive'),
  };

  const validated = UpdateServiceTypeSchema.parse({
    ...raw,
    basePrice: raw.basePrice ? parseFloat(raw.basePrice as string) : undefined,
    pricingRules: raw.pricingRules ? JSON.parse(raw.pricingRules as string) : undefined,
    isActive: raw.isActive === 'true' ? true : raw.isActive === 'false' ? false : undefined,
  });

  const serviceType = await serviceRepository.updateServiceType(id, validated);

  return { success: true, serviceType };
}

export async function deactivateServiceType(id: string) {
  const session = await auth();
  if (session?.user.role !== 'ADMIN') {
    throw new Error('Unauthorized: Admin access required');
  }

  await serviceRepository.updateServiceType(id, { isActive: false });

  return { success: true };
}

export async function getServiceTypes(includeInactive: boolean = false) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  return serviceRepository.getServiceTypes(includeInactive);
}