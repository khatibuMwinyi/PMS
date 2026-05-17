'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import Decimal from 'decimal.js';
import { nanoid } from 'nanoid';
import { Prisma } from '@prisma/client';
import { prisma } from '@/core/database/client';
import { auth } from '@/core/auth';

const CreateUtilityInput = z.object({
  propertyId: z.string().min(1),
  type: z.enum(['WATER', 'ELECTRICITY', 'GAS', 'WASTE']),
  amount: z.number().positive(),
  billingPeriod: z.string().min(1),
  allocationMethod: z.enum(['PER_UNIT', 'PER_PERSON', 'PER_SQM']),
});

type Input = z.infer<typeof CreateUtilityInput>;

export async function createUtilityBill(raw: Input) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'OWNER') {
    throw new Error('Unauthorized');
  }
  const data = CreateUtilityInput.parse(raw);

  const profile = await prisma.ownerProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!profile) throw new Error('Owner profile not found');

  const property = await prisma.property.findUnique({
    where: { id: data.propertyId },
    select: { ownerId: true, unitCount: true, units: { select: { id: true } } },
  });
  if (!property) throw new Error('Property not found');
  if (property.ownerId !== profile.id) throw new Error('Forbidden');

  const amount = new Decimal(data.amount);
  const unitCount = Math.max(property.unitCount, property.units.length, 1);
  const perUnit = amount.div(unitCount);

  await prisma.$transaction(
    async (tx) => {
      const bill = await tx.utilityBill.create({
        data: {
          id: nanoid(),
          propertyId: data.propertyId,
          type: data.type,
          amount: amount,
          billingPeriod: data.billingPeriod,
          allocationMethod: data.allocationMethod,
        },
      });

      if (property.units.length > 0) {
        await tx.utilityAllocation.createMany({
          data: property.units.map((u) => ({
            id: nanoid(),
            utilityBillId: bill.id,
            unitId: u.id,
            amount: perUnit,
          })),
        });
      }
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  );

  revalidatePath('/owner/utilities');
  revalidatePath('/owner/financials');
  revalidatePath('/owner/reports');
}
