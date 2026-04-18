import { z } from 'zod';

export const PriceUnitSchema = z.enum(['PER_SQM', 'PER_UNIT', 'FLAT', 'PER_BEDROOM']);

export const FrequencySchema = z.enum(['WEEKLY', 'BIWEEKLY', 'MONTHLY']);

export const CreateServiceTypeSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  basePrice: z.number().positive(),
  priceUnit: PriceUnitSchema,
  frequency: z.array(z.string()), // Align with schema's String[]
  category: z.string().min(1),
  rules: z.record(z.any()).optional(),
});

export const UpdateServiceTypeSchema = CreateServiceTypeSchema.partial();

export type CreateServiceTypeInput = z.infer<typeof CreateServiceTypeSchema>;
export type UpdateServiceTypeInput = z.infer<typeof UpdateServiceTypeSchema>;