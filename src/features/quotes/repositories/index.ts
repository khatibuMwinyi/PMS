import { prisma } from '@/core/database/client';

export class QuoteRepository {
  static async findById(quoteId: string) {
    return prisma.quote.findUnique({
      where: { id: quoteId },
      include: {
        property: true,
        serviceType: true,
        owner: {
          select: { id: true, email: true, role: true },
        },
        agreement: true,
      },
    });
  }

  static async findByOwner(ownerId: string) {
    return prisma.quote.findMany({
      where: { ownerId },
      include: {
        property: { select: { id: true, name: true, zone: true } },
        serviceType: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async findByStatus(status: string) {
    return prisma.quote.findMany({
      where: { status },
      include: {
        property: { select: { id: true, name: true } },
        serviceType: { select: { id: true, name: true } },
        owner: { select: { id: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async findExpired() {
    return prisma.quote.findMany({
      where: {
        status: 'QUOTED',
        priceLockedUntil: { lt: new Date() },
      },
    });
  }

  static async create(data: {
    ownerId: string;
    propertyId: string;
    serviceTypeId: string;
    quotedPrice: number;
    priceLockedUntil: Date;
    status: string;
  }) {
    return prisma.quote.create({ data });
  }

  static async updateStatus(quoteId: string, status: string) {
    return prisma.quote.update({
      where: { id: quoteId },
      data: { status, updatedAt: new Date() },
    });
  }

  static async expireMany(quoteIds: string[]) {
    return prisma.quote.updateMany({
      where: { id: { in: quoteIds } },
      data: { status: 'EXPIRED', updatedAt: new Date() },
    });
  }
}

export const quoteRepository = QuoteRepository;