import { z } from 'zod';

export const PropertyTypeSchema = z.enum(['APARTMENT_BUILDING', 'SINGLE_FAMILY', 'TOWNHOUSE', 'COMMERCIAL']);

export const UnitSchema = z.object({
  unitNumber: z.string().min(1),
  bedrooms: z.number().int().min(0),
  bathrooms: z.number().int().min(0),
  sqm: z.number().int().min(0),
});

export const CreatePropertySchema = z.object({
  name: z.string().min(1),
  type: PropertyTypeSchema,
  address: z.string().min(1),
  city: z.string().min(1),
  latitude: z.coerce.number(), // Add latitude
  longitude: z.coerce.number(), // Add longitude
  unitCount: z.number().int().min(1).default(1),
  units: z.array(UnitSchema).optional(),
});

export const AddUnitSchema = z.object({
  propertyId: z.string().uuid(),
  unitNumber: z.string().min(1),
  bedrooms: z.number().int().min(0),
  bathrooms: z.number().int().min(0),
  sqm: z.number().int().min(0),
});

export type CreatePropertyInput = z.infer<typeof CreatePropertySchema>;
export type AddUnitInput = z.infer<typeof AddUnitSchema>;