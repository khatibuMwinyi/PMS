'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/core/database/client';
import { auth } from '@/core/auth';
import { propertyService } from './services';
import { CreatePropertySchema, DAR_ES_SALAAM_LAT, DAR_ES_SALAAM_LNG } from './schemas';

export async function createProperty(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user || session.user.role !== 'OWNER') {
    return { success: false, error: 'Unauthorized' };
  }

  // Parse & validate
  const raw = {
    name: formData.get('name'),
    address: formData.get('address'),
    zone: formData.get('zone'),
    latitude: formData.get('latitude') ?? DAR_ES_SALAAM_LAT,
    longitude: formData.get('longitude') ?? DAR_ES_SALAAM_LNG,
  };

  const parsed = CreatePropertySchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.errors[0];
    return { success: false, error: first?.message ?? 'Validation failed' };
  }

  const data = parsed.data;

  // Get owner profile
  const ownerProfile = await prisma.ownerProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!ownerProfile) {
    return { success: false, error: 'Owner profile not found' };
  }

  // Get image files from form
  const imageFiles = formData.getAll('images') as File[];

  // Create property via service
  const property = await propertyService.createProperty({
    name: data.name,
    address: data.address,
    zone: data.zone,
    latitude: data.latitude,
    longitude: data.longitude,
    ownerId: ownerProfile.id,
    imageFiles,
  });

  // Write audit
  await propertyService.writeAudit({
    actorId: session.user.id,
    entityType: 'Property',
    entityId: property.id,
    action: 'CREATE',
    newValue: { name: property.name, zone: property.zone },
  });

  revalidatePath('/owner/properties');
  return { success: true };
}

export async function addUnit(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user || session.user.role !== 'OWNER') {
    return { success: false, error: 'Unauthorized' };
  }

  const ownerProfile = await prisma.ownerProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!ownerProfile) {
    return { success: false, error: 'Owner profile not found' };
  }

  const propertyId = formData.get('propertyId') as string;
  const unitName = formData.get('name') as string;
  const unitType = formData.get('type') as 'APARTMENT' | 'HOUSE' | 'COMMERCIAL';
  const squareFootage = Number(formData.get('squareFootage'));

  const property = await prisma.property.findFirst({
    where: { id: propertyId, ownerId: ownerProfile.id },
  });

  if (!property) {
    return { success: false, error: 'Property not found or access denied' };
  }

  await prisma.unit.create({
    data: {
      unitName,
      unitType,
      squareFootage,
      propertyId: property.id,
    },
  });

  revalidatePath('/owner/properties');
  return { success: true };
}

export async function updatePropertyStatus(
  propertyId: string,
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING'
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user || session.user.role !== 'OWNER') {
    return { success: false, error: 'Unauthorized' };
  }

  const ownerProfile = await prisma.ownerProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!ownerProfile) {
    return { success: false, error: 'Owner profile not found' };
  }

  const property = await prisma.property.findFirst({
    where: { id: propertyId, ownerId: ownerProfile.id },
    select: { id: true, status: true },
  });

  if (!property) {
    return { success: false, error: 'Property not found or access denied' };
  }

  await propertyService.updatePropertyStatus(propertyId, status, ownerProfile.id);

  await propertyService.writeAudit({
    actorId: session.user.id,
    entityType: 'Property',
    entityId: propertyId,
    action: 'STATUS_CHANGE',
    oldValue: { status: property.status },
    newValue: { status },
  });

  revalidatePath('/owner/properties');
  revalidatePath(`/owner/properties/${propertyId}`);
  return { success: true };
}

export async function getPropertyForOwner(propertyId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'OWNER') {
    throw new Error('Unauthorized');
  }

  const ownerProfile = await prisma.ownerProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!ownerProfile) {
    throw new Error('Owner profile not found');
  }

  const property = await propertyService.getPropertyById(propertyId, ownerProfile.id);
  if (!property) {
    throw new Error('Property not found or access denied');
  }

  return property;
}