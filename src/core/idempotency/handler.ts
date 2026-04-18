import { prisma } from '@/core/database/client';

/**
 * Idempotency wrapper for external webhook events.
 * Prevents duplicate processing of the same external transaction.
 */
export async function withIdempotency(
  externalId: string,
  eventType: string,
  payload: any,
  businessLogic: () => Promise<void>
) {
  try {
    await prisma.processedWebhook.create({
      data: {
        external_id: externalId,
        event_type: eventType,
        payload,
      },
    });
  } catch (error: any) {
    if (error.code === 'P2002') return;
    throw error;
  }

  await businessLogic();
}
