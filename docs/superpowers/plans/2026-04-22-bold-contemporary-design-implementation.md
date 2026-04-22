# Bold Professional Contemporary Design Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Bold Professional Contemporary design theme across all pages of the Oweru platform, including landing page, marketing pages, and all dashboard interfaces.

**Architecture:** Enhance the existing design system with Bold Contemporary styling while maintaining dashboard functionality. Use CSS custom properties for consistency, Framer Motion for animations, and Tailwind utilities for responsive design.

**Tech Stack:** Next.js 14, Tailwind CSS, Framer Motion, CSS custom properties, TypeScript

---

## File Structure Overview

### Files to Modify
- `src/app/globals.css` - Add Bold Contemporary CSS variables and animations
- `src/app/(marketing)/page.tsx` - Transform landing page
- `src/app/(marketing)/page.option3.tsx` - Update Bold Contemporary reference
- `src/components/ui/card.tsx` - Add Bold styling variants
- `src/components/ui/button.tsx` - Add Bold styling variants
- `src/components/ui/input.tsx` - Add Bold styling variants
- `src/components/layout/DashboardShell.tsx` - Enhance dashboard styling
- All dashboard pages in `src/app/(dashboard)/*/` directories

### Files to Create
- `src/styles/bold-contemporary.css` - Optional dedicated style file
- `src/components/ui/bold-variants.tsx` - Bold UI component variants

---

## Task 1: Enhance Design System with Bold Contemporary Styles

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Add Bold Contemporary CSS Variables**

```css
/* Add to :root in globals.css */
--shadow-bold: 0 10px 30px rgba(15, 23, 42, 0.15), 0 4px 12px rgba(15, 23, 42, 0.1);
--shadow-card-bold: 0 4px 20px rgba(15, 23, 42, 0.1), 0 1px 6px rgba(15, 23, 42, 0.06);
--gradient-primary: linear-gradient(135deg, #0F172A 0%, #2D3A58 100%);
--gradient-accent: linear-gradient(135deg, #C89128 0%, #E5B972 100%);
--gradient-text: linear-gradient(135deg, #0F172A 0%, #C89128 100%);
--gradient-text-reverse: linear-gradient(135deg, #C89128 0%, #0F172A 100%);
--animate-float: float 6s ease-in-out infinite;
--animate-pulse-subtle: pulse-subtle 3s ease-in-out infinite;
```

- [ ] **Step 2: Add Animation Keyframes**

```css
/* Add to globals.css after existing animations */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}
@keyframes pulse-subtle {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}
```

- [ ] **Step 3: Add Bold Utility Classes**

```css
/* Add to @layer utilities in globals.css */
.text-gradient {
  background: var(--gradient-text);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.text-gradient-reverse {
  background: var(--gradient-text-reverse);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.shadow-bold {
  box-shadow: var(--shadow-bold);
}

.shadow-card-bold {
  box-shadow: var(--shadow-card-bold);
}

.animate-float {
  animation: var(--animate-float);
}

.animate-pulse-subtle {
  animation: var(--animate-pulse-subtle);
}
```

- [ ] **Step 4: Commit Changes**

```bash
git add src/app/globals.css
git commit -m "feat: add Bold Contemporary design variables and animations"
```

---

## Task 2: Update UI Components with Bold Variants

**Files:**
- Modify: `src/components/ui/card.tsx`
- Modify: `src/components/ui/button.tsx`
- Modify: `src/components/ui/input.tsx`

- [ ] **Step 1: Enhance Card Component**

```typescript
// In card.tsx, add bold variants
export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & {
  variant?: 'default' | 'bold';
}>(({ className, variant = 'default', ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      variant === 'bold' 
        ? 'shadow-bold hover:shadow-xl transition-all duration-300 hover:-translate-y-1' 
        : 'shadow-[var(--shadow-card)]',
      'rounded-[var(--radius-lg)] border border-[var(--border-subtle)]',
      'bg-[var(--surface-card)]',
      className,
    )}
    {...props}
  />
));
```

- [ ] **Step 2: Enhance Button Component**

```typescript
// In button.tsx, add bold variant
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps & {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'bold';
}>(({ className, variant = 'primary', size = 'md', fullWidth = false, disabled, children, ...props }, ref) => {
  return (
    <button
      ref={ref}
      disabled={disabled}
      className={cn(
        // Base
        'inline-flex items-center justify-center font-sans font-medium rounded-md',
        'transition-all duration-200 cursor-pointer select-none',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-primary)]',
        // Disabled
        'disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none',
        // Variants
        variant === 'primary'   && 'bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-dim)] active:scale-[0.98]',
        variant === 'secondary' && 'bg-[var(--surface-overlay)] text-[var(--text-primary)] border border-[var(--border-default)] hover:bg-[var(--surface-card)]',
        variant === 'outline'   && 'bg-transparent border border-[var(--border-default)] text-[var(--text-primary)] hover:bg-[var(--surface-overlay)]',
        variant === 'ghost'     && 'bg-transparent text-[var(--text-secondary)] hover:bg-[var(--surface-overlay)] hover:text-[var(--text-primary)]',
        variant === 'danger'    && 'bg-[var(--state-error-bg)] text-[var(--state-error)] hover:brightness-95',
        variant === 'bold'       && 'bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] text-white hover:shadow-lg hover:scale-105 active:scale-[0.98]',
        // Sizes
        size === 'sm' && 'h-8  px-3   text-[13px] gap-1.5 rounded-[var(--radius-sm)]',
        size === 'md' && 'h-10 px-4   text-[14px] gap-2   rounded-[var(--radius-md)]',
        size === 'lg' && 'h-12 px-6   text-[15px] gap-2   rounded-[var(--radius-md)]',
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
});
```

- [ ] **Step 3: Enhance Input Component**

```typescript
// In input.tsx, add bold variant
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & {
  variant?: 'default' | 'bold';
}>(({ className, variant = 'default', ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        'flex h-10 w-full rounded-md border border-[var(--border-default)]',
        'bg-[var(--surface-card)] px-3 py-2 text-sm ring-offset-background',
        'file:border-0 file:bg-transparent file:text-sm file:font-medium',
        'placeholder:text-[var(--text-muted)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2',
        variant === 'bold' && 'focus-visible:ring-[var(--brand-gold)] focus-visible:ring-offset-2 shadow-sm hover:shadow transition-shadow',
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
      {...props}
    />
  );
});
```

- [ ] **Step 4: Commit Changes**

```bash
git add src/components/ui/card.tsx src/components/ui/button.tsx src/components/ui/input.tsx
git commit -m "feat: add Bold variants to UI components"
```

---

## Task 3: Transform Landing Page with Bold Contemporary Design

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Update Hero Section**

```typescript
// In page.tsx, replace hero section with Bold styling
<motion.div
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  className="mb-8"
>
  <h1 className="text-6xl md:text-8xl font-bold text-gradient mb-6 leading-none">
    Oweru <span className="text-[var(--brand-gold)]">Property</span> Management
  </h1>
  <p className="text-xl md:text-2xl text-[var(--text-primary)] mb-8 max-w-2xl mx-auto opacity-90">
    Transform your property experience with our revolutionary platform
  </p>
</motion.div>
```

- [ ] **Step 2: Add Animated Background**

```typescript
// Add animated background to landing page
<div className="fixed inset-0 z-0 overflow-hidden">
  <motion.div
    className="absolute -top-40 -right-40 w-80 h-80 bg-[var(--brand-gold)] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float"
    animate={{ y: [0, -20, 0] }}
    transition={{ duration: 6, repeat: Infinity }}
  />
  <motion.div
    className="absolute -bottom-40 -left-40 w-80 h-80 bg-[var(--brand-primary)] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float"
    animate={{ y: [0, 20, 0] }}
    transition={{ duration: 8, repeat: Infinity, delay: 2 }}
  />
</div>
```

- [ ] **Step 3: Enhance Feature Cards**

```typescript
// Update feature cards with Bold styling
<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
  {features.map((feature, index) => (
    <motion.div
      key={index}
      whileHover={{ 
        scale: 1.05,
        y: -10,
        backgroundColor: "var(--surface-overlay)"
      }}
      className="p-6 bg-[var(--surface-card)] rounded-2xl border border-[var(--border-subtle)] shadow-bold cursor-pointer transition-all"
    >
      <div className="w-16 h-16 bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-gold)] rounded-full flex items-center justify-center mx-auto mb-4">
        <feature.icon className="w-8 h-8 text-white" />
      </div>
      <h3 className="font-bold text-[var(--text-primary)] mb-2">{feature.title}</h3>
      <p className="text-sm text-[var(--text-secondary)]">{feature.description}</p>
    </motion.div>
  ))}
</div>
```

- [ ] **Step 4: Update CTA Button**

```typescript
// Update CTA button with Bold styling
<motion.button
  whileHover={{
    scale: 1.05,
    backgroundColor: "var(--gradient-accent)",
    color: "var(--text-on-dark)"
  }}
  whileTap={{ scale: 0.95 }}
  className="px-12 py-6 text-lg font-bold bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] text-white rounded-full shadow-lg hover:shadow-xl transition-all"
>
  Get Started
  <ArrowRight className="inline ml-3 w-6 h-6" />
</motion.button>
```

- [ ] **Step 5: Commit Changes**

```bash
git add src/app/page.tsx
git commit -m "feat: transform landing page with Bold Contemporary design"
```

---

## Task 4: Update Marketing Pages with Bold Design

**Files:**
- Modify: `src/app/(marketing)/page.tsx`
- Modify: `src/app/(marketing)/page.option3.tsx` (ensure it's properly styled)

- [ ] **Step 1: Transform Option3 Marketing Page**

```typescript
// In page.option3.tsx, ensure all elements use Bold styling
<section className="relative min-h-screen flex items-center justify-center overflow-hidden">
  {/* Enhanced animated background */}
  <div className="absolute inset-0 z-0">
    <div className="absolute -top-40 -right-40 w-80 h-80 bg-[var(--brand-gold)] rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-float"></div>
    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[var(--brand-primary)] rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-float animation-delay-2000"></div>
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[var(--brand-secondary)] rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-float animation-delay-4000"></div>
  </div>

  {/* Enhanced hero text */}
  <h1 className="text-6xl md:text-8xl font-black text-gradient mb-6 leading-none">
    Property <span className="text-[var(--brand-gold)]">Reimagined</span>
  </h1>

  {/* Enhanced buttons */}
  <motion.button
    whileHover={{
      scale: 1.05,
      background: "var(--gradient-accent)",
      color: "var(--text-on-dark)"
    }}
    whileTap={{ scale: 0.95 }}
    className="px-12 py-6 text-lg font-bold bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] text-white rounded-full shadow-2xl hover:shadow-3xl transition-all"
  >
    Get Started
    <ArrowRight className="inline ml-3 w-6 h-6" />
  </motion.button>
</section>
```

- [ ] **Step 2: Enhance Feature Cards**

```typescript
// Update feature cards in option3
<motion.div
  key={currentFeature}
  initial={{ opacity: 0, x: 50 }}
  animate={{ opacity: 1, x: 0 }}
  exit={{ opacity: 0, x: -50 }}
  transition={{ duration: 0.5 }}
  className="bg-gradient-to-br from-[var(--surface-card)] to-[var(--surface-overlay)] rounded-3xl p-12 shadow-bold border border-[var(--border-subtle)] hover:shadow-xl transition-all"
>
  <div className={`bg-gradient-to-r ${features[currentFeature].color} w-20 h-20 rounded-2xl flex items-center justify-center mb-8 shadow-lg`}>
    <div className="text-white">
      {features[currentFeature].icon}
    </div>
  </div>
  <h3 className="text-3xl font-bold text-[var(--text-primary)] mb-4">
    {features[currentFeature].title}
  </h3>
  <p className="text-lg text-[var(--text-secondary)] opacity-80">
    {features[currentFeature].description}
  </p>
</motion.div>
```

- [ ] **Step 3: Enhance Stats Section**

```typescript
// Update stats section with Bold styling
<section className="py-20 bg-gradient-to-br from-[var(--surface-page)] to-[var(--surface-overlay)]">
  <div className="container mx-auto px-6">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
      {stats.map((stat, index) => (
        <motion.div
          whileHover={{ y: -10, scale: 1.05 }}
          className="text-center group cursor-pointer"
        >
          <div className="text-5xl font-bold text-gradient mb-2">{stat.value}</div>
          <div className="text-[var(--text-primary)] font-medium">{stat.label}</div>
        </motion.div>
      ))}
    </div>
  </div>
</section>
```

- [ ] **Step 4: Commit Changes**

```bash
git add src/app/\(marketing\)/page.tsx src/app/\(marketing\)/page.option3.tsx
git commit -m "feat: enhance marketing pages with Bold design"
```

---

## Task 5: Transform Dashboard Pages with Subtle Bold Elements

**Files:**
- Modify: `src/app/(dashboard)/admin/page.tsx`
- Modify: `src/app/(dashboard)/owner/page.tsx`
- Modify: `src/app/(dashboard)/provider/page.tsx`
- Modify: `src/components/layout/DashboardShell.tsx`

- [ ] **Step 1: Enhance Dashboard Shell**

```typescript
// In DashboardShell.tsx, add subtle Bold elements
<header className="sticky top-0 z-50 h-16 flex items-center gap-3 px-4 sm:px-6 bg-gradient-to-r from-[var(--surface-card)] to-[var(--surface-overlay)] border-b border-[var(--border-subtle)] shadow-sm">
  {/* Add animated background element */}
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <motion.div
      className="absolute -top-20 -right-20 w-40 h-40 bg-[var(--brand-gold)] rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-float"
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 10, repeat: Infinity }}
    />
  </div>
  
  {/* Logo with gradient */}
  <span className="font-display text-[18px] text-gradient leading-none select-none relative z-10">
    Oweru
  </span>
</header>
```

- [ ] **Step 2: Enhance Dashboard Cards**

```typescript
// In dashboard pages, update card styling
<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
  <div className="p-6 bg-gradient-to-br from-[var(--surface-card)] to-[var(--surface-overlay)] rounded-[var(--radius-lg)] border border-[var(--border-subtle)] shadow-bold hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
    <p className="text-sm text-[var(--text-muted)] mb-2">Total Properties</p>
    <p className="text-3xl font-bold text-gradient">{data.totalProperties}</p>
    <motion.div
      className="mt-2 h-1 bg-gradient-to-r from-[var(--brand-gold)] to-[var(--brand-primary)] rounded-full"
      initial={{ width: 0 }}
      animate={{ width: "100%" }}
      transition={{ duration: 1 }}
    />
  </div>
</div>
```

- [ ] **Step 3: Add Bold Button Variations**

```typescript
// In dashboard components, use Bold button variant
<motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  className="px-6 py-3 text-sm font-bold bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] text-white rounded-[var(--radius-md)] shadow hover:shadow-lg transition-all"
>
  View Details
</motion.button>
```

- [ ] **Step 4: Enhance Data Visualizations**

```typescript
// Add animated stat cards
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.2 }}
  className="bg-[var(--surface-card)] p-6 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] shadow-bold"
>
  <div className="flex items-center justify-between mb-4">
    <h3 className="font-semibold text-[var(--text-primary)]">Revenue</h3>
    <TrendingUp className="w-5 h-5 text-[var(--brand-gold)]" />
  </div>
  <div className="text-2xl font-bold text-gradient mb-2">$12,450</div>
  <div className="text-sm text-[var(--text-success)]">+15% from last month</div>
</motion.div>
```

- [ ] **Step 5: Commit Changes**

```bash
git add src/app/\(dashboard\)/admin/page.tsx src/app/\(dashboard\)/owner/page.tsx src/app/\(dashboard\)/provider/page.tsx src/components/layout/DashboardShell.tsx
git commit -m "feat: enhance dashboard pages with subtle Bold elements"
```

---

## Task 6: Add Interactive Elements and Micro-interactions

**Files:**
- Create: `src/components/animations/BoldAnimations.tsx`

- [ ] **Step 1: Create Animation Component**

```typescript
// Create BoldAnimations.tsx
'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
}

export function AnimatedCard({ children, className = '' }: AnimatedCardProps) {
  return (
    <motion.div
      whileHover={{ 
        y: -5,
        boxShadow: '0 20px 40px rgba(15, 23, 42, 0.15)'
      }}
      whileTap={{ scale: 0.98 }}
      className={`bg-[var(--surface-card)] rounded-[var(--radius-lg)] border border-[var(--border-subtle)] shadow-bold transition-all duration-300 ${className}`}
    >
      {children}
    </motion.div>
  );
}

interface GradientTextProps {
  children: ReactNode;
  className?: string;
}

export function GradientText({ children, className = '' }: GradientTextProps) {
  return (
    <span className={`text-gradient ${className}`}>
      {children}
    </span>
  );
}

interface PulseButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}

export function PulseButton({ children, onClick, className = '' }: PulseButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`px-6 py-3 font-bold bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] text-white rounded-[var(--radius-md)] shadow-lg hover:shadow-xl transition-all ${className}`}
    >
      {children}
    </motion.button>
  );
}
```

- [ ] **Step 2: Apply Animation Components**

```typescript
// In dashboard pages, use new animation components
import { AnimatedCard, GradientText, PulseButton } from '@/components/animations/BoldAnimations';

<AnimatedCard className="p-6">
  <h3 className="text-xl font-bold mb-2">
    <GradientText>Total Properties: </GradientText>
    {data.totalProperties}
  </h3>
</AnimatedCard>

<PulseButton onClick={() => console.log('Clicked')}>
  Get Started
</PulseButton>
```

- [ ] **Step 3: Commit Changes**

```bash
git add src/components/animations/BoldAnimations.tsx
git commit -m "feat: add interactive animation components"
```

---

## Task 7: Final Polish and Testing

**Files:**
- Test: All pages in browser
- Test: Performance with Lighthouse

- [ ] **Step 1: Test Visual Consistency**

- Open each page in browser
- Verify Bold styling is applied consistently
- Check animations are smooth and performant
- Ensure accessibility (keyboard navigation, screen readers)

- [ ] **Step 2: Performance Testing**

```bash
npm run build
npm run start
```

- Use Lighthouse to audit performance
- Target: 90+ Performance score
- Ensure animations don't impact load time

- [ ] **Step 3: Test Responsiveness**

- Test on mobile, tablet, and desktop
- Verify animations work on all devices
- Check touch interactions on mobile

- [ ] **Step 4: Final Commit**

```bash
git add .
git commit -m "feat: complete Bold Contemporary design implementation"
```

---

## Summary of Changes

1. **Enhanced Design System**: Added Bold Contemporary CSS variables and animations
2. **Updated Components**: Added Bold variants to UI components
3. **Transformed Landing Page**: Applied Bold styling with animations
4. **Enhanced Marketing Pages**: Full Bold treatment with gradients
5. **Improved Dashboard**: Subtle Bold elements while maintaining functionality
6. **Added Interactive Components**: Reusable animation components
7. **Final Testing**: Ensured performance and accessibility

All changes maintain the professional nature of the platform while adding visual excitement and modern appeal.