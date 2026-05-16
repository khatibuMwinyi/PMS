# Owner Dashboard — Design Spec

**Date:** 2026-05-16
**Status:** Draft → User review pending
**Scope:** Page 1 of 5 in "Owner Pages — Core 5" series (Dashboard, Properties, Work Orders, Financials, Account Settings)
**Source-of-truth spec:** `Full.md` (SRD + SDD + Engineering Spec)
**Visual reference:** `owners_page/dashboard_standardized_nav/code.html`

---

## 1. Goal & Scope

Read-only landing page for users with `UserRole.OWNER`. Surfaces portfolio-wide financial summary, active property cards, and recent service-request activity. Maps to:

- Full.md §IV.2.1 — "Owner dashboard real-time"
- Full.md §XIX — Owner Analytics
- Full.md §XXI — Privacy isolation (provider identities never rendered)

### In scope

- Route: `/owner/dashboard` (move existing `/owner/page.tsx` content here; root `/owner` becomes a redirect to `/owner/dashboard`).
- Three KPI cards: **Total Spent YTD** (TZS), **Active Work Orders** with pending-acceptance subcount, **Maintenance ROI**.
- Active Properties section: card grid limited to most-recently-active 4, with "View All" → `/owner/properties`.
- Recent Requests panel: last 5 owner-scoped agreements/assignments with status badge, property name, age, "View All" → `/owner/work-orders`.
- "Data as of" timestamp in header.
- Empty states for each panel.
- Sidebar nav rewrite (Dashboard, Properties, Work Orders, Financials, Service Network, Reports).
- `force-dynamic` rendering (no PPR for MVP; revisit `'use cache'` later).

### Out of scope (deferred to other Core 5 pages)

- Property CRUD → Properties spec
- Work order detail / owner actions (verify, dispute, cancel) → Work Orders spec
- Invoice payment trigger (Selcom redirect) → Financials spec
- Notifications panel and prefs → Account Settings spec
- Provider identity rendering anywhere — **explicitly forbidden** per §XXI
- Real-time push / WebSocket updates
- Search bar wiring (visual stub only this round)
- Service Network and Reports pages (stub routes only; future specs)

---

## 2. Page Composition

```
src/app/(dashboard)/owner/dashboard/page.tsx (Server Component, force-dynamic)
└─ RoleGuard allowedRoles={['OWNER']}
   └─ DashboardShell role="OWNER" pageTitle="Dashboard Overview"
      ├─ DashboardHeader subtitle="High-level metrics across all active properties" asOf={...}
      ├─ <Suspense fallback={<KpiCardsSkeleton/>}> → OwnerKpiCards
      └─ <div className="grid lg:grid-cols-3 gap-xl">
         ├─ <Suspense fallback={<PropertiesPanelSkeleton/>} className="lg:col-span-2"> → OwnerActivePropertiesPanel
         └─ <Suspense fallback={<RequestsPanelSkeleton/>} className="lg:col-span-1"> → OwnerRecentRequestsPanel
```

### Component inventory

| Component | Type | Location | Replaces | Data source |
|---|---|---|---|---|
| `OwnerKpiCards` | RSC | `features/dashboard/components/owner/OwnerKpiCards.tsx` | `FinancialSummaryCards` (renamed/extended) | `getOwnerKpis()` |
| `OwnerActivePropertiesPanel` | RSC | `features/dashboard/components/owner/OwnerActivePropertiesPanel.tsx` | wraps slim `PropertyCardGrid` (limit=4) | `getOwnerActiveProperties(limit=4)` |
| `OwnerRecentRequestsPanel` | RSC | `features/dashboard/components/owner/OwnerRecentRequestsPanel.tsx` | replaces `ServiceRequestsTable` (list, not table) | `getOwnerRecentRequests(limit=5)` |
| `DashboardHeader` | RSC | `shared/components/dashboard/DashboardHeader.tsx` | new | local props |
| `KpiCard` | RSC | `shared/components/ui/KpiCard.tsx` | new (bento-style card matching mockup) | local props |
| `KpiCardsSkeleton`, `PropertiesPanelSkeleton`, `RequestsPanelSkeleton` | RSC | colocated | new | n/a |

### Reused (no change)

- `Card`, `Stat`, `StatusBadge`, `DashboardShell`, `RoleGuard`.

### Deleted

- `features/dashboard/components/FinancialSummaryCards.tsx` (replaced by `OwnerKpiCards`).
- `features/dashboard/components/ServiceRequestsTable.tsx` — fixture data inline; verify no other importers via grep; if none, delete file.
- `features/dashboard/components/PortfolioOverview.tsx` — superseded by `DashboardHeader` + `DashboardShell.pageTitle`.

### Refactored

- `features/dashboard/actions.ts` → split into `features/dashboard/queries/owner.ts` (reads only) and `features/dashboard/services/owner-dashboard.service.ts` (formatting / privacy mask). The misnamed `actions.ts` (it contains queries, not mutations) is deleted.

---

## 3. Data Contracts

All money fields use `Prisma.Decimal` end-to-end; format to TZS string only at the UI boundary. No `Number(Decimal)` casts (existing code has precision loss).

### `features/dashboard/queries/owner.ts`

```ts
export async function getOwnerKpis(ownerUserId: string): Promise<OwnerKpis>;

export interface OwnerKpis {
  totalSpentYtd: Decimal;             // SUM(invoice.amount WHERE status=PAID AND paidAt within YTD)
  totalSpentYtdFormatted: string;     // "TZS 42,500.00"
  ytdTrendPct: Decimal | null;        // (current - prior) / prior * 100; null if prior == 0
  ytdTrendDirection: 'up' | 'down' | 'flat' | null;
  activeWorkOrders: number;           // assignments where status IN (ACCEPTED, SCHEDULED, IN_PROGRESS, COMPLETED) for this owner
  pendingAcceptance: number;          // assignments where status = PENDING_ACCEPTANCE
  maintenanceRoiPct: Decimal;         // completedAgreements / paidAgreements * 100; 0 if denominator 0
  asOf: Date;
}

export async function getOwnerActiveProperties(
  ownerUserId: string,
  limit: number = 4,
): Promise<OwnerPropertyCard[]>;

export interface OwnerPropertyCard {
  id: string;
  name: string;
  type: PropertyType;
  addressLine: string;                // uses Property.zone (plaintext); encryptedAddress NOT decrypted on dashboard
  unitCount: number;
  occupancyPct: number;               // see Section 6 risk #1 — placeholder calc
  imageUrl: string | null;
  isActive: boolean;
  hrefDetail: string;                 // /owner/properties/{id}
}

export async function getOwnerRecentRequests(
  ownerUserId: string,
  limit: number = 5,
): Promise<OwnerRecentRequest[]>;

export interface OwnerRecentRequest {
  agreementId: string;
  serviceTypeName: string;
  propertyName: string;
  status: OwnerVisibleAgreementStatus;
  statusVariant: 'urgent' | 'progress' | 'scheduled' | 'complete' | 'neutral';
  ageHuman: string;                   // "2h ago" | "Oct 25, 10:00 AM"
  hrefDetail: string;                 // /owner/work-orders/{agreementId}
}

export type OwnerVisibleAgreementStatus =
  | 'PENDING_ASSIGNMENT'
  | 'PENDING_ACCEPTANCE'
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'DISPUTED'
  | 'CANCELLED';
```

### Repository / service split

- `features/dashboard/repositories/owner-dashboard.repository.ts` — raw Prisma reads, owner-scoped, returns Prisma types.
- `features/dashboard/services/owner-dashboard.service.ts` — formats currency (TZS), computes trend %, maps internal AssignmentStatus to OwnerVisibleAgreementStatus, computes human-readable age, applies privacy mask.
- `features/dashboard/schemas/owner-dashboard.schema.ts` — Zod schemas for return types; parse defensively at service→UI boundary.

### Privacy mask (enforced at repository layer)

Select clauses MUST NOT include any of: `Assignment.providerId`, `Assignment.provider`, `ProviderProfile.*`. Repository tests assert these fields are absent from returned objects.

---

## 4. RBAC, Privacy, Audit

- **Auth:** existing `auth()` from `@/core/auth`. `RoleGuard allowedRoles={['OWNER']}` enforces role.
- **Owner scoping:** all queries take `ownerUserId` (session.user.id). Repository asserts `OwnerProfile` exists for that user; else returns empty results (not 500).
- **Privacy isolation (Full.md §XXI):** provider fields stripped at repository layer (see Section 3); component layer has no way to render them.
- **Audit:** no mutations on dashboard → no audit emission this page.
- **Encryption:** `Property.encryptedAddress` not decrypted on dashboard; `Property.zone` (plaintext) used for `addressLine`. If `zone` is empty, render "Address not set".

---

## 5. Sidebar Navigation Rewrite

`src/components/layout/Sidebar.tsx` — `NAV_ITEMS.OWNER` becomes:

```ts
OWNER: [
  { href: '/owner/dashboard',    label: 'Dashboard',       icon: LayoutDashboard },
  { href: '/owner/properties',   label: 'Properties',      icon: Home },
  { href: '/owner/work-orders',  label: 'Work Orders',     icon: Wrench },
  { href: '/owner/financials',   label: 'Financials',      icon: BarChart3 },
  { href: '/owner/service-network', label: 'Service Network', icon: Users },
  { href: '/owner/reports',      label: 'Reports',         icon: FileText },
],
```

- Removed from nav: `Services`, `Leases`, `Analytics`. Routes are NOT deleted — only delinked. Cleanup happens in later page specs (Financials spec absorbs Analytics; Work Orders spec absorbs Services/Quotes/Agreements flows).
- New nav targets (`/owner/work-orders`, `/owner/financials`, `/owner/service-network`, `/owner/reports`) get stub `page.tsx` files returning "Coming soon" placeholders so links don't 404. Stubs will be replaced by their respective Core 5 specs.

---

## 6. Risks, Non-goals, Open Questions

### Risks

1. **Occupancy data — no real model.** `Unit.occupantCount` is the only existing signal; there is no Lease or Tenancy model. Spec uses a placeholder calc (units with `occupantCount > 0` / total units * 100). Properties spec MUST introduce a proper occupancy / lease model.
2. **Sidebar nav rewrite affects all owner pages.** Delinking routes can confuse users mid-transition. Mitigation: keep all current routes alive (no file deletes); only sidebar links change. Document in PR.
3. **Decimal precision in existing actions.** Current `getDashboardFinancials` does `Number(ag.quotedPrice)` — precision loss for TZS values. New `queries/owner.ts` uses `Decimal` throughout; formatting only at UI edge.
4. **YTD spend uses Invoice not Agreement.** Existing code sums `Agreement.quotedPrice`, which includes unpaid/cancelled. New spec sums `Invoice.amount WHERE status = PAID` for true cash-out figure.

### Non-goals

- Any mutation, payment trigger, dispute filing, notification mutation.
- Provider identity rendering (forbidden).
- Real-time push updates.
- Search bar functional wiring (visual stub matches mockup).
- Mobile-specific bottom nav (existing `MobileNav` reused as-is).

### Open questions (resolved with defaults — flag if user disagrees)

- **Q:** Trend baseline window? **Default:** prior-year YTD (Jan 1 prior year → today prior year). Null when prior is zero.
- **Q:** "Recent Requests" cutoff? **Default:** last 5 by `Agreement.createdAt DESC`, no time bound.
- **Q:** Currency? **Default:** TZS (Selcom market per Full.md). Format: `TZS 42,500.00` with thousands separator and 2 decimals.
- **Q:** ROI definition? **Default:** `completedAgreements / paidAgreements * 100`. Falsey denominator → display "—" not "0%".

---

## 7. Testing

Location: `features/dashboard/tests/` (Vitest) and `tests/e2e/owner-dashboard.spec.ts` (Playwright).

### Unit

- `owner-dashboard.service.test.ts`
  - YTD trend math: positive, negative, flat, prior-zero (null).
  - ROI division by zero → "—" not crash.
  - Currency formatting: `Decimal(42500)` → `"TZS 42,500.00"`.
  - Status mapping: AssignmentStatus → OwnerVisibleAgreementStatus (PENDING_ACCEPTANCE preserved, CANCELLED_BY_OWNER / CANCELLED_NO_SHOW collapse to CANCELLED).
  - Age formatting: <24h → relative, ≥24h → absolute.

### Repository integration (test Prisma + transactional rollback)

- Owner A query does not return Owner B's agreements/invoices/properties.
- Returned objects do not contain `providerId`, `provider`, `ProviderProfile.*` keys (assert via `Object.keys`).
- Empty owner (no OwnerProfile) → zero-state results, not throw.

### Component

- `OwnerKpiCards` renders three cards with formatted values; renders "—" for null trend.
- `OwnerRecentRequestsPanel` renders empty state when list empty.
- `OwnerActivePropertiesPanel` renders empty state with "Add property" CTA when list empty.

### E2E

- `owner-dashboard.spec.ts`: login as seeded OWNER, navigate `/owner/dashboard`, assert KPIs render, properties render, requests render, no provider business name in DOM (`expect(page.locator('body')).not.toContainText(/provider:.+/i)`).

---

## 8. Acceptance Criteria

- [ ] Route `/owner/dashboard` renders without error for seeded OWNER session.
- [ ] Three KPI cards display real values from DB (not mock fixtures).
- [ ] Properties grid shows max 4 owner properties; empty state otherwise.
- [ ] Recent Requests list shows max 5 agreements; empty state otherwise.
- [ ] No provider identity (businessName, providerId, ProviderProfile fields) appears in any payload or DOM.
- [ ] Sidebar shows Dashboard, Properties, Work Orders, Financials, Service Network, Reports — no Services/Leases/Analytics.
- [ ] Old `/owner/` paths still resolve (no 404s) even though delinked.
- [ ] All Decimal arithmetic uses Prisma.Decimal; UI formats TZS at edge.
- [ ] All Vitest tests pass (`pnpm test`).
- [ ] E2E test passes (`pnpm test:e2e`).
- [ ] No TypeScript errors (`pnpm tsc --noEmit`).
- [ ] ESLint clean (`pnpm lint`).

---

## 9. File Map (anticipated)

### Created

- `src/app/(dashboard)/owner/dashboard/page.tsx`
- `src/app/(dashboard)/owner/work-orders/page.tsx` (stub)
- `src/app/(dashboard)/owner/financials/page.tsx` (stub)
- `src/app/(dashboard)/owner/service-network/page.tsx` (stub)
- `src/app/(dashboard)/owner/reports/page.tsx` (stub)
- `src/features/dashboard/components/owner/OwnerKpiCards.tsx`
- `src/features/dashboard/components/owner/OwnerActivePropertiesPanel.tsx`
- `src/features/dashboard/components/owner/OwnerRecentRequestsPanel.tsx`
- `src/features/dashboard/components/owner/skeletons.tsx`
- `src/features/dashboard/queries/owner.ts`
- `src/features/dashboard/repositories/owner-dashboard.repository.ts`
- `src/features/dashboard/services/owner-dashboard.service.ts`
- `src/features/dashboard/schemas/owner-dashboard.schema.ts`
- `src/features/dashboard/tests/owner-dashboard.service.test.ts`
- `src/features/dashboard/tests/owner-dashboard.repository.test.ts`
- `src/features/dashboard/tests/owner-dashboard.components.test.tsx`
- `src/shared/components/dashboard/DashboardHeader.tsx`
- `src/shared/components/ui/KpiCard.tsx`
- `tests/e2e/owner-dashboard.spec.ts`

### Modified

- `src/app/(dashboard)/owner/page.tsx` — replace with `redirect('/owner/dashboard')`
- `src/components/layout/Sidebar.tsx` — update `NAV_ITEMS.OWNER`

### Deleted

- `src/features/dashboard/components/FinancialSummaryCards.tsx`
- `src/features/dashboard/components/ServiceRequestsTable.tsx` (after verifying no other importers)
- `src/features/dashboard/components/PortfolioOverview.tsx` (after verifying no other importers)
- `src/features/dashboard/actions.ts` (queries moved to `queries/owner.ts`, formatting to `services/`)

---

## 10. Dependencies on Future Specs

This spec lands a self-contained vertical. Stubs at `/owner/work-orders`, `/owner/financials`, `/owner/service-network`, `/owner/reports` resolve to placeholder pages. Real implementations land in:

- Properties spec — owner property CRUD + units + lease/occupancy model.
- Work Orders spec — owner-side agreement/assignment/task lifecycle view + owner actions.
- Financials spec — invoice table + payment trigger (Selcom) + utility allocation read.
- Account Settings spec — profile + security + notification prefs + billing methods.

Service Network and Reports defer past Core 5.
