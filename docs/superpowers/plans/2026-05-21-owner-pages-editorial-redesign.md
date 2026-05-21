# Owner Pages Editorial Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign `/owner/financials`, `/owner/reports`, and `/owner/service-catalog` to the editorial dashboard aesthetic — fix broken CSS tokens, connected KPI strip with accent bars, client-side invoice filter, y-axis on spend chart, and updated catalog cards.

**Architecture:** Financials splits into a thin async server fetcher (`OwnerInvoicesTable`) + a new `'use client'` component (`OwnerInvoicesClient`) that owns filter state. All other components remain server async. No new dependencies. Token fixes propagate through all three pages.

**Tech Stack:** Next.js 16 App Router, Tailwind CSS, Vitest + Testing Library, `decimal.js` (already installed), `lucide-react`, `clsx`/`tailwind-merge` via `@/lib/cn`.

---

## File Map

| File | Action |
|---|---|
| `src/shared/components/dashboard/DashboardHeader.tsx` | Modify — add `serif?: boolean` prop |
| `src/shared/components/dashboard/DashboardHeader.test.tsx` | Create — new test file |
| `src/features/financials/components/OwnerFinancialsSummary.tsx` | Rewrite — connected KPI strip |
| `src/features/financials/components/OwnerInvoicesClient.tsx` | Create — client filter + table |
| `src/features/financials/components/OwnerInvoicesClient.test.tsx` | Create — filter logic tests |
| `src/features/financials/components/OwnerInvoicesTable.tsx` | Rewrite — thin server fetcher only |
| `src/features/financials/components/skeletons.tsx` | Rewrite — match new layout shapes |
| `src/app/(dashboard)/owner/financials/page.tsx` | Modify — pass `serif` |
| `src/features/owner-reports/components/MonthlySpendChart.tsx` | Rewrite — y-axis, grid lines, token fix |
| `src/features/owner-reports/components/ServiceMixChart.tsx` | Rewrite — layout + token fix |
| `src/features/owner-reports/components/PropertyCostTable.tsx` | Rewrite — card, divider, token fix |
| `src/features/owner-reports/components/skeletons.tsx` | Rewrite — token fixes |
| `src/app/(dashboard)/owner/reports/page.tsx` | Rewrite — inline serif header |
| `src/features/service-catalog/components/ServiceCatalogGrid.tsx` | Rewrite — card sizing, token fix |
| `src/features/service-catalog/components/skeletons.tsx` | Modify — token fix |
| `src/app/(dashboard)/owner/service-catalog/page.tsx` | Modify — serif + section divider |

---

## Task 1: DashboardHeader — add `serif` prop

**Files:**
- Modify: `src/shared/components/dashboard/DashboardHeader.tsx`
- Create: `src/shared/components/dashboard/DashboardHeader.test.tsx`

- [ ] **Step 1: Write failing test**

```tsx
// src/shared/components/dashboard/DashboardHeader.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DashboardHeader } from './DashboardHeader';

describe('DashboardHeader', () => {
  it('renders title', () => {
    render(<DashboardHeader title="Financials" />);
    expect(screen.getByRole('heading', { name: 'Financials' })).toBeInTheDocument();
  });

  it('renders subtitle when provided', () => {
    render(<DashboardHeader title="T" subtitle="Sub text" />);
    expect(screen.getByText('Sub text')).toBeInTheDocument();
  });

  it('applies font-serif class when serif prop is true', () => {
    render(<DashboardHeader title="Reports" serif />);
    expect(screen.getByRole('heading')).toHaveClass('font-serif');
  });

  it('does not apply font-serif class by default', () => {
    render(<DashboardHeader title="Reports" />);
    expect(screen.getByRole('heading')).not.toHaveClass('font-serif');
  });
});
```

- [ ] **Step 2: Run to confirm failure**

```bash
pnpm test:run DashboardHeader
```

Expected: FAIL — `font-serif` class tests fail, others pass.

- [ ] **Step 3: Implement serif prop**

Replace the entire file:

```tsx
// src/shared/components/dashboard/DashboardHeader.tsx
import { cn } from '@/lib/cn';

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  asOf?: Date;
  serif?: boolean;
}

function formatAsOf(d: Date): string {
  return d.toLocaleString('en-GB', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

export function DashboardHeader({ title, subtitle, asOf, serif }: DashboardHeaderProps) {
  return (
    <div className="mb-8 flex justify-between items-end">
      <div>
        <h1 className={cn('text-h1 font-semibold text-[var(--text-primary)]', serif && 'font-serif')}>
          {title}
        </h1>
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

- [ ] **Step 4: Run tests to confirm pass**

```bash
pnpm test:run DashboardHeader
```

Expected: 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/shared/components/dashboard/DashboardHeader.tsx src/shared/components/dashboard/DashboardHeader.test.tsx
git commit -m "feat(ui): add serif prop to DashboardHeader"
```

---

## Task 2: OwnerFinancialsSummary — connected KPI strip

**Files:**
- Rewrite: `src/features/financials/components/OwnerFinancialsSummary.tsx`

This is an async server component — no unit test (pure visual).

- [ ] **Step 1: Rewrite OwnerFinancialsSummary**

```tsx
// src/features/financials/components/OwnerFinancialsSummary.tsx
import { getOwnerFinancialsSummary } from '../services';

interface Props {
  ownerUserId: string;
}

export async function OwnerFinancialsSummary({ ownerUserId }: Props) {
  const s = await getOwnerFinancialsSummary(ownerUserId);

  return (
    <div className="border border-border-subtle rounded-lg overflow-hidden bg-surface-card shadow-card mb-6 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border-subtle">

      {/* Tile 1 — Paid YTD */}
      <div className="border-t-[3px] border-t-accent p-5">
        <p className="text-caption font-semibold uppercase tracking-widest text-text-muted mb-3">
          Paid to Oweru (YTD)
        </p>
        <p className="text-[28px] font-serif leading-none text-text-primary tabular-nums">
          {s.paidYtdFormatted}
        </p>
        <p className="text-caption text-text-muted mt-2">
          Jan {new Date().getFullYear()} – present
        </p>
      </div>

      {/* Tile 2 — Pending */}
      <div className="border-t-[3px] border-t-state-error p-5">
        <p className="text-caption font-semibold uppercase tracking-widest text-text-muted mb-3">
          Pending Invoices
        </p>
        <p className="text-[28px] font-serif leading-none text-text-primary tabular-nums">
          {String(s.pendingCount).padStart(2, '0')}
          <span className="text-body font-normal text-text-muted ml-2">
            invoice{s.pendingCount === 1 ? '' : 's'}
          </span>
        </p>
        <p className="text-body-sm font-semibold text-state-error tabular-nums mt-2">
          {s.pendingFormatted} outstanding
        </p>
        {s.nextDueFormatted && (
          <p className="text-caption text-text-muted italic mt-1">
            Next due: {s.nextDueFormatted}
          </p>
        )}
      </div>

      {/* Tile 3 — Utility YTD */}
      <div className="border-t-[3px] border-t-state-success p-5">
        <p className="text-caption font-semibold uppercase tracking-widest text-text-muted mb-3">
          Utility Expenses (YTD)
        </p>
        <p className="text-[28px] font-serif leading-none text-text-primary tabular-nums">
          {s.utilityYtdFormatted}
        </p>
        <p className="text-caption text-text-muted mt-2">
          Tracked separately from Oweru services
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
pnpm tsc --noEmit 2>&1 | grep "OwnerFinancialsSummary"
```

Expected: no errors referencing this file.

- [ ] **Step 3: Commit**

```bash
git add src/features/financials/components/OwnerFinancialsSummary.tsx
git commit -m "feat(financials): connected KPI strip with accent bars"
```

---

## Task 3: OwnerInvoicesClient — client filter + table

**Files:**
- Create: `src/features/financials/components/OwnerInvoicesClient.tsx`
- Create: `src/features/financials/components/OwnerInvoicesClient.test.tsx`

- [ ] **Step 1: Write failing tests**

```tsx
// src/features/financials/components/OwnerInvoicesClient.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OwnerInvoicesClient } from './OwnerInvoicesClient';
import type { OwnerInvoiceDisplay } from '../services';

const makeRow = (overrides: Partial<OwnerInvoiceDisplay>): OwnerInvoiceDisplay => ({
  id: 'id-1',
  shortRef: 'INV-ABC123',
  propertyName: 'Msasani Villa',
  serviceTypeName: 'Cleaning',
  amountFormatted: 'TZS 420,000.00',
  status: 'PAID',
  dateFormatted: '12 May 2026',
  attempts: 0,
  ...overrides,
});

const rows: OwnerInvoiceDisplay[] = [
  makeRow({ id: '1', shortRef: 'INV-111', status: 'PAID' }),
  makeRow({ id: '2', shortRef: 'INV-222', status: 'PENDING' }),
  makeRow({ id: '3', shortRef: 'INV-333', status: 'OVERDUE' }),
  makeRow({ id: '4', shortRef: 'INV-444', status: 'FAILED' }),
  makeRow({ id: '5', shortRef: 'INV-555', status: 'CANCELLED' }),
];

describe('OwnerInvoicesClient', () => {
  it('renders all rows under All filter by default', () => {
    render(<OwnerInvoicesClient rows={rows} />);
    expect(screen.getByText('INV-111')).toBeInTheDocument();
    expect(screen.getByText('INV-555')).toBeInTheDocument();
  });

  it('filters to PENDING only when Pending pill clicked', () => {
    render(<OwnerInvoicesClient rows={rows} />);
    fireEvent.click(screen.getByRole('button', { name: 'Pending' }));
    expect(screen.getByText('INV-222')).toBeInTheDocument();
    expect(screen.queryByText('INV-111')).not.toBeInTheDocument();
    expect(screen.queryByText('INV-555')).not.toBeInTheDocument();
  });

  it('filters to OVERDUE only when Overdue pill clicked', () => {
    render(<OwnerInvoicesClient rows={rows} />);
    fireEvent.click(screen.getByRole('button', { name: 'Overdue' }));
    expect(screen.getByText('INV-333')).toBeInTheDocument();
    expect(screen.queryByText('INV-222')).not.toBeInTheDocument();
  });

  it('filters to FAILED only when Failed pill clicked', () => {
    render(<OwnerInvoicesClient rows={rows} />);
    fireEvent.click(screen.getByRole('button', { name: 'Failed' }));
    expect(screen.getByText('INV-444')).toBeInTheDocument();
    expect(screen.queryByText('INV-111')).not.toBeInTheDocument();
  });

  it('CANCELLED row visible under All but not under Paid', () => {
    render(<OwnerInvoicesClient rows={rows} />);
    expect(screen.getByText('INV-555')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Paid' }));
    expect(screen.queryByText('INV-555')).not.toBeInTheDocument();
    expect(screen.getByText('INV-111')).toBeInTheDocument();
  });

  it('shows Pay via Selcom button for PENDING rows', () => {
    render(<OwnerInvoicesClient rows={[makeRow({ id: '1', status: 'PENDING' })]} />);
    expect(screen.getByRole('button', { name: 'Pay via Selcom' })).toBeInTheDocument();
  });

  it('shows Pay via Selcom button for OVERDUE rows', () => {
    render(<OwnerInvoicesClient rows={[makeRow({ id: '1', status: 'OVERDUE' })]} />);
    expect(screen.getByRole('button', { name: 'Pay via Selcom' })).toBeInTheDocument();
  });

  it('shows Pay via Selcom button for FAILED rows', () => {
    render(<OwnerInvoicesClient rows={[makeRow({ id: '1', status: 'FAILED' })]} />);
    expect(screen.getByRole('button', { name: 'Pay via Selcom' })).toBeInTheDocument();
  });

  it('shows Receipt link for PAID rows', () => {
    render(<OwnerInvoicesClient rows={[makeRow({ id: '1', status: 'PAID' })]} />);
    expect(screen.getByRole('link', { name: /receipt/i })).toBeInTheDocument();
  });

  it('shows empty state message when no rows match filter', () => {
    render(<OwnerInvoicesClient rows={[makeRow({ status: 'PAID' })]} />);
    fireEvent.click(screen.getByRole('button', { name: 'Pending' }));
    expect(screen.getByText('No invoices match this filter.')).toBeInTheDocument();
  });

  it('shows attempts count for non-PAID rows with attempts > 0', () => {
    render(<OwnerInvoicesClient rows={[makeRow({ status: 'FAILED', attempts: 2 })]} />);
    expect(screen.getByText('2/3')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run to confirm failure**

```bash
pnpm test:run OwnerInvoicesClient
```

Expected: FAIL — component not found.

- [ ] **Step 3: Create OwnerInvoicesClient**

```tsx
// src/features/financials/components/OwnerInvoicesClient.tsx
'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';
import type { OwnerInvoiceDisplay } from '../services';

type FilterValue = 'ALL' | 'PENDING' | 'OVERDUE' | 'FAILED' | 'PAID';

const FILTERS: { label: string; value: FilterValue }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Overdue', value: 'OVERDUE' },
  { label: 'Failed', value: 'FAILED' },
  { label: 'Paid', value: 'PAID' },
];

const STATUS_BADGE: Record<
  OwnerInvoiceDisplay['status'],
  { label: string; bg: string; fg: string }
> = {
  PAID:      { label: 'Paid',      bg: 'bg-state-success-bg', fg: 'text-state-success' },
  PENDING:   { label: 'Pending',   bg: 'bg-state-warning-bg', fg: 'text-state-warning' },
  OVERDUE:   { label: 'Overdue',   bg: 'bg-state-error-bg',   fg: 'text-state-error' },
  FAILED:    { label: 'Failed',    bg: 'bg-state-error-bg',   fg: 'text-state-error' },
  CANCELLED: { label: 'Cancelled', bg: 'bg-surface-overlay',  fg: 'text-text-muted' },
};

interface Props {
  rows: OwnerInvoiceDisplay[];
}

export function OwnerInvoicesClient({ rows }: Props) {
  const [activeFilter, setActiveFilter] = useState<FilterValue>('ALL');

  const filtered =
    activeFilter === 'ALL' ? rows : rows.filter((r) => r.status === activeFilter);

  return (
    <div className="bg-surface-card border border-border-subtle rounded-lg overflow-hidden shadow-card">
      {/* Header + filter pills */}
      <div className="px-5 py-3 border-b border-border-subtle flex items-center justify-between gap-4 flex-wrap">
        <h3 className="text-h4 font-semibold text-text-primary">
          Invoices &amp; Payment History
        </h3>
        <div className="flex items-center gap-2 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setActiveFilter(f.value)}
              className={
                activeFilter === f.value
                  ? 'px-3 py-1 rounded-full text-caption font-semibold bg-primary text-white'
                  : 'px-3 py-1 rounded-full text-caption font-semibold border border-border-default text-text-muted hover:bg-surface-overlay transition-colors'
              }
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center">
          <p className="text-body-sm text-text-muted">No invoices match this filter.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-body-sm">
            <thead>
              <tr className="bg-surface-page">
                {['Reference', 'Property · Service', 'Date', 'Amount', 'Status', 'Action'].map(
                  (col, i) => (
                    <th
                      key={col}
                      className={`px-4 py-2.5 text-caption font-semibold uppercase tracking-widest text-text-muted border-b border-border-subtle ${
                        i >= 3 ? 'text-right' : 'text-left'
                      } ${i === 4 ? 'text-left' : ''}`}
                    >
                      {col}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const badge = STATUS_BADGE[r.status];
                const payable =
                  r.status === 'PENDING' ||
                  r.status === 'OVERDUE' ||
                  r.status === 'FAILED';
                return (
                  <tr
                    key={r.id}
                    className="hover:bg-surface-overlay transition-colors border-b border-border-subtle last:border-b-0"
                  >
                    <td className="px-4 py-3 font-mono text-body-sm font-semibold text-text-primary">
                      {r.shortRef}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-text-primary">{r.propertyName}</div>
                      <div className="text-caption text-text-muted">{r.serviceTypeName}</div>
                    </td>
                    <td className="px-4 py-3 text-text-muted">{r.dateFormatted}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-semibold text-text-primary">
                      {r.amountFormatted}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-caption font-semibold ${badge.bg} ${badge.fg}`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                        {badge.label}
                      </span>
                      {r.attempts > 0 && r.status !== 'PAID' && (
                        <span className="ml-2 text-[10px] text-text-muted">{r.attempts}/3</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {payable ? (
                        <button
                          type="button"
                          className="px-3 py-1 bg-accent text-accent-foreground rounded text-caption font-semibold hover:bg-accent-dark transition-colors"
                        >
                          Pay via Selcom
                        </button>
                      ) : (
                        <a
                          href={`/api/invoices/${r.id}/receipt`}
                          aria-label="Download receipt"
                          className="inline-flex items-center gap-1 text-caption text-text-muted hover:text-text-primary transition-colors"
                        >
                          <Download size={14} />
                          Receipt
                        </a>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run tests to confirm pass**

```bash
pnpm test:run OwnerInvoicesClient
```

Expected: 11 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/features/financials/components/OwnerInvoicesClient.tsx src/features/financials/components/OwnerInvoicesClient.test.tsx
git commit -m "feat(financials): client invoice table with status filter pills"
```

---

## Task 4: OwnerInvoicesTable — slim to server fetcher

**Files:**
- Rewrite: `src/features/financials/components/OwnerInvoicesTable.tsx`

- [ ] **Step 1: Rewrite OwnerInvoicesTable**

```tsx
// src/features/financials/components/OwnerInvoicesTable.tsx
import { getOwnerInvoicesList } from '../services';
import { OwnerInvoicesClient } from './OwnerInvoicesClient';

interface Props {
  ownerUserId: string;
}

export async function OwnerInvoicesTable({ ownerUserId }: Props) {
  const rows = await getOwnerInvoicesList(ownerUserId);
  return <OwnerInvoicesClient rows={rows} />;
}
```

- [ ] **Step 2: Type-check**

```bash
pnpm tsc --noEmit 2>&1 | grep "OwnerInvoicesTable\|OwnerInvoicesClient"
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/features/financials/components/OwnerInvoicesTable.tsx
git commit -m "refactor(financials): OwnerInvoicesTable delegates render to OwnerInvoicesClient"
```

---

## Task 5: Financials skeletons — match new layout

**Files:**
- Rewrite: `src/features/financials/components/skeletons.tsx`

- [ ] **Step 1: Rewrite skeletons**

```tsx
// src/features/financials/components/skeletons.tsx
export function FinancialsSummarySkeleton() {
  return (
    <div className="border border-border-subtle rounded-lg overflow-hidden bg-surface-card shadow-card mb-6 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border-subtle">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="p-5 h-24 animate-pulse bg-surface-overlay" />
      ))}
    </div>
  );
}

export function InvoicesTableSkeleton() {
  return (
    <div className="bg-surface-card border border-border-subtle rounded-lg overflow-hidden shadow-card">
      <div className="px-5 py-3 border-b border-border-subtle h-14 animate-pulse bg-surface-overlay" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="h-14 border-b border-border-subtle last:border-b-0 animate-pulse bg-surface-overlay/50"
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/financials/components/skeletons.tsx
git commit -m "fix(financials): update skeletons to match new layout shapes"
```

---

## Task 6: Financials page — pass `serif`

**Files:**
- Modify: `src/app/(dashboard)/owner/financials/page.tsx`

- [ ] **Step 1: Add `serif` to DashboardHeader call**

```tsx
// src/app/(dashboard)/owner/financials/page.tsx
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/core/auth';
import RoleGuard from '@/components/RoleGuard';
import { DashboardHeader } from '@/shared/components/dashboard/DashboardHeader';
import { OwnerFinancialsSummary } from '@/features/financials/components/OwnerFinancialsSummary';
import { OwnerInvoicesTable } from '@/features/financials/components/OwnerInvoicesTable';
import {
  FinancialsSummarySkeleton,
  InvoicesTableSkeleton,
} from '@/features/financials/components/skeletons';

export const dynamic = 'force-dynamic';

export default async function OwnerFinancialsPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  if (session.user.role !== 'OWNER') redirect('/login');

  const ownerUserId = session.user.id;

  return (
    <RoleGuard allowedRoles={['OWNER']}>
      <DashboardHeader
        serif
        title="Financials"
        subtitle="Invoices, payments to Oweru, and utility expenses across your portfolio."
      />

      <Suspense fallback={<FinancialsSummarySkeleton />}>
        <OwnerFinancialsSummary ownerUserId={ownerUserId} />
      </Suspense>

      <Suspense fallback={<InvoicesTableSkeleton />}>
        <OwnerInvoicesTable ownerUserId={ownerUserId} />
      </Suspense>
    </RoleGuard>
  );
}
```

- [ ] **Step 2: Run full test suite to confirm no regressions**

```bash
pnpm test:run
```

Expected: same baseline pass/fail count as before (11 pre-existing failures unchanged, new tests pass).

- [ ] **Step 3: Commit**

```bash
git add src/app/(dashboard)/owner/financials/page.tsx
git commit -m "feat(financials): serif page title, wire redesigned components"
```

---

## Task 7: MonthlySpendChart — y-axis, grid lines, token fix

**Files:**
- Rewrite: `src/features/owner-reports/components/MonthlySpendChart.tsx`

- [ ] **Step 1: Rewrite MonthlySpendChart**

```tsx
// src/features/owner-reports/components/MonthlySpendChart.tsx
import Decimal from 'decimal.js';
import { cn } from '@/lib/cn';
import { getMonthlySpend, type MonthlySpend } from '../services';

interface Props {
  ownerUserId: string;
}

function formatTzs(amount: Decimal): string {
  return `TZS ${amount.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

function abbreviate(amount: Decimal): string {
  const n = amount.toNumber();
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}k`;
  return String(Math.round(n));
}

const GRID_LEVELS = [0.75, 0.5, 0.25] as const;

export async function MonthlySpendChart({ ownerUserId }: Props) {
  const data: MonthlySpend[] = await getMonthlySpend(ownerUserId);
  const max = data.reduce(
    (m, d) => (d.amount.gt(m) ? d.amount : m),
    new Decimal(0),
  );
  const total = data.reduce((acc, d) => acc.plus(d.amount), new Decimal(0));

  return (
    <div className="bg-surface-card border border-border-subtle rounded-lg shadow-card p-5 h-full">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-h4 font-semibold text-text-primary">Monthly Spend</h3>
          <p className="text-caption text-text-muted">Paid to Oweru · last 6 months</p>
        </div>
        <span className="text-caption text-text-muted tabular-nums">
          6 mo total: {formatTzs(total)}
        </span>
      </div>

      {max.isZero() ? (
        <div className="h-48 flex items-center justify-center text-body-sm text-text-muted">
          No paid invoices in this window.
        </div>
      ) : (
        <div className="flex gap-2 h-48">
          {/* Y-axis labels */}
          <div className="w-10 shrink-0 flex flex-col justify-between pb-5 text-right">
            {GRID_LEVELS.map((lvl) => (
              <span key={lvl} className="text-[10px] text-text-muted tabular-nums">
                {abbreviate(max.mul(lvl))}
              </span>
            ))}
            <span className="text-[10px] text-text-muted tabular-nums">0</span>
          </div>

          {/* Chart area */}
          <div className="flex-1 relative">
            {/* Horizontal grid lines */}
            <div className="absolute inset-0 pb-5 flex flex-col justify-between pointer-events-none">
              {GRID_LEVELS.map((lvl) => (
                <div key={lvl} className="border-t border-dashed border-border-subtle" />
              ))}
              <div className="border-t border-border-subtle" />
            </div>

            {/* Bars */}
            <div className="absolute inset-0 pb-5 flex items-end gap-2 px-1">
              {data.map((d, i) => {
                const heightPct = Number(d.amount.div(max).mul(100).toFixed(0));
                const isCurrent = i === data.length - 1;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-medium text-text-primary tabular-nums">
                      {d.amountFormatted}
                    </span>
                    <div
                      className={cn(
                        'w-full bg-accent rounded-t-sm transition-all',
                        isCurrent ? 'opacity-100' : 'opacity-70',
                      )}
                      style={{ height: `${heightPct}%`, minHeight: heightPct > 0 ? '4px' : '0' }}
                      title={`${d.monthLabel}: ${d.amountFormatted}`}
                    />
                  </div>
                );
              })}
            </div>

            {/* X-axis labels */}
            <div className="absolute bottom-0 left-0 right-0 flex px-1">
              {data.map((d, i) => (
                <span
                  key={i}
                  className="flex-1 text-center text-[10px] font-medium text-text-muted uppercase tracking-wider"
                >
                  {d.monthLabel}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
pnpm tsc --noEmit 2>&1 | grep "MonthlySpendChart"
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/features/owner-reports/components/MonthlySpendChart.tsx
git commit -m "feat(reports): add y-axis labels and grid lines to monthly spend chart"
```

---

## Task 8: ServiceMixChart — layout + token fix

**Files:**
- Rewrite: `src/features/owner-reports/components/ServiceMixChart.tsx`

- [ ] **Step 1: Rewrite ServiceMixChart**

```tsx
// src/features/owner-reports/components/ServiceMixChart.tsx
import { getServiceMix } from '../services';

interface Props {
  ownerUserId: string;
}

export async function ServiceMixChart({ ownerUserId }: Props) {
  const mix = await getServiceMix(ownerUserId);

  return (
    <div className="bg-surface-card border border-border-subtle rounded-lg shadow-card p-5 h-full">
      <div className="mb-4">
        <h3 className="text-h4 font-semibold text-text-primary">Service Mix</h3>
        <p className="text-caption text-text-muted">Share of total spend by service type</p>
      </div>

      {mix.length === 0 ? (
        <div className="flex items-center justify-center text-body-sm text-text-muted py-8">
          No spend data yet.
        </div>
      ) : (
        <div className="space-y-4">
          {mix.map((m) => (
            <div key={m.serviceTypeName}>
              <div className="flex justify-between items-baseline mb-1.5">
                <span className="text-body-sm font-medium text-text-primary">
                  {m.serviceTypeName}
                </span>
                <div className="text-right">
                  <span className="text-body-sm font-semibold tabular-nums text-text-primary">
                    {m.amountFormatted}
                  </span>
                  <span className="text-caption text-text-muted ml-1">{m.pct}%</span>
                </div>
              </div>
              <div className="h-1.5 bg-surface-overlay rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${m.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/owner-reports/components/ServiceMixChart.tsx
git commit -m "fix(reports): ServiceMixChart token fix and layout polish"
```

---

## Task 9: PropertyCostTable — card wrapper, section divider, token fix

**Files:**
- Rewrite: `src/features/owner-reports/components/PropertyCostTable.tsx`

- [ ] **Step 1: Rewrite PropertyCostTable**

```tsx
// src/features/owner-reports/components/PropertyCostTable.tsx
import Link from 'next/link';
import { getPropertyCostBreakdown } from '../services';

interface Props {
  ownerUserId: string;
}

export async function PropertyCostTable({ ownerUserId }: Props) {
  const rows = await getPropertyCostBreakdown(ownerUserId);

  return (
    <>
      {/* Section divider */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-caption font-semibold uppercase tracking-widest text-text-muted whitespace-nowrap">
          Per-Property Cost Breakdown
        </span>
        <hr className="flex-1 border-border-subtle" />
      </div>

      {rows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border-subtle bg-surface-card p-12 text-center">
          <p className="text-body-sm text-text-muted">No spending data yet.</p>
        </div>
      ) : (
        <div className="bg-surface-card border border-border-subtle rounded-lg overflow-hidden shadow-card">
          <div className="px-5 py-3 border-b border-border-subtle flex justify-between items-center">
            <h3 className="text-h4 font-semibold text-text-primary">Per-Property Costs (YTD)</h3>
            <span className="text-caption text-text-muted">
              {rows.length} {rows.length === 1 ? 'property' : 'properties'}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-body-sm">
              <thead>
                <tr className="bg-surface-page">
                  {[
                    { label: 'Property',      align: 'left' },
                    { label: 'Zone',          align: 'left' },
                    { label: 'Services Paid', align: 'right' },
                    { label: 'Utilities',     align: 'right' },
                    { label: 'Total',         align: 'right' },
                    { label: 'Count',         align: 'right' },
                  ].map(({ label, align }) => (
                    <th
                      key={label}
                      className={`px-4 py-2.5 text-${align} text-caption font-semibold uppercase tracking-widest text-text-muted border-b border-border-subtle`}
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr
                    key={r.propertyId}
                    className="hover:bg-surface-overlay transition-colors border-b border-border-subtle last:border-b-0"
                  >
                    <td className="px-4 py-3 font-semibold">
                      <Link
                        href={`/owner/properties/${r.propertyId}`}
                        className="text-text-primary hover:text-accent transition-colors"
                      >
                        {r.propertyName}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-text-muted">{r.zone}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-text-secondary">
                      {r.servicesYtdFormatted}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-text-muted">
                      {r.utilityYtdFormatted}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums font-semibold text-text-primary">
                      {r.totalYtdFormatted}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-text-muted">
                      {r.serviceCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/owner-reports/components/PropertyCostTable.tsx
git commit -m "feat(reports): PropertyCostTable card wrapper, section divider, token fix"
```

---

## Task 10: Reports page + reports skeletons

**Files:**
- Rewrite: `src/app/(dashboard)/owner/reports/page.tsx`
- Rewrite: `src/features/owner-reports/components/skeletons.tsx`

- [ ] **Step 1: Rewrite reports skeletons**

```tsx
// src/features/owner-reports/components/skeletons.tsx
export function MonthlySpendSkeleton() {
  return (
    <div className="bg-surface-card border border-border-subtle rounded-lg shadow-card p-5 h-72 animate-pulse" />
  );
}

export function ServiceMixSkeleton() {
  return (
    <div className="bg-surface-card border border-border-subtle rounded-lg shadow-card p-5 h-72 animate-pulse" />
  );
}

export function PropertyCostSkeleton() {
  return (
    <div className="bg-surface-card border border-border-subtle rounded-lg shadow-card overflow-hidden">
      <div className="h-12 border-b border-border-subtle bg-surface-overlay animate-pulse" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="h-12 border-b border-border-subtle last:border-b-0 animate-pulse bg-surface-overlay/50"
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Rewrite reports page**

```tsx
// src/app/(dashboard)/owner/reports/page.tsx
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { Download } from 'lucide-react';
import { auth } from '@/core/auth';
import RoleGuard from '@/components/RoleGuard';
import { MonthlySpendChart } from '@/features/owner-reports/components/MonthlySpendChart';
import { ServiceMixChart } from '@/features/owner-reports/components/ServiceMixChart';
import { PropertyCostTable } from '@/features/owner-reports/components/PropertyCostTable';
import {
  MonthlySpendSkeleton,
  ServiceMixSkeleton,
  PropertyCostSkeleton,
} from '@/features/owner-reports/components/skeletons';

export const dynamic = 'force-dynamic';

export default async function OwnerReportsPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  if (session.user.role !== 'OWNER') redirect('/login');

  const ownerUserId = session.user.id;

  return (
    <RoleGuard allowedRoles={['OWNER']}>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <h1 className="font-serif text-h2 text-text-primary tracking-tight">Reports</h1>
          <button
            type="button"
            className="flex items-center gap-1.5 px-4 py-2 bg-accent text-accent-foreground rounded-md text-body-sm font-semibold hover:bg-accent-dark transition-colors"
          >
            <Download size={16} /> Export Report
          </button>
        </div>
        <p className="text-body-sm text-text-secondary mt-1">
          Spending paid to Oweru, utility expenses, and per-property cost breakdown.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="lg:col-span-2">
          <Suspense fallback={<MonthlySpendSkeleton />}>
            <MonthlySpendChart ownerUserId={ownerUserId} />
          </Suspense>
        </div>
        <Suspense fallback={<ServiceMixSkeleton />}>
          <ServiceMixChart ownerUserId={ownerUserId} />
        </Suspense>
      </div>

      <Suspense fallback={<PropertyCostSkeleton />}>
        <PropertyCostTable ownerUserId={ownerUserId} />
      </Suspense>
    </RoleGuard>
  );
}
```

- [ ] **Step 3: Type-check**

```bash
pnpm tsc --noEmit 2>&1 | grep "reports"
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/(dashboard)/owner/reports/page.tsx src/features/owner-reports/components/skeletons.tsx
git commit -m "feat(reports): serif inline header, fix skeletons tokens"
```

---

## Task 11: ServiceCatalogGrid — card sizing + token fix

**Files:**
- Rewrite: `src/features/service-catalog/components/ServiceCatalogGrid.tsx`
- Modify: `src/features/service-catalog/components/skeletons.tsx`

- [ ] **Step 1: Rewrite ServiceCatalogGrid**

```tsx
// src/features/service-catalog/components/ServiceCatalogGrid.tsx
import Link from 'next/link';
import {
  Brush, Wrench, Zap, Shield, Trees, Hammer, Box,
  type LucideIcon,
} from 'lucide-react';
import { getActiveCatalog } from '../services';

function pickIcon(name: string): LucideIcon {
  const n = name.toLowerCase();
  if (n.includes('clean')) return Brush;
  if (n.includes('plumb')) return Wrench;
  if (n.includes('electric') || n.includes('hvac') || n.includes('air')) return Zap;
  if (n.includes('security') || n.includes('guard')) return Shield;
  if (n.includes('garden') || n.includes('landscap') || n.includes('lawn')) return Trees;
  if (n.includes('repair') || n.includes('maintenance')) return Hammer;
  return Box;
}

export async function ServiceCatalogGrid() {
  const catalog = await getActiveCatalog();

  if (catalog.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border-subtle bg-surface-card p-12 text-center">
        <p className="text-body-sm text-text-muted">Catalog is empty. Check back soon.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {catalog.map((entry) => {
        const Icon = pickIcon(entry.name);
        return (
          <div
            key={entry.id}
            className="bg-surface-card border border-border-subtle rounded-lg p-5 flex flex-col gap-3 hover:border-accent transition-colors shadow-card"
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-lg bg-primary/8 flex items-center justify-center">
                <Icon size={20} className="text-text-primary" />
              </div>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-caption font-semibold bg-state-success-bg text-state-success">
                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                Available
              </span>
            </div>

            <div>
              <h3 className="text-h4 font-semibold text-text-primary mb-1">{entry.name}</h3>
              <p className="text-body-sm text-text-secondary line-clamp-2 leading-snug">
                {entry.description}
              </p>
            </div>

            <div className="mt-auto pt-3 border-t border-border-subtle flex items-end justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
                  From
                </p>
                <p className="text-body font-semibold tabular-nums text-text-primary">
                  {entry.basePriceFormatted}
                </p>
                <p className="text-caption text-text-muted">{entry.priceUnitLabel}</p>
              </div>
              <Link
                href={`/owner/services/new?serviceTypeId=${entry.id}`}
                className="px-3 py-1.5 bg-primary text-white rounded text-caption font-semibold hover:bg-primary-light transition-colors"
              >
                Get Quote
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Fix catalog skeleton tokens**

```tsx
// src/features/service-catalog/components/skeletons.tsx
export function ServiceCatalogSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="bg-surface-card border border-border-subtle rounded-lg p-5 h-44 animate-pulse shadow-card"
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/features/service-catalog/components/ServiceCatalogGrid.tsx src/features/service-catalog/components/skeletons.tsx
git commit -m "feat(catalog): card sizing, dot badge, token fixes"
```

---

## Task 12: Service catalog page — serif + section divider

**Files:**
- Modify: `src/app/(dashboard)/owner/service-catalog/page.tsx`

- [ ] **Step 1: Update service catalog page**

```tsx
// src/app/(dashboard)/owner/service-catalog/page.tsx
import { Suspense } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { auth } from '@/core/auth';
import RoleGuard from '@/components/RoleGuard';
import { DashboardHeader } from '@/shared/components/dashboard/DashboardHeader';
import { ServiceCatalogGrid } from '@/features/service-catalog/components/ServiceCatalogGrid';
import { ServiceCatalogSkeleton } from '@/features/service-catalog/components/skeletons';

export const dynamic = 'force-dynamic';

export default async function OwnerServiceCatalogPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  if (session.user.role !== 'OWNER') redirect('/login');

  return (
    <RoleGuard allowedRoles={['OWNER']}>
      <DashboardHeader
        serif
        title="Service Catalog"
        subtitle="Browse the services Oweru delivers. Pricing is rule-based; you lock a quote for 24 hours when you request."
      />

      <div className="bg-primary text-white rounded-lg p-4 mb-6 flex items-center gap-4">
        <Sparkles size={24} className="text-accent shrink-0" />
        <div className="flex-1">
          <p className="font-semibold mb-0.5">Single point of contact</p>
          <p className="text-body-sm text-white/60">
            Every service in this catalog is delivered by Oweru. You contract with Oweru only — we
            handle assignment, payment, and dispute resolution end to end.
          </p>
        </div>
        <Link
          href="/owner/services/new"
          className="px-4 py-2 bg-accent text-accent-foreground rounded-md text-body-sm font-semibold hover:bg-accent-dark transition-colors shrink-0"
        >
          Request Service
        </Link>
      </div>

      {/* Section divider */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-caption font-semibold uppercase tracking-widest text-text-muted whitespace-nowrap">
          Available Services
        </span>
        <hr className="flex-1 border-border-subtle" />
      </div>

      <Suspense fallback={<ServiceCatalogSkeleton />}>
        <ServiceCatalogGrid />
      </Suspense>
    </RoleGuard>
  );
}
```

- [ ] **Step 2: Run full test suite**

```bash
pnpm test:run
```

Expected: same baseline pass/fail count — no new failures.

- [ ] **Step 3: Type-check all changed files**

```bash
pnpm tsc --noEmit
```

Expected: 0 new errors (pre-existing vitest globals gap is known, not a new error).

- [ ] **Step 4: Commit**

```bash
git add src/app/(dashboard)/owner/service-catalog/page.tsx
git commit -m "feat(catalog): serif title, section divider, promo banner token fix"
```
