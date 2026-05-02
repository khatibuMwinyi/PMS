/**
 * Core Events System
 * 
 * Templated event system that fires events and creates appropriate notifications.
 * Events: AUTH_REGISTER, QUOTE_REQUESTED, QUOTE_ACCEPTED, AGREEMENT_SUBMITTED
 */

import { prisma } from '@/core/database/client';
import { fireEvent } from '@/features/notifications/actions';

// ─── Event Types ────────────────────────────────────

export type EventType = 
  | 'AUTH_REGISTER'
  | 'QUOTE_REQUESTED'
  | 'QUOTE_ACCEPTED'
  | 'AGREEMENT_SUBMITTED'
  | 'ASSIGNMENT_CREATED'
  | 'TASK_COMPLETED'
  | 'PAYMENT_RECEIVED';

export interface EventData {
  [key: string]: any;
}

// ─── Event Handlers ──────────────────────────────────

/**
 * Fire an event: logs the event and creates notifications
 */
export async function fireEventWithNotification(
  event: EventType,
  data: EventData
): Promise<void> {
  try {
    // Create notification for the user
    if (data.userId) {
      await fireEvent(event, {
        userId: data.userId,
        payload: data,
      });
    }

    // Log event for audit trail (if audit system is available)
    // This will be wired in Task 4.2
    console.log(`[EVENT] ${event}:`, JSON.stringify(data));
    
  } catch (error) {
    console.error(`Failed to fire event ${event}:`, error);
    // Don't throw - event failures shouldn't break the main flow
  }
}

// ─── Specific Event Helpers ─────────────────────────

/**
 * Fired when a new user registers
 */
export async function fireAuthRegisterEvent(params: {
  userId: string;
  email: string;
  role: string;
}) {
  await fireEventWithNotification('AUTH_REGISTER', params);
}

/**
 * Fired when a quote is requested
 */
export async function fireQuoteRequestedEvent(params: {
  userId: string;
  quoteId: string;
  propertyName: string;
  serviceType: string;
  quotedPrice: number;
}) {
  await fireEventWithNotification('QUOTE_REQUESTED', params);
}

/**
 * Fired when a quote is accepted
 */
export async function fireQuoteAcceptedEvent(params: {
  userId: string;
  quoteId: string;
  agreementId?: string;
  quotedPrice: number;
}) {
  await fireEventWithNotification('QUOTE_ACCEPTED', params);
}

/**
 * Fired when an agreement is submitted
 */
export async function fireAgreementSubmittedEvent(params: {
  userId: string;
  agreementId: string;
  quoteId: string;
  status: string;
}) {
  await fireEventWithNotification('AGREEMENT_SUBMITTED', params);
}

/**
 * Fired when an assignment is created
 */
export async function fireAssignmentCreatedEvent(params: {
  userId: string;
  assignmentId: string;
  propertyName: string;
}) {
  await fireEventWithNotification('ASSIGNMENT_CREATED', params);
}

// ─── Event Registry (for extensibility) ────────────

const eventRegistry = new Map<string, (data: EventData) => Promise<void>>();

export function registerEventHandler(event: string, handler: (data: EventData) => Promise<void>) {
  eventRegistry.set(event, handler);
}

export async function triggerEvent(event: string, data: EventData) {
  const handler = eventRegistry.get(event);
  if (handler) {
    await handler(data);
  } else {
    await fireEventWithNotification(event as EventType, data);
  }
}
