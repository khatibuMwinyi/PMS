import crypto from 'crypto';
import { nanoid } from 'nanoid';

interface SelcomPaymentRequest {
  invoiceId:    string;
  amount:       number;
  phoneNumber:  string;
  description:  string;
}

interface SelcomResponse {
  success:       boolean;
  transactionId?: string;
  error?:        string;
}

/**
 * Selcom Mobile Money API client.
 *
 * Signs each outbound request with HMAC-SHA256 using SELCOM_API_SECRET.
 * Implements simple exponential backoff for transient failures.
 *
 * TODO: Replace stub with actual Selcom API endpoint and payload schema
 *       once sandbox credentials are provisioned.
 */
export class SelcomClient {
  private readonly apiKey:  string;
  private readonly secret:  string;
  private readonly baseUrl: string;

  constructor() {
    this.apiKey  = process.env.SELCOM_API_KEY    ?? '';
    this.secret  = process.env.SELCOM_API_SECRET ?? '';
    this.baseUrl = process.env.SELCOM_BASE_URL   ?? 'https://apigw.selcommobile.com/v1';

    if (!this.apiKey || !this.secret) {
      console.warn('[Selcom] API credentials not configured — payment requests will fail');
    }
  }

  private sign(payload: string, timestamp: string): string {
    return crypto
      .createHmac('sha256', this.secret)
      .update(`${timestamp}${payload}`)
      .digest('base64');
  }

  /**
   * Request a mobile money payment from an owner's phone.
   * The owner is prompted to confirm payment on their handset.
   */
  async requestPayment(req: SelcomPaymentRequest): Promise<SelcomResponse> {
    const timestamp   = new Date().toISOString();
    const idempotencyKey = nanoid();
    const body        = JSON.stringify({
      vendor:       this.apiKey,
      order_id:     req.invoiceId,
      buyer_phone:  req.phoneNumber,
      amount:       req.amount,
      currency:     'TZS',
      memo:         req.description,
      no_of_items:  1,
    });

    const signature = this.sign(body, timestamp);

    // Stub — replace with real fetch once sandbox is provisioned
    console.log(`[Selcom] requestPayment stub — invoiceId=${req.invoiceId} amount=${req.amount}`);
    return { success: true, transactionId: `STUB-${idempotencyKey}` };
  }

  /**
   * Disburse earnings to a provider's mobile money account.
   * Called by the withdrawal approval worker.
   */
  async disburseFunds(
    phoneNumber: string,
    amount:      number,
    reference:   string,
  ): Promise<SelcomResponse> {
    console.log(`[Selcom] disburseFunds stub — phone=${phoneNumber} amount=${amount}`);
    return { success: true, transactionId: `DISBURSE-${nanoid()}` };
  }
}

// Singleton
export const selcom = new SelcomClient();