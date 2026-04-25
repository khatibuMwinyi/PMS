# Login/Register Design Improvement Plan


**Goal:** Enhance the visual and layout quality of the login and registration pages, making them more consistent, accessible, and brand‑aligned.

**Architecture:** Apply small, focused changes across three areas: global style token fixes, layout component adjustments, and input/form component styling. All changes are built incrementally with commits that include unit tests where applicable.

**Tech Stack:** React 18, Next.js 13 (app router), Tailwind CSS (via CSS custom properties), Lucide‑React icons.
---

## Task 1: Refactor Global CSS Variables for Consistent Color Scheme

**Files to modify:** `src/app/globals.css`
- Update palette to use fully accessible contrast ratios.
- Add missing brand‑gold variable for button accents.
- Update text‑secondary to a darker shade.
- Add `--color-primary-dark` for headings.
- Add `--color-error-light` for error messages.
- Update spacing scale to include `--space-20`.

- [ ] **Step 1: Write failing snapshot test**
  ```js
  import { render } from '@testing-library/react';
  import { textColor } from '../src/app/globals.css'; // Ensure the module exposes the var
  test('primary color has sufficient contrast', () => {
    const result = getComputedStyle(document.documentElement).getPropertyValue('--color-primary');
    expect(stripHex(result)).toMatchColorContrastAgainst('#ffffff', 4.5);
  });
  ```

- [ ] **Step 2: Run test, see failure**
  ```bash
  npm test -- -t primary color
  ```

- [ ] **Step 3: Update globals.css with new variables**
  ```css
  :root {
    --brand-primary: #0f172a; /* dark navy */
    --brand-primary-dark: #0b1123;
    --brand-gold: #c89128; /* brand accent */
    --brand-gold-dark: #b67c20;
    --brand-light: #f8f8f9;
    --text-primary: var(--brand-primary);
    --text-secondary: #1a2b3c; /* darker authority */
    --text-muted: #65748b;
    --state-success: #10b981;
    --state-warning: var(--brand-gold-dark);
    --state-error: #ef4444;
    --state-error-light: #f99c9c;
    --space-1: 4px;  /* ... */
    --space-20: 80px;
  }
  ```

- [ ] **Step 4: Run test again, confirm PASS**

- [ ] **Step 5: Commit**
  ```bash
  git add src/app/globals.css
  git commit -m "chore: update color palette for better contrast"
  ```

## Task 2: Tighten AuthLayout Grid and Spacing

**Files to modify:** `src/components/auth/AuthLayout.tsx`
- Add a container wrapper with `max-w-6xl mx-auto` to center content.
- Use `grid lg:grid-cols-2 gap-8` instead of hard‑coded flex.
- Add vertical padding `py-12` on mobile and `py-20` on desktop.
- Ensure right panel (form) gets `p-8` and is scrollable on small viewports.
- Remove legacy `overflow-hidden` on the container.

- [ ] **Step 1: Write minimal test**
  ```js
  import { render } from '@testing-library/react';
  import AuthLayout from '../src/components/auth/AuthLayout';
  test('AuthLayout renders two columns on large screens', () => {
    const { container } = render(<AuthLayout><div></div></AuthLayout>);
    const grid = container.querySelector('.auth-split');
    expect(getComputedStyle(grid).gridTemplateColumns).toBe('0.9fr 1.1fr');
  });
  ```

- [ ] **Step 2: Run test, expect fail**
- [ ] **Step 3: Implement layout changes**
  ```tsx
  // src/components/auth/AuthLayout.tsx
  import React from 'react';
  type Props = { children: React.ReactNode };
  export default function AuthLayout({ children }: Props) {
    return (
      <div className="min-h-screen bg-brand-primary flex items-center justify-center py-12 lg:py-20">
        <div className="max-w-6xl w-full mx-auto grid lg:grid-cols-2 gap-8">
          <div className="flex flex-col justify-center items-start p-8 text-left dark:text-white">
            {/* Existing branding panel goes here */}
          </div>
          <div className="flex flex-col justify-center items-center p-8 overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    );
  }
  ```

- [ ] **Step 4: Run test, confirm PASS**
- [ ] **Step 5: Commit**
  ```bash
  git add src/components/auth/AuthLayout.tsx
  git commit -m "feat: refactor AuthLayout for responsive grid styling"
  ```

## Task 3: Improve Input Styling for Auth Forms

**Files to modify:** `src/components/ui/input.tsx`
- Use new color variables from globals.
- Ensure `auth` variant uses glassmorphism: `bg-white/80 backdrop-blur-md`.
- Add `text-text-primary` for labels.
- Ensure focus ring uses `--brand-gold`.
- Add `mt-2` spacing between label and input.

- [ ] **Step 1: Write unit test**
  ```js
  import { render } from '@testing-library/react';
  import Input from '../src/components/ui/input';
  test('Auth variant has glassmorphism and correct background', () => {
    const { container } = render(<Input variant="auth" label="Email" />);
    const wrapper = container.querySelector('.auth-input');
    expect(wrapper).toHaveStyle('background: white/80');
    expect(wrapper).toHaveStyle('backdrop-filter: blur(16px)');
  });
  ```

- [ ] **Step 2: Run test, fail**
- [ ] **Step 3: Implement new styles**
  ```tsx
  // src/components/ui/input.tsx
  const Input = ({ label, variant, error, helper, rightElement, inputSize = 'md', ...rest }) => {
    const base = "border rounded-md py-2 px-3 w-full";
    const authVariant = variant === 'auth' ? "bg-white/80 backdrop-blur-md text-text-primary" : "bg-brand-light";
    const size = inputSize === 'lg' ? "text-lg" : "text-md";
    return (
      <div className="mb-4">
        <label className="block text-text-primary font-medium mb-1">{label}</label>
        <div className={`relative ${base} ${authVariant} ${size}`}> 
          <input className="w-full outline-none" {...rest} />
          {rightElement && <span className="absolute inset-y-0 right-0 flex items-center pr-3">{rightElement}</span>}
        </div>
        {error && <p className="text-state-error text-sm mt-1">{error}</p>}
        {helper && <p className="text-text-muted text-xs mt-1">{helper}</p>}
      </div>
    );
  };
  ```

- [ ] **Step 4: Run tests, confirm PASS**
- [ ] **Step 5: Commit**
  ```bash
  git add src/components/ui/input.tsx
  git commit -m "refactor: enhance Input component for auth variant styling"
  ```

## Task 4: Adjust AuthBrandingPanel Sizing and Typography

**Files to modify:** `src/components/auth/AuthBrandingPanel.tsx`
- Increase heading font-size to `text-5xl` on desktop, `text-4xl` on mobile.
- Add bottom margin `mb-6` to call‑to‑action button.
- Add consistent padding `p-8`.
- Replace hard‑coded brand‑gold with `var(--brand-gold)`.

- [ ] **Step 1: Write visual regression test**
  ```js
  import { render } from '@testing-library/react';
  import AuthBrandingPanel from '../src/components/auth/AuthBrandingPanel';
  test('Brand panel displays brand‑gold heading', () => {
    const { container } = render(<AuthBrandingPanel />);
    const heading = container.querySelector('h1');
    const bg = getComputedStyle(heading).color;
    expect(bg).toBe('#c89128');
  });
  ```

- [ ] **Step 2: Run test, fail**
- [ ] **Step 3: Implement style changes**
  ```tsx
  // src/components/auth/AuthBrandingPanel.tsx
  export default function AuthBrandingPanel() {
    return (
      <div className="p-8 text-center flex flex-col justify-between h-full">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-[var(--brand-gold)]">Property Management</h1>
        {/* ...other content... */}
      </div>
    );
  }
  ```

- [ ] **Step 4: Run tests, confirm PASS**
- [ ] **Step 5: Commit**
  ```bash
  git add src/components/auth/AuthBrandingPanel.tsx
  git commit -m "chore: improve branding panel typography and colors"
  ```

## Task 5: Optional—Add Light‑Theme Support for Auth Forms

**Files to modify:** `src/components/auth/AuthLayout.tsx`, `src/components/ui/input.tsx`
- Add `data-theme="light"` attribute and a CSS rule to adapt variables.
- Provide a toggle button (not necessary for this plan, but the variable is ready).

- [ ] **Step 1: Write test verifying light theme colors**
  ```js
  test('Auth inputs on light theme use brand-gold borders', () => {
    const { container } = render(<Input variant="auth" data-theme="light" />);
    const input = container.querySelector('input');
    const borderColor = getComputedStyle(input).borderColor;
    expect(borderColor).toBe('rgb(200, 144, 40)'); // brand-gold
  });
  ```

- [ ] **Step 2: Run test, fail**
- [ ] **Step 3: Implement light theme styles**
  ```tsx
  // Inside Input component (above), add:
  const lightTheme = rest['data-theme'] === 'light' ? 'border-[var(--brand-gold)]' : '';
  ```

- [ ] **Step 4: Run tests, confirm PASS**
- [ ] **Step 5: Commit**
  ```bash
  git add src/components/auth/AuthLayout.tsx src/components/ui/input.tsx
  git commit -m "feat: add light‑theme support for auth UI"
  ```

---

**Verification:**
- After each commit, run `npm run lint && npm test` to ensure no test passes fail.
- Visually confirm: navigate to `/login` and `/register`, ensure grids align, colors contrast, typography scales, and glassmorphism is visible.

**Cleanup:**
- Remove any deprecated test helpers that were only needed for this plan.
- Ensure `docs/superpowers/plans/2026-04-22-login-register-design.md` is readable and formatted.

*End of plan.*