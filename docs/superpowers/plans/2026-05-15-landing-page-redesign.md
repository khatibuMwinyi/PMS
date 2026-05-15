# Landing Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fully replace the marketing landing page at `/` with an editorial-premium, owner-focused experience that positions Oweru as Tanzania's sole legal counterparty for property services. The new page is composed of ten purpose-built section components living in `src/components/landing/`, plus a centralized `landingContent.ts` for swap-out copy and a `pricingRules.demo.ts` table for the in-page quote widget.

**Architecture:** Mostly Server Components (sections 1, 3-9), two Client Components only (`LandingNav` for mobile drawer + scroll state, `QuoteDemo` for the interactive widget). Every visual element is composed from primitives shipped by Plan 1 (`Button`, `Card`, `Stat`, `Input`, `Badge`). No hex literals — all tokens. Content lives in a single TS module so business inputs (TZS prices, phone numbers) can be replaced without touching JSX.

**Tech Stack:** Next.js 16 App Router / TypeScript 5 / Tailwind 3.4 / lucide-react / framer-motion (entrance + reduced-motion-aware) / Vitest + RTL.

**Spec:** `docs/superpowers/specs/2026-05-15-landing-page-redesign-design.md`
**Depends on:** `2026-05-15-design-system-foundation.md` (must be merged before this plan starts)

---

## File Structure

**Create:**
- `src/lib/landingContent.ts` — all copy, prices, FAQ Qs, contact info
- `src/lib/pricingRules.demo.ts` — demo pricing table for the quote widget
- `src/components/landing/LandingNav.tsx`
- `src/components/landing/HeroEditorial.tsx`
- `src/components/landing/StepRail.tsx`
- `src/components/landing/QuoteDemo.tsx` + `QuoteDemo.test.tsx`
- `src/components/landing/ServiceTile.tsx`
- `src/components/landing/ServiceTileGrid.tsx`
- `src/components/landing/TrustStrip.tsx`
- `src/components/landing/ProviderBand.tsx`
- `src/components/landing/FAQAccordion.tsx`
- `src/components/landing/FinalCta.tsx`
- `src/components/landing/FooterEditorial.tsx`
- `src/components/landing/index.ts` (barrel)

**Modify:**
- `src/app/page.tsx` — replaced with thin section composition
- `src/app/layout.tsx` — update metadata (title, description, OG)
- `src/app/globals.css` — add `scroll-behavior: smooth` on `html`

**Delete (after the new page renders correctly):**
- `src/components/Hero/Hero.tsx` (+ empty parent dir)
- `src/components/Pricing/PricingGrid.tsx` (+ empty parent dir)
- `src/components/Footer/Footer.tsx` (+ empty parent dir)
- `src/app/page.option1.tsx`
- `src/app/page.option2.tsx`
- `src/app/page.option3.tsx`
- `src/app/preview.tsx`
- `src/app/preview-simple.tsx`
- `src/app/debug-preview.tsx`
- `src/components/ui/Hero.tsx` (duplicate)

---

## Phase 1 — Content + Data

### Task 1: Create `landingContent.ts` constants

**Files:**
- Create: `src/lib/landingContent.ts`

- [ ] **Step 1: Write the module**

`src/lib/landingContent.ts`:

```ts
export const NAV_LINKS = [
  { label: 'Services',         href: '#services' },
  { label: 'How it works',     href: '#how-it-works' },
  { label: 'Pricing',          href: '#quote' },
  { label: 'Become a provider', href: '#become-provider' },
];

export const HERO = {
  eyebrow: "Tanzania's managed property service",
  headline: ['Property services,', 'fully managed by Oweru.'],
  goldWord: 'managed',
  subhead: 'One contract. One invoice. One team accountable for every service across every property.',
  ctaPrimary: { label: 'Get a quote', href: '/register?intent=quote' },
  ctaSecondary: { label: 'See how it works', href: '#how-it-works' },
  proofPills: [
    { label: '24-hour price lock', icon: 'Lock' as const },
    { label: 'Verified providers only', icon: 'ShieldCheck' as const },
    { label: 'Pay via mobile money', icon: 'Smartphone' as const },
  ],
  imageSrc: '/oweru.jpeg',
  imageAlt: 'Tanzanian residential property exterior',
};

export const STEPS = [
  {
    number: '01',
    title: 'Get an instant quote.',
    body: 'Pick a service and unit count. Pricing is calculated by a rule-based engine and locked for 24 hours.',
    icon: 'FileText' as const,
  },
  {
    number: '02',
    title: 'We assign a verified provider.',
    body: 'Oweru selects the highest-ranked available provider. You never negotiate or coordinate directly.',
    icon: 'UsersRound' as const,
  },
  {
    number: '03',
    title: 'Service delivered. One invoice from Oweru.',
    body: 'Pay Oweru via mobile money. We pay the provider 80% of the fee on completion.',
    icon: 'CircleCheck' as const,
  },
];

export const SERVICE_CATEGORIES = [
  { key: 'cleaning',    name: 'Cleaning',    icon: 'Sparkles' as const,    startsAt: 18000, unit: 'unit / month',
    description: 'Recurring deep clean for residential buildings.' },
  { key: 'plumbing',    name: 'Plumbing',    icon: 'Wrench' as const,      startsAt: 22000, unit: 'visit',
    description: 'Diagnostic, repair, and routine maintenance.' },
  { key: 'electrical',  name: 'Electrical',  icon: 'Zap' as const,         startsAt: 25000, unit: 'visit',
    description: 'Licensed electricians for inspection and repair.' },
  { key: 'landscaping', name: 'Landscaping', icon: 'Trees' as const,       startsAt: 35000, unit: 'property / visit',
    description: 'Lawn, hedges, and exterior grounds maintenance.' },
  { key: 'security',    name: 'Security',    icon: 'ShieldCheck' as const, startsAt: 120000, unit: 'guard / month',
    description: 'Vetted overnight or 24-hour security personnel.' },
  { key: 'pool',        name: 'Pool',        icon: 'Waves' as const,       startsAt: 45000, unit: 'visit',
    description: 'Weekly cleaning, chemical balancing, equipment check.' },
];

export const TRUST_STATS = [
  { label: 'Verified providers',     value: '200+',         caption: 'Background-checked, ID-verified' },
  { label: 'Data security',          value: 'AES-256',      caption: 'PII encrypted at rest' },
  { label: 'Payment processing',     value: 'Selcom',       caption: 'Mobile money + cards' },
  { label: 'Dispute resolution SLA', value: '48h',          caption: 'Average response time' },
];

export const PROVIDER_BAND = {
  eyebrow: 'For service providers',
  headline: 'Earn 80% per job. Keep your schedule yours.',
  body: 'Oweru sends you verified work orders. You accept the ones that fit. We handle billing, disputes, and owner communication.',
  cta: { label: 'Apply to join', href: '/register?role=provider' },
  highlight: { number: '80%', caption: 'of every service fee, paid to providers.' },
};

export const FAQ = [
  {
    q: 'How is pricing calculated and locked?',
    a: 'Prices come from a rule-based engine that factors service type, unit count, frequency, and region. Once a quote is generated, it is locked for 24 hours. Submit within that window and the price is binding.',
  },
  {
    q: 'Can I cancel a service?',
    a: 'Yes. Before a provider has accepted, cancellation is free. After acceptance, a 20% penalty applies (15% compensates the provider, 5% is platform fee).',
  },
  {
    q: 'What happens if a payment fails?',
    a: 'We retry three times. If all fail, the service is paused, you are notified, and the invoice remains open. After seven days unpaid, the service is fully suspended until resolved.',
  },
  {
    q: 'How are providers vetted?',
    a: 'Every provider completes ID + KYC verification, submits service category licenses where applicable, and starts with a baseline performance score. Three strikes within a 30-day window triggers suspension.',
  },
  {
    q: "What if I'm not satisfied with a service?",
    a: 'You have 24 hours to dispute a completed task. Oweru staff reviews evidence within 48 hours. Outcomes range from partial refund to full refund and rework.',
  },
  {
    q: 'Which regions do you cover?',
    a: 'Dar es Salaam is the primary coverage area, with expanding service in Arusha, Mwanza, and Zanzibar. Outside those, we coordinate case-by-case.',
  },
];

export const FINAL_CTA = {
  headline: 'Ready to manage less, own more?',
  body: 'Get your first quote in under a minute. No card required, no contract until you confirm.',
  cta: { label: 'Get your first quote', href: '/register?intent=quote' },
};

export const FOOTER = {
  company: [
    { label: 'About',         href: '/about' },
    { label: 'How it works',  href: '#how-it-works' },
    { label: 'Careers',       href: '/careers' },
    { label: 'Press',         href: '/press' },
  ],
  services: [
    { label: 'Cleaning',     href: '#services' },
    { label: 'Plumbing',     href: '#services' },
    { label: 'Electrical',   href: '#services' },
    { label: 'Landscaping',  href: '#services' },
    { label: 'Security',     href: '#services' },
    { label: 'Pool',         href: '#services' },
  ],
  legal: [
    { label: 'Terms of service', href: '/legal/terms' },
    { label: 'Privacy policy',   href: '/legal/privacy' },
    { label: 'Refund policy',    href: '/legal/refund' },
    { label: 'Cookie policy',    href: '/legal/cookies' },
  ],
  contact: {
    email: 'hello@oweru.co.tz',
    phone: '+255 700 000 000',
    address: 'Dar es Salaam, Tanzania',
    businessRegistration: 'TZ-REG-PENDING',
  },
};
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add src/lib/landingContent.ts
git commit -m "feat(landing): centralize landing copy + prices in landingContent.ts"
```

### Task 2: Create `pricingRules.demo.ts` for `QuoteDemo`

**Files:**
- Create: `src/lib/pricingRules.demo.ts`
- Create: `src/lib/pricingRules.demo.test.ts`

- [ ] **Step 1: Failing test**

`src/lib/pricingRules.demo.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { calculateDemoQuote } from './pricingRules.demo';

describe('calculateDemoQuote', () => {
  it('returns null when service is missing', () => {
    expect(calculateDemoQuote({ service: '', units: 1, frequency: 'weekly', region: 'dar' })).toBeNull();
  });

  it('scales linearly with units', () => {
    const a = calculateDemoQuote({ service: 'cleaning', units: 1, frequency: 'weekly', region: 'dar' })!;
    const b = calculateDemoQuote({ service: 'cleaning', units: 5, frequency: 'weekly', region: 'dar' })!;
    expect(b.amount).toBe(a.amount * 5);
  });

  it('applies frequency multiplier (monthly < weekly)', () => {
    const weekly = calculateDemoQuote({ service: 'cleaning', units: 1, frequency: 'weekly', region: 'dar' })!;
    const monthly = calculateDemoQuote({ service: 'cleaning', units: 1, frequency: 'monthly', region: 'dar' })!;
    expect(monthly.amount).toBeLessThan(weekly.amount);
  });

  it('applies regional factor (Zanzibar > Dar)', () => {
    const dar = calculateDemoQuote({ service: 'cleaning', units: 1, frequency: 'weekly', region: 'dar' })!;
    const zanzibar = calculateDemoQuote({ service: 'cleaning', units: 1, frequency: 'weekly', region: 'zanzibar' })!;
    expect(zanzibar.amount).toBeGreaterThan(dar.amount);
  });

  it('returns TZS currency', () => {
    const q = calculateDemoQuote({ service: 'cleaning', units: 1, frequency: 'weekly', region: 'dar' })!;
    expect(q.currency).toBe('TZS');
  });
});
```

- [ ] **Step 2: Verify fails**

```bash
npm run test:run -- src/lib/pricingRules.demo.test.ts
```
Expected: 5 failures.

- [ ] **Step 3: Implement**

`src/lib/pricingRules.demo.ts`:

```ts
export type Frequency = 'weekly' | 'biweekly' | 'monthly';
export type Region = 'dar' | 'arusha' | 'mwanza' | 'zanzibar' | 'other';

export interface QuoteInput {
  service: string;
  units: number;
  frequency: Frequency;
  region: Region;
}

export interface Quote {
  amount: number;
  currency: 'TZS';
}

const BASE_PRICES: Record<string, number> = {
  cleaning:    18000,
  plumbing:    22000,
  electrical:  25000,
  landscaping: 35000,
  security:    120000,
  pool:        45000,
};

const FREQUENCY_MULTIPLIER: Record<Frequency, number> = {
  weekly:   4,    // 4 visits / month
  biweekly: 2,    // 2 visits / month
  monthly:  1,
};

const REGION_FACTOR: Record<Region, number> = {
  dar:      1.0,
  arusha:   1.05,
  mwanza:   1.08,
  zanzibar: 1.15,
  other:    1.20,
};

export function calculateDemoQuote(input: QuoteInput): Quote | null {
  if (!input.service || !(input.service in BASE_PRICES)) return null;
  if (input.units < 1) return null;

  const base = BASE_PRICES[input.service];
  const amount = Math.round(
    base * input.units * FREQUENCY_MULTIPLIER[input.frequency] * REGION_FACTOR[input.region],
  );

  return { amount, currency: 'TZS' };
}

export function formatTZS(amount: number): string {
  return new Intl.NumberFormat('en-TZ', { maximumFractionDigits: 0 }).format(amount);
}
```

- [ ] **Step 4: Verify passes**

```bash
npm run test:run -- src/lib/pricingRules.demo.test.ts
```
Expected: 5 passes.

- [ ] **Step 5: Commit**

```bash
git add src/lib/pricingRules.demo.ts src/lib/pricingRules.demo.test.ts
git commit -m "feat(landing): demo pricing engine for in-page quote widget"
```

---

## Phase 2 — Section Components

### Task 3: `LandingNav`

**Files:**
- Create: `src/components/landing/LandingNav.tsx`

- [ ] **Step 1: Implement**

`src/components/landing/LandingNav.tsx`:

```tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { NAV_LINKS } from '@/lib/landingContent';
import { cn } from '@/lib/cn';

export function LandingNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 bg-surface-card/90 backdrop-blur-sm transition-shadow duration-base',
        scrolled ? 'shadow-card border-b border-border-subtle' : 'border-b border-transparent',
      )}
    >
      <div className="max-w-editorial mx-auto px-4 lg:px-6 h-16 lg:h-[72px] flex items-center justify-between">
        <Link href="/" aria-label="Oweru home" className="shrink-0">
          <Image src="/images/logo.jpeg" alt="Oweru" width={120} height={32} priority className="h-8 w-auto" />
        </Link>

        <nav className="hidden lg:flex items-center gap-8">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-body text-text-secondary hover:text-text-primary transition-colors relative group"
            >
              {l.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent group-hover:w-full transition-all duration-base" />
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <Button as="a" href="/login" variant="ghost" size="sm">Sign in</Button>
          <Button as="a" href="/register?intent=quote" variant="gold" size="sm">Get a quote</Button>
        </div>

        <button
          type="button"
          aria-label="Open menu"
          aria-expanded={open}
          onClick={() => setOpen(true)}
          className="lg:hidden p-2 rounded-md hover:bg-surface-overlay text-text-primary"
        >
          <Menu size={24} />
        </button>
      </div>

      {open && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-primary/40" onClick={() => setOpen(false)} />
          <aside className="absolute right-0 top-0 bottom-0 w-72 bg-surface-card shadow-bold flex flex-col">
            <div className="h-16 flex items-center justify-between px-4 border-b border-border-subtle">
              <span className="text-h4">Menu</span>
              <button type="button" aria-label="Close menu" onClick={() => setOpen(false)} className="p-2 rounded-md hover:bg-surface-overlay">
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 flex flex-col p-4 gap-2">
              {NAV_LINKS.map((l) => (
                <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="py-3 px-2 text-body text-text-primary hover:bg-surface-overlay rounded-md">
                  {l.label}
                </Link>
              ))}
            </nav>
            <div className="p-4 border-t border-border-subtle flex flex-col gap-2">
              <Button as="a" href="/login" variant="ghost" fullWidth>Sign in</Button>
              <Button as="a" href="/register?intent=quote" variant="gold" fullWidth>Get a quote</Button>
            </div>
          </aside>
        </div>
      )}
    </header>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add src/components/landing/LandingNav.tsx
git commit -m "feat(landing): LandingNav with sticky scroll + mobile drawer"
```

### Task 4: `HeroEditorial`

**Files:**
- Create: `src/components/landing/HeroEditorial.tsx`

- [ ] **Step 1: Implement**

`src/components/landing/HeroEditorial.tsx`:

```tsx
import Image from 'next/image';
import { Lock, ShieldCheck, Smartphone, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { HERO } from '@/lib/landingContent';

const ICONS: Record<string, LucideIcon> = { Lock, ShieldCheck, Smartphone };

export function HeroEditorial() {
  return (
    <section className="pt-24 lg:pt-32 pb-16 lg:pb-24 bg-surface-page">
      <div className="max-w-editorial mx-auto px-4 lg:px-6 grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        <div className="lg:col-span-7 order-2 lg:order-1">
          <div className="flex items-center gap-2 mb-6">
            <span className="w-1.5 h-1.5 rounded-pill bg-accent" />
            <span className="text-caption uppercase text-text-secondary">{HERO.eyebrow}</span>
          </div>

          <h1 className="font-serif text-h1 lg:text-display text-text-primary leading-tight">
            {HERO.headline[0]}{' '}
            <span className="block">
              {HERO.headline[1].split(' ').map((w, i, arr) => (
                <span key={i} className={w.replace(/[.,]/g, '') === HERO.goldWord ? 'text-accent italic' : ''}>
                  {w}{i < arr.length - 1 ? ' ' : ''}
                </span>
              ))}
            </span>
          </h1>

          <p className="mt-6 text-body-lg text-text-secondary max-w-[520px]">
            {HERO.subhead}
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Button as="a" href={HERO.ctaPrimary.href} variant="gold" size="lg" fullWidth={false}>
              {HERO.ctaPrimary.label}
            </Button>
            <Button as="a" href={HERO.ctaSecondary.href} variant="ghost" size="lg" fullWidth={false}>
              {HERO.ctaSecondary.label}
            </Button>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            {HERO.proofPills.map((p) => {
              const I = ICONS[p.icon];
              return (
                <span
                  key={p.label}
                  className="inline-flex items-center gap-2 h-9 px-3 rounded-pill bg-surface-card border border-border-subtle text-body-sm text-text-secondary"
                >
                  <I size={14} className="text-accent" />
                  {p.label}
                </span>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-5 order-1 lg:order-2">
          <div className="relative rounded-2xl overflow-hidden shadow-bold aspect-[4/5] max-w-[480px] mx-auto">
            <Image
              src={HERO.imageSrc}
              alt={HERO.imageAlt}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 480px"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add src/components/landing/HeroEditorial.tsx
git commit -m "feat(landing): HeroEditorial with serif headline + proof pills"
```

### Task 5: `StepRail`

**Files:**
- Create: `src/components/landing/StepRail.tsx`

- [ ] **Step 1: Implement**

`src/components/landing/StepRail.tsx`:

```tsx
import { FileText, UsersRound, CircleCheck, type LucideIcon } from 'lucide-react';
import { STEPS } from '@/lib/landingContent';

const ICONS: Record<string, LucideIcon> = { FileText, UsersRound, CircleCheck };

export function StepRail() {
  return (
    <section id="how-it-works" className="py-20 lg:py-24 bg-surface-card">
      <div className="max-w-editorial mx-auto px-4 lg:px-6">
        <div className="text-center mb-12 lg:mb-16">
          <p className="text-caption uppercase text-accent mb-3">How it works</p>
          <h2 className="font-serif text-h2 lg:text-h1 text-text-primary">Three steps from request to service.</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 relative">
          {STEPS.map((s, idx) => {
            const I = ICONS[s.icon];
            return (
              <div key={s.number} className="relative">
                <span aria-hidden className="absolute -top-2 left-0 font-serif text-display text-accent/20 leading-none select-none">
                  {s.number}
                </span>
                <div className="relative pt-12">
                  <I size={32} className="text-accent mb-4" aria-hidden />
                  <h3 className="text-h3 text-text-primary mb-2">{s.title}</h3>
                  <p className="text-body text-text-secondary max-w-[280px]">{s.body}</p>
                </div>
                {idx < STEPS.length - 1 && (
                  <span
                    aria-hidden
                    className="hidden lg:block absolute top-20 left-full w-12 -ml-6 border-t-2 border-dashed border-accent/30"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add src/components/landing/StepRail.tsx
git commit -m "feat(landing): StepRail with 3-step orchestration explainer"
```

### Task 6: `QuoteDemo`

**Files:**
- Create: `src/components/landing/QuoteDemo.tsx`
- Create: `src/components/landing/QuoteDemo.test.tsx`

- [ ] **Step 1: Failing test**

`src/components/landing/QuoteDemo.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QuoteDemo } from './QuoteDemo';

describe('QuoteDemo', () => {
  it('shows empty state initially', () => {
    render(<QuoteDemo />);
    expect(screen.getByText(/Pick a service/i)).toBeInTheDocument();
  });

  it('computes a price after selecting a service', () => {
    render(<QuoteDemo />);
    fireEvent.change(screen.getByLabelText(/Service/i), { target: { value: 'cleaning' } });
    expect(screen.getByText(/TZS/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Verify fails**

```bash
npm run test:run -- src/components/landing/QuoteDemo.test.tsx
```
Expected: 2 failures.

- [ ] **Step 3: Implement**

`src/components/landing/QuoteDemo.tsx`:

```tsx
'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { SERVICE_CATEGORIES } from '@/lib/landingContent';
import { calculateDemoQuote, formatTZS, type Frequency, type Region } from '@/lib/pricingRules.demo';

export function QuoteDemo() {
  const [service, setService] = useState('');
  const [units, setUnits] = useState(1);
  const [frequency, setFrequency] = useState<Frequency>('monthly');
  const [region, setRegion] = useState<Region>('dar');

  const quote = useMemo(
    () => calculateDemoQuote({ service, units, frequency, region }),
    [service, units, frequency, region],
  );

  return (
    <section id="quote" className="py-20 lg:py-24 bg-surface-page">
      <div className="max-w-editorial mx-auto px-4 lg:px-6">
        <div className="text-center mb-10 lg:mb-12">
          <p className="text-caption uppercase text-accent mb-3">Live pricing</p>
          <h2 className="font-serif text-h2 lg:text-h1 text-text-primary">See what your service would cost.</h2>
          <p className="mt-4 text-body-lg text-text-secondary max-w-2xl mx-auto">
            Estimate only. Real pricing is computed after sign-in and locked for 24 hours.
          </p>
        </div>

        <Card variant="elevated" padding="spacious" className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-5">
              <div>
                <label htmlFor="qd-service" className="block text-label mb-1.5 text-text-primary">Service</label>
                <select
                  id="qd-service"
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className="w-full h-10 px-3 rounded-md bg-surface-card border border-border-default text-body focus:outline-none focus:shadow-focus focus:border-border-focus"
                >
                  <option value="">Select a service</option>
                  {SERVICE_CATEGORIES.map((s) => (
                    <option key={s.key} value={s.key}>{s.name}</option>
                  ))}
                </select>
              </div>

              <Input
                label="Number of units"
                type="number"
                min={1}
                max={50}
                value={units}
                onChange={(e) => setUnits(Math.max(1, Math.min(50, Number(e.target.value) || 1)))}
              />

              <div>
                <span className="block text-label mb-1.5 text-text-primary">Frequency</span>
                <div className="inline-flex p-1 rounded-pill bg-surface-overlay">
                  {(['weekly', 'biweekly', 'monthly'] as Frequency[]).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFrequency(f)}
                      className={
                        'px-4 h-8 rounded-pill text-body-sm font-medium transition-colors ' +
                        (frequency === f ? 'bg-primary text-text-on-brand' : 'text-text-secondary hover:text-text-primary')
                      }
                    >
                      {f === 'biweekly' ? 'Bi-weekly' : f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="qd-region" className="block text-label mb-1.5 text-text-primary">Region</label>
                <select
                  id="qd-region"
                  value={region}
                  onChange={(e) => setRegion(e.target.value as Region)}
                  className="w-full h-10 px-3 rounded-md bg-surface-card border border-border-default text-body focus:outline-none focus:shadow-focus focus:border-border-focus"
                >
                  <option value="dar">Dar es Salaam</option>
                  <option value="arusha">Arusha</option>
                  <option value="mwanza">Mwanza</option>
                  <option value="zanzibar">Zanzibar</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="bg-surface-overlay rounded-lg p-6 flex flex-col justify-between">
              {quote ? (
                <>
                  <div>
                    <p className="text-caption uppercase text-text-muted">Estimated monthly cost</p>
                    <p className="mt-3 font-serif text-h1 text-text-primary tabular-nums">
                      {formatTZS(quote.amount)} <span className="text-h3 text-text-muted font-sans">{quote.currency}</span>
                    </p>
                    <p className="mt-3 text-body-sm text-text-muted">Locked for 24 hours after submission.</p>
                  </div>
                  <Button as="a" href="/register?intent=quote" variant="gold" size="lg" className="mt-6">
                    Continue with this quote
                  </Button>
                </>
              ) : (
                <p className="text-body text-text-muted m-auto text-center">Pick a service to see your price.</p>
              )}
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Verify passes**

```bash
npm run test:run -- src/components/landing/QuoteDemo.test.tsx
```
Expected: 2 passes.

- [ ] **Step 5: Commit**

```bash
git add src/components/landing/QuoteDemo.tsx src/components/landing/QuoteDemo.test.tsx
git commit -m "feat(landing): QuoteDemo interactive widget"
```

### Task 7: `ServiceTile` + `ServiceTileGrid`

**Files:**
- Create: `src/components/landing/ServiceTile.tsx`
- Create: `src/components/landing/ServiceTileGrid.tsx`

- [ ] **Step 1: Implement `ServiceTile`**

`src/components/landing/ServiceTile.tsx`:

```tsx
import {
  Sparkles, Wrench, Zap, Trees, ShieldCheck, Waves,
  type LucideIcon,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { formatTZS } from '@/lib/pricingRules.demo';

const ICONS: Record<string, LucideIcon> = { Sparkles, Wrench, Zap, Trees, ShieldCheck, Waves };

interface ServiceTileProps {
  name: string;
  iconKey: keyof typeof ICONS;
  description: string;
  startsAt: number;
  unit: string;
}

export function ServiceTile({ name, iconKey, description, startsAt, unit }: ServiceTileProps) {
  const I = ICONS[iconKey];
  return (
    <Card variant="outlined" padding="comfortable" interactive className="group hover:border-accent">
      <I size={32} className="text-accent mb-4" aria-hidden />
      <h3 className="text-h3 text-text-primary">{name}</h3>
      <p className="mt-2 text-body-sm text-text-secondary">{description}</p>
      <div className="mt-6 pt-4 border-t border-border-subtle">
        <p className="text-caption uppercase text-text-muted">Starting from</p>
        <p className="font-medium text-body-lg tabular-nums text-text-primary mt-1">
          {formatTZS(startsAt)} TZS <span className="text-body-sm text-text-muted font-normal">/ {unit}</span>
        </p>
      </div>
    </Card>
  );
}
```

- [ ] **Step 2: Implement `ServiceTileGrid`**

`src/components/landing/ServiceTileGrid.tsx`:

```tsx
import { ServiceTile } from './ServiceTile';
import { SERVICE_CATEGORIES } from '@/lib/landingContent';

export function ServiceTileGrid() {
  return (
    <section id="services" className="py-20 bg-surface-card">
      <div className="max-w-editorial mx-auto px-4 lg:px-6">
        <div className="text-center mb-12">
          <p className="text-caption uppercase text-accent mb-3">What we manage</p>
          <h2 className="font-serif text-h2 lg:text-h1 text-text-primary">Six service categories. One platform.</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICE_CATEGORIES.map((s) => (
            <ServiceTile
              key={s.key}
              name={s.name}
              iconKey={s.icon}
              description={s.description}
              startsAt={s.startsAt}
              unit={s.unit}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```
Expected: clean.

- [ ] **Step 4: Commit**

```bash
git add src/components/landing/ServiceTile.tsx src/components/landing/ServiceTileGrid.tsx
git commit -m "feat(landing): ServiceTileGrid with 6 categories + starting prices"
```

### Task 8: `TrustStrip`

**Files:**
- Create: `src/components/landing/TrustStrip.tsx`

- [ ] **Step 1: Implement**

`src/components/landing/TrustStrip.tsx`:

```tsx
import { TRUST_STATS } from '@/lib/landingContent';

export function TrustStrip() {
  return (
    <section className="py-16 bg-surface-dark text-text-on-dark">
      <div className="max-w-editorial mx-auto px-4 lg:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {TRUST_STATS.map((s) => (
            <div key={s.label}>
              <p className="text-caption uppercase text-text-on-dark/60">{s.label}</p>
              <p className="mt-2 font-serif text-h2 lg:text-h1 text-accent tabular-nums">{s.value}</p>
              <p className="mt-1 text-body-sm text-text-on-dark/80">{s.caption}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add src/components/landing/TrustStrip.tsx
git commit -m "feat(landing): TrustStrip dark band with 4 credibility stats"
```

### Task 9: `ProviderBand`

**Files:**
- Create: `src/components/landing/ProviderBand.tsx`

- [ ] **Step 1: Implement**

`src/components/landing/ProviderBand.tsx`:

```tsx
import { Button } from '@/components/ui/Button';
import { PROVIDER_BAND } from '@/lib/landingContent';

export function ProviderBand() {
  return (
    <section
      id="become-provider"
      className="py-20 bg-gradient-to-br from-surface-dark to-primary-light text-text-on-dark"
    >
      <div className="max-w-editorial mx-auto px-4 lg:px-6 grid lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7">
          <p className="text-caption uppercase text-accent mb-3">{PROVIDER_BAND.eyebrow}</p>
          <h2 className="font-serif text-h2 lg:text-h1 text-text-on-dark">{PROVIDER_BAND.headline}</h2>
          <p className="mt-4 text-body-lg text-text-on-dark/80 max-w-[560px]">{PROVIDER_BAND.body}</p>
          <Button as="a" href={PROVIDER_BAND.cta.href} variant="gold" size="lg" className="mt-8">
            {PROVIDER_BAND.cta.label}
          </Button>
        </div>
        <div className="lg:col-span-5 relative">
          <div
            aria-hidden
            className="absolute inset-0 -m-12 rounded-full bg-accent/10 blur-3xl pointer-events-none"
          />
          <div className="relative text-center">
            <p className="font-serif text-display lg:text-[120px] text-accent leading-none tabular-nums">
              {PROVIDER_BAND.highlight.number}
            </p>
            <p className="mt-3 text-body-lg text-text-on-dark/80 max-w-xs mx-auto">
              {PROVIDER_BAND.highlight.caption}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add src/components/landing/ProviderBand.tsx
git commit -m "feat(landing): ProviderBand recruitment section with 80% highlight"
```

### Task 10: `FAQAccordion`

**Files:**
- Create: `src/components/landing/FAQAccordion.tsx`

- [ ] **Step 1: Implement**

`src/components/landing/FAQAccordion.tsx`:

```tsx
import { ChevronDown } from 'lucide-react';
import { FAQ } from '@/lib/landingContent';

export function FAQAccordion() {
  return (
    <section id="faq" className="py-20 bg-surface-card">
      <div className="max-w-[780px] mx-auto px-4 lg:px-6">
        <div className="text-center mb-12">
          <p className="text-caption uppercase text-accent mb-3">FAQ</p>
          <h2 className="font-serif text-h2 lg:text-h1 text-text-primary">Common questions.</h2>
        </div>

        <div className="divide-y divide-border-subtle border-y border-border-subtle">
          {FAQ.map((row) => (
            <details key={row.q} className="group py-5">
              <summary className="flex items-center justify-between cursor-pointer list-none">
                <span className="text-h4 text-text-primary pr-6">{row.q}</span>
                <ChevronDown
                  size={20}
                  className="text-text-muted shrink-0 transition-transform duration-base group-open:rotate-180"
                  aria-hidden
                />
              </summary>
              <p className="mt-3 text-body text-text-secondary">{row.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add src/components/landing/FAQAccordion.tsx
git commit -m "feat(landing): FAQAccordion with native details element"
```

### Task 11: `FinalCta`

**Files:**
- Create: `src/components/landing/FinalCta.tsx`

- [ ] **Step 1: Implement**

`src/components/landing/FinalCta.tsx`:

```tsx
import { Button } from '@/components/ui/Button';
import { FINAL_CTA } from '@/lib/landingContent';

export function FinalCta() {
  return (
    <section className="py-24 bg-surface-page">
      <div className="max-w-[640px] mx-auto px-4 lg:px-6 text-center">
        <h2 className="font-serif text-h2 lg:text-h1 text-text-primary">{FINAL_CTA.headline}</h2>
        <p className="mt-4 text-body-lg text-text-secondary">{FINAL_CTA.body}</p>
        <Button as="a" href={FINAL_CTA.cta.href} variant="gold" size="lg" className="mt-8">
          {FINAL_CTA.cta.label}
        </Button>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add src/components/landing/FinalCta.tsx
git commit -m "feat(landing): FinalCta closing conversion section"
```

### Task 12: `FooterEditorial`

**Files:**
- Create: `src/components/landing/FooterEditorial.tsx`

- [ ] **Step 1: Implement**

`src/components/landing/FooterEditorial.tsx`:

```tsx
import Link from 'next/link';
import Image from 'next/image';
import { FOOTER } from '@/lib/landingContent';

export function FooterEditorial() {
  return (
    <footer className="bg-surface-dark text-text-on-dark">
      <div className="max-w-editorial mx-auto px-4 lg:px-6 pt-16 pb-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          <div>
            <p className="text-caption uppercase text-text-on-dark/60 mb-4">Company</p>
            <ul className="space-y-2">
              {FOOTER.company.map((l) => (
                <li key={l.href}><Link href={l.href} className="text-body-sm text-text-on-dark/80 hover:text-accent">{l.label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-caption uppercase text-text-on-dark/60 mb-4">Services</p>
            <ul className="space-y-2">
              {FOOTER.services.map((l, i) => (
                <li key={i}><Link href={l.href} className="text-body-sm text-text-on-dark/80 hover:text-accent">{l.label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-caption uppercase text-text-on-dark/60 mb-4">Legal</p>
            <ul className="space-y-2">
              {FOOTER.legal.map((l) => (
                <li key={l.href}><Link href={l.href} className="text-body-sm text-text-on-dark/80 hover:text-accent">{l.label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-caption uppercase text-text-on-dark/60 mb-4">Contact</p>
            <ul className="space-y-2 text-body-sm text-text-on-dark/80">
              <li><a href={`mailto:${FOOTER.contact.email}`} className="hover:text-accent">{FOOTER.contact.email}</a></li>
              <li>{FOOTER.contact.phone}</li>
              <li>{FOOTER.contact.address}</li>
              <li className="text-text-on-dark/60">Reg: {FOOTER.contact.businessRegistration}</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-accent/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Image src="/images/logo.jpeg" alt="Oweru" width={96} height={24} className="h-6 w-auto opacity-70" />
          <p className="text-body-sm text-text-on-dark/60">© 2026 Oweru Tanzania Ltd. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add src/components/landing/FooterEditorial.tsx
git commit -m "feat(landing): FooterEditorial with 4-column nav + compliance row"
```

### Task 13: Barrel export

**Files:**
- Create: `src/components/landing/index.ts`

- [ ] **Step 1: Write barrel**

`src/components/landing/index.ts`:

```ts
export { LandingNav } from './LandingNav';
export { HeroEditorial } from './HeroEditorial';
export { StepRail } from './StepRail';
export { QuoteDemo } from './QuoteDemo';
export { ServiceTile } from './ServiceTile';
export { ServiceTileGrid } from './ServiceTileGrid';
export { TrustStrip } from './TrustStrip';
export { ProviderBand } from './ProviderBand';
export { FAQAccordion } from './FAQAccordion';
export { FinalCta } from './FinalCta';
export { FooterEditorial } from './FooterEditorial';
```

- [ ] **Step 2: Commit**

```bash
git add src/components/landing/index.ts
git commit -m "chore(landing): barrel export for landing sections"
```

---

## Phase 3 — Page Composition + Cleanup

### Task 14: Replace `app/page.tsx`

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Replace page content**

`src/app/page.tsx`:

```tsx
import {
  LandingNav,
  HeroEditorial,
  StepRail,
  QuoteDemo,
  ServiceTileGrid,
  TrustStrip,
  ProviderBand,
  FAQAccordion,
  FinalCta,
  FooterEditorial,
} from '@/components/landing';

export default function LandingPage() {
  return (
    <>
      <LandingNav />
      <main id="top">
        <HeroEditorial />
        <StepRail />
        <QuoteDemo />
        <ServiceTileGrid />
        <TrustStrip />
        <ProviderBand />
        <FAQAccordion />
        <FinalCta />
      </main>
      <FooterEditorial />
    </>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```
Expected: clean.

- [ ] **Step 3: Smoke**

```bash
npm run dev
```
Open `http://localhost:3000/`. Expected: every section renders top-to-bottom. Hero uses Fraunces. Quote demo recalculates on input change. Anchor links scroll smoothly (handled in Task 16).

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat(landing): compose new landing page from section components"
```

### Task 15: Update metadata in `layout.tsx`

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Replace metadata block**

Open `src/app/layout.tsx`. Replace the `metadata` export:

```ts
export const metadata: Metadata = {
  title: 'Oweru — Property services, fully managed.',
  description:
    'Tanzania\'s managed property service. Get instant quotes, verified providers, and one invoice per property. Pay via mobile money.',
  icons: {
    icon: '/images/logo.jpeg',
    apple: '/images/logo.jpeg',
  },
  openGraph: {
    title: 'Oweru — Property services, fully managed.',
    description: 'Tanzania\'s managed property service.',
    url: 'https://oweru.co.tz',
    siteName: 'Oweru',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    locale: 'en_TZ',
    type: 'website',
  },
};
```

(Note: `/og-image.png` is a placeholder asset. If absent, the meta tag still renders but the image will 404. A follow-up design task should produce the 1200×630 OG image.)

- [ ] **Step 2: Add structured data**

Inside `<body>`, just after `<SessionProvider>`, add a `<script>` for Organization JSON-LD:

```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Oweru',
      url: 'https://oweru.co.tz',
      logo: 'https://oweru.co.tz/images/logo.jpeg',
      areaServed: { '@type': 'Country', name: 'Tanzania' },
      contactPoint: {
        '@type': 'ContactPoint',
        email: 'hello@oweru.co.tz',
        contactType: 'customer service',
      },
    }),
  }}
/>
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```
Expected: clean. Check generated `<head>` of the page output for the new tags.

- [ ] **Step 4: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat(landing): updated metadata + Organization JSON-LD"
```

### Task 16: Add smooth scroll + anchor offset

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Add CSS**

In `globals.css`, find the `html, body { ... }` block and update the `html` selector portion. Add at the top of the file (after the `@tailwind` directives, before `:root`):

```css
html {
  scroll-behavior: smooth;
  scroll-padding-top: 80px;
}

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
}
```

- [ ] **Step 2: Verify**

```bash
npm run dev
```
Click "See how it works" CTA — page should scroll smoothly to `#how-it-works`, with the section heading visible below the fixed nav (not hidden behind it).

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "feat(landing): smooth scroll + anchor offset for fixed nav"
```

### Task 17: Verify register page handles `?intent=quote` and `?role=provider`

**Files:** `src/app/(auth)/register/page.tsx` (or its component) — modify only if needed.

- [ ] **Step 1: Read current register flow**

```bash
cat src/app/\(auth\)/register/page.tsx
```

Identify: does the page read `searchParams.intent` or `searchParams.role`? If yes and behavior is correct (pre-selects owner / pre-selects provider), no further action — proceed to Step 3. If no, continue to Step 2.

- [ ] **Step 2: Wire query params**

In `register/page.tsx`, read `searchParams` (App Router server component pattern):

```tsx
interface RegisterPageProps {
  searchParams?: { intent?: string; role?: string };
}

export default function RegisterPage({ searchParams }: RegisterPageProps) {
  const initialRole = searchParams?.role === 'provider' ? 'PROVIDER' : 'OWNER';
  const skipRoleStep = searchParams?.intent === 'quote' || searchParams?.role === 'provider';
  // ...pass to RegisterForm
}
```

Pass `initialRole` and `skipRoleStep` to the form component. The form's first step (role pick) is conditionally rendered.

- [ ] **Step 3: Verify**

Open `http://localhost:3000/register?intent=quote` — owner is pre-selected, role-pick step is skipped.
Open `http://localhost:3000/register?role=provider` — provider is pre-selected.

- [ ] **Step 4: Commit (if changes made)**

```bash
git add src/app/\(auth\)/register/
git commit -m "feat(auth): respect ?intent and ?role query params on register"
```

If no change was needed, skip the commit.

### Task 18: Delete legacy components

**Files:** all in the Delete list at the top of this plan.

- [ ] **Step 1: Confirm no remaining imports**

```bash
rg "from '@/components/Hero|from '@/components/Pricing|from '@/components/Footer'" src/
rg "page.option|preview-simple|debug-preview" src/
rg "from '@/components/ui/Hero'" src/
```
Expected: zero matches for the legacy paths. If anything matches, leave the file in place and investigate before deleting.

- [ ] **Step 2: Delete**

```bash
rm -rf src/components/Hero
rm -rf src/components/Pricing
rm -rf src/components/Footer
rm src/app/page.option1.tsx
rm src/app/page.option2.tsx
rm src/app/page.option3.tsx
rm src/app/preview.tsx
rm src/app/preview-simple.tsx
rm src/app/debug-preview.tsx
rm src/components/ui/Hero.tsx
```

- [ ] **Step 3: Verify**

```bash
npm run build
npm run test:run
```
Expected: both clean.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore(landing): delete legacy Hero/Pricing/Footer + scratch page variants"
```

---

## Phase 4 — Verification

### Task 19: Accessibility + Lighthouse smoke

- [ ] **Step 1: Manual keyboard pass**

```bash
npm run dev
```

On `http://localhost:3000/`:
1. Tab through every interactive element from top to bottom. Each must show a visible gold focus ring (`--shadow-focus`).
2. Open the FAQ accordion using keyboard (Tab to `<summary>`, press Enter — content expands).
3. Open the mobile drawer (resize browser ≤ 1023px wide), navigate it with Tab/Enter, close with Esc — Esc isn't required in the spec but the close button must be focusable.

- [ ] **Step 2: `axe` (optional but recommended)**

If `@axe-core/react` is installed:
```bash
npx playwright install --with-deps chromium
```
Run `npx playwright codegen http://localhost:3000` only as a smoke check. If you have a Playwright config for axe, run it; otherwise rely on manual + Lighthouse.

- [ ] **Step 3: Lighthouse**

In Chrome DevTools → Lighthouse → Mobile → Performance/Accessibility/Best practices/SEO. Run against `http://localhost:3000/`.

Expected:
- Performance ≥ 90
- Accessibility = 100
- SEO ≥ 95

Investigate and fix any issues. Common culprits: missing alt text, color contrast on accent text over white (gold on white ratio is borderline — use `--accent-dark` for inline body links).

- [ ] **Step 4: Commit any fixes**

```bash
git add -A
git commit -m "fix(landing): a11y + Lighthouse follow-ups"
```

### Task 20: Hex-literal sweep + final verification

- [ ] **Step 1: Hex sweep**

```bash
rg "#[0-9A-Fa-f]{6}\b" src/components/landing/ src/app/page.tsx src/app/layout.tsx
```
Expected: zero results.

- [ ] **Step 2: Full test suite**

```bash
npm run test:run
```
Expected: all green.

- [ ] **Step 3: Production build**

```bash
npm run build
```
Expected: clean. Record final bundle size of `/` route.

- [ ] **Step 4: Final commit (or empty marker)**

```bash
git commit --allow-empty -m "chore(landing): redesign verification pass green"
```

---

## Out of scope (separate specs)

- Dashboard (Owner / Provider / Admin) page redesigns.
- Real production pricing engine for the QuoteDemo widget.
- OG image asset creation (placeholder referenced).
- Real hero photo asset (placeholder referenced).
- Content fill-in for prices, phone, business registration (`landingContent.ts` holds the schema; values are placeholders pending business input).
- `/about`, `/careers`, `/press`, `/legal/*` route stubs — links exist, target pages out of scope.

---

## Self-review

**Spec coverage:**
- §3 Information architecture → Task 14 (composition order)
- §4.1 LandingNav → Task 3
- §4.2 HeroEditorial → Task 4
- §4.3 StepRail → Task 5
- §4.4 QuoteDemo → Tasks 2 + 6
- §4.5 ServiceTileGrid → Task 7
- §4.6 TrustStrip → Task 8
- §4.7 ProviderBand → Task 9
- §4.8 FAQAccordion → Task 10
- §4.9 FinalCta → Task 11
- §4.10 FooterEditorial → Task 12
- §5 Mobile breakpoints → enforced inline per component (`sm:`, `lg:` prefixes)
- §6 Components inventory → Tasks 3-12
- §7 Components to delete → Task 18
- §8 Routing impact (anchors, `?intent=quote`, `?role=provider`) → Tasks 16, 17
- §9 Image + asset list → noted (real hero in Task 4 uses existing placeholder)
- §10 SEO + metadata → Task 15
- §11 Performance budgets → covered by `priority` on hero image (Task 4), Lighthouse check (Task 19)
- §12 Accessibility → Task 19
- §13 Verification → Tasks 19 + 20
- §14 Content sources → `landingContent.ts` schema (Task 1) — placeholder values flagged in business-content section

**Placeholders:** none — every step has executable code or commands. The Task 17 register-page wiring is conditional; if the existing form already supports query params it becomes a no-op.

**Type consistency:** `Frequency` and `Region` types are defined in `pricingRules.demo.ts` (Task 2) and consumed by `QuoteDemo.tsx` (Task 6). `SERVICE_CATEGORIES` icon keys ('Sparkles', 'Wrench', etc.) match the `ICONS` map in `ServiceTile.tsx` (Task 7). `STEPS` icon keys match the map in `StepRail.tsx` (Task 5). `HERO.proofPills` icon keys ('Lock', 'ShieldCheck', 'Smartphone') match the map in `HeroEditorial.tsx` (Task 4).
