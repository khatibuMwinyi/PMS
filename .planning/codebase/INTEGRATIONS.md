# External Integrations

**Analysis Date:** 2026-05-02

## APIs & External Services

**Database (PostgreSQL):**
- Provider: Neon serverless PostgreSQL (AWS us-east-1)
  - Connection: `DATABASE_URL` environment variable
  - Pooler endpoint: `ep-delicate-credit-anjs2m3d-pooler.c-6.us-east-1.aws.neon.tech`
  - SSL required: `sslmode=require&channel_binding=require`
  - Client: `@prisma/client ^5.20.0` with Prisma ORM
  - Schema: `F:\OPSMP\PropertManagement\prisma\schema.prisma`
  - Extensions: `pgcrypto` (encryption), `postgis` (geospatial)
  - Preview features: `postgresqlExtensions`, `fullTextSearch`

**Job Queue (pg-boss):**
- Service: PostgreSQL-based job queue running within the application
  - Package: `pg-boss ^8.0.0`
  - Connection: Reuses `DATABASE_URL` (or `PG_BOSS_CONNION_STRING` if set)
  - Config: `F:\OPSMP\PropertManagement\src\core\jobs\boss.ts`
  - Retention: 7 days for completed jobs
- Scheduled Jobs:
  - **Assignment Expiration** - Runs every minute (`* * * * *`)
  - **Financial Reconciliation** - Runs daily at 23:00 UTC (`0 23 * * *`)
  - **Price Lock Cleanup** - Runs hourly at minute 0 (`0 * * * *`)

**Authentication (NextAuth.js):**
- Provider: NextAuth.js v5 (`next-auth ^5.0.0-beta`)
  - Adapter: `@auth/prisma-adapter` linking to Prisma `User` and `Session` models
  - Strategy: JWT (stateless sessions)
  - Config: `F:\OPSMP\PropertManagement\src\core\auth\index.ts`
- Auth Methods:
  - **Credentials Provider** - Email + password login
    - Password hashing: `bcryptjs` (compare on login)
    - Session storage: JWT token with `id`, `role`, `status` claims
  - Session provider: `F:\OPSMP\PropertManagement\src\components\providers\SessionProvider.tsx`
- Auth-related env vars:
  - `AUTH_SECRET` - Secret for JWT signing
  - `NEXTAUTH_URL` - Base URL for callbacks

**Mobile Money (Selcom - Future Integration):**
- Service: Selcom Mobile Money API
  - Base URL: `https://apigw.selcommobile.com/v1` (configurable via `SELCOM_BASE_URL`)
  - Client: `F:\OPSMP\PropertManagement\src\integrations\selcom\client.ts`
  - Auth: HMAC-SHA256 request signing using `SELCOM_API_KEY` and `SELCOM_API_SECRET`
- Capabilities (currently stubbed):
  - `requestPayment()` - Collect payments from owners via mobile money
    - Currency: TZS (Tanzanian Shilling)
    - Idempotency: Uses `nanoid()` for unique request keys
  - `disburseFunds()` - Payout to providers via mobile money
- Webhook Handling:
  - Endpoint: `F:\OPSMP\PropertManagement\src\app\api\webhooks\selcom\route.ts`
  - POST `/api/webhooks/selcom`
  - Verification: `verifySelcomSignature()` from `@/integrations/selcom/webhooks`
  - Idempotency: `ProcessedWebhook` model in Prisma (unique `externalId`)
- Env vars:
  - `SELCOM_API_KEY` - API key for authentication
  - `SELCOM_SECRET` - Secret for HMAC signature generation
  - `SELCOM_BASE_URL` - Optional override for API endpoint

## Data Storage

**Databases:**
- PostgreSQL (Neon serverless)
  - Connection: `DATABASE_URL` env var
  - Client: Prisma ORM with generated client
  - Migrations: `F:\OPSMP\PropertManagement\prisma\migrations\`
  - Lock file: `F:\OPSMP\PropertManagement\prisma\migrations\migration_lock.toml`

**File Storage:**
- Local filesystem only (no cloud storage integration detected)
- Property images stored as URLs in `Property.image_urls` field (String array)

**Caching:**
- None detected (no Redis, Memcached, or similar)

## Authentication & Identity

**Auth Provider:**
- Custom via NextAuth.js v5 with Credentials Provider
  - Implementation: `F:\OPSMP\PropertManagement\src\core\auth\index.ts`
  - User roles: `ADMIN`, `STAFF`, `OWNER`, `PROVIDER` (from `UserRole` enum)
  - User statuses: `ACTIVE`, `SUSPENDED`, `PENDING_VERIFICATION`
- Session management:
  - JWT strategy (stateless)
  - Token callback and session callback customize `id`, `role`, `status` in session
- Encryption at application layer:
  - `User.phone` field encrypted using AES-256-GCM
  - Implementation: `F:\OPSMP\encryption.ts` (root level utility)
  - Key: `ENCRYPTION_KEY` or `ENCRYPTION_SECRET` env var (64-char hex = 32 bytes)
  - Prisma client extension auto-encrypts on create/update, decrypts on read
  - Client extension: `F:\OPSMP\client.ts`

## Monitoring & Observability

**Error Tracking:**
- None detected (no Sentry, LogRocket, or similar)

**Logs:**
- Console-based logging via `console.log`, `console.warn`, `console.error`
- pg-boss logs job events to console (e.g., `[pg-boss] Started`)
- Selcom client logs stub operations to console (e.g., `[Selcom] requestPayment stub`)

## CI/CD & Deployment

**Hosting:**
- Intended for Vercel (inferred from Next.js 16 + zero-config deployment patterns)
- No `vercel.json` or deployment config detected

**CI Pipeline:**
- None detected (no `.github/workflows/`, `Jenkinsfile`, or similar)

## Environment Configuration

**Required env vars:**
| Variable | Purpose | Example/Default |
|----------|---------|-----------------|
| `DATABASE_URL` | PostgreSQL connection string | Neon serverless pooler URL |
| `AUTH_SECRET` | NextAuth JWT signing secret | 64-char hex string |
| `NEXTAUTH_URL` | Base URL for auth callbacks | `http://localhost:3000` |
| `ENCRYPTION_SECRET` / `ENCRYPTION_KEY` | AES-256-GCM key (32 bytes = 64 hex chars) | 64-char hex string |
| `SELCOM_API_KEY` | Selcom API key (future) | Empty in `.env.example` |
| `SELCOM_SECRET` | Selcom API secret (future) | Empty in `.env.example` |
| `SELCOM_BASE_URL` | Selcom API endpoint override | `https://apigw.selcommobile.com/v1` |
| `PG_BOSS_CONNION_STRING` | Separate pg-boss connection (optional) | Empty in `.env.example` |

**Secrets location:**
- `.env` file in `F:\OPSMP\PropertManagement\.env` (exists, not committed)
- Example template: `F:\OPSMP\PropertManagement\.env.example`
- Note: `.env.example` contains a sample `AUTH_SECRET` and `ENCRYPTION_SECRET` with instruction to change in production

## Webhooks & Callbacks

**Incoming:**
- **Selcom Webhook**: `POST /api/webhooks/selcom`
  - Implementation: `F:\OPSMP\PropertManagement\src\app\api\webhooks\selcom\route.ts`
  - Signature verification: HMAC-SHA256
  - Idempotency: `ProcessedWebhook` table (Prisma model)
  - Status: Stubbed, awaiting Selcom sandbox credentials

**Outgoing:**
- **Selcom Payment Requests**: `POST https://apigw.selcommobile.com/v1/...` (stubbed)
  - Method: `SelcomClient.requestPayment()`
- **Selcom Disbursements**: `POST https://apigw.selcommobile.com/v1/...` (stubbed)
  - Method: `SelcomClient.disburseFunds()`

## Integration Patterns

**API Client Pattern:**
- Centralized in `F:\OPSMP\PropertManagement\src\integrations\selcom\client.ts`
- Singleton export: `export const selcom = new SelcomClient()`
- Request signing: HMAC-SHA256 over timestamp + payload
- Idempotency keys: `nanoid()` for mutation requests

**Webhook Processing Pattern:**
- POST endpoint in `src/app/api/webhooks/` directory
- Signature verification before processing
- Idempotency check via `ProcessedWebhook` model (INSERT, catch duplicate)

**Database Integration Pattern:**
- Prisma client extended with encryption middleware (`F:\OPSMP\client.ts`)
- Singleton pattern: `globalThis.prismaGlobal` in development to prevent multiple instances
- Auto-generates client on postinstall: `"postinstall": "prisma generate"`

---

*Integration audit: 2026-05-02*
