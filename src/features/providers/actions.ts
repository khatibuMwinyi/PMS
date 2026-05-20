'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/core/auth';
import { prisma } from '@/core/database/client';
import {
  BusinessProfileSchema,
  CoverageSchema,
  BlockedDateSchema,
  RemoveBlockedDateSchema,
  type BusinessProfileInput,
  type CoverageInput,
  type BlockedDateInput,
} from './schemas';

async function requireProviderProfile(): Promise<{ providerId: string; userId: string }> {
  const session = await auth();
  if (!session?.user || session.user.role !== 'PROVIDER') {
    throw new Error('Unauthorized');
  }
  const profile = await prisma.providerProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!profile) throw new Error('Provider profile not found');
  return { providerId: profile.id, userId: session.user.id };
}

function firstZodMessage(error: unknown): string {
  if (
    error &&
    typeof error === 'object' &&
    'issues' in error &&
    Array.isArray((error as { issues: unknown[] }).issues) &&
    (error as { issues: { message: string }[] }).issues.length > 0
  ) {
    return (error as { issues: { message: string }[] }).issues[0].message;
  }
  return 'Invalid input';
}

export async function updateProviderProfile(
  input: BusinessProfileInput,
): Promise<{ success: true }> {
  const { providerId } = await requireProviderProfile();
  const parsed = BusinessProfileSchema.safeParse(input);
  if (!parsed.success) throw new Error(firstZodMessage(parsed.error));

  await prisma.providerProfile.update({
    where: { id: providerId },
    data: {
      businessName: parsed.data.businessName,
      mobileMoneyNumber: parsed.data.mobileMoneyNumber,
    },
  });
  revalidatePath('/provider/settings');
  return { success: true };
}

export async function updateProviderCoverage(
  input: CoverageInput,
): Promise<{ success: true }> {
  const { providerId } = await requireProviderProfile();
  const parsed = CoverageSchema.safeParse(input);
  if (!parsed.success) throw new Error(firstZodMessage(parsed.error));

  await prisma.providerProfile.update({
    where: { id: providerId },
    data: {
      serviceCategories: parsed.data.serviceCategories,
      serviceRadiusKm: parsed.data.serviceRadiusKm,
    },
  });
  revalidatePath('/provider/settings');
  return { success: true };
}

export async function addBlockedDate(
  input: BlockedDateInput,
): Promise<{ success: true; id: string }> {
  const { providerId } = await requireProviderProfile();
  const parsed = BlockedDateSchema.safeParse(input);
  if (!parsed.success) throw new Error(firstZodMessage(parsed.error));

  const blockedDate = new Date(`${parsed.data.date}T00:00:00.000Z`);

  try {
    const created = await prisma.providerBlockedDate.create({
      data: { providerId, blockedDate },
      select: { id: true },
    });
    revalidatePath('/provider/settings');
    return { success: true, id: created.id };
  } catch (error) {
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      (error as { code: string }).code === 'P2002'
    ) {
      throw new Error('That date is already blocked.');
    }
    throw error;
  }
}

export async function removeBlockedDate(input: {
  id: string;
}): Promise<{ success: true }> {
  const { providerId } = await requireProviderProfile();
  const parsed = RemoveBlockedDateSchema.safeParse(input);
  if (!parsed.success) throw new Error(firstZodMessage(parsed.error));

  const existing = await prisma.providerBlockedDate.findUnique({
    where: { id: parsed.data.id },
    select: { providerId: true },
  });
  if (!existing || existing.providerId !== providerId) {
    throw new Error('Blocked date not found');
  }

  await prisma.providerBlockedDate.delete({ where: { id: parsed.data.id } });
  revalidatePath('/provider/settings');
  return { success: true };
}
