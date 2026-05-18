# Provider Strike + Suspension Banner Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Surface strike count and suspension state at the top of the provider dashboard with a 4-tier severity banner (none/warning/critical/suspended) computed from existing `ProviderProfile.strikeCount` + `ProviderProfile.suspendedUntil`.

**Architecture:** Extend `getProviderDashboard` to return `suspendedUntil` alongside `strikeCount`. Add a pure Server Component `StrikeBanner` that reads both, picks a tier, and renders the matching variant (or `null`). Render at the top of `DashboardContent` above `ProviderKpiBento`.

**Tech Stack:** Next.js 16 (App Router), TypeScript 5.6, React 19, Prisma 5.20, Vitest 4 + RTL, Tailwind via CSS-variable tokens, Lucide icons.

**Spec:** [docs/superpowers/specs/2026-05-18-provider-strike-banner-design.md](../specs/2026-05-18-provider-strike-banner-design.md)

---

## Conventions

- `cn` from `@/lib/cn`, prisma from `@/core/database/client`, auth from `@/core/auth`.
- Vitest globals on. Test runner: `pnpm test:run`.
- Mock `@/core/database/client` with `vi.mock` (project pattern — see `src/features/dashboard/tests/provider-dashboard.queries.test.ts`).
- Tailwind: CSS-variable tokens (`var(--state-warning)`, `var(--state-warning-bg)`, `var(--state-error)`, `var(--state-error-bg)`).
- Commits: Conventional Commits + `Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>` trailer (HEREDOC).
- Branch: create `feat/provider-strike-banner` worktree off master before Task 1.

---

## File Map

### Created

- `src/features/dashboard/components/provider/StrikeBanner.tsx`
- `src/features/dashboard/components/provider/StrikeBanner.test.tsx`

### Modified

- `src/features/dashboard/schemas/provider-dashboard.schema.ts` — add `suspendedUntil: string | null` to `metrics` interface
- `src/features/dashboard/queries/provider.ts` — select `suspendedUntil`, surface in `metrics`, extend `emptyDashboard()`
- `src/features/dashboard/tests/provider-dashboard.queries.test.ts` — extend two tests, add one new test
- `src/app/(dashboard)/provider/page.tsx` — render `<StrikeBanner metrics={data.metrics} />` above bento

---

## Branch setup

- [ ] **Step 0: Create worktree on new branch**

```bash
git -C F:/OPSMP/PropertManagement worktree add F:/OPSMP/PropertManagement/.worktrees/provider-strike-banner -b feat/provider-strike-banner master
cd F:/OPSMP/PropertManagement/.worktrees/provider-strike-banner
pnpm install
```

If the previous `.worktrees/provider-task-history` directory still exists locked, ignore it — the new path is independent.

---

## Task 1: Extend ProviderDashboardData schema

**Files:**
- Modify: `src/features/dashboard/schemas/provider-dashboard.schema.ts`

- [ ] **Step 1: Read current schema**

Read `src/features/dashboard/schemas/provider-dashboard.schema.ts` so the diff is targeted. The `metrics` interface currently is:

```ts
metrics: {
  activeTaskCount: number;
  acceptanceRate: number;
  acceptanceRateDeltaPct: number;
  rating: number;
  ratingCount: number;
  strikeCount: number;
};
```

- [ ] **Step 2: Add `suspendedUntil` to metrics**

Edit the `metrics` interface in `ProviderDashboardData` to:

```ts
metrics: {
  activeTaskCount: number;
  acceptanceRate: number;
  acceptanceRateDeltaPct: number;
  rating: number;
  ratingCount: number;
  strikeCount: number;
  suspendedUntil: string | null;
};
```

No other changes in this file.

- [ ] **Step 3: Typecheck**

Run: `pnpm tsc --noEmit 2>&1 | grep -E "provider-dashboard\.schema\.ts"`
Expected: empty output. (Other files referencing `metrics` will surface errors here; we fix them in Tasks 2 + 3.)

- [ ] **Step 4: Commit**

```bash
git -C F:/OPSMP/PropertManagement/.worktrees/provider-strike-banner add src/features/dashboard/schemas/provider-dashboard.schema.ts
git -C F:/OPSMP/PropertManagement/.worktrees/provider-strike-banner commit -m "$(cat <<'EOF'
feat(provider-strike): extend ProviderDashboardData.metrics with suspendedUntil

Adds suspendedUntil (ISO string or null) to the metrics shape so the new
StrikeBanner can render a 'suspended' tier without a separate query.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Surface suspendedUntil in getProviderDashboard

**Files:**
- Modify: `src/features/dashboard/queries/provider.ts`
- Modify: `src/features/dashboard/tests/provider-dashboard.queries.test.ts`

- [ ] **Step 1: Update the existing "aggregates ..." test**

In `src/features/dashboard/tests/provider-dashboard.queries.test.ts`, find the test `it('aggregates wallet today earnings + provider profile metrics', ...)`. Add `suspendedUntil: null` to the `providerProfile.findUnique` mock return value, and add this assertion at the end of the test (after the existing `expect(data.metrics.strikeCount).toBe(0)`):

```ts
expect(data.metrics.suspendedUntil).toBeNull();
```

The mock should now look like:

```ts
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
```

- [ ] **Step 2: Update the existing "null nextUpcoming" test**

Same file. Find `it('returns null nextUpcoming when no scheduled tasks in next 48h', ...)`. Add `suspendedUntil: null` to its mock. Same change for the test `it('builds pipeline from active assignments', ...)` and `it('picks nextUpcoming as soonest task in [now, now+2d]', ...)`. Every mock that returns a profile object now needs the `suspendedUntil` field. If you skip one, the test still passes (Prisma mock returns `undefined`), but the query will produce `metrics.suspendedUntil === undefined` instead of `null` and the new test below will fail downstream — fix all four mocks.

- [ ] **Step 3: Add new test for active suspension**

Add at the bottom of the existing `describe('getProviderDashboard', ...)` block (before the closing `})`):

```ts
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
```

- [ ] **Step 4: Run tests to verify they fail**

Run: `pnpm test:run src/features/dashboard/tests/provider-dashboard.queries.test.ts`
Expected: FAIL — `metrics.suspendedUntil` is `undefined` in implementation, not `null` / ISO string.

- [ ] **Step 5: Update query implementation**

In `src/features/dashboard/queries/provider.ts`:

1. The `providerProfile.findUnique` call already does `include: { wallet: true }`. Prisma returns the full profile including `suspendedUntil` automatically — no select change needed. Just consume the field.

2. Inside the main `return { ... }` object's `metrics: { ... }` block, append the `suspendedUntil` line so the block becomes:

```ts
    metrics: {
      activeTaskCount: activeAssignments.length,
      acceptanceRate: parseFloat(rateNow.toFixed(1)),
      acceptanceRateDeltaPct: parseFloat((rateNow - ratePrev).toFixed(1)),
      rating: parseFloat(provider.rating.toFixed(2)),
      ratingCount: provider.completedJobs,
      strikeCount: provider.strikeCount,
      suspendedUntil: provider.suspendedUntil ? provider.suspendedUntil.toISOString() : null,
    },
```

3. Update `emptyDashboard()` to include `suspendedUntil: null`:

```ts
function emptyDashboard(): ProviderDashboardData {
  return {
    earnings: { todayTZS: 0, pendingTZS: 0, availableTZS: 0 },
    metrics: { activeTaskCount: 0, acceptanceRate: 0, acceptanceRateDeltaPct: 0, rating: 0, ratingCount: 0, strikeCount: 0, suspendedUntil: null },
    nextUpcoming: null,
    pipeline: [],
    todayProgress: [],
  };
}
```

- [ ] **Step 6: Run tests to verify pass**

Run: `pnpm test:run src/features/dashboard/tests/provider-dashboard.queries.test.ts`
Expected: PASS (7 tests — 5 existing + 2 new).

- [ ] **Step 7: Commit**

```bash
git -C F:/OPSMP/PropertManagement/.worktrees/provider-strike-banner add src/features/dashboard/queries/provider.ts src/features/dashboard/tests/provider-dashboard.queries.test.ts
git -C F:/OPSMP/PropertManagement/.worktrees/provider-strike-banner commit -m "$(cat <<'EOF'
feat(provider-strike): surface suspendedUntil from getProviderDashboard

Returns suspendedUntil as ISO string when present, null otherwise. Extends
emptyDashboard() to include the new field. Test mocks updated; new test
exercises active suspension and missing-profile branches.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: StrikeBanner component

**Files:**
- Create: `src/features/dashboard/components/provider/StrikeBanner.tsx`
- Create: `src/features/dashboard/components/provider/StrikeBanner.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/features/dashboard/components/provider/StrikeBanner.test.tsx
import { render, screen } from '@testing-library/react';
import { StrikeBanner } from './StrikeBanner';
import type { ProviderDashboardData } from '../../schemas/provider-dashboard.schema';

function makeMetrics(overrides: Partial<ProviderDashboardData['metrics']> = {}): ProviderDashboardData['metrics'] {
  return {
    activeTaskCount: 0,
    acceptanceRate: 0,
    acceptanceRateDeltaPct: 0,
    rating: 0,
    ratingCount: 0,
    strikeCount: 0,
    suspendedUntil: null,
    ...overrides,
  };
}

describe('StrikeBanner', () => {
  it('renders nothing when 0 strikes and no suspension', () => {
    const { container } = render(<StrikeBanner metrics={makeMetrics()} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when suspendedUntil is in the past and no strikes', () => {
    const past = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { container } = render(<StrikeBanner metrics={makeMetrics({ suspendedUntil: past })} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders warning tier at 1 strike', () => {
    render(<StrikeBanner metrics={makeMetrics({ strikeCount: 1 })} />);
    expect(screen.getByText('You have 1 strike')).toBeInTheDocument();
    expect(screen.getByText(/2 more strikes will result in a 30-day suspension/)).toBeInTheDocument();
  });

  it('renders critical tier at 2 strikes', () => {
    render(<StrikeBanner metrics={makeMetrics({ strikeCount: 2 })} />);
    expect(screen.getByText('You have 2 strikes')).toBeInTheDocument();
    expect(screen.getByText(/One more strike will suspend your account/)).toBeInTheDocument();
  });

  it('renders critical tier at 3 strikes when suspendedUntil is null (data inconsistency)', () => {
    render(<StrikeBanner metrics={makeMetrics({ strikeCount: 3 })} />);
    expect(screen.getByText('You have 3 strikes')).toBeInTheDocument();
    expect(screen.getByText(/One more strike will suspend your account/)).toBeInTheDocument();
  });

  it('renders suspended tier when suspendedUntil is in the future', () => {
    const future = new Date('2026-06-15T00:00:00Z').toISOString();
    render(<StrikeBanner metrics={makeMetrics({ strikeCount: 3, suspendedUntil: future })} />);
    expect(screen.getByText('Account suspended')).toBeInTheDocument();
    // 15 June 2026 in en-GB long format
    expect(screen.getByText(/15 June 2026/)).toBeInTheDocument();
  });

  it('treats expired suspendedUntil as expired (falls through to strike count)', () => {
    const past = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    render(<StrikeBanner metrics={makeMetrics({ strikeCount: 1, suspendedUntil: past })} />);
    // Banner should be warning tier, not suspended
    expect(screen.getByText('You have 1 strike')).toBeInTheDocument();
    expect(screen.queryByText('Account suspended')).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run to verify fail**

Run: `pnpm test:run src/features/dashboard/components/provider/StrikeBanner.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

```tsx
// src/features/dashboard/components/provider/StrikeBanner.tsx
import { AlertTriangle, AlertOctagon, Ban } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ProviderDashboardData } from '../../schemas/provider-dashboard.schema';

type Tier = 'suspended' | 'critical' | 'warning' | 'none';

function pickTier(strikeCount: number, suspendedUntil: string | null): Tier {
  if (suspendedUntil && new Date(suspendedUntil) > new Date()) return 'suspended';
  if (strikeCount >= 2) return 'critical';
  if (strikeCount >= 1) return 'warning';
  return 'none';
}

function formatSuspensionDate(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', { dateStyle: 'long' }).format(new Date(iso));
}

interface Props {
  metrics: ProviderDashboardData['metrics'];
}

export function StrikeBanner({ metrics }: Props) {
  const tier = pickTier(metrics.strikeCount, metrics.suspendedUntil);
  if (tier === 'none') return null;

  let icon: LucideIcon;
  let title: string;
  let body: React.ReactNode;
  let container: string;

  if (tier === 'suspended') {
    icon = Ban;
    title = 'Account suspended';
    body = (
      <>
        You cannot accept new work orders until{' '}
        <strong>{formatSuspensionDate(metrics.suspendedUntil!)}</strong>.
      </>
    );
    container = 'bg-[var(--state-error-bg)] text-[var(--state-error)] border-[var(--state-error)]/30';
  } else if (tier === 'critical') {
    icon = AlertOctagon;
    title = `You have ${metrics.strikeCount} strikes`;
    body =
      'One more strike will suspend your account for 30 days. Keep your scheduled tasks on time and check in within the GPS radius.';
    container = 'bg-[var(--state-error-bg)] text-[var(--state-error)] border-[var(--state-error)]/30';
  } else {
    icon = AlertTriangle;
    title = `You have ${metrics.strikeCount} strike${metrics.strikeCount === 1 ? '' : 's'}`;
    body =
      '2 more strikes will result in a 30-day suspension. Avoid no-shows and late completions to keep your account active.';
    container = 'bg-[var(--state-warning-bg)] text-[var(--state-warning)] border-[var(--state-warning)]/30';
  }

  const Icon = icon;

  return (
    <div className={`rounded-lg border ${container} p-4 flex items-start gap-3`} role="alert">
      <Icon size={20} className="shrink-0 mt-0.5" aria-hidden />
      <div>
        <h3 className="text-h2 font-semibold">{title}</h3>
        <p className="text-body-sm mt-1">{body}</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run to verify pass**

Run: `pnpm test:run src/features/dashboard/components/provider/StrikeBanner.test.tsx`
Expected: PASS (7 tests).

- [ ] **Step 5: Commit**

```bash
git -C F:/OPSMP/PropertManagement/.worktrees/provider-strike-banner add src/features/dashboard/components/provider/StrikeBanner.tsx src/features/dashboard/components/provider/StrikeBanner.test.tsx
git -C F:/OPSMP/PropertManagement/.worktrees/provider-strike-banner commit -m "$(cat <<'EOF'
feat(provider-strike): StrikeBanner Server Component

Pure render — null when no banner needed, otherwise warning/critical/
suspended variant. Tier rule: active suspendedUntil wins, then >=2 strikes
= critical, >=1 = warning. Expired suspendedUntil falls through to strike
count. Suspension date rendered long-form en-GB.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Render banner on dashboard

**Files:**
- Modify: `src/app/(dashboard)/provider/page.tsx`

- [ ] **Step 1: Read current dashboard page**

Read `src/app/(dashboard)/provider/page.tsx` to see the current `DashboardContent` body. The current return looks roughly like:

```tsx
return (
  <div className="flex flex-col gap-6">
    <ProviderKpiBento earnings={data.earnings} metrics={data.metrics} />
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* ... */}
    </div>
  </div>
);
```

- [ ] **Step 2: Add import**

At the top of the file, add the StrikeBanner import. After the existing `ProviderKpiBento` import, insert:

```tsx
import { StrikeBanner } from '@/features/dashboard/components/provider/StrikeBanner';
```

- [ ] **Step 3: Insert banner above bento**

Modify the `DashboardContent` return so the JSX is:

```tsx
return (
  <div className="flex flex-col gap-6">
    <StrikeBanner metrics={data.metrics} />
    <ProviderKpiBento earnings={data.earnings} metrics={data.metrics} />
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* ...existing children unchanged... */}
    </div>
  </div>
);
```

`StrikeBanner` returns `null` when no banner is needed, so this is safe to always render.

- [ ] **Step 4: Scoped typecheck**

Run: `pnpm tsc --noEmit 2>&1 | grep -E "provider/page\.tsx"`
Expected: empty output.

- [ ] **Step 5: Commit**

```bash
git -C F:/OPSMP/PropertManagement/.worktrees/provider-strike-banner add "src/app/(dashboard)/provider/page.tsx"
git -C F:/OPSMP/PropertManagement/.worktrees/provider-strike-banner commit -m "$(cat <<'EOF'
feat(provider-strike): render StrikeBanner on /provider dashboard

Banner sits above the KPI bento. Server-component path-through; banner
self-determines whether to render based on metrics.strikeCount + metrics.suspendedUntil.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Final pass + merge

- [ ] **Step 1: Run full test suite**

Run: `pnpm test:run`
Expected:
- All provider P0 tests still pass
- All P1.5 history tests still pass (26)
- All new tests pass (7 StrikeBanner + 2 new query tests + 4 mock-updated existing query tests still pass)
- 11 pre-existing LoginForm/RegisterForm failures unchanged

If any test other than the 11 baseline failures fails, fix before commit.

- [ ] **Step 2: Scoped tsc check**

Run:
```bash
pnpm tsc --noEmit 2>&1 | grep -vE "test\.(ts|tsx)" | grep -E "error TS" | grep -E "(features/dashboard|app/\(dashboard\)/provider/page\.tsx)"
```
Expected: empty output.

- [ ] **Step 3: Merge to master**

```bash
git -C F:/OPSMP/PropertManagement checkout master
git -C F:/OPSMP/PropertManagement merge --no-ff feat/provider-strike-banner -m "$(cat <<'EOF'
Merge feat/provider-strike-banner: dashboard banner (P1.7)

4 commits implementing per
docs/superpowers/specs/2026-05-18-provider-strike-banner-design.md.

What landed:
- ProviderDashboardData.metrics extended with suspendedUntil (ISO|null)
- getProviderDashboard surfaces suspendedUntil; emptyDashboard() updated
- StrikeBanner Server Component (4-tier: none/warning/critical/suspended)
- Rendered atop /provider dashboard above ProviderKpiBento

No schema migration (uses existing ProviderProfile.strikeCount + suspendedUntil).
7 new component tests, 2 new query tests. 11 pre-existing failures unchanged.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 4: Clean up worktree**

```bash
git -C F:/OPSMP/PropertManagement worktree remove F:/OPSMP/PropertManagement/.worktrees/provider-strike-banner
git -C F:/OPSMP/PropertManagement branch -d feat/provider-strike-banner
```

If Windows holds the worktree directory, run `rm -rf F:/OPSMP/PropertManagement/.worktrees/provider-strike-banner && git -C F:/OPSMP/PropertManagement worktree prune`. If that also fails (locked), leave the directory for later cleanup — the branch and metadata will still be removed.

---

## Self-Review

### Spec coverage

| Spec requirement | Task |
|---|---|
| Goal: strike count + suspension on dashboard | Task 4 (renders banner) |
| 4-tier severity logic | Task 3 (pickTier) |
| Variant copy (warning / critical / suspended) | Task 3 (component) |
| Schema: add `suspendedUntil` to metrics | Task 1 |
| Query: surface `suspendedUntil` ISO string or null | Task 2 |
| `emptyDashboard()` extended | Task 2 (Step 5 part 3) |
| `strikeCount >= 3` with null suspendedUntil falls to critical | Task 3 (test #5) |
| Expired suspendedUntil treated as expired | Task 3 (test #7) |
| Suspension date long-form en-GB | Task 3 (formatSuspensionDate) |
| Banner placement above bento | Task 4 |
| No new dependencies | Confirmed — Lucide + existing tokens only |
| No `'use client'` | Task 3 (Server Component) |

All 12 spec requirements covered.

### Placeholder scan

No "TBD", "TODO", "Add appropriate error handling", or vague language. Every step has explicit code or commands.

### Type consistency

- `ProviderDashboardData['metrics']` extended in Task 1; consumed in Tasks 2, 3, 4 — same field name (`suspendedUntil`), same type (`string | null`).
- `pickTier(strikeCount: number, suspendedUntil: string | null): Tier` — signature defined once in Task 3.
- `StrikeBanner` props `{ metrics: ProviderDashboardData['metrics'] }` — consistent between Task 3 definition and Task 4 usage.
- Test imports `ProviderDashboardData` from `../../schemas/provider-dashboard.schema` — same file Task 1 modified.

No naming drift.

### Gaps fixed inline

- Initial draft of Task 3 used a `switch` over the tier. Reworked to if/else if for cleaner narrowing of `metrics.suspendedUntil!` (non-null assertion only in the `suspended` branch where the tier guarantees it).
- Task 2's "all four mocks need suspendedUntil" instruction was originally vague — now lists the test names explicitly so the implementer doesn't miss one.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-05-18-provider-strike-banner.md`. Two execution options:

1. **Subagent-Driven (recommended)** — dispatch a fresh subagent per task (5 tasks), review between tasks.
2. **Inline Execution** — execute tasks in this session using executing-plans.

Which approach?
