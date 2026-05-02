'use server';

import { revalidatePath } from 'next/cache';
import { prisma }          from '@/core/database/client';
import { auth }            from '@/core/auth';
import { uploadImage }     from '@/core/storage/upload';
import { CreatePropertySchema, DAR_ES_SALAAM_LAT, DAR_ES_SALAAM_LNG } from './types';

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

export async function createProperty(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user || session.user.role !== 'OWNER') {
    return { success: false, error: 'Unauthorized' };
  }

  // ── Parse & validate text fields ────────────────────────────────────
  const raw = {
    name:      formData.get('name'),
    address:   formData.get('address'),
    zone:      formData.get('zone'),
    latitude:  formData.get('latitude')  ?? DAR_ES_SALAAM_LAT,
    longitude: formData.get('longitude') ?? DAR_ES_SALAAM_LNG,
  };

  const parsed = CreatePropertySchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.errors[0];
    return { success: false, error: first?.message ?? 'Validation failed' };
  }

  const data = parsed.data;

  // ── Owner profile ────────────────────────────────────────────────────
  const ownerProfile = await prisma.ownerProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!ownerProfile) {
    return { success: false, error: 'Owner profile not found' };
  }

  // ── Upload images ────────────────────────────────────────────────────
  const imageFiles  = formData.getAll('images') as File[];
  const imageUrls: string[] = [];

  for (const file of imageFiles) {
    if (file && file.size > 0) {
      try {
        const url = await uploadImage(file, 'properties');
        imageUrls.push(url);
      } catch {
        // Non-fatal: skip failed images
      }
    }
  }

  // ── Create property record ───────────────────────────────────────────
  const property = await prisma.property.create({
    data: {
      name:             data.name,
      encryptedAddress: data.address,   // Prisma extension encrypts this at write time
      zone:             data.zone,
      latitude:         data.latitude,
      longitude:        data.longitude,
      imageUrls,
      ownerId:          ownerProfile.id,
    },
  });

  // Write audit event
  await writeAudit({
    actorId: session.user.id,
    entityType: 'Property',
    entityId: property.id,
    action: 'CREATE',
    newValue: { name: property.name, zone: property.zone },
  });

  // ── Set PostGIS geometry via raw query (Unsupported type workaround) ─
  await prisma.$executeRaw`
    UPDATE properties
    SET    location = ST_SetSRID(ST_MakePoint(${data.longitude}, ${data.latitude}), 4326)
    WHERE  id = ${property.id}
  `;

  // ── Bust cache so the grid re-fetches immediately ────────────────────
  revalidatePath('/owner/properties');

  return { success: true };
}

export async function addUnit(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user || session.user.role !== 'OWNER') {
    return { success: false, error: 'Unauthorized' };
  }

  const property = await prisma.property.create({
    data: {
      name:             formData.get('name') as string,
      encryptedAddress: formData.get('address') as string,
      zone:             formData.get('zone') as string,
      latitude:         DAR_ES_SALAAM_LAT,
      longitude:        DAR_ES_SALAAM_LNG,
      imageUrls:        [],
      ownerId:          formData.get('ownerId') as string,
    },
  });

  revalidatePath('/owner/properties');
  return { success: true };
}

// ─── Update Property Status (Owner) ─────────────────────

export async function updatePropertyStatus(
  propertyId: string,
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE'
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user || session.user.role !== 'OWNER') {
    return { success: false, error: 'Unauthorized' };
  }

  // Verify ownership
  const ownerProfile = await prisma.ownerProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!ownerProfile) {
    return { success: false, error: 'Owner profile not found' };
  }

  const propertyBefore = await prisma.property.findFirst({
    where: {
      id:      propertyId,
      ownerId: ownerProfile.id,
    },
    select: { id: true, status: true },
  });

  if (!propertyBefore) {
    return { success: false, error: 'Property not found or access denied' };
  }

  await prisma.property.update({
    where: { id: propertyId },
    data: { status },
  });

  // Write audit event for status change
  await writeAudit({
    actorId: session.user.id,
    entityType: 'Property',
    entityId: propertyId,
    action: 'STATUS_CHANGE',
    oldValue: { status: propertyBefore.status },
    newValue: { status },
  });

  revalidatePath('/owner/properties');
  revalidatePath(`/owner/properties/${propertyId}`);
  return { success: true };
}

// ─── Get Single Property by ID (Owner-scoped) ───────────────────

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

  const property = await prisma.property.findFirst({
    where: {
      id:      propertyId,
      ownerId: ownerProfile.id,
    },
    include: {
      units:        true,
      quotes:       true,
      agreements:   true,
    },
  });

  if (!property) {
    throw new Error('Property not found or access denied');
  }

  return property;
}
