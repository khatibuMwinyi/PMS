import { prisma } from '@/core/database/client';
import Decimal from 'decimal.js';
import { AgreementStatus } from './types';

/**
 * Agreement Queries for OPSMP Platform
 * 
 * Query functions for agreements with proper scoping and filtering.
 */

/**
 * Get agreement by ID with related data
 */
export async function getAgreementById(agreementId: string) {
  return prisma.agreement.findUnique({
    where: { id: agreementId },
    include: {
      quote: {
        include: {
          property: true,
          serviceType: true,
          owner: {
            select: { id: true, email: true },
          },
        },
      },
      owner: {
        select: { id: true, email: true },
      },
      property: true,
    },
  });
}

/**
 * List agreements for a specific owner (scoped by ownerId)
 */
export async function listAgreementsByOwner(ownerId: string) {
  const agreements = await prisma.agreement.findMany({
    where: { ownerId },
    include: {
      quote: {
        select: {
          id: true,
          property: {
            select: { id: true, name: true },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return agreements.map(agreement => ({
    id: agreement.id,
    quoteId: agreement.quoteId,
    quotedPrice: new Decimal(agreement.quotedPrice),
    status: agreement.status,
    propertyName: agreement.quote.property.name,
    createdAt: agreement.createdAt,
    formattedDate: agreement.createdAt.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }),
    isImmutable: agreement.status !== AgreementStatus.QUOTED,
  }));
}

/**
 * List agreements by status (for admin view)
 */
export async function listAgreementsByStatus(status: string) {
  return prisma.agreement.findMany({
    where: { status },
    include: {
      quote: {
        include: {
          property: {
            select: { id: true, name: true },
          },
          owner: {
            select: { id: true, email: true },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Get agreement statistics (for admin dashboard)
 */
export async function getAgreementStats() {
  const [
    totalAgreements,
    quotedCount,
    pendingAssignmentCount,
    activeCount,
    completedCount,
    cancelledCount,
  ] = await Promise.all([
    prisma.agreement.count(),
    prisma.agreement.count({ where: { status: AgreementStatus.QUOTED } }),
    prisma.agreement.count({ where: { status: AgreementStatus.PENDING_ASSIGNMENT } }),
    prisma.agreement.count({ where: { status: AgreementStatus.ACTIVE } }),
    prisma.agreement.count({ where: { status: AgreementStatus.COMPLETED } }),
    prisma.agreement.count({ where: { status: AgreementStatus.CANCELLED } }),
  ]);

  return {
    totalAgreements,
    quotedCount,
    pendingAssignmentCount,
    activeCount,
    completedCount,
    cancelledCount,
  };
}

/**
 * Check if an agreement's price has been modified after submission
 * (Agreements should have immutable price after submission)
 */
export async function isPriceImmutable(agreementId: string): Promise<boolean> {
  const agreement = await prisma.agreement.findUnique({
    where: { id: agreementId },
    select: { status: true },
  });

  if (!agreement) return false;
  
  // Price is immutable after submission (not in QUOTED status)
  return agreement.status !== AgreementStatus.QUOTED;
}

/**
 * Get agreements with quoted price for display
 */
export async function getAgreementsWithPrice(ownerId: string) {
  const agreements = await listAgreementsByOwner(ownerId);
  
  return agreements.map(agreement => ({
    ...agreement,
    quotedPriceFormatted: agreement.quotedPrice.toFixed(2),
    quotedPriceImmutable: agreement.isImmutable,
  }));
}

/**
 * Helper: Get badge variant based on agreement status
 */
export function getStatusBadgeVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case AgreementStatus.QUOTED:
      return 'default'; // blue
    case AgreementStatus.PENDING_ASSIGNMENT:
      return 'secondary'; // green
    case AgreementStatus.ACTIVE:
      return 'default'; // blue
    case AgreementStatus.COMPLETED:
      return 'secondary'; // green
    case AgreementStatus.CANCELLED:
      return 'destructive'; // red
    default:
      return 'outline';
  }
}
