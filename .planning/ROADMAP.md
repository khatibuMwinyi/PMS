# OPSMP Roadmap

## Project: OPSMP (Property Management Platform)

## Phases

### Phase 1: Platform Foundation + Owner Onboarding
**Goal:** Owner can register, onboard property, request a quote, and submit an agreement with audit trails.

**Status:** in-progress
**Directory:** .planning/phases/phase1/
**Plans:** 5 plans

Plans:
- [x] 01-PLAN.md — Design system, dashboard, Prisma schema, auth foundation (Completed 2026-05-02)
- [ ] 01-02-PLAN.md — (placeholder)
- [ ] 01-03-PLAN.md — (placeholder)
- [ ] 01-04-PLAN.md — (placeholder)
- [ ] 01-05-PLAN.md — (placeholder)

### Phase 2: Provider Matching + Service Execution Core
**Goal:** Agreement can be assigned to provider with auto-reassignment, task lifecycle, and race-condition safety.

**Status:** pending
**Directory:** .planning/phases/phase2/

### Phase 3: Financial Backbone + Wallet Settlement
**Goal:** Payment processing with Selcom webhook, wallet ledger, invoice lifecycle, and dispute intake.

**Status:** pending
**Directory:** .planning/phases/phase3/
**Plans:** 5 plans

Plans:
- [ ] 03-01-PLAN.md — Invoice/dispute models, withdrawal requests, and wallet types
- [ ] 03-02-PLAN.md — Selcom webhook with HMAC verification, idempotency, payment saga with 80/20 split
- [ ] 03-03-PLAN.md — Wallet ledger with withdrawal flow, minimum threshold, pending review state
- [ ] 03-04-PLAN.md — Agreement suspension/termination flows, payment notifications, background job
- [ ] 03-05-PLAN.md — Financial audit trail completion, admin audit dashboard

### Phase 4: Dispute Operations + Utilities + Analytics + Production Hardening
**Goal:** End-to-end flow with dispute resolution, utility allocation, analytics dashboards, and production readiness.

**Status:** pending
**Directory:** .planning/phases/phase4/
**Plans:** 5 plans

Plans:
- [ ] 04-01-PLAN.md — Dispute workflow: owner claim, staff review, resolution with strike rules
- [ ] 04-02-PLAN.md — Utility bill recording and tenant allocation (per unit/person/sq meter)
- [ ] 04-03-PLAN.md — Analytics dashboards: owner, provider, admin metrics and charts
- [ ] 04-04-PLAN.md — Dispute notifications and monthly summary reports
- [ ] 04-05-PLAN.md — Audit integrity checks, retention verification, E2E flow, production readiness

## Milestones

### M1: Owner Onboarding (End of Week 1)
- Phase 1 complete
- Design system established
- Audit events for all state changes

### M2: Service Execution (End of Week 2)
- Phase 1 + Phase 2 complete
- Provider assignment working
- Task scheduling operational

### M3: Financial Operations (End of Week 3)
- Phase 3 complete
- Payment processing live
- Wallet settlement working

### M4: Production Ready (End of Week 4)
- All phases complete
- Dispute resolution active
- Analytics dashboards live
- Production hardening complete
