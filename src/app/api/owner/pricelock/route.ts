import { NextResponse } from 'next/server';
import { z } from 'zod';
import Decimal from 'decimal.js';
import { auth } from '@/core/auth';
import { prisma } from '@/core/database/client';
import { verifyPriceLock, createPriceLock } from '@/features/pricing/lock';
import { createQuoteWithPricing } from '@/features/pricing/actions';

const PostBody = z.object({
  propertyId: z.string().min(1),
  serviceTypeId: z.string().min(1),
  unitId: z.string().optional(),
  rooms: z.number().int().positive().optional(),
  frequencyMultiplier: z.number().positive().max(5).optional(),
  locationFactor: z.number().positive().max(10).optional(),
});

/**
 * POST /api/owner/pricelock
 * Creates a Quote bound to the authenticated owner with a 24h price lock.
 * The quoted price comes from the ServiceType.basePrice × factors.
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'OWNER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const parsed = PostBody.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
  const body = parsed.data;

  // Ownership check — Property.owner is OwnerProfile, so resolve first.
  const profile = await prisma.ownerProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!profile) {
    return NextResponse.json({ error: 'Owner profile not found' }, { status: 403 });
  }
  const property = await prisma.property.findUnique({
    where: { id: body.propertyId },
    select: { ownerId: true, zone: true, unitCount: true },
  });
  if (!property) {
    return NextResponse.json({ error: 'Property not found' }, { status: 404 });
  }
  if (property.ownerId !== profile.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const serviceType = await prisma.serviceType.findUnique({
    where: { id: body.serviceTypeId },
    select: { id: true, basePrice: true, pricingRules: true, isActive: true },
  });
  if (!serviceType || !serviceType.isActive) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 404 });
  }

  const existing = await verifyPriceLock(body.propertyId, body.serviceTypeId, body.unitId ?? '');
  if (existing) {
    return NextResponse.json({ error: 'An active quote exists for this combination.' }, { status: 409 });
  }

  const basePrice = new Decimal(serviceType.basePrice.toString());
  if (basePrice.lte(0)) {
    return NextResponse.json({ error: 'Service is not priced' }, { status: 500 });
  }

  // Pricing rules may specify locationFactor map and frequency multipliers.
  // Until rule-driven derivation lands, derive from explicit params or 1.
  const locationFactor = body.locationFactor ?? 1;
  const frequencyMultiplier = body.frequencyMultiplier ?? 1;
  const unitCount = body.rooms ?? Math.max(property.unitCount, 1);

  try {
    const quote = await createQuoteWithPricing({
      ownerId: session.user.id,
      propertyId: body.propertyId,
      serviceTypeId: body.serviceTypeId,
      basePrice: basePrice.toNumber(),
      locationFactor,
      frequencyMultiplier,
      unitCount,
    });
    const lock = await createPriceLock(body.propertyId, body.serviceTypeId, body.unitId ?? '');
    return NextResponse.json({ lockId: lock?.id, quote });
  } catch (e) {
    const err = e instanceof Error ? e.message : 'Failed to create quote';
    return NextResponse.json({ error: err }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'OWNER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(req.url);
  const propertyId = url.searchParams.get('propertyId');
  const serviceTypeId = url.searchParams.get('serviceTypeId');
  const unitId = url.searchParams.get('unitId') ?? '';
  if (!propertyId || !serviceTypeId) {
    return NextResponse.json({ error: 'Missing query params' }, { status: 400 });
  }

  const profile = await prisma.ownerProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!profile) {
    return NextResponse.json({ error: 'Owner profile not found' }, { status: 403 });
  }
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: { ownerId: true },
  });
  if (!property || property.ownerId !== profile.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const valid = await verifyPriceLock(propertyId, serviceTypeId, unitId);
  if (!valid) {
    return NextResponse.json({ error: 'No active lock' }, { status: 404 });
  }

  const lock = await prisma.priceLock.findFirst({
    where: { propertyId, serviceTypeId, expiresAt: { gt: new Date() } },
  });
  return NextResponse.json({ lock });
}
