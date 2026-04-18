"use server";

import { prisma } from '@/core/database/client';
import { auth } from '@/core/auth';
import { uploadImage } from '@/core/storage/upload';
import { CreatePropertySchema, AddUnitSchema } from './types';

export async function createProperty(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'OWNER') {
    throw new Error('Unauthorized');
  }

  const rawData = Object.fromEntries(formData);
  const data = CreatePropertySchema.parse(rawData);

  const ownerProfile = await prisma.ownerProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!ownerProfile) {
    throw new Error('Owner profile not found');
  }

  return await prisma.property.create({
    data: {
      name: data.name,
      type: data.type,
      encryptedAddress: data.address, // Use encryptedAddress field for encryption
      location: 'SRID=4326;POINT(' + data.longitude + ' ' + data.latitude + ')', // Add location using PostGIS format
      city: data.city,
      unitCount: data.unitCount,
      ownerId: ownerProfile.id,
    },
  });
}

export async function addUnit(propertyId: string, unitData: {
  unitNumber: string;
  bedrooms: number;
  bathrooms: number;
  sqm: number;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'OWNER') {
    throw new Error('Unauthorized');
  }

  const data = AddUnitSchema.parse({
    propertyId,
    ...unitData,
  });

  return await prisma.unit.create({
    data: {
      propertyId: data.propertyId,
      unitNumber: data.unitNumber,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      sqm: data.sqm,
    },
  });
}

export async function uploadPropertyImage(propertyId: string, file: File) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'OWNER') {
    throw new Error('Unauthorized');
  }

  const imageUrl = await uploadImage(file, propertyId);

  await prisma.propertyImage.create({
    data: {
      propertyId,
      imageUrl,
    },
  });

  return imageUrl;
}