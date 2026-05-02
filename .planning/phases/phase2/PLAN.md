---
phase: "02-provider-matching-service-execution"
goal: "Agreement can be assigned to provider with auto-reassignment, task lifecycle, and race-condition safety"
status: "pending"
depends_on:
  - phase: "01-platform-foundation"
    exit_criteria_met: false # To be verified at execution
---

# Phase 2: Provider Matching + Service Execution Core

## Objective

Build the provider matching engine, task scheduling system, and assignment lifecycle to enable automated service delivery with race-condition safety and auto-reassignment capabilities.

## Exit Criteria (Week 2)

- [ ] Agreement can be assigned to provider with auto-reassignment if rejected/expired
- [ ] Task lifecycle can run for at least one scheduled service (SCHEDULED → IN_PROGRESS → COMPLETED)
- [ ] Double-acceptance race condition test passes (transaction locking verified)
- [ ] Offer lifecycle with 6-hour acceptance window works correctly
- [ ] Overdue/no-show automation triggers (2h flag, 4h auto-cancel + reassignment)

## Technology Context

| Aspect | Detail |
|--------|--------|
| Framework | Next.js 16.2.3 (App Router) |
| Language | TypeScript 5.6.0 |
| Database | PostgreSQL + Prisma 5.20.0 |
| Auth | NextAuth.js v5 (beta) with JWT strategy |
| Styling | Tailwind CSS 3.4.0 with custom brand tokens |
| Testing | Vitest 4.1.5 + @testing-library/react |
| State | React Server Components + Server Actions |
| Job Queue | pg-boss ^8.0.0 (background workers) |
| Geospatial | PostGIS (for provider location radius filtering) |

## Deliverables

### 1. Provider Profiles & Eligibility
- Provider profile model extension (rating, completion rate, acceptance rate, responsiveness)
- Service category specialization
- Workload tracking (active assignments count)
- Blocked dates management
- Location data for radius filtering (PostGIS)

### 2. Assignment Engine
- Provider eligibility filter:
  - Service category match
  - Location radius (configurable, e.g., 25km)
  - Workload cap (max concurrent assignments)
  - Blocked dates check
- Ranking algorithm:
  - Rating: 40% weight
  - Completion rate: 30% weight
  - Acceptance rate: 20% weight
  - Responsiveness: 10% weight
- Offer lifecycle:
  - 6-hour acceptance window
  - Status: OFFERED → ACCEPTED/REJECTED/EXPIRED
  - Reassignment cascade on rejection/expiry
- Race-safe acceptance using Prisma transaction with `SELECT ... FOR UPDATE` pattern

### 3. Task Management
- Task generation from assignment frequency:
  - Weekly (every 7 days)
  - Bi-weekly (every 14 days)
  - Monthly (every 30 days)
- Task execution statuses:
  - SCHEDULED → IN_PROGRESS → COMPLETED
- Overdue/no-show automation:
  - 2-hour flag (mark as AT_RISK)
  - 4-hour auto-cancel + trigger reassignment

### 4. Agreement Transitions
- Activation logic: Agreement status → ACTIVE when provider accepts
- Cancellation policy:
  - Pre-acceptance: Direct cancel, no penalty
  - Post-acceptance: Cancel with notice period, potential penalty

### 5. Notifications
- Offer sent notification (SMS + in-app)
- Offer acceptance/rejection/expiry alerts
- Reminder notifications (24h before, 1h before)
- Task completion notification to owner
- Overdue/no-show alerts to admin

### 6. Audit Coverage
- Provider selection audit (ranking inputs, selected provider)
- Assignment transitions (OFFERED → ACCEPTED/REJECTED/EXPIRED → REASSIGNED)
- Task transitions (SCHEDULED → IN_PROGRESS → COMPLETED → CANCELLED)
- Cancellation outcomes with reason codes

---

## Task Breakdown by Wave

### Wave 1: Provider Foundation (Depends on Phase 1)

#### Task 1.1: Provider Profile & Eligibility Models
**Complexity:** High  
**Files to Create/Modify:**
- `prisma/schema.prisma` — Add ProviderProfile, Assignment, Task models
- `src/features/providers/types.ts` — Provider schemas with Zod
- `src/features/providers/queries.ts` — Provider data access functions
- `src/features/providers/actions.ts` — Provider profile Server Actions

**Description:**
Extend Prisma schema with ProviderProfile model (linked to User with role PROVIDER). Add fields: rating (Decimal), completionRate, acceptanceRate, responsivenessScore, serviceCategories (Json array), maxConcurrentTasks, blockedDates (Json array), location (PostGIS point). Create Assignment model with status enum (OFFERED, ACCEPTED, REJECTED, EXPIRED, CANCELLED, COMPLETED). Create Task model with frequency, status, scheduledDate, completedDate.

**Prisma Models to Add:**
```prisma
model ProviderProfile {
  id                  String   @id @default(cuid())
  userId              String   @unique
  user                User     @relation(fields: [userId], references: [id])
  rating              Decimal  @default(0.0) @db.Decimal(3, 2) // 0.00-5.00
  completionRate      Decimal  @default(0.0) @db.Decimal(5, 2) // Percentage
  acceptanceRate     Decimal  @default(0.0) @db.Decimal(5, 2) // Percentage
  responsivenessScore Decimal @default(0.0) @db.Decimal(5, 2) // Average response time score
  serviceCategories   String[] // Array of service type IDs
  maxConcurrentTasks  Int      @default(3)
  blockedDates        Json?    // Array of { start: DateTime, end: DateTime }
  location            Unsupported("geometry(Point, 4326)") // PostGIS
  locationText        String?  // Human-readable address
  activeAssignments   Assignment[] @relation("ProviderAssignments")
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  @@index([userId])
  @@index([rating])
}

model Assignment {
  id             String   @id @default(cuid())
  agreementId    String   @unique
  agreement      Agreement @relation(fields: [agreementId], references: [id])
  providerId     String
  provider       ProviderProfile @relation("ProviderAssignments", fields: [providerId], references: [id])
  status         String   @default("OFFERED") // OFFERED, ACCEPTED, REJECTED, EXPIRED, CANCELLED, COMPLETED
  offeredAt      DateTime @default(now())
  respondedAt    DateTime? // When provider accepted/rejected
  expiresAt      DateTime // 6 hours after offeredAt
  reassignmentCount Int   @default(0)
  cancellationReason String?
  tasks          Task[]
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@index([providerId, status])
  @@index([agreementId])
  @@index([status, expiresAt]) // For background job queries
}

model Task {
  id             String   @id @default(cuid())
  assignmentId   String
  assignment     Assignment @relation(fields: [assignmentId], references: [id])
  sequence       Int      // Task number in frequency (1, 2, 3...)
  status         String   @default("SCHEDULED") // SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED, AT_RISK
  scheduledDate  DateTime
  startedAt      DateTime?
  completedAt    DateTime?
  flaggedAt      DateTime? // 2h overdue flag
  cancelledAt    DateTime? // 4h auto-cancel
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@index([assignmentId, status])
  @@index([scheduledDate, status]) // For overdue checks
}
```

**Acceptance Criteria:**
- [ ] ProviderProfile model created with all required fields
- [ ] Assignment model with status flow and expiration timestamp
- [ ] Task model with frequency support and status flow
- [ ] PostGIS extension used for provider location
- [ ] Prisma schema validates: `npx prisma validate`
- [ ] Migration generated: `npx prisma migrate dev --name phase2_provider_models`

**Verification:**
```bash
npx prisma validate
npx prisma migrate dev --name phase2_provider_models
```

---

#### Task 1.2: Provider Registration & Profile Management
**Complexity:** High  
**Files to Create/Modify:**
- `src/features/providers/types.ts` — Add profile schemas
- `src/features/providers/actions.ts` — Register as provider, update profile
- `src/features/providers/components/ProviderProfileForm.tsx` — Profile form
- `src/features/providers/components/ServiceCategorySelector.tsx` — Multi-select for services
- `src/app/(dashboard)/provider/profile/page.tsx` — Profile management page
- `src/app/(dashboard)/provider/register/page.tsx` — Provider registration page

**Description:**
Build provider registration flow (users with PROVIDER role can complete their profile). Form includes: service categories (multi-select from ServiceType catalog), work radius, blocked dates calendar, location picker (lat/lng for PostGIS). Profile displays: rating, completion stats, active assignments count. Server Actions for create/update profile with validation.

**Acceptance Criteria:**
- [ ] Provider can register and create profile with service categories
- [ ] Location saved as PostGIS point via raw SQL: `ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)`
- [ ] Blocked dates stored as JSON array with date validation
- [ ] Profile page displays current stats (rating, workload)
- [ ] Server Actions have Zod validation
- [ ] Only PROVIDER role can access provider profile routes

**Verification:**
```bash
npm run dev
# 1. Register as provider (role=PROVIDER)
# 2. Complete profile with service categories, location, blocked dates
# 3. View profile page with stats
# 4. Verify location saved correctly in DB
```

---

#### Task 1.3: Assignment Engine Foundation
**Complexity:** High  
**Files to Create/Modify:**
- `src/features/assignments/types.ts` — Assignment schemas
- `src/features/assignments/engine.ts` — Provider eligibility filter + ranking
- `src/features/assignments/actions.ts` — Create assignment, offer to provider
- `src/features/assignments/queries.ts` — Assignment data access

**Description:**
Implement provider eligibility filter: (1) Service category match (provider.serviceCategories contains agreement.serviceTypeId), (2) Location radius (PostGIS `ST_DWithin` check within configurable radius, default 25km), (3) Workload cap (count of ACTIVE assignments < maxConcurrentTasks), (4) Blocked dates (agreement start date not in blockedDates). Ranking: weighted score = rating*0.4 + completionRate*0.3 + acceptanceRate*0.2 + responsivenessScore*0.1. Return ranked list of eligible providers.

**Eligibility Filter Logic:**
```typescript
// src/features/assignments/engine.ts
'use server';
import { prisma } from '@/core/database/client';

export interface ProviderEligibilityParams {
  serviceTypeId: string;
  location: { lat: number; lng: number };
  preferredDate: Date;
  radiusKm?: number; // Default 25
}

export interface RankedProvider {
  providerId: string;
  userId: string;
  rating: number;
  completionRate: number;
  acceptanceRate: number;
  responsivenessScore: number;
  activeAssignmentCount: number;
  distanceKm: number;
  weightedScore: number; // 0-100
}

export async function findEligibleProviders(
  params: ProviderEligibilityParams
): Promise<RankedProvider[]> {
  const radiusKm = params.radiusKm ?? 25;
  
  // Raw SQL for PostGIS distance check + eligibility
  const providers = await prisma.$queryRaw<RankedProvider[]>`
    SELECT 
      pp.id as "providerId",
      pp.user_id as "userId",
      pp.rating,
      pp.completion_rate as "completionRate",
      pp.acceptance_rate as "acceptanceRate",
      pp.responsiveness_score as "responsivenessScore",
      COUNT(a.id) FILTER (WHERE a.status IN ('ACCEPTED', 'IN_PROGRESS')) as "activeAssignmentCount",
      ST_Distance(
        pp.location,
        ST_SetSRID(ST_MakePoint(${params.location.lng}, ${params.location.lat}), 4326)
      ) / 1000.0 as "distanceKm"
    FROM "ProviderProfile" pp
    LEFT JOIN "Assignment" a ON pp.id = a.provider_id AND a.status IN ('ACCEPTED', 'IN_PROGRESS')
    WHERE pp.service_categories @> ARRAY[${params.serviceTypeId}]::text[]
      AND ST_DWithin(
        pp.location,
        ST_SetSRID(ST_MakePoint(${params.location.lng}, ${params.location.lat}), 4326),
        ${radiusKm * 1000} // Convert to meters
      )
      AND NOT EXISTS (
        SELECT 1 FROM jsonb_array_elements(pp.blocked_dates) as bd
        WHERE (bd->>'start')::timestamp <= ${params.preferredDate}
          AND (bd->>'end')::timestamp >= ${params.preferredDate}
      )
    GROUP BY pp.id
    HAVING COUNT(a.id) FILTER (WHERE a.status IN ('ACCEPTED', 'IN_PROGRESS')) < pp.max_concurrent_tasks
  `;
  
  // Calculate weighted scores and sort
  const ranked = providers.map(p => ({
    ...p,
    weightedScore: 
      p.rating * 20 * 0.4 +           // rating 0-5 → 0-100 scale
      p.completionRate * 0.3 +          // already 0-100
      p.acceptanceRate * 0.2 +          // already 0-100
      p.responsivenessScore * 0.1,      // already 0-100
  }));
  
  return ranked.sort((a, b) => b.weightedScore - a.weightedScore);
}
```

**Acceptance Criteria:**
- [ ] Eligibility filter checks all 4 criteria correctly
- [ ] Ranking calculates weighted score (rating 40%, completion 30%, acceptance 20%, responsiveness 10%)
- [ ] Returns ranked list (highest score first)
- [ ] PostGIS distance calculation works (ST_DWithin)
- [ ] Unit tests for ranking algorithm (deterministic outputs)
- [ ] Handles edge cases: no eligible providers, tied scores

**Verification:**
```bash
npm test -- --run src/__tests__/assignments/engine.test.ts
# Test with known provider data and verify ranking order
```

---

### Wave 2: Assignment Core (Depends on Wave 1)

#### Task 2.1: Offer Lifecycle with 6-Hour Window
**Complexity:** High  
**Files to Create/Modify:**
- `src/features/assignments/actions.ts` — Offer creation, acceptance, rejection
- `src/features/assignments/components/OfferCard.tsx` — Display offer to provider
- `src/features/assignments/components/AssignmentList.tsx` — Provider's assignment list
- `src/app/(dashboard)/provider/assignments/page.tsx` — Provider assignments page
- `src/app/(dashboard)/provider/assignments/[id]/page.tsx` — Assignment detail
- `src/core/jobs/boss.ts` — Add offer expiry background job

**Description:**
Implement offer lifecycle: When agreement status is PENDING_ASSIGNMENT, call `findEligibleProviders()`, select top-ranked provider, create Assignment with status OFFERED, set `expiresAt = offeredAt + 6 hours`. Provider can view offer, accept or reject within window. On accept: status → ACCEPTED, `respondedAt = now()`. On reject: status → REJECTED, `respondedAt = now()`, trigger reassignment. On expiry (background job): status → EXPIRED, trigger reassignment.

**Acceptance Criteria:**
- [ ] Assignment created with status OFFERED and 6-hour expiry window
- [ ] Provider can view pending offers on assignments page
- [ ] Accept offer: status → ACCEPTED, respondedAt set
- [ ] Reject offer: status → REJECTED, respondedAt set, reassignment triggered
- [ ] Background job expires offers past expiresAt: status → EXPIRED
- [ ] Agreement status transitions: PENDING_ASSIGNMENT → ASSIGNED on accept
- [ ] pg-boss job runs every minute to check for expired offers

**Verification:**
```bash
npm run dev
# 1. Create agreement (from Phase 1 flow)
# 2. Trigger assignment (status → PENDING_ASSIGNMENT)
# 3. Verify offer created with 6-hour expiry
# 4. Provider accepts → status ACCEPTED
# 5. Test expiry: manually set expiresAt to past, run pg-boss job
```

---

#### Task 2.2: Race-Safe Acceptance Path (Transaction Locking)
**Complexity:** High  
**Files to Create/Modify:**
- `src/features/assignments/actions.ts` — Update acceptOffer with transaction
- `src/__tests__/assignments/race-condition.test.ts` — Race condition test

**Description:**
Implement race-safe offer acceptance using Prisma transaction with `SELECT ... FOR UPDATE` pattern. When provider accepts offer, wrap entire operation in transaction: (1) Re-select assignment with lock: `prisma.$queryRaw("SELECT * FROM \"Assignment\" WHERE id = $1 FOR UPDATE", id)`, (2) Verify status still OFFERED and not expired, (3) Update status to ACCEPTED, (4) Update agreement status to ASSIGNED, (5) Commit. If status changed by concurrent request, transaction fails → return error "Offer already processed".

**Race-Safe Acceptance Code:**
```typescript
// src/features/assignments/actions.ts
export async function acceptOffer(assignmentId: string): Promise<{ success: boolean; error?: string }> {
  'use server';
  const session = await auth();
  if (!session?.user || session.user.role !== 'PROVIDER') {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Lock the assignment row
      const assignments = await tx.$queryRaw<Array<{ id: string; status: string; expires_at: Date }>>`
        SELECT id, status, expires_at FROM "Assignment" WHERE id = ${assignmentId} FOR UPDATE
      `;
      
      if (assignments.length === 0) {
        throw new Error('Assignment not found');
      }
      
      const assignment = assignments[0];
      
      // Verify still offered and not expired
      if (assignment.status !== 'OFFERED') {
        throw new Error(`Offer already ${assignment.status.toLowerCase()}`);
      }
      
      if (new Date() > assignment.expires_at) {
        throw new Error('Offer has expired');
      }
      
      // Update assignment
      await tx.assignment.update({
        where: { id: assignmentId },
        data: {
          status: 'ACCEPTED',
          respondedAt: new Date(),
        },
      });
      
      // Update agreement
      await tx.agreement.update({
        where: { id: assignment.agreementId },
        data: { status: 'ASSIGNED' },
      });
      
      return { success: true };
    });
    
    return result;
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to accept offer' 
    };
  }
}
```

**Acceptance Criteria:**
- [ ] Offer acceptance wrapped in Prisma transaction
- [ ] `SELECT ... FOR UPDATE` locks assignment row
- [ ] Concurrent accept attempts: only one succeeds, other gets error
- [ ] Expiry check inside transaction (prevents accepting expired offers)
- [ ] Double-acceptance race condition test passes (simulate 10 concurrent requests)
- [ ] Transaction rollback on any failure

**Verification:**
```bash
npm test -- --run src/__tests__/assignments/race-condition.test.ts
# Test creates 10 concurrent accept requests, verifies only 1 succeeds
```

---

#### Task 2.3: Auto-Reassignment Cascade
**Complexity:** Medium  
**Files to Create/Modify:**
- `src/features/assignments/actions.ts` — Reassignment logic
- `src/features/assignments/queries.ts` — Get next eligible provider
- `src/core/jobs/boss.ts` — Wire expiry/rejection to reassignment

**Description:**
Implement reassignment cascade: When offer is REJECTED or EXPIRED, (1) Increment `reassignmentCount` on current assignment, (2) Get next eligible provider from ranked list (excluding current provider), (3) Create new Assignment with status OFFERED to next provider, (4) If no eligible providers remain: set agreement status to NO_PROVIDER_FOUND, notify admin. Max reassignment attempts: 3 (configurable).

**Acceptance Criteria:**
- [ ] Rejection triggers reassignment to next ranked provider
- [ ] Expiry triggers reassignment to next ranked provider
- [ ] reassignmentCount increments on each attempt
- [ ] After 3 failed attempts: agreement → NO_PROVIDER_FOUND, admin notified
- [ ] Each reassignment creates new Assignment with fresh 6-hour window
- [ ] Audit event logged for each reassignment

**Verification:**
```bash
npm run dev
# 1. Create agreement, trigger assignment
# 2. Provider 1 rejects → reassignment to Provider 2
# 3. Provider 2 lets offer expire → reassignment to Provider 3
# 4. Provider 3 rejects → reassignment to Provider 4 (if exists)
# 5. After 3 attempts with no accept → NO_PROVIDER_FOUND
```

---

### Wave 3: Task Management (Depends on Wave 2)

#### Task 3.1: Task Generation from Assignment Frequency
**Complexity:** Medium  
**Files to Create/Modify:**
- `src/features/tasks/actions.ts` — Task generation logic
- `src/features/tasks/types.ts` — Task schemas
- `src/features/agreements/types.ts` — Add frequency field to Agreement
- `prisma/schema.prisma` — Add frequency enum to Agreement model
- `src/core/jobs/boss.ts` — Scheduled task generation job

**Description:**
Add `frequency` field to Agreement model (WEEKLY, BI_WEEKLY, MONTHLY). When agreement status → ACTIVE (after provider acceptance), generate first task: status SCHEDULED, scheduledDate = agreement.startDate. Create pg-boss scheduled job that runs daily, checks agreements with ACTIVE status, generates next task based on frequency: WEEKLY (every 7 days), BI_WEEKLY (every 14 days), MONTHLY (every 30 days). Task sequence increments (1, 2, 3...).

**Agreement Model Update:**
```prisma
enum Frequency {
  WEEKLY
  BI_WEEKLY
  MONTHLY
}

model Agreement {
  // ... existing fields ...
  frequency       Frequency @default(WEEKLY)
  startDate       DateTime? // When service starts
  tasks           Task[]    // Tasks generated from this agreement
}
```

**Task Generation Logic:**
```typescript
// src/features/tasks/actions.ts
export async function generateTasksForAgreement(agreementId: string): Promise<void> {
  const agreement = await prisma.agreement.findUnique({
    where: { id: agreementId },
    include: { tasks: { orderBy: { sequence: 'desc' } } },
  });
  
  if (!agreement || agreement.status !== 'ACTIVE') return;
  
  const lastTask = agreement.tasks[0];
  const nextSequence = lastTask ? lastTask.sequence + 1 : 1;
  
  let scheduledDate: Date;
  if (lastTask) {
    const daysToAdd = 
      agreement.frequency === 'WEEKLY' ? 7 :
      agreement.frequency === 'BI_WEEKLY' ? 14 : 30;
    scheduledDate = addDays(lastTask.scheduledDate, daysToAdd);
  } else {
    scheduledDate = agreement.startDate ?? new Date();
  }
  
  await prisma.task.create({
    data: {
      assignmentId: agreement.id, // Note: Need to get active assignment
      sequence: nextSequence,
      status: 'SCHEDULED',
      scheduledDate,
    },
  });
}
```

**Acceptance Criteria:**
- [ ] Agreement has frequency field (WEEKLY, BI_WEEKLY, MONTHLY)
- [ ] Task generated when agreement → ACTIVE
- [ ] Daily job checks and generates next task based on frequency
- [ ] Task sequence increments correctly
- [ ] Scheduled date calculated correctly (7/14/30 days)

**Verification:**
```bash
npm run dev
# 1. Create agreement with WEEKLY frequency
# 2. Provider accepts → agreement ACTIVE
# 3. Verify first task created with scheduledDate = startDate
# 4. Run task generation job → verify second task created 7 days later
```

---

#### Task 3.2: Task Lifecycle (SCHEDULED → IN_PROGRESS → COMPLETED)
**Complexity:** Medium  
**Files to Create/Modify:**
- `src/features/tasks/actions.ts` — Update task status
- `src/features/tasks/components/TaskCard.tsx` — Display task
- `src/features/tasks/components/TaskList.tsx` — Provider task list
- `src/app/(dashboard)/provider/tasks/page.tsx` — Provider tasks page
- `src/app/(dashboard)/provider/tasks/[id]/page.tsx` — Task detail

**Description:**
Implement task lifecycle: Provider can start task (SCHEDULED → IN_PROGRESS), complete task (IN_PROGRESS → COMPLETED). Status transitions logged to audit. Completion requires: completedAt timestamp, optional notes/photos. Owner notified on task completion.

**Acceptance Criteria:**
- [ ] Provider can view scheduled tasks on tasks page
- [ ] Start task: SCHEDULED → IN_PROGRESS, startedAt set
- [ ] Complete task: IN_PROGRESS → COMPLETED, completedAt set
- [ ] Task list shows status with appropriate badges
- [ ] Invalid transitions rejected (e.g., COMPLETED → IN_PROGRESS)
- [ ] Owner receives notification on task completion

**Verification:**
```bash
npm run dev
# 1. Login as provider
# 2. View tasks page, see scheduled tasks
# 3. Start task → status IN_PROGRESS
# 4. Complete task → status COMPLETED
# 5. Login as owner → see completion notification
```

---

#### Task 3.3: Overdue/No-show Automation
**Complexity:** Medium  
**Files to Create/Modify:**
- `src/core/jobs/boss.ts` — Add overdue checking job (runs every hour)
- `src/features/tasks/actions.ts` — Flag at-risk, auto-cancel logic

**Description:**
Implement overdue automation: Hourly background job checks tasks with status IN_PROGRESS or SCHEDULED. If current time > scheduledDate + 2 hours: flag as AT_RISK (flaggedAt set), notify admin. If current time > scheduledDate + 4 hours: auto-cancel task (status → CANCELLED, cancelledAt set), trigger reassignment for remaining tasks in assignment.

**Overdue Check Logic:**
```typescript
// In src/core/jobs/boss.ts
// Hourly overdue check
await boss.work('check-overdue-tasks', async (job) => {
  const now = new Date();
  
  // Flag at-risk (2 hours past scheduled)
  await prisma.task.updateMany({
    where: {
      status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
      scheduledDate: { lte: addHours(now, -2) },
      flaggedAt: null,
    },
    data: {
      status: 'AT_RISK',
      flaggedAt: now,
    },
  });
  
  // Auto-cancel (4 hours past scheduled)
  const overdueTasks = await prisma.task.findMany({
    where: {
      status: { in: ['SCHEDULED', 'IN_PROGRESS', 'AT_RISK'] },
      scheduledDate: { lte: addHours(now, -4) },
    },
    include: { assignment: true },
  });
  
  for (const task of overdueTasks) {
    await prisma.task.update({
      where: { id: task.id },
      data: {
        status: 'CANCELLED',
        cancelledAt: now,
      },
    });
    
    // Trigger reassignment for remaining tasks
    await reassignAssignment(task.assignmentId, 'TASK_AUTO_CANCELLED');
  }
});
```

**Acceptance Criteria:**
- [ ] Hourly job checks for overdue tasks
- [ ] 2 hours past due: task flagged AT_RISK, admin notified
- [ ] 4 hours past due: task CANCELLED, reassignment triggered
- [ ] Cancelled task cannot be restarted
- [ ] Audit event logged for auto-cancellation

**Verification:**
```bash
npm run dev
# 1. Create task with scheduledDate in past (4+ hours ago)
# 2. Run overdue check job
# 3. Verify task status → CANCELLED
# 4. Verify reassignment triggered for assignment
```

---

### Wave 4: Agreement Transitions & Cancellation (Depends on Wave 2)

#### Task 4.1: Agreement Activation on Provider Acceptance
**Complexity:** Medium  
**Files to Create/Modify:**
- `src/features/agreements/actions.ts` — Update agreement status transitions
- `src/features/agreements/types.ts` — Add ACTIVE, ASSIGNED statuses

**Description:**
Implement agreement activation logic: When provider accepts offer (Assignment status → ACCEPTED), update Agreement status: PENDING_ASSIGNMENT → ASSIGNED → ACTIVE. Agreement becomes ACTIVE when: (1) Assignment accepted, (2) Provider starts first task (or immediately after accept, configurable). Generate first task when agreement → ACTIVE.

**Acceptance Criteria:**
- [ ] Assignment accepted → Agreement status → ASSIGNED
- [ ] First task started (or immediately) → Agreement status → ACTIVE
- [ ] First task generated when agreement → ACTIVE
- [ ] Audit events logged for status transitions
- [ ] Owner notified when agreement becomes ACTIVE

**Verification:**
```bash
npm run dev
# 1. Create agreement → PENDING_ASSIGNMENT
# 2. Provider accepts offer → ASSIGNED
# 3. Verify first task generated
# 4. Provider starts first task → ACTIVE
```

---

#### Task 4.2: Cancellation Policy Implementation
**Complexity:** Medium  
**Files to Create/Modify:**
- `src/features/agreements/actions.ts` — Cancel agreement logic
- `src/features/agreements/components/CancelAgreementForm.tsx` — Cancellation form
- `src/features/agreements/types.ts` — Cancellation reason enum

**Description:**
Implement cancellation policy:
- **Pre-acceptance:** Agreement status is QUOTED or PENDING_ASSIGNMENT. Cancel: set status to CANCELLED, no penalty.
- **Post-acceptance (ACTIVE):** Cancel with notice period (24 hours). Set status to CANCELLATION_PENDING, notify provider. After notice period: status → CANCELLED. Optionally apply penalty (configurable % of quoted price).

**Cancellation Logic:**
```typescript
export async function cancelAgreement(
  agreementId: string,
  reason: string,
  cancelledBy: string
): Promise<{ success: boolean; error?: string }> {
  const agreement = await prisma.agreement.findUnique({
    where: { id: agreementId },
    include: { assignment: true },
  });
  
  if (!agreement) return { success: false, error: 'Agreement not found' };
  
  if (['QUOTED', 'PENDING_ASSIGNMENT'].includes(agreement.status)) {
    // Pre-acceptance: no penalty
    await prisma.agreement.update({
      where: { id: agreementId },
      data: { status: 'CANCELLED' },
    });
  } else if (agreement.status === 'ACTIVE') {
    // Post-acceptance: needs notice period
    await prisma.agreement.update({
      where: { id: agreementId },
      data: { 
        status: 'CANCELLATION_PENDING',
        cancellationReason: reason,
        cancellationDate: new Date(),
      },
    });
    // Schedule cancellation after 24h (pg-boss job)
    await scheduleCancellation(agreementId, addHours(new Date(), 24));
  } else {
    return { success: false, error: `Cannot cancel agreement in status: ${agreement.status}` };
  }
  
  await writeAudit({
    actorId: cancelledBy,
    entityType: 'Agreement',
    entityId: agreementId,
    action: 'STATUS_CHANGE',
    oldValue: { status: agreement.status },
    newValue: { status: 'CANCELLED', reason },
  });
  
  return { success: true };
}
```

**Acceptance Criteria:**
- [ ] Pre-acceptance cancellation: no penalty, direct CANCELLED
- [ ] Post-acceptance cancellation: CANCELLATION_PENDING → CANCELLED after 24h
- [ ] Cancellation reason captured and audited
- [ ] Provider notified on cancellation
- [ ] Owner notified on cancellation
- [ ] Invalid cancellations rejected (e.g., already CANCELLED)

**Verification:**
```bash
npm run dev
# 1. Cancel pre-acceptance agreement → CANCELLED immediately
# 2. Cancel active agreement → CANCELLATION_PENDING
# 3. Wait 24h (or mock time) → CANCELLED
# 4. Verify notifications sent to both parties
```

---

### Wave 5: Notifications (Depends on Waves 2, 3, 4)

#### Task 5.1: Notification Templates for Assignment Lifecycle
**Complexity:** Medium  
**Files to Create/Modify:**
- `src/features/notifications/types.ts` — Add assignment notification types
- `src/features/notifications/templates.ts` — Notification templates
- `src/features/assignments/actions.ts` — Trigger notifications
- `src/features/tasks/actions.ts` — Trigger notifications
- `src/integrations/sms/` — Use SMS abstraction for text messages

**Description:**
Create notification templates for assignment lifecycle:
- **Offer sent:** "You have a new service offer. Accept within 6 hours."
- **Offer accepted:** "Provider [Name] has accepted your service agreement."
- **Offer rejected:** "Provider [Name] declined the offer. Searching for another provider."
- **Offer expired:** "Offer expired. Reassigning to next available provider."
- **Reminder (24h before task):** "Reminder: You have a task scheduled tomorrow at [time]."
- **Reminder (1h before task):** "Your task starts in 1 hour."
- **Task completed:** "Provider has completed the scheduled task."
- **Overdue/no-show alert:** "Task is overdue. Admin has been notified."

**Notification Template Example:**
```typescript
// src/features/notifications/templates.ts
export const notificationTemplates = {
  OFFER_SENT: (providerName: string, expiryTime: Date) => ({
    type: 'IN_APP',
    event: 'OFFER_SENT',
    title: 'New Service Offer',
    message: `You have been offered a new service. Please accept or reject by ${format(expiryTime, 'h:mm a')}.`,
    smsMessage: `OPSMP: New service offer received. Accept within 6 hours or it will be reassigned.`,
  }),
  
  TASK_REMINDER_24H: (scheduledTime: Date) => ({
    type: 'IN_APP',
    event: 'TASK_REMINDER',
    title: 'Task Reminder',
    message: `You have a task scheduled for tomorrow at ${format(scheduledTime, 'h:mm a')}.`,
    smsMessage: `OPSMP: Reminder - You have a task tomorrow at ${format(scheduledTime, 'h:mm a')}.`,
  }),
  
  TASK_COMPLETED: (ownerName: string) => ({
    type: 'IN_APP',
    event: 'TASK_COMPLETED',
    title: 'Task Completed',
    message: `Your scheduled task has been completed by the service provider.`,
    smsMessage: `OPSMP: Your service task has been completed.`,
  }),
  // ... more templates
};
```

**Acceptance Criteria:**
- [ ] All notification types have templates (in-app + SMS)
- [ ] Offer sent triggers notification to provider (in-app + SMS)
- [ ] Offer acceptance/rejection triggers notification to owner
- [ ] Reminder notifications scheduled (24h and 1h before task)
- [ ] Task completion triggers notification to owner
- [ ] Overdue/no-show triggers alert to admin
- [ ] SMS sent via abstraction layer (mock for now)

**Verification:**
```bash
npm run dev
# 1. Trigger offer → provider gets notification
# 2. Accept offer → owner gets notification
# 3. Schedule task reminder → notifications sent at 24h and 1h
# 4. Complete task → owner gets notification
# 5. Check SMS sent (check mock/logs)
```

---

### Wave 6: Audit Coverage (Depends on Waves 1-5)

#### Task 6.1: Audit Coverage for Phase 2 Transitions
**Complexity:** Medium  
**Files to Create/Modify:**
- `src/features/audits/writer.ts` — Verify audit writer works
- Integration into all Phase 2 Server Actions:
  - `src/features/assignments/actions.ts` — Log provider selection, offer transitions
  - `src/features/tasks/actions.ts` — Log task transitions
  - `src/features/agreements/actions.ts` — Log cancellation outcomes
- `src/app/(dashboard)/admin/audits/page.tsx` — Verify audit viewer shows Phase 2 events

**Description:**
Ensure all Phase 2 state changes generate audit events:
- **Provider selection:** Log ranked provider list, selected provider, eligibility criteria
- **Assignment transitions:** OFFERED → ACCEPTED/REJECTED/EXPIRED → REASSIGNED
- **Task transitions:** SCHEDULED → IN_PROGRESS → COMPLETED → CANCELLED
- **Cancellation outcomes:** Reason, cancelledBy, penalty applied

**Audit Events to Log:**
```typescript
// Provider selection
await writeAudit({
  actorId: session.user.id,
  entityType: 'Assignment',
  entityId: assignment.id,
  action: 'CREATE',
  newValue: {
    eligibleProviders: rankedProviders.map(p => ({ id: p.providerId, score: p.weightedScore })),
    selectedProvider: rankedProviders[0]?.providerId,
  },
});

// Assignment transition
await writeAudit({
  actorId: session.user.id,
  entityType: 'Assignment',
  entityId: assignment.id,
  action: 'STATUS_CHANGE',
  oldValue: { status: 'OFFERED' },
  newValue: { status: 'ACCEPTED', respondedAt: new Date() },
});

// Task transition
await writeAudit({
  actorId: session.user.id,
  entityType: 'Task',
  entityId: task.id,
  action: 'STATUS_CHANGE',
  oldValue: { status: 'SCHEDULED' },
  newValue: { status: 'IN_PROGRESS', startedAt: new Date() },
});
```

**Acceptance Criteria:**
- [ ] Provider selection logged with ranking details
- [ ] All assignment status changes logged (offered, accepted, rejected, expired, reassigned)
- [ ] All task status changes logged
- [ ] Cancellation outcomes logged with reason and penalty
- [ ] Audit viewer (from Phase 1) shows Phase 2 events
- [ ] Audit events include actorId, timestamp, old/new values

**Verification:**
```bash
npm run dev
# 1. Complete assignment flow (offer → accept → task → complete)
# 2. Visit /admin/audits
# 3. Verify all events logged with correct details
# 4. Check audit event payloads have all required fields
```

---

### Wave 7: Verification (Depends on Waves 1-6)

#### Task 7.1: End-to-End Provider Assignment Flow Test
**Complexity:** High  
**Files to Create/Modify:**
- `src/__tests__/e2e/provider-assignment-flow.test.ts` — E2E test script
- Manual test checklist (documented below)

**Description:**
Execute complete provider assignment flow: Owner creates agreement → System assigns to provider → Provider accepts → Task generated → Provider completes task. Test reassignment: Provider rejects → Next provider selected → Accepts. Test race condition: Multiple providers accept simultaneously → Only one succeeds.

**Manual Test Checklist:**
- [ ] **Pre-setup:** Register owner, onboard property, create agreement (Phase 1 flow)
- [ ] **Provider 1:** Register as provider, complete profile with service categories
- [ ] **Provider 2:** Register second provider with different location/rating
- [ ] **Assignment:** Agreement → PENDING_ASSIGNMENT, system selects Provider 1 (top ranked)
- [ ] **Offer sent:** Provider 1 receives notification (in-app + SMS)
- [ ] **Accept offer:** Provider 1 accepts → Assignment ACCEPTED, Agreement ASSIGNED
- [ ] **Task generated:** First task created with SCHEDULED status
- [ ] **Task lifecycle:** Provider starts task → IN_PROGRESS, completes → COMPLETED
- [ ] **Owner notified:** Receives completion notification
- [ ] **Reassignment test:** Reset, have Provider 1 reject → Provider 2 gets offer
- [ ] **Race condition test:** Simulate concurrent accept requests → Only one succeeds

**Verification:**
```bash
# Run automated E2E tests
npm test -- --run src/__tests__/e2e/provider-assignment-flow.test.ts

# Complete manual checklist above
# Document any failures or bugs
```

---

#### Task 7.2: Exit Criteria Final Verification
**Complexity:** Low  
**Files:** (Verification only, no code changes)

**Description:**
Verify all Week 2 exit criteria are met. Complete the checklist below. If any criterion fails, create follow-up tasks.

**Exit Criteria Checklist:**

- [ ] **Criterion 1:** Agreement can be assigned to provider with auto-reassignment if rejected/expired
  - [ ] Provider eligibility filter works (service category, location, workload, blocked dates)
  - [ ] Ranking algorithm returns correctly weighted scores
  - [ ] Offer created with 6-hour acceptance window
  - [ ] Rejection triggers reassignment to next provider
  - [ ] Expiry triggers reassignment to next provider
  - [ ] Max 3 reassignment attempts, then NO_PROVIDER_FOUND

- [ ] **Criterion 2:** Task lifecycle can run for at least one scheduled service
  - [ ] Task generated from assignment frequency (weekly/bi-weekly/monthly)
  - [ ] Task status: SCHEDULED → IN_PROGRESS → COMPLETED works
  - [ ] Task completion notification sent to owner
  - [ ] Overdue automation: 2h flag, 4h auto-cancel + reassignment

- [ ] **Criterion 3:** Double-acceptance race condition test passes
  - [ ] Transaction locking implemented with `SELECT ... FOR UPDATE`
  - [ ] Concurrent accept requests: only one succeeds
  - [ ] Race condition test passes with 10+ concurrent requests
  - [ ] Failed concurrent requests get appropriate error message

- [ ] **Additional Verification:**
  - [ ] Agreement activation on provider acceptance works
  - [ ] Cancellation policy implemented (pre/post-acceptance)
  - [ ] Notification templates sent for all lifecycle events
  - [ ] All Phase 2 state changes generate audit events

**Verification:**
```bash
# Complete all checklists above
# Run all Phase 2 tests
npm test -- --run src/__tests__/assignments/ src/__tests__/tasks/ src/__tests__/e2e/

# If any item fails, document and create fix tasks
echo "Phase 2 Exit Criteria Verification Complete"
```

---

## Dependency Graph

```
Phase 1 (Platform Foundation) — MUST BE COMPLETE
├── User registration, properties, quotes, agreements (QUOTED → PENDING_ASSIGNMENT)
└── Design system, notifications foundation, audit writer

Wave 1: Provider Foundation (Depends on Phase 1)
├── Task 1.1: Provider Profile & Eligibility Models (DB schema)
├── Task 1.2: Provider Registration & Profile Management
└── Task 1.3: Assignment Engine Foundation (Eligibility + Ranking)

Wave 2: Assignment Core (Depends on Wave 1)
├── Task 2.1: Offer Lifecycle with 6-Hour Window (needs 1.3)
├── Task 2.2: Race-Safe Acceptance Path (needs 2.1)
└── Task 2.3: Auto-Reassignment Cascade (needs 2.1, 2.2)

Wave 3: Task Management (Depends on Wave 2)
├── Task 3.1: Task Generation from Frequency (needs 2.1)
├── Task 3.2: Task Lifecycle (needs 3.1)
└── Task 3.3: Overdue/No-show Automation (needs 3.2)

Wave 4: Agreement Transitions (Depends on Wave 2)
├── Task 4.1: Agreement Activation (needs 2.1)
└── Task 4.2: Cancellation Policy (needs 4.1)

Wave 5: Notifications (Depends on Waves 2, 3, 4)
└── Task 5.1: Notification Templates (needs 2.1, 3.2, 4.2)

Wave 6: Audit Coverage (Depends on Waves 1-5)
└── Task 6.1: Phase 2 Audit Integration (needs all previous)

Wave 7: Verification (Depends on Waves 1-6)
├── Task 7.1: End-to-End Provider Assignment Flow Test
└── Task 7.2: Exit Criteria Final Verification
```

---

## File Creation Summary

| Task | Files Created | Files Modified |
|------|---------------|----------------|
| 1.1 | (Prisma schema update) | `prisma/schema.prisma`, `src/features/providers/types.ts`, `queries.ts`, `actions.ts` |
| 1.2 | Provider forms, pages, components | `src/features/providers/*` (all files) |
| 1.3 | Assignment engine, ranking logic | `src/features/assignments/engine.ts`, `types.ts` |
| 2.1 | Offer components, assignment pages | `src/features/assignments/*`, `src/core/jobs/boss.ts` |
| 2.2 | Race condition test | `src/features/assignments/actions.ts`, `src/__tests__/assignments/race-condition.test.ts` |
| 2.3 | Reassignment logic | `src/features/assignments/actions.ts`, `queries.ts` |
| 3.1 | Task generation logic | `src/features/tasks/actions.ts`, `types.ts`, `prisma/schema.prisma` |
| 3.2 | Task components, pages | `src/features/tasks/*` (all files) |
| 3.3 | Overdue automation | `src/core/jobs/boss.ts`, `src/features/tasks/actions.ts` |
| 4.1 | Agreement activation | `src/features/agreements/actions.ts`, `types.ts` |
| 4.2 | Cancellation form, logic | `src/features/agreements/actions.ts`, components |
| 5.1 | Notification templates | `src/features/notifications/templates.ts`, integration |
| 6.1 | Audit integration | All Phase 2 `actions.ts` files |
| 7.1 | E2E test script | `src/__tests__/e2e/provider-assignment-flow.test.ts` |
| 7.2 | (verification only) | (verification only) |

---

## Conventions to Follow

- **Components:** PascalCase (`ProviderProfileForm.tsx`, `TaskCard.tsx`)
- **Utilities/Actions:** camelCase (`actions.ts`, `queries.ts`, `engine.ts`)
- **Server Actions:** `'use server'` directive at top of file
- **Client Components:** `'use client'` directive where needed (forms, hooks)
- **Validation:** Zod schemas with `@hookform/resolvers`
- **Data Fetching:** Server Components + Server Actions (no API routes for mutations)
- **Styling:** Tailwind CSS utility classes with brand tokens
- **Tests:** Co-located `.test.tsx` or `src/__tests__/` directory
- **Imports:** Absolute with `@/` alias, organized: React → Third-party → Internal
- **Transactions:** Use Prisma `$transaction` with `$queryRaw` for `FOR UPDATE` locking
- **PostGIS:** Use raw SQL for geospatial queries (`ST_DWithin`, `ST_Distance`)
- **Background Jobs:** pg-boss with cron patterns for scheduled tasks
- **Audit Events:** All state changes logged via `writeAudit()`

---

## Next Steps

After PLAN.md is created:

1. **Review this plan** with the team/user
2. **Verify Phase 1 is complete** before starting Phase 2
3. **Execute tasks in wave order** (Wave 1 → Wave 2 → ...)
4. **Commit after each task** with descriptive messages
5. **Run tests frequently:** `npm test -- --run`
6. **Verify exit criteria** at the end of Wave 7

```bash
# To execute this phase:
# /gsd-execute-phase 02
```
