import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/core/database/client', () => ({
  prisma: {
    providerProfile: { findUnique: vi.fn() },
    walletTransaction: { aggregate: vi.fn() },
    assignment: { findMany: vi.fn(), count: vi.fn() },
  },
}));

import { prisma } from '@/core/database/client';
import { getProviderDashboard } from '../queries/provider';

const PROVIDER_ID = 'prov-1';
const USER_ID = 'user-1';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getProviderDashboard', () => {
  it('returns empty dashboard when provider profile missing', async () => {
    (prisma.providerProfile.findUnique as any).mockResolvedValue(null);
    const data = await getProviderDashboard(USER_ID);
    expect(data.earnings.todayTZS).toBe(0);
    expect(data.metrics.activeTaskCount).toBe(0);
    expect(data.nextUpcoming).toBeNull();
    expect(data.pipeline).toEqual([]);
  });

  it('aggregates wallet today earnings + provider profile metrics', async () => {
    (prisma.providerProfile.findUnique as any).mockResolvedValue({
      id: PROVIDER_ID,
      userId: USER_ID,
      rating: 4.85,
      strikeCount: 0,
      completedJobs: 12,
      totalJobs: 15,
      suspendedUntil: null,
      wallet: {
        availableBalance: { toNumber: () => 120000 },
        pendingBalance: { toNumber: () => 30000 },
        totalEarned: { toNumber: () => 800000 },
      },
    });
    (prisma.walletTransaction.aggregate as any).mockResolvedValue({
      _sum: { amount: { toNumber: () => 50000 } },
    });
    (prisma.assignment.findMany as any).mockResolvedValue([]);
    (prisma.assignment.count as any).mockResolvedValue(0);

    const data = await getProviderDashboard(USER_ID);
    expect(data.earnings.todayTZS).toBe(50000);
    expect(data.earnings.pendingTZS).toBe(30000);
    expect(data.earnings.availableTZS).toBe(120000);
    expect(data.metrics.rating).toBeCloseTo(4.85, 2);
    expect(data.metrics.ratingCount).toBe(12);
    expect(data.metrics.strikeCount).toBe(0);
    expect(data.metrics.suspendedUntil).toBeNull();
  });

  it('returns null nextUpcoming when no scheduled tasks in next 48h', async () => {
    (prisma.providerProfile.findUnique as any).mockResolvedValue({
      id: PROVIDER_ID,
      userId: USER_ID,
      rating: 0,
      strikeCount: 0,
      completedJobs: 0,
      totalJobs: 0,
      suspendedUntil: null,
      wallet: null,
    });
    (prisma.walletTransaction.aggregate as any).mockResolvedValue({ _sum: { amount: null } });
    (prisma.assignment.findMany as any).mockResolvedValue([]);
    (prisma.assignment.count as any).mockResolvedValue(0);

    const data = await getProviderDashboard(USER_ID);
    expect(data.nextUpcoming).toBeNull();
  });

  it('builds pipeline from active assignments', async () => {
    (prisma.providerProfile.findUnique as any).mockResolvedValue({
      id: PROVIDER_ID,
      userId: USER_ID,
      rating: 0,
      strikeCount: 0,
      completedJobs: 0,
      totalJobs: 0,
      suspendedUntil: null,
      wallet: null,
    });
    (prisma.walletTransaction.aggregate as any).mockResolvedValue({ _sum: { amount: null } });
    (prisma.assignment.findMany as any).mockResolvedValue([
      {
        id: 'A-1',
        status: 'ACCEPTED',
        scheduledDate: new Date('2026-06-10T09:00:00Z'),
        serviceType: { name: 'HVAC' },
        property: { zone: 'Downtown' },
        tasks: [],
      },
      {
        id: 'A-2',
        status: 'IN_PROGRESS',
        scheduledDate: null,
        serviceType: { name: 'Cleaning' },
        property: { zone: 'Westside' },
        tasks: [],
      },
    ]);
    (prisma.assignment.count as any).mockResolvedValue(0);

    const data = await getProviderDashboard(USER_ID);
    expect(data.pipeline).toHaveLength(2);
    expect(data.pipeline[0]).toMatchObject({
      assignmentId: 'A-1',
      serviceTypeName: 'HVAC',
      zone: 'Downtown',
      status: 'ACCEPTED',
    });
    expect(data.pipeline[1].scheduledFor).toBeNull();
    expect(data.metrics.activeTaskCount).toBe(2);
  });

  it('picks nextUpcoming as soonest task in [now, now+2d]', async () => {
    const future = new Date(Date.now() + 60 * 60 * 1000);
    const farFuture = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);

    (prisma.providerProfile.findUnique as any).mockResolvedValue({
      id: PROVIDER_ID,
      userId: USER_ID,
      rating: 0,
      strikeCount: 0,
      completedJobs: 0,
      totalJobs: 0,
      suspendedUntil: null,
      wallet: null,
    });
    (prisma.walletTransaction.aggregate as any).mockResolvedValue({ _sum: { amount: null } });
    (prisma.assignment.findMany as any).mockResolvedValue([
      {
        id: 'A-1',
        status: 'ACCEPTED',
        scheduledDate: future,
        serviceType: { name: 'HVAC' },
        property: { zone: 'Downtown' },
        tasks: [{ id: 'T-1', scheduledFor: future }],
      },
      {
        id: 'A-2',
        status: 'ACCEPTED',
        scheduledDate: farFuture,
        serviceType: { name: 'Cleaning' },
        property: { zone: 'Westside' },
        tasks: [{ id: 'T-2', scheduledFor: farFuture }],
      },
    ]);
    (prisma.assignment.count as any).mockResolvedValue(0);

    const data = await getProviderDashboard(USER_ID);
    expect(data.nextUpcoming?.assignmentId).toBe('A-1');
    expect(data.nextUpcoming?.taskId).toBe('T-1');
    expect(data.nextUpcoming?.serviceTypeName).toBe('HVAC');
  });

  it('surfaces suspendedUntil as ISO string when set', async () => {
    const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    (prisma.providerProfile.findUnique as any).mockResolvedValue({
      id: PROVIDER_ID,
      userId: USER_ID,
      rating: 0,
      strikeCount: 3,
      completedJobs: 0,
      totalJobs: 0,
      suspendedUntil: futureDate,
      wallet: null,
    });
    (prisma.walletTransaction.aggregate as any).mockResolvedValue({ _sum: { amount: null } });
    (prisma.assignment.findMany as any).mockResolvedValue([]);
    (prisma.assignment.count as any).mockResolvedValue(0);

    const data = await getProviderDashboard(USER_ID);
    expect(data.metrics.strikeCount).toBe(3);
    expect(data.metrics.suspendedUntil).toBe(futureDate.toISOString());
  });

  it('returns null suspendedUntil when no provider profile', async () => {
    (prisma.providerProfile.findUnique as any).mockResolvedValue(null);
    const data = await getProviderDashboard(USER_ID);
    expect(data.metrics.suspendedUntil).toBeNull();
  });
});
