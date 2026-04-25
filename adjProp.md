 Design proposal (based on Approach 3)

  1. Architecture & component hierarchy

  - UI library (src/components/ui/) – Hero, NavBar, Card, Button, Modal, ThemeToggle, DashboardLayout.
  - Design‑token module (src/styles/tokens.css) – CSS custom properties for light/dark palettes, WCAG‑compliant contrast values, spacing, radii.
  - Theme provider (src/context/ThemeContext.tsx) – supplies theme (light | dark) and a toggle function; reads system prefers-color-scheme.
  - Auth wrapper (src/components/AuthGuard.tsx) – role‑aware signIn / signUp helpers, redirects unauthenticated users, stores role in NextAuth JWT.
  - Dashboard routes – separate pages (/owner, /provider, /admin) that import DashboardLayout and render role‑specific widgets.

  2. Hero & primary CTA redesign

  - Hero uses a two‑column grid (Tailwind grid md:grid-cols-2). Left side: headline, sub‑headline, three benefit bullets, primary CTA (Button). Right side: responsive SVG illustration.
  - Primary CTA triggers signIn with a role query param (e.g., /login?role=owner).
  - Secondary CTA (Learn more) is a lower‑weight Button with variant="secondary".

  3. Navigation & role‑aware links

  - NavBar component collapses to a hamburger menu on <768px.
  - Links are generated from a role‑map (const navItems = { owner: [...], provider: [...], admin: [...] }).
  - Logo is an inline SVG (/public/logo.svg) imported via next/image fallback for older browsers.

  4. Color system & dark mode

  - tokens.css defines --brand-primary, --brand-gold, --surface-page, --text-primary, etc., for both light and dark scopes (@media (prefers-color-scheme: dark)).
  - All UI components use these custom properties instead of hard‑coded colors.
  - ThemeToggle component updates a data-theme attribute on <html> and persists the choice in localStorage.

  5. Authentication flow integration

  - Wrap sign‑in buttons with signIn(undefined, { callbackUrl: '/dashboard', role }).
  - Create /api/auth/register endpoint: input validation with zod, password hashing with bcryptjs, user creation via Prisma, role persisted in DB.
  - NextAuth callbacks (jwt, session) are extended to include role.
  - Unauthorized/role‑mismatch accesses show a custom 403 page with a link to request role upgrade.

  6. Dashboard layouts per role

  - DashboardLayout defines a CSS grid with named areas (header, sidebar, main, aside).
  - Each role page imports the layout and renders role‑specific widgets (e.g., “Active properties” for owners, “Upcoming jobs” for providers, “Platform metrics” for admins).
  - Widgets use the new Card component, are lazy‑loaded (next/dynamic) and include skeleton loaders.

  7. Accessibility & performance safeguards

  - All interactive components have full keyboard support, aria-* attributes, and focus rings.
  - Images use <Image> with priority for above‑the‑fold assets, blurDataURL placeholders, and AVIF/WebP formats.
  - Tailwind’s purge removes unused utilities; next build generates CSS splitting.
  - Motion is limited to entrance fades and button press scales; respects prefers-reduced-motion.

  8. Incremental rollout plan

  - Each top‑level feature (Hero, NavBar, Theme, Auth, Dashboard) is wrapped in a React feature flag (process.env.NEXT_PUBLIC_FEATURE_<NAME>).
  - Feature flags are toggled via environment variables or a simple JSON config, allowing us to enable them one at a time after QA.

  ---
  Next steps

  1. Write the design spec to docs/superpowers/specs/2026-04-24-adj‑design.md.
  2. Commit the spec file.
  3. Perform the spec self‑review (placeholders, contradictions, scope).
  4. Ask you to review the spec file.