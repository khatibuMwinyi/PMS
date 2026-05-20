import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/core/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/core/database/client', () => ({
  prisma: {
    providerProfile: { findUnique: vi.fn(), update: vi.fn() },
    providerBlockedDate: { create: vi.fn(), delete: vi.fn(), findUnique: vi.fn() },
  },
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

import { auth } from '@/core/auth';
import { prisma } from '@/core/database/client';
import {
  updateProviderProfile,
  updateProviderCoverage,
  addBlockedDate,
  removeBlockedDate,
} from '../actions';

beforeEach(() => vi.clearAllMocks());

function asProvider() {
  (auth as any).mockResolvedValue({
    user: { id: 'user-1', role: 'PROVIDER' },
  });
  (prisma.providerProfile.findUnique as any).mockResolvedValue({ id: 'prov-1' });
}

describe('updateProviderProfile', () => {
  it('rejects unauthenticated calls', async () => {
    (auth as any).mockResolvedValue(null);
    await expect(
      updateProviderProfile({ businessName: 'Acme', mobileMoneyNumber: null }),
    ).rejects.toThrow('Unauthorized');
  });

  it('rejects non-PROVIDER role', async () => {
    (auth as any).mockResolvedValue({ user: { id: 'u', role: 'OWNER' } });
    await expect(
      updateProviderProfile({ businessName: 'Acme', mobileMoneyNumber: null }),
    ).rejects.toThrow('Unauthorized');
  });

  it('rejects when provider profile not found', async () => {
    (auth as any).mockResolvedValue({ user: { id: 'u', role: 'PROVIDER' } });
    (prisma.providerProfile.findUnique as any).mockResolvedValue(null);
    await expect(
      updateProviderProfile({ businessName: 'Acme', mobileMoneyNumber: null }),
    ).rejects.toThrow('Provider profile not found');
  });

  it('rejects invalid mobileMoneyNumber format', async () => {
    asProvider();
    await expect(
      updateProviderProfile({ businessName: 'Acme', mobileMoneyNumber: '0712345678' }),
    ).rejects.toThrow(/Mobile money number/);
    expect(prisma.providerProfile.update).not.toHaveBeenCalled();
  });

  it('updates profile when payload is valid', async () => {
    asProvider();
    (prisma.providerProfile.update as any).mockResolvedValue({});
    const res = await updateProviderProfile({
      businessName: 'Acme',
      mobileMoneyNumber: '+255712345678',
    });
    expect(res).toEqual({ success: true });
    expect(prisma.providerProfile.update).toHaveBeenCalledWith({
      where: { id: 'prov-1' },
      data: { businessName: 'Acme', mobileMoneyNumber: '+255712345678' },
    });
  });
});

describe('updateProviderCoverage', () => {
  it('rejects empty categories', async () => {
    asProvider();
    await expect(
      updateProviderCoverage({ serviceCategories: [], serviceRadiusKm: 10 }),
    ).rejects.toThrow(/at least one/);
    expect(prisma.providerProfile.update).not.toHaveBeenCalled();
  });

  it('rejects radius out of range', async () => {
    asProvider();
    await expect(
      updateProviderCoverage({ serviceCategories: ['CLEANING'], serviceRadiusKm: 100 }),
    ).rejects.toThrow(/at most 30/);
  });

  it('updates coverage when payload is valid', async () => {
    asProvider();
    (prisma.providerProfile.update as any).mockResolvedValue({});
    const res = await updateProviderCoverage({
      serviceCategories: ['CLEANING', 'PLUMBING'],
      serviceRadiusKm: 15,
    });
    expect(res).toEqual({ success: true });
    expect(prisma.providerProfile.update).toHaveBeenCalledWith({
      where: { id: 'prov-1' },
      data: { serviceCategories: ['CLEANING', 'PLUMBING'], serviceRadiusKm: 15 },
    });
  });
});

describe('addBlockedDate', () => {
  it('rejects past dates', async () => {
    asProvider();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);
    await expect(addBlockedDate({ date: yesterday })).rejects.toThrow(/today or later/);
    expect(prisma.providerBlockedDate.create).not.toHaveBeenCalled();
  });

  it('creates blocked date scoped to the calling provider', async () => {
    asProvider();
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);
    (prisma.providerBlockedDate.create as any).mockResolvedValue({
      id: 'b-1',
      blockedDate: new Date(`${tomorrow}T00:00:00.000Z`),
    });
    const res = await addBlockedDate({ date: tomorrow });
    expect(res).toEqual({ success: true, id: 'b-1' });
    const call = (prisma.providerBlockedDate.create as any).mock.calls[0][0];
    expect(call.data.providerId).toBe('prov-1');
    expect(call.data.blockedDate.toISOString().slice(0, 10)).toBe(tomorrow);
  });

  it('returns friendly error on unique-constraint violation', async () => {
    asProvider();
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);
    (prisma.providerBlockedDate.create as any).mockRejectedValue(
      Object.assign(new Error('Unique constraint failed'), { code: 'P2002' }),
    );
    await expect(addBlockedDate({ date: tomorrow })).rejects.toThrow(
      'That date is already blocked.',
    );
  });
});

describe('removeBlockedDate', () => {
  it('rejects calls with mismatched ownership', async () => {
    asProvider();
    (prisma.providerBlockedDate.findUnique as any).mockResolvedValue({
      id: 'b-1',
      providerId: 'other-prov',
    });
    await expect(
      removeBlockedDate({ id: '11111111-1111-1111-1111-111111111111' }),
    ).rejects.toThrow('Blocked date not found');
    expect(prisma.providerBlockedDate.delete).not.toHaveBeenCalled();
  });

  it('deletes blocked date when owned by caller', async () => {
    asProvider();
    (prisma.providerBlockedDate.findUnique as any).mockResolvedValue({
      id: 'b-1',
      providerId: 'prov-1',
    });
    (prisma.providerBlockedDate.delete as any).mockResolvedValue({});
    const res = await removeBlockedDate({
      id: '11111111-1111-1111-1111-111111111111',
    });
    expect(res).toEqual({ success: true });
    expect(prisma.providerBlockedDate.delete).toHaveBeenCalledWith({
      where: { id: '11111111-1111-1111-1111-111111111111' },
    });
  });
});
