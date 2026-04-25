Copilot said: I reviewed the landing page (src/app/page.tsx), RootLayout
I reviewed the landing page (src/app/page.tsx), RootLayout (src/app/layout.tsx), globals.css, server-side proxy (src/proxy.ts), and component structure (Hero, PricingGrid, Footer, RoleGuard). Below are well-structured, actionable prompts (>= 10) — each includes goal, rationale, implementation notes, and acceptance criteria so a designer/developer can pick them up and implement or hand to an engineer.

Hero: Make the hero immediately scannable and action-focused
Goal: Increase conversion by clarifying value and placing primary CTA above the fold.
Rationale: Current hero is attractive but has multiple CTAs and a lot of motion; users should see a clear offer + single primary CTA on load.
Implementation notes:
Use a two-column layout on desktop: left = headline, subhead, bullet benefits (3 short lines), primary CTA; right = illustrative image or device mockup.
Reduce initial animation complexity; keep subtle entrance (opacity + y).
Ensure primary CTA is visible without scrolling on common breakpoints (>= 768px width).
Provide secondary CTA (Learn more) with lower visual weight.
Acceptance criteria:
Headline (H1) + 2-line subhead visible in first viewport on 1366×768 and 375×812.
Primary CTA has color contrast >= 4.5:1 vs background and a visible focus ring.
Analytics event fires when CTA clicked (e.g., track('landing_cta_click', {role})).
Navigation: Make nav lighter, more purposeful, and role-aware
Goal: Improve clarity and reduce cognitive load on entry.
Rationale: Current nav is fixed and reasonably styled but shows marketing links and Sign In that could be role-aware.
Implementation notes:
Collapse primary links into a “Product” dropdown on mobile; show compact links on desktop.
Sign In button should open the auth flow with role-specific param (see prompt #7).
Replace image logo JPEG with an SVG logo (crisp on all screens). Use next/image for raster fallback.
Acceptance criteria:
Mobile nav uses an accessible hamburger with aria-expanded and keyboard support.
Logo is an inline SVG (or served as /images/logo.svg) and used as favicon and apple-touch-icon.
Color system: Formalize tokens and apply WCAG contrast rules for light/dark
Goal: Make color usage consistent and accessible in both light and dark.
Rationale: globals.css has tokens — extend them to full palette and role-aware semantic scales.
Implementation notes:
Define token sets per theme: primary, surface, text, accent, success, warning, error, neutral-100..900.
Provide accessible mapping: text-primary must be >= 4.5:1 on surface-page; secondary >= 3:1.
For dark mode, increase text contrast and soften brand-gold (use a slightly desaturated gold for dark surfaces).
Example token suggestions:
Light: --brand-primary: #0F172A, --brand-gold: #C89128, --surface-page: #F8F8F9, --text-primary: #0F172A
Dark: --brand-primary: #E6E3DD (keep brand gold darker: #B07E1F or #A36D16), --surface-page: #0B0B0E, --text-primary: #F1EFE8
Acceptance criteria:
All text over background meets WCAG AA for normal text (4.5:1).
Implement a toggle for dark/light in the layout for testing (respect prefers-color-scheme by default).
Partner / Trust logos & icons: standardized presentation and interaction
Goal: Improve credibility by displaying partner logos consistently and accessibly.
Rationale: Company logos vary; inconsistent sizing harms trust.
Implementation notes:
Use grayscale SVGs for logos, center-aligned, equal height (e.g., 32–48px) with equal spacing.
On hover: gently reveal brand color or apply tint (transition 150ms).
Provide accessible alt text and link to partner site (where applicable).
For unknown partners, use a neutral placeholder SVG (outline).
Acceptance criteria:
All partner logos are SVG, uniform height, and have alt text.
Keyboard users can tab to partner logos and see focus styles.
Icon use & semantics: meaningful icons in the features, stats, and partner areas
Goal: Ensure icons enhance comprehension and do not distract.
Rationale: Icons should be informative, not decorative.
Implementation notes:
Use icon set (lucide-react) consistently with the same stroke width and size scale (16/20/24).
In features lists, add an icon for each feature with aria-hidden if decorative; if conveying meaning, add aria-label.
For partner section, prefer logos rather than icons; use icons only for generic categories (e.g., payments, verification).
Acceptance criteria:
All icons that convey meaning include accessible naming; decorative icons set aria-hidden="true".
Icon sizes are consistent across components.
Hero and section imagery: use curated images and performance best practices
Goal: Improve storytelling with relevant images while preserving performance.
Rationale: Images help users relate (owners vs providers) but large rasters slow load.
Implementation notes:
Use Next.js <Image> with appropriate sizes and placeholders (blurDataURL).
Use vector illustrations / SVG hero for fast rendering and consistent branding; fallback JPEG/AVIF for photographs.
Lazy-load off-screen images; preload hero and logo.
Acceptance criteria:
Largest above-the-fold image < 200KB compressed (webp/avif).
Next/Image used with width/height or layout fill and priority for hero.
Integrate login/signup CTAs with backend (auth + role)
Goal: Make Sign In / Sign Up call the backend auth flow with role context.
Rationale: Buttons currently route to /login; wire up NextAuth and registration for role selection.
Implementation notes:
For sign-in, call NextAuth client signIn with role param or set query param to /login?role=owner.
Example:
import { signIn } from 'next-auth/react'
const handleSignIn = (role) => signIn(undefined, { callbackUrl: \/dashboard?role=${role}`, role })`
For signup, implement /api/auth/register endpoint: validate payload with zod, hash password with bcryptjs, create user via Prisma, return success; then redirect to login with message.
On server, adapt next-auth callback to include role in JWT session (already getToken used). Ensure NEXTAUTH_SECRET is set and consistent.
Use friendly UX: if user clicks “Get started as Provider”, pre-select role in signup form.
Acceptance criteria:
Clicking Sign In triggers next-auth signIn (no dead link) and redirects to dashboard if already authenticated.
Signup POST endpoint returns 201 and user is created in DB; success toast shown and redirect to /login.
Role pre-selection persists via query string and is reflected in form.
Hero CTA UX: convert role cards into progressive sign-up flow
Goal: Reduce friction by starting role-tailored onboarding immediately.
Rationale: Clicking the Owner/Provider/Admin card should preselect role and take users to a short registration modal/flow.
Implementation notes:
Clicking a role card opens a lightweight modal / drawer with 2 steps: (1) Basic info (name, email, phone), (2) Password + optional business info. Use client-side validation with zod.
Optional: social sign-in options (Google) via next-auth providers.
After form submit, POST to /api/auth/register?role=provider and on success redirect to /login?registered=true.
Acceptance criteria:
Modal is keyboard accessible and dismissible.
Role variable flows into backend request and database role column.
Cards & images across user pages: card-first design system
Goal: Standardize cards for Owner, Provider, and Admin pages to improve scan and hierarchy.
Rationale: Cards provide digestible units for properties, providers, and transactions.
Implementation notes:
Create a base Card component (props: image, title, subtitle, badges, actions). Use CSS tokens for padding, radius, and shadow.
Owner pages: property cards with main property image, location, rent, status, actions (view/edit/collect rent). Use a 2-up grid on tablet, 3-up on desktop.
Provider pages: portfolio/service cards with profile image, rating, service categories, sample images carousel (use lightweight carousel or thumbnails).
Admin pages: KPI cards and data tables; KPI cards display metric, delta, sparkline.
Use skeleton loaders for async lists; infinite-scroll or cursor-based pagination for large lists.
Acceptance criteria:
Card component documented in components/ui and used by all user pages.
Desktop layout shows 3 cards per row at >= 1200px and stacks to 1 on mobile.
Property cards include alt text, image optimization, and click target over entire card.
Dashboard layout & information hierarchy per user role
Goal: Tailor dashboards so each role sees relevant data first.
Rationale: Owners, Providers, and Admins have different priorities.
Implementation notes:
Owner dashboard: quick status cards (active properties, outstanding rent, maintenance tickets), recent transactions, next actions, and shortcuts (create listing, view tenants).
Provider dashboard: upcoming jobs, verified status, earnings summary, portfolio gallery, messages.
Admin dashboard: platform metrics, pending verifications, system health, user management shortcuts.
Implement a responsive grid (CSS grid with named areas) and consistent spacing.
Acceptance criteria:
Each role’s dashboard is a single route (/owner, /provider, /admin) guarded by server proxy (src/proxy.ts) and client RoleGuard.
Each dashboard loads with content above the fold and lazy-loads lower-priority widgets.
RoleGuard & server access control: improve UX for unauthorized access
Goal: Provide contextual messages and redirect flow for unauthenticated and unauthorized users.
Rationale: Redirecting to /login removes context; better to show messaging and suggested actions.
Implementation notes:
If unauthenticated, redirect to /login?redirect=/owner or open modal with message: “Sign in to continue to Owner dashboard”.
If unauthorized role, show 403 page with explanation and contact/support link (or an option to request role upgrade).
Keep server-side redirect but append ?from=/path to preserve user intent.
Acceptance criteria:
Unauthorized accesses show appropriate messaging and an option to sign in (not just silent redirect).
Audit logs capture attempted unauthorized access (analytics or server log).
Microcopy, trust & social proof improvements
Goal: Build trust quickly with social proof and clear guarantees.
Rationale: Visitors trust platforms with testimonials, partner logos, and security cues.
Implementation notes:
Add 3–4 short testimonials (name, role, avatar, quote) near the CTA.
Add a “Verified providers” badge and “Secure payments” microcopy with small icons.
Add privacy & compliance links in footer. Provide short security callout near signup (e.g., “Banks-grade encryption”).
Acceptance criteria:
Testimonials rotate or show a CTA to view more; each testimonial has an accessible avatar alt text.
Performance & critical rendering path
Goal: Ensure fast time-to-interactive and good Core Web Vitals.
Rationale: Landing page needs to be fast for SEO and conversion.
Implementation notes:
Preload hero-critical fonts or use system fonts for initial render; keep Google font as optional with swap (already set).
Use next/image with AVIF/WebP and responsive srcsets. Optimize icons as inline SVGs.
Remove unused Tailwind utilities at build (purge) and enable CSS splitting.
Audit third-party scripts and lazy-load analytics.
Acceptance criteria:
LCP under 2.5s on mobile 4G.
Lighthouse performance score >= 80 on desktop.
Accessibility sweep & keyboard nav
Goal: Ensure A11Y conformance for landing and user pages.
Rationale: Accessibility is required for inclusivity and often increases conversion.
Implementation notes:
Test all interactive components with keyboard navigation and screen reader.
Ensure aria-label, role, and aria-expanded are applied where necessary.
Contrast checks, focus states, semantic headings order (H1 first).
Acceptance criteria:
No critical violations from axe-core for landing and dashboard pages.
All forms usable with screen readers.
Visual refinement: motion, hierarchy, and micro-interactions
Goal: Use motion to support comprehension, not distract.
Rationale: Framer Motion is used heavily—keep it purposeful.
Implementation notes:
Use motion for entrance, not for important information delivery; reduce simultaneous movements.
Add hover elevation for interactive cards; animate CTA press with scale (0.95).
Add subtle micro-interactions for form validation and success (toast + small confetti animation).
Acceptance criteria:
Motion respects prefers-reduced-motion.
No more than 2 major animations on a single viewport at once.
Design tokens & component library: consolidate and document
Goal: Make the design system reusable across pages and teams.
Rationale: Reduces inconsistency and speeds up future changes.
Implementation notes:
Move CSS tokens into a single file under src/styles/tokens.css or use a Tailwind plugin mapping tokens to utility classes.
Create README for components used on landing and user pages with examples and props.
Add Storybook or simple component gallery page for visual QA.
Acceptance criteria:
Tokens file exists and is imported in layout.
Card, Button, and Modal components have documented props and usage examples.