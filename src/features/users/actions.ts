"use server";

import { prisma } from '@/core/database/client';
import bcrypt from 'bcryptjs';
import { OwnerRegisterSchema, ProviderRegisterSchema } from './types';

export async function registerOwner(formData: FormData) {
  const rawData = Object.fromEntries(formData);
  const data = OwnerRegisterSchema.parse(rawData);

  const passwordHash = await bcrypt.hash(data.password, 12);

  return await prisma.user.create({
    data: {
      email: data.email,
      phone: data.phone,
      passwordHash,
      role: 'OWNER',
      ownerProfile: {
        create: {
          firstName: data.firstName,
          lastName: data.lastName,
        },
      },
    },
  });
}

export async function registerProvider(formData: FormData) {
  const rawData = Object.fromEntries(formData);
  const data = ProviderRegisterSchema.parse(rawData);

  const passwordHash = await bcrypt.hash(data.password, 12);

  return await prisma.user.create({
    data: {
      email: data.email,
      phone: data.phone,
      passwordHash,
      role: 'PROVIDER',
      providerProfile: {
        create: {
          businessName: data.businessName,
          serviceCategories: data.serviceCategories,
          operationalZones: data.operationalZones,
        },
      },
    },
  });
}