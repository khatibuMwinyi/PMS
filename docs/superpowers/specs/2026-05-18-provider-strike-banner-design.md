# Provider Strike + Suspension Banner — Design Spec

**Status:** Approved 2026-05-18
**Scope:** P1.7 (single feature, single implementation plan)
**Owner:** Provider section
**Related:** Provider P0 ([plan](../plans/2026-05-18-provider-section-p0.md), merged `aa4fb0c`), P1.5 Task History (merged `b25a2eb`)

---

## Goal

Surface the provider's strike count and suspension state on the provider dashboard so they self-correct before a 3rd strike triggers a 30-day suspension (Full.md §VIII), and clearly understand the consequences when already suspended.

## Non-Goals

- Strike detail / audit view (deferred — banner shows count only).
- Notifications when a strike is applied (separate concern).
- Reactivation / appeal flow.
- Dismiss / acknowledge state — banner is informational and persists until state changes.
- Showing the banner on pages other than `/provider` dashboard.

## Constraints

- **Spec §VIII strike system:** no-show = 1 strike, dispute lost = 1 strike, late completion >2h = 0.5 strike. At 3 strikes the system sets `suspendedUntil = now + 30 days` and the provider stops receiving offers.
- **Schema:** `ProviderProfile.strikeCount: Int` and `ProviderProfile.suspendedUntil: DateTime?` already exist (verified at `prisma/schema.prisma:324-325`). No migration required.
- **No new dependencies.** Reuse existing CSS-variable tokens (`var(--state-warning-bg)`, `var(--state-warning)`, `var(--state-error-bg)`, `var(--state-error)`) and Lucide icons (`AlertTriangle`, `AlertOctagon`, `Ban`).
- **Server-only rendering.** Banner is a pure Server Component — no `'use client'`, no state.

## Architecture

```
src/app/(dashboard)/provider/page.tsx
  └── DashboardContent (server, existing)
        └── <StrikeBanner metrics={data.metrics} />   ← NEW, top of column
        └── <ProviderKpiBento ... />
        └── ... (existing widgets)
```

Single component, single conditional render. `StrikeBanner` reads two fields from the dashboard query and computes a severity tier internally. Returns `null` when no banner is warranted.

## Components

| Unit | Path | Responsibility |
|---|---|---|
| `ProviderDashboardData` schema | `src/features/dashboard/schemas/provider-dashboard.schema.ts` (modify) | Add `suspendedUntil: string \| null` to `metrics` interface. |
| `getProviderDashboard` query | `src/features/dashboard/queries/provider.ts` (modify) | Select `suspendedUntil` from `providerProfile`, surface in `metrics.suspendedUntil` as ISO string or null. Empty dashboard returns `null`. |
| `StrikeBanner` | `src/features/dashboard/components/provider/StrikeBanner.tsx` (NEW) | Pure render — `null` when severity is `none`; warning / critical / suspended variants. |
| Banner tests | `src/features/dashboard/components/provider/StrikeBanner.test.tsx` (NEW) | All four severity branches + suspendedUntil edge cases. |
| Dashboard page | `src/app/(dashboard)/provider/page.tsx` (modify) | Insert `<StrikeBanner metrics={data.metrics} />` at top of `DashboardContent` column. |
| Dashboard query test | `src/features/dashboard/tests/provider-dashboard.queries.test.ts` (modify) | Extend existing "aggregates ..." test to assert `suspendedUntil` field present. Add one new test for active suspension. |

Each unit has one clear responsibility. `StrikeBanner` is the only component that knows the tier rules.

## Severity logic

```ts
type Tier = 'suspended' | 'critical' | 'warning' | 'none';

function tier(strikeCount: number, suspendedUntil: string | null): Tier {
  if (suspendedUntil && new Date(suspendedUntil) > new Date()) return 'suspended';
  if (strikeCount >= 2) return 'critical';
  if (strikeCount >= 1) return 'warning';
  return 'none';
}
```

Order matters: `suspended` wins over strike count. If `suspendedUntil` is set but in the past, treat as expired and fall through to strike-count tier.

## Visual variants

| Tier | Icon | Container | Title | Body |
|---|---|---|---|---|
| `warning` | `AlertTriangle` | `bg-[var(--state-warning-bg)] text-[var(--state-warning)] border-[var(--state-warning)]/30` | "You have 1 strike" | "2 more strikes will result in a 30-day suspension. Avoid no-shows and late completions to keep your account active." |
| `critical` | `AlertOctagon` | `bg-[var(--state-error-bg)] text-[var(--state-error)] border-[var(--state-error)]/30` | "You have 2 strikes" | "One more strike will suspend your account for 30 days. Keep your scheduled tasks on time and check in within the GPS radius." |
| `suspended` | `Ban` | `bg-[var(--state-error-bg)] text-[var(--state-error)] border-[var(--state-error)]/30` | "Account suspended" | "You cannot accept new work orders until **{DATE}**." DATE rendered via `Intl.DateTimeFormat('en-GB', { dateStyle: 'long' })`. |

Layout: horizontal flex, icon left (size 20), heading + body right. Rounded `rounded-lg`, padded `p-4`, full width of the dashboard content column.

When `strikeCount >= 3` but `suspendedUntil` is null (data inconsistency), the banner falls through to `critical`. The backend is responsible for setting `suspendedUntil`; the banner doesn't second-guess.

## Data flow

1. Dashboard page Server Component awaits `getProviderDashboard(session.user.id)`.
2. Query selects `providerProfile.suspendedUntil` alongside the existing fields, maps to `metrics.suspendedUntil` (ISO string or null).
3. Page renders `<StrikeBanner metrics={data.metrics} />` BEFORE the bento.
4. `StrikeBanner` calls `tier(...)`, returns `null` for `none`, otherwise renders the matching variant.

## Edge cases

| Case | Behavior |
|---|---|
| `strikeCount = 0` AND `suspendedUntil = null` | Banner returns `null`. |
| `strikeCount = 0` AND `suspendedUntil` in past | Banner returns `null` (suspension expired, no current strikes). |
| `strikeCount = 1` AND `suspendedUntil` in past | Warning tier (suspension expired, strike still on record). |
| `strikeCount = 3` AND `suspendedUntil` is null | Falls through to `critical`. Backend bug, but UI is graceful. |
| `strikeCount = 2` AND `suspendedUntil` in future | `suspended` wins (active suspension trumps strike-count display). |
| Empty profile (no provider yet) | `getProviderDashboard` returns `emptyDashboard()`. `metrics.strikeCount = 0`, `metrics.suspendedUntil = null`. Banner returns `null`. |

## Privacy & security

No PII rendered. No external data. No authenticated mutation. Banner is read-only render based on the provider's own profile.

## Testing

### Unit tests (`StrikeBanner.test.tsx`)

| Test | Asserts |
|---|---|
| Returns null when 0 strikes and no suspension | `container.firstChild` is `null`. |
| Renders warning tier at 1 strike | "1 strike" copy visible; icon-test selector for AlertTriangle. |
| Renders critical tier at 2 strikes | "2 strikes" copy visible. |
| Renders critical tier at 3 strikes when suspendedUntil null | Falls through correctly. |
| Renders suspended tier when suspendedUntil in future | Suspension date rendered as long-form en-GB. |
| Treats past suspendedUntil as expired | Falls through to strike-count tier. |

### Query test (`provider-dashboard.queries.test.ts` extension)

| Test | Asserts |
|---|---|
| Existing "aggregates wallet today earnings + provider profile metrics" | Add `suspendedUntil: null` to the mock profile; assert `metrics.suspendedUntil === null`. |
| NEW "surfaces suspendedUntil when set" | Mock with `suspendedUntil = future date`; assert `metrics.suspendedUntil` is the ISO string. |

### Page integration

No new page test required. Existing dashboard wiring tests cover the prop passing.

## Out of scope (P2 / later P1)

- Strike audit log view (`ProviderStrike` model is in schema but not yet surfaced).
- Per-strike reason rendering.
- Notification on strike application (separate `notifications` feature).
- Appeal / reactivation flow.
- Showing the banner on `/provider/tasks` or `/provider/tasks/[id]` (could be added later via a shared layout banner).
