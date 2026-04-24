---
name: adj-design
description: Design specification for implementing all recommendations from adj.md
type: project
---

# Design Specification: adj.md Recommendations Implementation

**Date:** 2026-04-24

## Overview
This document outlines the design for implementing the full set of UI/UX and architecture recommendations listed in `adj.md`. The implementation follows **Approach 3 – Component Library First** with feature‑flag gating for safe incremental rollout.

---
### 1. Architecture & Component Hierarchy
- **UI library (`src/components/ui/`)** containing reusable components: `Hero`, `NavBar`, `Card`, `Button`, `Modal`, `ThemeToggle`, `DashboardLayout`.
- **Design‑token module (`src/styles/tokens.css`)** defining CSS custom properties for light/dark palettes and WCAG‑AA contrast compliant colors.
- **Theme provider (`src/context/ThemeContext.tsx`)** exposing `theme` state and a toggle function; respects `prefers-color-scheme`.
- **Auth wrapper (`src/components/AuthGuard.tsx`)** handling role‑aware sign‑in/sign‑up flow, redirects, and JWT role propagation.
- **Dashboard routes** (`/owner`, `/provider`, `/admin`) each import `DashboardLayout` and render role‑specific widgets.

---
### 2. Hero & Primary CTA Redesign
- Two‑column grid (`md:grid-cols-2`).
- **Left column:** H1 headline, two‑line sub‑headline, three benefit bullet points, primary CTA `Button` (calls `signIn` with role param), secondary CTA `Learn more`.
- **Right column:** responsive SVG illustration (`public/hero-illustration.svg`).
- Animations limited to entrance fade (`motion.div` with prefers‑reduced‑motion check).

---
### 3. Navigation & Role‑Aware Links
- `NavBar` collapses to a hamburger menu on screens < 768 px.
- Links generated from a role‑map object; only relevant links appear per user role.
- Logo replaced with an inline SVG (`public/logo.svg`) imported via `next/image` fallback.
- Accessible hamburger button (`aria-expanded`, keyboard navigation).

---
### 4. Color System & Dark Mode
- `tokens.css` defines tokens for both light and dark schemes (e.g., `--brand-primary`, `--brand-gold`, `--surface-page`, `--text-primary`).
- All components use these tokens via `var(--token-name)`.
- `ThemeToggle` component updates a `data-theme` attribute on `<html>` and persists choice in `localStorage`.
- Contrast ratios validated to meet WCAG‑AA (≥ 4.5:1 for normal text, ≥ 3:1 for large text).

---
### 5. Authentication Flow Integration
- Sign‑in buttons call `signIn(undefined, { callbackUrl: '/dashboard', role })`.
- New API route `POST /api/auth/register`:
  - Input validation with **zod**.
  - Password hashing with **bcryptjs**.
  - User creation via **Prisma**, persisting the `role` field.
  - Returns `201` and redirects to `/login?registered=true`.
- NextAuth callbacks (`jwt`, `session`) extended to include `role`.
- Unauthorized access shows a custom **403 page** with a role‑upgrade link and audit‑log capture.

---
### 6. Dashboard Layouts per Role
- `DashboardLayout` defines a CSS grid with named areas (`header`, `sidebar`, `main`, `aside`).
- **Owner dashboard:** active properties, outstanding rent, recent transactions, shortcuts.
- **Provider dashboard:** upcoming jobs, earnings summary, portfolio gallery.
- **Admin dashboard:** platform metrics, pending verifications, system health.
- Widgets built with the `Card` component, lazy‑loaded (`next/dynamic`), and include skeleton loaders.

---
### 7. Accessibility & Performance Safeguards
- Full keyboard support, `aria-*` attributes, focus rings on interactive elements.
- Images use `<Image>` with `priority` for above‑the‑fold assets, `blurDataURL` placeholders, and AVIF/WebP formats.
- Tailwind purge enabled; CSS splitting via Next.js.
- Motion limited to entrance fades and button press scales; respects `prefers-reduced-motion`.
- Automated axe‑core audit integrated into CI; must pass with **no critical violations**.

---
### 8. Incremental Rollout Strategy (Feature Flags)
Each top‑level feature is wrapped in a React feature flag (`process.env.NEXT_PUBLIC_FEATURE_<NAME>`):
- `FEATURE_HERO`
- `FEATURE_NAV`
- `FEATURE_THEME`
- `FEATURE_AUTH`
- `FEATURE_DASHBOARD`
Toggle flags via `.env.local` or a simple JSON config; enable them one‑by‑one after QA.

---
### 9. Acceptance Criteria
1. **Hero** – headline and primary CTA visible in first viewport on 1366×768 and 375×812; CTA contrast ≥ 4.5:1; analytics event fires on click.
2. **Nav** – accessible hamburger on mobile, role‑aware links, inline SVG logo.
3. **Colors** – all text/background combos meet WCAG‑AA; dark‑mode toggle works and persists.
4. **Auth** – sign‑in redirects correctly with role, registration endpoint returns 201, JWT includes role, unauthorized access shows custom 403 page.
5. **Dashboards** – role‑specific routes render correct widgets, lazy‑loaded cards show skeletons, layout responsive (3‑up grid ≥ 1200 px, stacks on mobile).
6. **Performance** – LCP < 2.5 s on 4G mobile, Lighthouse ≥ 80 on desktop, largest above‑the‑fold image < 200 KB.
7. **Accessibility** – no critical axe‑core violations, keyboard navigation works, focus visible, aria labeling correct.
8. **Feature‑Flag safety** – each flag can be toggled without rebuilding the entire app; disabling a flag hides the associated UI.

---
## Next Steps
- Review this spec and confirm any required changes.
- Once approved, the **writing‑plans** skill will be invoked to create a detailed implementation plan.

*Please review the specification file at `docs/superpowers/specs/2026-04-24-adj-design.md` and let me know if anything should be adjusted before we proceed.*