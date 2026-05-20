import { z } from 'zod';

export const BusinessProfileSchema = z.object({
  businessName: z.string().min(2, 'Business name must be at least 2 characters').max(80, 'Business name must be 80 characters or fewer'),
  mobileMoneyNumber: z
    .string()
    .regex(/^\+255\d{9}$/, 'Mobile money number must be in format +255XXXXXXXXX')
    .nullable(),
});
export type BusinessProfileInput = z.infer<typeof BusinessProfileSchema>;

export const CoverageSchema = z.object({
  serviceCategories: z
    .array(z.string().min(1))
    .min(1, 'Pick at least one service category')
    .max(8, 'Pick at most 8 service categories'),
  serviceRadiusKm: z
    .number()
    .int('Service radius must be a whole number')
    .min(5, 'Service radius must be at least 5 km')
    .max(30, 'Service radius must be at most 30 km'),
});
export type CoverageInput = z.infer<typeof CoverageSchema>;

function isOnOrAfterToday(dateStr: string): boolean {
  const parsed = new Date(`${dateStr}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) return false;
  const now = new Date();
  const startOfTodayUtc = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  return parsed.getTime() >= startOfTodayUtc.getTime();
}

export const BlockedDateSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .refine(isOnOrAfterToday, 'Date must be today or later'),
});
export type BlockedDateInput = z.infer<typeof BlockedDateSchema>;

export const RemoveBlockedDateSchema = z.object({
  id: z.string().uuid('Invalid blocked date id'),
});
