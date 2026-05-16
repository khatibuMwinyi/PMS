# Auth Glassmorphism Redesign

**Status:** Approved for implementation
**Date:** 2026-05-16
**Branch:** `feature/auth-glassmorphism`

## Goal

Redesign login + register pages with split-glass layout, property-photo backdrop, and role-first register flow. Preserve all existing auth logic (credentials sign-in, validation, redirects).

## Approved Decisions

| Question | Answer |
|---|---|
| Layout direction | **B** — Split panel: left branding, right glass form |
| Background | **C** — Property photo with dark navy gradient overlay + gold accent glow |
| Register flow | **B** — Role-first choice (Step 1: visual role cards → Step 2: form) |

## Visual Spec

### Layout (desktop ≥1024px)
- 12-col grid; 45% / 55% split
- Left panel: branding content on dark gradient over property photo (text shadow for readability)
- Right panel: glass card vertically centered, max-width 480px

### Mobile (<1024px)
- Single column, full-bleed property photo as section header (top ~30vh)
- Glass form below, padded 16px

### Backdrop (`PropertyBackdrop`)
- `next/image` `fill` placement, `priority` for above-fold
- Source: `/images/auth-backdrop.jpg` (warm interior architecture)
- Overlay: `linear-gradient(135deg, rgba(13,18,38,0.85), rgba(19,27,46,0.78))`
- Accent: single gold radial glow top-left (30% 40%, rgba(240,165,0,0.18))
- Fixed positioning, `inset-0`, `z-index: -10`

### Glass form (`GlassPanel`)
- `background: rgba(255,255,255,0.08)`
- `backdrop-filter: blur(24px) saturate(180%)`
- `border: 1px solid rgba(255,255,255,0.14)`
- `box-shadow: 0 20px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)`
- `border-radius: 20px`
- Padding: 32px (24px mobile)
- Text on glass: white primary, white/60 secondary, gold (#F0A500) accents
- Inputs inside glass: white text, white/8 bg, white/15 border, focus → gold/40 border + gold/20 ring

### Brand panel (`BrandPanel`)
- Logo image (56×56) + "Oweru" wordmark (Fraunces 36px, gold)
- Tagline (Inter 18px, white/85)
- 3 features (down from 4): Property Management, Instant Quotes, Secure Payments
- Drop: 4th feature (Provider Ratings), 5-star rating row
- Each feature: 40×40 icon badge (white/8 bg) + label (white) + description (white/55)
- Back-to-home link top of panel

### Animation policy
- Mount-only fade+slide (no infinite loops — accessibility + perf)
- Stagger children at 80ms intervals
- Respect `prefers-reduced-motion`
- Drop: pulsing orbs, floating shapes, rotating gradient

## Component Spec

### `PropertyBackdrop.tsx` (server)
```
- next/image fill + priority
- absolute inset-0 -z-10
- gradient overlay div
- gold radial glow div
```

### `GlassPanel.tsx` (server)
```
type Props = { children, className?, padding?: 'comfortable' | 'spacious' }
- div with .glass-panel class + sizing
- forwards className for layout sizing
```

### `BrandPanel.tsx` (client — for back-to-home Link)
```
type Props = { title?, tagline? }
- Back link
- Logo + brand
- Tagline
- 3 features mapped from FEATURES const
```

### `RoleSelectCard.tsx` (client)
```
type Props = { role, title, description, icon, selected, onSelect }
- button element
- icon badge + title + description
- selected state: gold border + gold/12 bg
- aria-pressed
```

### `(auth)/layout.tsx` (server)
```
- PropertyBackdrop (fixed)
- grid: BrandPanel | <main>{children}</main>
- footer: copyright
```

### `RegisterForm.tsx` (wizard)
```
state: step: 'role' | 'form'
Step 1: heading + 2x RoleSelectCard + Continue button (disabled until select)
Step 2: existing OwnerRegisterForm / ProviderRegisterForm + Back button
```

## Files

**Create:**
- `src/components/auth/PropertyBackdrop.tsx`
- `src/components/auth/GlassPanel.tsx`
- `src/components/auth/BrandPanel.tsx`
- `src/components/auth/RoleSelectCard.tsx`
- `src/app/(auth)/layout.tsx`
- `public/images/auth-backdrop.jpg`

**Edit:**
- `src/app/globals.css` (add `.glass-panel`, `.auth-backdrop-overlay`)
- `src/app/(auth)/login/page.tsx`
- `src/app/(auth)/register/page.tsx`
- `src/features/users/components/RegisterForm.tsx`
- `src/features/users/components/LoginForm.tsx`

**Delete:**
- `src/components/auth/AuthLayout.tsx`
- `src/components/auth/AuthBrandingPanel.tsx`
- `src/components/auth/AnimatedBrandingPanel.tsx`
- `src/components/auth/AnimatedFormCard.tsx`
- `src/components/auth/GradientBackground.tsx`
- `src/components/auth/AnimatedBackground.tsx`
- `src/components/auth/AnimatedShape.tsx`
- `src/components/auth/FloatingShapes.tsx`
- `src/components/auth/GlowOrb.tsx`

## Out of Scope
- Forgot-password page (separate redesign)
- Auth API / NextAuth config changes
- OwnerRegisterForm / ProviderRegisterForm field changes (style updates only)
- Password reset flow

## Acceptance
- Login: glass form on photo backdrop, all existing fields + validation work, redirects unchanged
- Register Step 1: role cards visible, Continue disabled until selection
- Register Step 2: matches selected role's form, Back returns to Step 1
- Mobile: stacks correctly, photo as header, form full-width
- Existing test suite passes (no regressions outside auth pages)
- `prefers-reduced-motion: reduce` disables animations
