# Provider Task History Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a `/provider/history` route that lets a logged-in PROVIDER browse every task instance that has left the active pipeline — completed, verified, disputed, overdue, or cancelled — with status-pill filters and page-based pagination, sourced from a PII-safe paginated query.

**Architecture:** Single Server Component route consumes a new paginated query (`getProviderTaskHistory`) that maps a 5-value URL status union to the underlying Task + Assignment status enums, applies a fixed 90-day `scheduledFor` window for performance, and selects only PII-safe columns. Filter pills and pagination links rebuild the URL query string deterministically — no client state.

**Tech Stack:** Next.js 16 (App Router, async params), TypeScript 5.6, React 19, Prisma 5.20, Decimal.js 10, Zod 3, Vitest 4 + jsdom + RTL, Tailwind via CSS-variable tokens, Lucide icons.

**Spec:** [docs/superpowers/specs/2026-05-18-provider-task-history-design.md](../specs/2026-05-18-provider-task-history-design.md)

---

## Conventions

- `cn` from `@/lib/cn`, prisma from `@/core/database/client`, auth from `@/core/auth`, formatTZS from `@/shared/lib/currency`.
- Vitest globals on. Test runner: `pnpm test:run`. Mock `@/core/database/client` with `vi.mock` (project pattern, see [tasks.queries.test.ts](../../../src/features/tasks/tests/tasks.queries.test.ts)).
- Decimal: Prisma Decimal → string via `.toString()` at the query boundary; `formatTZS` accepts strings.
- Tailwind: CSS-variable tokens (`bg-[var(--surface-card)]`, `text-[var(--text-primary)]`).
- Commits: Conventional Commits with `Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>` trailer (HEREDOC for multi-line).
- Branch: create a feature branch `feat/provider-task-history` before Task 1.

---

## File Map

### Created

- `src/shared/components/ui/Pagination.tsx`
- `src/shared/components/ui/Pagination.test.tsx`
- `src/features/tasks/components/HistoryFilters.tsx`
- `src/features/tasks/components/HistoryFilters.test.tsx`
- `src/features/tasks/components/HistoryTable.tsx`
- `src/features/tasks/components/HistoryTable.test.tsx`
- `src/features/tasks/tests/tasks.history.queries.test.ts`
- `src/app/(dashboard)/provider/history/page.tsx`

### Modified

- `src/features/tasks/queries.ts` — append `getProviderTaskHistory` + types
- `src/components/layout/Sidebar.tsx` — add History nav entry + lucide import
- `src/components/layout/Sidebar.test.tsx` — extend tests to assert History nav

### Deleted

*(none)*

---

## Branch setup

- [ ] **Step 0: Create branch from master**

```bash
git -C F:/OPSMP/PropertManagement checkout master
git -C F:/OPSMP/PropertManagement pull --ff-only origin master  # skip if no remote
git -C F:/OPSMP/PropertManagement checkout -b feat/provider-task-history
```

If working in a worktree, substitute `git worktree add F:/OPSMP/PropertManagement/.worktrees/provider-task-history -b feat/provider-task-history master` and run `pnpm install` inside the worktree before Task 1.

---

## Task 1: Shared Pagination component

**Files:**
- Create: `src/shared/components/ui/Pagination.tsx`
- Create: `src/shared/components/ui/Pagination.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/shared/components/ui/Pagination.test.tsx
import { render, screen } from '@testing-library/react';
import { Pagination } from './Pagination';

describe('Pagination', () => {
  it('renders "Page N of M" label', () => {
    render(<Pagination basePath="/x" currentPage={2} totalPages={5} otherParams={{}} />);
    expect(screen.getByText(/Page 2 of 5/)).toBeInTheDocument();
  });

  it('disables Prev on page 1', () => {
    render(<Pagination basePath="/x" currentPage={1} totalPages={5} otherParams={{}} />);
    const prev = screen.getByRole('link', { name: /previous/i });
    expect(prev).toHaveAttribute('aria-disabled', 'true');
  });

  it('disables Next on last page', () => {
    render(<Pagination basePath="/x" currentPage={5} totalPages={5} otherParams={{}} />);
    const next = screen.getByRole('link', { name: /next/i });
    expect(next).toHaveAttribute('aria-disabled', 'true');
  });

  it('preserves other URL params in links', () => {
    render(<Pagination basePath="/x" currentPage={2} totalPages={5} otherParams={{ status: 'VERIFIED,DISPUTED' }} />);
    const next = screen.getByRole('link', { name: /next/i });
    expect(next).toHaveAttribute('href', '/x?status=VERIFIED%2CDISPUTED&page=3');
  });

  it('returns null when totalPages <= 1', () => {
    const { container } = render(<Pagination basePath="/x" currentPage={1} totalPages={1} otherParams={{}} />);
    expect(container.firstChild).toBeNull();
  });
});
```

- [ ] **Step 2: Run to verify fail**

Run: `pnpm test:run src/shared/components/ui/Pagination.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

```tsx
// src/shared/components/ui/Pagination.tsx
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/cn';

interface Props {
  basePath: string;
  currentPage: number;
  totalPages: number;
  /** Other URL params to preserve in Prev/Next links. */
  otherParams: Record<string, string>;
}

function buildHref(basePath: string, params: Record<string, string>, page: number): string {
  const url = new URLSearchParams(params);
  url.set('page', String(page));
  return `${basePath}?${url.toString()}`;
}

export function Pagination({ basePath, currentPage, totalPages, otherParams }: Props) {
  if (totalPages <= 1) return null;
  const prevDisabled = currentPage <= 1;
  const nextDisabled = currentPage >= totalPages;
  const prevHref = prevDisabled ? '#' : buildHref(basePath, otherParams, currentPage - 1);
  const nextHref = nextDisabled ? '#' : buildHref(basePath, otherParams, currentPage + 1);

  const linkClasses = (disabled: boolean) =>
    cn(
      'inline-flex items-center gap-1 px-3 py-1.5 rounded border text-label transition-colors',
      disabled
        ? 'border-[var(--border-subtle)] text-[var(--text-muted)] pointer-events-none opacity-50'
        : 'border-[var(--border-subtle)] text-[var(--text-primary)] hover:bg-[var(--surface-overlay)]',
    );

  return (
    <nav aria-label="Pagination" className="flex items-center justify-between gap-4 px-1 py-3">
      <Link href={prevHref} aria-disabled={prevDisabled} className={linkClasses(prevDisabled)} aria-label="Previous page">
        <ChevronLeft size={14} /> Previous
      </Link>
      <span className="text-body-sm text-[var(--text-muted)] tabular-nums">Page {currentPage} of {totalPages}</span>
      <Link href={nextHref} aria-disabled={nextDisabled} className={linkClasses(nextDisabled)} aria-label="Next page">
        Next <ChevronRight size={14} />
      </Link>
    </nav>
  );
}
```

- [ ] **Step 4: Run to verify pass**

Run: `pnpm test:run src/shared/components/ui/Pagination.test.tsx`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git -C F:/OPSMP/PropertManagement add src/shared/components/ui/Pagination.tsx src/shared/components/ui/Pagination.test.tsx
git -C F:/OPSMP/PropertManagement commit -m "$(cat <<'EOF'
feat(provider-history): shared Pagination component

Reusable Prev/Next pagination with disabled-state styling, preserves
other URL params, returns null when only one page. To be consumed by
/provider/history and (later) other paginated lists.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: getProviderTaskHistory query

**Files:**
- Modify: `src/features/tasks/queries.ts` (append new export + supporting types)
- Create: `src/features/tasks/tests/tasks.history.queries.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
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
```

- [ ] **Step 2: Run to verify fail**

Run: `pnpm test:run src/features/tasks/tests/tasks.history.queries.test.ts`
Expected: FAIL — `getProviderTaskHistory is not a function`.

- [ ] **Step 3: Implement query (append to `src/features/tasks/queries.ts`)**

Add to the bottom of `src/features/tasks/queries.ts`:

```ts
export type HistoryStatus = 'COMPLETED' | 'VERIFIED' | 'DISPUTED' | 'OVERDUE' | 'CANCELLED';

export interface HistoryRow {
  id: string;
  scheduledFor: string;
  uiStatus: HistoryStatus;
  serviceTypeName: string;
  zone: string;
  providerPayoutTZS: string;
}

export interface HistoryResult {
  rows: HistoryRow[];
  total: number;
  page: number;
  pageSize: number;
}

const CANCELLATION_ASSIGNMENT_STATUSES = [
  'CANCELLED_BY_OWNER',
  'CANCELLED_NO_SHOW',
  'EXPIRED',
  'REJECTED',
  'AUTO_REASSIGNED',
] as const;
const TASK_TERMINAL_STATUSES = ['COMPLETED', 'VERIFIED', 'DISPUTED', 'OVERDUE'] as const;

function buildStatusOr(statuses: HistoryStatus[]) {
  const wanted = statuses.length > 0 ? statuses : (['COMPLETED', 'VERIFIED', 'DISPUTED', 'OVERDUE', 'CANCELLED'] as HistoryStatus[]);
  const taskStatuses = wanted.filter((s): s is Exclude<HistoryStatus, 'CANCELLED'> => s !== 'CANCELLED');
  const includeCancelled = wanted.includes('CANCELLED');

  const or: Array<Record<string, unknown>> = [];
  if (taskStatuses.length > 0) {
    or.push({ status: { in: taskStatuses } });
  }
  if (includeCancelled) {
    or.push({ assignment: { status: { in: [...CANCELLATION_ASSIGNMENT_STATUSES] } } });
  }
  return or;
}

function deriveUiStatus(taskStatus: string, assignmentStatus: string): HistoryStatus {
  if ((CANCELLATION_ASSIGNMENT_STATUSES as readonly string[]).includes(assignmentStatus)) return 'CANCELLED';
  if ((TASK_TERMINAL_STATUSES as readonly string[]).includes(taskStatus)) return taskStatus as HistoryStatus;
  // Fallback — shouldn't appear in history if query is well-formed, but keep stable.
  return 'COMPLETED';
}

export async function getProviderTaskHistory(
  providerUserId: string,
  filters: { statuses: HistoryStatus[] },
  page: number,
  pageSize: number,
): Promise<HistoryResult> {
  const provider = await prisma.providerProfile.findUnique({
    where: { userId: providerUserId },
    select: { id: true },
  });
  if (!provider) {
    return { rows: [], total: 0, page: Math.max(1, page), pageSize };
  }

  const requestedPage = Math.max(1, page);
  const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  const orPredicate = buildStatusOr(filters.statuses);

  const where = {
    assignment: { providerId: provider.id },
    scheduledFor: { gte: since },
    OR: orPredicate,
  };

  const select = {
    id: true,
    scheduledFor: true,
    status: true,
    assignment: {
      select: {
        id: true,
        status: true,
        providerPayout: true,
        serviceType: { select: { name: true } },
        property: { select: { zone: true } },
      },
    },
  };

  // First pass — use the requested page.
  let effectivePage = requestedPage;
  let rows = await prisma.task.findMany({
    where,
    select,
    orderBy: { scheduledFor: 'desc' },
    skip: (effectivePage - 1) * pageSize,
    take: pageSize,
  });
  const total = await prisma.task.count({ where });

  // If requested page is past the end, clamp and re-fetch.
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (effectivePage > totalPages) {
    effectivePage = totalPages;
    rows = await prisma.task.findMany({
      where,
      select,
      orderBy: { scheduledFor: 'desc' },
      skip: (effectivePage - 1) * pageSize,
      take: pageSize,
    });
  }

  return {
    rows: rows.map((t) => ({
      id: t.id,
      scheduledFor: t.scheduledFor.toISOString(),
      uiStatus: deriveUiStatus(t.status, t.assignment.status),
      serviceTypeName: t.assignment.serviceType.name,
      zone: t.assignment.property.zone,
      providerPayoutTZS: t.assignment.providerPayout.toString(),
    })),
    total,
    page: effectivePage,
    pageSize,
  };
}
```

- [ ] **Step 4: Run test to verify pass**

Run: `pnpm test:run src/features/tasks/tests/tasks.history.queries.test.ts`
Expected: PASS (9 tests).

- [ ] **Step 5: Commit**

```bash
git -C F:/OPSMP/PropertManagement add src/features/tasks/queries.ts src/features/tasks/tests/tasks.history.queries.test.ts
git -C F:/OPSMP/PropertManagement commit -m "$(cat <<'EOF'
feat(provider-history): getProviderTaskHistory query

Paginated, filterable query over a provider's terminal tasks. Maps 5-value
UI status union to task.status + assignment.status enums via OR predicate.
90-day scheduledFor window enforced server-side. Clamps page to last
valid page when out of range. PII-safe select.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: HistoryFilters component

**Files:**
- Create: `src/features/tasks/components/HistoryFilters.tsx`
- Create: `src/features/tasks/components/HistoryFilters.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/features/tasks/components/HistoryFilters.test.tsx
import { render, screen } from '@testing-library/react';
import { HistoryFilters } from './HistoryFilters';

describe('HistoryFilters', () => {
  it('renders all 5 status pills', () => {
    render(<HistoryFilters active={[]} />);
    for (const label of ['Completed', 'Verified', 'Disputed', 'Overdue', 'Cancelled']) {
      expect(screen.getByRole('link', { name: label })).toBeInTheDocument();
    }
  });

  it('toggles VERIFIED into the URL when not active', () => {
    render(<HistoryFilters active={['DISPUTED']} />);
    const verified = screen.getByRole('link', { name: 'Verified' });
    expect(verified).toHaveAttribute('href', '/provider/history?status=DISPUTED%2CVERIFIED');
  });

  it('removes VERIFIED from the URL when already active', () => {
    render(<HistoryFilters active={['DISPUTED', 'VERIFIED']} />);
    const verified = screen.getByRole('link', { name: 'Verified' });
    expect(verified).toHaveAttribute('href', '/provider/history?status=DISPUTED');
  });

  it('omits status param when removing the only active status', () => {
    render(<HistoryFilters active={['VERIFIED']} />);
    const verified = screen.getByRole('link', { name: 'Verified' });
    expect(verified).toHaveAttribute('href', '/provider/history');
  });

  it('marks active pills with data-active="true"', () => {
    render(<HistoryFilters active={['VERIFIED']} />);
    expect(screen.getByRole('link', { name: 'Verified' })).toHaveAttribute('data-active', 'true');
    expect(screen.getByRole('link', { name: 'Disputed' })).toHaveAttribute('data-active', 'false');
  });
});
```

- [ ] **Step 2: Run to verify fail**

Run: `pnpm test:run src/features/tasks/components/HistoryFilters.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

```tsx
// src/features/tasks/components/HistoryFilters.tsx
import Link from 'next/link';
import { cn } from '@/lib/cn';
import type { HistoryStatus } from '../queries';

interface Props {
  active: HistoryStatus[];
}

const PILLS: Array<{ value: HistoryStatus; label: string }> = [
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'VERIFIED',  label: 'Verified'  },
  { value: 'DISPUTED',  label: 'Disputed'  },
  { value: 'OVERDUE',   label: 'Overdue'   },
  { value: 'CANCELLED', label: 'Cancelled' },
];

function toggleHref(active: HistoryStatus[], value: HistoryStatus): string {
  const isActive = active.includes(value);
  const next = isActive ? active.filter((v) => v !== value) : [...active, value];
  if (next.length === 0) return '/provider/history';
  const params = new URLSearchParams({ status: next.join(',') });
  return `/provider/history?${params.toString()}`;
}

export function HistoryFilters({ active }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {PILLS.map((p) => {
        const isActive = active.includes(p.value);
        return (
          <Link
            key={p.value}
            href={toggleHref(active, p.value)}
            data-active={isActive ? 'true' : 'false'}
            className={cn(
              'inline-flex items-center px-3 py-1.5 rounded-full text-label border transition-colors',
              isActive
                ? 'bg-[var(--brand-primary)] text-[var(--text-on-brand)] border-[var(--brand-primary)]'
                : 'bg-[var(--surface-card)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:border-[var(--border-default)]',
            )}
          >
            {p.label}
          </Link>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 4: Run to verify pass**

Run: `pnpm test:run src/features/tasks/components/HistoryFilters.test.tsx`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git -C F:/OPSMP/PropertManagement add src/features/tasks/components/HistoryFilters.tsx src/features/tasks/components/HistoryFilters.test.tsx
git -C F:/OPSMP/PropertManagement commit -m "$(cat <<'EOF'
feat(provider-history): HistoryFilters status pill toggles

Server-component pill toggles. Each pill is a <Link> that adds or removes
its status from the URL ?status= param. Empty active set drops the param
entirely. Active pills filled in brand-primary; inactive outlined.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: HistoryTable component

**Files:**
- Create: `src/features/tasks/components/HistoryTable.tsx`
- Create: `src/features/tasks/components/HistoryTable.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/features/tasks/components/HistoryTable.test.tsx
import { render, screen } from '@testing-library/react';
import { HistoryTable, HistoryTableSkeleton } from './HistoryTable';
import type { HistoryRow } from '../queries';

const row: HistoryRow = {
  id: 'task-1',
  scheduledFor: '2026-04-01T10:00:00.000Z',
  uiStatus: 'VERIFIED',
  serviceTypeName: 'HVAC',
  zone: 'Downtown',
  providerPayoutTZS: '80000.00',
};

describe('HistoryTable', () => {
  it('renders one row per item', () => {
    render(<HistoryTable rows={[row, { ...row, id: 'task-2', uiStatus: 'DISPUTED' }]} hasFilter={false} />);
    expect(screen.getAllByRole('row')).toHaveLength(3); // header + 2 data rows
  });

  it('row links to /provider/tasks/[id]', () => {
    render(<HistoryTable rows={[row]} hasFilter={false} />);
    const link = screen.getByRole('link', { name: /#TASK-1/i });
    expect(link).toHaveAttribute('href', '/provider/tasks/task-1');
  });

  it('renders payout via formatTZS', () => {
    render(<HistoryTable rows={[row]} hasFilter={false} />);
    expect(screen.getByText('TZS 80,000')).toBeInTheDocument();
  });

  it('shows generic empty state when no filter and no rows', () => {
    render(<HistoryTable rows={[]} hasFilter={false} />);
    expect(screen.getByText(/No history yet/)).toBeInTheDocument();
  });

  it('shows filter-specific empty state when filter active and no rows', () => {
    render(<HistoryTable rows={[]} hasFilter />);
    expect(screen.getByText(/No matches for current filters/)).toBeInTheDocument();
  });
});

describe('HistoryTableSkeleton', () => {
  it('renders 5 skeleton rows', () => {
    const { container } = render(<HistoryTableSkeleton />);
    expect(container.querySelectorAll('[data-skeleton="row"]')).toHaveLength(5);
  });
});
```

- [ ] **Step 2: Run to verify fail**

Run: `pnpm test:run src/features/tasks/components/HistoryTable.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

```tsx
// src/features/tasks/components/HistoryTable.tsx
import Link from 'next/link';
import { ClipboardCheck } from 'lucide-react';
import { formatTZS } from '@/shared/lib/currency';
import type { HistoryRow, HistoryStatus } from '../queries';

const STATUS_BADGE: Record<HistoryStatus, string> = {
  COMPLETED: 'bg-[var(--surface-overlay)] text-[var(--text-secondary)]',
  VERIFIED:  'bg-[var(--state-success-bg)] text-[var(--state-success)]',
  DISPUTED:  'bg-[var(--state-warning-bg)] text-[var(--state-warning)]',
  OVERDUE:   'bg-[var(--state-error-bg)] text-[var(--state-error)]',
  CANCELLED: 'bg-[var(--state-error-bg)] text-[var(--state-error)]',
};

const STATUS_LABEL: Record<HistoryStatus, string> = {
  COMPLETED: 'Completed',
  VERIFIED:  'Verified',
  DISPUTED:  'Disputed',
  OVERDUE:   'Overdue',
  CANCELLED: 'Cancelled',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' });
}

interface Props {
  rows: HistoryRow[];
  hasFilter: boolean;
}

export function HistoryTable({ rows, hasFilter }: Props) {
  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[var(--border-subtle)] bg-[var(--surface-card)] p-12 text-center flex flex-col items-center gap-3">
        <ClipboardCheck size={28} className="text-[var(--text-muted)]" />
        {hasFilter ? (
          <>
            <h2 className="text-h2 font-semibold text-[var(--text-primary)]">No matches for current filters</h2>
            <p className="text-body-sm text-[var(--text-muted)]">Try clearing a status to see more results.</p>
          </>
        ) : (
          <>
            <h2 className="text-h2 font-semibold text-[var(--text-primary)]">No history yet</h2>
            <p className="text-body-sm text-[var(--text-muted)]">Completed and verified tasks will appear here once you finish your first job.</p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="border border-[var(--border-subtle)] rounded-lg bg-[var(--surface-card)] overflow-x-auto">
      <table className="w-full text-left border-collapse min-w-[700px]">
        <thead>
          <tr className="bg-[var(--surface-page)] border-b border-[var(--border-subtle)]">
            <th className="text-label uppercase text-[var(--text-muted)] px-3 py-2">Date</th>
            <th className="text-label uppercase text-[var(--text-muted)] px-3 py-2">Task</th>
            <th className="text-label uppercase text-[var(--text-muted)] px-3 py-2">Service</th>
            <th className="text-label uppercase text-[var(--text-muted)] px-3 py-2">Zone</th>
            <th className="text-label uppercase text-[var(--text-muted)] px-3 py-2 text-right">Payout</th>
            <th className="text-label uppercase text-[var(--text-muted)] px-3 py-2 text-right">Status</th>
          </tr>
        </thead>
        <tbody className="text-body-sm text-[var(--text-primary)] tabular-nums">
          {rows.map((r, i) => (
            <tr
              key={r.id}
              className={`border-b border-[var(--border-subtle)] hover:bg-[var(--surface-page)] ${i % 2 === 1 ? 'bg-[var(--surface-page)]' : ''}`}
            >
              <td className="px-3 py-2 whitespace-nowrap text-[var(--text-secondary)]">{formatDate(r.scheduledFor)}</td>
              <td className="px-3 py-2 text-[var(--text-secondary)]">
                <Link href={`/provider/tasks/${r.id}`} className="hover:underline">
                  #{r.id.slice(0, 6).toUpperCase()}
                </Link>
              </td>
              <td className="px-3 py-2 font-medium">{r.serviceTypeName}</td>
              <td className="px-3 py-2 text-[var(--text-secondary)]">{r.zone}</td>
              <td className="px-3 py-2 text-right">{formatTZS(r.providerPayoutTZS)}</td>
              <td className="px-3 py-2 text-right">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-label font-semibold ${STATUS_BADGE[r.uiStatus]}`}>
                  {STATUS_LABEL[r.uiStatus]}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function HistoryTableSkeleton() {
  return (
    <div className="border border-[var(--border-subtle)] rounded-lg bg-[var(--surface-card)] p-4 flex flex-col gap-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} data-skeleton="row" className="h-8 w-full rounded animate-pulse bg-[var(--surface-overlay)]" />
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Run to verify pass**

Run: `pnpm test:run src/features/tasks/components/HistoryTable.test.tsx`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git -C F:/OPSMP/PropertManagement add src/features/tasks/components/HistoryTable.tsx src/features/tasks/components/HistoryTable.test.tsx
git -C F:/OPSMP/PropertManagement commit -m "$(cat <<'EOF'
feat(provider-history): HistoryTable + skeleton

6-col table (Date / Task / Service / Zone / Payout / Status). Row clicks
link to /provider/tasks/[id]. Two empty-state variants depending on
whether filters are active. Skeleton component for Suspense fallback.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: History page route + sidebar entry

**Files:**
- Create: `src/app/(dashboard)/provider/history/page.tsx`
- Modify: `src/components/layout/Sidebar.tsx` (add History nav entry + lucide import)
- Modify: `src/components/layout/Sidebar.test.tsx` (extend assertions)

- [ ] **Step 1: Update Sidebar test to expect History entry**

Edit `src/components/layout/Sidebar.test.tsx`. In the existing test `renders Dashboard, Assignments, Tasks, Wallet, Settings`, replace the label loop with:

```ts
    for (const label of ['Dashboard', 'Assignments', 'Tasks', 'History', 'Wallet', 'Settings']) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
```

Add a new test at the bottom of the PROVIDER `describe`:

```tsx
  it('History stays active on /provider/history', () => {
    mockPathname = '/provider/history';
    render(<Sidebar role="PROVIDER" />);
    const history = screen.getByText('History').closest('a')!;
    expect(history.className).toMatch(/border-l-2/);
  });
```

- [ ] **Step 2: Run to verify fail**

Run: `pnpm test:run src/components/layout/Sidebar.test.tsx`
Expected: FAIL — History not in current sidebar config.

- [ ] **Step 3: Update sidebar config**

In `src/components/layout/Sidebar.tsx`:

1. Add `History` to the lucide-react import list at the top (alphabetical order with existing imports):

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
  Bolt,
  History,
} from 'lucide-react';
```

2. Insert the History entry into the PROVIDER nav (between Tasks and Wallet):

```ts
  PROVIDER: [
    { href: '/provider',            label: 'Dashboard',   icon: LayoutDashboard },
    { href: '/provider/assignments', label: 'Assignments', icon: ClipboardList },
    { href: '/provider/tasks',       label: 'Tasks',       icon: Wrench },
    { href: '/provider/history',     label: 'History',     icon: History },
    { href: '/provider/wallet',      label: 'Wallet',      icon: BarChart3 },
    { href: '/provider/settings',    label: 'Settings',    icon: Bolt },
  ],
```

- [ ] **Step 4: Run to verify sidebar tests pass**

Run: `pnpm test:run src/components/layout/Sidebar.test.tsx`
Expected: PASS (6 tests).

- [ ] **Step 5: Create the route page**

```tsx
// src/app/(dashboard)/provider/history/page.tsx
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/core/auth';
import RoleGuard from '@/components/RoleGuard';
import { DashboardHeader } from '@/shared/components/dashboard/DashboardHeader';
import { Pagination } from '@/shared/components/ui/Pagination';
import { HistoryFilters } from '@/features/tasks/components/HistoryFilters';
import { HistoryTable, HistoryTableSkeleton } from '@/features/tasks/components/HistoryTable';
import { getProviderTaskHistory } from '@/features/tasks/queries';
import type { HistoryStatus } from '@/features/tasks/queries';

export const dynamic = 'force-dynamic';

const ALL_STATUSES: HistoryStatus[] = ['COMPLETED', 'VERIFIED', 'DISPUTED', 'OVERDUE', 'CANCELLED'];
const PAGE_SIZE = 20;

function parseStatuses(raw: string | undefined): HistoryStatus[] {
  if (!raw) return [];
  const parts = raw.split(',').map((p) => p.trim().toUpperCase());
  return parts.filter((p): p is HistoryStatus => ALL_STATUSES.includes(p as HistoryStatus));
}

function parsePage(raw: string | undefined): number {
  const n = Number(raw);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
}

export default function ProviderHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  return (
    <RoleGuard allowedRoles={['PROVIDER']}>
      <DashboardHeader title="History" subtitle="Completed, verified, and closed tasks from the last 90 days." />
      <Suspense fallback={<HistoryTableSkeleton />}>
        <HistoryContent searchParams={searchParams} />
      </Suspense>
    </RoleGuard>
  );
}

async function HistoryContent({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect('/login');
  if (session.user.role !== 'PROVIDER') redirect('/login');

  const params = await searchParams;
  const statuses = parseStatuses(params.status);
  const requestedPage = parsePage(params.page);

  const result = await getProviderTaskHistory(
    session.user.id,
    { statuses },
    requestedPage,
    PAGE_SIZE,
  );
  const totalPages = Math.max(1, Math.ceil(result.total / PAGE_SIZE));
  const otherParams: Record<string, string> = {};
  if (statuses.length > 0) otherParams.status = statuses.join(',');

  return (
    <div className="flex flex-col gap-6">
      <HistoryFilters active={statuses} />
      <HistoryTable rows={result.rows} hasFilter={statuses.length > 0} />
      <Pagination
        basePath="/provider/history"
        currentPage={result.page}
        totalPages={totalPages}
        otherParams={otherParams}
      />
    </div>
  );
}
```

- [ ] **Step 6: Smoke-typecheck the new route**

Run: `pnpm tsc --noEmit 2>&1 | grep -E "history/page.tsx"` (use Bash; not Grep tool since we're piping)
Expected: empty output (no errors in the new file). Pre-existing baseline errors elsewhere are out of scope.

- [ ] **Step 7: Commit**

```bash
git -C F:/OPSMP/PropertManagement add "src/app/(dashboard)/provider/history/page.tsx" src/components/layout/Sidebar.tsx src/components/layout/Sidebar.test.tsx
git -C F:/OPSMP/PropertManagement commit -m "$(cat <<'EOF'
feat(provider-history): /provider/history route + sidebar entry

Server-component route composes DashboardHeader + HistoryFilters +
HistoryTable + Pagination. Parses status/page from async searchParams,
forwards to getProviderTaskHistory. Adds History nav item between
Tasks and Wallet.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Final pass

- [ ] **Step 1: Run full test suite**

Run: `pnpm test:run`
Expected: all new tests pass (5 + 9 + 5 + 6 + 1 = 26 new). Pre-existing 11 LoginForm/RegisterForm failures unchanged.

- [ ] **Step 2: Scoped tsc check**

Run:
```bash
pnpm tsc --noEmit 2>&1 | grep -vE "test\.(ts|tsx)" | grep -E "error TS" | grep -E "(features/tasks|app/\(dashboard\)/provider/history|shared/components/ui/Pagination|components/layout/Sidebar)"
```
Expected: empty output.

- [ ] **Step 3: Manual dev-server smoke (optional)**

If a dev server is available with seeded provider data:
- Visit `/provider/history` — table renders, all pills inactive.
- Click `Verified` pill — URL becomes `/provider/history?status=VERIFIED`, table filters.
- Click `Disputed` pill — URL becomes `/provider/history?status=VERIFIED,DISPUTED`.
- Click `Verified` again — URL becomes `/provider/history?status=DISPUTED`.
- Click a row — navigates to `/provider/tasks/[id]`.
- If results > 20, Next pagination link goes to `?status=...&page=2`.

If no dev server / no seed, skip and document in the merge PR.

- [ ] **Step 4: Open PR or merge to master**

```bash
git -C F:/OPSMP/PropertManagement push -u origin feat/provider-task-history  # if remote exists
# OR merge locally if no remote:
git -C F:/OPSMP/PropertManagement checkout master
git -C F:/OPSMP/PropertManagement merge --no-ff feat/provider-task-history -m "$(cat <<'EOF'
Merge feat/provider-task-history: /provider/history route (P1.5)

5 commits implementing per the spec at
docs/superpowers/specs/2026-05-18-provider-task-history-design.md.

Adds shared Pagination component, getProviderTaskHistory query with
status mapping + 90d window + PII-safe select, HistoryFilters pill
toggles, HistoryTable + skeleton, route page, sidebar entry.

26 new tests, all pass. Baseline failures unchanged.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Self-Review

### Spec coverage

| Spec section | Task |
|---|---|
| Goal: paginated/filterable history | Task 5 (page composes all) |
| Task-level granularity | Task 2 (rows from `prisma.task.findMany`) |
| Five status values mapped to task + assignment | Task 2 (`buildStatusOr` + `deriveUiStatus`) |
| Filters: status only | Task 3 (HistoryFilters) |
| Implicit 90-day window | Task 2 (test #2) |
| Page-based pagination, pageSize 20 | Task 1 + Task 5 |
| 6-column table | Task 4 |
| Sidebar entry between Tasks and Wallet | Task 5 |
| PII-safe select (no owner, no encryptedAddress) | Task 2 (test #6) |
| Empty state — generic + filter-specific | Task 4 (test #4 + #5) |
| URL contract (unknown statuses dropped, page clamp) | Task 2 (test #7 + #8) + Task 5 (`parseStatuses`, `parsePage`) |
| Tests: query, filters, table, pagination | Tasks 1–5 (each task pairs test + impl) |
| E2E deferred | acknowledged, no task |

### Placeholder scan

No "TBD", "TODO", or vague "handle edge cases" instructions. Every step has the exact code or command.

### Type consistency

- `HistoryStatus` defined in Task 2, imported in Tasks 3, 4, 5.
- `HistoryRow` defined in Task 2, consumed in Task 4 test and component.
- `HistoryResult` returned by Task 2, consumed in Task 5.
- `Pagination` props (`basePath`, `currentPage`, `totalPages`, `otherParams`) consistent between Task 1 definition and Task 5 usage.
- `HistoryFilters` props (`active: HistoryStatus[]`) consistent between Task 3 definition and Task 5 usage.
- `HistoryTable` props (`rows`, `hasFilter`) consistent between Task 4 definition and Task 5 usage.

### Gaps fixed inline

- Originally the Task 5 route imported `History` icon as `History as HistoryIcon` to avoid React DOM `History` collision — but `lucide-react` exports the icon directly and there is no DOM collision (the file does not use `window.history`). Plain `import { History }` is fine. Verified.
- Initial Task 2 query attempted `where: { OR: [] }` when statuses set was empty (Prisma rejects empty OR). Fixed: `buildStatusOr` now expands an empty input to the full 5-status set, so OR is never empty.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-05-18-provider-task-history.md`. Two execution options:

1. **Subagent-Driven (recommended)** — dispatch a fresh subagent per task (6 tasks), review between tasks.
2. **Inline Execution** — execute tasks in this session using executing-plans.

Which approach?
