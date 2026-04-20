import crypto from 'crypto';

export interface SelcomWebhookPayload {
  transactionId:  string;   // Selcom's unique transaction reference
  invoiceId:      string;   // Our internal invoice/assignment ID
  amount:         number;
  status:         'SUCCESS' | 'FAILED' | 'PENDING';
  timestamp:      string;
  signature:      string;
}

/**
 * Verify the HMAC-SHA256 signature on an incoming Selcom webhook.
 *
 * Selcom signs: `${transactionId}${invoiceId}${amount}${status}${timestamp}`
 * using our SELCOM_WEBHOOK_SECRET as the key.
 *
 * If the secret is not configured, we log a warning but allow in development.
 * In production this MUST be set — an unverified webhook is a financial risk.
 */
export function verifySelcomSignature(payload: SelcomWebhookPayload): boolean {
  const secret = process.env.SELCOM_WEBHOOK_SECRET;

  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('SELCOM_WEBHOOK_SECRET is not configured — refusing webhook');
    }
    console.warn('[Selcom] SELCOM_WEBHOOK_SECRET not set — skipping signature verification (dev only)');
    return true;
  }

  const message = [
    payload.transactionId,
    payload.invoiceId,
    payload.amount,
    payload.status,
    payload.timestamp,
  ].join('');

  const expected = crypto
    .createHmac('sha256', secret)
    .update(message, 'utf8')
    .digest('hex');

  // Constant-time comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(expected, 'hex'),
    Buffer.from(payload.signature, 'hex'),
  );
}

/**
 * Parse and validate the raw request body as a Selcom webhook payload.
 * Returns null if the body is malformed.
 */
export function parseSelcomWebhookPayload(body: unknown): SelcomWebhookPayload | null {
  if (typeof body !== 'object' || body === null) return null;

  const b = body as Record<string, unknown>;

  if (
    typeof b.transactionId !== 'string' ||
    typeof b.invoiceId     !== 'string' ||
    typeof b.amount        !== 'number' ||
    typeof b.status        !== 'string' ||
    typeof b.timestamp     !== 'string' ||
    typeof b.signature     !== 'string'
  ) {
    return null;
  }

  return {
    transactionId: b.transactionId,
    invoiceId:     b.invoiceId,
    amount:        b.amount,
    status:        b.status as SelcomWebhookPayload['status'],
    timestamp:     b.timestamp,
    signature:     b.signature,
  };
}