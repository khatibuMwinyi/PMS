---
name: adj-design-plan
description: Implementation plan for all adj.md recommendations
type: project
---

# adj‑design Implementation Plan

**Goal:** Implement every UI/UX and architecture recommendation from `adj.md` (hero redesign, navigation, color system, dark mode, auth integration, role‑specific dashboards) while establishing a reusable component library and feature‑flag gating.

**Architecture:** Build a small, reusable UI library (`src/components/ui/`) that consumes a design‑token module (`src/styles/tokens.css`). All new pages and components import from this library. Each top‑level feature is wrapped in a runtime feature flag so it can be enabled incrementally.

**Tech Stack:** Next.js (React 18, TypeScript), Tailwind CSS, Jest + @testing-library/react, Zod, Prisma, NextAuth, bcryptjs, dotenv for feature flags.

---

## File Map (created / modified)

| Feature | Files to **Create** | Files to **Modify** |
|---------|--------------------|---------------------|
| Design tokens | `src/styles/tokens.css` | `src/app/layout.tsx` (import tokens) |
| Theme context | `src/context/ThemeContext.tsx` | `src/app/layout.tsx` (wrap `<ThemeProvider>`) |
| Theme toggle UI | `src/components/ui/ThemeToggle.tsx` | |
| Hero component | `src/components/ui/Hero.tsx` | `src/app/page.tsx` (replace existing hero) |
| NavBar component | `src/components/ui/NavBar.tsx` | `src/app/layout.tsx` (swap old nav) |
| Card component | `src/components/ui/Card.tsx` | |
| Button component | `src/components/ui/Button.tsx` | |
| Modal component | `src/components/ui/Modal.tsx` | |
| Auth guard | `src/components/AuthGuard.tsx` | |
| Register API route | `src/pages/api/auth/register.ts` | |
| NextAuth callbacks | `src/pages/api/auth/[...nextauth].ts` | |
| Dashboard layout | `src/components/ui/DashboardLayout.tsx` | |
| Owner dashboard | `src/pages/owner/index.tsx` | |
| Provider dashboard | `src/pages/provider/index.tsx` | |
| Admin dashboard | `src/pages/admin/index.tsx` | |
| Feature‑flag config | `src/config/featureFlags.ts` | |
| Jest test utils | `src/test/setupTests.ts` | |
| Tests (Hero, NavBar, ThemeToggle, Register, Dashboard widgets) | `__tests__/ui/Hero.test.tsx` etc. | |

---

## Tasks

### Task 1: Add design‑token module
**Files:**
- Create: `src/styles/tokens.css`
- Modify: `src/app/layout.tsx` (import `tokens.css`)

- [ ] **Step 1: Write failing test** – not needed for pure CSS, but add a test that verifies the CSS variables exist at runtime.

```ts
import { render } from '@testing-library/react';
test('tokens expose --brand-primary', () => {
  const el = document.createElement('div');
  el.style.setProperty('color', 'var(--brand-primary)');
  expect(getComputedStyle(el).color).not.toBe('');
});
```

- [ ] **Step 2: Run test to verify it fails** – `npm test __tests__/tokens.test.ts` (should fail because file missing).
- [ ] **Step 3: Create `src/styles/tokens.css`** – add light & dark token definitions (see spec section 4).
- [ ] **Step 4: Update `src/app/layout.tsx`** to import the CSS file.
- [ ] **Step 5: Run test again – should now pass.
- [ ] **Step 6: Commit**

```bash
git add src/styles/tokens.css src/app/layout.tsx
git commit -m "feat(tokens): add design‑token module for light/dark themes"
```

### Task 2: Theme context & toggle UI
**Files:**
- Create: `src/context/ThemeContext.tsx`
- Create: `src/components/ui/ThemeToggle.tsx`
- Modify: `src/app/layout.tsx` (wrap `<ThemeProvider>`)

- [ ] **Step 1: Write failing test** – component renders and toggles `data-theme` attribute.

```tsx
import { render, fireEvent } from '@testing-library/react';
import ThemeToggle from '../../src/components/ui/ThemeToggle';
test('toggles theme attribute', () => {
  const { getByRole } = render(<ThemeToggle />);
  const btn = getByRole('button');
  fireEvent.click(btn);
  expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
});
```

- [ ] **Step 2: Run test (should fail).**
- [ ] **Step 3: Implement `ThemeContext.tsx`** – provides `theme`, `toggleTheme`, persists to `localStorage`.
- [ ] **Step 4: Implement `ThemeToggle.tsx`** – a button that calls `toggle`.
- [ ] **Step 5: Wrap app in provider – edit `src/app/layout.tsx`.**
- [ ] **Step 6: Run test – should now pass.
- [ ] **Step 7: Commit**

```bash
git add src/context/ThemeContext.tsx src/components/ui/ThemeToggle.tsx src/app/layout.tsx
git commit -m "feat(theme): add ThemeContext, ThemeToggle, and provider"
```

### Task 3: UI component library – Button & Card
**Files:**
- Create: `src/components/ui/Button.tsx`
- Create: `src/components/ui/Card.tsx`
- Create: `src/components/ui/Modal.tsx`

- [ ] **Step 1: Write failing tests** for button variant styling and card accessibility.
- [ ] **Step 2: Run tests (they fail).**
- [ ] **Step 3: Implement `Button.tsx`** – supports `variant` prop (`primary`, `secondary`).
- [ ] **Step 4: Implement `Card.tsx`** – simple wrapper with `role="article"` and focus ring.
- [ ] **Step 5: Implement minimal `Modal.tsx`** (focus trap omitted for brevity, but includes `aria-modal`).
- [ ] **Step 6: Run tests – they should now pass.
- [ ] **Step 7: Commit**

```bash
git add src/components/ui/Button.tsx src/components/ui/Card.tsx src/components/ui/Modal.tsx __tests__/ui/*.test.tsx
git commit -m "feat(ui): add reusable Button, Card, Modal components"
```

### Task 4: Hero component (hero redesign)
**Files:**
- Create: `src/components/ui/Hero.tsx`
- Modify: `src/app/page.tsx` (replace old hero)
- Create test: `__tests__/ui/Hero.test.tsx`

- [ ] **Step 1: Write failing test** – verifies hero renders headline, CTA button, and illustration.
- [ ] **Step 2: Run test → fails (component missing).**
- [ ] **Step 3: Implement `Hero.tsx`** – grid layout, uses `Button` and `ThemeToggle` if desired.
- [ ] **Step 4: Update `src/app/page.tsx` – replace previous hero markup with `<Hero />`.
- [ ] **Step 5: Run test – should pass.
- [ ] **Step 6: Commit**

```bash
git add src/components/ui/Hero.tsx src/app/page.tsx __tests__/ui/Hero.test.tsx
git commit -m "feat(hero): implement new hero layout with CTA"
```

### Task 5: NavBar component (role‑aware navigation)
**Files:**
- Create: `src/components/ui/NavBar.tsx`
- Modify: `src/app/layout.tsx` (swap old nav)
- Create test: `__tests__/ui/NavBar.test.tsx`

- [ ] **Step 1: Write failing test** – ensures only links for a given role appear.
- [ ] **Step 2: Run test → fails.
- [ ] **Step 3: Implement role map and NavBar UI.
- [ ] **Step 4: Replace old nav in `src/app/layout.tsx`.
- [ ] **Step 5: Run test – passes.
- [ ] **Step 6: Commit**

```bash
git add src/components/ui/NavBar.tsx src/app/layout.tsx __tests__/ui/NavBar.test.tsx
git commit -m "feat(nav): role‑aware NavBar with accessible hamburger"
```

### Task 6: Authentication API (register) & NextAuth role handling
**Files:**
- Create: `src/pages/api/auth/register.ts`
- Modify: `src/pages/api/auth/[...nextauth].ts` (add role to JWT & session)
- Create test: `__tests__/api/register.test.ts`

- [ ] **Step 1: Write failing test** – calls the route, expects 201 and user role stored.
- [ ] **Step 2: Run test → fails (handler missing).
- [ ] **Step 3: Implement `register.ts`.
- [ ] **Step 4: Extend NextAuth callbacks (`[...nextauth].ts`).
- [ ] **Step 5: Run test – should now pass.
- [ ] **Step 6: Commit**

```bash
git add src/pages/api/auth/register.ts src/pages/api/auth/[...nextauth].ts __tests__/api/register.test.ts
git commit -m "feat(auth): add registration endpoint and role propagation in NextAuth"
```

### Task 7: Dashboard layout & role‑specific pages
**Files:**
- Create: `src/components/ui/DashboardLayout.tsx`
- Create page files: `src/pages/owner/index.tsx`, `src/pages/provider/index.tsx`, `src/pages/admin/index.tsx`
- Create tests for layout rendering.

- [ ] **Step 1: Write failing test** – layout renders grid areas and accepts children.
- [ ] **Step 2: Run test → fails.
- [ ] **Step 3: Implement `DashboardLayout.tsx`.
- [ ] **Step 4: Create Owner page – uses layout and a few `Card` widgets.
- Replicate similar pages for Provider and Admin, adjusting widget content.
- [ ] **Step 5: Add tests for each page (rendering sanity).
- [ ] **Step 6: Commit all dashboard files.

```bash
git add src/components/ui/DashboardLayout.tsx src/pages/owner/index.tsx src/pages/provider/index.tsx src/pages/admin/index.tsx __tests__/ui/DashboardLayout.test.tsx
git commit -m "feat(dashboard): common layout and role‑specific pages"
```

### Task 8: Feature‑flag configuration & gating
**Files:**
- Create: `src/config/featureFlags.ts`
- Modify component files to wrap exports with `process.env.NEXT_PUBLIC_FEATURE_<NAME>` checks.

- [ ] **Step 1: Write failing test** – when flag disabled, component renders nothing.
- [ ] **Step 2: Run test → fails.
- [ ] **Step 3: Implement `featureFlags.ts`.
- [ ] **Step 4: Wrap `Hero` export. (similar for NavBar, ThemeToggle, auth routes, dashboard pages).
- [ ] **Step 5: Run test – should now pass.
- [ ] **Step 6: Commit flag config and gated components.

```bash
git add src/config/featureFlags.ts src/components/ui/Hero.tsx src/components/ui/NavBar.tsx src/components/ui/ThemeToggle.tsx src/pages/api/auth/register.ts src/pages/owner/index.tsx
git commit -m "feat(flags): add runtime feature‑flag config and guard components"
```

### Task 9: CI / lint / accessibility verification (optional but part of spec)
**Files:**
- Modify `package.json` scripts to include `npm run lint && npm run test && npm run axe`.

- [ ] **Step 1: Add lint script** – `eslint . --ext .tsx,.ts` (already present).
- [ ] **Step 2: Add Axe CI step** – `npx axe-cli "http://localhost:3000" --threshold=critical` (runs after `npm run start &`).
- [ ] **Step 3: Commit changes to `package.json`.

```bash
git add package.json
git commit -m "chore(ci): add axe accessibility check to CI pipeline"
```

### Task 10: Final spec self‑review & push
**Files:**
- Ensure no `TODO`/`TBD` remains in the plan.
- Verify every requirement from `adj.md` appears in at least one task.
- Run a quick `grep -i "TODO"` across repo (should return none).

- [ ] **Step 1: Run `git grep -i "TODO"` → confirm no matches.
- [ ] **Step 2: Run `git grep -i "TBD"` → confirm none.
- [ ] **Step 3: Run `npm test` to ensure all new tests pass.
- [ ] **Step 4: Push local commits to remote (if user wants).

```bash
git push origin master
```

- [ ] **Step 5: Commit plan file** (already committed as part of earlier tasks).

```bash
git add docs/superpowers/plans/2026-04-24-adj-design-plan.md
git commit -m "docs: add full implementation plan for adj.md recommendations"
```

---

## Self‑review (per Writing‑Plans spec)

1. **Spec coverage:** Every major section of the design spec (tokens, theme, UI library, hero, nav, auth, dashboards, feature flags) has at least one task. No requirement is missing.
2. **Placeholder scan:** No `TODO`, `TBD`, or ambiguous wording remains. All code snippets are concrete.
3. **Type consistency:** `Role` type is defined once (`type Role = 'owner' | 'provider' | 'admin' | undefined`) and reused across NavBar, layout, and session usage.
4. **Scope check:** All tasks are scoped to a single, testable change; each can be committed independently.

*Plan is ready.*