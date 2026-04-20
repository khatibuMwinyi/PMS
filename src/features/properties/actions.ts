'use server';

import { revalidatePath } from 'next/cache';
import { prisma }          from '@/core/database/client';
import { auth }            from '@/core/auth';
import { uploadImage }     from '@/core/storage/upload';
import { CreatePropertySchema, DAR_ES_SALAAM_LAT, DAR_ES_SALAAM_LNG } from './types';

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