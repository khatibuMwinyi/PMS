// src/features/tasks/tests/tasks.history.queries.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/core/database/client', () => ({
  prisma: {
    providerProfile: { findUnique: vi.fn() },
    task: { findMany: vi.fn(), count: vi.fn() },
  },
}));

import { prisma } from '@/core/database/client';
import { getProviderTaskHistory } from '../queries';

const USER_ID = 'user-1';
const PROVIDER_ID = 'prov-1';

beforeEach(() => vi.clearAllMocks());

function setProvider() {
  (prisma.providerProfile.findUnique as any).mockResolvedValue({ id: PROVIDER_ID });
}

describe('getProviderTaskHistory', () => {
  it('returns empty result when provider profile missing', async () => {
    (prisma.providerProfile.findUnique as any).mockResolvedValue(null);
    const res = await getProviderTaskHistory(USER_ID, { statuses: [] }, 1, 20);
    expect(res).toEqual({ rows: [], total: 0, page: 1, pageSize: 20 });
    expect(prisma.task.findMany).not.toHaveBeenCalled();
  });

  it('applies 90-day scheduledFor window', async () => {
    setProvider();
    (prisma.task.findMany as any).mockResolvedValue([]);
    (prisma.task.count as any).mockResolvedValue(0);

    const before = Date.now();
    await getProviderTaskHistory(USER_ID, { statuses: [] }, 1, 20);
    const call = (prisma.task.findMany as any).mock.calls[0][0];
    const cutoff = call.where.scheduledFor.gte.getTime();
    const expected = before - 90 * 24 * 60 * 60 * 1000;
    expect(cutoff).toBeGreaterThanOrEqual(expected - 1000);
    expect(cutoff).toBeLessThanOrEqual(expected + 1000);
  });

  it('scopes by providerId via assignment relation', async () => {
    setProvider();
    (prisma.task.findMany as any).mockResolvedValue([]);
    (prisma.task.count as any).mockResolvedValue(0);

    await getProviderTaskHistory(USER_ID, { statuses: [] }, 1, 20);
    const call = (prisma.task.findMany as any).mock.calls[0][0];
    expect(call.where.assignment.providerId).toBe(PROVIDER_ID);
  });

  it('builds OR predicate for mixed status filter', async () => {
    setProvider();
    (prisma.task.findMany as any).mockResolvedValue([]);
    (prisma.task.count as any).mockResolvedValue(0);

    await getProviderTaskHistory(USER_ID, { statuses: ['VERIFIED', 'CANCELLED'] }, 1, 20);
    const call = (prisma.task.findMany as any).mock.calls[0][0];
    expect(call.where.OR).toEqual(
      expect.arrayContaining([
        { status: { in: ['VERIFIED'] } },
        {
          assignment: expect.objectContaining({
            status: { in: ['CANCELLED_BY_OWNER', 'CANCELLED_NO_SHOW', 'EXPIRED', 'REJECTED', 'AUTO_REASSIGNED'] },
          }),
        },
      ]),
    );
  });

  it('omits OR predicate when statuses is empty (broad query)', async () => {
    setProvider();
    (prisma.task.findMany as any).mockResolvedValue([]);
    (prisma.task.count as any).mockResolvedValue(0);

    await getProviderTaskHistory(USER_ID, { statuses: [] }, 1, 20);
    const call = (prisma.task.findMany as any).mock.calls[0][0];
    expect(call.where.OR).toBeDefined();
    // The broad query still uses OR with all 5 mapped predicates
    expect(call.where.OR.length).toBe(2); // task.status IN [4 task statuses] + assignment.status IN [5 cancellation states]
  });

  it('select clause omits owner relation and encryptedAddress', async () => {
    setProvider();
    (prisma.task.findMany as any).mockResolvedValue([]);
    (prisma.task.count as any).mockResolvedValue(0);

    await getProviderTaskHistory(USER_ID, { statuses: [] }, 1, 20);
    const call = (prisma.task.findMany as any).mock.calls[0][0];
    const propertySelect = call.select.assignment.select.property.select;
    expect(propertySelect.owner).toBeUndefined();
    expect(propertySelect.ownerId).toBeUndefined();
    expect(propertySelect.encryptedAddress).toBeUndefined();
    expect(propertySelect.zone).toBe(true);
  });

  it('clamps page to 1 when given 0 or negative', async () => {
    setProvider();
    (prisma.task.findMany as any).mockResolvedValue([]);
    (prisma.task.count as any).mockResolvedValue(0);

    const res = await getProviderTaskHistory(USER_ID, { statuses: [] }, 0, 20);
    expect(res.page).toBe(1);
    const call = (prisma.task.findMany as any).mock.calls[0][0];
    expect(call.skip).toBe(0);
  });

  it('clamps page to last valid page when given out-of-range', async () => {
    setProvider();
    (prisma.task.findMany as any).mockResolvedValue([]);
    (prisma.task.count as any).mockResolvedValue(45); // 3 pages at pageSize 20

    const res = await getProviderTaskHistory(USER_ID, { statuses: [] }, 99, 20);
    expect(res.page).toBe(3);
    const call = (prisma.task.findMany as any).mock.calls[1][0]; // re-fetch with clamped page
    expect(call.skip).toBe(40);
  });

  it('returns rows shaped for the table', async () => {
    setProvider();
    (prisma.task.findMany as any).mockResolvedValue([
      {
        id: 'task-a',
        scheduledFor: new Date('2026-04-01T10:00:00Z'),
        status: 'VERIFIED',
        assignment: {
          id: 'assign-a',
          status: 'VERIFIED',
          providerPayout: { toString: () => '80000.00' },
          serviceType: { name: 'HVAC' },
          property: { zone: 'Downtown' },
        },
      },
    ]);
    (prisma.task.count as any).mockResolvedValue(1);

    const res = await getProviderTaskHistory(USER_ID, { statuses: ['VERIFIED'] }, 1, 20);
    expect(res.rows).toHaveLength(1);
    expect(res.rows[0]).toMatchObject({
      id: 'task-a',
      scheduledFor: '2026-04-01T10:00:00.000Z',
      uiStatus: 'VERIFIED',
      serviceTypeName: 'HVAC',
      zone: 'Downtown',
      providerPayoutTZS: '80000.00',
    });
  });
});
