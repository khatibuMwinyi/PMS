# Auth Pages Split-Screen Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the centered auth layout with a modern split-screen layout separating branding on the left and the form on the right.

**Architecture:** Create a shared `AuthLayout` wrapper component that handles the split-screen structure responsively. Both login and register pages use this wrapper, passing in their respective form components as children. The form components are simplified to remove duplicate headers.

**Tech Stack:** Next.js App Router, Tailwind CSS, React

---

## File Map

| File | Purpose |
|------|---------|
| `src/components/auth/AuthLayout.tsx` | New — split-screen layout wrapper |
| `src/components/auth/AuthBrandingPanel.tsx` | New — left panel with brand + value props |
| `src/app/globals.css` | Add auth layout utilities |
| `src/app/(auth)/login/page.tsx` | Use AuthLayout wrapper |
| `src/app/(auth)/register/page.tsx` | Use AuthLayout wrapper |
| `src/features/users/components/LoginForm.tsx` | Remove duplicate heading/brand |
| `src/features/users/components/RegisterForm.tsx` | Remove duplicate heading/brand |

---

## Task 1: Add Auth Layout CSS Utilities

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Add auth layout CSS utilities**

Add the following to the end of `globals.css`:

```css
/* ─── Auth Pages Layout ─────────────────────────────── */
.auth-split {
  @apply grid min-h-screen;
  grid-template-columns: 45fr 55fr;
}

@media (min-width: 1024px) {
  .auth-split {
    grid-template-columns: 45fr 55fr;
  }
}

@media (max-width: 1023px) {
  .auth-split {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
  }
}

.auth-panel-left {
  @apply relative hidden lg:flex flex-col justify-center px-10 py-16 overflow-hidden;
  @apply bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A];
}

.auth-panel-right {
  @apply relative flex flex-col items-center justify-center px-6 py-12;
  @apply bg-gradient-to-br from-[#0F172A] via-[#0F172A] to-[#1E293B];
}

@media (max-width: 1023px) {
  .auth-panel-left {
    @apply flex lg:hidden h-32 px-6 py-4;
  }
}

/* ─── Auth Branding Panel ─────────────────────────── */
.auth-brand-logo {
  @apply inline-flex items-center justify-center w-12 h-12;
  @apply bg-gradient-to-br from-[#C89128] to-[#E5B972];
  @apply rounded-xl shadow-xl;
}

.auth-value-prop {
  @apply flex items-start gap-3;
}

.auth-value-prop-icon {
  @apply w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0;
  @apply bg-[#C89128]/20;
}

/* ─── Auth Form Card ─────────────────────────────── */
.auth-form-card {
  @apply w-full max-w-[440px] backdrop-blur-xl;
  @apply bg-black/20 border border-[#E5B972]/20;
  @apply rounded-2xl p-8 shadow-2xl;
}

/* ─── Animations ────────────────────────────────── */
@keyframes fade-in-down {
  from {
    opacity: 0;
    transform: translateY(-12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-down {
  animation: fade-in-down 0.5s ease-out forwards;
}

.animate-slide-up {
  animation: slide-up 0.4s ease-out forwards;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/globals.css
git commit -m "feat(auth): add split-screen layout utilities"
```

---

## Task 2: Create AuthBrandingPanel Component

**Files:**
- Create: `src/components/auth/AuthBrandingPanel.tsx`

- [ ] **Step 1: Write AuthBrandingPanel component**

```tsx
'use client';

import { Shield, Zap, Home, Building2 } from 'lucide-react';

interface AuthBrandingPanelProps {
  title?: string;
  tagline?: string;
  features?: Array<{
    icon: React.ReactNode;
    label: string;
    description: string;
  }>;
}

const DEFAULT_FEATURES = [
  {
    icon: <Home size={18} className="text-[#E5B972]" />,
    label: 'Property Management',
    description: 'Professional services for your property, tracked in real-time',
  },
  {
    icon: <Zap size={18} className="text-[#E5B972]" />,
    label: 'Instant Quotes',
    description: 'Get price estimates within seconds, no back-and-forth',
  },
  {
    icon: <Shield size={18} className="text-[#E5B972]" />,
    label: 'Secure Payments',
    description: 'Pay safely via mobile money with full protection',
  },
  {
    icon: <Building2 size={18} className="text-[#E5B972]" />,
    label: 'Provider Ratings',
    description: 'Choose from rated, vetted service professionals',
  },
];

export function AuthBrandingPanel({
  title = 'Oweru',
  tagline = 'Your property, professionally managed',
  features = DEFAULT_FEATURES,
}: AuthBrandingPanelProps) {
  return (
    <div className="auth-panel-left">
      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(229, 185, 114, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(229, 185, 114, 0.5) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-sm animate-fade-in-down">
        {/* Brand mark */}
        <div className="flex items-center gap-3 mb-6">
          <div className="auth-brand-logo">
            <span className="text-xl font-bold text-white">O</span>
          </div>
          <span className="text-3xl font-bold text-white tracking-tight font-display">
            {title}
          </span>
        </div>

        {/* Tagline */}
        <p className="text-white/90 text-lg mb-10 leading-relaxed">
          {tagline}
        </p>

        {/* Value propositions */}
        <div className="space-y-5">
          {features.map((feature, i) => (
            <div key={i} className="auth-value-prop animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="auth-value-prop-icon">
                {feature.icon}
              </div>
              <div>
                <p className="text-white font-medium text-sm mb-0.5">{feature.label}</p>
                <p className="text-white/50 text-sm leading-snug">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Decorative gradient orb */}
      <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-[#C89128]/10 blur-3xl pointer-events-none" />
      <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-[#E5B972]/10 blur-3xl pointer-events-none" />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/auth/AuthBrandingPanel.tsx
git commit -m "feat(auth): add AuthBrandingPanel component"
```

---

## Task 3: Create AuthLayout Wrapper Component

**Files:**
- Create: `src/components/auth/AuthLayout.tsx`

- [ ] **Step 1: Write AuthLayout component**

```tsx
import { ReactNode } from 'react';
import { AnimatedBackground } from './AnimatedBackground';
import { GlowOrb } from './GlowOrb';
import { AuthBrandingPanel } from './AuthBrandingPanel';

interface AuthLayoutProps {
  children: ReactNode;
  branding?: {
    title?: string;
    tagline?: string;
  };
}

export function AuthLayout({ children, branding }: AuthLayoutProps) {
  return (
    <div className="auth-split">
      {/* Left Panel — Branding */}
      <AuthBrandingPanel
        title={branding?.title}
        tagline={branding?.tagline}
      />

      {/* Right Panel — Form */}
      <div className="auth-panel-right">
        {/* Animated Background */}
        <AnimatedBackground />

        {/* Floating Glow Orbs */}
        <GlowOrb
          className="absolute top-20 left-10 w-64 h-64 bg-[#C89128]/20 blur-3xl"
          delay={0}
        />
        <GlowOrb
          className="absolute bottom-20 right-10 w-80 h-80 bg-[#E5B972]/15 blur-3xl"
          delay={2}
        />
        <GlowOrb
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#0F172A]/10 blur-3xl"
          delay={4}
        />

        {/* Form Card */}
        <div className="auth-form-card">
          {children}
        </div>

        {/* Footer */}
        <p className="mt-6 text-[#E5B972]/40 text-sm">
          © 2026 Oweru. All rights reserved.
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/auth/AuthLayout.tsx
git commit -m "feat(auth): add AuthLayout wrapper component"
```

---

## Task 4: Update Login Page

**Files:**
- Modify: `src/app/(auth)/login/page.tsx`

- [ ] **Step 1: Replace login page content**

Replace the entire `src/app/(auth)/login/page.tsx` file content with:

```tsx
import { Suspense } from 'react';
import type { Metadata } from 'next';
import { LoginForm } from '@/features/users/components/LoginForm';
import { RegistrationSuccessBanner } from './RegistrationSuccessBanner';
import { AuthLayout } from '@/components/auth/AuthLayout';

export const metadata: Metadata = { title: 'Sign In — Oweru' };

export default function LoginPage() {
  return (
    <AuthLayout
      branding={{
        title: 'Oweru',
        tagline: 'Your property, professionally managed',
      }}
    >
      <Suspense fallback={null}>
        <RegistrationSuccessBanner />
      </Suspense>
      <LoginForm />
    </AuthLayout>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/\(auth\)/login/page.tsx
git commit -m "refactor(auth/login): use AuthLayout split-screen"
```

---

## Task 5: Update Register Page

**Files:**
- Modify: `src/app/(auth)/register/page.tsx`

- [ ] **Step 1: Replace register page content**

Replace the entire `src/app/(auth)/register/page.tsx` file content with:

```tsx
import type { Metadata } from 'next';
import { RegisterForm } from '@/features/users/components/RegisterForm';
import { AuthLayout } from '@/components/auth/AuthLayout';

export const metadata: Metadata = { title: 'Create Account — Oweru' };

export default function RegisterPage() {
  return (
    <AuthLayout
      branding={{
        title: 'Oweru',
        tagline: 'Join thousands of property owners and service providers',
      }}
    >
      <RegisterForm />
    </AuthLayout>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/\(auth\)/register/page.tsx
git commit -m "refactor(auth/register): use AuthLayout split-screen"
```

---

## Task 6: Simplify LoginForm Component

**Files:**
- Modify: `src/features/users/components/LoginForm.tsx`

- [ ] **Step 1: Remove duplicate heading and footer from LoginForm**

The form currently has:
- A `<div className="text-center">` heading block (lines 68–75)
- A footer link to register (lines 159–164)

Remove both blocks. The wrapper (`<div className="w-full space-y-6">`) stays, as does the rest of the form fields.

Final outer wrapper should be:
```tsx
<div className="w-full space-y-5">
  {/* Server-level error */}
  {serverError && (...)}
  <form>...</form>
  {/* Divider + link stays but remove the heading block above */}
</div>
```

Key changes:
1. Remove `<div className="text-center">` block containing `Welcome back` heading + subtitle (lines 68–75)
2. Adjust top padding: reduce `space-y-6` to `space-y-5` since heading is gone
3. The footer link to register (lines 159–164) stays — it's needed in-context

- [ ] **Step 2: Commit**

```bash
git add src/features/users/components/LoginForm.tsx
git commit -m "refactor(auth): remove duplicate heading from LoginForm"
```

---

## Task 7: Simplify RegisterForm Component

**Files:**
- Modify: `src/features/users/components/RegisterForm.tsx`

- [ ] **Step 1: Remove duplicate heading and footer from RegisterForm**

The form currently has:
- A `<div className="text-center">` heading block (lines 33–40)
- A footer link to sign in (lines 103–108)

Remove both. Keep the RoleToggle, role description card, animated form swap, and the `div` wrapper.

- [ ] **Step 2: Commit**

```bash
git add src/features/users/components/RegisterForm.tsx
git commit -m "refactor(auth): remove duplicate heading from RegisterForm"
```

---

## Verification

After all tasks, run the app and verify:

```bash
cd F:\OPSMP\PropertManagement && npm run dev
```

Open `/login` and `/register` — check:
1. Left panel shows brand logo, tagline, and 4 value props
2. Right panel shows the form card cleanly
3. Mobile: left panel becomes compact header strip, form below
4. No duplicate headings on either page

---

**Plan complete.** Two execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks
**2. Inline Execution** — Execute tasks in this session using executing-plans

Which approach?