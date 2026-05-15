import { NextResponse } from 'next/server';
import { withIdempotency } from '@/core/idempotency/handler';
import {
  processInvoicePayment,
  handleInvoicePaymentFailure,
} from '@/features/wallets/actions';
import {
  parseSelcomWebhookPayload,
  verifySelcomSignature,
} from '@/integrations/selcom/webhooks';

/**
 * POST /api/webhooks/selcom
 *
 * 1. Parse body — 400 on malformed
 * 2. Verify HMAC signature — 401 on tamper
 * 3. Idempotency guard — return 200 immediately if processed
 * 4. Saga: SUCCESS → 80/20 split + invoice mark paid; FAILED → retry counter
 * 5. Always 200 to suppress unbounded Selcom retries
 */
export async function POST(request: Request): Promise<NextResponse> {
  let body: unknown;

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

  try {
    const valid = verifySelcomSignature(payload);
    if (!valid) {
      console.error(
        '[Webhook] Invalid signature for transactionId:',
        payload.transactionId,
      );
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const result = await withIdempotency(
    payload.transactionId,
    `SELCOM_PAYMENT_${payload.status}`,
    body as Record<string, unknown>,
    async () => {
      if (payload.status === 'SUCCESS') {
        await processInvoicePayment(
          payload.invoiceId,
          payload.amount,
          payload.transactionId,
        );
        console.log(
          `[Webhook] Payment processed for invoice ${payload.invoiceId}: TZS ${payload.amount}`,
        );
        return;
      }

      if (payload.status === 'FAILED') {
        await handleInvoicePaymentFailure(
          payload.invoiceId,
          payload.transactionId,
          'Selcom reported FAILED',
        );
        return;
      }

      // PENDING — no-op
    },
  );

  return NextResponse.json({
    received: true,
    alreadyProcessed: !result.processed,
  });
}
