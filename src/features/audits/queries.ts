import { prisma } from '@/core/database/client';
import { auth } from '@/core/auth';

// ─── Query All Audit Events (Admin) ──────────────

export async function getAllAuditEvents(filters?: {
  entityType?: string;
  entityId?: string;
  actorId?: string;
  action?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  pageSize?: number;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized: Admin access required');
  }

  const where: any = {};

  if (filters?.entityType) where.entityType = filters.entityType;
  if (filters?.entityId) where.entityId = filters.entityId;
  if (filters?.actorId) where.actorId = filters.actorId;
  if (filters?.action) where.action = filters.action;
  
  if (filters?.startDate || filters?.endDate) {
    where.timestamp = {};
    if (filters.startDate) where.timestamp.gte = filters.startDate;
    if (filters.endDate) where.timestamp.lte = filters.endDate;
  }

  const page = filters?.page || 1;
  const pageSize = filters?.pageSize || 50;
  const skip = (page - 1) * pageSize;

  const [events, totalCount] = await Promise.all([
    prisma.auditEvent.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: pageSize,
      skip,
      include: {
        actor: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    }),
    prisma.auditEvent.count({ where }),
  ]);

  return {
    events,
    pagination: {
      page,
      pageSize,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
    },
  };
}

// ─── Get Audit Stats (Admin) ─────────────────────

export async function getAuditStats() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized: Admin access required');
  }

  const [
    totalCount,
    createCount,
    updateCount,
    deleteCount,
    statusChangeCount,
    recentEvents,
  ] = await Promise.all([
    prisma.auditEvent.count(),
    prisma.auditEvent.count({ where: { action: 'CREATE' } }),
    prisma.auditEvent.count({ where: { action: 'UPDATE' } }),
    prisma.auditEvent.count({ where: { action: 'DELETE' } }),
    prisma.auditEvent.count({ where: { action: 'STATUS_CHANGE' } }),
    prisma.auditEvent.findMany({
      take: 10,
      orderBy: { timestamp: 'desc' },
      include: {
        actor: {
          select: {
            email: true,
            role: true,
          },
        },
      },
    }),
  ]);

  // Get entity type counts
  const entityTypeCounts = await prisma.auditEvent.groupBy({
    by: ['entityType'],
    _count: { entityType: true },
  });

  return {
    total: totalCount,
    byAction: {
      CREATE: createCount,
      UPDATE: updateCount,
      DELETE: deleteCount,
      STATUS_CHANGE: statusChangeCount,
    },
    byEntityType: entityTypeCounts.map((item) => ({
      entityType: item.entityType,
      count: item._count.entityType,
    })),
    recentEvents,
  };
}

// ─── Get Entity Audit History (Public Wrapper) ────

export async function getEntityAuditHistory(entityType: string, entityId: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  // Users can see their own audit history; admins can see everything
  if (session.user.role !== 'ADMIN' && !(entityType === 'User' && entityId === session.user.id)) {
    throw new Error('Unauthorized: Cannot view audit history');
  }

  return await prisma.auditEvent.findMany({
    where: {
      entityType,
      entityId,
    },
    orderBy: { timestamp: 'desc' },
    include: {
      actor: {
        select: {
          id: true,
          email: true,
          role: true,
        },
      },
    },
  });
}

// ─── Get Actor Audit History ──────────────────────

export async function getActorAuditHistory(actorId?: string, limit: number = 50) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  // Users can see their own history; admins can see anyone's
  const targetActorId = actorId || session.user.id;
  
  if (session.user.role !== 'ADMIN' && targetActorId !== session.user.id) {
    throw new Error('Unauthorized: Cannot view other users audit history');
  }

  return await prisma.auditEvent.findMany({
    where: { actorId: targetActorId },
    orderBy: { timestamp: 'desc' },
    take: limit,
    include: {
      actor: {
        select: {
          id: true,
          email: true,
          role: true,
        },
      },
    },
  });
}
