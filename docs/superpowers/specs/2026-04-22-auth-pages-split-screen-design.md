# Auth Pages Redesign — Split-Screen Layout

## Overview

Redesign the login and register pages using a modern split-screen layout that separates branding from the form, providing better visual hierarchy and breathing room.

## Layout Structure

### Desktop (≥1024px)

```
┌─────────────────────────────────────────────────────┐
│                 LEFT (45%)    │     RIGHT (55%)      │
│  ┌─────────────────────────┐  │  ┌───────────────┐  │
│  │  [O] Oweru             │  │  │  Form Area   │  │
│  │  "Your property,       │  │  │             │  │
│  │   professionally       │  │  │  - Inputs   │  │
│  │   managed"            │  │  │  - Button  │  │
│  │                       │  │  │             │  │
│  │  ● Feature 1          │  │  │  Link     │  │
│  │  ● Feature 2          │  │  │             │  │
│  │  ● Feature 3          │  │  └───────────────┘  │
│  └─────────────────────────┘  │                     │
└─────────────────────────────────────────────────────┘
```

### Mobile (<1024px)

- Left panel becomes a compact top strip with logo + tagline
- Form fills the rest of the screen

## Component Specifications

### Left Panel — Branding

**Brand mark**
- 48x48 icon with gradient "O" logo
- "Oweru" in display font, text-4xl

**Tagline**
- "Your property, professionally managed"
- text-lg, text-white/90

**Value propositions (3 items)**
- Icon + short label + description
- Icons: Shield (secure payments), Zap (instant quotes), Home (property management)
- Light amber accent color for icons

**Background**
- Subtle animated gradient: slate-900 → slate-800
- Optional: faint grid pattern overlay

### Right Panel — Form

**Container**
- max-w-[480px] for the form itself
- px-8 py-12 padding on desktop
- Full height, vertically centered

**Login form**
- Heading: "Sign in" (text-2xl, bold)
- Subheading: "Welcome back to your account"
- Email + Password inputs
- Forgot password link (right-aligned)
- Submit button (full width)
- Divider: "or"
- Link: "Don't have an account? Register"

**Register form**
- Heading: "Create account" (text-2xl, bold)
- Subheading: "Join Oweru as a property owner or provider"
- RoleToggle component
- Role description card
- Form fields (OwnerRegisterForm or ProviderRegisterForm)
- Terms/privacy link at bottom
- Link: "Already have an account? Sign in"

## Design Tokens

```css
--auth-left-bg: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
--auth-right-bg: transparent;  /* inherits page bg */
--auth-card-bg: rgba(0, 0, 0, 0.2);
--auth-card-border: rgba(229, 185, 114, 0.2);
--auth-card-blur: blur(24px);
--auth-input-bg: rgba(0, 0, 0, 0.3);
--auth-input-border: rgba(229, 185, 114, 0.2);
--auth-input-focus: #C89128;
--auth-btn-gradient: linear-gradient(90deg, #C89128, #E5B972);
--auth-text-primary: #FFFFFF;
--auth-text-secondary: rgba(229, 185, 114, 0.8);
--auth-text-muted: rgba(229, 185, 114, 0.6);
```

## Files to Modify

1. `src/app/(auth)/login/page.tsx` — restructure to split-screen
2. `src/app/(auth)/register/page.tsx` — restructure to split-screen
3. `src/features/users/components/LoginForm.tsx` — update to remove duplicate header
4. `src/features/users/components/RegisterForm.tsx` — update to remove duplicate header
5. `src/app/globals.css` — add auth layout utilities and animations

## Responsive Breakpoints

- **≥1024px**: Full split-screen (45/55)
- **768–1023px**: Compact split-screen (35/65)
- **<768px**: Stacked, left panel becomes top strip (h-24)

## Implementation Order

1. Create auth layout CSS utilities in globals.css
2. Update login page with new split-screen structure
3. Update register page with new split-screen structure
4. Clean up form components (remove duplicated headings)
5. Add mobile-specific top strip for left panel