# Design System Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the OPSMP design system foundation: canonical token set in `globals.css` + `tailwind.config.ts`, editorial typography (Fraunces + Inter), and six core primitives (`Button`, `Card`, `Stat`, `Input`, `Badge`, `Table`) that replace the existing ad-hoc variants. This is the prerequisite for the landing redesign and all future role-page work.

**Architecture:** CSS custom properties remain the single source of truth (declared in `globals.css`); Tailwind config exposes the subset components need as utility classes. All primitives live in `src/components/ui/<Name>.tsx`, accept a `className` prop merged via `clsx` + `tailwind-merge`, and only reference token CSS variables — no hex literals. Tests use Vitest + React Testing Library (already configured: `vitest.config.ts`, `src/test/setup.ts`).

**Tech Stack:** Next.js 16 / TypeScript 5 / Tailwind 3.4 / clsx / tailwind-merge / lucide-react / Vitest / @testing-library/react / framer-motion.

**Spec:** `docs/superpowers/specs/2026-05-15-design-system-foundation-design.md`

---

## File Structure

**Modify:**
- `src/app/globals.css` — token fixes, additions, Fraunces import, remove Material Symbols block
- `src/app/layout.tsx` — preload Fraunces 500 weight if needed
- `tailwind.config.ts` — remove leftover color/spacing entries, add new ones
- `src/components/ui/index.ts` — re-export new primitives

**Create:**
- `src/lib/cn.ts` — `clsx + tailwind-merge` helper (used by every primitive)
- `src/components/ui/Button.tsx` + `Button.test.tsx`
- `src/components/ui/Card.tsx` + `Card.test.tsx`
- `src/components/ui/Stat.tsx` + `Stat.test.tsx`
- `src/components/ui/Input.tsx` + `Input.test.tsx`
- `src/components/ui/Badge.tsx` + `Badge.test.tsx`
- `src/components/ui/Table.tsx` + `Table.test.tsx`

**Delete:**
- `src/components/ui/AnimatedButton.tsx`
- `src/components/ui/UnifiedButton.tsx`
- `src/components/shared/LoadingButton.tsx`
- `src/components/ui/AnimatedInput.tsx`
- `src/components/ui/UnifiedInput.tsx`
- `src/components/ui/input.tsx` (lowercase shadcn-style — replaced by `Input.tsx`)
- `src/components/ui/button.tsx` (lowercase shadcn-style — replaced by `Button.tsx`)
- `src/components/ui/BentoCard.tsx`
- `src/components/ui/card.tsx` (lowercase — replaced by `Card.tsx`)
- `src/components/ui/StatusBadge.tsx` (folded into `Badge.tsx`)
- `src/components/shared/StatusBadge.tsx` (duplicate)
- `src/components/shared/RoleBadge.tsx` (folded into `Badge.tsx`)

`DataTable.tsx` is replaced in-place by `Table.tsx` after consumers migrate; deletion occurs in the migration task.

---

## Phase 1 — Tokens & Typography

### Task 1: Inventory deprecated token usage

**Files:** none modified. Research-only task — produces a checklist for later replacement.

- [ ] **Step 1: Grep deprecated tokens**

Run each command and record file:line of every hit in a scratch note (terminal output is enough — the next task references these locations):

```bash
cd f:/OPSMP/PropertManagement
rg "--surface-100|--surface-200|--surface-300|--surface-variant" src/ -n
rg "--secondary-container|--tertiary-container|--on-secondary-container|--on-tertiary-container" src/ -n
rg "--on-surface(?!-variant)|--on-surface-variant|--outline-variant|--outline\b" src/ -n
rg "--on-primary|--on-accent" src/ -n
rg "--radius-full\b" src/ -n
rg "material-symbols-outlined" src/ -n
rg "Material Symbols Outlined" src/ -n
rg "AnimatedButton|UnifiedButton|LoadingButton|AnimatedInput|UnifiedInput|BentoCard" src/ -n
rg "from '@/components/ui/button'|from '@/components/ui/input'|from '@/components/ui/card'" src/ -n
rg "RoleBadge|StatusBadge" src/ -n
```

- [ ] **Step 2: Record hits**

For each grep result, note the file path and decide:
- Token rename → mechanical replacement in Task 5
- Component import → migration in the relevant primitive task (7-12)
- Material Symbols → migration in Task 13

No commit — this task is reconnaissance only.

### Task 2: Apply token fixes + additions to `globals.css`

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Add Fraunces import + token additions**

Open `src/app/globals.css`. After the existing `@import url('https://fonts.googleapis.com/css2?family=Inter:...')` line and BEFORE the Material Symbols import, insert:

```css
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&display=swap');
```

Then DELETE the Material Symbols `@import url('...Material+Symbols+Outlined...')` line entirely.

- [ ] **Step 2: Fix and add tokens inside `:root { }`**

In the `:root` block, apply these replacements (search the exact strings below):

Replace:
```css
  --state-warning:    #3B82F6;
  --state-warning-bg: #DBEAFE;
```
with:
```css
  --state-warning:    #F59E0B;
  --state-warning-bg: #FEF3C7;
  --state-info:       #3B82F6;
  --state-info-bg:    #DBEAFE;
```

Replace the duplicated radius block:
```css
  --radius-sm:   6px;
  --radius-md:   10px;
  --radius-lg:   16px;
  --radius-xl:   24px;
  --radius-xl:   0.5rem;
  --radius-pill: 9999px;
  --radius-full: 0.75rem;
```
with:
```css
  --radius-sm:    6px;
  --radius-md:    10px;
  --radius-lg:    16px;
  --radius-xl:    24px;
  --radius-2xl:   32px;
  --radius-card:  12px;
  --radius-pill:  9999px;
```

Delete these lines entirely (Material 3 / Bootstrap leftovers):
```css
  --surface-100:      #f8f9fa;
  --surface-200:      #e9ecef;
  --surface-300:      #dee2e6;
  --surface-variant:  #f5f5f5;
  --on-primary:       #ffffff;
  --on-accent:        #000000;
  --on-surface:       #131b2e;
  --on-surface-variant: #64748B;
  --outline:          rgba(19, 27, 46, 0.14);
  --outline-variant: rgba(19, 27, 46, 0.08);
  --secondary-container: #E8F7F2;
  --on-secondary-container: #0F766E;
  --tertiary-container: #F3E8FF;
  --on-tertiary-container: #6B21A8;
```

After the existing `--transition-spring` line, append these new tokens before the closing `}`:

```css
  /* ─── Fonts ────────────────────────────────────── */
  --font-serif:  'Fraunces', Georgia, 'Times New Roman', serif;
  --font-mono:   'JetBrains Mono', ui-monospace, Menlo, monospace;

  /* ─── Section rhythm ───────────────────────────── */
  --space-16: 64px;
  --space-20: 80px;
  --space-24: 96px;

  /* ─── Containers ──────────────────────────────── */
  --container-editorial: 1200px;
  --container-dashboard: 1280px;

  /* ─── Focus ───────────────────────────────────── */
  --shadow-focus: 0 0 0 3px rgba(240, 165, 0, 0.35);
```

(`--font-sans` is already declared.)

- [ ] **Step 3: Remove Material Symbols CSS block + dark-mode auto-trigger**

Inside `globals.css`, DELETE the entire `.material-symbols-outlined { ... }` rule block (currently ~lines 195-209).

Also REPLACE the `@media (prefers-color-scheme: dark) { ... }` block with a `[data-theme="dark"]` attribute-driven selector so dark overrides stop firing on every Tanzanian device:

```css
[data-theme="dark"] {
  --surface-page:    #111110;
  --surface-card:    #1A1A18;
  --surface-overlay: #242422;
  --text-primary:    #F1EFE8;
  --text-secondary:  #B4B2A9;
  --border-subtle:   rgba(241, 239, 232, 0.06);
  --border-default:  rgba(241, 239, 232, 0.12);
}
```

- [ ] **Step 4: Verify build still passes**

Run:
```bash
cd f:/OPSMP/PropertManagement
npm run build
```
Expected: build completes without CSS errors. Existing pages may have visual regressions where deprecated tokens are referenced — those are fixed in Task 5.

- [ ] **Step 5: Commit**

```bash
git add src/app/globals.css
git commit -m "feat(ds): canonicalize tokens, add Fraunces, gate dark mode behind data-theme"
```

### Task 3: Sync `tailwind.config.ts` to new token set

**Files:**
- Modify: `tailwind.config.ts`

- [ ] **Step 1: Replace the `colors` section**

Open `tailwind.config.ts`. Replace the entire `colors: { ... }` block inside `theme.extend` with:

```ts
      colors: {
        primary: {
          DEFAULT: 'var(--brand-primary)',
          light: 'var(--brand-primary-light)',
          dark: 'var(--brand-primary-dark)',
          foreground: 'var(--text-on-brand)',
        },
        accent: {
          DEFAULT: 'var(--brand-gold)',
          light: 'var(--brand-gold-light)',
          dark: 'var(--brand-gold-dark)',
          foreground: 'var(--brand-primary)',
        },
        surface: {
          page: 'var(--surface-page)',
          card: 'var(--surface-card)',
          overlay: 'var(--surface-overlay)',
          dark: 'var(--surface-dark)',
          'dark-card': 'var(--surface-dark-card)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
          'on-dark': 'var(--text-on-dark)',
          'on-brand': 'var(--text-on-brand)',
        },
        border: {
          DEFAULT: 'var(--border-default)',
          subtle: 'var(--border-subtle)',
          strong: 'var(--border-strong)',
          focus: 'var(--border-focus)',
        },
        state: {
          success: 'var(--state-success)',
          'success-bg': 'var(--state-success-bg)',
          warning: 'var(--state-warning)',
          'warning-bg': 'var(--state-warning-bg)',
          error: 'var(--state-error)',
          'error-bg': 'var(--state-error-bg)',
          info: 'var(--state-info)',
          'info-bg': 'var(--state-info-bg)',
        },
        status: {
          urgent: 'var(--status-urgent)',
          'in-progress': 'var(--status-in-progress)',
          scheduled: 'var(--status-scheduled)',
          completed: 'var(--status-completed)',
        },
      },
```

- [ ] **Step 2: Replace `fontFamily` and `fontSize`**

Replace the `fontFamily` block:

```ts
      fontFamily: {
        sans: ['var(--font-sans)', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
```

Replace the `fontSize` block with the canonical scale:

```ts
      fontSize: {
        display: ['64px', { lineHeight: '72px', fontWeight: '500', letterSpacing: '-0.02em' }],
        h1:      ['44px', { lineHeight: '52px', fontWeight: '500', letterSpacing: '-0.01em' }],
        h2:      ['28px', { lineHeight: '36px', fontWeight: '600', letterSpacing: '-0.005em' }],
        h3:      ['20px', { lineHeight: '28px', fontWeight: '600' }],
        h4:      ['16px', { lineHeight: '24px', fontWeight: '600' }],
        'body-lg': ['18px', { lineHeight: '28px' }],
        body:    ['15px', { lineHeight: '24px' }],
        'body-sm': ['13px', { lineHeight: '20px' }],
        caption: ['12px', { lineHeight: '16px', fontWeight: '500', letterSpacing: '0.04em' }],
        data:    ['15px', { lineHeight: '20px', fontWeight: '500', fontVariantNumeric: 'tabular-nums' }],
        mono:    ['13px', { lineHeight: '20px' }],
      },
```

- [ ] **Step 3: Replace `spacing`, `borderRadius`, `boxShadow`, `transitionDuration`**

Replace `spacing` block:

```ts
      spacing: {
        '1': 'var(--space-1)',
        '2': 'var(--space-2)',
        '3': 'var(--space-3)',
        '4': 'var(--space-4)',
        '5': 'var(--space-5)',
        '6': 'var(--space-6)',
        '8': 'var(--space-8)',
        '10': 'var(--space-10)',
        '12': 'var(--space-12)',
        '16': 'var(--space-16)',
        '20': 'var(--space-20)',
        '24': 'var(--space-24)',
      },
```

Replace `borderRadius`:

```ts
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        card: 'var(--radius-card)',
        pill: 'var(--radius-pill)',
      },
```

Replace `boxShadow`:

```ts
      boxShadow: {
        card: 'var(--shadow-card)',
        modal: 'var(--shadow-modal)',
        dropdown: 'var(--shadow-dropdown)',
        bold: 'var(--shadow-bold)',
        focus: 'var(--shadow-focus)',
      },
```

Replace `transitionDuration`:

```ts
      transitionDuration: {
        fast: '120ms',
        base: '200ms',
        slow: '320ms',
        spring: '400ms',
      },
```

Add `maxWidth`:

```ts
      maxWidth: {
        editorial: 'var(--container-editorial)',
        dashboard: 'var(--container-dashboard)',
      },
```

- [ ] **Step 4: Verify build**

```bash
npm run build
```
Expected: clean build. Any failures inside `src/components/` reference removed Tailwind classes — note them for Task 5.

- [ ] **Step 5: Commit**

```bash
git add tailwind.config.ts
git commit -m "feat(ds): sync tailwind config to canonical tokens"
```

### Task 4: Add the `cn` helper

**Files:**
- Create: `src/lib/cn.ts`

- [ ] **Step 1: Check whether helper already exists**

```bash
rg "tailwind-merge" src/lib/ -n
```
If `src/lib/cn.ts` or equivalent already exists with the same export, skip this task. Otherwise continue.

- [ ] **Step 2: Create helper**

`src/lib/cn.ts`:

```ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/cn.ts
git commit -m "feat(ds): add cn helper (clsx + tailwind-merge)"
```

### Task 5: Migrate deprecated token references repo-wide

**Files:** every file flagged in Task 1.

- [ ] **Step 1: Rename token references**

For each file:line recorded in Task 1, apply these replacements (case-sensitive, whole-token):

| Old | New |
|---|---|
| `--on-primary` | `--text-on-brand` |
| `--on-accent` | `--brand-primary` |
| `--on-surface` | `--text-primary` |
| `--on-surface-variant` | `--text-muted` |
| `--outline` | `--border-default` |
| `--outline-variant` | `--border-subtle` |
| `--surface-variant` | `--surface-overlay` |
| `--surface-100` | `--surface-overlay` |
| `--surface-200` | `--border-subtle` |
| `--surface-300` | `--border-default` |
| `--radius-full` | `--radius-card` |

Tailwind class equivalents (also from Task 1 hits):

| Old class | New class |
|---|---|
| `surface-variant` | `surface-overlay` |
| `outline-variant` | `border-subtle` |
| `bg-secondary-container`, `text-on-secondary-container` | remove (no replacement — those used surfaces are dashboard-internal and will be redesigned later) |
| `rounded-full` (when meaning card corner, not pill) | `rounded-card` |

- [ ] **Step 2: Verify build**

```bash
npm run build
```
Expected: clean. If a file still references a removed token (means Task 1 missed it), repeat the grep:

```bash
rg "\-\-surface-100|\-\-surface-200|\-\-surface-300|\-\-surface-variant|\-\-on-primary|\-\-on-accent|\-\-on-surface|\-\-outline|\-\-secondary-container|\-\-tertiary-container" src/
```

Expected after fix: zero matches.

- [ ] **Step 3: Commit**

```bash
git add -A src/
git commit -m "refactor(ds): migrate deprecated token references"
```

---

## Phase 2 — Primitives

> Each primitive task follows the same arc: write failing test → run it red → implement → green → migrate existing call sites → delete obsolete file → commit.

### Task 6: `Button` primitive

**Files:**
- Create: `src/components/ui/Button.tsx`
- Create: `src/components/ui/Button.test.tsx`
- Migrate: every file that imports `AnimatedButton`, `UnifiedButton`, `LoadingButton`, or the lowercase `button` (Task 1 hits)
- Delete: `src/components/ui/AnimatedButton.tsx`, `src/components/ui/UnifiedButton.tsx`, `src/components/shared/LoadingButton.tsx`, `src/components/ui/button.tsx`

- [ ] **Step 1: Write failing test**

`src/components/ui/Button.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('applies variant class', () => {
    render(<Button variant="gold">Go</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-accent');
  });

  it('disables and shows spinner when loading', () => {
    render(<Button loading>Save</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    expect(btn.querySelector('[data-testid="spinner"]')).toBeInTheDocument();
  });

  it('fires onClick when not loading', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Hi</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('does not fire onClick when loading', () => {
    const onClick = vi.fn();
    render(<Button loading onClick={onClick}>Hi</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('renders as anchor when as="a" and href provided', () => {
    render(<Button as="a" href="/x">Link</Button>);
    expect(screen.getByRole('link', { name: 'Link' })).toHaveAttribute('href', '/x');
  });
});
```

- [ ] **Step 2: Verify test fails**

```bash
npm run test:run -- src/components/ui/Button.test.tsx
```
Expected: 6 failures — `Cannot find module './Button'`.

- [ ] **Step 3: Implement Button**

`src/components/ui/Button.tsx`:

```tsx
'use client';

import { forwardRef, type ButtonHTMLAttributes, type AnchorHTMLAttributes, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'gold' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface BaseProps {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  children?: ReactNode;
  className?: string;
}

type ButtonAsButton = BaseProps & Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps> & { as?: 'button' };
type ButtonAsAnchor = BaseProps & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseProps> & { as: 'a'; href: string };
type ButtonProps = ButtonAsButton | ButtonAsAnchor;

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:   'bg-primary text-text-on-brand hover:bg-primary-light active:translate-y-px',
  gold:      'bg-accent text-accent-foreground hover:bg-accent-light active:translate-y-px shadow-card',
  secondary: 'bg-transparent text-text-primary border border-border-default hover:bg-surface-overlay',
  ghost:     'bg-transparent text-text-primary hover:bg-surface-overlay',
  danger:    'bg-state-error text-text-on-brand hover:opacity-90',
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: 'h-8 px-3 text-body-sm gap-1.5',
  md: 'h-10 px-4 text-body gap-2',
  lg: 'h-12 px-6 text-body-lg gap-2',
};

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(function Button(
  props,
  ref,
) {
  const {
    variant = 'primary',
    size = 'md',
    loading = false,
    fullWidth = false,
    iconLeft,
    iconRight,
    children,
    className,
    as = 'button',
    ...rest
  } = props as ButtonAsButton & { as?: 'a'; href?: string };

  const classes = cn(
    'inline-flex items-center justify-center rounded-md font-medium transition-all duration-base',
    'focus-visible:outline-none focus-visible:shadow-focus',
    'disabled:opacity-50 disabled:pointer-events-none',
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    fullWidth && 'w-full',
    className,
  );

  const content = (
    <>
      {loading ? <Loader2 data-testid="spinner" className="animate-spin" size={16} /> : iconLeft}
      {children}
      {!loading && iconRight}
    </>
  );

  if (as === 'a') {
    const { href, onClick, ...anchorRest } = rest as AnchorHTMLAttributes<HTMLAnchorElement>;
    return (
      <a
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        className={classes}
        onClick={loading ? (e) => e.preventDefault() : onClick}
        aria-disabled={loading || undefined}
        {...anchorRest}
      >
        {content}
      </a>
    );
  }

  const { onClick, disabled, type = 'button', ...buttonRest } = rest as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      type={type}
      disabled={disabled || loading}
      className={classes}
      onClick={loading ? undefined : onClick}
      {...buttonRest}
    >
      {content}
    </button>
  );
});
```

- [ ] **Step 4: Verify test passes**

```bash
npm run test:run -- src/components/ui/Button.test.tsx
```
Expected: 6 passes.

- [ ] **Step 5: Migrate consumers**

For every file flagged in Task 1 that imports `AnimatedButton`, `UnifiedButton`, `LoadingButton`, or `'@/components/ui/button'`:

- Replace the import with `import { Button } from '@/components/ui/Button';`
- Map props:
  - `AnimatedButton` → `Button` (no special handling — Framer Motion hover handled internally via CSS).
  - `UnifiedButton` props mostly align: `variant`, `size`. Verify each call site.
  - `LoadingButton isLoading={x}` → `Button loading={x}`.
- For any landing-page inline `<button>` styled with `bg-[#0F172A]` / `bg-[var(--brand-primary)]` patterns: leave for the landing page replacement (Plan 2). This task migrates only existing `*Button` imports.

- [ ] **Step 6: Delete obsolete files**

```bash
rm src/components/ui/AnimatedButton.tsx
rm src/components/ui/UnifiedButton.tsx
rm src/components/shared/LoadingButton.tsx
rm src/components/ui/button.tsx
```

- [ ] **Step 7: Verify build + tests**

```bash
npm run build
npm run test:run
```
Expected: both clean.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat(ds): introduce Button primitive, delete legacy variants"
```

### Task 7: `Card` primitive

**Files:**
- Create: `src/components/ui/Card.tsx`, `src/components/ui/Card.test.tsx`
- Migrate: consumers of `BentoCard` + lowercase `card`
- Delete: `src/components/ui/BentoCard.tsx`, `src/components/ui/card.tsx`

- [ ] **Step 1: Failing test**

`src/components/ui/Card.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card } from './Card';

describe('Card', () => {
  it('renders children', () => {
    render(<Card>hello</Card>);
    expect(screen.getByText('hello')).toBeInTheDocument();
  });

  it('applies elevated variant by default', () => {
    const { container } = render(<Card>x</Card>);
    expect(container.firstChild).toHaveClass('shadow-card');
  });

  it('applies outlined variant', () => {
    const { container } = render(<Card variant="outlined">x</Card>);
    expect(container.firstChild).toHaveClass('border');
  });

  it('renders header and footer slots', () => {
    render(<Card header={<h2>H</h2>} footer={<span>F</span>}>body</Card>);
    expect(screen.getByText('H')).toBeInTheDocument();
    expect(screen.getByText('F')).toBeInTheDocument();
    expect(screen.getByText('body')).toBeInTheDocument();
  });

  it('adds interactive cursor when interactive', () => {
    const { container } = render(<Card interactive>x</Card>);
    expect(container.firstChild).toHaveClass('cursor-pointer');
  });
});
```

- [ ] **Step 2: Verify fails**

```bash
npm run test:run -- src/components/ui/Card.test.tsx
```
Expected: 5 failures.

- [ ] **Step 3: Implement**

`src/components/ui/Card.tsx`:

```tsx
import { type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'elevated' | 'outlined' | 'flat';
type Padding = 'none' | 'compact' | 'comfortable' | 'spacious';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: Variant;
  padding?: Padding;
  interactive?: boolean;
  header?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
}

const VARIANT: Record<Variant, string> = {
  elevated: 'bg-surface-card shadow-card border border-border-subtle',
  outlined: 'bg-surface-card border border-border-default',
  flat:     'bg-surface-card',
};

const PADDING: Record<Padding, string> = {
  none:        'p-0',
  compact:     'p-4',
  comfortable: 'p-6',
  spacious:    'p-8',
};

export function Card({
  variant = 'elevated',
  padding = 'comfortable',
  interactive = false,
  header,
  footer,
  children,
  className,
  ...rest
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-lg transition-all duration-base',
        VARIANT[variant],
        interactive && 'cursor-pointer hover:-translate-y-0.5 hover:shadow-bold',
        className,
      )}
      {...rest}
    >
      {header && <div className="px-6 pt-6 pb-3 border-b border-border-subtle">{header}</div>}
      <div className={cn(PADDING[padding], header && 'pt-3', footer && 'pb-3')}>{children}</div>
      {footer && <div className="px-6 pb-6 pt-3 border-t border-border-subtle">{footer}</div>}
    </div>
  );
}
```

- [ ] **Step 4: Verify passes**

```bash
npm run test:run -- src/components/ui/Card.test.tsx
```
Expected: 5 passes.

- [ ] **Step 5: Migrate `BentoCard` consumers**

For each `BentoCard` hit from Task 1: swap import and prop mapping.

`BentoCard` typically accepts `{ icon, label, value }`. The new `Card` is generic — wrap as a `Stat` (Task 8) at those sites instead. Until `Stat` lands, leave `BentoCard` consumers untouched and migrate them in Task 8 along with the new `Stat` primitive.

For lowercase `card.tsx` (shadcn-style `Card / CardContent / CardHeader / CardTitle`): if any consumers use the sub-exports (`CardContent`, etc.), keep `Card.tsx` exports compatible by also exporting:

```ts
export const CardContent = ({ children, className, ...rest }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('p-6', className)} {...rest}>{children}</div>
);
export const CardHeader = ({ children, className, ...rest }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('px-6 pt-6 pb-3', className)} {...rest}>{children}</div>
);
export const CardTitle = ({ children, className, ...rest }: HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn('text-h3', className)} {...rest}>{children}</h3>
);
```

Add these named exports at the bottom of `Card.tsx`. Update consumer imports from `'@/components/ui/card'` → `'@/components/ui/Card'`.

- [ ] **Step 6: Delete obsolete**

```bash
rm src/components/ui/card.tsx
```
(Do NOT delete `BentoCard.tsx` yet — Task 8 handles it.)

- [ ] **Step 7: Verify**

```bash
npm run build
npm run test:run
```
Expected: clean.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat(ds): introduce Card primitive, retire lowercase card module"
```

### Task 8: `Stat` primitive (+ retire `BentoCard`)

**Files:**
- Create: `src/components/ui/Stat.tsx`, `src/components/ui/Stat.test.tsx`
- Migrate: every `BentoCard` consumer
- Delete: `src/components/ui/BentoCard.tsx`

- [ ] **Step 1: Failing test**

`src/components/ui/Stat.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Users } from 'lucide-react';
import { Stat } from './Stat';

describe('Stat', () => {
  it('renders label and value', () => {
    render(<Stat label="Users" value={42} />);
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders unit suffix', () => {
    render(<Stat label="Revenue" value="128,450" unit="TZS" />);
    expect(screen.getByText('TZS')).toBeInTheDocument();
  });

  it('renders trend with direction', () => {
    render(<Stat label="x" value={10} trend={{ direction: 'up', value: 12 }} />);
    expect(screen.getByText(/12%/)).toBeInTheDocument();
  });

  it('renders icon when provided', () => {
    render(<Stat label="x" value={1} icon={Users} />);
    expect(document.querySelector('svg')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Verify fails**

```bash
npm run test:run -- src/components/ui/Stat.test.tsx
```
Expected: 4 failures.

- [ ] **Step 3: Implement**

`src/components/ui/Stat.tsx`:

```tsx
import { type LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/lib/cn';

type Tone = 'default' | 'success' | 'warning' | 'danger' | 'info';
type Size = 'sm' | 'md' | 'lg';

interface StatProps {
  label: string;
  value: string | number;
  unit?: string;
  trend?: { direction: 'up' | 'down'; value: number };
  icon?: LucideIcon;
  tone?: Tone;
  size?: Size;
  className?: string;
}

const TONE_TEXT: Record<Tone, string> = {
  default: 'text-text-primary',
  success: 'text-state-success',
  warning: 'text-state-warning',
  danger:  'text-state-error',
  info:    'text-state-info',
};

const VALUE_SIZE: Record<Size, string> = {
  sm: 'text-h3',
  md: 'text-h2',
  lg: 'text-display',
};

export function Stat({
  label,
  value,
  unit,
  trend,
  icon: Icon,
  tone = 'default',
  size = 'md',
  className,
}: StatProps) {
  return (
    <div className={cn('relative', className)}>
      {Icon && (
        <Icon size={20} className="absolute right-0 top-0 text-text-muted" aria-hidden />
      )}
      <p className="text-caption uppercase text-text-muted">{label}</p>
      <p className={cn('font-medium tabular-nums mt-1', VALUE_SIZE[size], TONE_TEXT[tone])}>
        {value}
        {unit && <span className="ml-1.5 text-body-sm text-text-muted font-normal">{unit}</span>}
      </p>
      {trend && (
        <span
          className={cn(
            'mt-2 inline-flex items-center gap-1 text-body-sm',
            trend.direction === 'up' ? 'text-state-success' : 'text-state-error',
          )}
        >
          {trend.direction === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {trend.value}%
        </span>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Verify passes**

```bash
npm run test:run -- src/components/ui/Stat.test.tsx
```
Expected: 4 passes.

- [ ] **Step 5: Migrate `BentoCard` consumers**

In every file from Task 1 that imports `BentoCard`:

Replace:
```tsx
import { BentoCard } from '@/components/ui/BentoCard';
// ...
<BentoCard icon={<Users size={20} />} label="Total Users" value="156" />
```

With:
```tsx
import { Stat } from '@/components/ui/Stat';
import { Card } from '@/components/ui/Card';
import { Users } from 'lucide-react';
// ...
<Card padding="comfortable"><Stat icon={Users} label="Total Users" value="156" /></Card>
```

- [ ] **Step 6: Delete**

```bash
rm src/components/ui/BentoCard.tsx
```

- [ ] **Step 7: Verify**

```bash
npm run build
npm run test:run
```
Expected: clean.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat(ds): add Stat primitive, retire BentoCard"
```

### Task 9: `Input` primitive

**Files:**
- Create: `src/components/ui/Input.tsx`, `src/components/ui/Input.test.tsx`
- Migrate: every consumer of `AnimatedInput`, `UnifiedInput`, lowercase `input`
- Delete: `src/components/ui/AnimatedInput.tsx`, `src/components/ui/UnifiedInput.tsx`, `src/components/ui/input.tsx`

- [ ] **Step 1: Failing test**

`src/components/ui/Input.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Input } from './Input';

describe('Input', () => {
  it('renders with label', () => {
    render(<Input label="Email" />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('shows helper text', () => {
    render(<Input label="Email" helper="we never share" />);
    expect(screen.getByText('we never share')).toBeInTheDocument();
  });

  it('shows error and aria-invalid', () => {
    render(<Input label="Email" error="required" />);
    expect(screen.getByText('required')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
  });

  it('renders left icon', () => {
    render(<Input label="Search" iconLeft={<span data-testid="leaf">L</span>} />);
    expect(screen.getByTestId('leaf')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Verify fails**

```bash
npm run test:run -- src/components/ui/Input.test.tsx
```
Expected: 4 failures.

- [ ] **Step 3: Implement**

`src/components/ui/Input.tsx`:

```tsx
'use client';

import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Size = 'sm' | 'md' | 'lg';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  helper?: string;
  error?: string;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  size?: Size;
}

const SIZE: Record<Size, string> = {
  sm: 'h-8 text-body-sm',
  md: 'h-10 text-body',
  lg: 'h-12 text-body-lg',
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, helper, error, iconLeft, iconRight, size = 'md', className, id, ...rest },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const helperId = `${inputId}-helper`;
  const hasError = Boolean(error);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-label mb-1.5 text-text-primary">
          {label}
        </label>
      )}
      <div className="relative">
        {iconLeft && (
          <span className="absolute inset-y-0 left-3 flex items-center text-text-muted pointer-events-none">
            {iconLeft}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={hasError || undefined}
          aria-describedby={(helper || error) ? helperId : undefined}
          className={cn(
            'w-full rounded-md bg-surface-card text-text-primary',
            'border placeholder:text-text-muted',
            'transition-all duration-base',
            'focus:outline-none focus:shadow-focus',
            'disabled:bg-surface-overlay disabled:text-text-muted disabled:cursor-not-allowed',
            iconLeft && 'pl-10',
            iconRight && 'pr-10',
            !iconLeft && 'px-3',
            SIZE[size],
            hasError ? 'border-state-error focus:border-state-error' : 'border-border-default focus:border-border-focus',
            className,
          )}
          {...rest}
        />
        {iconRight && (
          <span className="absolute inset-y-0 right-3 flex items-center text-text-muted">
            {iconRight}
          </span>
        )}
      </div>
      {(error || helper) && (
        <p
          id={helperId}
          className={cn('mt-1.5 text-body-sm', hasError ? 'text-state-error' : 'text-text-muted')}
        >
          {error ?? helper}
        </p>
      )}
    </div>
  );
});
```

- [ ] **Step 4: Verify passes**

```bash
npm run test:run -- src/components/ui/Input.test.tsx
```
Expected: 4 passes.

- [ ] **Step 5: Migrate consumers**

Each `AnimatedInput` / `UnifiedInput` / `'@/components/ui/input'` import → `Input` from `'@/components/ui/Input'`. Common props map directly. For `UnifiedInput` instances that used a `success` state, drop it (not in this primitive's surface — open follow-up if needed).

- [ ] **Step 6: Delete obsolete**

```bash
rm src/components/ui/AnimatedInput.tsx
rm src/components/ui/UnifiedInput.tsx
rm src/components/ui/input.tsx
rm src/components/ui/input.test.ts
```

- [ ] **Step 7: Verify**

```bash
npm run build
npm run test:run
```
Expected: clean.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat(ds): add Input primitive, retire legacy input variants"
```

### Task 10: `Badge` primitive

**Files:**
- Create: `src/components/ui/Badge.tsx`, `src/components/ui/Badge.test.tsx`
- Migrate: every consumer of `StatusBadge` (two copies) and `RoleBadge`
- Delete: `src/components/ui/StatusBadge.tsx`, `src/components/shared/StatusBadge.tsx`, `src/components/shared/RoleBadge.tsx`

- [ ] **Step 1: Failing test**

`src/components/ui/Badge.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from './Badge';

describe('Badge', () => {
  it('renders label', () => {
    render(<Badge variant="success">Active</Badge>);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders dot when prop set', () => {
    const { container } = render(<Badge variant="success" dot>Active</Badge>);
    expect(container.querySelector('[data-testid="badge-dot"]')).toBeInTheDocument();
  });

  it('applies info variant class', () => {
    const { container } = render(<Badge variant="info">Pending</Badge>);
    expect(container.firstChild).toHaveClass('bg-state-info-bg');
  });
});
```

- [ ] **Step 2: Verify fails**

```bash
npm run test:run -- src/components/ui/Badge.test.tsx
```
Expected: 3 failures.

- [ ] **Step 3: Implement**

`src/components/ui/Badge.tsx`:

```tsx
import { type ReactNode, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

type Variant = 'success' | 'warning' | 'info' | 'error' | 'neutral' | 'gold' | 'dark';
type Size = 'sm' | 'md';

interface BadgeProps {
  variant?: Variant;
  size?: Size;
  icon?: LucideIcon;
  dot?: boolean;
  children: ReactNode;
  className?: string;
}

const VARIANT: Record<Variant, { bg: string; text: string; dot: string }> = {
  success: { bg: 'bg-state-success-bg', text: 'text-state-success', dot: 'bg-state-success' },
  warning: { bg: 'bg-state-warning-bg', text: 'text-state-warning', dot: 'bg-state-warning' },
  info:    { bg: 'bg-state-info-bg',    text: 'text-state-info',    dot: 'bg-state-info' },
  error:   { bg: 'bg-state-error-bg',   text: 'text-state-error',   dot: 'bg-state-error' },
  neutral: { bg: 'bg-surface-overlay',  text: 'text-text-secondary',dot: 'bg-text-muted' },
  gold:    { bg: 'bg-accent/15',        text: 'text-accent-dark',   dot: 'bg-accent' },
  dark:    { bg: 'bg-primary',          text: 'text-text-on-brand', dot: 'bg-accent' },
};

const SIZE: Record<Size, string> = {
  sm: 'h-5 px-2 text-caption gap-1',
  md: 'h-6 px-2.5 text-caption gap-1.5',
};

export function Badge({ variant = 'neutral', size = 'md', icon: Icon, dot, children, className }: BadgeProps) {
  const v = VARIANT[variant];
  return (
    <span className={cn('inline-flex items-center rounded-pill font-medium', v.bg, v.text, SIZE[size], className)}>
      {dot && <span data-testid="badge-dot" className={cn('w-1.5 h-1.5 rounded-pill', v.dot)} />}
      {Icon && <Icon size={size === 'sm' ? 10 : 12} aria-hidden />}
      {children}
    </span>
  );
}
```

(Note: the `LucideIcon` import path in lucide-react v1 is from its main entry. If the import fails at build, change `import { type ReactNode, type LucideIcon } from 'lucide-react';` to `import type { LucideIcon } from 'lucide-react'; import { type ReactNode } from 'react';`.)

- [ ] **Step 4: Verify passes**

```bash
npm run test:run -- src/components/ui/Badge.test.tsx
```
Expected: 3 passes.

- [ ] **Step 5: Migrate `StatusBadge` consumers**

`StatusBadge` currently maps a status enum to color. Add a thin compatibility shim at the bottom of `Badge.tsx` to ease migration:

```tsx
const STATUS_MAP: Record<string, Variant> = {
  ACTIVE: 'success',
  ACCEPTED: 'success',
  COMPLETED: 'success',
  VERIFIED: 'success',
  PENDING: 'warning',
  PENDING_VERIFICATION: 'warning',
  PENDING_ASSIGNMENT: 'warning',
  IN_PROGRESS: 'info',
  SCHEDULED: 'info',
  SUSPENDED: 'error',
  CANCELLED: 'error',
  REJECTED: 'error',
  EXPIRED: 'neutral',
};

export function StatusBadge({ status, ...rest }: { status: string } & Omit<BadgeProps, 'variant' | 'children'>) {
  const variant = STATUS_MAP[status] ?? 'neutral';
  const label = status.replace(/_/g, ' ').toLowerCase();
  return <Badge variant={variant} dot {...rest}>{label}</Badge>;
}
```

Then update consumer imports:

```ts
// before
import { StatusBadge } from '@/components/ui/StatusBadge';
// after
import { StatusBadge } from '@/components/ui/Badge';
```

For `RoleBadge`, replace its usages directly with `<Badge variant="gold">OWNER</Badge>` etc. (Roles are a closed set: ADMIN/STAFF/OWNER/PROVIDER. Pick `dark/gold/neutral/info` respectively at call sites.)

- [ ] **Step 6: Delete obsolete**

```bash
rm src/components/ui/StatusBadge.tsx
rm src/components/shared/StatusBadge.tsx
rm src/components/shared/RoleBadge.tsx
```

- [ ] **Step 7: Verify**

```bash
npm run build
npm run test:run
```
Expected: clean.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat(ds): add Badge primitive with StatusBadge shim, retire legacy badges"
```

### Task 11: `Table` primitive

**Files:**
- Create: `src/components/ui/Table.tsx`, `src/components/ui/Table.test.tsx`
- Migrate: consumers of `DataTable`
- Delete: `src/components/ui/DataTable.tsx` (after all consumers migrated)

- [ ] **Step 1: Failing test**

`src/components/ui/Table.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Table, type Column } from './Table';

interface Row { id: string; name: string; }

const columns: Column<Row>[] = [
  { key: 'name', header: 'Name', accessor: (r) => r.name },
];

describe('Table', () => {
  it('renders rows', () => {
    render(<Table columns={columns} data={[{ id: '1', name: 'Ann' }]} keyExtractor={(r) => r.id} />);
    expect(screen.getByText('Ann')).toBeInTheDocument();
  });

  it('renders empty state when no data', () => {
    render(<Table columns={columns} data={[]} keyExtractor={(r) => r.id} emptyState="Nothing here" />);
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
  });

  it('renders skeleton rows when loading', () => {
    const { container } = render(<Table columns={columns} data={[]} keyExtractor={(r) => r.id} loading />);
    expect(container.querySelectorAll('[data-testid="skeleton-row"]').length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Verify fails**

```bash
npm run test:run -- src/components/ui/Table.test.tsx
```
Expected: 3 failures.

- [ ] **Step 3: Implement**

`src/components/ui/Table.tsx`:

```tsx
'use client';

import { useState, type ReactNode } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface Column<T> {
  key: string;
  header: string;
  accessor: (row: T) => ReactNode;
  sortBy?: (row: T) => string | number;
  align?: 'left' | 'right' | 'center';
  width?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  loading?: boolean;
  emptyState?: ReactNode;
  onRowClick?: (row: T) => void;
  stickyHeader?: boolean;
  density?: 'compact' | 'comfortable';
  className?: string;
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  loading,
  emptyState = 'No data.',
  onRowClick,
  stickyHeader = false,
  density = 'comfortable',
  className,
}: TableProps<T>) {
  const [sort, setSort] = useState<{ key: string; dir: 'asc' | 'desc' } | null>(null);

  const sorted = (() => {
    if (!sort) return data;
    const col = columns.find((c) => c.key === sort.key);
    if (!col?.sortBy) return data;
    const copy = [...data];
    copy.sort((a, b) => {
      const av = col.sortBy!(a);
      const bv = col.sortBy!(b);
      if (av < bv) return sort.dir === 'asc' ? -1 : 1;
      if (av > bv) return sort.dir === 'asc' ? 1 : -1;
      return 0;
    });
    return copy;
  })();

  const cellY = density === 'compact' ? 'py-2' : 'py-3';
  const cellX = 'px-4';

  return (
    <div className={cn('w-full overflow-x-auto rounded-lg border border-border-subtle bg-surface-card', className)}>
      <table className="w-full text-body">
        <thead className={cn('bg-surface-overlay', stickyHeader && 'sticky top-0 z-10')}>
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                className={cn('text-caption uppercase text-text-muted text-left', cellX, cellY, c.align && `text-${c.align}`)}
                style={c.width ? { width: c.width } : undefined}
              >
                {c.sortBy ? (
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 hover:text-text-primary"
                    onClick={() =>
                      setSort((s) =>
                        s?.key === c.key ? { key: c.key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key: c.key, dir: 'asc' },
                      )
                    }
                  >
                    {c.header}
                    {sort?.key === c.key && (sort.dir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                  </button>
                ) : (
                  c.header
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} data-testid="skeleton-row" className="border-t border-border-subtle">
                  {columns.map((c) => (
                    <td key={c.key} className={cn(cellX, cellY)}>
                      <div className="h-3 bg-surface-overlay rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            : sorted.length === 0
            ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-text-muted">
                  {emptyState}
                </td>
              </tr>
            )
            : sorted.map((row) => (
                <tr
                  key={keyExtractor(row)}
                  className={cn(
                    'border-t border-border-subtle transition-colors',
                    onRowClick && 'cursor-pointer hover:bg-surface-overlay',
                  )}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {columns.map((c) => (
                    <td key={c.key} className={cn(cellX, cellY, c.align && `text-${c.align}`)}>
                      {c.accessor(row)}
                    </td>
                  ))}
                </tr>
              ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 4: Verify passes**

```bash
npm run test:run -- src/components/ui/Table.test.tsx
```
Expected: 3 passes.

- [ ] **Step 5: Migrate `DataTable` consumers**

`DataTable` has a similar surface (it was the inspiration). For each consumer:
- Import change: `import { DataTable, type Column }` → `import { Table, type Column }` from `'@/components/ui/Table'`.
- Component name: `<DataTable ... />` → `<Table ... />`.
- Prop `emptyMessage` → `emptyState`.

Mobile-stack behavior of the spec is not implemented in this primitive — note as a follow-up for the dashboard spec.

- [ ] **Step 6: Delete obsolete**

```bash
rm src/components/ui/DataTable.tsx
```

- [ ] **Step 7: Verify**

```bash
npm run build
npm run test:run
```
Expected: clean.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat(ds): add Table primitive with sort/empty/loading, retire DataTable"
```

---

## Phase 3 — Cleanup

### Task 12: Remove Material Symbols artefacts

**Files:** any file referencing the class or font (Task 1 inventory).

- [ ] **Step 1: Verify Material Symbols import was removed**

```bash
rg "Material Symbols Outlined" src/
```
Expected: zero (already removed in Task 2 — confirm).

- [ ] **Step 2: Replace remaining `material-symbols-outlined` usages**

For each `<span className="material-symbols-outlined">name</span>` hit, replace with a lucide icon. Map common names:

| Material symbol name | lucide-react equivalent |
|---|---|
| `home` | `Home` |
| `settings` | `Settings` |
| `notifications` | `Bell` |
| `dashboard` | `LayoutDashboard` |
| `account_circle` | `CircleUserRound` |
| `chevron_right` | `ChevronRight` |
| `more_vert` | `MoreVertical` |
| `search` | `Search` |
| `check` | `Check` |
| `close` | `X` |

For any name not in this table, look up the closest lucide equivalent at `https://lucide.dev/icons`.

- [ ] **Step 3: Verify zero remaining usage**

```bash
rg "material-symbols-outlined" src/
```
Expected: zero matches.

- [ ] **Step 4: Verify build + tests**

```bash
npm run build
npm run test:run
```
Expected: clean.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore(ds): replace Material Symbols usage with lucide-react icons"
```

### Task 13: Update `ui/index.ts` barrel export

**Files:** `src/components/ui/index.ts`

- [ ] **Step 1: Replace barrel**

Open `src/components/ui/index.ts`. Replace its entire content with:

```ts
export { Button } from './Button';
export { Card, CardContent, CardHeader, CardTitle } from './Card';
export { Stat } from './Stat';
export { Input } from './Input';
export { Badge, StatusBadge } from './Badge';
export { Table } from './Table';
export type { Column } from './Table';
export { EmptyState } from './EmptyState';
export { Skeleton } from './Skeleton';
export { Stepper } from './Stepper';
export { ThemeToggle } from './ThemeToggle';
export { Toast } from './Toast';
export { ErrorBoundary, ErrorBoundaryWrapper } from './ErrorBoundary';
export { TextArea } from './TextArea';
export { Logo } from './Logo';
```

(Only export files that still exist after Tasks 6-11. If `Hero.tsx`, `AccessibleWrapper.tsx`, or `Stepper.tsx` were unused, leave their re-export only if files exist — adjust the list to what `ls src/components/ui/` reports.)

- [ ] **Step 2: Verify build**

```bash
npm run build
```
Expected: clean. Resolve any remaining broken imports inline.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/index.ts
git commit -m "chore(ds): refresh ui barrel exports"
```

### Task 14: Final verification

- [ ] **Step 1: Hex-literal sweep**

```bash
rg "#[0-9A-Fa-f]{6}\b" src/ -g "!globals.css" -g "!tailwind.config.ts" -g "!*.test.*"
```
Expected: zero results. Any match must be replaced with a CSS variable or a Tailwind class that resolves to one.

- [ ] **Step 2: Deprecated-token sweep**

```bash
rg "\-\-surface-100|\-\-surface-200|\-\-surface-300|\-\-surface-variant|\-\-on-primary|\-\-on-accent|\-\-on-surface\b|\-\-on-surface-variant|\-\-outline\b|\-\-outline-variant|\-\-secondary-container|\-\-tertiary-container|\-\-radius-full" src/
```
Expected: zero results.

- [ ] **Step 3: Test suite**

```bash
npm run test:run
```
Expected: all green. Note the total count.

- [ ] **Step 4: Production build**

```bash
npm run build
```
Expected: clean. Note bundle size delta vs. before-Phase-2 if measurable.

- [ ] **Step 5: Manual smoke**

```bash
npm run dev
```

Visit:
- `http://localhost:3000/` — landing renders, no missing fonts (Fraunces visible in headlines once landing redesign lands, but Inter must already render correctly).
- `http://localhost:3000/login` — form inputs work, focus rings gold.
- `http://localhost:3000/register` — same.
- `http://localhost:3000/dashboard` — depending on role logged in: Admin / Owner / Provider dashboard renders, BentoCard replacements show stat values, tables render, badges show statuses.

Check DevTools console: no 404s on font files, no unresolved CSS variables (Computed pane shows real values).

- [ ] **Step 6: Commit verification artefact**

If there is anything to fix from Step 5, fix it and commit. Otherwise:

```bash
git commit --allow-empty -m "chore(ds): foundation verification pass green"
```

---

## Out of scope (handled in dashboard / landing specs)

- Dashboard page layouts and shell refactor.
- Landing page redesign — covered by `2026-05-15-landing-page-redesign.md`.
- Dark-mode implementation beyond gating.
- Mobile-stack version of `Table`.
- `Modal`, `Drawer`, `Tabs`, `Stepper`, `Toast` overhaul — only existing exports preserved.

---

## Self-review

**Spec coverage:**
- §3.1 token fixes → Task 2
- §3.2 token additions → Task 2
- §4 typography → Task 3
- §5 spacing → Task 3 (`spacing` block)
- §6 motion → Task 3 (`transitionDuration`); detailed motion classes applied per-component in Phase 2
- §7.1-7.6 six primitives → Tasks 6-11
- §8 icon system → Task 12
- §9 dark mode gating → Task 2 Step 3
- §10 migration plan → Tasks 5, 6-11 migration steps
- §11 verification → Task 14

**Placeholders:** none. Every step has executable code or commands.

**Type consistency:** `Column<T>` defined in Table (Task 11), exported. `StatusBadge` consumer signature preserved via shim (Task 10 Step 5). `Card` sub-exports added in Task 7 Step 5 to preserve shadcn-style consumers.

**Open items:** The shim `StatusBadge` ships from `Badge.tsx`. If a future audit prefers a separate file, it's a single-line move.
