import { NextResponse } from 'next/server'
import { prisma as extendedPrisma } from '@/core/database/client'
import { PrismaClient } from '@prisma/client'
const rawPrisma = new PrismaClient()
import { getAllServiceTypes } from '@/lib/api/services'
import { verifyPriceLock } from '@/features/pricing/lock'
import { createQuoteAndLock } from '@/features/pricing/actions'

const prisma = rawPrisma

/**
 * POST /api/owner/pricelock
 * Body: { propertyId, serviceTypeId, unitId }
 * Creates a price lock (24h TTL) if one does not already exist.
 * Returns the lock and the calculated quote (base price).
 */
export async function POST(req: Request) {
  const { propertyId, serviceTypeId, unitId, rooms, frequencyMultiplier, tierMultiplier, zoneMultiplier } = await req.json()
  if (!propertyId || !serviceTypeId || !unitId) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  // Verify the lock does not already exist (or is expired)
  const existing = await verifyPriceLock(propertyId, serviceTypeId, unitId)
  if (existing) {
    return NextResponse.json({ error: 'Lock already exists' }, { status: 409 })
  }

  try {
    const { quote, lock } = await createQuoteAndLock({
      propertyId,
      serviceTypeId,
      unitId,
      rooms: rooms ?? 1,
      frequencyMultiplier: frequencyMultiplier ?? 1,
      tierMultiplier: tierMultiplier ?? 1,
      zoneMultiplier: zoneMultiplier ?? 1,
    })
    // Create the Assignment that represents the pending service request
    const assignment = await prisma.assignment.create({
      data: {
        propertyId,
        serviceTypeId,
        status: 'PENDING_ACCEPTANCE',
        expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6‑hour window
      },
    })
    return NextResponse.json({ lockId: lock?.id, quote, assignmentId: assignment.id })
  } catch (e) {
    const err = e instanceof Error ? e.message : 'Failed to create quote'
    return NextResponse.json({ error: err }, { status: 500 })
  }
}

/**
 * GET /api/owner/pricelock?propertyId=...&serviceTypeId=...&unitId=...
 * Returns the active lock if it exists.
 */
export async function GET(req: Request) {
  const url = new URL(req.url)
  const propertyId = url.searchParams.get('propertyId')
  const serviceTypeId = url.searchParams.get('serviceTypeId')
  const unitId = url.searchParams.get('unitId') ?? null
  if (!propertyId || !serviceTypeId) {
    return NextResponse.json({ error: 'Missing query params' }, { status: 400 })
  }

  const valid = await verifyPriceLock(propertyId, serviceTypeId, unitId || '')
  if (!valid) {
    return NextResponse.json({ error: 'No active lock' }, { status: 404 })
  }

  const lock = await prisma.priceLock.findFirst({
    where: { 
      propertyId, 
      serviceTypeId, 
      expiresAt: { gt: new Date() }
    },
  })
  return NextResponse.json({ lock })
}
