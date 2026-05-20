import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/core/database/client', () => ({
  prisma: {
    providerProfile: { findUnique: vi.fn() },
    serviceType: { findMany: vi.fn() },
  },
}));

import { prisma } from '@/core/database/client';
import { getProviderSettings } from '../queries';

beforeEach(() => vi.clearAllMocks());

describe('getProviderSettings', () => {
  it('returns null when profile missing', async () => {
    (prisma.providerProfile.findUnique as any).mockResolvedValue(null);
    (prisma.serviceType.findMany as any).mockResolvedValue([]);
    const res = await getProviderSettings('user-1');
    expect(res).toBeNull();
  });

  it('returns profile + blocked dates as ISO strings + service catalog', async () => {
    const blockedAt = new Date('2026-06-01T00:00:00.000Z');
    (prisma.providerProfile.findUnique as any).mockResolvedValue({
      id: 'prov-1',
      businessName: 'Acme',
      mobileMoneyNumber: '+255712345678',
      serviceCategories: ['CLEANING'],
      serviceRadiusKm: 10,
      blockedDates: [{ id: 'b-1', blockedDate: blockedAt }],
    });
    (prisma.serviceType.findMany as any).mockResolvedValue([
      { id: 't-1', name: 'CLEANING' },
      { id: 't-2', name: 'PLUMBING' },
    ]);

    const res = await getProviderSettings('user-1');
    expect(res).not.toBeNull();
    expect(res!.profile.businessName).toBe('Acme');
    expect(res!.profile.mobileMoneyNumber).toBe('+255712345678');
    expect(res!.profile.serviceCategories).toEqual(['CLEANING']);
    expect(res!.profile.serviceRadiusKm).toBe(10);
    expect(res!.blockedDates).toEqual([{ id: 'b-1', date: '2026-06-01' }]);
    expect(res!.serviceCatalog).toEqual([
      { id: 't-1', name: 'CLEANING' },
      { id: 't-2', name: 'PLUMBING' },
    ]);
  });

  it('queries provider by userId with blockedDates included', async () => {
    (prisma.providerProfile.findUnique as any).mockResolvedValue({
      id: 'prov-1',
      businessName: 'Acme',
      mobileMoneyNumber: null,
      serviceCategories: [],
      serviceRadiusKm: 10,
      blockedDates: [],
    });
    (prisma.serviceType.findMany as any).mockResolvedValue([]);

    await getProviderSettings('user-1');
    const call = (prisma.providerProfile.findUnique as any).mock.calls[0][0];
    expect(call.where).toEqual({ userId: 'user-1' });
    expect(call.include.blockedDates).toBeTruthy();
  });

  it('filters service catalog to active only and sorts blocked dates ascending', async () => {
    const a = new Date('2026-07-15T00:00:00.000Z');
    const b = new Date('2026-06-01T00:00:00.000Z');
    (prisma.providerProfile.findUnique as any).mockResolvedValue({
      id: 'prov-1',
      businessName: 'Acme',
      mobileMoneyNumber: null,
      serviceCategories: [],
      serviceRadiusKm: 10,
      blockedDates: [
        { id: 'b-a', blockedDate: a },
        { id: 'b-b', blockedDate: b },
      ],
    });
    (prisma.serviceType.findMany as any).mockResolvedValue([]);

    const res = await getProviderSettings('user-1');
    expect(res!.blockedDates.map((d) => d.date)).toEqual(['2026-06-01', '2026-07-15']);

    const catalogCall = (prisma.serviceType.findMany as any).mock.calls[0][0];
    expect(catalogCall.where.isActive).toBe(true);
  });
});
