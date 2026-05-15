import { NextResponse } from 'next/server';
import { prisma } from '@/core/database/client';
import { verifyPriceLock, createPriceLock } from '@/features/pricing/lock';
import { createQuoteWithPricing } from '@/features/pricing/actions';

/**
 * POST /api/owner/pricelock
 * Body: { propertyId, serviceTypeId, unitId, rooms?, frequencyMultiplier?, ... }
 *
 * Generates a Quote + 24h price lock. Assignment is created later when the
 * owner submits the agreement (post-quote-acceptance).
 */
export async function POST(req: Request) {
  const { propertyId, serviceTypeId, unitId, rooms, frequencyMultiplier } = await req.json();
  if (!propertyId || !serviceTypeId || !unitId) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const existing = await verifyPriceLock(propertyId, serviceTypeId, unitId);
  if (existing) {
    return NextResponse.json({ error: 'Lock already exists' }, { status: 409 });
  }

  try {
    const quote = await createQuoteWithPricing({
      ownerId: 'system',
      propertyId,
      serviceTypeId,
      basePrice: 0,
      locationFactor: 1,
      frequencyMultiplier: frequencyMultiplier ?? 1,
      unitCount: rooms ?? 1,
    });
    const lock = await createPriceLock(propertyId, serviceTypeId, unitId);
    return NextResponse.json({ lockId: lock?.id, quote });
  } catch (e) {
    const err = e instanceof Error ? e.message : 'Failed to create quote';
    return NextResponse.json({ error: err }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const propertyId = url.searchParams.get('propertyId');
  const serviceTypeId = url.searchParams.get('serviceTypeId');
  const unitId = url.searchParams.get('unitId') ?? '';
  if (!propertyId || !serviceTypeId) {
    return NextResponse.json({ error: 'Missing query params' }, { status: 400 });
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
