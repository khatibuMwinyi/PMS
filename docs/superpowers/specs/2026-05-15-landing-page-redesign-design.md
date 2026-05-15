# Landing Page Redesign

**Status:** Approved (brainstorming)
**Date:** 2026-05-15
**Owner:** Junior-Osborn
**Project:** OPSMP (Oweru Property Service Management Platform)
**Depends on:** `2026-05-15-design-system-foundation-design.md` (tokens + primitives)
**Scope:** Full replacement of marketing landing route `/`. Auth pages and dashboards out of scope.

---

## 1. Purpose

The current landing page (`src/app/page.tsx`) reads as a generic property-tech SaaS template: tri-role card grid, vanity stat row, two-tab marketing section, generic 3-service grid. None of it conveys Oweru's actual differentiator — that **Oweru is the sole legal counterparty for property services in Tanzania**, owners never deal with providers, providers never see owners, pricing is locked, payments are mediated. The hero copy ("Simplify Property Operations") could belong to any tool.

The redesign repositions the page for owner conversion: trust + transparency hero, the orchestration model explained in 3 steps, a live quote demo proving the pricing engine, concrete service tiles with starting TZS prices, a trust strip with verifiable claims, a provider recruitment band, and an FAQ that defuses the most common objections (cancellation, payment, vetting).

## 2. Audience + tone

- **Primary:** property owners in Tanzania who own 1-20 units and need recurring services (cleaning, plumbing, electrical, landscaping, security, pool).
- **Secondary:** prospective service providers (lower in the page).
- **Out:** end tenants, staff, administrators (those have direct app paths, no marketing surface).

Tone: editorial premium. Short sentences. Concrete numbers (TZS, 24h price lock, 80% provider share, 48h dispute response). No superlatives, no emoji, no exclamation marks.

## 3. Information architecture

Scroll order:

| # | Section | Component | Anchor |
|---|---|---|---|
| 1 | Nav | `LandingNav` | — |
| 2 | Hero | `HeroEditorial` | `#top` |
| 3 | How it works | `StepRail` | `#how-it-works` |
| 4 | Quote demo | `QuoteDemo` | `#quote` |
| 5 | Service catalog | `ServiceTileGrid` | `#services` |
| 6 | Trust strip | `TrustStrip` | — |
| 7 | Provider recruitment | `ProviderBand` | `#become-provider` |
| 8 | FAQ | `FAQAccordion` | `#faq` |
| 9 | Final CTA | `FinalCta` | — |
| 10 | Footer | `FooterEditorial` | — |

## 4. Section specifications

### 4.1 `LandingNav`

- **Layout:** Sticky top, height 72px desktop / 64px mobile. White surface, 1px hairline bottom border, backdrop-blur fallback for over-image hero.
- **Left:** Logo (existing `/images/logo.jpeg`, 32px tall).
- **Center (desktop only):** Anchor links — Services, How it works, Pricing, Become a provider. Spacing `--space-8`. Hover: gold underline animates in (200ms).
- **Right:** "Sign in" (`Button variant="ghost"`), "Get a quote" (`Button variant="gold"`).
- **Mobile:** Logo left, hamburger right. Drawer slides from right, full-height, links stacked, two buttons at bottom.

### 4.2 `HeroEditorial`

- **Layout:** Two-column grid desktop (60/40 text/image), single column mobile (text first, image below). Container `--container-editorial`. Vertical padding `--space-24` desktop, `--space-16` mobile.
- **Left column:**
  - Eyebrow: `caption` style, gold dot + text — "Tanzania's managed property service".
  - Headline: `display` (Fraunces), two lines: "Property services," / "fully managed by Oweru." The word "managed" highlighted in gold.
  - Subhead: `body-lg`, max 520px width — "One contract. One invoice. One team accountable for every service across every property."
  - CTA row: `Button variant="gold" size="lg"` "Get a quote" + `Button variant="ghost" size="lg"` "See how it works".
  - Proof row: three pill chips with leading icon — "24-hour price lock" (lock icon), "Verified providers only" (shield icon), "Pay via mobile money" (smartphone icon).
- **Right column:** Framed photo (aspect 4/5, max 480px wide) inside a `--radius-2xl` rounded container with `--shadow-bold`. Photo: real Tanzanian residential property exterior, daytime, no people. (Asset to source — placeholder until then.)
- **Background:** `--surface-page`. No hero overlay. No background image.
- **Mobile adaptation:** Headline drops to mobile `display` (44/52). Photo sits below text, 16/9 aspect. CTAs stack full-width.

### 4.3 `StepRail` (How it works)

- **Layout:** Single row of 3 steps desktop, vertical stack mobile. Container `--container-editorial`. Section padding `--space-24`.
- **Section header:** Eyebrow "How it works", h1 "Three steps from request to service."
- **Step card (each):**
  - Numeric prefix (01 / 02 / 03) in `display` size, gold, low opacity (0.2) as visual rhythm.
  - Icon (lucide: `FileText` / `UsersRound` / `CircleCheck`), 32px, gold.
  - Title (h3): "Get an instant quote." / "We assign a verified provider." / "Service delivered. You're billed only by Oweru."
  - Body (`body`, max 280px): one sentence each.
- **Connector (desktop):** Thin gold dashed line between cards, mid-height.

### 4.4 `QuoteDemo`

- **Purpose:** Demonstrate the rule-based pricing engine without requiring sign-in. Read-only — does not persist or submit.
- **Layout:** Two-column desktop (form left, price card right), stacked mobile. Surface: `Card variant="elevated" padding="spacious"`. Container `--container-editorial`.
- **Form fields (left):**
  - Service category — select with 6 options (Cleaning, Plumbing, Electrical, Landscaping, Security, Pool).
  - Number of units — number input, min 1, max 50.
  - Frequency — segmented control: Weekly / Bi-weekly / Monthly.
  - Region — select (Dar es Salaam, Arusha, Mwanza, Zanzibar, Other). Optional, defaults to Dar.
- **Price card (right):**
  - Caption "Estimated monthly cost"
  - `Stat size="lg"` value (TZS), tabular numerics.
  - Helper line: "Locked for 24 hours after submission."
  - `Button variant="gold"` "Continue with this quote" → routes to `/register?intent=quote`.
- **Data source:** Static client-side calculation using a `pricingRules.demo.ts` table that mirrors the structure of the production engine. Marked clearly as "estimate". Real pricing happens after sign-in via the production engine.
- **Empty state:** Until a service is picked, the right card shows "Pick a service to see your price."

### 4.5 `ServiceTileGrid`

- **Layout:** 3-column desktop / 2-column tablet / 1-column mobile. Container `--container-editorial`. Section padding `--space-20`.
- **Section header:** Eyebrow "What we manage", h1 "Six service categories. One platform."
- **Tile (`ServiceTile`):**
  - Card variant `outlined`, padding `comfortable`, interactive.
  - Lucide icon (32px, gold) top-left.
  - h3 title.
  - `body-sm` description (one line).
  - Footer: `caption` "Starting from" + `data` price "X TZS / unit / month".
- **Six tiles:** Cleaning (Sparkles), Plumbing (Wrench), Electrical (Zap), Landscaping (Trees), Security (ShieldCheck), Pool (Waves).
- **Hover:** card lifts 2px, border shifts to gold.

### 4.6 `TrustStrip`

- **Layout:** Full-width band with dark navy background (`--surface-dark`), white text. Four columns desktop, 2x2 mobile. Section padding `--space-16`.
- **Items (each is a `Stat` in dark variant):**
  - Verified providers: "200+" / "Background-checked, ID-verified".
  - Data security: "AES-256" / "PII encrypted at rest".
  - Payments: "Selcom-backed" / "Mobile money + cards".
  - Disputes: "48h" / "Average resolution time".
- Numbers in gold, labels in white, body in `--text-on-dark` muted.

### 4.7 `ProviderBand` (recruitment)

- **Layout:** Two-column desktop (text left, illustration / large number right), stacked mobile. Background: gradient from `--surface-dark` to `--brand-primary-light`. Container `--container-editorial`. Section padding `--space-20`.
- **Left:**
  - Eyebrow "For service providers", in gold.
  - h1 in white: "Earn 80% per job. Keep your schedule yours."
  - `body-lg` in `--text-on-dark`: "Oweru sends you verified work orders. You accept the ones that fit. We handle billing, disputes, and owner communication."
  - `Button variant="gold" size="lg"` "Apply to join" → `/register?role=provider`.
- **Right:** Large display number "80%" with caption "of every service fee, paid to providers." Visual: thin gold radial accent behind number.

### 4.8 `FAQAccordion`

- **Layout:** Single column, max 780px width, centered. Container `--container-editorial`. Section padding `--space-20`.
- **Section header:** Eyebrow "FAQ", h1 "Common questions."
- **Pattern:** Native `<details>` element with custom-styled `<summary>` (chevron on right, rotates 90° when open). Smooth height transition via `transition-base`. Border between rows (1px `--border-subtle`).
- **Questions (6):**
  1. How is pricing calculated and locked? (Rule-based engine, 24-hour lock from quote.)
  2. Can I cancel a service? (Free before provider acceptance; 20% penalty after — 15% to provider, 5% platform.)
  3. What if a payment fails? (Up to 3 retry attempts, service suspended after 7 days unpaid.)
  4. How are providers vetted? (ID + KYC verification, performance score, strike system.)
  5. What happens if I'm not satisfied with a service? (24h dispute window, staff reviews within 48h, full or partial refund possible.)
  6. Which regions do you cover? (Dar es Salaam primary, expanding to Arusha / Mwanza / Zanzibar.)

### 4.9 `FinalCta`

- **Layout:** Centered, single column, max 640px width. Background `--surface-page`. Section padding `--space-24`.
- **Content:** h1 "Ready to manage less, own more?" + `body-lg` supporting line + `Button variant="gold" size="lg"` "Get your first quote".

### 4.10 `FooterEditorial`

- **Layout:** Four columns desktop, two columns tablet, single column mobile. Background `--surface-dark`, text `--text-on-dark`. Container `--container-editorial`. Top padding `--space-16`, bottom `--space-8`.
- **Columns:**
  - **Company:** About, How it works, Careers, Press.
  - **Services:** Cleaning, Plumbing, Electrical, Landscaping, Security, Pool.
  - **Legal:** Terms of service, Privacy policy, Refund policy, Cookie policy.
  - **Contact:** Email (`hello@oweru.co.tz`), Phone (+255 …), Address, Business registration number.
- **Bottom row (1px gold-low-opacity top border):** Logo (left, dimmed), copyright "© 2026 Oweru Tanzania Ltd." (center), social icons (right — only platforms actually maintained; if none, omit). Mobile: stacked.

## 5. Mobile breakpoints

- `< 640px` — single column everything, hero photo aspect 16/9, CTAs stack full-width, FAQ accordion preserved.
- `640-1023px` — two-column transitional grids (tiles, footer).
- `≥ 1024px` — full layouts as specified.

Test devices: iPhone SE (375px), iPhone 14 (390px), Pixel 7 (412px), iPad (768px), MacBook 14 (1512px).

## 6. New components inventory

All in `src/components/landing/` (new directory), each its own file:

- `LandingNav.tsx`
- `HeroEditorial.tsx`
- `StepRail.tsx`
- `QuoteDemo.tsx` + `pricingRules.demo.ts` data file
- `ServiceTileGrid.tsx` + `ServiceTile.tsx`
- `TrustStrip.tsx`
- `ProviderBand.tsx`
- `FAQAccordion.tsx`
- `FinalCta.tsx`
- `FooterEditorial.tsx`

Each component imports only from `@/components/ui/*` (primitives from spec #1) + `lucide-react`. No direct hex values, no inline-style colors.

## 7. Components to delete

- `src/components/Hero/Hero.tsx`
- `src/components/Pricing/PricingGrid.tsx` (entire `Pricing/` directory)
- `src/components/Footer/Footer.tsx` (entire `Footer/` directory)
- `src/app/page.option1.tsx`
- `src/app/page.option2.tsx`
- `src/app/page.option3.tsx`
- `src/app/preview.tsx`
- `src/app/preview-simple.tsx`
- `src/app/debug-preview.tsx`

After deletion, `src/app/page.tsx` is fully replaced with a thin composition of the new landing components.

## 8. Routing impact

- `/` — replaced.
- `/register?intent=quote` — new query param consumed by register page; pre-selects "Owner" role and skips first step. (Implementation: register page reads `searchParams.intent`; behavior is additive — no breaking change.)
- `/register?role=provider` — similarly. (Already supported by the form? Verify during plan; if not, add.)
- Section anchors (`#how-it-works`, `#quote`, `#services`, `#become-provider`, `#faq`) — handled with smooth scroll via CSS `scroll-behavior: smooth` on `html`.

## 9. Image + asset list

Required (placeholder until sourced):

- Hero photo: Tanzanian residential property exterior, 4/5 portrait, 1200×1500px minimum, photographed (not stock).
- Six service category icons — use `lucide-react`, no external assets.
- Provider band illustration — none; rely on typography ("80%") only.

Existing assets kept: `/images/logo.jpeg` (logo).

## 10. SEO + metadata

- Page title: "Oweru — Property services, fully managed."
- Meta description: 155 chars: "Tanzania's managed property service. Get instant quotes, verified providers, and one invoice per property. Pay via mobile money."
- Open Graph image: 1200×630px composition of headline + logo (to design).
- Structured data: `Organization` + `Service` JSON-LD blocks (separate task, included in plan).
- `<h1>` exactly once per page (hero).

## 11. Performance budgets

- Largest Contentful Paint < 2.0s on Slow 4G.
- Total page weight < 600KB (excluding hero photo, which loads with `priority` and `sizes`).
- Hero photo: `next/image` with `priority`, AVIF preferred, < 120KB at viewport size.
- Fraunces: font-display swap, preload only the weight used by hero (500).
- No client-side JS for sections 1-3 and 5-10 — they ship as Server Components. Only `QuoteDemo` and `LandingNav` (mobile drawer) are Client Components.

## 12. Accessibility

- All interactive elements reachable by keyboard.
- Focus-visible gold ring via `--shadow-focus` on every focusable element.
- FAQ accordion uses native `<details>` so it works without JS and is screen-reader-native.
- Color contrast: every text/background pair ≥ WCAG AA. Verified for navy/gold-on-dark combos (white text on `--surface-dark` ≥ 12:1).
- Hero photo has a meaningful `alt`. Decorative icons get `aria-hidden`.
- `prefers-reduced-motion` respected on all entrance + hover animations.

## 13. Verification

- Visual review on all listed breakpoints.
- Lighthouse mobile score: Performance ≥ 90, Accessibility = 100, SEO ≥ 95.
- `axe` clean on the page.
- Manual: every CTA reaches the correct route. Anchor scroll works. FAQ opens/closes by keyboard. Quote demo recalculates on every input change.
- Grep: zero hex literals in `src/components/landing/` and `src/app/page.tsx`.

## 14. Content sources (resolve before launch)

The spec defines structure and copy direction. The following data points are content placeholders the plan must either confirm with the business owner or stub with clearly-marked sample values:

- Starting TZS prices per service category (six tiles in `ServiceTileGrid`).
- Verified-provider count for `TrustStrip` (currently spec'd as "200+").
- Average dispute resolution time (currently "48h" — matches the spec but should be confirmed against actual SLA telemetry).
- Phone number, business registration number, physical address in `FooterEditorial`.
- Real hero photo (currently placeholder).

Implementation plan should treat these as a single content-collection step before the page goes to production. Internally, all numbers must live in a `landingContent.ts` constants file (not inline in JSX) to make swap-outs trivial.

## 15. Open questions

None — user approved all decision points during brainstorming.
