// src/features/tasks/tests/tasks.queries.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/core/database/client', () => ({
  prisma: {
    providerProfile: { findUnique: vi.fn() },
    task: { findFirst: vi.fn() },
  },
}));

import { prisma } from '@/core/database/client';
import { getProviderTaskDetail } from '../queries';

const PROVIDER_ID = 'prov-1';
const USER_ID = 'user-1';
const TASK_ID = '11111111-1111-1111-1111-111111111111';

function makeTask(overrides: Partial<any> = {}) {
  return {
    id: TASK_ID,
    scheduledFor: new Date('2026-06-01T10:00:00Z'),
    status: 'SCHEDULED',
    checkInTime: null,
    checkOutTime: null,
    evidenceImages: [],
    pendingPhotoVerification: false,
    assignment: {
      id: 'assign-1',
      status: 'ACCEPTED',
      providerPayout: { toString: () => '80000.00' },
      expiresAt: new Date('2026-06-01T16:00:00Z'),
      acceptedAt: new Date('2026-05-30T09:00:00Z'),
      scheduledDate: new Date('2026-06-01T10:00:00Z'),
      serviceType: { name: 'HVAC Maintenance' },
      property: {
        zone: 'Downtown',
        latitude: -6.7924,
        longitude: 39.2083,
        encryptedAddress: '1400 Monon St, Unit 4B',
      },
    },
    ...overrides,
  };
}

beforeEach(() => vi.clearAllMocks());

describe('getProviderTaskDetail', () => {
  it('returns null when provider profile missing', async () => {
    (prisma.providerProfile.findUnique as any).mockResolvedValue(null);
    const result = await getProviderTaskDetail(TASK_ID, USER_ID);
    expect(result).toBeNull();
    expect(prisma.task.findFirst).not.toHaveBeenCalled();
  });

  it('returns null when task not owned by provider', async () => {
    (prisma.providerProfile.findUnique as any).mockResolvedValue({ id: PROVIDER_ID });
    (prisma.task.findFirst as any).mockResolvedValue(null);
    const result = await getProviderTaskDetail(TASK_ID, USER_ID);
    expect(result).toBeNull();
    const call = (prisma.task.findFirst as any).mock.calls[0][0];
    expect(call.where.id).toBe(TASK_ID);
    expect(call.where.assignment.providerId).toBe(PROVIDER_ID);
  });

  it('reveals exact address post-acceptance', async () => {
    (prisma.providerProfile.findUnique as any).mockResolvedValue({ id: PROVIDER_ID });
    (prisma.task.findFirst as any).mockResolvedValue(makeTask());
    const result = await getProviderTaskDetail(TASK_ID, USER_ID);
    expect(result?.property.exactAddress).toBe('1400 Monon St, Unit 4B');
    expect(result?.property.zone).toBe('Downtown');
    expect(result?.assignment.providerPayoutTZS).toBe('80000.00');
  });

  it('redacts exact address when assignment still pending acceptance', async () => {
    (prisma.providerProfile.findUnique as any).mockResolvedValue({ id: PROVIDER_ID });
    (prisma.task.findFirst as any).mockResolvedValue(
      makeTask({ assignment: { ...makeTask().assignment, status: 'PENDING_ACCEPTANCE' } }),
    );
    const result = await getProviderTaskDetail(TASK_ID, USER_ID);
    expect(result?.property.exactAddress).toBeNull();
    expect(result?.property.zone).toBe('Downtown');
  });

  it('reveals exact address for IN_PROGRESS / COMPLETED / DISPUTED / VERIFIED', async () => {
    (prisma.providerProfile.findUnique as any).mockResolvedValue({ id: PROVIDER_ID });
    for (const status of ['IN_PROGRESS', 'COMPLETED', 'DISPUTED', 'VERIFIED']) {
      (prisma.task.findFirst as any).mockResolvedValue(
        makeTask({ assignment: { ...makeTask().assignment, status } }),
      );
      const result = await getProviderTaskDetail(TASK_ID, USER_ID);
      expect(result?.property.exactAddress).toBe('1400 Monon St, Unit 4B');
    }
  });

  it('redacts exact address for CANCELLED / EXPIRED / REJECTED', async () => {
    (prisma.providerProfile.findUnique as any).mockResolvedValue({ id: PROVIDER_ID });
    for (const status of ['EXPIRED', 'REJECTED', 'CANCELLED_NO_SHOW', 'CANCELLED_BY_OWNER']) {
      (prisma.task.findFirst as any).mockResolvedValue(
        makeTask({ assignment: { ...makeTask().assignment, status } }),
      );
      const result = await getProviderTaskDetail(TASK_ID, USER_ID);
      expect(result?.property.exactAddress).toBeNull();
    }
  });

  it('select clause never includes owner relation or encrypted PII other than address', async () => {
    (prisma.providerProfile.findUnique as any).mockResolvedValue({ id: PROVIDER_ID });
    (prisma.task.findFirst as any).mockResolvedValue(makeTask());
    await getProviderTaskDetail(TASK_ID, USER_ID);
    const call = (prisma.task.findFirst as any).mock.calls[0][0];
    const propertySelect = call.select.assignment.select.property.select;
    expect(propertySelect.owner).toBeUndefined();
    expect(propertySelect.ownerId).toBeUndefined();
    const serviceTypeSelect = call.select.assignment.select.serviceType.select;
    expect(serviceTypeSelect.name).toBe(true);
  });
});
