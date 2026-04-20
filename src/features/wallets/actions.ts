import { prisma } from '@/core/database/client';
import { nanoid }  from 'nanoid';

export type IdempotencyResult =
  | { processed: false }   // Already handled — caller returns 200 immediately
  | { processed: true  }   // First time — business logic was executed

/**
 * Idempotency wrapper for all external webhook events.
 *
 * Protocol:
 *   1. Attempt INSERT into processed_webhooks using the externalId as the
 *      unique key.
 *   2. If the INSERT succeeds → this is the first time we've seen this event.
 *      Execute businessLogic().
 *   3. If the INSERT throws a UNIQUE constraint violation (Prisma P2002) →
 *      we have already processed this event. Return { processed: false }
 *      immediately with ZERO side effects.
 *
 * This prevents double-credit from Selcom retries even if our server
 * crashes after crediting the wallet but before acknowledging the webhook.
 *
 * @param externalId   The unique ID from the payment provider (Selcom txRef)
 * @param eventType    Human-readable event label (e.g. "PAYMENT_SUCCESS")
 * @param payload      Full raw payload — stored for audit
 * @param businessLogic The function that moves money. Called at most once per externalId.
 */
export async function withIdempotency(
  externalId:    string,
  eventType:     string,
  payload:       Record<string, unknown>,
  businessLogic: () => Promise<void>,
): Promise<IdempotencyResult> {
  // ── Step 1: Claim the event ──────────────────────────────────────
  try {
    await prisma.processedWebhook.create({
      data: {
        id:         nanoid(),
        externalId,
        eventType,
        payload,
      },
    });
  } catch (err: any) {
    // P2002 = Prisma unique constraint violation
    if (err?.code === 'P2002') {
      // Already processed — this is a Selcom retry or a duplicate delivery.
      // Return immediately. The caller MUST respond 200 OK to prevent
      // Selcom from retrying indefinitely.
      return { processed: false };
    }
    // Any other DB error is a real failure — let it propagate
    throw err;
  }

  // ── Step 2: Execute business logic exactly once ──────────────────
  await businessLogic();

  return { processed: true };
}