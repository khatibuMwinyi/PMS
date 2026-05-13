import { agreementRepository } from '../repositories';

export class AgreementService {
  static async createFromQuote(quoteId: string, ownerId: string, propertyId: string, quotedPrice: number) {
    return agreementRepository.create({
      quoteId,
      ownerId,
      propertyId,
      quotedPrice,
      status: 'QUOTED',
    });
  }

  static async activateAgreement(agreementId: string) {
    return agreementRepository.updateStatus(agreementId, 'ACTIVE');
  }

  static async completeAgreement(agreementId: string) {
    return agreementRepository.updateStatus(agreementId, 'COMPLETED');
  }

  static async cancelAgreement(agreementId: string) {
    return agreementRepository.updateStatus(agreementId, 'CANCELLED');
  }
}

export const agreementService = AgreementService;