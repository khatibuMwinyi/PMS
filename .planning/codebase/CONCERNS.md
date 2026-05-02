# Codebase Concerns

**Analysis Date:** 2026-05-02

## Tech Debt

**Type Assertions with `any`:**
- Files: `F:\OPSMP\PropertManagement\src\core\auth\callbacks.ts` (lines 3, 4, 12, 13, 14), `F:\OPSMP\PropertManagement\src\app\api\auth\register\route.ts` (line 24), `F:\OPSMP\PropertManagement\src\features\tasks\actions.ts` (line 136)
- Issue: Using `as any` type assertions bypasses TypeScript type checking
- Impact: Potential runtime errors from incorrect type assumptions
- Fix approach: Define proper TypeScript interfaces for NextAuth session/token types

**Stubbed Payment Integration:**
- File: `F:\OPSMP\PropertManagement\src\integrations\selcom\client.ts` (lines 23-24, 67-69, 81-83)
- Issue: Selcom API client is stubbed with TODO comment: "Replace stub with actual Selcom API endpoint and payload schema once sandbox credentials are provisioned"
- Impact: Payment functionality not actually connected to real payment provider
- Fix approach: Implement actual Selcom API integration when sandbox credentials are available

**Duplicate PII Redaction Logic:**
- Files: `F:\OPSMP\PropertManagement\src\features\tasks\actions.ts` (lines 10-12), `F:\OPSMP\PropertManagement\src\core\security\pii-redaction.ts`
- Issue: Two different PII redaction implementations exist - `redactPII()` in tasks/actions.ts is a poor duplicate of the comprehensive version in core/security
- Impact: Inconsistent PII handling, maintenance burden
- Fix approach: Remove duplicate `redactPII()` from tasks/actions.ts and import from core/security

## Known Bugs

**Unvalidated `addUnit` Function:**
- File: `F:\OPSMP\PropertManagement\src\features\properties\actions.ts` (lines 81-101)
- Issue: `addUnit()` function doesn't validate input with Zod schema (unlike `createProperty()` which uses `CreatePropertySchema`). Accepts raw FormData without validation
- Trigger: Calling addUnit with malformed data
- Workaround: Use `createProperty()` instead until fixed

**Hardcoded Mock Phone Number:**
- File: `F:\OPSMP\PropertManagement\src\features\wallets\payment-saga.ts` (line 157)
- Issue: Provider payout uses hardcoded mock phone `'255123456789'` instead of actual provider phone
- Impact: Payments always sent to wrong number in mock; will fail in production
- Fix approach: Use provider's actual phone number from database

## Security Considerations

**In-Memory Rate Limiting:**
- File: `F:\OPSMP\PropertManagement\src\core\lib\rate-limit.ts`
- Risk: Rate limit store uses `Map` which resets on server restart and doesn't work with multiple server instances
- Current mitigation: Works for single-instance development
- Recommendations: Use Redis or database-backed rate limiting for production

**Encryption Secret Configuration:**
- File: `F:\OPSMP\PropertManagement\src\core\security\encryption.ts` (line 11-12)
- Risk: `ENCRYPTION_SECRET` environment variable must be set or app crashes
- Current mitigation: Runtime check throws error if missing
- Recommendations: Add startup validation, use strong secret (32+ chars)

**PII Redaction Pattern Limitations:**
- File: `F:\OPSMP\PropertManagement\src\core\security\pii-redaction.ts` (lines 30-35)
- Risk: ID pattern `/\b\d{6,}\b/g` matches any 6+ digit number (could have false positives like postal codes)
- Current mitigation: Manual review process for flagged content
- Recommendations: Refine patterns for Tanzanian ID formats specifically

**Webhook Signature Verification Dependency:**
- File: `F:\OPSMP\PropertManagement\src\app\api\webhooks\selcom\route.ts` (line 42)
- Risk: Relies on `SELF_API_SECRET` environment variable for HMAC verification
- Current mitigation: Returns 401 if signature invalid
- Recommendations: Ensure `SELF_API_SECRET` is set in production, consider rotation strategy

## Performance Bottlenecks

**Sequential Payment Settlement:**
- File: `F:\OPSMP\PropertManagement\src\features\wallets\payment-saga.ts` (lines 276-313)
- Problem: `settlePendingPayments()` iterates through all pending transactions sequentially
- Cause: `for...of` loop with individual database updates
- Improvement path: Batch database updates, use bulk operations, or process in parallel with concurrency limits

**No Database Query Optimization Visible:**
- Files: Multiple query files in `F:\OPSMP\PropertManagement\src\features\*\queries.ts`
- Problem: No evidence of query optimization (select specific fields, use indexes)
- Cause: Prisma queries likely fetching all fields by default
- Improvement path: Review and optimize Prisma queries with `.select()`, ensure indexes on foreign keys

**Large File: ProviderDashboard.tsx:**
- File: `F:\OPSMP\PropertManagement\src\features\analytics\components\ProviderDashboard.tsx` (10.1 KB)
- Problem: Large component file may indicate violation of single responsibility
- Cause: Dashboard logic, data fetching, and rendering all in one file
- Improvement path: Extract custom hooks, split into smaller components

## Fragile Areas

**Payment Saga Compensation Logic:**
- File: `F:\OPSMP\PropertManagement\src\features\wallets\payment-saga.ts`
- Files: Entire payment flow (lines 82-207)
- Why fragile: Compensation functions are mostly stubs (lines 98, 119, 128, 164, 194, 203). If payment fails mid-saga, rollback may not work
- Safe modification: Implement actual compensation logic before production use
- Test coverage: Payment saga has no dedicated test file

**Location Verification Edge Cases:**
- File: `F:\OPSMP\PropertManagement\src\features\tasks\actions.ts` (lines 40-104)
- Why fragile: Complex conditional logic with GPS accuracy, distance thresholds, photo fallbacks
- Safe modification: Add comprehensive unit tests for all verification paths
- Test coverage: No tests found for `verifyLocation()` or `checkInToTask()`

## Scaling Limits

**In-Memory Rate Limit Store:**
- Current capacity: Single Node.js process memory
- Limit: Resets on restart, doesn't persist across instances
- Scaling path: Migrate to Redis when scaling to multiple server instances

**pg-boss Job Queue:**
- Current capacity: PostgreSQL-backed queue in `F:\OPSMP\PropertManagement\src\core\jobs\boss.ts`
- Limit: Bound by PostgreSQL performance
- Scaling path: Consider dedicated message broker (RabbitMQ, SQS) for high-volume scenarios

**Prisma Client Singleton Pattern:**
- File: `F:\OPSMP\PropertManagement\src\core\database\client.ts` (lines 65-70)
- Current capacity: Single Prisma instance shared across requests
- Limit: Connection pool defaults may need tuning under high load
- Scaling path: Monitor connection pool, tune `connection_limit` in `DATABASE_URL`

## Dependencies at Risk

**NextAuth v5 Beta:**
- Package: `next-auth: ^5.0.0-beta`
- Risk: Beta version may have breaking changes or undiscovered vulnerabilities
- Impact: Auth system could break on update
- Migration plan: Monitor for stable release, test thoroughly before upgrading

**pg-boss v8:**
- Package: `pg-boss: ^8.0.0`
- Risk: Job queue library - if unmaintained could pose operational risk
- Impact: Background job processing fails
- Migration plan: Have fallback plan using alternative queue (BullMQ, Bee-Queue)

## Missing Critical Features

**Test Coverage Gap:**
- Problem: Only 6 test files found in `F:\OPSMP\PropertManagement\src\__tests__\`
- Blocks: Reliable refactoring, catching regressions
- Missing tests for: Payment saga, webhook handling, task actions, property actions, authentication callbacks

**Error Boundaries:**
- File: `F:\OPSMP\PropertManagement\src\components\ui\ErrorBoundary.tsx` (7.4 KB)
- Problem: Error boundary exists but not clear if implemented throughout app
- Blocks: Graceful failure handling in production

**Input Validation Inconsistency:**
- Problem: Some Server Actions validate with Zod (`createProperty`), others don't (`addUnit`)
- Blocks: Data integrity, security
- Fix: Standardize input validation using Zod schemas for all Server Actions

## Test Coverage Gaps

**Payment System:**
- What's not tested: Payment saga execution, compensation flows, webhook idempotency
- Files: `F:\OPSMP\PropertManagement\src\features\wallets\payment-saga.ts`, `F:\OPSMP\PropertManagement\src\app\api\webhooks\selcom\route.ts`, `F:\OPSMP\PropertManagement\src\core\idempotency\handler.ts`
- Risk: Payment failures, double-charging, or lost transactions in production
- Priority: High

**Task Execution Workflow:**
- What's not tested: Location verification, check-in process, dispute initiation, auto-verification
- Files: `F:\OPSMP\PropertManagement\src\features\tasks\actions.ts`
- Risk: Incorrect payments, unauthorized check-ins, disputes not processed
- Priority: High

**Security Utilities:**
- What's not tested: Encryption/decryption, PII redaction, rate limiting
- Files: `F:\OPSMP\PropertManagement\src\core\security\encryption.ts`, `F:\OPSMP\PropertManagement\src\core\security\pii-redaction.ts`, `F:\OPSMP\PropertManagement\src\core\lib\rate-limit.ts`
- Risk: Data breaches, PII leaks, inability to prevent abuse
- Priority: Medium

**Database Client Extensions:**
- What's not tested: Prisma middleware for encryption/decryption
- Files: `F:\OPSMP\PropertManagement\src\core\database\client.ts`
- Risk: Data corruption, failed encryption
- Priority: Medium

---

*Concerns audit: 2026-05-02*
