# Architecture

**Analysis Date:** 2026-05-02

## System Overview

```text
┌─────────────────────────────────────────────────────────────┐
│                      Next.js App Router                     │
│                  (React Server Components)                  │
├──────────────────┬──────────────────┬───────────────────────┤
│   (marketing)    │    (auth)       │   (dashboard)         │
│   `src/app/      │   `src/app/     │  `src/app/            │
│    (marketing)/` │    (auth)/`     │   (dashboard)/`       │
└────────┬─────────┴────────┬────────┴──────────┬────────────┘
         │                  │                     │
         ▼                  ▼                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    Feature Modules                          │
│  `src/features/*/actions.ts` (Server Actions)             │
│  `src/features/*/queries.ts` (Data Access)                │
│  `src/features/*/components/` (UI Components)              │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│                      Core Layer                            │
│  `src/core/database/` Prisma ORM + PostgreSQL + PostGIS   │
│  `src/core/auth/`      NextAuth.js with JWT               │
│  `src/core/security/`  Field-level Encryption (AES-256)   │
│  `src/core/jobs/`      pg-boss Background Workers         │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│              External Integrations                         │
│  `src/integrations/selcom/`     Payment Gateway           │
│  `src/integrations/gemini/`     AI PII Redaction         │
│  PostgreSQL + PostGIS + pg-boss queue                    │
└─────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| App Router Pages | Server-side rendering, auth guards, data fetching | `src/app/**/page.tsx` |
| Server Actions | Mutation logic, form handling, revalidation | `src/features/*/actions.ts` |
| Query Modules | Data access, Prisma queries, raw SQL | `src/features/*/queries.ts` |
| UI Components | Client-side interactivity, forms, display | `src/features/*/components/*.tsx` |
| Core Auth | NextAuth config, JWT callbacks, role extraction | `src/core/auth/index.ts` |
| Database Client | Prisma singleton, field encryption extensions | `src/core/database/client.ts` |
| Background Jobs | Scheduled tasks, expiration, reconciliation | `src/core/jobs/boss.ts` |
| Payment Saga | 80/20 split, compensation transactions | `src/features/wallets/payment-saga.ts` |

## Pattern Overview

**Overall:** Feature-based Next.js App Router with Server Actions

**Key Characteristics:**
- React Server Components (RSC) by default, 'use client' only where needed
- Server Actions ('use server') for all mutations instead of API routes
- Feature-sliced architecture with co-located types, queries, actions, components
- Background job processing via pg-boss with PostgreSQL-backed queue
- Saga pattern for multi-step payment transactions with compensation
- Field-level encryption at the application layer (not database)

## Layers

**Presentation Layer (App Router):**
- Purpose: Routing, SSR, layout composition, auth guards
- Location: `src/app/`
- Contains: Route groups `(marketing)`, `(auth)`, `(dashboard)`, API routes `api/`
- Depends on: Feature modules, Core auth, UI components

**Feature Layer:**
- Purpose: Business logic per domain (users, properties, wallets, etc.)
- Location: `src/features/`
- Contains: `actions.ts` (Server Actions), `queries.ts` (data access), `types.ts`, `components/`
- Depends on: Core database, Core auth, Integrations

**Core Layer:**
- Purpose: Shared infrastructure, security, data access, job processing
- Location: `src/core/`
- Contains: `database/`, `auth/`, `security/`, `jobs/`, `lib/`, `utils/`, `storage/`
- Depends on: Prisma, PostgreSQL, external services

**Integration Layer:**
- Purpose: Third-party service clients (payments, AI, etc.)
- Location: `src/integrations/`
- Contains: `selcom/`, `mock-payment/`, `gemini/`
- Depends on: External APIs, Core security

## Data Flow

### Primary Request Path (Page Load)

1. HTTP request hits Next.js App Router (`src/app/(dashboard)/owner/page.tsx:14`)
2. Server Component calls auth() to get session (`src/core/auth/index.ts:11`)
3. RoleGuard checks authorization (`src/components/RoleGuard.tsx:17`)
4. Query function fetches data via Prisma (`src/features/analytics/queries.ts:52`)
5. Prisma client applies encryption extensions (`src/core/database/client.ts:4-63`)
6. Data returned to Server Component, rendered as RSC

### Mutation Flow (Server Action)

1. Client form submits FormData (`src/features/properties/components/CreatePropertyForm.tsx`)
2. Server Action invoked (`src/features/properties/actions.ts:9` - `createProperty()`)
3. Auth check via `auth()` (`src/features/properties/actions.ts:10`)
4. Zod schema validation (`src/features/properties/actions.ts:24`)
5. Image upload to storage (`src/features/properties/actions.ts:47`)
6. Prisma create with encrypted fields (`src/features/properties/actions.ts:56-66`)
7. Raw SQL for PostGIS geometry (`src/features/properties/actions.ts:69-73`)
8. Cache revalidation (`src/features/properties/actions.ts:76`)

### Payment Saga Flow

1. Service completion triggers payment (`src/features/wallets/payment-saga.ts:239` - `processServicePayment()`)
2. Execute payment saga with compensation (`src/features/wallets/payment-saga.ts:32` - `executePaymentSaga()`)
3. Step 1: Debit owner (mock processor) (`src/features/wallets/payment-saga.ts:82`)
4. Step 2: Credit provider (80% split) (`src/features/wallets/payment-saga.ts:137`)
5. Step 3: Record financial audit (`src/features/wallets/payment-saga.ts:212`)
6. If any step fails, compensation functions run to rollback

### Background Job Flow

1. pg-boss starts with scheduled workers (`src/core/jobs/boss.ts:20` - `startWorker()`)
2. Assignment expiration runs every minute (`src/core/jobs/boss.ts:26-36`)
3. Financial reconciliation runs nightly at 23:00 UTC (`src/core/jobs/boss.ts:40-50`)
4. Price lock cleanup runs hourly (`src/core/jobs/boss.ts:52-64`)

**State Management:**
- Server state: React Server Components + Server Actions + Prisma
- Client state: React Context (ThemeContext, NextAuth Session)
- No client-side state management library (Redux, Zustand, etc.)
- Form state: React Hook Form with Zod resolvers

## Key Abstractions

**Server Actions Pattern:**
- Purpose: Encapsulate mutations with auth, validation, revalidation
- Examples: `src/features/properties/actions.ts`, `src/features/users/actions.ts`
- Pattern: `'use server'` directive, named exports, FormData or typed params

**Query Modules Pattern:**
- Purpose: Server-side data fetching with authorization checks
- Examples: `src/features/properties/queries.ts`, `src/features/services/queries.ts`
- Pattern: `'use server'` directive, async functions, Prisma with includes

**Feature Slice Pattern:**
- Purpose: Co-locate related code by domain
- Structure: `types.ts` | `queries.ts` | `actions.ts` | `components/index.ts`
- Each feature is self-contained with its own types, logic, and UI

**Field Encryption Extension:**
- Purpose: Transparent encryption/decryption of sensitive fields
- Implementation: Prisma client extension with query/result hooks
- Files: `src/core/database/client.ts:4-63`, `src/core/security/encryption.ts`

## Entry Points

**Web Application:**
- Location: `src/app/layout.tsx`
- Triggers: HTTP requests to any route
- Responsibilities: HTML shell, SessionProvider, ErrorBoundary, ToastProvider

**API Routes:**
- NextAuth: `src/app/api/auth/[...nextauth]/route.ts`
- Register: `src/app/api/auth/register/route.ts`
- Selcom Webhook: `src/app/api/webhooks/selcom/route.ts`
- Owner Properties: `src/app/api/owner/properties/route.ts`

**Background Workers:**
- Location: `src/core/jobs/boss.ts`
- Triggers: Scheduled via cron patterns
- Responsibilities: Expiration, reconciliation, cleanup

## Architectural Constraints

- **Threading:** Single-threaded Node.js event loop; background jobs run in same process via pg-boss
- **Global state:** Prisma client singleton (`src/core/database/client.ts:65-70`), NextAuth handlers
- **Circular imports:** Avoided via feature-sliced architecture with clear dependency direction (features → core → integrations)
- **Server Actions:** Must be 'use server' and exported from files with that directive; cannot be used in client components directly
- **PostGIS dependency:** Geospatial queries require PostGIS extension enabled in PostgreSQL (`prisma/schema.prisma:9`)

## Anti-Patterns

### Mixed Client/Server in Server Actions

**What happens:** Importing Server Action functions in client components without proper form wrappers
**Why it's wrong:** Server Actions can only be called from forms or via bind in client components
**Do this instead:** Use `action` prop on forms, or wrap in `startTransition` - see `src/features/properties/components/CreatePropertyForm.tsx`

### Raw SQL for PostGIS

**What happens:** Using `$queryRaw` and `$executeRaw` for PostGIS operations (`src/features/services/queries.ts:31-48`)
**Why it's wrong:** Bypasses Prisma's type safety and migration system
**Do this instead:** Use Prisma's typed API where possible; document raw SQL usage clearly with comments

### Inline Mock/Production Switching

**What happens:** Checking `process.env.NODE_ENV` or feature flags inline to switch payment processors
**Why it's wrong:** Scatters environment-specific logic throughout codebase
**Do this instead:** Use the integration abstraction layer (`src/integrations/`) with a factory or config to select implementation

## Error Handling

**Strategy:** Error boundaries for UI, try/catch in Server Actions, compensation in Sagas

**Patterns:**
- Server Actions return `{ success: boolean; error?: string }` tuples (`src/features/properties/actions.ts:9-13`)
- Payment Saga uses compensation functions for rollback (`src/features/wallets/payment-saga.ts:22-27`)
- React Error Boundary wraps dashboard content (`src/components/ui/ErrorBoundary.tsx`)
- pg-boss has global error handler (`src/core/jobs/boss.ts:16-18`)

## Cross-Cutting Concerns

**Logging:** Console.log with `[PAYMENT SAGA]` prefixes (`src/features/wallets/payment-saga.ts:38`); no centralized logger

**Validation:** Zod schemas in feature types (`src/features/properties/types.ts`), resolved with `@hookform/resolvers`

**Authentication:** NextAuth with JWT strategy, custom callbacks to inject role/status (`src/core/auth/callbacks.ts`)

**Authorization:** RoleGuard component (`src/components/RoleGuard.tsx`), server-side checks in queries/actions

**Encryption:** AES-256-GCM for PII fields (phone, address) via Prisma extension (`src/core/security/encryption.ts`)

**Job Processing:** pg-boss with PostgreSQL-backed queue, singleton scheduled jobs (`src/core/jobs/boss.ts`)

---

*Architecture analysis: 2026-05-02*
