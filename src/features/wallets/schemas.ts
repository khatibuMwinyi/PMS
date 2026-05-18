import { z } from 'zod';

export const MIN_WITHDRAWAL_TZS = 50_000;

export const WithdrawalRequestSchema = z.object({
  walletId: z.string().uuid(),
  amount: z.number().int().min(MIN_WITHDRAWAL_TZS),
  mobileNumber: z.string().regex(/^\+255\d{9}$/, 'Mobile number must be +255 followed by 9 digits'),
});

export type WithdrawalRequestInput = z.infer<typeof WithdrawalRequestSchema>;
