'use server';

import { prisma } from '@/core/database/client';

export interface ProviderWithScore {
  id: string;
  score: number;
  distance_km: number;
}

export async function findBestProvider(
  propertyId: string, 
  serviceTypeId: string, 
  radiusKm: number = 10,
  minScoreThreshold: number = 0
): Promise<ProviderWithScore | null> {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: { location: true }
  });

  if (!property || !property.location) throw new Error("Property location context missing");

  const serviceType = await prisma.serviceType.findUnique({
    where: { id: serviceTypeId },
    select: { category: true }
  });

  if (!serviceType) throw new Error("Service category context missing");

  // Geospatial radius search using PostGIS
  const providers = await prisma.$queryRaw<any[]>`
    SELECT 
      pp.id, pp.rating, pp.completed_jobs, pp.total_jobs,
      pp.acceptance_rate, pp.responsiveness,
      ST_DistanceSphere(pp.location, ${property.location}::geometry) / 1000 as distance_km
    FROM provider_profiles pp
    JOIN users u ON pp.user_id = u.id
    WHERE u.status = 'ACTIVE'
    AND pp.verification = 'VERIFIED' -- Corrected from verification_status to verification
    AND ST_DWithin(pp.location, ${property.location}::geometry, ${radiusKm * 1000})
    AND ${serviceType.category} = ANY(pp.service_categories)
  `;

  if (providers.length === 0) return null;

  const scored = providers.map(p => {
    const completion_rate = p.total_jobs > 0 ? p.completed_jobs / p.total_jobs : 0;
    
    // Formula: (rating[normalized] * 0.4) + (comp * 0.3) + (acc * 0.2) + (resp * 0.1) - (dist_penalty * 0.15)
    const score = ((p.rating / 5) * 0.40) + 
                  (completion_rate * 0.30) + 
                  (p.acceptance_rate * 0.20) + 
                  (p.responsiveness * 0.10) - 
                  (p.distance_km / radiusKm * 0.15);

    return { id: p.id as string, score, distance_km: p.distance_km as number };
  });

  const eligible = scored
    .filter(p => p.score >= minScoreThreshold)
    .sort((a, b) => b.score - a.score);

  return eligible[0] || null;
}