# Owner Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build read-only owner landing page (`/owner/dashboard`) with KPI cards, active properties panel, and recent requests panel, sourced from real Prisma data with strict privacy isolation (no provider identity rendered) and full vertical stack (UI + queries + repo + service + Zod + tests).

**Architecture:** Next.js 16 App Router + Server Components + Suspense. Vertical slice in `src/features/dashboard/` with `repositories/`, `services/`, `queries/`, `schemas/`, `components/owner/`, `tests/`. Shared UI primitives in `src/shared/components/`. Privacy isolation enforced at repository select clauses. Decimal.js for all currency arithmetic; format to TZS only at UI edge.

**Tech Stack:** Next.js 16 (App Router), TypeScript 5.6, React 19, Prisma 5.20, Decimal.js 10, Zod 3, Vitest 4 (jsdom + globals), Playwright 1.59, Tailwind, Lucide icons.

**Spec:** [docs/superpowers/specs/2026-05-16-owner-dashboard-design.md](../specs/2026-05-16-owner-dashboard-design.md)

---

## Conventions used throughout this plan

- `cn` utility import path: `@/lib/cn` (do NOT use `@/core/lib/utils`).
- Prisma client import: `import { prisma } from '@/core/database/client'`. The client auto-decrypts `User.phone` and `Property.encryptedAddress` on read via Prisma `$extends.result.compute`. **Never select these fields from owner-scoped dashboard repos.**
- Auth import: `import { auth } from '@/core/auth'`. Returns `{ user: { id, role, status, name?, email? } } | null`.
- Decimal: `import Decimal from 'decimal.js'`. Prisma returns `Prisma.Decimal`; convert to `decimal.js` `Decimal` with `new Decimal(prismaDecimal.toString())` for arithmetic to avoid floating-point loss.
- Test runner: `pnpm test:run` (CI mode) or `pnpm test -- <pattern>` (watch). Vitest globals enabled, so `describe`, `it`, `expect`, `vi` are available without import.
- All new components are Server Components (`async function` allowed) unless they use hooks/interactivity, in which case `'use client'` directive at top.
- Tailwind: use existing CSS-variable tokens (e.g. `bg-[var(--surface-card)]`, `text-[var(--text-primary)]`). Mockup uses `bg-surface-container-lowest` Tailwind tokens that DON'T exist in this project — translate to the project's CSS-variable tokens.
- Commit messages: Conventional Commits (`feat(owner-dashboard): ...`, `test(owner-dashboard): ...`, `chore(owner-dashboard): ...`). Always include `Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>`.

---

## File Map (anticipated)

### Created

- `src/features/dashboard/schemas/owner-dashboard.schema.ts`
- `src/features/dashboard/repositories/owner-dashboard.repository.ts`
- `src/features/dashboard/services/owner-dashboard.service.ts`
- `src/features/dashboard/queries/owner.ts`
- `src/features/dashboard/components/owner/OwnerKpiCards.tsx`
- `src/features/dashboard/components/owner/OwnerActivePropertiesPanel.tsx`
- `src/features/dashboard/components/owner/OwnerRecentRequestsPanel.tsx`
- `src/features/dashboard/components/owner/skeletons.tsx`
- `src/features/dashboard/tests/owner-dashboard.service.test.ts`
- `src/features/dashboard/tests/owner-dashboard.repository.test.ts`
- `src/features/dashboard/tests/owner-dashboard-components.test.tsx`
- `src/shared/components/dashboard/DashboardHeader.tsx`
- `src/shared/components/ui/KpiCard.tsx`
- `src/app/(dashboard)/owner/dashboard/page.tsx`
- `src/app/(dashboard)/owner/work-orders/page.tsx` (stub)
- `src/app/(dashboard)/owner/financials/page.tsx` (stub)
- `src/app/(dashboard)/owner/service-network/page.tsx` (stub)
- `src/app/(dashboard)/owner/reports/page.tsx` (stub)
- `tests/e2e/owner-dashboard.spec.ts`

### Modified

- `src/app/(dashboard)/owner/page.tsx` → reduced to `redirect('/owner/dashboard')`
- `src/components/layout/Sidebar.tsx` → update `NAV_ITEMS.OWNER`

### Deleted (Task 16, after grep verification)

- `src/features/dashboard/components/FinancialSummaryCards.tsx`
- `src/features/dashboard/components/PortfolioOverview.tsx`
- `src/features/dashboard/components/ServiceRequestsTable.tsx`
- `src/features/dashboard/actions.ts`

---

## Task 1: Schemas & Types

**Files:**
- Create: `src/features/dashboard/schemas/owner-dashboard.schema.ts`

- [ ] **Step 1: Write the type module**

```ts
// src/features/dashboard/schemas/owner-dashboard.schema.ts
import { z } from 'zod';
import Decimal from 'decimal.js';
import { PropertyType } from '@prisma/client';

export type OwnerVisibleAgreementStatus =
  | 'PENDING_ASSIGNMENT'
  | 'PENDING_ACCEPTANCE'
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'DISPUTED'
  | 'CANCELLED';

export type StatusVariant = 'urgent' | 'progress' | 'scheduled' | 'complete' | 'neutral';
export type TrendDirection = 'up' | 'down' | 'flat';

export interface OwnerKpis {
  totalSpentYtd: Decimal;
  totalSpentYtdFormatted: string;
  ytdTrendPct: Decimal | null;
  ytdTrendDirection: TrendDirection | null;
  activeWorkOrders: number;
  pendingAcceptance: number;
  maintenanceRoiPct: Decimal;
  maintenanceRoiFormatted: string;
  asOf: Date;
}

export interface OwnerPropertyCard {
  id: string;
  name: string;
  type: PropertyType;
  addressLine: string;
  unitCount: number;
  occupancyPct: number;
  imageUrl: string | null;
  isActive: boolean;
  hrefDetail: string;
}

export interface OwnerRecentRequest {
  agreementId: string;
  serviceTypeName: string;
  propertyName: string;
  status: OwnerVisibleAgreementStatus;
  statusVariant: StatusVariant;
  ageHuman: string;
  hrefDetail: string;
}

// Runtime Zod schemas — used at service→UI boundary to defend against
// repository return-shape drift. Decimal validated as string then rehydrated.
const decimalSchema = z.instanceof(Decimal);

export const ownerKpisSchema = z.object({
  totalSpentYtd: decimalSchema,
  totalSpentYtdFormatted: z.string(),
  ytdTrendPct: decimalSchema.nullable(),
  ytdTrendDirection: z.enum(['up', 'down', 'flat']).nullable(),
  activeWorkOrders: z.number().int().nonnegative(),
  pendingAcceptance: z.number().int().nonnegative(),
  maintenanceRoiPct: decimalSchema,
  maintenanceRoiFormatted: z.string(),
  asOf: z.date(),
});

export const ownerPropertyCardSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.nativeEnum(PropertyType),
  addressLine: z.string(),
  unitCount: z.number().int().nonnegative(),
  occupancyPct: z.number().min(0).max(100),
  imageUrl: z.string().nullable(),
  isActive: z.boolean(),
  hrefDetail: z.string(),
});

export const ownerRecentRequestSchema = z.object({
  agreementId: z.string(),
  serviceTypeName: z.string(),
  propertyName: z.string(),
  status: z.enum([
    'PENDING_ASSIGNMENT', 'PENDING_ACCEPTANCE', 'SCHEDULED',
    'IN_PROGRESS', 'COMPLETED', 'DISPUTED', 'CANCELLED',
  ]),
  statusVariant: z.enum(['urgent', 'progress', 'scheduled', 'complete', 'neutral']),
  ageHuman: z.string(),
  hrefDetail: z.string(),
});
```

- [ ] **Step 2: Commit**

```bash
git add src/features/dashboard/schemas/owner-dashboard.schema.ts
git commit -m "feat(owner-dashboard): add types and zod schemas for owner dashboard payloads

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 2: Repository — Owner-Scoped Reads

**Files:**
- Create: `src/features/dashboard/repositories/owner-dashboard.repository.ts`

The repository returns raw shapes (no formatting). Every `select` clause is explicit — no `include` of provider relations. This is where privacy isolation is enforced.

- [ ] **Step 1: Create the repository module**

```ts
// src/features/dashboard/repositories/owner-dashboard.repository.ts
import { prisma } from '@/core/database/client';
import {
  AgreementStatus, AssignmentStatus, InvoiceStatus, PropertyType,
} from '@prisma/client';
import type { Prisma } from '@prisma/client';

export interface PaidInvoiceRow {
  amount: Prisma.Decimal;
  paidAt: Date;
}

export interface ActivePropertyRow {
  id: string;
  name: string;
  type: PropertyType;
  zone: string;
  imageUrls: string[];
  unitCount: number;
  unitsOccupied: number;
  unitsTotal: number;
  updatedAt: Date;
}

export interface RecentRequestRow {
  agreementId: string;
  serviceTypeName: string;
  propertyName: string;
  agreementStatus: AgreementStatus;
  assignmentStatus: AssignmentStatus | null;
  createdAt: Date;
}

/**
 * Resolve the OwnerProfile id for a session userId.
 * Returns null when the user has no OwnerProfile (treated as zero-state).
 */
export async function findOwnerProfileIdByUserId(userId: string): Promise<string | null> {
  const profile = await prisma.ownerProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  return profile?.id ?? null;
}

/** Sum of paid invoices for owner, within [start, end). */
export async function findPaidInvoicesInRange(
  ownerUserId: string,
  start: Date,
  end: Date,
): Promise<PaidInvoiceRow[]> {
  return prisma.invoice.findMany({
    where: {
      status: InvoiceStatus.PAID,
      paidAt: { gte: start, lt: end },
      agreement: { ownerId: ownerUserId },
    },
    select: { amount: true, paidAt: true },
  });
}

/** Count assignments by status set for owner. */
export async function countAssignmentsByStatus(
  ownerUserId: string,
  statuses: AssignmentStatus[],
): Promise<number> {
  return prisma.assignment.count({
    where: {
      status: { in: statuses },
      agreement: { ownerId: ownerUserId },
    },
  });
}

/** Counts used for ROI: completed agreements / paid agreements. */
export async function countAgreementsByStatus(
  ownerUserId: string,
  statuses: AgreementStatus[],
): Promise<number> {
  return prisma.agreement.count({
    where: {
      ownerId: ownerUserId,
      status: { in: statuses },
    },
  });
}

/**
 * Active properties for the owner, most-recently-updated first.
 * Does NOT select `encryptedAddress` (would be auto-decrypted by Prisma extension).
 * Uses `zone` (plaintext) for the card address line.
 */
export async function findActiveProperties(
  ownerProfileId: string,
  limit: number,
): Promise<ActivePropertyRow[]> {
  const properties = await prisma.property.findMany({
    where: { ownerId: ownerProfileId, status: 'ACTIVE' },
    orderBy: { updatedAt: 'desc' },
    take: limit,
    select: {
      id: true,
      name: true,
      type: true,
      zone: true,
      imageUrls: true,
      unitCount: true,
      updatedAt: true,
      units: { select: { occupantCount: true } },
    },
  });

  return properties.map((p) => {
    const unitsTotal = p.units.length;
    const unitsOccupied = p.units.filter((u) => u.occupantCount > 0).length;
    return {
      id: p.id,
      name: p.name,
      type: p.type,
      zone: p.zone,
      imageUrls: p.imageUrls,
      unitCount: p.unitCount,
      unitsOccupied,
      unitsTotal,
      updatedAt: p.updatedAt,
    };
  });
}

/**
 * Recent agreements for the owner, most-recently-created first.
 * Excludes provider identity at the select clause.
 */
export async function findRecentRequests(
  ownerUserId: string,
  limit: number,
): Promise<RecentRequestRow[]> {
  const rows = await prisma.agreement.findMany({
    where: { ownerId: ownerUserId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true,
      status: true,
      createdAt: true,
      property: { select: { name: true } },
      serviceType: { select: { name: true } },
      assignment: { select: { status: true } },
    },
  });

  return rows.map((r) => ({
    agreementId: r.id,
    serviceTypeName: r.serviceType.name,
    propertyName: r.property.name,
    agreementStatus: r.status,
    assignmentStatus: r.assignment?.status ?? null,
    createdAt: r.createdAt,
  }));
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/dashboard/repositories/owner-dashboard.repository.ts
git commit -m "feat(owner-dashboard): add owner-scoped dashboard repository

Explicit select clauses; no provider identity in returns.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 3: Repository Tests (mocked Prisma)

**Files:**
- Test: `src/features/dashboard/tests/owner-dashboard.repository.test.ts`

The repository module is thin — most tests assert (a) correct `where` clauses (owner scoping) and (b) that provider keys never appear in returned shapes.

- [ ] **Step 1: Write the test file**

```ts
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
  findActiveProperties,
  findRecentRequests,
} from '@/features/dashboard/repositories/owner-dashboard.repository';
import { AssignmentStatus } from '@prisma/client';

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

describe('findActiveProperties', () => {
  it('does NOT select encryptedAddress', async () => {
    (prisma.property.findMany as any).mockResolvedValue([]);
    await findActiveProperties(ownerProfileId, 4);
    const call = (prisma.property.findMany as any).mock.calls[0][0];
    expect(call.select).not.toHaveProperty('encryptedAddress');
    expect(call.select).toHaveProperty('zone', true);
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
  });
});
```

- [ ] **Step 2: Run tests to verify they pass**

```bash
pnpm test:run -- src/features/dashboard/tests/owner-dashboard.repository.test.ts
```

Expected: all tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/features/dashboard/tests/owner-dashboard.repository.test.ts
git commit -m "test(owner-dashboard): repository scoping and privacy isolation

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 4: Service Layer — Formatting, Mapping, Privacy

**Files:**
- Create: `src/features/dashboard/services/owner-dashboard.service.ts`

- [ ] **Step 1: Create service module**

```ts
// src/features/dashboard/services/owner-dashboard.service.ts
import Decimal from 'decimal.js';
import { AgreementStatus, AssignmentStatus, InvoiceStatus, type Prisma } from '@prisma/client';
import {
  findOwnerProfileIdByUserId,
  findPaidInvoicesInRange,
  countAssignmentsByStatus,
  countAgreementsByStatus,
  findActiveProperties,
  findRecentRequests,
} from '@/features/dashboard/repositories/owner-dashboard.repository';
import type {
  OwnerKpis,
  OwnerPropertyCard,
  OwnerRecentRequest,
  OwnerVisibleAgreementStatus,
  StatusVariant,
  TrendDirection,
} from '@/features/dashboard/schemas/owner-dashboard.schema';

// ─── Status mapping ─────────────────────────────────────────────────

/**
 * Collapse the internal Agreement+Assignment status pair into a single
 * owner-visible status. Assignment status takes precedence when present,
 * since it reflects the actual fulfillment state the owner cares about.
 */
export function mapToOwnerStatus(
  agreementStatus: AgreementStatus,
  assignmentStatus: AssignmentStatus | null,
): OwnerVisibleAgreementStatus {
  if (assignmentStatus) {
    switch (assignmentStatus) {
      case AssignmentStatus.PENDING_ACCEPTANCE: return 'PENDING_ACCEPTANCE';
      case AssignmentStatus.ACCEPTED:
      case AssignmentStatus.SCHEDULED: return 'SCHEDULED';
      case AssignmentStatus.IN_PROGRESS: return 'IN_PROGRESS';
      case AssignmentStatus.COMPLETED:
      case AssignmentStatus.VERIFIED: return 'COMPLETED';
      case AssignmentStatus.DISPUTED: return 'DISPUTED';
      case AssignmentStatus.EXPIRED:
      case AssignmentStatus.REJECTED:
      case AssignmentStatus.AUTO_REASSIGNED:
      case AssignmentStatus.NO_PROVIDER_AVAILABLE:
        return 'PENDING_ASSIGNMENT';
      case AssignmentStatus.CANCELLED_BY_OWNER:
      case AssignmentStatus.CANCELLED_NO_SHOW:
        return 'CANCELLED';
    }
  }
  switch (agreementStatus) {
    case AgreementStatus.QUOTED:
    case AgreementStatus.PENDING_ASSIGNMENT: return 'PENDING_ASSIGNMENT';
    case AgreementStatus.ACTIVE: return 'SCHEDULED';
    case AgreementStatus.SUSPENDED: return 'PENDING_ASSIGNMENT';
    case AgreementStatus.CANCELLED: return 'CANCELLED';
    case AgreementStatus.COMPLETED: return 'COMPLETED';
  }
}

export function statusVariant(s: OwnerVisibleAgreementStatus): StatusVariant {
  switch (s) {
    case 'DISPUTED': return 'urgent';
    case 'IN_PROGRESS': return 'progress';
    case 'SCHEDULED':
    case 'PENDING_ACCEPTANCE':
    case 'PENDING_ASSIGNMENT': return 'scheduled';
    case 'COMPLETED': return 'complete';
    case 'CANCELLED': return 'neutral';
  }
}

// ─── Currency formatting ────────────────────────────────────────────

export function formatTzs(amount: Decimal): string {
  const fixed = amount.toFixed(2);
  const [intPart, decPart] = fixed.split('.');
  const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `TZS ${withCommas}.${decPart}`;
}

export function formatPct(pct: Decimal): string {
  if (pct.isNaN() || !pct.isFinite()) return '—';
  return `${pct.toFixed(1)}%`;
}

// ─── Date / age formatting ──────────────────────────────────────────

export function formatAge(createdAt: Date, now: Date): string {
  const diffMs = now.getTime() - createdAt.getTime();
  const diffH = diffMs / (1000 * 60 * 60);
  if (diffH < 1) return 'Just now';
  if (diffH < 24) return `${Math.floor(diffH)}h ago`;
  return createdAt.toLocaleString('en-GB', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false,
  });
}

// ─── Trend math ─────────────────────────────────────────────────────

export function computeTrend(current: Decimal, prior: Decimal): {
  pct: Decimal | null;
  direction: TrendDirection | null;
} {
  if (prior.isZero()) return { pct: null, direction: null };
  const pct = current.minus(prior).div(prior).mul(100);
  const direction: TrendDirection = pct.isZero() ? 'flat' : pct.isPositive() ? 'up' : 'down';
  return { pct: pct.abs(), direction };
}

// ─── KPI assembler ──────────────────────────────────────────────────

const ACTIVE_ASSIGNMENT_STATUSES = [
  AssignmentStatus.ACCEPTED,
  AssignmentStatus.SCHEDULED,
  AssignmentStatus.IN_PROGRESS,
  AssignmentStatus.COMPLETED,
] as const;

export async function buildOwnerKpis(
  ownerUserId: string,
  now: Date = new Date(),
): Promise<OwnerKpis> {
  const yearStart = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
  const priorYearStart = new Date(Date.UTC(now.getUTCFullYear() - 1, 0, 1));
  const priorYearSameDay = new Date(Date.UTC(
    now.getUTCFullYear() - 1, now.getUTCMonth(), now.getUTCDate(),
    now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds(),
  ));

  const [currentPaid, priorPaid, activeWorkOrders, pendingAcceptance, completedAg, paidAg] =
    await Promise.all([
      findPaidInvoicesInRange(ownerUserId, yearStart, now),
      findPaidInvoicesInRange(ownerUserId, priorYearStart, priorYearSameDay),
      countAssignmentsByStatus(ownerUserId, [...ACTIVE_ASSIGNMENT_STATUSES]),
      countAssignmentsByStatus(ownerUserId, [AssignmentStatus.PENDING_ACCEPTANCE]),
      countAgreementsByStatus(ownerUserId, [AgreementStatus.COMPLETED]),
      // "paid agreements" = agreements with a PAID invoice = agreements not QUOTED/CANCELLED
      countAgreementsByStatus(ownerUserId, [
        AgreementStatus.ACTIVE, AgreementStatus.COMPLETED, AgreementStatus.SUSPENDED,
      ]),
    ]);

  const sum = (rows: { amount: Prisma.Decimal }[]) =>
    rows.reduce((acc, r) => acc.plus(new Decimal(r.amount.toString())), new Decimal(0));

  const totalSpentYtd = sum(currentPaid);
  const priorTotal = sum(priorPaid);
  const { pct: ytdTrendPct, direction: ytdTrendDirection } = computeTrend(totalSpentYtd, priorTotal);

  const maintenanceRoiPct = paidAg === 0
    ? new Decimal(0)
    : new Decimal(completedAg).div(paidAg).mul(100);

  return {
    totalSpentYtd,
    totalSpentYtdFormatted: formatTzs(totalSpentYtd),
    ytdTrendPct,
    ytdTrendDirection,
    activeWorkOrders,
    pendingAcceptance,
    maintenanceRoiPct,
    maintenanceRoiFormatted: paidAg === 0 ? '—' : formatPct(maintenanceRoiPct),
    asOf: now,
  };
}

// ─── Property card assembler ────────────────────────────────────────

export async function buildActivePropertyCards(
  ownerUserId: string,
  limit: number = 4,
): Promise<OwnerPropertyCard[]> {
  const ownerProfileId = await findOwnerProfileIdByUserId(ownerUserId);
  if (!ownerProfileId) return [];

  const rows = await findActiveProperties(ownerProfileId, limit);
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    type: r.type,
    addressLine: r.zone || 'Address not set',
    unitCount: r.unitCount,
    occupancyPct: r.unitsTotal === 0
      ? 0
      : Math.round((r.unitsOccupied / r.unitsTotal) * 100),
    imageUrl: r.imageUrls[0] ?? null,
    isActive: true,
    hrefDetail: `/owner/properties/${r.id}`,
  }));
}

// ─── Recent requests assembler ──────────────────────────────────────

export async function buildRecentRequests(
  ownerUserId: string,
  limit: number = 5,
  now: Date = new Date(),
): Promise<OwnerRecentRequest[]> {
  const rows = await findRecentRequests(ownerUserId, limit);
  return rows.map((r) => {
    const status = mapToOwnerStatus(r.agreementStatus, r.assignmentStatus);
    return {
      agreementId: r.agreementId,
      serviceTypeName: r.serviceTypeName,
      propertyName: r.propertyName,
      status,
      statusVariant: statusVariant(status),
      ageHuman: formatAge(r.createdAt, now),
      hrefDetail: `/owner/work-orders/${r.agreementId}`,
    };
  });
}

// Exported for unit tests
export const __forTest = { ACTIVE_ASSIGNMENT_STATUSES };
```

- [ ] **Step 2: Commit**

```bash
git add src/features/dashboard/services/owner-dashboard.service.ts
git commit -m "feat(owner-dashboard): service layer for KPI, properties, requests

Includes status mapping, TZS formatting, age formatting, YTD trend math.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 5: Service Tests

**Files:**
- Test: `src/features/dashboard/tests/owner-dashboard.service.test.ts`

- [ ] **Step 1: Write the test file (pure-function tests; assembler tests with mocked repo)**

```ts
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
```

- [ ] **Step 2: Run tests**

```bash
pnpm test:run -- src/features/dashboard/tests/owner-dashboard.service.test.ts
```

Expected: all tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/features/dashboard/tests/owner-dashboard.service.test.ts
git commit -m "test(owner-dashboard): service layer formatting, mapping, assembly

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 6: Public Queries Facade

**Files:**
- Create: `src/features/dashboard/queries/owner.ts`

Thin module re-exporting the three RSC-facing queries. Components import only from here. Adds the `'use server'` directive so they can be called from RSCs without leaking Prisma to the client bundle.

- [ ] **Step 1: Create the module**

```ts
// src/features/dashboard/queries/owner.ts
import 'server-only';
import {
  buildOwnerKpis,
  buildActivePropertyCards,
  buildRecentRequests,
} from '@/features/dashboard/services/owner-dashboard.service';
import type {
  OwnerKpis, OwnerPropertyCard, OwnerRecentRequest,
} from '@/features/dashboard/schemas/owner-dashboard.schema';

export async function getOwnerKpis(ownerUserId: string): Promise<OwnerKpis> {
  return buildOwnerKpis(ownerUserId);
}

export async function getOwnerActiveProperties(
  ownerUserId: string, limit: number = 4,
): Promise<OwnerPropertyCard[]> {
  return buildActivePropertyCards(ownerUserId, limit);
}

export async function getOwnerRecentRequests(
  ownerUserId: string, limit: number = 5,
): Promise<OwnerRecentRequest[]> {
  return buildRecentRequests(ownerUserId, limit);
}
```

- [ ] **Step 2: Install `server-only` if missing**

Check `package.json`. If `server-only` is not listed under `dependencies`, install it.

Detect which package manager the project uses:

```bash
ls pnpm-lock.yaml package-lock.json 2>/dev/null
```

- If `pnpm-lock.yaml` exists → `pnpm add server-only`
- If `package-lock.json` exists → `npm install server-only`
- Both exist → use `pnpm` (project standard per CLAUDE.md)

- [ ] **Step 3: Commit**

```bash
git add src/features/dashboard/queries/owner.ts package.json pnpm-lock.yaml
git commit -m "feat(owner-dashboard): RSC-facing queries facade with server-only guard

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 7: Shared UI — `DashboardHeader`

**Files:**
- Create: `src/shared/components/dashboard/DashboardHeader.tsx`

- [ ] **Step 1: Create the component**

```tsx
// src/shared/components/dashboard/DashboardHeader.tsx
interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  asOf?: Date;
}

function formatAsOf(d: Date): string {
  return d.toLocaleString('en-GB', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

export function DashboardHeader({ title, subtitle, asOf }: DashboardHeaderProps) {
  return (
    <div className="mb-8 flex justify-between items-end">
      <div>
        <h1 className="text-h1 font-semibold text-[var(--text-primary)]">{title}</h1>
        {subtitle && (
          <p className="text-body-sm text-[var(--text-secondary)] mt-1">{subtitle}</p>
        )}
      </div>
      {asOf && (
        <div className="text-right">
          <span className="text-body-sm text-[var(--text-muted)]">Data as of</span>
          <p className="text-label font-semibold text-[var(--text-primary)]">{formatAsOf(asOf)}</p>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/shared/components/dashboard/DashboardHeader.tsx
git commit -m "feat(shared): dashboard header with title/subtitle/asOf timestamp

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 8: Shared UI — `KpiCard`

**Files:**
- Create: `src/shared/components/ui/KpiCard.tsx`

- [ ] **Step 1: Create the component**

```tsx
// src/shared/components/ui/KpiCard.tsx
import { type LucideIcon, ArrowUp, ArrowDown, Minus, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/cn';

interface KpiCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  trend?: {
    direction: 'up' | 'down' | 'flat';
    pctFormatted: string;
    comparisonLabel: string;
  } | null;
  subtext?: { icon?: LucideIcon; text: string };
}

export function KpiCard({ label, value, icon: Icon, trend, subtext }: KpiCardProps) {
  return (
    <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <span className="text-label uppercase tracking-wider text-[var(--text-muted)]">{label}</span>
        <Icon size={18} className="text-[var(--text-muted)]" aria-hidden />
      </div>
      <div className="mt-auto">
        <span className="text-h1 font-semibold tabular-nums text-[var(--text-primary)]">{value}</span>
        {trend && (
          <div
            className={cn(
              'flex items-center gap-1 mt-1 text-body-sm',
              trend.direction === 'up' && 'text-state-success',
              trend.direction === 'down' && 'text-state-error',
              trend.direction === 'flat' && 'text-[var(--text-muted)]',
            )}
          >
            {trend.direction === 'up' && <ArrowUp size={14} />}
            {trend.direction === 'down' && <ArrowDown size={14} />}
            {trend.direction === 'flat' && <Minus size={14} />}
            <span>{trend.pctFormatted} {trend.comparisonLabel}</span>
          </div>
        )}
        {subtext && (
          <div className="flex items-center gap-1 mt-1 text-body-sm text-[var(--text-secondary)]">
            {subtext.icon && <subtext.icon size={14} />}
            <span>{subtext.text}</span>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/shared/components/ui/KpiCard.tsx
git commit -m "feat(shared): KpiCard bento-style card with optional trend and subtext

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 9: Skeleton Components

**Files:**
- Create: `src/features/dashboard/components/owner/skeletons.tsx`

- [ ] **Step 1: Create the file**

```tsx
// src/features/dashboard/components/owner/skeletons.tsx
export function KpiCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 h-[120px] animate-pulse"
        >
          <div className="h-3 w-24 bg-[var(--border-subtle)] rounded mb-3" />
          <div className="h-7 w-32 bg-[var(--border-subtle)] rounded mt-6" />
        </div>
      ))}
    </div>
  );
}

export function PropertiesPanelSkeleton() {
  return (
    <div>
      <div className="h-5 w-40 bg-[var(--border-subtle)] rounded mb-4 animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] h-[200px] animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}

export function RequestsPanelSkeleton() {
  return (
    <div>
      <div className="h-5 w-32 bg-[var(--border-subtle)] rounded mb-4 animate-pulse" />
      <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)]">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="p-4 border-b border-[var(--border-subtle)] last:border-b-0 h-[80px] animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/dashboard/components/owner/skeletons.tsx
git commit -m "feat(owner-dashboard): skeleton placeholders for suspense fallbacks

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 10: `OwnerKpiCards` Component

**Files:**
- Create: `src/features/dashboard/components/owner/OwnerKpiCards.tsx`

- [ ] **Step 1: Create the component**

```tsx
// src/features/dashboard/components/owner/OwnerKpiCards.tsx
import { DollarSign, Wrench, TrendingUp, CheckCircle2 } from 'lucide-react';
import { KpiCard } from '@/shared/components/ui/KpiCard';
import { getOwnerKpis } from '@/features/dashboard/queries/owner';

interface Props {
  ownerUserId: string;
}

export async function OwnerKpiCards({ ownerUserId }: Props) {
  const kpis = await getOwnerKpis(ownerUserId);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <KpiCard
        label="Total Spent (YTD)"
        value={kpis.totalSpentYtdFormatted}
        icon={DollarSign}
        trend={
          kpis.ytdTrendDirection && kpis.ytdTrendPct
            ? {
                direction: kpis.ytdTrendDirection,
                pctFormatted: `${kpis.ytdTrendPct.toFixed(1)}%`,
                comparisonLabel: 'vs last year',
              }
            : null
        }
      />
      <KpiCard
        label="Active Work Orders"
        value={String(kpis.activeWorkOrders)}
        icon={Wrench}
        subtext={{ text: `${kpis.pendingAcceptance} Pending Acceptance` }}
      />
      <KpiCard
        label="Maintenance ROI"
        value={kpis.maintenanceRoiFormatted}
        icon={TrendingUp}
        subtext={{ icon: CheckCircle2, text: 'Of agreements completed' }}
      />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/dashboard/components/owner/OwnerKpiCards.tsx
git commit -m "feat(owner-dashboard): KPI cards server component

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 11: `OwnerActivePropertiesPanel` Component

**Files:**
- Create: `src/features/dashboard/components/owner/OwnerActivePropertiesPanel.tsx`

- [ ] **Step 1: Create the component**

```tsx
// src/features/dashboard/components/owner/OwnerActivePropertiesPanel.tsx
import Image from 'next/image';
import Link from 'next/link';
import { getOwnerActiveProperties } from '@/features/dashboard/queries/owner';
import type { OwnerPropertyCard } from '@/features/dashboard/schemas/owner-dashboard.schema';

interface Props {
  ownerUserId: string;
  limit?: number;
}

function PropertyTile({ p }: { p: OwnerPropertyCard }) {
  return (
    <Link
      href={p.hrefDetail}
      className="block rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] overflow-hidden hover:border-[var(--brand-gold)] transition-colors"
    >
      <div className="relative h-32 w-full bg-[var(--border-subtle)] overflow-hidden">
        {p.imageUrl ? (
          <Image src={p.imageUrl} alt={p.name} fill className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-[var(--text-muted)]">
            No image
          </div>
        )}
        {p.isActive && (
          <span className="absolute top-2 right-2 bg-[var(--state-success)]/10 text-[var(--state-success)] text-[10px] font-medium uppercase px-2 py-1 rounded">
            Active
          </span>
        )}
      </div>
      <div className="p-4">
        <h4 className="text-[16px] font-semibold text-[var(--text-primary)] mb-1">{p.name}</h4>
        <p className="text-body-sm text-[var(--text-secondary)] mb-3">{p.addressLine}</p>
        <div className="grid grid-cols-2 gap-2 border-t border-[var(--border-subtle)] pt-3">
          <div>
            <span className="block text-[10px] uppercase text-[var(--text-muted)]">Occupancy</span>
            <span className="text-body-sm font-semibold text-[var(--text-primary)]">{p.occupancyPct}%</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase text-[var(--text-muted)]">Units</span>
            <span className="text-body-sm font-semibold text-[var(--text-primary)]">{p.unitCount} Total</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export async function OwnerActivePropertiesPanel({ ownerUserId, limit = 4 }: Props) {
  const properties = await getOwnerActiveProperties(ownerUserId, limit);

  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-h2 font-semibold text-[var(--text-primary)]">Active Properties</h3>
        <Link href="/owner/properties" className="text-label text-[var(--brand-gold)] hover:underline">
          View All
        </Link>
      </div>
      {properties.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[var(--border-subtle)] bg-[var(--surface-card)] p-8 text-center">
          <p className="text-body-sm text-[var(--text-muted)] mb-3">No active properties yet.</p>
          <Link
            href="/owner/properties/new"
            className="inline-block rounded bg-[var(--brand-gold)] px-4 py-2 text-sm font-medium text-[var(--brand-primary)]"
          >
            Add your first property
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {properties.map((p) => <PropertyTile key={p.id} p={p} />)}
        </div>
      )}
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/dashboard/components/owner/OwnerActivePropertiesPanel.tsx
git commit -m "feat(owner-dashboard): active properties panel with empty-state CTA

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 12: `OwnerRecentRequestsPanel` Component

**Files:**
- Create: `src/features/dashboard/components/owner/OwnerRecentRequestsPanel.tsx`

- [ ] **Step 1: Create the component**

```tsx
// src/features/dashboard/components/owner/OwnerRecentRequestsPanel.tsx
import Link from 'next/link';
import { Clock, User, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/cn';
import { getOwnerRecentRequests } from '@/features/dashboard/queries/owner';
import type {
  OwnerRecentRequest, StatusVariant,
} from '@/features/dashboard/schemas/owner-dashboard.schema';

interface Props {
  ownerUserId: string;
  limit?: number;
}

const STATUS_BADGE_CLASS: Record<StatusVariant, string> = {
  urgent:    'bg-[var(--state-error)]/10 text-[var(--state-error)]',
  progress:  'bg-[var(--state-info)]/10 text-[var(--state-info)]',
  scheduled: 'bg-[var(--text-muted)]/10 text-[var(--text-muted)]',
  complete:  'bg-[var(--state-success)]/10 text-[var(--state-success)]',
  neutral:   'bg-[var(--border-subtle)] text-[var(--text-muted)]',
};

const STATUS_LABEL: Record<OwnerRecentRequest['status'], string> = {
  PENDING_ASSIGNMENT: 'Pending',
  PENDING_ACCEPTANCE: 'Pending Accept',
  SCHEDULED:          'Scheduled',
  IN_PROGRESS:        'In Progress',
  COMPLETED:          'Completed',
  DISPUTED:           'Disputed',
  CANCELLED:          'Cancelled',
};

function RequestItem({ r }: { r: OwnerRecentRequest }) {
  return (
    <li className="p-4 hover:bg-[var(--surface-overlay)] transition-colors">
      <Link href={r.hrefDetail} className="block">
        <div className="flex justify-between items-start mb-2">
          <span className="text-sm font-medium text-[var(--text-primary)]">{r.serviceTypeName}</span>
          <span
            className={cn(
              'text-[10px] font-bold uppercase px-2 py-1 rounded',
              STATUS_BADGE_CLASS[r.statusVariant],
            )}
          >
            {STATUS_LABEL[r.status]}
          </span>
        </div>
        <p className="text-body-sm text-[var(--text-secondary)] mb-2">{r.propertyName}</p>
        <div className="flex items-center gap-2 text-[12px] text-[var(--text-muted)] tabular-nums">
          <Clock size={12} />
          <span>{r.ageHuman}</span>
        </div>
      </Link>
    </li>
  );
}

export async function OwnerRecentRequestsPanel({ ownerUserId, limit = 5 }: Props) {
  const requests = await getOwnerRecentRequests(ownerUserId, limit);

  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-h2 font-semibold text-[var(--text-primary)]">Recent Requests</h3>
      </div>
      {requests.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[var(--border-subtle)] bg-[var(--surface-card)] p-8 text-center">
          <p className="text-body-sm text-[var(--text-muted)]">No recent requests.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)]">
          <ul className="divide-y divide-[var(--border-subtle)]">
            {requests.map((r) => <RequestItem key={r.agreementId} r={r} />)}
          </ul>
          <div className="p-3 border-t border-[var(--border-subtle)] text-center">
            <Link href="/owner/work-orders" className="text-label text-[var(--brand-gold)] hover:underline">
              View All Activity
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/dashboard/components/owner/OwnerRecentRequestsPanel.tsx
git commit -m "feat(owner-dashboard): recent requests panel with empty state

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 13: Component-Level Tests

**Files:**
- Test: `src/features/dashboard/tests/owner-dashboard-components.test.tsx`

Test only synchronous render branches: empty states + presence of no-provider data. Async RSCs that call DB are exercised via the service tests (Task 5) and E2E (Task 18). Vitest cannot await `async function Component` directly in the React Testing Library renderer — so we test by injecting fake props into wrapper sub-components.

Refactor: extract the empty-state branch as a named export from each panel so it can be rendered synchronously in tests.

- [ ] **Step 1: Add named sub-exports to the two panels**

Edit `src/features/dashboard/components/owner/OwnerActivePropertiesPanel.tsx` — add at the top of the file before the existing exports:

```tsx
export function ActivePropertiesEmptyState() {
  return (
    <div className="rounded-lg border border-dashed border-[var(--border-subtle)] bg-[var(--surface-card)] p-8 text-center">
      <p className="text-body-sm text-[var(--text-muted)] mb-3">No active properties yet.</p>
      <a
        href="/owner/properties/new"
        className="inline-block rounded bg-[var(--brand-gold)] px-4 py-2 text-sm font-medium text-[var(--brand-primary)]"
      >
        Add your first property
      </a>
    </div>
  );
}
```

Then in the main panel body, replace the inline empty branch markup with `<ActivePropertiesEmptyState />`.

Edit `src/features/dashboard/components/owner/OwnerRecentRequestsPanel.tsx` — add:

```tsx
export function RecentRequestsEmptyState() {
  return (
    <div className="rounded-lg border border-dashed border-[var(--border-subtle)] bg-[var(--surface-card)] p-8 text-center">
      <p className="text-body-sm text-[var(--text-muted)]">No recent requests.</p>
    </div>
  );
}
```

Then in the main panel body, replace the inline empty branch markup with `<RecentRequestsEmptyState />`.

- [ ] **Step 2: Write the test file**

```tsx
// src/features/dashboard/tests/owner-dashboard-components.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { KpiCard } from '@/shared/components/ui/KpiCard';
import { DollarSign } from 'lucide-react';
import { ActivePropertiesEmptyState } from '@/features/dashboard/components/owner/OwnerActivePropertiesPanel';
import { RecentRequestsEmptyState } from '@/features/dashboard/components/owner/OwnerRecentRequestsPanel';
import { DashboardHeader } from '@/shared/components/dashboard/DashboardHeader';

describe('KpiCard', () => {
  it('renders label and value', () => {
    render(<KpiCard label="Total Spent" value="TZS 42,500.00" icon={DollarSign} />);
    expect(screen.getByText('Total Spent')).toBeInTheDocument();
    expect(screen.getByText('TZS 42,500.00')).toBeInTheDocument();
  });

  it('renders up trend with arrow', () => {
    render(
      <KpiCard
        label="Spend"
        value="TZS 100"
        icon={DollarSign}
        trend={{ direction: 'up', pctFormatted: '12.0%', comparisonLabel: 'vs last year' }}
      />,
    );
    expect(screen.getByText('12.0% vs last year')).toBeInTheDocument();
  });

  it('renders subtext when provided', () => {
    render(
      <KpiCard
        label="Active"
        value="24"
        icon={DollarSign}
        subtext={{ text: '8 Pending Acceptance' }}
      />,
    );
    expect(screen.getByText('8 Pending Acceptance')).toBeInTheDocument();
  });
});

describe('DashboardHeader', () => {
  it('renders title without subtitle/asOf', () => {
    render(<DashboardHeader title="Dashboard Overview" />);
    expect(screen.getByRole('heading', { name: 'Dashboard Overview' })).toBeInTheDocument();
  });

  it('renders asOf timestamp when provided', () => {
    render(<DashboardHeader title="X" asOf={new Date('2026-05-16T09:41:00Z')} />);
    expect(screen.getByText('Data as of')).toBeInTheDocument();
  });
});

describe('ActivePropertiesEmptyState', () => {
  it('renders CTA link to add property', () => {
    render(<ActivePropertiesEmptyState />);
    const link = screen.getByRole('link', { name: /add your first property/i });
    expect(link).toHaveAttribute('href', '/owner/properties/new');
  });
});

describe('RecentRequestsEmptyState', () => {
  it('renders empty message', () => {
    render(<RecentRequestsEmptyState />);
    expect(screen.getByText('No recent requests.')).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run tests**

```bash
pnpm test:run -- src/features/dashboard/tests/owner-dashboard-components.test.tsx
```

Expected: all tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/features/dashboard/components/owner/OwnerActivePropertiesPanel.tsx \
        src/features/dashboard/components/owner/OwnerRecentRequestsPanel.tsx \
        src/features/dashboard/tests/owner-dashboard-components.test.tsx
git commit -m "test(owner-dashboard): synchronous component tests for cards/headers/empty states

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 14: Page Route + Root Redirect

**Files:**
- Create: `src/app/(dashboard)/owner/dashboard/page.tsx`
- Modify: `src/app/(dashboard)/owner/page.tsx`

- [ ] **Step 1: Create the new dashboard route**

```tsx
// src/app/(dashboard)/owner/dashboard/page.tsx
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/core/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import RoleGuard from '@/components/RoleGuard';
import { DashboardHeader } from '@/shared/components/dashboard/DashboardHeader';
import { OwnerKpiCards } from '@/features/dashboard/components/owner/OwnerKpiCards';
import { OwnerActivePropertiesPanel } from '@/features/dashboard/components/owner/OwnerActivePropertiesPanel';
import { OwnerRecentRequestsPanel } from '@/features/dashboard/components/owner/OwnerRecentRequestsPanel';
import {
  KpiCardsSkeleton,
  PropertiesPanelSkeleton,
  RequestsPanelSkeleton,
} from '@/features/dashboard/components/owner/skeletons';

export const dynamic = 'force-dynamic';

export default async function OwnerDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  if (session.user.role !== 'OWNER') redirect('/login');

  const ownerUserId = session.user.id;
  const now = new Date();

  return (
    <RoleGuard allowedRoles={['OWNER']}>
      <DashboardShell role="OWNER" userName={session.user.name} pageTitle="Dashboard">
        <DashboardHeader
          title="Dashboard Overview"
          subtitle="High-level metrics across all active properties."
          asOf={now}
        />

        <Suspense fallback={<KpiCardsSkeleton />}>
          <OwnerKpiCards ownerUserId={ownerUserId} />
        </Suspense>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Suspense fallback={<PropertiesPanelSkeleton />}>
              <OwnerActivePropertiesPanel ownerUserId={ownerUserId} />
            </Suspense>
          </div>
          <div className="lg:col-span-1">
            <Suspense fallback={<RequestsPanelSkeleton />}>
              <OwnerRecentRequestsPanel ownerUserId={ownerUserId} />
            </Suspense>
          </div>
        </div>
      </DashboardShell>
    </RoleGuard>
  );
}
```

- [ ] **Step 2: Replace the old `/owner/page.tsx` with redirect**

```tsx
// src/app/(dashboard)/owner/page.tsx
import { redirect } from 'next/navigation';

export default function OwnerRootPage() {
  redirect('/owner/dashboard');
}
```

- [ ] **Step 3: Manual smoke test**

```bash
pnpm dev
```

Open `http://localhost:3000/owner` in browser. Sign in as a seeded OWNER user. Confirm:
- `/owner` redirects to `/owner/dashboard`.
- Page renders without errors.
- All three sections appear (may show skeletons briefly).
- No provider name text appears anywhere.

Stop the dev server (Ctrl+C).

- [ ] **Step 4: Commit**

```bash
git add src/app/(dashboard)/owner/dashboard/page.tsx \
        src/app/(dashboard)/owner/page.tsx
git commit -m "feat(owner-dashboard): new /owner/dashboard route with suspense; root redirects

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 15: Stub Pages for Sidebar Targets

**Files:**
- Create: `src/app/(dashboard)/owner/work-orders/page.tsx`
- Create: `src/app/(dashboard)/owner/financials/page.tsx`
- Create: `src/app/(dashboard)/owner/service-network/page.tsx`
- Create: `src/app/(dashboard)/owner/reports/page.tsx`

All four stubs are identical except for the title. They prevent 404s after the sidebar rewrite in Task 16.

- [ ] **Step 1: Create a shared stub helper**

Inline it (avoiding a new file): each stub renders its own page.

```tsx
// src/app/(dashboard)/owner/work-orders/page.tsx
import { redirect } from 'next/navigation';
import { auth } from '@/core/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import RoleGuard from '@/components/RoleGuard';

export const dynamic = 'force-dynamic';

export default async function OwnerWorkOrdersPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'OWNER') redirect('/login');
  return (
    <RoleGuard allowedRoles={['OWNER']}>
      <DashboardShell role="OWNER" userName={session.user.name} pageTitle="Work Orders">
        <div className="max-w-2xl mx-auto py-24 text-center">
          <h1 className="text-h1 font-semibold text-[var(--text-primary)] mb-3">Work Orders</h1>
          <p className="text-body-sm text-[var(--text-secondary)]">
            Coming soon. This page is under construction.
          </p>
        </div>
      </DashboardShell>
    </RoleGuard>
  );
}
```

- [ ] **Step 2: Repeat for `/financials/page.tsx`**

Same structure, change function name to `OwnerFinancialsPage`, `pageTitle="Financials"`, h1 text "Financials".

- [ ] **Step 3: Repeat for `/service-network/page.tsx`**

Same structure, change function name to `OwnerServiceNetworkPage`, `pageTitle="Service Network"`, h1 text "Service Network".

- [ ] **Step 4: Repeat for `/reports/page.tsx`**

Same structure, change function name to `OwnerReportsPage`, `pageTitle="Reports"`, h1 text "Reports".

- [ ] **Step 5: Commit**

```bash
git add src/app/(dashboard)/owner/work-orders/page.tsx \
        src/app/(dashboard)/owner/financials/page.tsx \
        src/app/(dashboard)/owner/service-network/page.tsx \
        src/app/(dashboard)/owner/reports/page.tsx
git commit -m "feat(owner): stub pages for work-orders, financials, service-network, reports

Placeholders to prevent 404s after sidebar rewrite. Real impls in later Core 5 specs.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 16: Sidebar Nav Rewrite

**Files:**
- Modify: `src/components/layout/Sidebar.tsx`

- [ ] **Step 1: Replace the OWNER nav block + add `Users` icon import**

In `src/components/layout/Sidebar.tsx`, find this import line:

```ts
import {
  LayoutDashboard,
  Home,
  ClipboardList,
  Wrench,
  BarChart3,
  FileText,
  PlusCircle,
  LifeBuoy,
  BookOpen,
} from 'lucide-react';
```

Replace with:

```ts
import {
  LayoutDashboard,
  Home,
  ClipboardList,
  Wrench,
  BarChart3,
  FileText,
  PlusCircle,
  LifeBuoy,
  BookOpen,
  Users,
} from 'lucide-react';
```

Then find the OWNER block in `NAV_ITEMS`:

```ts
OWNER: [
  { href: '/owner/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/owner/properties', label: 'Properties', icon: Home },
  { href: '/owner/services', label: 'Services', icon: Wrench },
  { href: '/owner/leases', label: 'Leases', icon: FileText },
  { href: '/owner/analytics', label: 'Analytics', icon: BarChart3 },
],
```

Replace with:

```ts
OWNER: [
  { href: '/owner/dashboard',       label: 'Dashboard',       icon: LayoutDashboard },
  { href: '/owner/properties',      label: 'Properties',      icon: Home },
  { href: '/owner/work-orders',     label: 'Work Orders',     icon: Wrench },
  { href: '/owner/financials',      label: 'Financials',      icon: BarChart3 },
  { href: '/owner/service-network', label: 'Service Network', icon: Users },
  { href: '/owner/reports',         label: 'Reports',         icon: FileText },
],
```

- [ ] **Step 2: Find and update the New Service Request CTA**

In the same file, find:

```tsx
<Link
  href="/owner/services/new"
  ...
>
  <PlusCircle size={16} />
  New Service Request
</Link>
```

Change `href` to `/owner/work-orders/new` (the future work-orders create flow). Stub does not implement this; clicking goes to the work-orders stub (which 404s on /new sub-path — acceptable for now since the link is harmless and the destination is for a future spec).

Actually — to avoid a 404 on the stub `/new` sub-path, change href to `/owner/work-orders` (top-level stub). Update the link text to remain "New Work Order" to match the sidebar mockup:

```tsx
<Link
  href="/owner/work-orders"
  ...
>
  <PlusCircle size={16} />
  New Work Order
</Link>
```

- [ ] **Step 3: Manual smoke test**

```bash
pnpm dev
```

Open `/owner/dashboard` as OWNER. Verify:
- Sidebar shows: Dashboard, Properties, Work Orders, Financials, Service Network, Reports.
- Click each link — all 6 load without 404.
- Active link state highlights `Dashboard` when on `/owner/dashboard`.

Stop the dev server.

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/Sidebar.tsx
git commit -m "feat(owner-dashboard): sidebar nav matches mockup (Work Orders/Financials/Service Network/Reports)

Removes Services/Leases/Analytics from nav; routes remain alive but delinked.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 17: Cleanup — Delete Replaced Components

**Files:**
- Delete: `src/features/dashboard/components/FinancialSummaryCards.tsx`
- Delete: `src/features/dashboard/components/PortfolioOverview.tsx`
- Delete: `src/features/dashboard/components/ServiceRequestsTable.tsx`
- Delete: `src/features/dashboard/actions.ts`

- [ ] **Step 1: Verify no other importers for each file**

```bash
# From repo root
grep -r "FinancialSummaryCards" "F:/OPSMP/PropertManagement/src" --include="*.ts" --include="*.tsx"
grep -r "PortfolioOverview" "F:/OPSMP/PropertManagement/src" --include="*.ts" --include="*.tsx"
grep -r "ServiceRequestsTable" "F:/OPSMP/PropertManagement/src" --include="*.ts" --include="*.tsx"
grep -r "features/dashboard/actions" "F:/OPSMP/PropertManagement/src" --include="*.ts" --include="*.tsx"
```

Expected: only the file's own declaration site appears. If any other importer is found, STOP and update that importer to use the new equivalents:
- `FinancialSummaryCards` → `OwnerKpiCards` (props: `ownerUserId`).
- `PortfolioOverview` → `DashboardHeader` (props: `title`, `subtitle`).
- `ServiceRequestsTable` → `OwnerRecentRequestsPanel` (props: `ownerUserId`).
- `features/dashboard/actions` (`getDashboardFinancials`, `getDashboardProperties`) → `features/dashboard/queries/owner` (`getOwnerKpis`, `getOwnerActiveProperties`).

- [ ] **Step 2: Delete the files**

Bash (Git Bash / WSL):

```bash
rm src/features/dashboard/components/FinancialSummaryCards.tsx
rm src/features/dashboard/components/PortfolioOverview.tsx
rm src/features/dashboard/components/ServiceRequestsTable.tsx
rm src/features/dashboard/actions.ts
```

PowerShell equivalent:

```powershell
Remove-Item src/features/dashboard/components/FinancialSummaryCards.tsx
Remove-Item src/features/dashboard/components/PortfolioOverview.tsx
Remove-Item src/features/dashboard/components/ServiceRequestsTable.tsx
Remove-Item src/features/dashboard/actions.ts
```

- [ ] **Step 3: Verify type-check passes**

```bash
pnpm tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add -u src/features/dashboard
git commit -m "chore(owner-dashboard): remove replaced FinancialSummaryCards, PortfolioOverview, ServiceRequestsTable, actions.ts

Superseded by OwnerKpiCards, DashboardHeader, OwnerRecentRequestsPanel, queries/owner.ts.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 18: E2E Test — Owner Dashboard Smoke

**Files:**
- Create: `tests/e2e/owner-dashboard.spec.ts`

Existing seed (`prisma/seed.ts`) creates OWNER user `juma@hamisi.co.tz` with password `password`. Test uses these credentials. If `pnpm db:seed` has not been run on the dev DB, run it before the E2E suite.

- [ ] **Step 1: Confirm seed has run**

```bash
pnpm db:seed
```

Expected: prints `✓ Admin user created` and similar owner/provider lines; exits 0. If it fails because the DB is not migrated, run `pnpm prisma migrate dev` first.

- [ ] **Step 2: Write the E2E test**

```ts
// tests/e2e/owner-dashboard.spec.ts
import { test, expect } from '@playwright/test';

const OWNER_EMAIL = 'juma@hamisi.co.tz';
const OWNER_PASSWORD = 'password';

test.describe('Owner Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', OWNER_EMAIL);
    await page.fill('input[name="password"]', OWNER_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/owner/);
  });

  test('renders dashboard page and core sections', async ({ page }) => {
    await page.goto('/owner/dashboard');
    await expect(page.getByRole('heading', { name: 'Dashboard Overview' })).toBeVisible();
    await expect(page.getByText('Total Spent (YTD)')).toBeVisible();
    await expect(page.getByText('Active Work Orders')).toBeVisible();
    await expect(page.getByText('Maintenance ROI')).toBeVisible();
    await expect(page.getByText('Active Properties')).toBeVisible();
    await expect(page.getByText('Recent Requests')).toBeVisible();
  });

  test('/owner redirects to /owner/dashboard', async ({ page }) => {
    await page.goto('/owner');
    await expect(page).toHaveURL(/\/owner\/dashboard$/);
  });

  test('sidebar shows new nav structure', async ({ page }) => {
    await page.goto('/owner/dashboard');
    const sidebar = page.locator('aside').first();
    await expect(sidebar.getByText('Dashboard')).toBeVisible();
    await expect(sidebar.getByText('Properties')).toBeVisible();
    await expect(sidebar.getByText('Work Orders')).toBeVisible();
    await expect(sidebar.getByText('Financials')).toBeVisible();
    await expect(sidebar.getByText('Service Network')).toBeVisible();
    await expect(sidebar.getByText('Reports')).toBeVisible();
    await expect(sidebar.getByText('Services')).toHaveCount(0);
    await expect(sidebar.getByText('Leases')).toHaveCount(0);
    await expect(sidebar.getByText('Analytics')).toHaveCount(0);
  });

  test('no provider businessName in DOM', async ({ page }) => {
    await page.goto('/owner/dashboard');
    const body = await page.locator('body').innerText();
    // Generic seeded provider businessName patterns:
    expect(body).not.toMatch(/provider:.+/i);
    expect(body).not.toMatch(/business name/i);
  });

  test('stub pages load without 404', async ({ page }) => {
    for (const path of ['/owner/work-orders', '/owner/financials', '/owner/service-network', '/owner/reports']) {
      const response = await page.goto(path);
      expect(response?.status()).toBeLessThan(400);
      await expect(page.getByText('Coming soon')).toBeVisible();
    }
  });
});
```

- [ ] **Step 3: Verify Playwright config exists**

```bash
ls "F:/OPSMP/PropertManagement/playwright.config.ts" 2>/dev/null || echo "MISSING"
```

If `MISSING`, create a minimal config:

```ts
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
```

Also add the test script to `package.json` if missing:

```json
"scripts": {
  ...
  "test:e2e": "playwright test"
}
```

- [ ] **Step 4: Run the E2E suite**

```bash
pnpm test:e2e -- owner-dashboard.spec.ts
```

Expected: all 5 tests pass.

- [ ] **Step 5: Commit**

```bash
git add tests/e2e/owner-dashboard.spec.ts playwright.config.ts package.json
git commit -m "test(owner-dashboard): e2e covers render, redirect, sidebar, privacy, stub pages

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 19: Full Verification Sweep

- [ ] **Step 1: Run unit tests**

```bash
pnpm test:run
```

Expected: zero failures across the full suite.

- [ ] **Step 2: Run type-check**

```bash
pnpm tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 3: Run lint**

```bash
pnpm lint
```

Expected: zero errors (warnings acceptable).

- [ ] **Step 4: Run production build**

```bash
pnpm build
```

Expected: build succeeds. Confirm output mentions `/owner/dashboard` as a dynamic route.

- [ ] **Step 5: Run E2E suite (full)**

```bash
pnpm test:e2e
```

Expected: zero failures.

- [ ] **Step 6: Visual smoke against mockup**

```bash
pnpm dev
```

Open `http://localhost:3000/owner/dashboard` side-by-side with `owners_page/dashboard_standardized_nav/screen.png`. Confirm the three KPI cards, two-column properties+requests layout, and sidebar visually match the mockup intent (precise pixel parity not required — palette differences and exact spacing differences are acceptable since the project uses its own CSS-variable tokens).

If any visible regression on the page, fix and re-run Step 1-5 before continuing.

- [ ] **Step 7: Final commit (if any fixes made)**

```bash
git add -A
git commit -m "fix(owner-dashboard): verification sweep fixes

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

If no changes were needed, skip this step.

---

## Acceptance Criteria (must all be checked before declaring done)

- [ ] `/owner/dashboard` renders without error for a seeded OWNER session.
- [ ] Three KPI cards display real values from DB (no mock fixtures).
- [ ] Properties grid shows up to 4 owner properties; empty state otherwise.
- [ ] Recent Requests list shows up to 5 agreements; empty state otherwise.
- [ ] No provider identity (businessName, providerId, ProviderProfile fields) appears in any payload or DOM (E2E + repo test assertions).
- [ ] Sidebar shows: Dashboard, Properties, Work Orders, Financials, Service Network, Reports — no Services/Leases/Analytics.
- [ ] All four stub pages load without 404 and render "Coming soon".
- [ ] `/owner` redirects to `/owner/dashboard`.
- [ ] All `Decimal` arithmetic uses `decimal.js`; UI formats TZS at edge.
- [ ] `pnpm test:run` — all green.
- [ ] `pnpm tsc --noEmit` — zero errors.
- [ ] `pnpm lint` — zero errors.
- [ ] `pnpm build` — succeeds.
- [ ] `pnpm test:e2e` — all green.
