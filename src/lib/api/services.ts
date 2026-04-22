import { prisma } from '@/core/database/client';

/** Retrieve all service types available on the platform */
export async function getAllServiceTypes() {
  const services = await prisma.serviceType.findMany({
    select: { id: true, name: true, description: true, basePrice: true, pricingRules: true },
    orderBy: { name: 'asc' },
  });
  return services;
}
