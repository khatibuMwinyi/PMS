import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/core/database/client', () => ({
  prisma: {
    property: { findUnique: vi.fn() },
    serviceType: { findUnique: vi.fn() },
    $queryRaw: vi.fn(),
  },
}));

import { prisma } from '@/core/database/client';
import { findBestProvider } from '../queries';

beforeEach(() => vi.clearAllMocks());

function setupProperty() {
  (prisma.property.findUnique as any).mockResolvedValue({
    latitude: -6.78,
    longitude: 39.27,
  });
  (prisma.serviceType.findUnique as any).mockResolvedValue({ name: 'CLEANING' });
}

function joinSqlStrings(): string {
  const strings = (prisma.$queryRaw as any).mock.calls[0][0] as ArrayLike<string>;
  return Array.from(strings).join(' ');
}

describe('findBestProvider scheduledDate handling', () => {
  it('omits blocked-date clause when scheduledDate is undefined', async () => {
    setupProperty();
    (prisma.$queryRaw as any).mockResolvedValue([
      { id: 'p-1', rating: 5, completed_jobs: 10, total_jobs: 10, acceptance_rate: 1, responsiveness: 1, current_load: 0, max_concurrent: 3, distance_km: 1 },
    ]);

    await findBestProvider('prop-1', 'svc-1', 10, 0);

    expect(joinSqlStrings()).not.toMatch(/provider_blocked_dates/);
  });

  it('includes blocked-date clause when scheduledDate is provided', async () => {
    setupProperty();
    (prisma.$queryRaw as any).mockResolvedValue([
      { id: 'p-1', rating: 5, completed_jobs: 10, total_jobs: 10, acceptance_rate: 1, responsiveness: 1, current_load: 0, max_concurrent: 3, distance_km: 1 },
    ]);

    const scheduled = new Date('2026-07-01T00:00:00.000Z');
    await findBestProvider('prop-1', 'svc-1', 10, 0, scheduled);

    const joined = joinSqlStrings();
    expect(joined).toMatch(/provider_blocked_dates/);
    expect(joined).toMatch(/NOT EXISTS/);
  });

  it('returns null when no providers match', async () => {
    setupProperty();
    (prisma.$queryRaw as any).mockResolvedValue([]);
    const res = await findBestProvider('prop-1', 'svc-1', 10, 0);
    expect(res).toBeNull();
  });

  it('respects minScoreThreshold (filtering below)', async () => {
    setupProperty();
    (prisma.$queryRaw as any).mockResolvedValue([
      { id: 'p-1', rating: 0, completed_jobs: 0, total_jobs: 0, acceptance_rate: 0, responsiveness: 0, current_load: 0, max_concurrent: 3, distance_km: 1 },
    ]);
    const res = await findBestProvider('prop-1', 'svc-1', 10, 0.9);
    expect(res).toBeNull();
  });
});
