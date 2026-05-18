# Provider Task History — Design Spec

**Status:** Approved 2026-05-18
**Scope:** P1.5 (single feature, single implementation plan)
**Owner:** Provider section
**Related:** Provider P0 ([plan](../plans/2026-05-18-provider-section-p0.md), merged `aa4fb0c`)

---

## Goal

Give a logged-in PROVIDER a paginated, filterable view of every task instance that has left the active pipeline — completed, verified, disputed, overdue, or cancelled — so they can audit their own performance, find a specific past task, and corroborate wallet earnings against work done.

## Non-Goals

- Owner-facing history (separate feature, lives under `/owner/...`).
- Aggregate analytics or charts. Use `/provider` dashboard for trends.
- Sortable column headers. URL state covers status + page only.
- Date range UI control. A fixed 90-day window applied server-side keeps queries fast against the spec's 7-year data retention.
- E2E tests. Unit + component tests only, matching P0 scope decision.

## Constraints

- **Privacy (Full.md §XXI):** History rows never include owner identity. Zone (neighbourhood) is always safe to show; exact street address is NOT surfaced even post-acceptance, since history is read-only and the provider does not need to navigate to the property again.
- **Performance (Full.md §XXIII):** Pricing/page loads < 2s. Default 90-day window + page size 20 + indexed `task.scheduledFor` keep the query under budget.
- **Currency (Full.md §XV):** All payouts displayed in TZS via `formatTZS`.
- **Existing patterns:** Match `/provider/tasks` (dense table), `/provider/assignments` (page-based pagination), `/owner/dashboard` (DashboardHeader + Suspense + skeletons).

## Architecture

```
/provider/history?status=VERIFIED,DISPUTED&page=2
  └── src/app/(dashboard)/provider/history/page.tsx  (Server Component)
        ├── DashboardHeader (shared)
        ├── HistoryFilters (status pill toggles, Server)
        ├── HistoryTable (6-col, Server)
        └── Pagination (Prev/Next links, Server)
              ↑
              uses getProviderTaskHistory (Server, vi.mock'd in tests)
```

Sidebar gains one entry; everything else is additive. Provider P0 components (`DashboardHeader`, the token map, `formatTZS`) are reused unmodified.

## Components

| Unit | Path | Responsibility |
|---|---|---|
| `getProviderTaskHistory` | `src/features/tasks/queries.ts` (extend) | Paginated query, status-mapping, 90d window, PII-safe `select`. Returns `{ rows, total, page, pageSize }`. |
| `HistoryFilters` | `src/features/tasks/components/HistoryFilters.tsx` | Five status toggle pills (Completed / Verified / Disputed / Overdue / Cancelled), each wrapped in `<Link>` that adds or removes its status from the URL `status` param. Server Component. |
| `HistoryTable` | `src/features/tasks/components/HistoryTable.tsx` | 6-col table (Date / Task # / Service / Zone / Payout / Status). Row → `<Link>` to `/provider/tasks/[id]`. Empty state inside. Server Component. |
| `HistoryTableSkeleton` | `src/features/tasks/components/HistoryTable.tsx` (same file, named export) | Suspense fallback. 5 skeleton rows. |
| `Pagination` | `src/shared/components/ui/Pagination.tsx` (NEW, reusable) | Prev / Next link buttons + "Page N of M" label. Disabled state styling. Server Component. |
| `/provider/history/page.tsx` | `src/app/(dashboard)/provider/history/page.tsx` | Route entrypoint. RoleGuard + DashboardHeader + Suspense + composes children. |
| Sidebar config | `src/components/layout/Sidebar.tsx:48-53` | Insert `{ href: '/provider/history', label: 'History', icon: History }` between Tasks and Wallet. Add `History` to the lucide-react import list at the top of the file. |

Each unit has one clear responsibility. None grow large (largest is the page file at ~80 lines).

## Data flow

1. Browser hits `/provider/history?status=VERIFIED,DISPUTED&page=2`.
2. Server Component awaits `searchParams: Promise<{ status?: string; page?: string }>` (Next.js 16 async params).
3. Parse statuses (comma-separated, validated against `HistoryStatus` union — ignore unknowns), parse page (clamp ≥ 1).
4. `auth()` + role check. Redirect to `/login` on miss.
5. Call `getProviderTaskHistory(session.user.id, { statuses }, page, 20)`.
6. Query (one `prisma.task.findMany` + one `prisma.task.count` in parallel, both scoped):
   - `where`:
     - `assignment.providerId = (provider resolved from session)`
     - `scheduledFor >= now − 90d`
     - status filter (see "Status mapping" below)
   - `select`: only fields needed for the table — no owner relation, no `encryptedAddress`.
   - `orderBy`: `scheduledFor: 'desc'`.
   - `skip / take`: `(page-1)*20 / 20`.
7. Page renders header → filters → table → pagination. Suspense streams the rows.

## Status mapping

The URL exposes a 5-value union: `'COMPLETED' | 'VERIFIED' | 'DISPUTED' | 'OVERDUE' | 'CANCELLED'`. Internally:

| URL status | Where it lives | DB predicate |
|---|---|---|
| COMPLETED | `task.status` | `task.status = 'COMPLETED'` |
| VERIFIED | `task.status` | `task.status = 'VERIFIED'` |
| DISPUTED | `task.status` | `task.status = 'DISPUTED'` |
| OVERDUE | `task.status` | `task.status = 'OVERDUE'` |
| CANCELLED | `assignment.status` | `assignment.status IN ('CANCELLED_BY_OWNER','CANCELLED_NO_SHOW','EXPIRED','REJECTED','AUTO_REASSIGNED')` |

When statuses set is empty (no `?status=`), include ALL of the above (broad query). When non-empty, OR the predicates so a single task matches if any selected status applies.

A task is excluded if its parent assignment is in an active state AND its own status is active (SCHEDULED / IN_PROGRESS / NOTIFIED_*). These belong on `/provider/tasks`.

## Privacy contract

The `select` for `getProviderTaskHistory` MUST contain only:

```
{
  id: true,
  scheduledFor: true,
  status: true,
  assignment: {
    select: {
      id: true,
      status: true,
      providerPayout: true,
      serviceType: { select: { name: true } },
      property: { select: { zone: true } }, // NO encryptedAddress, NO owner
    },
  },
}
```

Test asserts on this shape (matches Task 4 `getProviderTaskDetail` test pattern).

## Empty state

When `total === 0`:

```
[icon: ClipboardCheck]
No history yet
Completed and verified tasks will appear here once you finish your first job.
```

When filters yield zero but unfiltered data exists, the empty-state copy switches to:

```
No matches for current filters
Try clearing a status to see more results.
```

The page logically distinguishes by checking `filters.statuses.length > 0` and falling back to the broader copy when filters are empty.

## URL contract

- `?status=VERIFIED` — single status
- `?status=VERIFIED,DISPUTED` — multi-select
- `?page=3` — page index, 1-based
- `?` (no params) — all statuses, page 1
- Unknown status values silently dropped
- `page < 1` clamps to 1; `page > totalPages` clamps to last valid page server-side (the response includes `page: clampedPage` so the client UI reflects the clamp)

Links generated by `HistoryFilters` and `Pagination` rebuild the entire query string so toggles are deterministic.

## Error handling

| Scenario | Handling |
|---|---|
| Provider profile missing | Query returns `{ rows: [], total: 0 }`. Page renders empty state. |
| Auth missing or wrong role | Page redirects to `/login` (matches Provider P0 pattern). |
| Prisma error mid-query | Bubbles to Next.js error boundary. No special handling; matches owner-dashboard pattern. |
| Page out of range | Server clamps and returns clamped page index. UI shows the clamped page. |
| Invalid status param | Filtered to empty array silently. No error toast — too noisy for a URL typo. |

## Testing

| Test | File | Asserts |
|---|---|---|
| `getProviderTaskHistory` returns empty when no profile | `src/features/tasks/tests/tasks.history.queries.test.ts` | Returns `{ rows: [], total: 0 }`, doesn't call `task.findMany`. |
| Status filter maps correctly | same | `where` predicate has correct `OR` structure for mixed statuses. |
| 90d window applied | same | `scheduledFor: { gte: <now-90d> }` in predicate. |
| Page clamp | same | `page = 0` → returns clamped to 1; `page = 999` → returns last valid page. |
| PII select shape | same | `select` doesn't include `owner`, `ownerId`, `encryptedAddress`. |
| `HistoryFilters` renders all 5 pills | `src/features/tasks/components/HistoryFilters.test.tsx` | All five labels visible. |
| Filter toggle produces correct URL | same | Click on VERIFIED when `?status=DISPUTED` produces `?status=DISPUTED,VERIFIED`. Click on VERIFIED when `?status=DISPUTED,VERIFIED` produces `?status=DISPUTED`. |
| `HistoryTable` renders rows + empty state | `src/features/tasks/components/HistoryTable.test.tsx` | Row count matches data length; empty state shown when 0. |
| `Pagination` Prev disabled on page 1 | `src/shared/components/ui/Pagination.test.tsx` | `aria-disabled="true"` on Prev link. |

E2E deferred to a later P1 polish task.

## Out of scope

- Date range filter UI (later)
- Sort by date / payout (later — would swap to TanStack Table)
- Per-row actions (re-open dispute, contact staff) — separate flows
- Export to CSV — separate feature if ever needed
- Aggregate stats on top of table — dashboard already has them

## Open followups created by this work

- `Pagination` lives in `src/shared/components/ui/` — owner pages currently inline their own. Consider migrating owner pagination to the shared component in a follow-up.
- The `'use server'` directive on `queries.ts` is repo-wide overuse (already captured as a P2 followup). Don't change it in this PR.
