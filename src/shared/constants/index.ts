// Common constants
export const DEFAULT_COORDINATES = {
  DAR_ES_SALAAM_LAT: -6.7924,
  DAR_ES_SALAAM_LNG: 39.2083,
} as const;

export const PROPERTY_TYPES = ['APARTMENT', 'HOUSE', 'COMMERCIAL', 'VILLA', 'TOWNHOUSE'] as const;
export type PropertyType = typeof PROPERTY_TYPES[number];

export const PROPERTY_STATUS = ['ACTIVE', 'INACTIVE', 'MAINTENANCE'] as const;
export type PropertyStatus = typeof PROPERTY_STATUS[number];