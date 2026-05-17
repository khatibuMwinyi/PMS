'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/core/database/client';
import { auth } from '@/core/auth';
import { createAgreementFromQuote } from '@/features/agreements/actions';

export async function submitOwnerQuote(quoteId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'OWNER') {
    throw new Error('Unauthorized');
  }

  const quote = await prisma.quote.findUnique({
    where: { id: quoteId },
    select: { id: true, ownerId: true, propertyId: true, priceLockedUntil: true, status: true },
  });

  if (!quote) throw new Error('Quote not found');
  if (quote.ownerId !== session.user.id) throw new Error('Forbidden');
  if (quote.priceLockedUntil && quote.priceLockedUntil.getTime() < Date.now()) {
    throw new Error('Quote expired — please request a new quote.');
  }
  if (quote.status !== 'QUOTED' && quote.status !== 'ACCEPTED') {
    throw new Error(`Quote cannot be submitted in status: ${quote.status}`);
  }

  if (quote.status === 'QUOTED') {
    await prisma.quote.update({
      where: { id: quoteId },
      data: { status: 'ACCEPTED' },
    });
  }

  const agreement = await createAgreementFromQuote({
    quoteId,
    ownerId: session.user.id,
    propertyId: quote.propertyId,
  });

  revalidatePath('/owner/services');
  redirect(`/owner/services/${agreement.id}`);
}
