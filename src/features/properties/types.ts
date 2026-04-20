import { z } from 'zod';

// Default Dar es Salaam coordinates (city centre)
export const DAR_ES_SALAAM_LAT =  -6.7924;
export const DAR_ES_SALAAM_LNG =  39.2083;

export const CreatePropertySchema = z.object({
  name:      z.string().min(1, 'Property name is required'),
  address:   z.string().min(1, 'Full address is required'),
  zone:      z.string().min(1, 'Neighbourhood / zone is required'),
  latitude:  z.coerce.number().default(DAR_ES_SALAAM_LAT),
  longitude: z.coerce.number().default(DAR_ES_SALAAM_LNG),
});

export const AddUnitSchema = z.object({
  propertyId:    z.string().uuid(),
  unitName:      z.string().min(1),
  unitType:      z.enum(['APARTMENT', 'HOUSE', 'COMMERCIAL']),
  squareFootage: z.number().positive(),
});

export type CreatePropertyInput = z.infer<typeof CreatePropertySchema>;
export type AddUnitInput        = z.infer<typeof AddUnitSchema>;