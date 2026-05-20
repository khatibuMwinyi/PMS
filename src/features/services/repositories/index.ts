import { prisma } from '@/core/database/client';
import type { PriceUnit } from '@prisma/client';

export interface ProviderWithScore {
  id: string;
  score: number;
  distance_km: number;
}

export class ServiceRepository {
  /**
   * Spec §XI scoring + capacity gate.
   * Score = rating 40% + completion 30% + acceptance 20% + responsiveness 10% − distance penalty.
   *
   * When scheduledDate is provided, providers with a matching blocked_date are excluded.
   */
  static async findBestProvider(
    propertyId: string,
    _serviceTypeId: string,
    radiusKm: number = 10,
    scheduledDate?: Date,
  ): Promise<ProviderWithScore | null> {
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { latitude: true, longitude: true },
    });
    if (!property) throw new Error('Property not found');

    const providers = scheduledDate
      ? await prisma.$queryRaw<any[]>`
          SELECT
            pp.id, pp.rating, pp.completed_jobs, pp.total_jobs,
            pp.acceptance_rate, pp.responsiveness, pp.current_load, pp.max_concurrent,
            ST_DistanceSphere(
              ST_SetSRID(ST_MakePoint(pp.longitude, pp.latitude), 4326),
              ST_SetSRID(ST_MakePoint(${property.longitude}, ${property.latitude}), 4326)
            ) / 1000 as distance_km
          FROM provider_profiles pp
          JOIN users u ON pp.user_id = u.id
          WHERE u.status = 'ACTIVE'
            AND pp.verification = 'VERIFIED'
            AND (pp.suspended_until IS NULL OR pp.suspended_until < NOW())
            AND pp.current_load < pp.max_concurrent
            AND ST_DWithin(
              ST_SetSRID(ST_MakePoint(pp.longitude, pp.latitude), 4326),
              ST_SetSRID(ST_MakePoint(${property.longitude}, ${property.latitude}), 4326),
              ${radiusKm * 1000}
            )
            AND NOT EXISTS (
              SELECT 1 FROM provider_blocked_dates pbd
              WHERE pbd.provider_id = pp.id
                AND pbd.blocked_date = ${scheduledDate}::date
            )
        `
      : await prisma.$queryRaw<any[]>`
          SELECT
            pp.id, pp.rating, pp.completed_jobs, pp.total_jobs,
            pp.acceptance_rate, pp.responsiveness, pp.current_load, pp.max_concurrent,
            ST_DistanceSphere(
              ST_SetSRID(ST_MakePoint(pp.longitude, pp.latitude), 4326),
              ST_SetSRID(ST_MakePoint(${property.longitude}, ${property.latitude}), 4326)
            ) / 1000 as distance_km
          FROM provider_profiles pp
          JOIN users u ON pp.user_id = u.id
          WHERE u.status = 'ACTIVE'
            AND pp.verification = 'VERIFIED'
            AND (pp.suspended_until IS NULL OR pp.suspended_until < NOW())
            AND pp.current_load < pp.max_concurrent
            AND ST_DWithin(
              ST_SetSRID(ST_MakePoint(pp.longitude, pp.latitude), 4326),
              ST_SetSRID(ST_MakePoint(${property.longitude}, ${property.latitude}), 4326),
              ${radiusKm * 1000}
            )
        `;

    if (providers.length === 0) return null;

    const scored = providers.map((p) => {
      const completionRate = p.total_jobs > 0 ? p.completed_jobs / p.total_jobs : 0;
      const score =
        (p.rating / 5) * 0.4 +
        completionRate * 0.3 +
        p.acceptance_rate * 0.2 +
        p.responsiveness * 0.1 -
        (p.distance_km / radiusKm) * 0.15;
      return { id: p.id as string, score, distance_km: p.distance_km as number };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored[0] ?? null;
  }

  static async getServiceTypes(includeInactive: boolean = false) {
    return prisma.serviceType.findMany({
      where: includeInactive ? {} : { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  static async getServiceTypeById(id: string) {
    return prisma.serviceType.findUnique({ where: { id } });
  }

  static async createServiceType(data: {
    name: string;
    description: string;
    basePrice: number;
    priceUnit?: PriceUnit;
    pricingRules?: object;
    isActive?: boolean;
  }) {
    return prisma.serviceType.create({
      data: {
        name: data.name,
        description: data.description,
        basePrice: data.basePrice,
        priceUnit: data.priceUnit ?? 'FLAT',
        pricingRules: (data.pricingRules ?? {}) as object,
        isActive: data.isActive ?? true,
      },
    });
  }

  static async updateServiceType(
    id: string,
    data: {
      name?: string;
      description?: string;
      basePrice?: number;
      priceUnit?: PriceUnit;
      pricingRules?: object;
      isActive?: boolean;
    },
  ) {
    return prisma.serviceType.update({ where: { id }, data });
  }
}

export const serviceRepository = ServiceRepository;
