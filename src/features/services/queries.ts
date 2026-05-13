'use server';

import { serviceRepository, type ProviderWithScore } from './repositories';

export async function findBestProvider(
  propertyId: string,
  serviceTypeId: string,
  radiusKm: number = 10,
  minScoreThreshold: number = 0
): Promise<ProviderWithScore | null> {
  const result = await serviceRepository.findBestProvider(propertyId, serviceTypeId, radiusKm);
  if (result && result.score >= minScoreThreshold) {
    return result;
  }
  return null;
}