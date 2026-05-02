import { z } from 'zod';
import { NotificationType, NotificationEvent } from '@prisma/client';

// ─── Notification Types ──────────────────────────────────

export const NotificationType = {
  EMAIL: 'EMAIL',
  SMS: 'SMS',
  IN_APP: 'IN_APP',
} as const;

export const NotificationEvent = {
  AUTH_REGISTER: 'AUTH_REGISTER',
  QUOTE_REQUESTED: 'QUOTE_REQUESTED',
  QUOTE_ACCEPTED: 'QUOTE_ACCEPTED',
  AGREEMENT_SUBMITTED: 'AGREEMENT_SUBMITTED',
  ASSIGNMENT_CREATED: 'ASSIGNMENT_CREATED',
  TASK_COMPLETED: 'TASK_COMPLETED',
  PAYMENT_RECEIVED: 'PAYMENT_RECEIVED',
} as const;

// ─── Zod Schemas ───────────────────────────────────────

export const CreateNotificationSchema = z.object({
  userId: z.string().uuid(),
  type: z.enum(['EMAIL', 'SMS', 'IN_APP']),
  event: z.string().min(1),
  payload: z.record(z.any()).optional(),
});

export const MarkReadSchema = z.object({
  notificationId: z.string().uuid(),
});

export const MarkAllReadSchema = z.object({
  userId: z.string().uuid(),
});

// ─── TypeScript Types ───────────────────────────────────

export type CreateNotificationInput = z.infer<typeof CreateNotificationSchema>;
export type MarkReadInput = z.infer<typeof MarkReadSchema>;
export type MarkAllReadInput = z.infer<typeof MarkAllReadSchema>;

export interface NotificationPayload {
  [key: string]: any;
}

export interface NotificationWithUser {
  id: string;
  userId: string;
  type: string;
  event: string;
  payload: NotificationPayload | null;
  isRead: boolean;
  createdAt: Date;
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

// ─── Event Templates ────────────────────────────────────

export interface EventTemplate {
  type: keyof typeof NotificationType;
  event: keyof typeof NotificationEvent;
  getPayload: (data: any) => NotificationPayload;
  getMessage: (data: any) => string;
}

export const EVENT_TEMPLATES: Record<string, EventTemplate> = {
  AUTH_REGISTER: {
    type: 'IN_APP',
    event: 'AUTH_REGISTER',
    getPayload: (data) => ({
      userId: data.userId,
      email: data.email,
      role: data.role,
      timestamp: new Date().toISOString(),
    }),
    getMessage: (data) => `Welcome ${data.email}! Your account has been created.`,
  },
  QUOTE_REQUESTED: {
    type: 'IN_APP',
    event: 'QUOTE_REQUESTED',
    getPayload: (data) => ({
      quoteId: data.quoteId,
      propertyName: data.propertyName,
      serviceType: data.serviceType,
      quotedPrice: data.quotedPrice,
      timestamp: new Date().toISOString(),
    }),
    getMessage: (data) => `New quote requested for ${data.propertyName} - ${data.serviceType}`,
  },
  QUOTE_ACCEPTED: {
    type: 'IN_APP',
    event: 'QUOTE_ACCEPTED',
    getPayload: (data) => ({
      quoteId: data.quoteId,
      agreementId: data.agreementId,
      quotedPrice: data.quotedPrice,
      timestamp: new Date().toISOString(),
    }),
    getMessage: (data) => `Quote accepted! Agreement created.`,
  },
  AGREEMENT_SUBMITTED: {
    type: 'IN_APP',
    event: 'AGREEMENT_SUBMITTED',
    getPayload: (data) => ({
      agreementId: data.agreementId,
      quoteId: data.quoteId,
      status: data.status,
      timestamp: new Date().toISOString(),
    }),
    getMessage: (data) => `Agreement submitted and pending assignment.`,
  },
};
