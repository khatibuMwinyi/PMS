import { z } from 'zod';

// Default Dar es Salaam coordinates (city centre)
export const DAR_ES_SALAAM_LAT = -6.7924;
export const DAR_ES_SALAAM_LNG = 39.2083;

export const PropertyTypeEnum = z.enum([
  'APARTMENT_BUILDING',
  'SINGLE_FAMILY',
  'TOWNHOUSE',
  'COMMERCIAL',
]);
export type PropertyType = z.infer<typeof PropertyTypeEnum>;

export interface ImageMetadata {
  url: string;
  caption?: string;
  uploadedAt: Date;
}

export const CreatePropertySchema = z.object({
  name:      z.string().min(1, 'Property name is required'),
  address:   z.string().min(5, 'Full address is required'),
  zone:      z.string().min(2, 'Neighbourhood / zone is required'),
  latitude:  z.coerce.number().min(-90).max(90).default(DAR_ES_SALAAM_LAT),
  longitude: z.coerce.number().min(-180).max(180).default(DAR_ES_SALAAM_LNG),
  type:      PropertyTypeEnum.default('SINGLE_FAMILY'),
  unitCount: z.coerce.number().min(1, 'At least 1 unit is required').default(1),
  imageUrls: z.array(z.string().url()).default([]),
});

export const UpdatePropertySchema = CreatePropertySchema.partial().extend({
  id: z.string().uuid(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING']).optional(),
});

export const AddUnitSchema = z.object({
  propertyId:    z.string().uuid(),
  unitName:      z.string().min(1, 'Unit name is required'),
  unitType:      z.enum(['APARTMENT', 'HOUSE', 'COMMERCIAL']),
  squareFootage: z.number().positive('Square footage must be positive'),
});

export type CreatePropertyInput = z.infer<typeof CreatePropertySchema>;
export type UpdatePropertyInput = z.infer<typeof UpdatePropertySchema>;
export type AddUnitInput = z.infer<typeof AddUnitSchema>;
