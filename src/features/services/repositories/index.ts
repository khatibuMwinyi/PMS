import { prisma } from '@/core/database/client';

export interface ProviderWithScore {
  id: string;
  score: number;
  distance_km: number;
}

export class ServiceRepository {
  static async findBestProvider(
    propertyId: string,
    serviceTypeId: string,
    radiusKm: number = 10
  ): Promise<ProviderWithScore | null> {
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { latitude: true, longitude: true }
    });

    if (!property) throw new Error("Property not found");

    const providers = await prisma.$queryRaw<any[]>`
      SELECT
        pp.id, pp.rating, pp.completed_jobs, pp.total_jobs,
        pp.acceptance_rate, pp.responsiveness,
        ST_DistanceSphere(
          ST_SetSRID(ST_MakePoint(pp.longitude, pp.latitude), 4326),
          ST_SetSRID(ST_MakePoint(${property.longitude}, ${property.latitude}), 4326)
        ) / 1000 as distance_km
      FROM provider_profiles pp
      JOIN users u ON pp.user_id = u.id
      WHERE u.status = 'ACTIVE'
      AND pp.verification = 'VERIFIED'
      AND ST_DWithin(
        ST_SetSRID(ST_MakePoint(pp.longitude, pp.latitude), 4326),
        ST_SetSRID(ST_MakePoint(${property.longitude}, ${property.latitude}), 4326),
        ${radiusKm * 1000}
      )
    `;

    if (providers.length === 0) return null;

    const scored = providers.map(p => {
      const completion_rate = p.total_jobs > 0 ? p.completed_jobs / p.total_jobs : 0;

      const score = ((p.rating / 5) * 0.40) +
                    (completion_rate * 0.30) +
                    (p.acceptance_rate * 0.20) +
                    (p.responsiveness * 0.10) -
                    (p.distance_km / radiusKm * 0.15);

      return { id: p.id as string, score, distance_km: p.distance_km as number };
    });

    const eligible = scored.sort((a, b) => b.score - a.score);
    return eligible[0] || null;
  }

  static async getServiceTypes(includeInactive: boolean = false) {
    return prisma.serviceType.findMany({
      where: includeInactive ? {} : { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getServiceTypeById(id: string) {
    return prisma.serviceType.findUnique({ where: { id } });
  }

  static async createServiceType(data: {
    name: string;
    description?: string;
    basePrice?: number;
    priceUnit?: string;
    frequency?: string;
    category?: string;
    rules?: object;
    isActive?: boolean;
  }) {
    return prisma.serviceType.create({ data });
  }

  static async updateServiceType(id: string, data: {
    name?: string;
    description?: string;
    basePrice?: number;
    priceUnit?: string;
    frequency?: string;
    category?: string;
    rules?: object;
    isActive?: boolean;
  }) {
    return prisma.serviceType.update({ where: { id }, data });
  }
}

export const serviceRepository = ServiceRepository;