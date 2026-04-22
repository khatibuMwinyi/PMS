import { z } from 'zod';

const BaseAuthSchema = z.object({
  email: z.string().email(),
  phone: z.string().min(10),
  password: z.string().min(8),
});

export const OwnerRegisterSchema = BaseAuthSchema.extend({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

export const ProviderRegisterSchema = BaseAuthSchema.extend({
  businessName: z.string().min(1),
  serviceCategories: z.array(z.string()),
  operationalZones: z.array(z.string()),
});

export type OwnerRegisterInput = z.infer<typeof OwnerRegisterSchema>;
export type ProviderRegisterInput = z.infer<typeof ProviderRegisterSchema>;