/**
 * Calculate distance between two points using Haversine formula
 * Returns distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (value: number) => (value * Math.PI) / 180;

  const R = 6371; // Earth's radius in kilometers
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lon2 - lon1);

  const a = Math.sin(Δφ / 2) ** 2 +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Calculate distance with PostgreSQL PostGIS
 * Returns distance in kilometers
 */
export function calculatePostGISDistance(
  providerLat: number,
  providerLon: number,
  propertyLat: number,
  propertyLon: number
): number {
  // This would be used in Prisma $queryRaw
  // ST_DistanceSphere returns meters, so we divide by 1000
  return `
    ST_DistanceSphere(
      ST_SetSRID(ST_MakePoint(${providerLon}, ${providerLat}), 4326),
      ST_SetSRID(ST_MakePoint(${propertyLon}, ${propertyLat}), 4326)
    ) / 1000
  `;
}

/**
 * Check if a point is within a radius of another point
 */
export function isWithinRadius(
  pointLat: number,
  pointLon: number,
  centerLat: number,
  centerLon: number,
  radiusKm: number
): boolean {
  const distance = calculateDistance(pointLat, pointLon, centerLat, centerLon);
  return distance <= radiusKm;
}