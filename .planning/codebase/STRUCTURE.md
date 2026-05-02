# Codebase Structure

**Analysis Date:** 2026-05-02

## Directory Layout

```
F:\OPSMP\
├── PropertManagement/           # Main Next.js application
│   ├── src/
│   │   ├── app/                 # Next.js App Router (routes, layouts, API)
│   │   │   ├── (marketing)/     # Public landing pages (route group)
│   │   │   ├── (auth)/          # Login/register pages (route group)
│   │   │   ├── (dashboard)/     # Protected dashboard routes (route group)
│   │   │   │   ├── admin/       # Admin dashboard pages
│   │   │   │   ├── owner/       # Owner dashboard pages
│   │   │   │   └── provider/    # Provider dashboard pages
│   │   │   └── api/             # API routes (webhooks, register, etc.)
│   │   ├── components/          # Shared UI components
│   │   │   ├── ui/              # Base UI components (buttons, inputs, cards)
│   │   │   ├── layout/          # Layout components (Sidebar, Topbar, DashboardShell)
│   │   │   ├── shared/          # Shared domain components (StatusBadge, RoleBadge)
│   │   │   ├── dashboard/       # Dashboard-specific skeletons and cards
│   │   │   ├── auth/            # Auth-related components (GradientBackground)
│   │   │   ├── hooks/           # Custom React hooks (useDevice)
│   │   │   └── providers/       # Client-side providers (SessionProvider)
│   │   ├── features/            # Feature modules (domain-sliced)
│   │   │   ├── properties/      # Property management (types, queries, actions, components)
│   │   │   ├── users/           # User management (auth, registration)
│   │   │   ├── services/        # Service types and matching
│   │   │   ├── wallets/         # Wallet & payment saga
│   │   │   ├── tasks/           # Task management actions
│   │   │   ├── assignments/     # Assignment management
│   │   │   ├── analytics/       # Dashboard analytics queries
│   │   │   ├── owner/           # Owner-specific queries
│   │   │   ├── pricing/         # Pricing calculator and locks
│   │   │   └── disputes/        # Dispute management actions
│   │   ├── core/                # Core infrastructure
│   │   │   ├── database/        # Prisma client with extensions
│   │   │   ├── auth/            # NextAuth config and callbacks
│   │   │   ├── security/        # Encryption and PII redaction
│   │   │   ├── jobs/            # pg-boss workers and scheduler
│   │   │   ├── storage/         # File upload utilities
│   │   │   ├── utils/           # Distance calculation, helpers
│   │   │   ├── lib/             # Shared utilities (cn, rate-limit)
│   │   │   └── idempotency/     # Idempotency handler
│   │   ├── integrations/        # Third-party service clients
│   │   │   ├── selcom/          # Selcom payment gateway
│   │   │   ├── mock-payment/    # Mock payment processor
│   │   │   └── gemini/          # Google Gemini AI for PII redaction
│   │   ├── config/              # Feature flags and configuration
│   │   ├── context/             # React contexts (ThemeContext)
│   │   ├── providers/           # App-level providers (ToastProvider)
│   │   ├── lib/                 # API service clients (legacy)
│   │   ├── pages/               # (Empty or legacy - not used with App Router)
│   │   ├── test/                # Test setup files
│   │   └── __tests__/           # Test files by category (api, ui, pages)
│   ├── prisma/                  # Database schema and migrations
│   │   ├── schema.prisma        # Prisma schema (398 lines)
│   │   ├── seed.ts              # Database seeding script
│   │   ├── queries.ts           # Raw SQL query helpers
│   │   ├── boss.ts              # pg-boss job definitions
│   │   └── migrations/          # SQL migration files
│   ├── public/                  # Static assets (images, logo)
│   ├── node_modules/            # Dependencies
│   ├── package.json             # NPM dependencies and scripts
│   ├── tsconfig.json            # TypeScript configuration
│   ├── next.config.ts           # Next.js configuration
│   ├── tailwind.config.ts       # Tailwind CSS configuration
│   ├── postcss.config.mjs       # PostCSS configuration
│   ├── vitest.config.ts         # Vitest testing configuration
│   └── .env                     # Environment variables (not committed)
```

## Directory Purposes

**`src/app/`:**
- Purpose: Next.js App Router with routes, layouts, and API endpoints
- Contains: Route groups `(marketing)`, `(auth)`, `(dashboard)`, API routes `api/`
- Key files: `layout.tsx` (root layout), `page.tsx` (homepage)

**`src/features/`:**
- Purpose: Domain-sliced feature modules with co-located logic
- Contains: Per-feature `types.ts`, `queries.ts`, `actions.ts`, `components/`
- Pattern: Each feature is self-contained with its own types, logic, and UI

**`src/components/`:**
- Purpose: Shared/reusable UI components used across features
- Contains: Base UI (`ui/`), layout (`layout/`), shared domain (`shared/`)
- Key files: `RoleGuard.tsx`, `DashboardLayout.tsx`

**`src/core/`:**
- Purpose: Application infrastructure and cross-cutting concerns
- Contains: Database client, auth config, security utilities, job workers
- Key files: `database/client.ts`, `auth/index.ts`, `jobs/boss.ts`

**`src/integrations/`:**
- Purpose: Third-party service clients and API wrappers
- Contains: `selcom/` (payment gateway), `mock-payment/`, `gemini/` (AI)
- Key files: `selcom/client.ts`, `selcom/webhooks.ts`

## Key File Locations

**Entry Points:**
- `src/app/layout.tsx`: Root layout wrapping all pages with providers
- `src/app/(dashboard)/*/page.tsx`: Dashboard pages per role (admin, owner, provider)
- `src/app/(marketing)/page.tsx`: Public landing page
- `src/app/api/auth/[...nextauth]/route.ts`: NextAuth API route

**Configuration:**
- `package.json`: Dependencies, scripts (`dev`, `build`, `test`)
- `tsconfig.json`: TypeScript config with path aliases (`@/*` → `./src/*`)
- `next.config.ts`: Next.js configuration
- `tailwind.config.ts`: Tailwind CSS theme and animations
- `vitest.config.ts`: Test runner configuration

**Core Logic:**
- `src/core/database/client.ts`: Prisma singleton with encryption extensions
- `src/core/auth/index.ts`: NextAuth configuration with credentials provider
- `src/features/*/actions.ts`: Server Actions for mutations
- `src/features/*/queries.ts`: Server-side data fetching functions

**Testing:**
- `src/__tests__/`: Test files organized by type (`api/`, `ui/`, `pages/`)
- `src/**/tests/*.test.tsx`: Component-level tests co-located
- `vitest.config.ts`: Test configuration with jsdom environment

## Naming Conventions

**Files:**
- `kebab-case` for component files: `CreatePropertyForm.tsx`, `LoginForm.tsx`
- `camelCase` for utility/action files: `actions.ts`, `queries.ts`, `types.ts`
- `PascalCase` for component exports: `export function CreatePropertyForm() {}`
- Suffix patterns: `*.test.tsx` for tests, `*.test.ts` for logic tests

**Directories:**
- `kebab-case` for multi-word: `src/components/ui/`, `src/core/security/`
- Route groups use parentheses: `(marketing)`, `(dashboard)`, `(auth)`
- Feature directories use plural nouns: `properties/`, `users/`, `services/`

**Exports:**
- `index.ts` barrel files in component directories: `src/components/ui/index.ts`
- Named exports preferred over default exports
- `'use server'` at top of files containing Server Actions
- `'use client'` at top of files using React hooks or browser APIs

## Where to Add New Code

**New Feature:**
- Primary code: `src/features/{feature-name}/`
  - `types.ts` - TypeScript types and Zod schemas
  - `queries.ts` - Data fetching functions (`'use server'`)
  - `actions.ts` - Mutation Server Actions (`'use server'`)
  - `components/` - UI components (use `'use client'` if needed)
  - `index.ts` - Barrel export for components

**New Dashboard Page:**
- Implementation: `src/app/(dashboard)/{role}/{page-name}/page.tsx`
- Server Component by default for data fetching
- Use `RoleGuard` component for client-side auth checks
- Import queries from `src/features/*/queries.ts`

**New API Route:**
- Implementation: `src/app/api/{route-path}/route.ts`
- Export HTTP method handlers: `export async function GET() {}`, `export async function POST() {}`
- Use `auth()` for authentication, `prisma` for database access

**Shared UI Component:**
- Implementation: `src/components/ui/` or `src/components/shared/`
- Add to barrel export: `src/components/ui/index.ts`
- Use Tailwind CSS with project's design tokens ( `--brand-primary`, etc.)

**Background Job:**
- Worker: `src/core/jobs/workers/{job-name}.ts`
- Export: `name` string and `handler` function
- Register in: `src/core/jobs/boss.ts` with schedule

**API Integration:**
- Client: `src/integrations/{service-name}/client.ts`
- Types: Define in same directory
- Webhook handler: `src/integrations/{service-name}/webhooks.ts`
- Route: `src/app/api/webhooks/{service}/route.ts`

## Module Dependency Graph

```
Features (src/features/*)
    ↓ imports
Core (src/core/*)
    ↓ imports
Database (Prisma + PostgreSQL)
Integrations (src/integrations/*)
    ↓ imports
External APIs (Selcom, Gemini)
```

**Import Patterns Observed:**
- Features import from core: `import { prisma } from '@/core/database/client'`
- Features import auth: `import { auth } from '@/core/auth'`
- Components import features: `import { CreatePropertyForm } from '@/features/properties'`
- Path aliases: `@/` maps to `./src/` (configured in `tsconfig.json:25-29`)
- Relative imports within features: `import { CreatePropertySchema } from './types'`

**Typical Feature Import Structure:**
```typescript
// In src/features/properties/actions.ts
'use server';
import { prisma }          from '@/core/database/client';
import { auth }            from '@/core/auth';
import { uploadImage }     from '@/core/storage/upload';
import { CreatePropertySchema, DAR_ES_SALAAM_LAT } from './types';
```

## Special Directories

**`node_modules/`:**
- Purpose: NPM dependencies
- Generated: Yes (via `npm install` / `pnpm install`)
- Committed: No (in `.gitignore`)

**`prisma/migrations/`:**
- Purpose: Database migration SQL files
- Generated: Yes (via `npx prisma migrate dev`)
- Committed: Yes (version-controlled schema changes)

**`.next/`:**
- Purpose: Next.js build cache and generated types
- Generated: Yes (via `next build` or `next dev`)
- Committed: No (in `.gitignore`)

**`public/`:**
- Purpose: Static assets served by Next.js
- Generated: No (manually added)
- Committed: Yes

---

*Structure analysis: 2026-05-02*
