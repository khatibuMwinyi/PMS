import { nanoid } from 'nanoid';

/**
 * Mock payment processor for OPSMP
 * Simulates payment flows without real Selcom integration
 */

export interface MockPaymentRequest {
  invoiceId: string;
  amount: number;
  description: string;
  metadata?: Record<string, any>;
}

export interface MockDisbursementRequest {
  walletId: string;
  amount: number;
  reference: string;
  providerPhone: string;
}

export interface MockPaymentResponse {
  success: boolean;
  transactionId: string;
  message?: string;
  mockData?: {
    processingTime: number;
    simulatedBankResponse: string;
    fees: number;
  };
}

export interface MockDisbursementResponse {
  success: boolean;
  approvalId: string;
  estimatedPayoutDate?: string;
  message?: string;
  mockData?: {
    processingTime: number;
    approvalCode: string;
    disbursementMethod: 'MOBILE_MONEY' | 'BANK_TRANSFER';
  };
}

/**
 * Mock Payment Processor
 */
export class MockPaymentProcessor {
  private processingDelay = 1000; // 1 second mock processing time
  private successRate = 0.95; // 95% success rate

  /**
   * Process a payment (mock)
   * Simulates owner payment for services
   */
  async processPayment(request: MockPaymentRequest): Promise<MockPaymentResponse> {
    // Simulate processing delay
    await this.delay(this.processingDelay);

    // Simulate occasional failures
    const isSuccess = Math.random() < this.successRate;
    const transactionId = `PAY-${nanoid()}`;

    if (isSuccess) {
      return {
        success: true,
        transactionId,
        mockData: {
          processingTime: this.processingDelay,
          simulatedBankResponse: 'SUCCESS - Payment confirmed',
          fees: 0, // No fees in mock
        },
      };
    }

    return {
      success: false,
      transactionId,
      message: 'Mock payment failed - insufficient funds (simulated)',
    };
  }

  /**
   * Process a withdrawal (mock)
   * Simulates provider cash-out request
   */
  async processWithdrawal(request: MockDisbursementRequest): Promise<MockDisbursementResponse> {
    // Simulate processing delay
    await this.delay(this.processingDelay);

    // Simulate approval workflow
    const approvalId = `WD-${nanoid()}`;
    const payoutDate = this.calculatePayoutDate();

    return {
      success: true,
      approvalId,
      estimatedPayoutDate: payoutDate,
      mockData: {
        processingTime: this.processingDelay,
        approvalCode: `APP-${nanoid()}`,
        disbursementMethod: 'MOBILE_MONEY',
      },
    };
  }

  /**
   * Simulate payment webhook (mock Selcom equivalent)
   */
  async simulatePaymentWebhook(payload: any): Promise<MockPaymentResponse> {
    // Log the webhook for idempotency
    console.log('[MOCK PAYMENT] Webhook received:', payload);

    // Process based on event type
    if (payload.eventType === 'payment_confirmed') {
      return await this.processPayment({
        invoiceId: payload.invoiceId,
        amount: payload.amount,
        description: 'Payment confirmed',
      });
    }

    if (payload.eventType === 'disbursement_approved') {
      return {
        success: true,
        transactionId: payload.transactionId,
        message: 'Disbursement approved',
      };
    }

    throw new Error('Unsupported event type');
  }

  /**
   * Get mock transaction status
   */
  async getTransactionStatus(transactionId: string): Promise<{
    status: 'PENDING' | 'COMPLETED' | 'FAILED';
    details: string;
  }> {
    // Simulate different states based on transaction ID
    if (transactionId.startsWith('PAY-')) {
      return {
        status: 'COMPLETED',
        details: 'Payment processed successfully',
      };
    }

    if (transactionId.startsWith('WD-')) {
      return {
        status: 'PENDING',
        details: 'Withdrawal approved, awaiting payout',
      };
    }

    return {
      status: 'FAILED',
      details: 'Transaction not found',
    };
  }

  /**
   * Generate mock payment report
   */
  async generatePaymentReport(startDate: Date, endDate: Date): Promise<{
    totalPayments: number;
    totalAmount: number;
    averageProcessingTime: number;
    successRate: number;
  }> {
    // Mock data for demonstration
    return {
      totalPayments: 150,
      totalAmount: 7500000, // TZS
      averageProcessingTime: 1.2, // seconds
      successRate: 0.95,
    };
  }

  /**
   * Simulate payment reconciliation
   */
  async reconcilePayments(): Promise<{
    matched: number;
    discrepancies: number;
    totalAmount: number;
  }> {
    // Mock reconciliation results
    return {
      matched: 145,
      discrepancies: 5,
      totalAmount: 7250000,
    };
  }

  /**
   * Helper: calculate mock payout date
   */
  private calculatePayoutDate(): string {
    const now = new Date();
    const payoutDate = new Date(now);
    payoutDate.setDate(payoutDate.getDate() + 2); // 2 days from now
    return payoutDate.toISOString();
  }

  /**
   * Helper: delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Singleton instance
export const mockPaymentProcessor = new MockPaymentProcessor();