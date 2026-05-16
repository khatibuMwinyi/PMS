// src/features/dashboard/tests/owner-dashboard.repository.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/core/database/client', () => ({
  prisma: {
    ownerProfile: { findUnique: vi.fn() },
    invoice: { findMany: vi.fn() },
    assignment: { count: vi.fn() },
    agreement: { count: vi.fn(), findMany: vi.fn() },
    property: { findMany: vi.fn() },
  },
}));

import { prisma } from '@/core/database/client';
import {
  findOwnerProfileIdByUserId,
  findPaidInvoicesInRange,
  countAssignmentsByStatus,
  countAgreementsByStatus,
  findActiveProperties,
  findRecentRequests,
} from '@/features/dashboard/repositories/owner-dashboard.repository';
import { AgreementStatus, AssignmentStatus } from '@prisma/client';

const userId = 'user-123';
const ownerProfileId = 'owner-456';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('findOwnerProfileIdByUserId', () => {
  it('returns profile id when found', async () => {
    (prisma.ownerProfile.findUnique as any).mockResolvedValue({ id: ownerProfileId });
    const result = await findOwnerProfileIdByUserId(userId);
    expect(result).toBe(ownerProfileId);
    expect(prisma.ownerProfile.findUnique).toHaveBeenCalledWith({
      where: { userId },
      select: { id: true },
    });
  });

  it('returns null when no profile exists', async () => {
    (prisma.ownerProfile.findUnique as any).mockResolvedValue(null);
    expect(await findOwnerProfileIdByUserId(userId)).toBeNull();
  });
});

describe('findPaidInvoicesInRange', () => {
  it('scopes query to owner and PAID status in date range', async () => {
    (prisma.invoice.findMany as any).mockResolvedValue([]);
    const start = new Date('2026-01-01');
    const end = new Date('2026-05-16');
    await findPaidInvoicesInRange(userId, start, end);

    const call = (prisma.invoice.findMany as any).mock.calls[0][0];
    expect(call.where.status).toBe('PAID');
    expect(call.where.paidAt).toEqual({ gte: start, lt: end });
    expect(call.where.agreement).toEqual({ ownerId: userId });
    expect(call.select).toEqual({ amount: true, paidAt: true });
  });
});

describe('countAssignmentsByStatus', () => {
  it('counts assignments scoped to owner', async () => {
    (prisma.assignment.count as any).mockResolvedValue(7);
    const result = await countAssignmentsByStatus(userId, [
      AssignmentStatus.ACCEPTED, AssignmentStatus.SCHEDULED,
    ]);
    expect(result).toBe(7);
    const call = (prisma.assignment.count as any).mock.calls[0][0];
    expect(call.where.agreement).toEqual({ ownerId: userId });
    expect(call.where.status).toEqual({ in: ['ACCEPTED', 'SCHEDULED'] });
  });
});

describe('countAgreementsByStatus', () => {
  it('counts agreements scoped to owner', async () => {
    (prisma.agreement.count as any).mockResolvedValue(3);
    const result = await countAgreementsByStatus(userId, [AgreementStatus.COMPLETED]);
    expect(result).toBe(3);
    const call = (prisma.agreement.count as any).mock.calls[0][0];
    expect(call.where.ownerId).toBe(userId);
    expect(call.where.status).toEqual({ in: ['COMPLETED'] });
  });
});

describe('findActiveProperties', () => {
  it('does NOT select encryptedAddress', async () => {
    (prisma.property.findMany as any).mockResolvedValue([]);
    await findActiveProperties(ownerProfileId, 4);
    const call = (prisma.property.findMany as any).mock.calls[0][0];
    expect(call.select).not.toHaveProperty('encryptedAddress');
    expect(call.select).toHaveProperty('zone', true);
    expect(call.where).toEqual({ ownerId: ownerProfileId, status: 'ACTIVE' });
    expect(call.orderBy).toEqual({ updatedAt: 'desc' });
    expect(call.take).toBe(4);
  });

  it('computes occupancy from units occupantCount', async () => {
    (prisma.property.findMany as any).mockResolvedValue([
      {
        id: 'p1', name: 'Oak', type: 'APARTMENT_BUILDING', zone: 'Mikocheni',
        imageUrls: [], unitCount: 3, updatedAt: new Date(),
        units: [{ occupantCount: 2 }, { occupantCount: 0 }, { occupantCount: 1 }],
      },
    ]);
    const rows = await findActiveProperties(ownerProfileId, 4);
    expect(rows[0].unitsOccupied).toBe(2);
    expect(rows[0].unitsTotal).toBe(3);
  });
});

describe('findRecentRequests', () => {
  it('returns no provider fields in mapped shape', async () => {
    (prisma.agreement.findMany as any).mockResolvedValue([
      {
        id: 'a1', status: 'ACTIVE', createdAt: new Date(),
        property: { name: 'Oak' },
        serviceType: { name: 'Cleaning' },
        assignment: { status: 'SCHEDULED' },
      },
    ]);
    const rows = await findRecentRequests(userId, 5);
    expect(rows[0]).toEqual({
      agreementId: 'a1',
      serviceTypeName: 'Cleaning',
      propertyName: 'Oak',
      agreementStatus: 'ACTIVE',
      assignmentStatus: 'SCHEDULED',
      createdAt: expect.any(Date),
    });
    // Privacy assertion: no provider key in returned object.
    expect(Object.keys(rows[0])).not.toContain('providerId');
    expect(Object.keys(rows[0])).not.toContain('provider');
  });

  it('does NOT include provider in prisma select', async () => {
    (prisma.agreement.findMany as any).mockResolvedValue([]);
    await findRecentRequests(userId, 5);
    const call = (prisma.agreement.findMany as any).mock.calls[0][0];
    expect(call.select.assignment).toEqual({ select: { status: true } });
    expect(call.select).not.toHaveProperty('provider');
    expect(call.where).toEqual({ ownerId: userId });
    expect(call.orderBy).toEqual({ createdAt: 'desc' });
    expect(call.take).toBe(5);
  });
});
