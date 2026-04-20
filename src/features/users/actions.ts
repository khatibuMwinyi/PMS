'use server';

import { prisma } from '@/core/database/client';
import bcrypt from 'bcryptjs';
import {
  OwnerRegisterSchema,
  ProviderRegisterSchema,
  type OwnerRegisterInput,
  type ProviderRegisterInput,
} from './types';

export async function registerOwner(data: OwnerRegisterInput) {
  const validated = OwnerRegisterSchema.parse(data);
  const passwordHash = await bcrypt.hash(validated.password, 12);

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email: validated.email }] },
  });
  if (existing) throw new Error('An account with this email already exists.');

  await prisma.user.create({
    data: {
      email:        validated.email,
      phone:        validated.phone,
      passwordHash,
      role:         'OWNER',
      ownerProfile: {
        create: {
          firstName: validated.firstName,
          lastName:  validated.lastName,
        },
      },
    },
  });

  return { success: true };
}

export async function registerProvider(data: ProviderRegisterInput) {
  const validated = ProviderRegisterSchema.parse(data);
  const passwordHash = await bcrypt.hash(validated.password, 12);

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email: validated.email }] },
  });
  if (existing) throw new Error('An account with this email already exists.');

  await prisma.user.create({
    data: {
      email:           validated.email,
      phone:           validated.phone,
      passwordHash,
      role:            'PROVIDER',
      providerProfile: {
        create: {
          businessName:      validated.businessName,
          serviceCategories: validated.serviceCategories,
          operationalZones:  validated.operationalZones,
        },
      },
    },
  });

  return { success: true };
}