/**
 * SMS Integration - Factory Pattern
 * 
 * Provides a swappable SMS provider interface.
 * Currently uses a mock provider for development.
 * Production would swap in Twilio, Africa's Talking, etc.
 */

// ─── SMS Provider Interface ──────────────────────────

export interface ISMSProvider {
  sendSMS(phone: string, message: string): Promise<{ success: boolean; messageId?: string; error?: string }>;
  getStatus?(messageId: string): Promise<'SENT' | 'DELIVERED' | 'FAILED'>;
}

// ─── Mock SMS Provider (Development) ─────────────────

class MockSMSProvider implements ISMSProvider {
  async sendSMS(phone: string, message: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    // Mock implementation - just logs to console
    console.log(`[MOCK SMS] To: ${phone}`);
    console.log(`[MOCK SMS] Message: ${message}`);
    
    // Simulate success
    return {
      success: true,
      messageId: `mock_${Date.now()}`,
    };
  }

  async getStatus(messageId: string): Promise<'SENT' | 'DELIVERED' | 'FAILED'> {
    return 'DELIVERED';
  }
}

// ─── Twilio Provider (Stub for Future) ──────────────

class TwilioSMSProvider implements ISMSProvider {
  private accountSid: string;
  private authToken: string;
  private fromNumber: string;

  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID || '';
    this.authToken = process.env.TWILIO_AUTH_TOKEN || '';
    this.fromNumber = process.env.TWILIO_FROM_NUMBER || '';
    
    if (!this.accountSid || !this.authToken) {
      throw new Error('Twilio credentials not configured');
    }
  }

  async sendSMS(phone: string, message: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    // TODO: Implement with twilio package
    // const twilio = require('twilio');
    // const client = twilio(this.accountSid, this.authToken);
    // const result = await client.messages.create({...});
    throw new Error('Twilio provider not yet implemented');
  }

  async getStatus(messageId: string): Promise<'SENT' | 'DELIVERED' | 'FAILED'> {
    // TODO: Implement status check
    throw new Error('Twilio provider not yet implemented');
  }
}

// ─── Africa's Talking Provider (Stub for Future) ─────

class AfricasTalkingProvider implements ISMSProvider {
  private apiKey: string;
  private username: string;
  private fromNumber: string;

  constructor() {
    this.apiKey = process.env.AFRICAS_TALKING_API_KEY || '';
    this.username = process.env.AFRICAS_TALKING_USERNAME || '';
    this.fromNumber = process.env.AFRICAS_TALKING_FROM || '';
    
    if (!this.apiKey || !this.username) {
      throw new Error("Africa's Talking credentials not configured");
    }
  }

  async sendSMS(phone: string, message: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    // TODO: Implement with africastalking package
    throw new Error("Africa's Talking provider not yet implemented");
  }

  async getStatus(messageId: string): Promise<'SENT' | 'DELIVERED' | 'FAILED'> {
    // TODO: Implement status check
    throw new Error("Africa's Talking provider not yet implemented");
  }
}

// ─── Provider Factory ────────────────────────────────

type SMSProviderType = 'mock' | 'twilio' | 'africas-talking';

export function createSMSProvider(type?: SMSProviderType): ISMSProvider {
  const providerType = type || (process.env.SMS_PROVIDER as SMSProviderType) || 'mock';

  switch (providerType) {
    case 'twilio':
      return new TwilioSMSProvider();
    case 'africas-talking':
      return new AfricasTalkingProvider();
    case 'mock':
    default:
      return new MockSMSProvider();
  }
}

// ─── Singleton Instance ──────────────────────────────

let smsProviderInstance: ISMSProvider | null = null;

export function getSMSProvider(): ISMSProvider {
  if (!smsProviderInstance) {
    smsProviderInstance = createSMSProvider();
  }
  return smsProviderInstance;
}

// ─── Convenience Function ────────────────────────────

export async function sendSMS(phone: string, message: string) {
  const provider = getSMSProvider();
  return provider.sendSMS(phone, message);
}
