import { z } from 'zod';

export const CheckInSchema = z.object({
  taskId: z.string().uuid(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().nullable(),
  forceManualReview: z.boolean().optional(),
});

export const EvidenceSubmissionSchema = z.object({
  taskId: z.string().uuid(),
  imageDataUrls: z.array(z.string().startsWith('data:image/')).min(3).max(10),
});

export type CheckInInput = z.infer<typeof CheckInSchema>;
export type EvidenceSubmissionInput = z.infer<typeof EvidenceSubmissionSchema>;
