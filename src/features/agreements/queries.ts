'use server';

import { prisma } from '@/core/database/client';
import { agreementRepository } from './repositories';
import { AgreementStatus } from './types';
import Decimal from 'decimal.js';

export async function getAgreementById(agreementId: string) {
  return agreementRepository.findById(agreementId);
}

export async function listAgreementsByOwner(ownerId: string) {
  const agreements = await agreementRepository.findByOwner(ownerId);
  return agreements.map(agreement => ({
    id: agreement.id,
    quoteId: agreement.quoteId,
    quotedPrice: new Decimal(agreement.quotedPrice),
    status: agreement.status,
    propertyName: agreement.quote?.property.name ?? '',
    createdAt: agreement.createdAt,
    formattedDate: agreement.createdAt.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
    isImmutable: agreement.status !== AgreementStatus.QUOTED,
  }));
}

export async function listAgreementsByStatus(status: string) {
  return agreementRepository.findByStatus(status);
}

export async function getAgreementStats() {
  const [totalAgreements, quotedCount, pendingAssignmentCount, activeCount, completedCount, cancelledCount] = await Promise.all([
    prisma.agreement.count(),
    prisma.agreement.count({ where: { status: AgreementStatus.QUOTED } }),
    prisma.agreement.count({ where: { status: AgreementStatus.PENDING_ASSIGNMENT } }),
    prisma.agreement.count({ where: { status: AgreementStatus.ACTIVE } }),
    prisma.agreement.count({ where: { status: AgreementStatus.COMPLETED } }),
    prisma.agreement.count({ where: { status: AgreementStatus.CANCELLED } }),
  ]);
  return { totalAgreements, quotedCount, pendingAssignmentCount, activeCount, completedCount, cancelledCount };
}

export async function isPriceImmutable(agreementId: string): Promise<boolean> {
  const agreement = await agreementRepository.findById(agreementId);
  if (!agreement) return false;
  return agreement.status !== AgreementStatus.QUOTED;
}

export function getStatusBadgeVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case AgreementStatus.QUOTED: return 'default';
    case AgreementStatus.PENDING_ASSIGNMENT: return 'secondary';
    case AgreementStatus.ACTIVE: return 'default';
    case AgreementStatus.COMPLETED: return 'secondary';
    case AgreementStatus.CANCELLED: return 'destructive';
    default: return 'outline';
  }
}