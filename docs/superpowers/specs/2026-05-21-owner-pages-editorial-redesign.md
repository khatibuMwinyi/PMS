# Owner Pages Editorial Redesign

**Date:** 2026-05-21  
**Scope:** `/owner/financials`, `/owner/reports`, `/owner/service-catalog`  
**Design direction:** Option B — Editorial Dashboard

---

## Problem

All three pages use removed CSS tokens (`--surface-container-*`, `border-outline-variant`) causing rendering fallbacks. Visual hierarchy is flat: KPI cards lack differentiation, table rows have no hover state, charts have no axis labels, catalog cards bury the price. None of the pages match the editorial aesthetic shipped in the property cards and landing page.

---

## Shared Changes (all 3 pages)

### Token fixes

Replace every instance of:

| Old (broken) | New (valid) |
|---|---|
| `bg-[var(--surface-container-lowest)]` | `bg-surface-card` |
| `bg-[var(--surface-container-low)]` | `bg-surface-card` |
| `bg-[var(--surface-container-high)]` | `bg-surface-overlay` |
| `border-outline-variant` | `border-border-subtle` |

### Page title style

Add `serif?: boolean` prop to `DashboardHeader`:

```tsx
// DashboardHeader.tsx
<h1 className={cn('text-h1 font-semibold text-[var(--text-primary)]', serif && 'font-serif')}>
  {title}
</h1>
```

Pass `serif` at all three call sites. Subtitle stays Inter text-body-sm.

**Exception — Reports page:** the header is a flex row (title left, Export button right), so it does not use `DashboardHeader`. Render the serif title inline in `page.tsx` alongside the Export button.

### Section divider component

New inline pattern (not a separate file — too small to extract):

```tsx
<div className="flex items-center gap-3 mb-4">
  <span className="text-caption font-semibold uppercase tracking-widest text-text-muted whitespace-nowrap">
    {label}
  </span>
  <hr className="flex-1 border-border-subtle" />
</div>
```

---

## Financials (`/owner/financials`)

### KPI strip — `OwnerFinancialsSummary.tsx`

Replace the current 3-column card grid with a single connected strip: one `div` with `border border-border-subtle rounded-lg overflow-hidden bg-surface-card shadow-card` divided into 3 equal columns by `divide-x divide-border-subtle`.

Each tile:
- 3px top accent bar via `before:` pseudo or `border-t-[3px]`
- Tile 1 (gold accent, `border-t-accent`): **Paid to Oweru (YTD)** — large serif numeral (`text-[28px] font-serif`)
- Tile 2 (red accent, `border-t-state-error`): **Pending Invoices** — count as large numeral, formatted amount below in `text-state-error font-semibold`, next due date in `text-caption text-text-muted italic`
- Tile 3 (green accent, `border-t-state-success`): **Utility Expenses (YTD)** — large serif numeral, note below in muted caption

Label style: `text-caption font-semibold uppercase tracking-widest text-text-muted` — same as section dividers.

### Invoices table — `OwnerInvoicesTable.tsx`

**Card wrapper:** `bg-surface-card border border-border-subtle rounded-lg overflow-hidden shadow-card`

**Table header bar** (above `<table>`):
- Left: "Invoices & Payment History" in `text-h4 font-semibold`
- Right: filter pills — **All / Pending / Overdue / Failed / Paid** — as `<button>` elements. Active pill: `bg-primary text-white`. Inactive: `border border-border-default text-text-muted`. FAILED is included because it is actionable (user can retry payment). CANCELLED is terminal/non-actionable — surfaces under "All" only. Note: pills are client-side filter only (no server round-trip). Wrap `OwnerInvoicesTable` in a `'use client'` wrapper that receives the pre-fetched rows as a prop and handles local filter state.

**Table columns:**

| Column | Content | Notes |
|---|---|---|
| Reference | Monospace bold, `INV-XXXXXX` | `font-mono text-body-sm font-semibold text-text-primary` |
| Property · Service | Two-line stack | Line 1: property name bold. Line 2: service type in `text-caption text-text-muted` |
| Date | Formatted | `text-text-muted` |
| Amount | Right-aligned tabular | `tabular-nums font-semibold text-text-primary` |
| Status | Dot badge | See badge spec below |
| Action | Right-aligned | Pay button or receipt link |

**Status dot badge:**
```tsx
<span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-caption font-semibold ${bg} ${fg}`}>
  <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
  {label}
</span>
```

**Row hover:** `hover:bg-surface-overlay transition-colors`

**Pay button:** label "Pay via Selcom". `px-3 py-1 bg-accent text-accent-foreground rounded text-caption font-semibold hover:bg-accent-dark transition-colors`

**Receipt link:** `inline-flex items-center gap-1 text-caption text-text-muted hover:text-text-primary transition-colors` + `<Download size={14} />`

**Attempts badge:** Keep existing `{r.attempts}/3` but style as `text-[10px] text-text-muted ml-1`.

**Client filter architecture:**
- Create `OwnerInvoicesClient.tsx` (`'use client'`) — receives `rows: OwnerInvoiceDisplay[]`, owns `activeFilter` state, renders table
- `OwnerInvoicesTable.tsx` stays `async`, fetches data, passes rows to `OwnerInvoicesClient`
- No server action needed — filter is pure client state

**Skeletons:** `FinancialsSummarySkeleton` — 3-tile strip at correct height (`h-24`). `InvoicesTableSkeleton` — header bar + 4 shimmer rows.

---

## Reports (`/owner/reports`)

### Page layout — `page.tsx`

`DashboardHeader` is removed. Replace with:

```tsx
<div className="mb-8">
  <div className="flex items-center justify-between">
    <h1 className="font-serif text-h2 text-text-primary tracking-tight">Reports</h1>
    {/* Export button — existing gold style */}
  </div>
  <p className="text-body-sm text-text-secondary mt-1">
    Spending paid to Oweru, utility expenses, and per-property cost breakdown.
  </p>
</div>
```

Subtitle is preserved, rendered below the title+export flex row.

### Monthly Spend chart — `MonthlySpendChart.tsx`

**Card:** `bg-surface-card border border-border-subtle rounded-lg shadow-card p-5`

**Chart area:** height fixed at `h-48`. Add:
- Y-axis: 3 horizontal dashed grid lines at 25%, 50%, 75% of max, each with a right-aligned label showing the TZS value at that level (abbreviated: `420k`, `840k`, `1.2M`). Grid lines: `border-t border-dashed border-border-subtle`.
- Bars: existing gold bars, keep hover reveal for exact value. Add `title` attribute to each bar for native tooltip.
- X-axis labels: already exist, keep.
- Current month bar: slightly brighter gold (`opacity-100`) vs prior months (`opacity-70`).

**Y-axis labels:** rendered as a `div` column to the left of the bar area. Use `flex` layout: left column (40px wide) for y-axis labels, right column (`flex-1`) for bars.

### Service Mix chart — `ServiceMixChart.tsx`

Data already returns `pct` + `amountFormatted` per row. Changes are layout + token only:
- Fix `bg-[var(--surface-container-high)]` → `bg-surface-overlay` on track
- Fix `bg-[var(--brand-primary)]` → `bg-primary` on fill bar
- Row layout: service name left (`text-body-sm font-medium text-text-primary`) | right: amount in `font-semibold tabular-nums` + pct in `text-caption text-text-muted`
- Bar height: increase from `h-2` to `h-1.5` with `rounded-full`
- Card token fix: same as others

### Property cost table — `PropertyCostTable.tsx`

**Card:** same card style as others.

Add section divider above: "Per-Property Cost Breakdown".

Actual data shape from `getPropertyCostBreakdown`: `propertyId`, `propertyName`, `zone`, `servicesYtdFormatted`, `utilityYtdFormatted`, `totalYtdFormatted`, `serviceCount`. Keep these exact columns — do not pivot by service type. Property name renders as a link to `/owner/properties/[propertyId]` with gold hover.

If no data: centered empty state — icon + "No spending data yet." in `text-text-muted`.

---

## Service Catalog (`/owner/service-catalog`)

### Page — `page.tsx`

Promo banner: keep existing structure, fix token (`border-outline-variant` on inner elements if present), tighten padding to `p-4`.

### Catalog grid — `ServiceCatalogGrid.tsx`

**Card changes:**
- Icon tile: `w-10 h-10 rounded-lg bg-primary/8 flex items-center justify-center` — increase from 32px to 40px
- Name: `text-h4 font-semibold text-text-primary`
- Description: `text-body-sm text-text-secondary line-clamp-2`
- Footer border: keep `border-t border-border-subtle pt-3`
- Price block: label `text-[10px] font-semibold uppercase tracking-widest text-text-muted` + value `text-body font-semibold tabular-nums text-text-primary` + unit `text-caption text-text-muted`
- CTA button: keep existing navy `bg-primary text-white` — this already has white text, correct
- Hover: `hover:border-accent transition-colors` — already exists, keep
- Available badge: keep `bg-state-success-bg text-state-success` pill

**Empty state:** centered, dashed border card — keep existing, fix token.

---

## Files to change

| File | Change type |
|---|---|
| `src/features/financials/components/OwnerFinancialsSummary.tsx` | Full rewrite — KPI strip |
| `src/features/financials/components/OwnerInvoicesTable.tsx` | Becomes data-fetcher only, passes to client |
| `src/features/financials/components/OwnerInvoicesClient.tsx` | New file — client filter + table render |
| `src/features/financials/components/skeletons.tsx` | Update skeleton shapes |
| `src/features/owner-reports/components/MonthlySpendChart.tsx` | Add y-axis, grid lines |
| `src/features/owner-reports/components/ServiceMixChart.tsx` | Add TZS values to rows |
| `src/features/owner-reports/components/PropertyCostTable.tsx` | Add card wrapper, section divider, empty state |
| `src/features/service-catalog/components/ServiceCatalogGrid.tsx` | Token fix + card sizing |
| `src/shared/components/dashboard/DashboardHeader.tsx` | Add `serif?: boolean` prop |
| `src/app/(dashboard)/owner/financials/page.tsx` | Pass `serif` to DashboardHeader |
| `src/app/(dashboard)/owner/reports/page.tsx` | Inline serif title (flex row with Export button) |
| `src/app/(dashboard)/owner/service-catalog/page.tsx` | Pass `serif` to DashboardHeader, fix banner token |

---

## Out of scope

- Server-side filtering or pagination for invoices (client-only filter is sufficient)
- Recharts or any new charting dependency
- `DashboardHeader` component refactor (modify call sites only)
- Dark mode additions (existing dark tokens will apply naturally)
