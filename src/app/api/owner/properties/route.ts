import { NextResponse } from 'next/server'
import { prisma } from '@/core/database/client'

// GET /api/owner/properties – returns all properties for the logged‑in owner with their units
export async function GET(req: Request) {
  // In a real app, we would extract owner ID from session. Here we assume a placeholder.
  const url = new URL(req.url)
  const ownerId = url.searchParams.get('ownerId')
  if (!ownerId) {
    return NextResponse.json({ error: 'ownerId required' }, { status: 400 })
  }

  const properties = await prisma.property.findMany({
    where: { ownerId },
    select: {
      id: true,
      name: true,
      units: { select: { id: true, unitName: true } },
    },
  })
  return NextResponse.json(properties)
}
