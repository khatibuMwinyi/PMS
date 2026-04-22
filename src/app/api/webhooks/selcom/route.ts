import { NextResponse }               from 'next/server';
import { withIdempotency }            from '@/core/idempotency/handler';
import { processServicePayment }      from '@/features/wallets/actions';
import { parseSelcomWebhookPayload, verifySelcomSignature } from '@/integrations/selcom/webhooks';

/**
 * POST /api/webhooks/selcom
 *
 * Security model:
 *   1. Parse the body — reject malformed payloads with 400
 *   2. Verify HMAC-SHA256 signature — reject unsigned/tampered payloads with 401
 *   3. Pass to withIdempotency() — if already processed, return 200 immediately
 *   4. Execute the 80/20 saga — one atomic Serializable transaction
 *   5. Always return 200 so Selcom does not retry a successfully-processed event
 *
 * Why always 200?
 *   Selcom will retry on any non-2xx response. Since our idempotency table
 *   prevents double-processing, a retry is always safe — but we must respond
 *   200 to prevent unbounded retries on legitimate events where our server
 *   crashed AFTER processing but BEFORE responding.
 */
export async function POST(request: Request): Promise<NextResponse> {
  let body: unknown;

  // ── Step 1: Parse body ───────────────────────────────────────────
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const payload = parseSelcomWebhookPayload(body);
  if (!payload) {
    return NextResponse.json(
      { error: 'Malformed webhook payload — required fields missing' },
      { status: 400 },
    );
  }

  // ── Step 2: Verify signature ─────────────────────────────────────
  try {
    const valid = verifySelcomSignature(payload);
    if (!valid) {
      console.error('[Webhook] Invalid signature for transactionId:', payload.transactionId);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }

  // ── Step 3 + 4: Idempotency gate → Saga ─────────────────────────
  const result = await withIdempotency(
    payload.transactionId,
    `SELCOM_PAYMENT_${payload.status}`,
    body as Record<string, unknown>,
    async () => {
      if (payload.status !== 'SUCCESS') {
        console.log(
          `[Webhook] Non-success status for ${payload.transactionId}: ${payload.status}`
        );
        return;
      }

      try {
        await processServicePayment(
          payload.invoiceId,
          payload.amount,
        );
        console.log(
          `[Webhook] Payment processed for assignment ${payload.invoiceId}: amount=TZS ${payload.amount}`
        );
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error(
          `[Webhook] Failed to process payment for assignment ${payload.invoiceId}:`,
          errorMessage
        );
        throw err;
      }
    },
  );

  // ── Step 5: Always 200 ───────────────────────────────────────────
  return NextResponse.json({
    received: true,
    alreadyProcessed: !result.processed,
  });
}