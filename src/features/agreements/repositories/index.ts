import { prisma } from '@/core/database/client';
import type { AgreementStatus } from '@prisma/client';

export class AgreementRepository {
  static async findById(agreementId: string) {
    return prisma.agreement.findUnique({
      where: { id: agreementId },
      include: {
        quote: {
          include: {
            property: true,
            serviceType: true,
            owner: { select: { id: true, email: true } },
          },
        },
        owner: { select: { id: true, email: true } },
        property: true,
        serviceType: true,
        invoice: true,
        assignment: true,
      },
    });
  }

  static async findByOwner(ownerId: string) {
    return prisma.agreement.findMany({
      where: { ownerId },
      include: {
        quote: {
          select: { id: true, property: { select: { id: true, name: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async findByStatus(status: AgreementStatus) {
    return prisma.agreement.findMany({
      where: { status },
      include: {
        quote: {
          include: {
            property: { select: { id: true, name: true } },
            owner: { select: { id: true, email: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async create(data: {
    quoteId: string;
    ownerId: string;
    propertyId: string;
    serviceTypeId: string;
    quotedPrice: number;
    status: AgreementStatus;
  }) {
    return prisma.agreement.create({ data });
  }

  static async updateStatus(agreementId: string, status: AgreementStatus) {
    return prisma.agreement.update({
      where: { id: agreementId },
      data: { status },
    });
  }
}

export const agreementRepository = AgreementRepository;
