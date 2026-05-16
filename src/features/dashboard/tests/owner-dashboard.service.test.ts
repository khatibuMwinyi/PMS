// src/features/dashboard/tests/owner-dashboard.service.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Decimal from 'decimal.js';

vi.mock('@/features/dashboard/repositories/owner-dashboard.repository', () => ({
  findOwnerProfileIdByUserId: vi.fn(),
  findPaidInvoicesInRange: vi.fn(),
  countAssignmentsByStatus: vi.fn(),
  countAgreementsByStatus: vi.fn(),
  findActiveProperties: vi.fn(),
  findRecentRequests: vi.fn(),
}));

import * as repo from '@/features/dashboard/repositories/owner-dashboard.repository';
import {
  mapToOwnerStatus, statusVariant, formatTzs, formatPct, formatAge, computeTrend,
  buildOwnerKpis, buildActivePropertyCards, buildRecentRequests,
} from '@/features/dashboard/services/owner-dashboard.service';
import { AgreementStatus, AssignmentStatus } from '@prisma/client';

beforeEach(() => vi.clearAllMocks());

describe('formatTzs', () => {
  it('formats with thousands separator and 2 decimals', () => {
    expect(formatTzs(new Decimal('42500'))).toBe('TZS 42,500.00');
    expect(formatTzs(new Decimal('1234567.5'))).toBe('TZS 1,234,567.50');
    expect(formatTzs(new Decimal('0'))).toBe('TZS 0.00');
  });
});

describe('formatPct', () => {
  it('formats with one decimal', () => {
    expect(formatPct(new Decimal('18.42'))).toBe('18.4%');
    expect(formatPct(new Decimal('0'))).toBe('0.0%');
  });
  it('returns dash for NaN/Infinity', () => {
    expect(formatPct(new Decimal(NaN))).toBe('—');
  });
});

describe('formatAge', () => {
  const now = new Date('2026-05-16T12:00:00Z');
  it('returns "Just now" when <1h', () => {
    expect(formatAge(new Date('2026-05-16T11:30:00Z'), now)).toBe('Just now');
  });
  it('returns relative hours when <24h', () => {
    expect(formatAge(new Date('2026-05-16T08:00:00Z'), now)).toBe('4h ago');
  });
  it('returns absolute date when >=24h', () => {
    const result = formatAge(new Date('2026-05-14T08:00:00Z'), now);
    expect(result).toMatch(/May/);
    expect(result).toMatch(/14/);
  });
});

describe('computeTrend', () => {
  it('returns null pct when prior is zero', () => {
    const r = computeTrend(new Decimal('100'), new Decimal('0'));
    expect(r.pct).toBeNull();
    expect(r.direction).toBeNull();
  });
  it('computes positive percent up', () => {
    const r = computeTrend(new Decimal('120'), new Decimal('100'));
    expect(r.pct?.toString()).toBe('20');
    expect(r.direction).toBe('up');
  });
  it('computes percent down (absolute value)', () => {
    const r = computeTrend(new Decimal('80'), new Decimal('100'));
    expect(r.pct?.toString()).toBe('20');
    expect(r.direction).toBe('down');
  });
  it('returns flat for equal values', () => {
    const r = computeTrend(new Decimal('100'), new Decimal('100'));
    expect(r.direction).toBe('flat');
  });
});

describe('mapToOwnerStatus', () => {
  it('uses assignment status when present', () => {
    expect(mapToOwnerStatus(AgreementStatus.ACTIVE, AssignmentStatus.IN_PROGRESS)).toBe('IN_PROGRESS');
  });
  it('collapses CANCELLED_BY_OWNER + NO_SHOW to CANCELLED', () => {
    expect(mapToOwnerStatus(AgreementStatus.CANCELLED, AssignmentStatus.CANCELLED_BY_OWNER)).toBe('CANCELLED');
    expect(mapToOwnerStatus(AgreementStatus.CANCELLED, AssignmentStatus.CANCELLED_NO_SHOW)).toBe('CANCELLED');
  });
  it('treats EXPIRED/REJECTED/NO_PROVIDER_AVAILABLE as PENDING_ASSIGNMENT', () => {
    expect(mapToOwnerStatus(AgreementStatus.PENDING_ASSIGNMENT, AssignmentStatus.EXPIRED)).toBe('PENDING_ASSIGNMENT');
    expect(mapToOwnerStatus(AgreementStatus.PENDING_ASSIGNMENT, AssignmentStatus.NO_PROVIDER_AVAILABLE)).toBe('PENDING_ASSIGNMENT');
  });
  it('maps agreement status when assignment is null', () => {
    expect(mapToOwnerStatus(AgreementStatus.QUOTED, null)).toBe('PENDING_ASSIGNMENT');
    expect(mapToOwnerStatus(AgreementStatus.ACTIVE, null)).toBe('SCHEDULED');
    expect(mapToOwnerStatus(AgreementStatus.COMPLETED, null)).toBe('COMPLETED');
  });
});

describe('statusVariant', () => {
  it('maps DISPUTED to urgent', () => {
    expect(statusVariant('DISPUTED')).toBe('urgent');
  });
  it('maps IN_PROGRESS to progress', () => {
    expect(statusVariant('IN_PROGRESS')).toBe('progress');
  });
  it('maps SCHEDULED variants to scheduled', () => {
    expect(statusVariant('SCHEDULED')).toBe('scheduled');
    expect(statusVariant('PENDING_ACCEPTANCE')).toBe('scheduled');
    expect(statusVariant('PENDING_ASSIGNMENT')).toBe('scheduled');
  });
});

describe('buildOwnerKpis', () => {
  it('sums paid invoices, counts active orders, computes ROI', async () => {
    const PRISMA_DECIMAL = (s: string) => ({ toString: () => s }) as any;
    (repo.findPaidInvoicesInRange as any)
      .mockResolvedValueOnce([
        { amount: PRISMA_DECIMAL('30000.00'), paidAt: new Date('2026-02-10') },
        { amount: PRISMA_DECIMAL('12500.00'), paidAt: new Date('2026-04-01') },
      ])
      .mockResolvedValueOnce([
        { amount: PRISMA_DECIMAL('38000.00'), paidAt: new Date('2025-04-01') },
      ]);
    (repo.countAssignmentsByStatus as any)
      .mockResolvedValueOnce(24)  // active
      .mockResolvedValueOnce(8);  // pending acceptance
    (repo.countAgreementsByStatus as any)
      .mockResolvedValueOnce(15)  // completed
      .mockResolvedValueOnce(20); // paid

    const kpis = await buildOwnerKpis('user-1', new Date('2026-05-16T12:00:00Z'));

    expect(kpis.totalSpentYtdFormatted).toBe('TZS 42,500.00');
    expect(kpis.activeWorkOrders).toBe(24);
    expect(kpis.pendingAcceptance).toBe(8);
    expect(kpis.maintenanceRoiFormatted).toBe('75.0%');
    expect(kpis.ytdTrendDirection).toBe('up');
  });

  it('returns dash ROI when no paid agreements', async () => {
    (repo.findPaidInvoicesInRange as any).mockResolvedValue([]);
    (repo.countAssignmentsByStatus as any).mockResolvedValue(0);
    (repo.countAgreementsByStatus as any).mockResolvedValue(0);

    const kpis = await buildOwnerKpis('user-1', new Date('2026-05-16T12:00:00Z'));
    expect(kpis.maintenanceRoiFormatted).toBe('—');
    expect(kpis.ytdTrendPct).toBeNull();
  });
});

describe('buildActivePropertyCards', () => {
  it('returns empty array when no owner profile', async () => {
    (repo.findOwnerProfileIdByUserId as any).mockResolvedValue(null);
    expect(await buildActivePropertyCards('user-1')).toEqual([]);
  });

  it('maps property to card with computed occupancy and fallback address', async () => {
    (repo.findOwnerProfileIdByUserId as any).mockResolvedValue('op-1');
    (repo.findActiveProperties as any).mockResolvedValue([
      {
        id: 'p1', name: 'Oak', type: 'APARTMENT_BUILDING', zone: '',
        imageUrls: ['https://img/1'], unitCount: 3,
        unitsOccupied: 2, unitsTotal: 4, updatedAt: new Date(),
      },
    ]);
    const cards = await buildActivePropertyCards('user-1');
    expect(cards[0].addressLine).toBe('Address not set');
    expect(cards[0].occupancyPct).toBe(50);
    expect(cards[0].imageUrl).toBe('https://img/1');
    expect(cards[0].hrefDetail).toBe('/owner/properties/p1');
  });
});

describe('buildRecentRequests', () => {
  it('maps repository rows to UI-ready shape', async () => {
    (repo.findRecentRequests as any).mockResolvedValue([
      {
        agreementId: 'a1', serviceTypeName: 'HVAC', propertyName: 'Oak',
        agreementStatus: 'ACTIVE', assignmentStatus: 'IN_PROGRESS',
        createdAt: new Date('2026-05-16T10:00:00Z'),
      },
    ]);
    const reqs = await buildRecentRequests(
      'user-1', 5, new Date('2026-05-16T12:00:00Z'),
    );
    expect(reqs[0]).toEqual({
      agreementId: 'a1',
      serviceTypeName: 'HVAC',
      propertyName: 'Oak',
      status: 'IN_PROGRESS',
      statusVariant: 'progress',
      ageHuman: '2h ago',
      hrefDetail: '/owner/work-orders/a1',
    });
  });
});
