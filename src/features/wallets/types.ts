import { z } from 'zod';

export const ProcessPaymentSchema = z.object({
  invoiceId: z.string().uuid(),
  amount: z.number().positive(),
});

export const DisputeResolutionSchema = z.object({
  assignmentId: z.string().uuid(),
  resolution: z.enum(['REFUND', 'RELEASE', 'SPLIT']),
});

export type ProcessPaymentInput = z.infer<typeof ProcessPaymentSchema>;
export type DisputeResolutionInput = z.infer<typeof DisputeResolutionSchema>;
