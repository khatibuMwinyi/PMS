import { prisma } from '@/core/database/client';
import Decimal from 'decimal.js';
import { AgreementStatus, CreateAgreementSchema, UpdateAgreementStatusSchema } from './types';
import { getQuoteById } from '@/features/quotes/actions';

// Helper to write audit event
async function writeAudit(params: {
  actorId: string;
  entityType: string;
  entityId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'STATUS_CHANGE';
  oldValue?: any;
  newValue?: any;
}) {
  try {
    await prisma.auditEvent.create({
      data: {
        actorId: params.actorId,
        entityType: params.entityType,
        entityId: params.entityId,
        action: params.action,
        oldValue: params.oldValue ?? null,
        newValue: params.newValue ?? null,
      },
    });
  } catch (error) {
    console.error('Failed to write audit event:', error);
  }
}

/**
 * Agreement Server Actions for OPSMP Platform
 * 
 * Handles agreement creation from accepted quotes with immutable quoted price.
 */

export interface CreateAgreementFromQuoteParams {
  quoteId: string;
  ownerId: string;
  propertyId: string;
}

export interface AgreementResult {
  id: string;
  quoteId: string;
  quotedPrice: Decimal;
  status: string;
}

/**
 * Create agreement from an accepted quote
 * The quoted price is copied from the quote and becomes immutable
 */
export async function createAgreementFromQuote(
  params: CreateAgreementFromQuoteParams
): Promise<AgreementResult> {
  // Validate inputs using Zod schema
  const validation = CreateAgreementSchema.safeParse({
    quoteId: params.quoteId,
    ownerId: params.ownerId,
    propertyId: params.propertyId,
    quotedPrice: 0, // Will be set from quote
  });
  
  if (!validation.success) {
    throw new Error(`Invalid agreement parameters: ${validation.error.message}`);
  }

  // Get the quote - must be in ACCEPTED status
  const quote = await getQuoteById(params.quoteId);
  
  if (!quote) {
    throw new Error('Quote not found');
  }

  if (quote.status !== 'ACCEPTED') {
    throw new Error(`Quote must be in ACCEPTED status. Current status: ${quote.status}`);
  }

  // Check if agreement already exists for this quote
  const existingAgreement = await prisma.agreement.findUnique({
    where: { quoteId: params.quoteId },
  });

  if (existingAgreement) {
    throw new Error('Agreement already exists for this quote');
  }

  // Create agreement with immutable quoted price from quote
  const agreement = await prisma.agreement.create({
    data: {
      quoteId: params.quoteId,
      ownerId: params.ownerId,
      propertyId: params.propertyId,
      quotedPrice: quote.quotedPrice, // Copy from quote - immutable
      status: AgreementStatus.QUOTED, // Initial status
    },
  });

  // Write audit event
  await writeAudit({
    actorId: params.ownerId,
    entityType: 'Agreement',
    entityId: agreement.id,
    action: 'CREATE',
    newValue: {
      quotedPrice: agreement.quotedPrice,
      quoteId: agreement.quoteId,
      status: agreement.status,
    },
  });

  return {
    id: agreement.id,
    quoteId: agreement.quoteId,
    quotedPrice: new Decimal(agreement.quotedPrice),
    status: agreement.status,
  };
}

/**
 * Submit agreement (transitions status to PENDING_ASSIGNMENT)
 */
export async function submitAgreement(agreementId: string): Promise<void> {
  const agreement = await prisma.agreement.findUnique({
    where: { id: agreementId },
  });

  if (!agreement) {
    throw new Error('Agreement not found');
  }

  if (agreement.status !== AgreementStatus.QUOTED) {
    throw new Error(`Agreement cannot be submitted. Current status: ${agreement.status}`);
  }

  // Capture old status for audit
  const oldStatus = agreement.status;

  // Update status to PENDING_ASSIGNMENT
  const updatedAgreement = await prisma.agreement.update({
    where: { id: agreementId },
    data: { 
      status: AgreementStatus.PENDING_ASSIGNMENT,
      updatedAt: new Date(),
    },
  });

  // Write audit event for status change
  await writeAudit({
    actorId: agreement.ownerId,
    entityType: 'Agreement',
    entityId: agreementId,
    action: 'STATUS_CHANGE',
    oldValue: { status: oldStatus },
    newValue: { status: AgreementStatus.PENDING_ASSIGNMENT },
  });

  // Fire AGREEMENT_SUBMITTED event
  const { fireAgreementSubmittedEvent } = await import('@/core/events');
  await fireAgreementSubmittedEvent({
    userId: agreement.ownerId,
    agreementId: agreement.id,
    quoteId: agreement.quoteId,
    status: AgreementStatus.PENDING_ASSIGNMENT,
  });

  return;
}

/**
 * Attempt to modify price after submission (should fail)
 * This function demonstrates that price is immutable after submission
 */
export async function attemptModifyPrice(
  agreementId: string,
  newPrice: number
): Promise<boolean> {
  const agreement = await prisma.agreement.findUnique({
    where: { id: agreementId },
  });

  if (!agreement) {
    throw new Error('Agreement not found');
  }

  // Check if agreement has been submitted (not in QUOTED status)
  if (agreement.status !== AgreementStatus.QUOTED) {
    // Price is immutable after submission
    throw new Error('Cannot modify price after submission. Agreement price is immutable.');
  }

  // Only allow modification if still in QUOTED status (before submission)
  await prisma.agreement.update({
    where: { id: agreementId },
    data: { quotedPrice: newPrice },
  });

  return true;
}

/**
 * List agreements for an owner (scoped by ownerId)
 */
export async function listOwnerAgreements(ownerId: string) {
  const agreements = await prisma.agreement.findMany({
    where: { ownerId },
    include: {
      quote: {
        include: {
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
    status: agreement.status as AgreementStatus,
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
 * Get agreement details by ID
 */
export async function getAgreementDetails(agreementId: string) {
  const agreement = await prisma.agreement.findUnique({
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
    },
  });

  if (!agreement) return null;

  return {
    ...agreement,
    quotedPrice: new Decimal(agreement.quotedPrice),
    isImmutable: agreement.status !== AgreementStatus.QUOTED,
  };
}

/**
 * Update agreement status (internal use)
 */
export async function updateAgreementStatus(
  agreementId: string,
  status: AgreementStatus
): Promise<void> {
  const validation = UpdateAgreementStatusSchema.safeParse({ agreementId, status });
  if (!validation.success) {
    throw new Error(`Invalid status update: ${validation.error.message}`);
  }

  const agreementBefore = await prisma.agreement.findUnique({
    where: { id: agreementId },
    select: { status: true },
  });

  await prisma.agreement.update({
    where: { id: agreementId },
    data: { 
      status,
      updatedAt: new Date(),
    },
  });

  // Write audit event
  if (agreementBefore) {
    await writeAudit({
      actorId: 'system', // Or pass in the actual actorId
      entityType: 'Agreement',
      entityId: agreementId,
      action: 'UPDATE',
      oldValue: { status: agreementBefore.status },
      newValue: { status },
    });
  }
}
