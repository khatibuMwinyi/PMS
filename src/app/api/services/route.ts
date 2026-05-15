import { auth } from '@/core/auth';
import { prisma } from '@/core/database/client';
import { NextResponse } from 'next/server';
import { UserRole } from '@prisma/client';

/**
 * GET /api/services
 * Public read-only catalog endpoint for owners to browse services.
 * Admin and staff can see all services (including inactive).
 * Owners and providers see only active services.
 */
export async function GET() {
  const session = await auth();

  // Allow unauthenticated access for public catalog browsing
  const isAdminOrStaff = session?.user?.role &&
    ['ADMIN', 'STAFF'].includes(session.user.role as UserRole);

  try {
    const services = await prisma.serviceType.findMany({
      where: isAdminOrStaff ? {} : { isActive: true },
      select: {
        id:          true,
        name:        true,
        description: true,
        basePrice:   true,
        isActive:    true,
        _count: {
          select: {
            quotes: true,
          },
        },
      },
    });

    // Transform to include formatted price
    const catalog = services.map((service: any) => ({
      id:          service.id,
      name:        service.name,
      description: service.description,
      basePrice:   Number(service.basePrice),
      isActive:    service.isActive,
      quoteCount:  service._count?.quotes || 0,
    }));

    return NextResponse.json({
      success: true,
      services: catalog,
    });
  } catch (error) {
    console.error('Failed to fetch services:', error);
    return NextResponse.json(
      { error: 'Failed to fetch services catalog' },
      { status: 500 }
    );
  }
}
