# Technology Stack

**Analysis Date:** 2026-05-02

## Languages

**Primary:**
- TypeScript `^5.6.0` - Full-stack language for `PropertManagement` app and `example` app
- JavaScript (JSX/TSX) - React component files (`.tsx` extension)

**Secondary:**
- SQL (Prisma schema) - Database schema and migrations in `prisma/schema.prisma`
- CSS - Styling via Tailwind CSS utility classes

## Runtime

**Environment:**
- Node.js `v24.14.1` (detected in environment)
- npm `11.11.0` (detected in environment)

**Package Manager:**
- npm (implied by `package.json` and `node_modules` structure)
- Lockfile: Not detected (no `package-lock.json` found in repository)

## Frameworks

**Core:**
- **Next.js `^16.2.3`** - React framework for `PropertManagement` app (`F:\OPSMP\PropertManagement\package.json`)
  - App Router architecture with `(auth)`, `(dashboard)`, `(marketing)` route groups
  - Server-side rendering and API routes
- **React `^19.0.0`** - UI library (`F:\OPSMP\PropertManagement\package.json`)
- **Vite `7.2.4`** - Build tool for `example` app (`F:\OPSMP\example\package.json`)

**UI/Styling:**
- **Tailwind CSS `^3.4.0`** (PropertManagement) / `4.1.17` (example) - Utility-first CSS framework
  - Configured in `F:\OPSMP\PropertManagement\tailwind.config.ts` with custom brand tokens
  - PostCSS integration via `F:\OPSMP\PropertManagement\postcss.config.mjs`
- **Framer Motion `^12.38.0`** - Animation library (`F:\OPSMP\PropertManagement\package.json`)
- **lucide-react `^1.8.0`** - Icon library (used in both apps)
- **sonner `^2.0.7`** - Toast notification library

**Testing:**
- **Vitest `^4.1.5`** - Unit/component test runner (`F:\OPSMP\PropertManagement\vitest.config.ts`)
  - Environment: `jsdom`
  - Setup file: `F:\OPSMP\PropertManagement\src\test\setup.ts`
  - Coverage provider: `v8`
- **Playwright `^1.59.1`** - E2E testing framework (`F:\OPSMP\PropertManagement\package.json`)
- **@testing-library/react `^16.3.2`** - React component testing utilities
- **@testing-library/jest-dom `^6.9.1`** - DOM matchers for assertions

**Build/Dev:**
- **TypeScript `^5.6.0`** - Type checking and compilation
  - Config: `F:\OPSMP\PropertManagement\tsconfig.json`
  - Target: `ES2020`, Module: `esnext`, Module Resolution: `bundler`
  - Path alias: `@/*` → `./src/*`
- **ts-node `^10.9.2`** - TypeScript execution for Prisma seeds
- **@vitejs/plugin-react `^6.0.1`** - React integration for Vite (used in both apps)
- **Autoprefixer `^10.4.0`** - CSS vendor prefixing
- **PostCSS `^8.4.0`** - CSS processing

## Key Dependencies

**Critical:**
- **@prisma/client `^5.20.0`** - Type-safe database client for PostgreSQL
- **prisma `^5.20.0`** - ORM and migration tool
  - Schema: `F:\OPSMP\PropertManagement\prisma\schema.prisma`
  - Uses `pgcrypto` and `postgis` PostgreSQL extensions
  - Preview features: `postgresqlExtensions`, `fullTextSearch`
- **next-auth `^5.0.0-beta`** / **@auth/prisma-adapter `^2.0.0`** - Authentication framework
  - JWT strategy for stateless sessions
  - Credentials provider with bcrypt password hashing
  - Auth config: `F:\OPSMP\PropertManagement\src\core\auth\index.ts`
- **bcryptjs `^2.4.3`** - Password hashing (client-side compatible)
- **pg-boss `^8.0.0`** - PostgreSQL-based job queue for background workers
  - Workers: `F:\OPSMP\PropertManagement\src\core\jobs\boss.ts`
  - Scheduled jobs: assignment expiration, financial reconciliation, price-lock cleanup
- **zod `^3.23.0`** - Schema validation (used with react-hook-form)
- **react-hook-form `^7.72.1`** + **@hookform/resolvers `^5.2.2`** - Form state management
- **date-fns `^4.1.0`** - Date formatting and manipulation
- **nanoid `^5.0.0`** - Unique ID generation (used in Selcom integration)
- **clsx `^2.1.0`** + **tailwind-merge `^2.5.0`** - Conditional className utilities

**Infrastructure:**
- **next `^16.2.3`** - Application server and build system
- **pg-boss `^8.0.0`** - Background job processing (runs within Node.js process)

## Configuration

**Environment:**
- Environment files: `F:\OPSMP\PropertManagement\.env` (exists), `F:\OPSMP\PropertManagement\.env.example`
- Required env vars (from `.env.example`):
  - `DATABASE_URL` - PostgreSQL connection (Neon serverless)
  - `AUTH_SECRET` - NextAuth secret for JWT signing
  - `NEXTAUTH_URL` - Base URL for auth callbacks
  - `ENCRYPTION_SECRET` (or `ENCRYPTION_KEY`) - 32-byte hex key for AES-256-GCM encryption
  - `SELCOM_API_KEY` - Selcom Mobile Money API key (future)
  - `SELCOM_SECRET` - Selcom API secret (future)
  - `PG_BOSS_CONNION_STRING` - Separate pg-boss connection (optional)

**Build:**
- Next.js config: `F:\OPSMP\PropertManagement\next.config.ts`
  - Experimental: Server Actions with 10mb body size limit
- Vite config (example): `F:\OPSMP\example\vite.config.ts`
  - Plugins: `@vitejs/plugin-react`, `@tailwindcss/vite`, `vite-plugin-singlefile`

## Platform Requirements

**Development:**
- Node.js `^20` (based on `@types/node` version)
- npm for package management
- PostgreSQL database (Neon serverless in production, local for dev)
- Windows (current OS: `win32`)

**Production:**
- Hosted on Vercel (inferred from Next.js 16 + `next` scripts)
- PostgreSQL via Neon serverless (`ep-delicate-credit-anjs2m3d-pooler.c-6.us-east-1.aws.neon.tech`)
- SSL required for database connections (`sslmode=require&channel_binding=require`)

---

*Stack analysis: 2026-05-02*
