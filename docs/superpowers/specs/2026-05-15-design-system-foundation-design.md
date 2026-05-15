# Design System Foundation + Primitives

**Status:** Approved (brainstorming)
**Date:** 2026-05-15
**Owner:** Junior-Osborn
**Project:** OPSMP (Oweru Property Service Management Platform)
**Scope:** Foundation tokens + 6 core primitives. Feeds landing redesign spec and future dashboard/role-page specs.
**Related specs:**
- `2026-05-15-landing-page-redesign-design.md` (consumer of this foundation)
- (future) Dashboard shell + Owner pages
- (future) Provider + Admin pages

---

## 1. Purpose

The OPSMP codebase has accumulated three parallel design surfaces: a marketing landing area, a dashboard layout system, and ad-hoc component variants (`AnimatedButton`, `UnifiedButton`, `LoadingButton`, `BentoCard`, two `StatusBadge` definitions, two `Hero` files, two icon libraries, etc.). Tokens are inconsistent (`--state-warning` is blue, `--radius-xl` declared twice, several Material-derived tokens orphaned from a prior design system).

This spec produces a **single canonical design foundation**: tokens, typography, spacing, motion grammar, and six primitives that every page — marketing or dashboard — composes from. It is the dependency for every subsequent UI spec.

Out of scope: page redesigns, composite components (Modal, Drawer, Tabs, Stepper, Toast), dark mode implementation.

## 2. Style direction

**Editorial premium.** Restrained palette (navy + gold), generous whitespace, Fraunces serif for display headings, Inter for everything else. Sharp 8px corners on cards, 1px hairline borders, subtle motion (2-4px hover lift, no parallax). Vibe target: financial services / luxury managed-property.

## 3. Token audit

### 3.1 Fixes (apply to `src/app/globals.css`)

| Token | Current | Action |
|---|---|---|
| `--radius-xl` | Declared twice (`24px` then `0.5rem`) | Keep `24px`. Add new `--radius-2xl: 32px` if needed. |
| `--radius-full` | `0.75rem` (misleading — not a pill) | Rename to `--radius-card`. `--radius-pill: 9999px` already exists for true pills. |
| `--state-warning` | `#3B82F6` (blue, not warning) | Change to `#F59E0B` (amber). Add separate `--state-info: #3B82F6`, `--state-info-bg: #DBEAFE`. |
| `--surface-100 / 200 / 300` | Bootstrap-style grays, unused | Delete. |
| `--secondary-container`, `--on-secondary-container`, `--tertiary-container`, `--on-tertiary-container` | Material 3 leftover, unused | Delete. |
| `--surface-variant`, `--on-surface`, `--on-surface-variant`, `--outline`, `--outline-variant` | Material 3 leftover, partially unused | Delete `surface-variant` + `outline` + `outline-variant`. Keep `--on-surface` only if grep finds usage; otherwise delete. |
| `--on-primary`, `--on-accent` | Generic, ambiguous with `--text-on-brand` | Delete. Use `--text-on-brand` everywhere. |

Migration step: run repo-wide grep for each deprecated token before deletion; rewrite usages to the canonical token.

### 3.2 Additions

```css
/* Typography */
--font-serif:      'Fraunces', Georgia, 'Times New Roman', serif;
--font-sans:       'Inter', system-ui, -apple-system, sans-serif;
--font-mono:       'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace;

/* Semantic state additions */
--state-info:      #3B82F6;
--state-info-bg:   #DBEAFE;

/* Focus ring (replaces ad-hoc outline use) */
--shadow-focus:    0 0 0 3px rgba(240, 165, 0, 0.35);

/* Section / hero rhythm */
--space-16: 64px;
--space-20: 80px;
--space-24: 96px;

/* Container widths */
--container-editorial: 1200px;   /* marketing pages */
--container-dashboard: 1280px;   /* in-app */
```

### 3.3 Final canonical token list

After fixes + additions, the token surface is:

- **Brand:** `--brand-primary`, `--brand-primary-light`, `--brand-primary-dark`, `--brand-gold`, `--brand-gold-light`, `--brand-gold-dark`
- **Surface:** `--surface-page`, `--surface-card`, `--surface-overlay`, `--surface-dark`, `--surface-dark-card`
- **Text:** `--text-primary`, `--text-secondary`, `--text-muted`, `--text-on-dark`, `--text-on-brand`
- **Border:** `--border-subtle`, `--border-default`, `--border-strong`, `--border-focus`
- **State:** `--state-success(+bg)`, `--state-warning(+bg)`, `--state-error(+bg)`, `--state-info(+bg)`
- **Status (assignment lifecycle):** `--status-urgent`, `--status-in-progress`, `--status-scheduled`, `--status-completed`
- **Spacing:** `--space-1` (4) … `--space-24` (96)
- **Radius:** `--radius-sm` (6), `--radius-md` (10), `--radius-lg` (16), `--radius-xl` (24), `--radius-2xl` (32), `--radius-card`, `--radius-pill`
- **Shadow:** `--shadow-card`, `--shadow-modal`, `--shadow-dropdown`, `--shadow-bold`, `--shadow-focus`
- **Transition:** `--transition-fast` (120ms), `--transition-base` (200ms), `--transition-slow` (320ms), `--transition-spring` (400ms)
- **Container:** `--container-editorial`, `--container-dashboard`
- **Font:** `--font-serif`, `--font-sans`, `--font-mono`

## 4. Typography scale

Single canonical scale. All page-level type maps to one of these. The current `.font-h1 / h2 / body-md / body-sm / table-header / data-tabular / label` utility classes in `globals.css` are replaced by this scale (utility class names retained as aliases during migration, then removed).

| Token | Font | Size / line | Weight | Letter-spacing | Usage |
|---|---|---|---|---|---|
| `display` | serif | 64 / 72 | 500 | -0.02em | Landing hero only |
| `h1` | serif | 44 / 52 | 500 | -0.01em | Landing section titles |
| `h2` | sans | 28 / 36 | 600 | -0.005em | Section sub-headings, page titles in dashboard |
| `h3` | sans | 20 / 28 | 600 | 0 | Card titles, group headings |
| `h4` | sans | 16 / 24 | 600 | 0 | Small group / form section |
| `body-lg` | sans | 18 / 28 | 400 | 0 | Lead paragraphs, hero subtitles |
| `body` | sans | 15 / 24 | 400 | 0 | Default body |
| `body-sm` | sans | 13 / 20 | 400 | 0 | Meta, helper text |
| `caption` | sans | 12 / 16 | 500 | 0.04em | Eyebrows, labels, uppercase tags |
| `data` | sans (tabular) | 15 / 20 | 500 | 0 | Numbers in tables / Stat |
| `mono` | mono | 13 / 20 | 400 | 0 | IDs, codes, audit hashes |

Mobile down-scale: `display` → 44/52, `h1` → 32/40, `h2` → 24/32. All others unchanged.

Fraunces loaded via Google Fonts with weights 400/500/600. Inter already loaded with 300/400/500/600/700 — retained.

## 5. Spacing rhythm

- **Base unit:** 8px. All component padding/margin must reference `--space-*` tokens.
- **Section vertical rhythm (marketing):** `--space-20` (mobile) / `--space-24` (desktop). Consecutive sections separated by a single rhythm unit — no double padding.
- **Card padding tokens:** `compact` = `--space-4`, `comfortable` = `--space-6`, `spacious` = `--space-8`.
- **Container widths:** marketing pages use `--container-editorial` (1200px); dashboard pages use `--container-dashboard` (1280px). Gutters: `--space-6` (24px) desktop, `--space-4` (16px) mobile.

## 6. Motion grammar

- **Durations:** 120ms (micro / hover), 200ms (state change), 320ms (entrance), 400ms (spring lift).
- **Easings:** standard `cubic-bezier(0.4, 0, 0.2, 1)`, spring `cubic-bezier(0.34, 1.56, 0.64, 1)`.
- **Hover lift:** 2-4px max translate-Y. No scale > 1.02. No rotation.
- **Entrance:** fade-up with 8px translate-Y, 320ms standard easing. Stagger 60ms between siblings.
- **Forbidden:** parallax scroll, hero video background, marquee, infinite loops > 6s, scale > 1.05.
- **`prefers-reduced-motion`:** all transitions ≤ 0.01ms, animations capped at one iteration. Already enforced via existing media query — extend to JS animations (Framer Motion `useReducedMotion` hook).

## 7. Primitives

Each primitive lives at `src/components/ui/<Name>.tsx`. Each must:
- Accept a `className` prop and merge via `clsx` (or equivalent).
- Forward refs where applicable (`Button`, `Input`).
- Use only token CSS variables — no hex literals.
- Have a single named export plus inferred TypeScript prop type.

### 7.1 `Button`

**Replaces:** `AnimatedButton`, `UnifiedButton`, `LoadingButton`, the inline `<button>` patterns in landing page, the `button.tsx` shadcn-style primitive.

| Prop | Values |
|---|---|
| `variant` | `primary` (navy), `gold`, `secondary` (outline), `ghost`, `danger` |
| `size` | `sm` (32px), `md` (40px), `lg` (48px) |
| `loading` | `boolean` — shows spinner, disables click, preserves width |
| `iconLeft / iconRight` | `ReactNode` |
| `fullWidth` | `boolean` |
| `as` | `'button' \| 'a'` — when `'a'`, requires `href` |

States: default, hover (lift 2px on `primary` / `gold`, bg-shift on `ghost`), active (translate down 1px), focus-visible (gold ring via `--shadow-focus`), disabled (50% opacity, no events), loading (spinner replaces text content, width preserved).

### 7.2 `Card`

**Replaces:** `BentoCard`, the existing `card.tsx`, inline `bg-[var(--surface-card)] rounded-...` patterns.

| Prop | Values |
|---|---|
| `variant` | `elevated` (shadow-card), `outlined` (border), `flat` (neither) |
| `padding` | `none`, `compact`, `comfortable` (default), `spacious` |
| `interactive` | `boolean` — adds hover lift + cursor |
| `header / footer` | optional `ReactNode` slots |

Border-radius: `--radius-lg` (16px) default. `compact` cards use `--radius-md`.

### 7.3 `Stat`

Number-first display block.

| Prop | Type |
|---|---|
| `label` | `string` |
| `value` | `string \| number` |
| `unit` | `string?` (e.g. `'TZS'`, `'%'`) |
| `trend` | `{ direction: 'up' \| 'down', value: number }?` |
| `icon` | `LucideIcon?` |
| `tone` | `'default' \| 'success' \| 'warning' \| 'danger' \| 'info'` |
| `size` | `'sm' \| 'md' \| 'lg'` |

Layout: icon (top-right), label (caption, top), value (h2 or display, tabular), unit (body-sm, inline with value), trend chip (below). All numbers use `font-variant-numeric: tabular-nums`.

### 7.4 `Input`

**Replaces:** `AnimatedInput`, `UnifiedInput`, the existing `input.tsx`.

| Prop | Values |
|---|---|
| `type` | `text`, `email`, `tel`, `number`, `search`, `password` |
| `label` | `string?` (renders `<label>`) |
| `helper` | `string?` |
| `error` | `string?` (overrides helper, switches border + ring red) |
| `iconLeft / iconRight` | `ReactNode?` |
| `size` | `sm` (32px), `md` (40px, default), `lg` (48px) |

States: default, hover (border darkens), focus-visible (gold ring `--shadow-focus`, border-focus), error (red border, red ring on focus), disabled (surface-overlay bg, muted text). Native validation suppressed — use `error` prop.

### 7.5 `Badge`

**Replaces:** `StatusBadge.tsx` (both copies), `RoleBadge.tsx`, ad-hoc badge spans.

| Prop | Values |
|---|---|
| `variant` | `success`, `warning`, `info`, `error`, `neutral`, `gold`, `dark` |
| `size` | `sm` (20px), `md` (24px) |
| `icon` | `LucideIcon?` |
| `dot` | `boolean` — leading colored dot |

Shape: pill (`--radius-pill`). Caption type. Each variant uses its `--state-*-bg` for background + matching `--state-*` for text/dot.

### 7.6 `Table`

Wraps existing `DataTable.tsx` after refactor.

| Prop | Values |
|---|---|
| `columns` | `Column<T>[]` (key, header, accessor, sortable?, align?, width?) |
| `data` | `T[]` |
| `keyExtractor` | `(row: T) => string` |
| `loading` | `boolean` — renders skeleton rows |
| `emptyState` | `ReactNode` (custom) or `string` (default empty component) |
| `onRowClick` | `(row: T) => void` |
| `stickyHeader` | `boolean` |
| `density` | `'compact' \| 'comfortable'` |

Behavior: sortable headers (click toggles), row hover bg shift, focus-visible row outline. Mobile (< 768px): collapses to stacked `Card` per row, columns rendered as `label : value` pairs.

## 8. Icon system

Single library: **`lucide-react`** (already installed, used by landing page and most dashboards).

Remove:
- `@import url('...Material+Symbols+Outlined...')` from `globals.css`.
- `.material-symbols-outlined` CSS class block.
- Any `<span className="material-symbols-outlined">` usage (grep + replace with lucide equivalents).

Sizing convention: 16px (inline w/ body-sm), 18px (default), 20px (button), 24px (section heading), 32px (hero / large stat).

## 9. Dark mode

Out of scope for this round. The `@media (prefers-color-scheme: dark)` block in `globals.css` is incomplete (covers only 6 of ~30 surfaces) and currently triggers on every Tanzanian user's device regardless of intent. **Action:** wrap existing dark overrides behind a `[data-theme="dark"]` selector and remove the media-query trigger, so the partial dark theme stops auto-applying. Full dark mode implementation deferred to dashboard spec.

## 10. Migration plan (component-level)

Order of operations during implementation (driven by the writing-plans output):

1. Apply token fixes + additions to `globals.css`. Verify build.
2. Add Fraunces import + `--font-serif`. Verify load.
3. Create `Button` primitive. Migrate landing + login/register pages to use it. Delete `AnimatedButton`, `UnifiedButton`, `LoadingButton`. (Skip dashboard pages — handled in dashboard spec.)
4. Create `Card`, `Stat`, `Input`, `Badge` primitives in same wave. Each ships with its replacements migrated.
5. Refactor `DataTable` → `Table` with sticky header + density prop + mobile stack.
6. Remove `material-symbols-outlined` import + class.
7. Run final repo-wide grep for hex values outside `globals.css`; replace any with tokens.

## 11. Verification

- Visual: load `/`, `/login`, `/register`, `/dashboard/*` — no token regressions, no missing fonts, no FOUC.
- Build: `next build` clean, no TypeScript errors.
- Storybook-style smoke: a `src/components/ui/__preview__/page.tsx` route (gated behind `NODE_ENV=development`) renders every primitive in every variant. Not committed as user-facing — gate or remove before merge.
- Grep: `rg "#[0-9A-Fa-f]{6}"` outside `globals.css` returns zero results in `src/`.
- Grep: `rg "material-symbols-outlined"` returns zero results.
- A11y: every primitive passes `axe` on its preview page; focus-visible ring rendered on every interactive primitive.

## 12. Open questions

None — user approved all decision points during brainstorming.
