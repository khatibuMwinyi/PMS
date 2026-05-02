import { z } from 'zod';

export const PriceUnitSchema = z.enum(['PER_SQM', 'PER_UNIT', 'FLAT', 'PER_BEDROOM']);

export const FrequencySchema = z.enum(['WEEKLY', 'BIWEEKLY', 'MONTHLY']);

// Pricing rules type for JSON storage
export interface PricingRules {
  locationFactor?: Record<string, number>;
  frequencyMultiplier?: Record<string, number>;
  unitTypeFactor?: Record<string, number>;
}

export const CreateServiceTypeSchema = z.object({
  name: z.string().min(1, 'Service name is required'),
  description: z.string().min(1, 'Description is required'),
  basePrice: z.coerce.number().positive('Base price must be positive'),
  priceUnit: PriceUnitSchema.default('PER_UNIT'),
  frequency: z.array(z.string()).default(['MONTHLY']),
  category: z.string().min(1, 'Category is required'),
  rules: z.record(z.any()).optional(),
  isActive: z.boolean().default(true),
});

export const UpdateServiceTypeSchema = CreateServiceTypeSchema.partial();

export type CreateServiceTypeInput = z.infer<typeof CreateServiceTypeSchema>;
export type UpdateServiceTypeInput = z.infer<typeof UpdateServiceTypeSchema>;