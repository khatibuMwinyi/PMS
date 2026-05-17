# Provider Section P0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire the existing provider backend (assignments, tasks, wallet, payouts, location verification, evidence) to a production-grade UI by rebuilding four routes (`/provider`, `/provider/tasks/[id]`, `/provider/wallet`) and adding payout + GPS check-in + proof-of-work modals, matching the eight HTML mockups in `public/Service Provider pages/` while reusing the existing CSS-variable token system from the owner dashboard.

**Architecture:** Next.js 16 App Router + Server Components + Suspense. Vertical slice in `src/features/dashboard/components/provider/` for dashboard widgets, `src/features/wallets/components/` for payout modals, `src/features/tasks/components/` for execution UI. New queries in `features/{tasks,wallets,assignments,dashboard}/queries.ts` keep PII isolation enforced at repository `select` clauses. Decimal.js for all currency arithmetic, formatted as TZS at UI edge only. Image evidence stored as base64 data URLs in `Task.evidenceImages` (stopgap, see Conventions).

**Tech Stack:** Next.js 16 (App Router), TypeScript 5.6, React 19, Prisma 5.20, Decimal.js 10, Zod 3, Vitest 4 (jsdom + globals), Playwright 1.59, Tailwind, Lucide icons, Sonner toasts.

**Spec:** [Full.md](../../../Full.md) §X–§XVII + isolation §XXI. Designs: [public/Service Provider pages/](../../../public/Service Provider pages/) (8 mockups + `operational_excellence/DESIGN.md`).

---

## Conventions used throughout this plan

- `cn` utility import path: `@/lib/cn` (NOT `@/core/lib/utils`).
- Prisma: `import { prisma } from '@/core/database/client'`. Auto-decrypts `User.phone` + `Property.encryptedAddress`. **Provider-scoped repos must NEVER select those fields** — privacy §XXI.
- Auth: `import { auth } from '@/core/auth'`. Returns `{ user: { id, role, status, name?, email? } } | null`.
- Decimal: `import Decimal from 'decimal.js'`. Convert Prisma Decimal via `new Decimal(prismaDecimal.toString())`.
- Currency formatter: NEW shared util `@/shared/lib/currency.ts` (Task 1). All TZS rendering goes through it.
- Test runner: `pnpm test:run` (CI) or `pnpm test -- <pattern>` (watch). Vitest globals on — no imports for `describe`/`it`/`expect`/`vi`.
- Client components use `'use client'` directive; server components use `async function`.
- Tailwind: CSS-variable tokens (`bg-[var(--surface-card)]`, `text-[var(--text-primary)]`). The mockup HTML uses `bg-surface-container-lowest` Tailwind tokens — these DO exist in globals.css (Task 1.1 verifies); the project's owner pages translate them to var-based tokens. Apply token map from § "Token map" below.
- Image storage: encode evidence files as base64 in client, stash full string in `Task.evidenceImages String[]`. Stopgap until Vercel Blob lands. Add `MAX_EVIDENCE_BYTES = 2_000_000` per image to bound DB growth.
- Toasts: `import { toast } from 'sonner'`. Provider already wired in root layout (assumed; verify Task 1).
- Commits: Conventional Commits (`feat(provider-p0): ...`, `test(provider-p0): ...`). Include `Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>`.
- Currency in spec is TZS. Convert all `$` mockup values to TZS in new pages.

### Token map (mockup → project var)

| Mockup class | Project replacement |
|---|---|
| `bg-surface-container-lowest` / `bg-surface` | `bg-[var(--surface-card)]` |
| `bg-surface-container-low` | `bg-[var(--surface-page)]` |
| `bg-surface-container-high` | `bg-[var(--surface-overlay)]` |
| `border-outline-variant` / `border-surface-variant` | `border-[var(--border-subtle)]` |
| `text-on-surface-variant` | `text-[var(--text-secondary)]` |
| `text-on-surface` | `text-[var(--text-primary)]` |
| `text-primary` (mockup #131b2e) | `text-[var(--text-primary)]` (already #131b2e) |
| `bg-primary text-on-primary` (primary CTA) | `bg-[var(--brand-gold)] text-[var(--brand-primary)]` (owner CTA pattern) |
| `bg-secondary-container text-on-secondary-container` (badge) | `bg-[var(--surface-overlay)] text-[var(--text-secondary)]` |
| `bg-error-container text-error` | `bg-[var(--state-error-bg)] text-[var(--state-error)]` |
| `font-h1 text-h1` / `font-h2 text-h2` / `font-label text-label` / `text-body-sm` / `text-body-md` | already in globals — keep as-is |
| `material-symbols-outlined` icons | swap for Lucide equivalents (already used project-wide) |

---

## File Map

### Created

- `src/shared/lib/currency.ts` — `formatTZS(n: number | Decimal): string`
- `src/shared/lib/currency.test.ts`
- `src/features/dashboard/components/provider/ProviderKpiBento.tsx`
- `src/features/dashboard/components/provider/NextUpcomingAssignmentCard.tsx`
- `src/features/dashboard/components/provider/ActivePipelineTable.tsx`
- `src/features/dashboard/components/provider/TodayProgressTimeline.tsx`
- `src/features/dashboard/components/provider/QuickActionsPanel.tsx`
- `src/features/dashboard/components/provider/skeletons.tsx`
- `src/features/dashboard/queries/provider.ts` — `getProviderDashboard(providerId)` returning shape consumed by widgets
- `src/features/dashboard/schemas/provider-dashboard.schema.ts`
- `src/features/dashboard/tests/provider-dashboard.queries.test.ts`
- `src/features/dashboard/tests/provider-dashboard.components.test.tsx`
- `src/features/assignments/components/AssignmentStepTracker.tsx`
- `src/features/assignments/components/AssignmentStepTracker.test.tsx`
- `src/features/assignments/queries.detail.ts` — `getProviderAssignmentDetail(assignmentId, providerUserId)`
- `src/features/tasks/queries.ts` — `getProviderTaskDetail(taskId, providerUserId)`
- `src/features/tasks/components/GpsCheckInCard.tsx`
- `src/features/tasks/components/LocationVerificationModal.tsx`
- `src/features/tasks/components/ProofOfWorkUpload.tsx`
- `src/features/tasks/components/ProofOfWorkUpload.test.tsx`
- `src/features/tasks/schemas.ts` — Zod for evidence submission, check-in payload
- `src/features/tasks/tests/tasks.queries.test.ts`
- `src/features/wallets/components/RequestPayoutModal.tsx`
- `src/features/wallets/components/PayoutSuccessModal.tsx`
- `src/features/wallets/components/TransactionHistoryTable.tsx`
- `src/features/wallets/components/RequestPayoutModal.test.tsx`
- `src/features/wallets/schemas.ts` — Zod for withdrawal request
- `src/app/(dashboard)/provider/tasks/[id]/page.tsx`
- `tests/e2e/provider-task-execution.spec.ts`
- `tests/e2e/provider-payout.spec.ts`

### Modified

- `src/app/(dashboard)/provider/page.tsx` — full rewrite using new dashboard widgets
- `src/app/(dashboard)/provider/wallet/page.tsx` — full rewrite using new bento + table + payout modal
- `src/app/(dashboard)/provider/tasks/page.tsx` — replace `<ul>` with dense table linking to detail page
- `src/components/layout/Sidebar.tsx` — `NAV_ITEMS.PROVIDER` reordered: Dashboard / Assignments / Tasks / Wallet / Settings (stub) ; remove Earnings + Ratings standalone
- `src/features/wallets/types.ts` — add `WithdrawalSummary` interface + extend `WalletSummary` with `totalEarned`
- `src/features/wallets/queries.ts` — surface `totalEarned`, last 50 withdrawals
- `src/features/tasks/actions.ts` — add `MAX_EVIDENCE_BYTES` guard in `submitTaskEvidence`

### Deleted

- `src/app/(dashboard)/provider/earnings/page.tsx` (merged into wallet)
- `src/app/(dashboard)/provider/ratings/page.tsx` (deferred to P1; sidebar drops link)

---

## Task 1: Shared TZS currency formatter

**Files:**
- Create: `src/shared/lib/currency.ts`
- Create: `src/shared/lib/currency.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/shared/lib/currency.test.ts
import Decimal from 'decimal.js';
import { formatTZS, formatTZSShort } from './currency';

describe('formatTZS', () => {
  it('formats integer numbers with TZS prefix and thousand separators', () => {
    expect(formatTZS(50000)).toBe('TZS 50,000');
  });
  it('formats Decimal input', () => {
    expect(formatTZS(new Decimal('2450.5'))).toBe('TZS 2,450.50');
  });
  it('omits decimals when zero fractional', () => {
    expect(formatTZS(120000)).toBe('TZS 120,000');
  });
  it('shows two decimals when non-zero', () => {
    expect(formatTZS(120000.25)).toBe('TZS 120,000.25');
  });
  it('handles negative amounts', () => {
    expect(formatTZS(-50)).toBe('-TZS 50');
  });
});

describe('formatTZSShort', () => {
  it('returns k for thousands', () => {
    expect(formatTZSShort(50_000)).toBe('TZS 50k');
  });
  it('returns M for millions', () => {
    expect(formatTZSShort(2_450_000)).toBe('TZS 2.45M');
  });
  it('returns plain value below 1k', () => {
    expect(formatTZSShort(450)).toBe('TZS 450');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test:run src/shared/lib/currency.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement formatter**

```ts
// src/shared/lib/currency.ts
import Decimal from 'decimal.js';

type Amount = number | Decimal | string;

function toNumber(amount: Amount): number {
  if (typeof amount === 'number') return amount;
  if (typeof amount === 'string') return Number(amount);
  return amount.toNumber();
}

export function formatTZS(amount: Amount): string {
  const n = toNumber(amount);
  const abs = Math.abs(n);
  const hasFraction = abs % 1 !== 0;
  const formatted = abs.toLocaleString('en-US', {
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: 2,
  });
  return n < 0 ? `-TZS ${formatted}` : `TZS ${formatted}`;
}

export function formatTZSShort(amount: Amount): string {
  const n = toNumber(amount);
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `TZS ${(n / 1_000_000).toFixed(2).replace(/\.?0+$/, '')}M`;
  if (abs >= 1_000) return `TZS ${(n / 1_000).toFixed(0)}k`;
  return `TZS ${n.toLocaleString('en-US')}`;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test:run src/shared/lib/currency.test.ts`
Expected: PASS (8 tests).

- [ ] **Step 5: Verify Sonner toaster mounted**

Run: `grep -r "Toaster" src/app/layout.tsx src/app/`
Expected: at least one `<Toaster ... />` mount. If missing, add to `src/app/layout.tsx`:

```tsx
import { Toaster } from 'sonner';
// inside <body>:
<Toaster position="top-right" richColors />
```

- [ ] **Step 6: Verify `bg-surface-container-lowest` token exists or map applies**

Run: `grep -n "surface-container" src/app/globals.css tailwind.config.*`
Expected: vars exist (per audit), no Tailwind class — the Token Map in conventions converts mockup classes.

- [ ] **Step 7: Commit**

```bash
git add src/shared/lib/currency.ts src/shared/lib/currency.test.ts
git commit -m "feat(provider-p0): add TZS currency formatter

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 2: Sidebar P0 update

**Files:**
- Modify: `src/components/layout/Sidebar.tsx:48-53`

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/layout/Sidebar.test.tsx
import { render, screen } from '@testing-library/react';
import { Sidebar } from './Sidebar';

vi.mock('next/navigation', () => ({ usePathname: () => '/provider' }));

describe('Sidebar PROVIDER nav', () => {
  it('renders Dashboard, Assignments, Tasks, Wallet, Settings', () => {
    render(<Sidebar role="PROVIDER" />);
    for (const label of ['Dashboard', 'Assignments', 'Tasks', 'Wallet', 'Settings']) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });
  it('does not render Earnings or Ratings standalone', () => {
    render(<Sidebar role="PROVIDER" />);
    expect(screen.queryByText('Earnings')).not.toBeInTheDocument();
    expect(screen.queryByText('Ratings')).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run to verify fail**

Run: `pnpm test:run src/components/layout/Sidebar.test.tsx`
Expected: FAIL — Earnings/Ratings still present (old config).

- [ ] **Step 3: Update sidebar config**

Replace lines 48-53 of `src/components/layout/Sidebar.tsx`:

```ts
  PROVIDER: [
    { href: '/provider',            label: 'Dashboard',   icon: LayoutDashboard },
    { href: '/provider/assignments', label: 'Assignments', icon: ClipboardList },
    { href: '/provider/tasks',       label: 'Tasks',       icon: Wrench },
    { href: '/provider/wallet',      label: 'Wallet',      icon: BarChart3 },
    { href: '/provider/settings',    label: 'Settings',    icon: Bolt },
  ],
```

- [ ] **Step 4: Run to verify pass**

Run: `pnpm test:run src/components/layout/Sidebar.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/Sidebar.tsx src/components/layout/Sidebar.test.tsx
git commit -m "feat(provider-p0): rebuild provider sidebar nav

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 3: AssignmentStepTracker component

**Files:**
- Create: `src/features/assignments/components/AssignmentStepTracker.tsx`
- Create: `src/features/assignments/components/AssignmentStepTracker.test.tsx`

The mockup `task_execution_proof_of_work` shows a 4-step horizontal tracker: Assigned → On Site → In Progress → Review. Maps to AssignmentStatus values.

- [ ] **Step 1: Write the failing test**

```tsx
// src/features/assignments/components/AssignmentStepTracker.test.tsx
import { render, screen } from '@testing-library/react';
import { AssignmentStepTracker } from './AssignmentStepTracker';

describe('AssignmentStepTracker', () => {
  it('marks Assigned as completed and On Site as active when status=ACCEPTED', () => {
    render(<AssignmentStepTracker status="ACCEPTED" />);
    expect(screen.getByText('Assigned').closest('[data-state]')?.getAttribute('data-state')).toBe('completed');
    expect(screen.getByText('On Site').closest('[data-state]')?.getAttribute('data-state')).toBe('active');
    expect(screen.getByText('In Progress').closest('[data-state]')?.getAttribute('data-state')).toBe('pending');
  });
  it('marks In Progress as active when status=IN_PROGRESS', () => {
    render(<AssignmentStepTracker status="IN_PROGRESS" />);
    expect(screen.getByText('In Progress').closest('[data-state]')?.getAttribute('data-state')).toBe('active');
  });
  it('marks Review as completed when status=VERIFIED', () => {
    render(<AssignmentStepTracker status="VERIFIED" />);
    expect(screen.getByText('Review').closest('[data-state]')?.getAttribute('data-state')).toBe('completed');
  });
});
```

- [ ] **Step 2: Run to verify fail**

Run: `pnpm test:run src/features/assignments/components/AssignmentStepTracker.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement**

```tsx
// src/features/assignments/components/AssignmentStepTracker.tsx
import { Check } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { AssignmentStatus } from '../types';

type StepState = 'completed' | 'active' | 'pending';
type StepKey = 'ASSIGNED' | 'ON_SITE' | 'IN_PROGRESS' | 'REVIEW';

const STEP_ORDER: StepKey[] = ['ASSIGNED', 'ON_SITE', 'IN_PROGRESS', 'REVIEW'];
const STEP_LABEL: Record<StepKey, string> = {
  ASSIGNED:    'Assigned',
  ON_SITE:     'On Site',
  IN_PROGRESS: 'In Progress',
  REVIEW:      'Review',
};

function activeIndex(status: AssignmentStatus): number {
  switch (status) {
    case 'PENDING_ACCEPTANCE': return -1;
    case 'ACCEPTED':           return 1;
    case 'IN_PROGRESS':        return 2;
    case 'COMPLETED':          return 3;
    case 'DISPUTED':           return 3;
    case 'VERIFIED':           return 4; // all done
    default:                   return -1;
  }
}

export function AssignmentStepTracker({ status }: { status: AssignmentStatus }) {
  const cur = activeIndex(status);

  return (
    <div className="w-full bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-lg p-4 overflow-x-auto">
      <div className="min-w-[480px] flex items-center justify-between relative">
        <div className="absolute top-4 left-[5%] right-[5%] h-px bg-[var(--border-subtle)] -z-10" />
        {STEP_ORDER.map((key, idx) => {
          const state: StepState =
            idx < cur ? 'completed' : idx === cur ? 'active' : 'pending';
          return (
            <div key={key} data-state={state} className="flex flex-col items-center gap-1 w-1/4">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center z-10 text-label',
                  state === 'completed' && 'bg-[var(--surface-overlay)] border-2 border-[var(--brand-primary)] text-[var(--brand-primary)]',
                  state === 'active'    && 'bg-[var(--brand-primary)] text-[var(--text-on-brand)] shadow-[0_0_0_4px_var(--surface-card)]',
                  state === 'pending'   && 'bg-[var(--surface-card)] border-2 border-[var(--border-subtle)] text-[var(--text-muted)]',
                )}
              >
                {state === 'completed' ? <Check size={16} /> : idx + 1}
              </div>
              <span
                className={cn(
                  'text-label',
                  state === 'pending' ? 'text-[var(--text-muted)]' : 'text-[var(--text-primary)]',
                  state === 'active'  && 'font-bold',
                )}
              >
                {STEP_LABEL[key]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run to verify pass**

Run: `pnpm test:run src/features/assignments/components/AssignmentStepTracker.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/features/assignments/components/AssignmentStepTracker.tsx src/features/assignments/components/AssignmentStepTracker.test.tsx
git commit -m "feat(provider-p0): add 4-step assignment lifecycle tracker

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 4: getProviderTaskDetail query

**Files:**
- Create: `src/features/tasks/queries.ts`
- Create: `src/features/tasks/tests/tasks.queries.test.ts`

Privacy: select property fields strictly. Reveal `street` + `unit` ONLY when assignment.status is ACCEPTED or later (post-acceptance per §VIII.5).

- [ ] **Step 1: Write the failing test**

```ts
// src/features/tasks/tests/tasks.queries.test.ts
import { prisma } from '@/core/database/client';
import { getProviderTaskDetail } from '../queries';

describe('getProviderTaskDetail', () => {
  it('returns task + assignment + safe property fields when provider owns it', async () => {
    // arrange — assume seeded fixture with task TASK-1 owned by provider PROV-1
    const detail = await getProviderTaskDetail('TASK-1', 'PROV-1-USERID');
    expect(detail).not.toBeNull();
    expect(detail?.assignment.id).toBe('ASSIGN-1');
    expect(detail?.property.zone).toBeDefined();
  });
  it('reveals exact address only post-acceptance', async () => {
    const detail = await getProviderTaskDetail('TASK-PENDING', 'PROV-1-USERID');
    expect(detail?.property.exactAddress).toBeNull();
    const accepted = await getProviderTaskDetail('TASK-ACCEPTED', 'PROV-1-USERID');
    expect(accepted?.property.exactAddress).toBeTypeOf('string');
  });
  it('returns null when provider does not own the task', async () => {
    const detail = await getProviderTaskDetail('TASK-1', 'OTHER-USERID');
    expect(detail).toBeNull();
  });
});
```

- [ ] **Step 2: Add seed fixtures**

Update `prisma/seed.ts` to add `TASK-1`, `TASK-PENDING`, `TASK-ACCEPTED` linked to `PROV-1`. If existing seed already covers, skip. Run: `pnpm db:seed`.

- [ ] **Step 3: Run test to verify fail**

Run: `pnpm test:run src/features/tasks/tests/tasks.queries.test.ts`
Expected: FAIL.

- [ ] **Step 4: Implement query**

```ts
// src/features/tasks/queries.ts
'use server';

import { prisma } from '@/core/database/client';

export interface ProviderTaskDetail {
  id: string;
  scheduledFor: string;
  status: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  evidenceImages: string[];
  pendingPhotoVerification: boolean;
  assignment: {
    id: string;
    status: string;
    providerPayoutTZS: string;
    expiresAt: string;
    acceptedAt: string | null;
    scheduledDate: string | null;
    serviceTypeName: string;
  };
  property: {
    zone: string;
    latitude: number;
    longitude: number;
    exactAddress: string | null; // null pre-acceptance
  };
}

const POST_ACCEPTANCE: ReadonlySet<string> = new Set([
  'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'DISPUTED', 'VERIFIED',
]);

export async function getProviderTaskDetail(
  taskId: string,
  providerUserId: string,
): Promise<ProviderTaskDetail | null> {
  const provider = await prisma.providerProfile.findUnique({
    where: { userId: providerUserId },
    select: { id: true },
  });
  if (!provider) return null;

  const task = await prisma.task.findFirst({
    where: { id: taskId, assignment: { providerId: provider.id } },
    select: {
      id: true,
      scheduledFor: true,
      status: true,
      checkInTime: true,
      checkOutTime: true,
      evidenceImages: true,
      pendingPhotoVerification: true,
      assignment: {
        select: {
          id: true,
          status: true,
          providerPayout: true,
          expiresAt: true,
          acceptedAt: true,
          scheduledDate: true,
          serviceType: { select: { name: true } },
          property: {
            select: {
              zone: true,
              latitude: true,
              longitude: true,
              encryptedAddress: true, // auto-decrypted by prisma extension
            },
          },
        },
      },
    },
  });
  if (!task) return null;

  const a = task.assignment;
  const revealAddress = POST_ACCEPTANCE.has(a.status);

  return {
    id: task.id,
    scheduledFor: task.scheduledFor.toISOString(),
    status: task.status,
    checkInTime: task.checkInTime?.toISOString() ?? null,
    checkOutTime: task.checkOutTime?.toISOString() ?? null,
    evidenceImages: task.evidenceImages,
    pendingPhotoVerification: task.pendingPhotoVerification,
    assignment: {
      id: a.id,
      status: a.status,
      providerPayoutTZS: a.providerPayout.toString(),
      expiresAt: a.expiresAt.toISOString(),
      acceptedAt: a.acceptedAt?.toISOString() ?? null,
      scheduledDate: a.scheduledDate?.toISOString() ?? null,
      serviceTypeName: a.serviceType.name,
    },
    property: {
      zone: a.property.zone,
      latitude: a.property.latitude,
      longitude: a.property.longitude,
      exactAddress: revealAddress ? a.property.encryptedAddress ?? null : null,
    },
  };
}
```

- [ ] **Step 5: Run test to verify pass**

Run: `pnpm test:run src/features/tasks/tests/tasks.queries.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 6: Commit**

```bash
git add src/features/tasks/queries.ts src/features/tasks/tests/tasks.queries.test.ts prisma/seed.ts
git commit -m "feat(provider-p0): add getProviderTaskDetail with post-acceptance address reveal

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 5: LocationVerificationModal + GpsCheckInCard

**Files:**
- Create: `src/features/tasks/components/LocationVerificationModal.tsx`
- Create: `src/features/tasks/components/GpsCheckInCard.tsx`

GpsCheckInCard uses `navigator.geolocation.getCurrentPosition`, computes haversine distance client-side for display, calls `checkInToTask` server action. Modal opens on accuracy >100m or distance >200m, lets provider retry or escalate to manual review.

- [ ] **Step 1: Add schemas**

```ts
// src/features/tasks/schemas.ts
import { z } from 'zod';

export const CheckInSchema = z.object({
  taskId: z.string().uuid(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().nullable(),
  forceManualReview: z.boolean().optional(),
});

export const EvidenceSubmissionSchema = z.object({
  taskId: z.string().uuid(),
  imageDataUrls: z.array(z.string().startsWith('data:image/')).min(3).max(10),
});

export type CheckInInput = z.infer<typeof CheckInSchema>;
export type EvidenceSubmissionInput = z.infer<typeof EvidenceSubmissionSchema>;
```

- [ ] **Step 2: Implement LocationVerificationModal**

```tsx
// src/features/tasks/components/LocationVerificationModal.tsx
'use client';

import { X, AlertTriangle, MapPin } from 'lucide-react';

interface Props {
  open: boolean;
  distance: number; // meters
  accuracy: number | null;
  reason?: string;
  onRetry: () => void;
  onManualReview: () => void;
  onClose: () => void;
}

export function LocationVerificationModal({ open, distance, accuracy, reason, onRetry, onManualReview, onClose }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(2px)' }}>
      <div className="bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-xl w-full max-w-md flex flex-col shadow-[0_4px_12px_rgba(15,23,42,0.08)] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-[var(--border-subtle)]">
          <h2 className="text-h2 font-semibold text-[var(--text-primary)]">Location Verification</h2>
          <button onClick={onClose} aria-label="Close" className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
            <X size={18} />
          </button>
        </div>
        <div className="p-6 flex flex-col gap-4">
          <div className="flex items-start gap-3 p-3 rounded-md bg-[var(--state-warning-bg)] text-[var(--state-warning)]">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            <p className="text-body-sm">{reason ?? 'Your location does not match the property within the required radius.'}</p>
          </div>
          <dl className="text-body-sm space-y-1.5">
            <div className="flex justify-between">
              <dt className="text-[var(--text-muted)]">Distance from site</dt>
              <dd className="tabular-nums font-medium">{Math.round(distance)}m</dd>
            </div>
            {accuracy !== null && (
              <div className="flex justify-between">
                <dt className="text-[var(--text-muted)]">GPS accuracy</dt>
                <dd className="tabular-nums font-medium">±{Math.round(accuracy)}m</dd>
              </div>
            )}
          </dl>
        </div>
        <div className="p-6 bg-[var(--surface-page)] border-t border-[var(--border-subtle)] flex gap-3 justify-end">
          <button onClick={onManualReview} className="px-4 py-2 text-label border border-[var(--border-subtle)] rounded text-[var(--text-primary)] hover:bg-[var(--surface-overlay)] flex items-center gap-1.5">
            <MapPin size={14} /> Request manual review
          </button>
          <button onClick={onRetry} className="px-4 py-2 text-label bg-[var(--brand-gold)] text-[var(--brand-primary)] rounded hover:opacity-90">
            Retry GPS
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Implement GpsCheckInCard**

```tsx
// src/features/tasks/components/GpsCheckInCard.tsx
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { HardHat, MapPin, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { checkInToTask } from '../actions';
import { LocationVerificationModal } from './LocationVerificationModal';

interface Props {
  taskId: string;
  propertyLat: number;
  propertyLng: number;
  alreadyCheckedIn: boolean;
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000, toRad = (v: number) => (v * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1), dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function GpsCheckInCard({ taskId, propertyLat, propertyLng, alreadyCheckedIn }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [modal, setModal] = useState<null | { distance: number; accuracy: number | null; reason: string }>(null);
  const [distance, setDistance] = useState<number | null>(null);

  const requestCheckIn = (forceManualReview = false) => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported on this device.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const d = haversine(pos.coords.latitude, pos.coords.longitude, propertyLat, propertyLng);
        setDistance(d);
        startTransition(async () => {
          const result = await checkInToTask(taskId, pos.coords.latitude, pos.coords.longitude, {
            accuracy: pos.coords.accuracy,
            forceManualReview,
          });
          if (result.success) {
            toast.success('Checked in — task is now in progress.');
            router.refresh();
          } else if (result.method === 'MANUAL_REVIEW') {
            toast.message('Submitted for manual review.');
            router.refresh();
          } else {
            setModal({ distance: d, accuracy: pos.coords.accuracy, reason: result.reason ?? 'Verification failed' });
          }
        });
      },
      (err) => toast.error(`GPS error: ${err.message}`),
      { enableHighAccuracy: true, timeout: 15000 },
    );
  };

  if (alreadyCheckedIn) {
    return (
      <div className="bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-lg p-4 flex items-center gap-3">
        <MapPin size={18} className="text-[var(--state-success)]" />
        <p className="text-body-sm text-[var(--text-primary)]">Already checked in. Continue with proof of work below.</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-lg overflow-hidden flex flex-col">
        <div className="p-4 flex flex-col gap-3">
          <div>
            <h3 className="text-label uppercase tracking-wider text-[var(--text-muted)] mb-1">Location Status</h3>
            {distance !== null ? (
              <p className="text-body-md text-[var(--text-primary)] font-medium">{Math.round(distance)}m from site</p>
            ) : (
              <p className="text-body-md text-[var(--text-secondary)]">GPS not yet captured.</p>
            )}
          </div>
          <button
            onClick={() => requestCheckIn(false)}
            disabled={isPending}
            className="w-full py-2.5 bg-[var(--brand-gold)] text-[var(--brand-primary)] text-label rounded hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isPending ? <Loader2 size={16} className="animate-spin" /> : <HardHat size={16} />}
            {isPending ? 'Verifying…' : 'Check In & Start Task'}
          </button>
          <p className="text-body-sm text-[var(--text-muted)] text-center">GPS verification required (within 200m of property).</p>
        </div>
      </div>
      <LocationVerificationModal
        open={modal !== null}
        distance={modal?.distance ?? 0}
        accuracy={modal?.accuracy ?? null}
        reason={modal?.reason}
        onRetry={() => { setModal(null); requestCheckIn(false); }}
        onManualReview={() => { setModal(null); requestCheckIn(true); }}
        onClose={() => setModal(null)}
      />
    </>
  );
}
```

- [ ] **Step 4: Run typecheck**

Run: `pnpm tsc --noEmit`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/tasks/components/GpsCheckInCard.tsx src/features/tasks/components/LocationVerificationModal.tsx src/features/tasks/schemas.ts
git commit -m "feat(provider-p0): GPS check-in card + verification modal

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 6: ProofOfWorkUpload component

**Files:**
- Create: `src/features/tasks/components/ProofOfWorkUpload.tsx`
- Create: `src/features/tasks/components/ProofOfWorkUpload.test.tsx`
- Modify: `src/features/tasks/actions.ts` — add `MAX_EVIDENCE_BYTES` guard

- [ ] **Step 1: Update `submitTaskEvidence` to validate base64 size + format**

In `src/features/tasks/actions.ts`, replace the body of `submitTaskEvidence` with:

```ts
const MAX_EVIDENCE_BYTES = 2_000_000;
const MAX_EVIDENCE_COUNT = 10;

export async function submitTaskEvidence(taskId: string, imageDataUrls: string[]): Promise<void> {
  if (imageDataUrls.length < 3) {
    throw new Error('At least 3 evidence photos are required.');
  }
  if (imageDataUrls.length > MAX_EVIDENCE_COUNT) {
    throw new Error(`Maximum ${MAX_EVIDENCE_COUNT} photos allowed.`);
  }
  for (const url of imageDataUrls) {
    if (!url.startsWith('data:image/')) {
      throw new Error('Invalid image format — data URL required.');
    }
    // base64 length ~ bytes * 4/3
    if (url.length > MAX_EVIDENCE_BYTES * 4 / 3 + 100) {
      throw new Error(`Each photo must be under ${MAX_EVIDENCE_BYTES / 1_000_000}MB.`);
    }
  }

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { assignment: true },
  });
  if (!task) throw new Error('Task not found');

  await prisma.$transaction(async (tx) => {
    await tx.task.update({
      where: { id: taskId },
      data: {
        status: 'COMPLETED',
        checkOutTime: new Date(),
        evidenceImages: imageDataUrls,
      },
    });
    if (task.assignment) {
      await tx.assignment.update({
        where: { id: task.assignment.id },
        data: { status: 'COMPLETED', completedAt: new Date() },
      });
    }
  });
}
```

- [ ] **Step 2: Write the failing test**

```tsx
// src/features/tasks/components/ProofOfWorkUpload.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProofOfWorkUpload } from './ProofOfWorkUpload';

const submitMock = vi.fn();
vi.mock('../actions', () => ({ submitTaskEvidence: (...args: any[]) => submitMock(...args) }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn() }) }));

describe('ProofOfWorkUpload', () => {
  beforeEach(() => submitMock.mockReset());

  it('disables submit until at least 3 photos selected', () => {
    render(<ProofOfWorkUpload taskId="T-1" existing={[]} />);
    expect(screen.getByRole('button', { name: /submit/i })).toBeDisabled();
  });

  it('enables submit once 3 photos added', async () => {
    render(<ProofOfWorkUpload taskId="T-1" existing={[]} />);
    const input = screen.getByLabelText(/upload evidence/i, { selector: 'input' });
    const file = new File(['x'], 'a.jpg', { type: 'image/jpeg' });
    await userEvent.upload(input, [file, file, file]);
    expect(screen.getByRole('button', { name: /submit/i })).not.toBeDisabled();
  });
});
```

- [ ] **Step 3: Run to verify fail**

Run: `pnpm test:run src/features/tasks/components/ProofOfWorkUpload.test.tsx`
Expected: FAIL.

- [ ] **Step 4: Implement component**

```tsx
// src/features/tasks/components/ProofOfWorkUpload.tsx
'use client';

import { useState, useTransition, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Upload, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { submitTaskEvidence } from '../actions';

interface Props {
  taskId: string;
  existing: string[];
}

const MIN = 3;
const MAX = 10;
const MAX_BYTES = 2_000_000;

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result as string);
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });
}

export function ProofOfWorkUpload({ taskId, existing }: Props) {
  const router = useRouter();
  const [items, setItems] = useState<string[]>(existing);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = async (list: FileList | null) => {
    if (!list) return;
    const slots = MAX - items.length;
    if (slots <= 0) return;
    const accepted = Array.from(list).slice(0, slots);
    const next = [...items];
    for (const f of accepted) {
      if (f.size > MAX_BYTES) {
        toast.error(`${f.name} exceeds 2MB — please compress before uploading.`);
        continue;
      }
      next.push(await readAsDataUrl(f));
    }
    setItems(next);
    if (inputRef.current) inputRef.current.value = '';
  };

  const remove = (idx: number) => setItems(items.filter((_, i) => i !== idx));

  const submit = () => {
    startTransition(async () => {
      try {
        await submitTaskEvidence(taskId, items);
        toast.success('Evidence submitted — awaiting owner review.');
        router.refresh();
      } catch (e: any) {
        toast.error(e.message ?? 'Submission failed');
      }
    });
  };

  return (
    <section className="bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--border-subtle)] flex justify-between items-center">
        <h3 className="text-h2 font-semibold text-[var(--text-primary)]">Proof of Work</h3>
        <span className="text-body-sm text-[var(--text-muted)]">{items.length} of {MIN}+ photos</span>
      </div>
      <div className="p-4 flex flex-col gap-4">
        <p className="text-body-sm text-[var(--text-secondary)]">
          Upload at least {MIN} photos showing the work site, materials, and the completed result. Max {MAX} photos, 2MB each.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {items.map((url, i) => (
            <div key={i} className="relative aspect-square rounded overflow-hidden border border-[var(--border-subtle)]">
              <img src={url} alt={`Evidence ${i + 1}`} className="w-full h-full object-cover" />
              <button
                onClick={() => remove(i)}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white hover:bg-black/80 flex items-center justify-center"
                aria-label={`Remove photo ${i + 1}`}
              >
                <X size={10} />
              </button>
            </div>
          ))}
          {items.length < MAX && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="aspect-square rounded border border-dashed border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] flex flex-col items-center justify-center gap-1"
            >
              <Camera size={20} />
              <span className="text-label">Add</span>
            </button>
          )}
        </div>
        <input
          ref={inputRef}
          aria-label="Upload evidence"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
        <button
          type="button"
          onClick={submit}
          disabled={items.length < MIN || isPending}
          className="w-full py-2.5 bg-[var(--brand-gold)] text-[var(--brand-primary)] text-label rounded hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isPending ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
          {isPending ? 'Submitting…' : 'Submit Evidence'}
        </button>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Run tests pass**

Run: `pnpm test:run src/features/tasks/components/ProofOfWorkUpload.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 6: Commit**

```bash
git add src/features/tasks/components/ProofOfWorkUpload.tsx src/features/tasks/components/ProofOfWorkUpload.test.tsx src/features/tasks/actions.ts
git commit -m "feat(provider-p0): proof-of-work photo upload with size guards

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 7: Task detail page route

**Files:**
- Create: `src/app/(dashboard)/provider/tasks/[id]/page.tsx`

- [ ] **Step 1: Implement page**

```tsx
// src/app/(dashboard)/provider/tasks/[id]/page.tsx
import { Suspense } from 'react';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin } from 'lucide-react';
import { auth } from '@/core/auth';
import RoleGuard from '@/components/RoleGuard';
import { getProviderTaskDetail } from '@/features/tasks/queries';
import { AssignmentStepTracker } from '@/features/assignments/components/AssignmentStepTracker';
import { GpsCheckInCard } from '@/features/tasks/components/GpsCheckInCard';
import { ProofOfWorkUpload } from '@/features/tasks/components/ProofOfWorkUpload';
import { formatTZS } from '@/shared/lib/currency';

export const dynamic = 'force-dynamic';

export default async function ProviderTaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <RoleGuard allowedRoles={['PROVIDER']}>
      <Suspense fallback={<div className="text-body-sm text-[var(--text-muted)]">Loading task…</div>}>
        <TaskDetailContent id={id} />
      </Suspense>
    </RoleGuard>
  );
}

async function TaskDetailContent({ id }: { id: string }) {
  const session = await auth();
  if (!session?.user) redirect('/login');
  if (session.user.role !== 'PROVIDER') redirect('/login');

  const detail = await getProviderTaskDetail(id, session.user.id);
  if (!detail) notFound();

  const inProgress = ['IN_PROGRESS'].includes(detail.status);
  const showProof = inProgress || detail.status === 'COMPLETED' || detail.status === 'VERIFIED';

  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      <div className="flex flex-col gap-2">
        <Link href="/provider/tasks" className="inline-flex items-center gap-1 text-body-sm text-[var(--text-muted)] hover:text-[var(--text-primary)]">
          <ArrowLeft size={14} /> Back to Tasks
        </Link>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-h1 font-semibold text-[var(--text-primary)]">
            {detail.assignment.id.slice(0, 8).toUpperCase()}: {detail.assignment.serviceTypeName}
          </h1>
          <span className="px-2 py-0.5 rounded text-label bg-[var(--surface-overlay)] text-[var(--text-secondary)]">
            {detail.assignment.status.replaceAll('_', ' ')}
          </span>
        </div>
        <p className="text-body-md text-[var(--text-secondary)] flex items-center gap-1.5">
          <MapPin size={14} />
          {detail.property.exactAddress
            ? detail.property.exactAddress
            : `${detail.property.zone} — exact address revealed after acceptance`}
        </p>
        <p className="text-body-sm text-[var(--text-muted)] tabular-nums">
          Payout: <span className="font-semibold text-[var(--text-primary)]">{formatTZS(detail.assignment.providerPayoutTZS)}</span>
        </p>
      </div>

      <AssignmentStepTracker status={detail.assignment.status as any} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 flex flex-col gap-6">
          {showProof ? (
            <ProofOfWorkUpload taskId={detail.id} existing={detail.evidenceImages} />
          ) : (
            <div className="bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-lg p-6 text-body-sm text-[var(--text-muted)]">
              Check in via GPS to begin the task. Evidence upload unlocks once on site.
            </div>
          )}
        </div>
        <div className="lg:col-span-4 flex flex-col gap-6">
          <GpsCheckInCard
            taskId={detail.id}
            propertyLat={detail.property.latitude}
            propertyLng={detail.property.longitude}
            alreadyCheckedIn={detail.checkInTime !== null}
          />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Smoke test build**

Run: `pnpm build`
Expected: build succeeds, no type errors on this route.

- [ ] **Step 3: E2E happy path**

Create `tests/e2e/provider-task-execution.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

test('provider can view task detail page', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[name="email"]', 'provider1@test.local');
  await page.fill('input[name="password"]', 'Password123!');
  await page.click('button[type="submit"]');
  await page.waitForURL('/provider*');
  await page.goto('/provider/tasks');
  const firstTask = page.locator('a[href^="/provider/tasks/"]').first();
  await firstTask.click();
  await expect(page.getByText(/Assigned|On Site|In Progress|Review/)).toBeVisible();
});
```

Run: `pnpm test:e2e tests/e2e/provider-task-execution.spec.ts`
Expected: PASS (requires dev server + seeded provider).

- [ ] **Step 4: Commit**

```bash
git add src/app/(dashboard)/provider/tasks/[id]/page.tsx tests/e2e/provider-task-execution.spec.ts
git commit -m "feat(provider-p0): task detail route with step tracker, GPS check-in, evidence upload

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 8: RequestPayoutModal

**Files:**
- Create: `src/features/wallets/schemas.ts`
- Create: `src/features/wallets/components/RequestPayoutModal.tsx`
- Create: `src/features/wallets/components/RequestPayoutModal.test.tsx`

- [ ] **Step 1: Schemas**

```ts
// src/features/wallets/schemas.ts
import { z } from 'zod';

export const MIN_WITHDRAWAL_TZS = 50_000;

export const WithdrawalRequestSchema = z.object({
  walletId: z.string().uuid(),
  amount: z.number().int().min(MIN_WITHDRAWAL_TZS),
  mobileNumber: z.string().regex(/^\+255\d{9}$/, 'Mobile number must be +255 followed by 9 digits'),
});

export type WithdrawalRequestInput = z.infer<typeof WithdrawalRequestSchema>;
```

- [ ] **Step 2: Test**

```tsx
// src/features/wallets/components/RequestPayoutModal.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RequestPayoutModal } from './RequestPayoutModal';

const requestMock = vi.fn();
vi.mock('../actions', () => ({ requestWithdrawal: (...a: any[]) => requestMock(...a) }));

describe('RequestPayoutModal', () => {
  beforeEach(() => requestMock.mockReset());

  it('shows minimum withdrawal hint', () => {
    render(<RequestPayoutModal open walletId="W-1" availableBalance={120000} onClose={() => {}} onSuccess={() => {}} />);
    expect(screen.getByText(/Minimum.*50,000/)).toBeInTheDocument();
  });

  it('blocks submit when amount below minimum', async () => {
    render(<RequestPayoutModal open walletId="W-1" availableBalance={120000} onClose={() => {}} onSuccess={() => {}} />);
    await userEvent.type(screen.getByLabelText(/amount/i), '10000');
    await userEvent.type(screen.getByLabelText(/mobile/i), '+255712345678');
    await userEvent.click(screen.getByRole('button', { name: /confirm/i }));
    expect(requestMock).not.toHaveBeenCalled();
  });

  it('calls requestWithdrawal with valid input', async () => {
    requestMock.mockResolvedValueOnce({ withdrawalId: 'W-99' });
    const onSuccess = vi.fn();
    render(<RequestPayoutModal open walletId="W-1" availableBalance={120000} onClose={() => {}} onSuccess={onSuccess} />);
    await userEvent.clear(screen.getByLabelText(/amount/i));
    await userEvent.type(screen.getByLabelText(/amount/i), '60000');
    await userEvent.type(screen.getByLabelText(/mobile/i), '+255712345678');
    await userEvent.click(screen.getByRole('button', { name: /confirm/i }));
    await vi.waitFor(() => expect(requestMock).toHaveBeenCalledWith('W-1', 60000, '+255712345678'));
    expect(onSuccess).toHaveBeenCalledWith('W-99', 60000);
  });
});
```

- [ ] **Step 3: Run to verify fail**

Run: `pnpm test:run src/features/wallets/components/RequestPayoutModal.test.tsx`
Expected: FAIL.

- [ ] **Step 4: Implement**

```tsx
// src/features/wallets/components/RequestPayoutModal.tsx
'use client';

import { useState, useTransition } from 'react';
import { X, Wallet, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { requestWithdrawal } from '../actions';
import { MIN_WITHDRAWAL_TZS, WithdrawalRequestSchema } from '../schemas';
import { formatTZS } from '@/shared/lib/currency';

interface Props {
  open: boolean;
  walletId: string;
  availableBalance: number;
  onClose: () => void;
  onSuccess: (withdrawalId: string, amount: number) => void;
}

export function RequestPayoutModal({ open, walletId, availableBalance, onClose, onSuccess }: Props) {
  const [amount, setAmount] = useState<string>('');
  const [mobile, setMobile] = useState<string>('');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const submit = () => {
    setError(null);
    const parsed = WithdrawalRequestSchema.safeParse({
      walletId,
      amount: Number(amount),
      mobileNumber: mobile,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Invalid input');
      return;
    }
    if (parsed.data.amount > availableBalance) {
      setError('Amount exceeds available balance.');
      return;
    }
    startTransition(async () => {
      try {
        const { withdrawalId } = await requestWithdrawal(walletId, parsed.data.amount, mobile);
        onSuccess(withdrawalId, parsed.data.amount);
      } catch (e: any) {
        toast.error(e.message ?? 'Withdrawal failed');
      }
    });
  };

  const withdrawAll = () => setAmount(String(availableBalance));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(2px)' }}>
      <div className="bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-xl w-full max-w-md flex flex-col shadow-[0_4px_12px_rgba(15,23,42,0.08)] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-[var(--border-subtle)]">
          <h2 className="text-h2 font-semibold text-[var(--text-primary)]">Request Payout</h2>
          <button onClick={onClose} aria-label="Close" className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
            <X size={18} />
          </button>
        </div>
        <div className="p-6 flex flex-col gap-6">
          <div className="bg-[var(--surface-page)] rounded-lg p-4 border border-[var(--border-subtle)] flex items-center justify-between">
            <div>
              <span className="block text-label text-[var(--text-muted)] mb-1">Available Balance</span>
              <span className="block text-h1 font-semibold text-[var(--text-primary)] tabular-nums">{formatTZS(availableBalance)}</span>
            </div>
            <div className="h-12 w-12 rounded-full bg-[var(--surface-overlay)] flex items-center justify-center text-[var(--brand-primary)]">
              <Wallet size={20} />
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="amount" className="text-label text-[var(--text-primary)]">Withdrawal Amount (TZS)</label>
              <input
                id="amount"
                type="number"
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="50000"
                className="w-full px-3 py-2 bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded text-body-md text-[var(--text-primary)] focus:ring-1 focus:ring-[var(--brand-gold)] focus:border-[var(--brand-gold)]"
              />
              <div className="flex justify-between text-body-sm">
                <span className="text-[var(--text-muted)]">Minimum: {formatTZS(MIN_WITHDRAWAL_TZS)}</span>
                <button onClick={withdrawAll} className="text-[var(--brand-gold)] hover:underline">Withdraw All</button>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="mobile" className="text-label text-[var(--text-primary)]">Mobile Money Number</label>
              <input
                id="mobile"
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="+255712345678"
                className="w-full px-3 py-2 bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded text-body-md text-[var(--text-primary)] focus:ring-1 focus:ring-[var(--brand-gold)] focus:border-[var(--brand-gold)]"
              />
            </div>
          </div>
          {error && (
            <p className="text-body-sm text-[var(--state-error)]" role="alert">{error}</p>
          )}
          <dl className="text-body-sm space-y-1 pt-4 border-t border-[var(--border-subtle)]">
            <div className="flex justify-between">
              <dt className="text-[var(--text-muted)]">Estimated arrival</dt>
              <dd className="text-[var(--text-primary)] font-medium">Within 24 hours</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[var(--text-muted)]">Fee</dt>
              <dd className="text-[var(--text-primary)] font-medium">{formatTZS(0)}</dd>
            </div>
          </dl>
        </div>
        <div className="p-6 bg-[var(--surface-page)] border-t border-[var(--border-subtle)] flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-label border border-[var(--border-subtle)] rounded text-[var(--text-primary)] hover:bg-[var(--surface-overlay)]">
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={isPending}
            className="px-4 py-2 text-label bg-[var(--brand-gold)] text-[var(--brand-primary)] rounded hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
          >
            {isPending && <Loader2 size={14} className="animate-spin" />}
            Confirm Payout
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Run tests pass**

Run: `pnpm test:run src/features/wallets/components/RequestPayoutModal.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 6: Commit**

```bash
git add src/features/wallets/components/RequestPayoutModal.tsx src/features/wallets/components/RequestPayoutModal.test.tsx src/features/wallets/schemas.ts
git commit -m "feat(provider-p0): payout request modal with 50k TZS minimum + mobile validation

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 9: PayoutSuccessModal

**Files:**
- Create: `src/features/wallets/components/PayoutSuccessModal.tsx`

- [ ] **Step 1: Implement**

```tsx
// src/features/wallets/components/PayoutSuccessModal.tsx
'use client';

import { CheckCircle2, X } from 'lucide-react';
import { formatTZS } from '@/shared/lib/currency';

interface Props {
  open: boolean;
  withdrawalId: string;
  amount: number;
  onClose: () => void;
}

export function PayoutSuccessModal({ open, withdrawalId, amount, onClose }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(2px)' }}>
      <div className="bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-xl w-full max-w-sm flex flex-col shadow-[0_4px_12px_rgba(15,23,42,0.08)] overflow-hidden">
        <div className="flex justify-end p-3">
          <button onClick={onClose} aria-label="Close" className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
            <X size={18} />
          </button>
        </div>
        <div className="px-8 pb-8 flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[var(--state-success-bg)] text-[var(--state-success)] flex items-center justify-center">
            <CheckCircle2 size={32} />
          </div>
          <h2 className="text-h2 font-semibold text-[var(--text-primary)]">Payout Requested</h2>
          <p className="text-body-md text-[var(--text-secondary)]">
            {formatTZS(amount)} will arrive on your mobile money within 24 hours.
          </p>
          <p className="text-body-sm text-[var(--text-muted)] tabular-nums">Ref: {withdrawalId.slice(0, 12).toUpperCase()}</p>
          <button onClick={onClose} className="mt-2 w-full py-2.5 bg-[var(--brand-gold)] text-[var(--brand-primary)] text-label rounded hover:opacity-90">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/wallets/components/PayoutSuccessModal.tsx
git commit -m "feat(provider-p0): payout success modal

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 10: TransactionHistoryTable

**Files:**
- Create: `src/features/wallets/components/TransactionHistoryTable.tsx`
- Modify: `src/features/wallets/types.ts` — extend `WalletSummary.transactions[]` items to include `runningBalance`, `reference`
- Modify: `src/features/wallets/queries.ts` — surface `totalEarned`, include `runningBalance`

- [ ] **Step 1: Extend types**

In `src/features/wallets/types.ts`:

```ts
export interface WalletSummary {
  id: string;
  availableBalance: number;
  pendingBalance: number;
  totalEarned: number;
  lastUpdated: Date | null;
  transactions: Array<{
    id: string;
    type: string;
    amount: number;
    reference: string;
    status: string;
    runningBalance: number;
    createdAt: string;
  }>;
}
```

- [ ] **Step 2: Extend query**

In `src/features/wallets/queries.ts` (replace return):

```ts
  return {
    id: wallet.id,
    availableBalance: wallet.availableBalance.toNumber(),
    pendingBalance: wallet.pendingBalance.toNumber(),
    totalEarned: wallet.totalEarned.toNumber(),
    lastUpdated: wallet.updatedAt,
    transactions: wallet.transactions.map((t) => ({
      id: t.id,
      type: t.type,
      amount: t.amount.toNumber(),
      reference: t.reference,
      status: t.status,
      runningBalance: t.runningBalance.toNumber(),
      createdAt: t.createdAt.toISOString(),
    })),
  };
```

- [ ] **Step 3: Implement table**

```tsx
// src/features/wallets/components/TransactionHistoryTable.tsx
import { formatTZS } from '@/shared/lib/currency';
import type { WalletSummary } from '../types';

type Tx = WalletSummary['transactions'][number];

function netAmount(t: Tx): number {
  return t.amount;
}

function statusClass(s: string): string {
  if (s === 'SETTLED') return 'bg-[var(--state-success-bg)] text-[var(--state-success)]';
  if (s === 'PENDING') return 'bg-[var(--state-warning-bg)] text-[var(--state-warning)]';
  if (s === 'FAILED')  return 'bg-[var(--state-error-bg)] text-[var(--state-error)]';
  return 'bg-[var(--surface-overlay)] text-[var(--text-secondary)]';
}

function typeLabel(t: Tx['type']): string {
  switch (t) {
    case 'EARNING':    return 'Service Earning';
    case 'WITHDRAWAL': return 'Withdrawal';
    case 'PENALTY':    return 'Penalty';
    case 'ADJUSTMENT': return 'Adjustment';
    default:           return t;
  }
}

export function TransactionHistoryTable({ transactions }: { transactions: Tx[] }) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 text-body-sm text-[var(--text-muted)]">
        No transactions yet — your first service earning will appear here.
      </div>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse min-w-[800px]">
        <thead>
          <tr className="bg-[var(--surface-page)] border-b border-[var(--border-subtle)]">
            <th className="text-label uppercase text-[var(--text-muted)] px-3 py-2">Date</th>
            <th className="text-label uppercase text-[var(--text-muted)] px-3 py-2">Type</th>
            <th className="text-label uppercase text-[var(--text-muted)] px-3 py-2">Reference</th>
            <th className="text-label uppercase text-[var(--text-muted)] px-3 py-2">Status</th>
            <th className="text-label uppercase text-[var(--text-muted)] px-3 py-2 text-right">Amount</th>
            <th className="text-label uppercase text-[var(--text-muted)] px-3 py-2 text-right">Balance</th>
          </tr>
        </thead>
        <tbody className="text-body-sm text-[var(--text-primary)] tabular-nums">
          {transactions.map((t, idx) => (
            <tr
              key={t.id}
              className={`border-b border-[var(--border-subtle)] hover:bg-[var(--surface-page)] transition-colors ${idx % 2 === 1 ? 'bg-[var(--surface-page)]' : ''}`}
            >
              <td className="px-3 py-2 whitespace-nowrap text-[var(--text-secondary)]">
                {new Date(t.createdAt).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' })}
              </td>
              <td className="px-3 py-2 font-medium">{typeLabel(t.type)}</td>
              <td className="px-3 py-2 text-[var(--text-muted)]">{t.reference.slice(0, 12).toUpperCase()}</td>
              <td className="px-3 py-2">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-label font-semibold ${statusClass(t.status)}`}>
                  {t.status}
                </span>
              </td>
              <td className={`px-3 py-2 text-right font-semibold ${netAmount(t) < 0 ? 'text-[var(--state-error)]' : ''}`}>
                {formatTZS(netAmount(t))}
              </td>
              <td className="px-3 py-2 text-right text-[var(--text-secondary)]">{formatTZS(t.runningBalance)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 4: Typecheck**

Run: `pnpm tsc --noEmit`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/wallets/components/TransactionHistoryTable.tsx src/features/wallets/queries.ts src/features/wallets/types.ts
git commit -m "feat(provider-p0): transaction history table + extend wallet summary

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 11: Wallet page rewrite

**Files:**
- Modify: `src/app/(dashboard)/provider/wallet/page.tsx` (full rewrite)
- Delete: `src/app/(dashboard)/provider/earnings/page.tsx`

- [ ] **Step 1: Replace wallet page**

```tsx
// src/app/(dashboard)/provider/wallet/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Wallet as WalletIcon, Clock, TrendingUp } from 'lucide-react';
import RoleGuard from '@/components/RoleGuard';
import { DashboardHeader } from '@/shared/components/dashboard/DashboardHeader';
import { RequestPayoutModal } from '@/features/wallets/components/RequestPayoutModal';
import { PayoutSuccessModal } from '@/features/wallets/components/PayoutSuccessModal';
import { TransactionHistoryTable } from '@/features/wallets/components/TransactionHistoryTable';
import { formatTZS } from '@/shared/lib/currency';
import type { WalletSummary } from '@/features/wallets/types';

interface Props {
  initialWallet: WalletSummary | null;
}

function WalletClient({ initialWallet }: Props) {
  const [wallet, setWallet] = useState(initialWallet);
  const [payoutOpen, setPayoutOpen] = useState(false);
  const [success, setSuccess] = useState<{ id: string; amount: number } | null>(null);

  if (!wallet) {
    return (
      <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6 text-body-sm text-[var(--text-muted)]">
        No wallet yet. Complete and verify your first task to begin earning.
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-label text-[var(--text-muted)]">Available Balance</span>
            <WalletIcon size={18} className="text-[var(--text-muted)]" />
          </div>
          <span className="text-h1 font-semibold text-[var(--text-primary)] tabular-nums">{formatTZS(wallet.availableBalance)}</span>
          <button
            onClick={() => setPayoutOpen(true)}
            disabled={wallet.availableBalance < 50_000}
            className="mt-6 w-full py-2.5 bg-[var(--brand-gold)] text-[var(--brand-primary)] text-label rounded hover:opacity-90 disabled:opacity-50"
          >
            Request Payout
          </button>
        </div>
        <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-label text-[var(--text-muted)]">Pending Clearing</span>
            <Clock size={18} className="text-[var(--text-muted)]" />
          </div>
          <span className="text-h1 font-semibold text-[var(--text-primary)] tabular-nums">{formatTZS(wallet.pendingBalance)}</span>
          <p className="text-body-sm text-[var(--text-muted)] mt-2">Clears 24h after task verification</p>
        </div>
        <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-label text-[var(--text-muted)]">Total Earned</span>
            <TrendingUp size={18} className="text-[var(--text-muted)]" />
          </div>
          <span className="text-h1 font-semibold text-[var(--text-primary)] tabular-nums">{formatTZS(wallet.totalEarned)}</span>
          <p className="text-body-sm text-[var(--text-muted)] mt-2">80% share of all completed services</p>
        </div>
      </div>
      <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] overflow-hidden">
        <div className="p-4 border-b border-[var(--border-subtle)] flex justify-between items-center">
          <h3 className="text-h2 font-semibold text-[var(--text-primary)]">Transaction History</h3>
        </div>
        <TransactionHistoryTable transactions={wallet.transactions} />
      </div>
      <RequestPayoutModal
        open={payoutOpen}
        walletId={wallet.id}
        availableBalance={wallet.availableBalance}
        onClose={() => setPayoutOpen(false)}
        onSuccess={(id, amount) => {
          setPayoutOpen(false);
          setSuccess({ id, amount });
          setWallet({ ...wallet, availableBalance: wallet.availableBalance - amount });
        }}
      />
      {success && (
        <PayoutSuccessModal open withdrawalId={success.id} amount={success.amount} onClose={() => setSuccess(null)} />
      )}
    </>
  );
}

// Server entry
import { auth } from '@/core/auth';
import { redirect } from 'next/navigation';
import { getProviderWallet } from '@/features/wallets/queries';

export const dynamic = 'force-dynamic';

export default async function ProviderWalletPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  if (session.user.role !== 'PROVIDER') redirect('/login');
  const wallet = await getProviderWallet();
  return (
    <RoleGuard allowedRoles={['PROVIDER']}>
      <DashboardHeader title="Wallet & Earnings" subtitle="Manage your funds and view transaction history." asOf={new Date()} />
      <div className="flex flex-col gap-6">
        <WalletClient initialWallet={wallet} />
      </div>
    </RoleGuard>
  );
}
```

**Note:** This file has a server export AND a client component. Split into two files:

- `src/app/(dashboard)/provider/wallet/page.tsx` (server: imports `WalletClient` from sibling)
- `src/app/(dashboard)/provider/wallet/WalletClient.tsx` (client with `'use client'`)

Do the split before committing.

- [ ] **Step 2: Delete duplicate earnings route**

Run: `git rm src/app/(dashboard)/provider/earnings/page.tsx`

- [ ] **Step 3: E2E smoke**

Create `tests/e2e/provider-payout.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

test('provider can open payout modal and see min withdrawal hint', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[name="email"]', 'provider1@test.local');
  await page.fill('input[name="password"]', 'Password123!');
  await page.click('button[type="submit"]');
  await page.waitForURL('/provider*');
  await page.goto('/provider/wallet');
  await expect(page.getByText(/Available Balance/)).toBeVisible();
  await page.getByRole('button', { name: /request payout/i }).click();
  await expect(page.getByText(/Minimum.*50,000/)).toBeVisible();
});
```

Run: `pnpm test:e2e tests/e2e/provider-payout.spec.ts`
Expected: PASS (requires seeded provider with ≥50k balance).

- [ ] **Step 4: Commit**

```bash
git add src/app/(dashboard)/provider/wallet/ tests/e2e/provider-payout.spec.ts
git rm src/app/(dashboard)/provider/earnings/page.tsx
git commit -m "feat(provider-p0): wallet page rewrite with bento + payout modal + transaction history

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 12: getProviderDashboard query + ProviderKpiBento

**Files:**
- Create: `src/features/dashboard/schemas/provider-dashboard.schema.ts`
- Create: `src/features/dashboard/queries/provider.ts`
- Create: `src/features/dashboard/components/provider/ProviderKpiBento.tsx`
- Create: `src/features/dashboard/tests/provider-dashboard.queries.test.ts`

- [ ] **Step 1: Schema**

```ts
// src/features/dashboard/schemas/provider-dashboard.schema.ts
export interface ProviderDashboardData {
  earnings: {
    todayTZS: number;
    pendingTZS: number;
    availableTZS: number;
  };
  metrics: {
    activeTaskCount: number;
    acceptanceRate: number;          // 0–100
    acceptanceRateDeltaPct: number;  // vs last week
    rating: number;                  // 0–5
    ratingCount: number;
    strikeCount: number;
  };
  nextUpcoming: {
    assignmentId: string;
    taskId: string | null;
    serviceTypeName: string;
    zone: string;
    scheduledFor: string;
    priority: 'ROUTINE' | 'URGENT';
    estDurationHours: number;
  } | null;
  pipeline: Array<{
    assignmentId: string;
    serviceTypeName: string;
    zone: string;
    scheduledFor: string | null;
    status: string;
  }>;
  todayProgress: Array<{
    key: string;
    label: string;
    state: 'completed' | 'active' | 'pending';
    detail: string;
  }>;
}
```

- [ ] **Step 2: Test**

```ts
// src/features/dashboard/tests/provider-dashboard.queries.test.ts
import { getProviderDashboard } from '../queries/provider';

describe('getProviderDashboard', () => {
  it('returns null nextUpcoming when no scheduled tasks today/tomorrow', async () => {
    const data = await getProviderDashboard('PROV-EMPTY-USERID');
    expect(data.nextUpcoming).toBeNull();
  });
  it('aggregates wallet + assignments + provider profile', async () => {
    const data = await getProviderDashboard('PROV-1-USERID');
    expect(data.earnings.todayTZS).toBeGreaterThanOrEqual(0);
    expect(data.metrics.rating).toBeGreaterThanOrEqual(0);
    expect(data.pipeline.length).toBeLessThanOrEqual(10);
  });
});
```

- [ ] **Step 3: Run to verify fail**

Run: `pnpm test:run src/features/dashboard/tests/provider-dashboard.queries.test.ts`
Expected: FAIL.

- [ ] **Step 4: Implement query**

```ts
// src/features/dashboard/queries/provider.ts
'use server';

import { prisma } from '@/core/database/client';
import { startOfDay, endOfDay, addDays, subDays } from 'date-fns';
import type { ProviderDashboardData } from '../schemas/provider-dashboard.schema';

export async function getProviderDashboard(providerUserId: string): Promise<ProviderDashboardData> {
  const provider = await prisma.providerProfile.findUnique({
    where: { userId: providerUserId },
    include: { wallet: true },
  });
  if (!provider) {
    return emptyDashboard();
  }

  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const sevenDaysAgo = subDays(now, 7);
  const fourteenDaysAgo = subDays(now, 14);

  const todayEarningsAgg = await prisma.walletTransaction.aggregate({
    where: {
      wallet: { providerId: provider.id },
      type: 'EARNING',
      createdAt: { gte: todayStart, lte: todayEnd },
    },
    _sum: { amount: true },
  });

  const activeAssignments = await prisma.assignment.findMany({
    where: {
      providerId: provider.id,
      status: { in: ['ACCEPTED', 'IN_PROGRESS', 'COMPLETED'] },
    },
    select: {
      id: true,
      status: true,
      scheduledDate: true,
      serviceType: { select: { name: true } },
      property: { select: { zone: true } },
      tasks: {
        where: { status: { in: ['SCHEDULED', 'IN_PROGRESS'] } },
        orderBy: { scheduledFor: 'asc' },
        take: 1,
        select: { id: true, scheduledFor: true },
      },
    },
    orderBy: { scheduledDate: 'asc' },
    take: 10,
  });

  // Acceptance rate windows
  const [acceptedLast7, offeredLast7, acceptedPrev7, offeredPrev7] = await Promise.all([
    prisma.assignment.count({ where: { providerId: provider.id, acceptedAt: { gte: sevenDaysAgo } } }),
    prisma.assignment.count({ where: { providerId: provider.id, expiresAt: { gte: sevenDaysAgo } } }),
    prisma.assignment.count({ where: { providerId: provider.id, acceptedAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo } } }),
    prisma.assignment.count({ where: { providerId: provider.id, expiresAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo } } }),
  ]);
  const rateNow = offeredLast7 > 0 ? (acceptedLast7 / offeredLast7) * 100 : 0;
  const ratePrev = offeredPrev7 > 0 ? (acceptedPrev7 / offeredPrev7) * 100 : 0;

  // Next upcoming = soonest scheduled task in [now, now+2d]
  const upcoming = activeAssignments
    .map((a) => ({ a, t: a.tasks[0] }))
    .filter((x) => x.t && x.t.scheduledFor > now && x.t.scheduledFor <= addDays(now, 2))
    .sort((a, b) => a.t!.scheduledFor.getTime() - b.t!.scheduledFor.getTime())[0];

  const todayProgress = buildTodayProgress(activeAssignments);

  return {
    earnings: {
      todayTZS: todayEarningsAgg._sum.amount?.toNumber() ?? 0,
      pendingTZS: provider.wallet?.pendingBalance.toNumber() ?? 0,
      availableTZS: provider.wallet?.availableBalance.toNumber() ?? 0,
    },
    metrics: {
      activeTaskCount: activeAssignments.length,
      acceptanceRate: parseFloat(rateNow.toFixed(1)),
      acceptanceRateDeltaPct: parseFloat((rateNow - ratePrev).toFixed(1)),
      rating: parseFloat(provider.rating.toFixed(2)),
      ratingCount: provider.completedJobs,
      strikeCount: provider.strikeCount,
    },
    nextUpcoming: upcoming
      ? {
          assignmentId: upcoming.a.id,
          taskId: upcoming.t!.id,
          serviceTypeName: upcoming.a.serviceType.name,
          zone: upcoming.a.property.zone,
          scheduledFor: upcoming.t!.scheduledFor.toISOString(),
          priority: 'ROUTINE',
          estDurationHours: 1.5,
        }
      : null,
    pipeline: activeAssignments.map((a) => ({
      assignmentId: a.id,
      serviceTypeName: a.serviceType.name,
      zone: a.property.zone,
      scheduledFor: a.scheduledDate?.toISOString() ?? null,
      status: a.status,
    })),
    todayProgress,
  };
}

function emptyDashboard(): ProviderDashboardData {
  return {
    earnings: { todayTZS: 0, pendingTZS: 0, availableTZS: 0 },
    metrics: { activeTaskCount: 0, acceptanceRate: 0, acceptanceRateDeltaPct: 0, rating: 0, ratingCount: 0, strikeCount: 0 },
    nextUpcoming: null,
    pipeline: [],
    todayProgress: [],
  };
}

function buildTodayProgress(assignments: Array<{ id: string; status: string; tasks: Array<{ id: string; scheduledFor: Date }> }>): ProviderDashboardData['todayProgress'] {
  // Step 1: at least one task today checked-in / in-progress
  const inProgress = assignments.find((a) => a.status === 'IN_PROGRESS');
  const upcomingToday = assignments.find((a) => a.tasks[0] && isToday(a.tasks[0].scheduledFor) && a.status === 'ACCEPTED');
  return [
    {
      key: 'briefing',
      label: 'Morning Briefing',
      state: 'completed',
      detail: 'Daily plan reviewed',
    },
    {
      key: 'in_transit',
      label: inProgress ? `Task ${inProgress.id.slice(0, 6).toUpperCase()} in progress` : 'No active task',
      state: inProgress ? 'active' : 'pending',
      detail: inProgress ? 'Provider checked in' : '—',
    },
    {
      key: 'next',
      label: upcomingToday ? `Next: ${upcomingToday.id.slice(0, 6).toUpperCase()}` : 'No remaining tasks today',
      state: 'pending',
      detail: upcomingToday?.tasks[0]?.scheduledFor.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) ?? '—',
    },
  ];
}

function isToday(d: Date): boolean {
  const now = new Date();
  return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}
```

- [ ] **Step 5: Run test pass**

Run: `pnpm test:run src/features/dashboard/tests/provider-dashboard.queries.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 6: Implement ProviderKpiBento**

```tsx
// src/features/dashboard/components/provider/ProviderKpiBento.tsx
import { Wallet, ClipboardCheck, CheckCircle2, Star, ArrowUp, ArrowDown } from 'lucide-react';
import { formatTZS } from '@/shared/lib/currency';
import type { ProviderDashboardData } from '../../schemas/provider-dashboard.schema';

export function ProviderKpiBento({ earnings, metrics }: { earnings: ProviderDashboardData['earnings']; metrics: ProviderDashboardData['metrics'] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card label="Today's Earnings" icon={Wallet} value={formatTZS(earnings.todayTZS)} hint={<span className="inline-flex items-center gap-1.5"><span className="px-1.5 py-0.5 rounded bg-[var(--surface-overlay)] text-[var(--text-secondary)] text-label">80% Share</span><span className="text-body-sm text-[var(--text-muted)]">of total billed</span></span>} />
      <Card label="Active Tasks" icon={ClipboardCheck} value={String(metrics.activeTaskCount)} hint={<span className="text-body-sm text-[var(--text-muted)]">Requires attention today</span>} />
      <Card
        label="Acceptance Rate"
        icon={CheckCircle2}
        value={`${metrics.acceptanceRate.toFixed(0)}%`}
        hint={
          <span className={`inline-flex items-center gap-1 text-body-sm ${metrics.acceptanceRateDeltaPct >= 0 ? 'text-[var(--state-success)]' : 'text-[var(--state-error)]'}`}>
            {metrics.acceptanceRateDeltaPct >= 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
            {Math.abs(metrics.acceptanceRateDeltaPct).toFixed(1)}% vs last week
          </span>
        }
      />
      <Card
        label="Average Rating"
        icon={Star}
        value={`${metrics.rating.toFixed(1)} / 5.0`}
        hint={<span className="text-body-sm text-[var(--text-muted)]">Based on {metrics.ratingCount} reviews</span>}
      />
    </div>
  );
}

function Card({ label, icon: Icon, value, hint }: { label: string; icon: any; value: string; hint: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <span className="text-label uppercase tracking-wider text-[var(--text-muted)]">{label}</span>
        <Icon size={18} className="text-[var(--text-muted)]" />
      </div>
      <span className="text-[28px] leading-[36px] font-semibold text-[var(--text-primary)] tabular-nums">{value}</span>
      <div className="mt-1">{hint}</div>
    </div>
  );
}
```

- [ ] **Step 7: Commit**

```bash
git add src/features/dashboard/queries/provider.ts src/features/dashboard/schemas/provider-dashboard.schema.ts src/features/dashboard/components/provider/ProviderKpiBento.tsx src/features/dashboard/tests/provider-dashboard.queries.test.ts
git commit -m "feat(provider-p0): provider dashboard query + KPI bento

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 13: NextUpcomingAssignmentCard + ActivePipelineTable + TodayProgressTimeline + QuickActionsPanel

**Files:**
- Create: `src/features/dashboard/components/provider/NextUpcomingAssignmentCard.tsx`
- Create: `src/features/dashboard/components/provider/ActivePipelineTable.tsx`
- Create: `src/features/dashboard/components/provider/TodayProgressTimeline.tsx`
- Create: `src/features/dashboard/components/provider/QuickActionsPanel.tsx`
- Create: `src/features/dashboard/components/provider/skeletons.tsx`

- [ ] **Step 1: NextUpcomingAssignmentCard**

```tsx
// src/features/dashboard/components/provider/NextUpcomingAssignmentCard.tsx
import Link from 'next/link';
import { Clock, MapPin } from 'lucide-react';
import type { ProviderDashboardData } from '../../schemas/provider-dashboard.schema';

function relativeTime(iso: string): string {
  const ms = new Date(iso).getTime() - Date.now();
  if (ms < 0) return 'Now';
  const mins = Math.floor(ms / 60_000);
  if (mins < 60) return `Starts in ${mins}m`;
  const hrs = Math.floor(mins / 60);
  return `Starts in ${hrs}h ${mins % 60}m`;
}

export function NextUpcomingAssignmentCard({ next }: { next: ProviderDashboardData['nextUpcoming'] }) {
  if (!next) {
    return (
      <section className="bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-lg p-4">
        <h2 className="text-h2 font-semibold text-[var(--text-primary)] mb-2">Next Upcoming Assignment</h2>
        <p className="text-body-sm text-[var(--text-muted)]">No tasks scheduled in the next 48 hours.</p>
      </section>
    );
  }
  return (
    <section className="bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-h2 font-semibold text-[var(--text-primary)]">Next Upcoming Assignment</h2>
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[var(--state-warning-bg)] text-[var(--state-warning)] text-label">
          <Clock size={12} /> {relativeTime(next.scheduledFor)}
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[var(--surface-page)] p-4 rounded border border-[var(--border-subtle)]">
        <div>
          <p className="text-label text-[var(--text-muted)] mb-1">Service Area</p>
          <p className="text-body-md font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
            <MapPin size={14} /> {next.zone}
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-label text-[var(--text-muted)] mb-1">Task Details</p>
            <p className="text-body-md text-[var(--text-primary)]">{next.serviceTypeName}</p>
            <div className="mt-2 flex gap-1.5">
              <span className="px-1.5 py-0.5 rounded bg-[var(--surface-overlay)] text-[var(--text-secondary)] text-label">Priority: {next.priority}</span>
              <span className="px-1.5 py-0.5 rounded bg-[var(--surface-overlay)] text-[var(--text-secondary)] text-label">Est: {next.estDurationHours}h</span>
            </div>
          </div>
          <div className="flex gap-2">
            {next.taskId && (
              <Link
                href={`/provider/tasks/${next.taskId}`}
                className="flex-1 text-center py-2 bg-[var(--brand-gold)] text-[var(--brand-primary)] text-label rounded hover:opacity-90"
              >
                Start Task
              </Link>
            )}
            <Link
              href={`/provider/tasks/${next.taskId ?? next.assignmentId}`}
              className="text-center py-2 px-3 border border-[var(--border-subtle)] rounded text-label text-[var(--text-primary)] hover:bg-[var(--surface-overlay)]"
            >
              Details
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: ActivePipelineTable**

```tsx
// src/features/dashboard/components/provider/ActivePipelineTable.tsx
import Link from 'next/link';
import type { ProviderDashboardData } from '../../schemas/provider-dashboard.schema';

function statusBadge(s: string): string {
  if (s === 'IN_PROGRESS') return 'bg-[var(--state-warning-bg)] text-[var(--state-warning)]';
  if (s === 'COMPLETED')   return 'bg-[var(--state-success-bg)] text-[var(--state-success)]';
  return 'bg-[var(--surface-overlay)] text-[var(--text-secondary)]';
}

function formatWhen(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-GB', { weekday: 'short', hour: '2-digit', minute: '2-digit' });
}

export function ActivePipelineTable({ pipeline }: { pipeline: ProviderDashboardData['pipeline'] }) {
  if (pipeline.length === 0) {
    return (
      <section>
        <h2 className="text-h2 font-semibold text-[var(--text-primary)] mb-2">Active Pipeline</h2>
        <div className="rounded-lg border border-dashed border-[var(--border-subtle)] bg-[var(--surface-card)] p-6 text-center text-body-sm text-[var(--text-muted)]">
          No active assignments. Accept a job offer to fill your pipeline.
        </div>
      </section>
    );
  }
  return (
    <section>
      <h2 className="text-h2 font-semibold text-[var(--text-primary)] mb-2">Active Pipeline</h2>
      <div className="border border-[var(--border-subtle)] rounded-lg bg-[var(--surface-card)] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--surface-page)] border-b border-[var(--border-subtle)]">
              <th className="text-label uppercase text-[var(--text-muted)] px-3 py-2">ID</th>
              <th className="text-label uppercase text-[var(--text-muted)] px-3 py-2">Service</th>
              <th className="text-label uppercase text-[var(--text-muted)] px-3 py-2">Zone</th>
              <th className="text-label uppercase text-[var(--text-muted)] px-3 py-2">Scheduled</th>
              <th className="text-label uppercase text-[var(--text-muted)] px-3 py-2 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="text-body-sm text-[var(--text-primary)] tabular-nums">
            {pipeline.map((p, i) => (
              <tr key={p.assignmentId} className={`border-b border-[var(--border-subtle)] hover:bg-[var(--surface-page)] ${i % 2 === 1 ? 'bg-[var(--surface-page)]' : ''}`}>
                <td className="px-3 py-2 text-[var(--text-secondary)]">#{p.assignmentId.slice(0, 6).toUpperCase()}</td>
                <td className="px-3 py-2 font-medium">{p.serviceTypeName}</td>
                <td className="px-3 py-2 text-[var(--text-secondary)]">{p.zone}</td>
                <td className="px-3 py-2">{formatWhen(p.scheduledFor)}</td>
                <td className="px-3 py-2 text-right">
                  <Link
                    href={`/provider/tasks/${p.assignmentId}`}
                    className={`inline-flex items-center px-2 py-0.5 rounded text-label font-semibold ${statusBadge(p.status)}`}
                  >
                    {p.status.replaceAll('_', ' ')}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: TodayProgressTimeline**

```tsx
// src/features/dashboard/components/provider/TodayProgressTimeline.tsx
import { Check } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { ProviderDashboardData } from '../../schemas/provider-dashboard.schema';

export function TodayProgressTimeline({ steps }: { steps: ProviderDashboardData['todayProgress'] }) {
  return (
    <div className="bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-lg p-4">
      <h3 className="text-h2 font-semibold text-[var(--text-primary)] mb-4">Today's Progress</h3>
      <div className="relative pl-2">
        <div className="absolute left-[15px] top-4 bottom-4 w-px bg-[var(--border-subtle)]" />
        {steps.map((s, i) => (
          <div key={s.key} className={cn('relative flex items-start gap-4', i < steps.length - 1 && 'mb-4')}>
            <div
              className={cn(
                'w-6 h-6 rounded-full z-10 mt-0.5 flex items-center justify-center',
                s.state === 'completed' && 'bg-[var(--surface-card)] border border-[var(--brand-primary)]',
                s.state === 'active'    && 'bg-[var(--brand-primary)] shadow-[0_0_0_4px_rgba(20,27,46,0.1)]',
                s.state === 'pending'   && 'bg-[var(--surface-card)] border border-[var(--border-subtle)]',
              )}
            >
              {s.state === 'completed' && <Check size={12} className="text-[var(--brand-primary)]" />}
              {s.state === 'active' && <div className="w-2 h-2 rounded-full bg-[var(--surface-card)]" />}
            </div>
            <div>
              <div className={cn('text-label', s.state === 'pending' ? 'text-[var(--text-muted)]' : 'text-[var(--text-primary)] font-bold')}>
                {s.label}
              </div>
              <div className="text-body-sm text-[var(--text-secondary)]">{s.detail}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: QuickActionsPanel**

```tsx
// src/features/dashboard/components/provider/QuickActionsPanel.tsx
import Link from 'next/link';
import { Calendar, Settings } from 'lucide-react';

export function QuickActionsPanel() {
  return (
    <div className="bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-lg p-4">
      <h3 className="text-h2 font-semibold text-[var(--text-primary)] mb-2">Quick Actions</h3>
      <div className="flex flex-col gap-2">
        <Link href="/provider/settings" className="flex items-center gap-2 p-2 border border-[var(--border-subtle)] rounded hover:border-[var(--brand-primary)] transition-colors text-left">
          <Calendar size={16} className="text-[var(--text-muted)]" />
          <div>
            <div className="text-label text-[var(--text-primary)]">Update Availability</div>
            <div className="text-body-sm text-[var(--text-muted)]">Manage schedule blocks</div>
          </div>
        </Link>
        <Link href="/provider/settings" className="flex items-center gap-2 p-2 border border-[var(--border-subtle)] rounded hover:border-[var(--brand-primary)] transition-colors text-left">
          <Settings size={16} className="text-[var(--text-muted)]" />
          <div>
            <div className="text-label text-[var(--text-primary)]">Edit Profile</div>
            <div className="text-body-sm text-[var(--text-muted)]">Service categories + radius</div>
          </div>
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Skeletons**

```tsx
// src/features/dashboard/components/provider/skeletons.tsx
function Box({ className = '' }: { className?: string }) {
  return <div className={`rounded animate-pulse bg-[var(--surface-overlay)] ${className}`} />;
}

export function KpiBentoSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 flex flex-col gap-3">
          <Box className="h-3 w-20" />
          <Box className="h-8 w-32" />
          <Box className="h-3 w-24" />
        </div>
      ))}
    </div>
  );
}

export function PipelineSkeleton() {
  return (
    <div className="border border-[var(--border-subtle)] rounded-lg bg-[var(--surface-card)] p-4 flex flex-col gap-2">
      {[1, 2, 3].map((i) => <Box key={i} className="h-8 w-full" />)}
    </div>
  );
}

export function UpcomingSkeleton() {
  return (
    <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 flex flex-col gap-3">
      <Box className="h-4 w-48" />
      <Box className="h-16 w-full" />
    </div>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add src/features/dashboard/components/provider/
git commit -m "feat(provider-p0): dashboard widgets (upcoming, pipeline, timeline, quick actions, skeletons)

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 14: Dashboard page rewrite

**Files:**
- Modify: `src/app/(dashboard)/provider/page.tsx`
- Delete: `src/app/(dashboard)/provider/ratings/page.tsx`

- [ ] **Step 1: Replace page**

```tsx
// src/app/(dashboard)/provider/page.tsx
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/core/auth';
import RoleGuard from '@/components/RoleGuard';
import { DashboardHeader } from '@/shared/components/dashboard/DashboardHeader';
import { getProviderDashboard } from '@/features/dashboard/queries/provider';
import { ProviderKpiBento } from '@/features/dashboard/components/provider/ProviderKpiBento';
import { NextUpcomingAssignmentCard } from '@/features/dashboard/components/provider/NextUpcomingAssignmentCard';
import { ActivePipelineTable } from '@/features/dashboard/components/provider/ActivePipelineTable';
import { TodayProgressTimeline } from '@/features/dashboard/components/provider/TodayProgressTimeline';
import { QuickActionsPanel } from '@/features/dashboard/components/provider/QuickActionsPanel';
import { KpiBentoSkeleton, PipelineSkeleton, UpcomingSkeleton } from '@/features/dashboard/components/provider/skeletons';

export const dynamic = 'force-dynamic';

export default function ProviderDashboardPage() {
  return (
    <RoleGuard allowedRoles={['PROVIDER']}>
      <DashboardHeader title="Overview" subtitle="Today's operational metrics and active assignments." asOf={new Date()} />
      <Suspense fallback={<><KpiBentoSkeleton /><UpcomingSkeleton /><PipelineSkeleton /></>}>
        <DashboardContent />
      </Suspense>
    </RoleGuard>
  );
}

async function DashboardContent() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  if (session.user.role !== 'PROVIDER') redirect('/login');

  const data = await getProviderDashboard(session.user.id);

  return (
    <div className="flex flex-col gap-6">
      <ProviderKpiBento earnings={data.earnings} metrics={data.metrics} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <NextUpcomingAssignmentCard next={data.nextUpcoming} />
          <ActivePipelineTable pipeline={data.pipeline} />
        </div>
        <div className="flex flex-col gap-6">
          <TodayProgressTimeline steps={data.todayProgress} />
          <QuickActionsPanel />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Delete ratings standalone**

Run: `git rm src/app/(dashboard)/provider/ratings/page.tsx`

- [ ] **Step 3: Update tasks page to dense table**

Replace `src/app/(dashboard)/provider/tasks/page.tsx`:

```tsx
import { Suspense } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/core/auth';
import RoleGuard from '@/components/RoleGuard';
import { DashboardHeader } from '@/shared/components/dashboard/DashboardHeader';
import { prisma } from '@/core/database/client';
import { formatTZS } from '@/shared/lib/currency';

export const dynamic = 'force-dynamic';

export default function ProviderTasksPage() {
  return (
    <RoleGuard allowedRoles={['PROVIDER']}>
      <DashboardHeader title="Tasks" subtitle="Scheduled and in-progress task instances." />
      <Suspense fallback={<div className="text-body-sm text-[var(--text-muted)]">Loading…</div>}>
        <TasksContent />
      </Suspense>
    </RoleGuard>
  );
}

async function TasksContent() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  if (session.user.role !== 'PROVIDER') redirect('/login');

  const provider = await prisma.providerProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!provider) return null;

  const tasks = await prisma.task.findMany({
    where: { assignment: { providerId: provider.id }, status: { in: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED'] } },
    orderBy: { scheduledFor: 'asc' },
    take: 50,
    select: {
      id: true,
      scheduledFor: true,
      status: true,
      assignment: {
        select: {
          id: true,
          providerPayout: true,
          serviceType: { select: { name: true } },
          property: { select: { zone: true } },
        },
      },
    },
  });

  if (tasks.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[var(--border-subtle)] bg-[var(--surface-card)] p-8 text-center text-body-sm text-[var(--text-muted)]">
        No tasks yet. Accept a job offer to begin.
      </div>
    );
  }

  return (
    <div className="border border-[var(--border-subtle)] rounded-lg bg-[var(--surface-card)] overflow-x-auto">
      <table className="w-full text-left border-collapse min-w-[700px]">
        <thead>
          <tr className="bg-[var(--surface-page)] border-b border-[var(--border-subtle)]">
            <th className="text-label uppercase text-[var(--text-muted)] px-3 py-2">Task</th>
            <th className="text-label uppercase text-[var(--text-muted)] px-3 py-2">Service</th>
            <th className="text-label uppercase text-[var(--text-muted)] px-3 py-2">Zone</th>
            <th className="text-label uppercase text-[var(--text-muted)] px-3 py-2">Scheduled</th>
            <th className="text-label uppercase text-[var(--text-muted)] px-3 py-2 text-right">Payout</th>
            <th className="text-label uppercase text-[var(--text-muted)] px-3 py-2 text-right">Status</th>
          </tr>
        </thead>
        <tbody className="text-body-sm text-[var(--text-primary)] tabular-nums">
          {tasks.map((t, i) => (
            <tr key={t.id} className={`border-b border-[var(--border-subtle)] ${i % 2 === 1 ? 'bg-[var(--surface-page)]' : ''}`}>
              <td className="px-3 py-2 text-[var(--text-secondary)]">
                <Link href={`/provider/tasks/${t.id}`} className="hover:underline">
                  #{t.id.slice(0, 6).toUpperCase()}
                </Link>
              </td>
              <td className="px-3 py-2 font-medium">{t.assignment.serviceType.name}</td>
              <td className="px-3 py-2 text-[var(--text-secondary)]">{t.assignment.property.zone}</td>
              <td className="px-3 py-2">
                {t.scheduledFor.toLocaleString('en-GB', { weekday: 'short', hour: '2-digit', minute: '2-digit' })}
              </td>
              <td className="px-3 py-2 text-right">{formatTZS(t.assignment.providerPayout.toString())}</td>
              <td className="px-3 py-2 text-right">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-label bg-[var(--surface-overlay)] text-[var(--text-secondary)]">
                  {t.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 4: Build verification**

Run: `pnpm build`
Expected: build succeeds, all provider routes compile.

- [ ] **Step 5: Component test for dashboard render**

```tsx
// src/features/dashboard/tests/provider-dashboard.components.test.tsx
import { render, screen } from '@testing-library/react';
import { ProviderKpiBento } from '../components/provider/ProviderKpiBento';

describe('ProviderKpiBento', () => {
  it('renders 80% Share badge on earnings card', () => {
    render(
      <ProviderKpiBento
        earnings={{ todayTZS: 50000, pendingTZS: 0, availableTZS: 0 }}
        metrics={{ activeTaskCount: 3, acceptanceRate: 96, acceptanceRateDeltaPct: 2, rating: 4.9, ratingCount: 12, strikeCount: 0 }}
      />
    );
    expect(screen.getByText('80% Share')).toBeInTheDocument();
    expect(screen.getByText('TZS 50,000')).toBeInTheDocument();
    expect(screen.getByText(/96%/)).toBeInTheDocument();
  });
});
```

Run: `pnpm test:run src/features/dashboard/tests/provider-dashboard.components.test.tsx`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/app/(dashboard)/provider/page.tsx src/app/(dashboard)/provider/tasks/page.tsx src/features/dashboard/tests/provider-dashboard.components.test.tsx
git rm src/app/(dashboard)/provider/ratings/page.tsx
git commit -m "feat(provider-p0): dashboard + tasks page rewrites; drop ratings standalone

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 15: Final pass — typecheck, full test suite, manual smoke

- [ ] **Step 1: Typecheck**

Run: `pnpm tsc --noEmit`
Expected: zero errors.

- [ ] **Step 2: Full unit test run**

Run: `pnpm test:run`
Expected: all new tests + existing tests pass.

- [ ] **Step 3: Lint**

Run: `pnpm lint`
Expected: no errors. Fix any warnings introduced.

- [ ] **Step 4: Dev-server smoke**

Run: `pnpm dev`
Manually visit while logged in as provider:
- `/provider` — bento + upcoming + pipeline + timeline render
- `/provider/assignments` — existing assignment cards still work
- `/provider/tasks` — dense table, click row → detail
- `/provider/tasks/<id>` — step tracker + GPS card + (after check-in) proof-of-work
- `/provider/wallet` — bento + Request Payout opens modal → confirm → success modal

- [ ] **Step 5: Final commit (if any fixes)**

```bash
git add -A
git commit -m "chore(provider-p0): final polish after smoke test

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Self-Review

### Spec coverage

| Full.md section | Task |
|---|---|
| §X provider register/verify | Out of scope (P1.8) — backend already enforces |
| §XI ranking engine | Out of scope (P2.12) — backend exists |
| §XII work-order lifecycle / 6h window | Tasks 3 (tracker), 4 (query), 7 (page) |
| §XIII GPS 200m + evidence ≥3 | Tasks 5 (GPS modal), 6 (evidence upload) |
| §XIV invoice generation | Out of scope — owner-side concern |
| §XV/§XVI 80/20 split | Surfaced in Task 12 KPI ("80% Share" badge), Task 11 (Pending Clearing, Total Earned) |
| §XVII wallet, 50k TZS min, 24h SLA | Tasks 8 (request modal w/ min), 9 (success modal), 10 (history), 11 (wallet page) |
| §XXI isolation (no owner PII) | Task 4 — `exactAddress` null pre-acceptance, only `zone` always |
| §XIII overdue handling | Surfaced via status badges in Task 13 pipeline + Task 14 tasks table; no separate alert |

### Placeholder scan

Checked plan body for: "TBD", "TODO", "implement later", "Add appropriate error handling", "Similar to Task N". None present. All component bodies show full implementation.

### Type consistency

- `AssignmentStatus` (Task 3) — uses existing union from `src/features/assignments/types.ts`.
- `ProviderTaskDetail` (Task 4) — referenced by Task 7 page; field names match (`assignment.id`, `property.exactAddress`, etc.).
- `WalletSummary` (Task 10) — extended once, consumed in Tasks 11, downstream `transactions[].runningBalance` referenced.
- `ProviderDashboardData` (Task 12) — referenced by Tasks 12, 13, 14. Fields verified consistent.
- `requestWithdrawal` signature — Task 8 calls `(walletId, amount, mobileNumber)` matching existing `src/features/wallets/actions.ts:279`.
- `submitTaskEvidence` signature — Task 6 calls `(taskId, imageDataUrls)` matching existing action (renamed param `imageUrls` → `imageDataUrls` for clarity).
- `checkInToTask` signature — Task 5 calls `(taskId, lat, lng, options)` matching existing action `src/features/tasks/actions.ts:96`.

### Gap fixes inline

Task 6 Step 1 includes a minor rename in `actions.ts` (param semantics already correct; type unchanged). No other gaps found.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-05-18-provider-section-p0.md`. Two execution options:

**1. Subagent-Driven (recommended)** — dispatch a fresh subagent per task (15 tasks), review between tasks, fast iteration.

**2. Inline Execution** — execute tasks in this session using executing-plans, batch execution with checkpoints.

Which approach?
