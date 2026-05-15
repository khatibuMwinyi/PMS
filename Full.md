SOFTWARE REQUIREMENTS DOCUMENT (SRD)
Oweru Property Service Management Platform (OPSMP)
________________________________________
I. System Overview
The Oweru Property Service Management Platform is a web-based system designed to manage recurring property services across multiple properties owned by clients.
The system enables property owners to register properties and select required services. Oweru acts as the sole service provider to property owners. Internally, Oweru coordinates verified service providers to fulfill these services. Property owners interact exclusively with Oweru; they have no visibility into or direct contractual relationship with individual service providers.
The platform handles service orchestration, automated pricing, internal provider assignment, financial management, utility tracking, and analytics.
Technical Stack: Next.js 16 (App Router), TypeScript, PostgreSQL via Neon, Prisma ORM, Auth.js authentication, Vercel hosting.
________________________________________
II. System Objectives
The system aims to provide a scalable and automated solution for managing recurring property services.
It eliminates manual negotiation by introducing a rule-based pricing engine with 24-hour price locks, ensures efficient service delivery through intelligent provider selection with availability checking, and enables transparent financial tracking for both Oweru and property owners.
________________________________________
III. Stakeholders
Oweru Company is the sole legal service provider to property owners, operating the platform, processing all payments, coordinating provider fulfillment, and managing all service contracts.
Property Owners manage multiple properties, request services from Oweru, view costs instantly, pay Oweru directly, and access financial analytics. Owners have no direct interaction or contractual relationship with service providers.
Service Providers are independent contractors engaged by Oweru to fulfill service orders. They accept assignments from Oweru (not from owners), maintain availability calendars, execute tasks, and receive payment from Oweru (80% of service fee). Providers have no visibility of or contact with property owners.
Staff Members supervise operational workflows, handle disputes, and manage provider verification without access to sensitive personal data.
Administrators manage system configuration, provider verification, financial oversight, and secure data access.
________________________________________
IV. User Roles and Access Control
Administrators have full system access, including visibility of sensitive information such as contact details of property owners and service providers.
Staff Members manage operational workflows such as monitoring assignments and service execution. They are restricted from accessing sensitive contact information and see masked data (e.g., +255 7*** ****).
Property Owners can manage their properties, request services from Oweru, view pricing, receive invoices from Oweru, make payments to Oweru, and access analytics. Cannot see provider identities or contact details.
Service Providers can view assignment offers from Oweru, accept internal work orders, manage availability calendars, execute tasks, and track earnings from Oweru. Cannot see property owner identities or contact details.
All interactions between owners and providers are mediated exclusively through Oweru.
________________________________________
V. Multi-Property Management
Property owners can register and manage multiple properties under a single account.
Each property operates independently in terms of services, billing, and analytics.
Properties with multiple units (apartments) can configure services per unit or per building, with pricing adjusted accordingly.
________________________________________
VI. Property Onboarding
Property owners submit property details including location, type, number of units, and supporting images.
The system validates and stores the property. Approved properties become eligible for service requests.
________________________________________
VII. Service Selection and Pricing Engine
Property owners select services required for each property or unit from Oweru's service catalog.
The system calculates service costs instantly using a rule-based pricing engine based on number of units, service frequency, location, and service type.
Pricing Lock: Calculated prices are locked for 24 hours. If the owner does not submit the request within 24 hours, the quote expires and must be recalculated.
Displayed pricing is final and binding upon submission.
________________________________________
VIII. Contract Model
Service Agreement Structure:
•	Between Property Owner and Oweru: The property owner enters into a service agreement with Oweru Company only. Oweru is the sole legal entity responsible for service delivery.
•	Between Oweru and Service Provider: Oweru internally assigns fulfillment to verified service providers through work orders. Providers contract with Oweru, not with property owners.
Agreement Formation:
1.	Owner submits service request to Oweru (accepts displayed price).
2.	Oweru system identifies and offers internal work order to selected provider (6-hour acceptance window).
3.	Provider accepts the work order from Oweru.
4.	Oweru confirms service activation to the owner.
5.	No direct contract exists between owner and provider.
Cancellation Rules:
•	Before provider acceptance of work order: Owner may cancel request with no penalty.
•	After provider acceptance:
•	Owner cancels: 20% penalty applies (15% compensates provider via Oweru, 5% to Oweru platform).
•	Provider no-show: Work order terminated, provider receives strike.
________________________________________
IX. Service Structure
Each service request creates an independent service order under the owner-Oweru agreement.
Each service order is fulfilled internally by Oweru through assignment to a specific service provider.
Services operate in parallel. Failure or delay in one service does not affect others.
________________________________________
X. Provider Registration and Verification
Service providers register as independent contractors for Oweru by submitting required personal or business information, service categories, operational locations, and availability schedules.
Administrators verify providers before they become eligible for internal work order assignment.
New providers are introduced with a baseline performance score and receive priority placement in 20% of assignments to ensure fairness.
________________________________________
XI. Provider Recommendation Engine
The system selects providers for internal fulfillment using a ranking algorithm.
Provider Scoring:
•	Rating (40%)
•	Completion rate (30%)
•	Acceptance rate (20%)
•	Responsiveness (10%)
Availability Check: System filters providers based on:
•	Service category and location
•	Existing schedule conflicts
•	Maximum concurrent assignments (default: 3 active assignments per provider)
•	Blocked dates (vacation/time-off)
________________________________________
XII. Internal Assignment and Work Order Acceptance
Work Order Lifecycle (Internal to Oweru):
1.	Pending Acceptance: System sends internal work order offer to top-ranked provider. Provider sees service details, schedule, and payment amount (80% of total price collected from owner). Offer valid for 6 hours.
2.	Accepted: Provider accepts work order from Oweru. Oweru confirms service activation to owner.
3.	Scheduled: Task generated based on service frequency.
4.	In Progress: Provider checks in at property (address provided by Oweru system).
5.	Completed: Provider submits completion evidence through Oweru platform.
6.	Verified: Owner confirms satisfaction via Oweru platform or auto-approves after 24 hours.
7.	Cancelled: Work order terminated by Oweru (owner request) or system (no-show).
Rejection Handling: If a provider rejects or does not respond within 6 hours, the system automatically selects the next best provider.
________________________________________
XIII. Task Scheduling and Execution
Accepted work orders generate service tasks based on defined schedules (weekly, bi-weekly, monthly).
Service providers execute tasks and update status via Oweru platform.
Overdue Handling: Tasks not marked complete within 2 hours of scheduled time are flagged as overdue. After 4 hours, the work order is auto-cancelled and reassigned to a new provider.
________________________________________
XIV. Invoice Generation
Oweru invoices the Property Owner.
Invoices are generated after successful provider allocation and acceptance (work order confirmed).
Each service generates a separate invoice from Oweru to the owner reflecting the total service cost.
Invoice is submitted to the property owner for payment to Oweru.
________________________________________
XV. Payment Processing
Property Owners pay Oweru. Payments are processed through Selcom integration (mobile money).
Upon successful payment to Oweru:
•	Invoice marked as paid
•	Revenue distribution by Oweru:
•	20% retained by Oweru (platform commission)
•	80% credited to Service Provider's internal wallet
Failed payments keep invoices in pending state. After 3 failed attempts, the service is suspended.
________________________________________
XVI. Revenue Model
Oweru collects 100% of service fees from owners and retains 20% as commission.
Oweru pays providers 80% of the service fee upon successful task completion.
Provider earnings are available for withdrawal immediately after task verification.
________________________________________
XVII. Provider Wallet System
Service providers have internal wallets tracking earnings owed by Oweru (80% of each service fee).
Providers can request withdrawals after reaching minimum threshold (50,000 TZS).
Withdrawals processed by Oweru within 24 hours to provider's mobile money.
Transaction history includes earnings, withdrawals, and penalties.
________________________________________
XVIII. Utility Management
Utility costs (water, electricity) are managed separately from Oweru services.
Utility bills are recorded manually and distributed among tenants using configurable allocation methods (per unit, per person, or square footage).
Utility expenses are tracked and included in financial analytics.
________________________________________
XIX. Owner Analytics
The system provides property owners with financial insights across all their properties.
Analytics include total service costs paid to Oweru, utility expenses, and overall property costs.
________________________________________
XX. Parallel Service Execution
Multiple services under a single property operate independently.
Each service maintains its own internal provider assignment, execution, and completion lifecycle.
Delays or failures in one service do not affect others.
________________________________________
XXI. Security and Data Privacy
The system enforces strict role-based access control.
Isolation Principle: Property owner data (names, contacts, addresses) is never visible to providers. Provider data (names, contacts, personal details) is never visible to owners. All communication occurs through Oweru platform messaging.
Sensitive data is encrypted (AES-256) and accessible only to administrators. Staff view masked data.
Audit Trail: All state changes (price updates, assignments, status changes, payments) are logged with timestamps and user IDs for 7 years.
________________________________________
XXII. Exception Handling
Provider Rejection: Automatic re-selection to next ranked provider within 6-hour windows until accepted.
No-Show: Provider fails to check in within 2 hours of scheduled time. Task flagged as overdue. After 4 hours, work order auto-cancelled, provider receives strike (3 strikes = 30-day suspension), new provider assigned by Oweru.
Payment Failure: Invoice remains pending, owner notified. Service suspended after 7 days unpaid.
Disputes:
•	Owner may dispute completed tasks through Oweru within 24 hours of completion.
•	Oweru Staff reviews evidence within 48 hours.
•	Resolution: Refund to owner (full or partial) or payment release to provider (via Oweru).
________________________________________
XXIII. Non-Functional Requirements
Performance: Pricing calculations complete within 200ms. Page loads under 2 seconds.
Availability: 99.9% uptime.
Scalability: Support for 10,000 properties without architecture changes.
Data Retention: Financial records 7 years, system logs 90 days, deleted accounts anonymized after 3 years.

PRODUCTION-READY SYSTEM DESIGN DOCUMENT
Oweru Property Service Management Platform (OPSMP)
Version: 2.0
Date: October 2025
Classification: Internal Use Only
________________________________________
I. EXECUTIVE SUMMARY
Oweru operates as a managed service marketplace where property owners contract exclusively with Oweru for property services, while Oweru fulfills these contracts through an internal network of verified service providers. The platform handles the full lifecycle: discovery, pricing, contract formation, service execution, and financial settlement (80% to providers, 20% platform commission).
Core Business Constraint: Zero direct interaction between property owners and service providers. All coordination, communication, and financial exchange are mediated through Oweru.
________________________________________
II. ARCHITECTURE PRINCIPLES
1.	Financial Consistency Over Availability: The 80/20 revenue split must be atomic. Temporary unavailability is acceptable; financial inconsistency is not.
2.	Privacy by Design: Property owner identities and provider identities are cryptographically isolated. Staff operate on anonymized data masks.
3.	Eventual Consistency for Analytics, Strong Consistency for Money: Payment processing uses serializable isolation; analytics and ratings use read replicas.
4.	Graceful Degradation: If provider matching fails, the system queues for manual staff intervention rather than failing silently.
5.	Immutable Audit: Every state change creates an append-only log entry with cryptographic integrity (hash chain).
________________________________________
III. DOMAIN ARCHITECTURE
3.1 Entity Boundaries
ServiceAgreement (Owner ↔ Oweru)
•	Legal contract entity. Owner pays Oweru 100% of quoted price.
•	Immutable pricing post-acceptance (24-hour quote lock).
•	Cancellation penalties: 0% if pre-assignment, 20% if post-assignment (15% to provider as compensation, 5% to platform).
Assignment (Oweru ↔ Provider)
•	Internal work order. Provider receives 80% of collected fee.
•	6-hour acceptance window with automatic reassignment cascade.
•	Finite state machine with 7 terminal states.
Task (Execution Instance)
•	Recurring instantiation of an Assignment based on frequency (weekly/bi-weekly/monthly).
•	GPS-verified check-in (200m radius).
•	Evidence requirements: Minimum 3 geotagged images.
3.2 State Machines
Assignment State Machine
text
PENDING_ACCEPTANCE ──[Accept]──> ACCEPTED ──[Schedule]──> SCHEDULED ──[Check-in]──> IN_PROGRESS ──[Complete]──> COMPLETED ──[Verify]──> VERIFIED
        │                              │                       │                          │
        └──[Expire/Reject]──> EXPIRED  └──[Owner Cancel]       │                          ├──[Dispute]──> DISPUTED ──[Resolve]──> VERIFIED
                                      (20% penalty)            └──[No-show 4h]──> CANCELLED_NO_SHOW (Strike +1)
Financial Transaction State Machine
text
PENDING ──[Success]──> COMPLETED
   │
   ├──[Failure]──> FAILED ──[Retry 3x]──> FAILED_PERMANENT (Alert Finance Team)
   │
   └──[Timeout 30s]──> TIMEOUT (Idempotency check before retry)
________________________________________
IV. DATA ARCHITECTURE
4.1 Storage Strategy
Data Class	Storage	Retention	Encryption
PII (Phone, ID)	PostgreSQL	7 years post-deletion	AES-256-GCM at application layer
Financial Transactions	PostgreSQL	10 years (regulatory)	Field-level encryption + TDE
Property Images	Object Storage (S3/Blob)	Lifecycle to glacier after 1 year	Server-side encryption
Audit Logs	PostgreSQL (partitioned monthly)	Indefinite	Immutable, signed with HMAC
Session Tokens	Redis (Upstash)	30 days	SHA-256 hashed
4.2 Consistency Models
•	Strong Consistency: Wallet transactions, invoice status, assignment state transitions.
•	Eventual Consistency: Provider ranking scores, analytics dashboards, notification delivery.
________________________________________
V. SECURITY ARCHITECTURE
5.1 Access Control Matrix
Role	Owner PII	Provider PII	Financial Data	Assignment Details	System Config
Administrator	Full	Full	Full	Full	Full
Staff	Masked (****)	Masked	Read-only	Operational	None
Property Owner	Own record only	None	Own invoices only	Own properties only	None
Service Provider	None	Own record only	Own wallet only	Assigned tasks only	None
5.2 Communication Isolation
•	All messaging routed through CommunicationBridge table.
•	Content scanning for PII leakage (phone numbers, emails).
•	Automatic masking of potential contact info in chat messages.
5.3 Fraud Detection
•	Geospatial Anomaly: Check-in location > 500m from property address triggers flag.
•	Velocity Check: > 3 assignment acceptances in 1 hour by single provider triggers review.
•	Payment Anomaly: Invoice payment from different country than property location requires 3DS verification.
________________________________________
VI. FINANCIAL ARCHITECTURE
6.1 Revenue Flow
1.	Owner pays Oweru 100% (via Selcom mobile money).
2.	Selcom webhook received (idempotent processing).
3.	Atomic split:
•	80% → Provider Wallet (available for withdrawal after 24h hold).
•	20% → Oweru Revenue Account.
4.	Provider withdrawal request → Reviewed (anti-money laundering check) → Mobile money payout within 24h.
6.2 Failure Handling
•	Partial Success: If provider credit succeeds but platform revenue record fails, saga compensates by debiting provider and refunding owner.
•	Webhook Loss: Reconciliation job runs every 6 hours comparing Selcom ledger vs. Oweru invoices.
________________________________________
VII. OPERATIONAL REQUIREMENTS
7.1 Scalability Targets
•	Concurrent Users: 5,000 active sessions.
•	Provider Matching: < 200ms p99 for radius search.
•	Payment Processing: < 3s end-to-end (Selcom API + internal split).
•	Image Upload: < 5s for 5MB batch.
7.2 Availability SLA
•	Platform: 99.9% uptime (8.76h downtime/year acceptable).
•	Payment Processing: 99.99% (critical path).
•	Scheduled Maintenance: Tuesday 02:00-04:00 EAT (low activity window).
7.3 Disaster Recovery
•	RPO (Recovery Point Objective): 5 minutes (continuous WAL archiving).
•	RTO (Recovery Time Objective): 1 hour (automated failover to Neon read replica).
•	Backup Strategy: Daily full snapshots + continuous incremental.
________________________________________
VIII. COMPLIANCE & GOVERNANCE
8.1 Data Retention
•	Active Accounts: Indefinite retention.
•	Deleted Accounts: Soft delete → Anonymization after 90 days → Physical purge after 3 years.
•	Audit Logs: Immutable, retained for 10 years.
8.2 Regulatory
•	Tax Reporting: Automatic generation of 1099-K equivalents for providers earning > 2M TZS annually.
•	KYC: Provider ID verification required before first withdrawal.

PRODUCTION-READY ENGINEERING SPECIFICATION
OPSMP Implementation Architecture
Version: 2.0
Stack: Next.js 16 (App Router) | TypeScript 5.3 | PostgreSQL 15 (Neon) | Prisma 5.x | Redis (Upstash)
________________________________________
I. DATABASE SCHEMA (Prisma)
prisma
generator client {
  provider = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions", "fullTextSearch"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  extensions = [pgcrypto, uuid_ossp, postgis]
}

// --- CORE IDENTITY ---
enum UserRole { ADMIN STAFF OWNER PROVIDER }
enum UserStatus { ACTIVE SUSPENDED PENDING_VERIFICATION }

model User {
  id            String    @id @default(uuid())
  email         String    @unique
  phone         String    @unique
  passwordHash  String    @map("password_hash")
  role          UserRole
  status        UserStatus @default(PENDING_VERIFICATION)
  createdAt     DateTime  @default(now()) @map("created_at")
  deletedAt     DateTime? @map("deleted_at")
  
  ownerProfile    OwnerProfile?
  providerProfile ProviderProfile?
  sessions        Session[]
  
  @@index([role, status])
  @@map("users")
}

model Session {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  token     String   @unique
  expiresAt DateTime @map("expires_at")
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@map("sessions")
}

// --- PROFILES ---
model OwnerProfile {
  id          String    @id @default(uuid())
  userId      String    @unique @map("user_id")
  firstName   String    @map("first_name")
  lastName    String    @map("last_name")
  encryptedId String?   @map("encrypted_id") // AES-256 encrypted
  encryptedAddress String? @map("encrypted_address")
  
  user        User      @relation(fields: [userId], references: [id])
  properties  Property[]
  agreements  ServiceAgreement[]
  @@map("owner_profiles")
}

enum VerificationStatus { PENDING VERIFIED REJECTED SUSPENDED }

model ProviderProfile {
  id              String    @id @default(uuid())
  userId          String    @unique @map("user_id")
  businessName    String    @map("business_name")
  verification    VerificationStatus @default(PENDING)
  serviceRadius   Int       @default(10) @map("service_radius_km")
  maxConcurrent   Int       @default(3) @map("max_concurrent")
  currentLoad     Int       @default(0) @map("current_workload")
  baseScore       Float     @default(50)
  strikeCount     Int       @default(0) @map("strike_count")
  suspendedUntil  DateTime? @map("suspended_until")
  location        Unsupported("geometry")? // PostGIS point
  
  user            User      @relation(fields: [userId], references: [id])
  wallet          ProviderWallet?
  assignments     Assignment[]
  
  @@index([location], type: Gist)
  @@index([verification, baseScore])
  @@map("provider_profiles")
}

// --- PROPERTY MANAGEMENT ---
model Property {
  id          String    @id @default(uuid())
  ownerId     String    @map("owner_id")
  type        PropertyType
  encryptedAddress String @map("encrypted_address")
  location    Unsupported("geometry")
  unitCount   Int       @default(1) @map("unit_count")
  images      String[]
  status      PropertyStatus @default(ACTIVE)
  
  owner       OwnerProfile @relation(fields: [ownerId], references: [id])
  agreements  ServiceAgreement[]
  
  @@index([ownerId])
  @@index([location], type: Gist)
  @@map("properties")
}

enum PropertyType { APARTMENT_BUILDING SINGLE_FAMILY TOWNHOUSE COMMERCIAL }
enum PropertyStatus { ACTIVE INACTIVE }

// --- SERVICE & CONTRACTS ---
model ServiceType {
  id          String    @id @default(uuid())
  name        String    @unique
  basePrice   Decimal   @map("base_price") @db.Decimal(10,2)
  priceUnit   PriceUnit
  rules       Json?     // {frequencyMultipliers: {}, locationFactors: {}}
  @@map("service_types")
}

enum PriceUnit { PER_SQM PER_UNIT FLAT PER_BEDROOM }

enum AgreementStatus { 
  QUOTED          // Price calculated, not yet submitted
  PENDING_ASSIGNMENT // Submitted, finding provider
  ACTIVE          // Provider assigned
  SUSPENDED       // Payment failure
  CANCELLED 
  COMPLETED 
}

model ServiceAgreement {
  id            String          @id @default(uuid())
  ownerId       String          @map("owner_id")
  propertyId    String          @map("property_id")
  serviceTypeId String          @map("service_type_id")
  
  quotedPrice   Decimal         @map("quoted_price") @db.Decimal(10,2)
  priceLockedUntil DateTime     @map("price_locked_until")
  frequency     String          // weekly, biweekly, monthly
  
  status        AgreementStatus
  createdAt     DateTime        @default(now()) @map("created_at")
  
  assignment    Assignment?
  invoice       Invoice?
  
  @@index([status, priceLockedUntil])
  @@map("service_agreements")
}

// --- ASSIGNMENT LIFECYCLE ---
enum AssignmentStatus {
  PENDING_ACCEPTANCE
  ACCEPTED
  SCHEDULED
  IN_PROGRESS
  COMPLETED
  DISPUTED
  VERIFIED
  EXPIRED
  REJECTED
  CANCELLED_BY_OWNER
  CANCELLED_NO_SHOW
}

model Assignment {
  id              String            @id @default(uuid())
  agreementId     String            @unique @map("agreement_id")
  providerId      String            @map("provider_id")
  
  // Financials
  providerPayout  Decimal           @map("provider_payout") @db.Decimal(10,2) // 80%
  platformFee     Decimal           @map("platform_fee") @db.Decimal(10,2)    // 20%
  
  status          AssignmentStatus
  offerExpiresAt  DateTime          @map("offer_expires_at") // NOW + 6 hours
  acceptedAt      DateTime?         @map("accepted_at")
  scheduledDate   DateTime?         @map("scheduled_date")
  completedAt     DateTime?         @map("completed_at")
  
  // Execution proof
  checkInLocation Unsupported("geometry")? @map("check_in_location")
  completionPhotos String[]           @map("completion_photos")
  
  // Dispute
  disputedAt      DateTime?           @map("disputed_at")
  disputeReason   String?             @map("dispute_reason")
  disputeResolved DateTime?           @map("dispute_resolved_at")
  resolution      DisputeResolution?  @map("dispute_resolution")
  
  agreement       ServiceAgreement    @relation(fields: [agreementId], references: [id])
  provider        ProviderProfile     @relation(fields: [providerId], references: [id])
  tasks           Task[]
  
  @@index([providerId, status])
  @@index([status, offerExpiresAt]) // For expiration cron
  @@map("assignments")
}

enum DisputeResolution { PROVIDER_FAULT OWNER_FAULT SPLIT }

enum TaskStatus { SCHEDULED NOTIFIED_24H NOTIFIED_1H IN_PROGRESS COMPLETED OVERDUE }

model Task {
  id            String      @id @default(uuid())
  assignmentId  String      @map("assignment_id")
  scheduledFor  DateTime    @map("scheduled_for")
  status        TaskStatus
  
  assignment    Assignment  @relation(fields: [assignmentId], references: [id])
  @@unique([assignmentId, scheduledFor])
  @@index([scheduledFor, status])
  @@map("tasks")
}

// --- FINANCIAL ---
enum InvoiceStatus { PENDING PAID FAILED CANCELLED }

model Invoice {
  id            String        @id @default(uuid())
  agreementId   String        @unique @map("agreement_id")
  amount        Decimal       @db.Decimal(10,2)
  status        InvoiceStatus
  paidAt        DateTime?     @map("paid_at")
  paymentRef    String?       @map("payment_reference")
  attempts      Int           @default(0)
  
  @@index([status])
  @@map("invoices")
}

model ProviderWallet {
  id              String    @id @default(uuid())
  providerId      String    @unique @map("provider_id")
  available       Decimal   @default(0) @db.Decimal(10,2)
  pending         Decimal   @default(0) @db.Decimal(10,2) // In dispute/hold
  totalEarned     Decimal   @default(0) @map("total_earned") @db.Decimal(10,2)
  version         Int       @default(0) // Optimistic locking
  
  transactions    WalletTransaction[]
  @@map("provider_wallets")
}

enum TransactionType { EARNING WITHDRAWAL ADJUSTMENT PENALTY }

model WalletTransaction {
  id          String   @id @default(uuid())
  walletId    String   @map("wallet_id")
  type        TransactionType
  amount      Decimal  @db.Decimal(10,2)
  assignmentId String? @map("assignment_id")
  runningBalance Decimal @map("running_balance") @db.Decimal(10,2)
  createdAt   DateTime @default(now()) @map("created_at")
  
  wallet      ProviderWallet @relation(fields: [walletId], references: [id})
  @@index([walletId, createdAt])
  @@map("wallet_transactions")
}

// --- AUDIT (Immutable) ---
enum AuditAction { CREATED UPDATED DELETED STATUS_CHANGED PAYMENT_RECEIVED }

model AuditLog {
  id          String   @id @default(uuid())
  actorId     String   @map("actor_id")
  action      AuditAction
  entityType  String   @map("entity_type"
  entityId    String   @map("entity_id")
  oldValues   Json?    @map("old_values")
  newValues   Json?    @map("new_values"
  createdAt   DateTime @default(now()) @map("created_at")
  
  @@index([entityType, entityId, createdAt])
  @@map("audit_logs")
}
________________________________________
II. API CONTRACTS
2.1 Selcom Webhook (Idempotent)
TypeScript
// Schema: schemas/selcom.ts
export const SelcomWebhookSchema = z.object({
  order_id: z.string(), // Our Invoice ID
  reference: z.string(), // Selcom TXN ID
  amount: z.number(),
  currency: z.literal('TZS'),
  status: z.enum(['SUCCESS', 'FAILED']),
  timestamp: z.string().datetime(),
  signature: z.string()
}).transform(t => ({ ...t, idempotencyKey: `${t.order_id}-${t.reference}` }))

// Handler: app/api/webhooks/selcom/route.ts
export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get('x-selcom-signature')
  
  if (!verifyHMAC(body, signature, process.env.SELCOM_SECRET)) {
    return new Response('Invalid', { status: 401 })
  }
  
  const payload = SelcomWebhookSchema.parse(JSON.parse(body))
  
  // Idempotency guard
  const exists = await prisma.processedWebhook.findUnique({
    where: { idempotencyKey: payload.idempotencyKey }
  })
  if (exists) return Response.json({ status: 'already_processed' })
  
  return processPaymentSaga(payload) // See Section III
}
2.2 Internal Error Schema (RFC 7807)
TypeScript
interface ApiError {
  type: string      // https://oweru.co.tz/errors/assignment-expired
  title: string     // Human readable
  status: number    // HTTP status
  code: string      // MACHINE_READABLE
  detail: string    // Developer message
  traceId: string   // X-Trace-ID from headers
  retryable: boolean
}
________________________________________
III. CONCURRENCY & TRANSACTION PATTERNS
3.1 Assignment Acceptance (Race Condition Prevention)
TypeScript
export async function acceptAssignment(providerId: string, assignmentId: string) {
  return await prisma.$transaction(async (tx) => {
    // Advisory lock (PostgreSQL)
    await tx.$executeRaw`SELECT pg_advisory_lock(hashtext('assignment_' || ${assignmentId}))`
    
    try {
      // FOR UPDATE SKIP LOCKED prevents waiting on contested rows
      const assignment = await tx.$queryRaw<Assignment[]>`
        SELECT * FROM assignments 
        WHERE id = ${assignmentId} 
        AND status = 'PENDING_ACCEPTANCE'
        AND offer_expires_at > NOW()
        FOR UPDATE SKIP LOCKED
      `
      
      if (!assignment.length) throw new Error('Unavailable')
      
      // Check provider capacity
      const provider = await tx.providerProfile.findUnique({
        where: { id: providerId },
        select: { currentLoad: true, maxConcurrent: true }
      })
      
      if (provider.currentLoad >= provider.maxConcurrent) {
        throw new Error('At capacity')
      }
      
      // Atomic update
      const [updated] = await tx.$transaction([
        tx.assignment.update({
          where: { id: assignmentId, status: 'PENDING_ACCEPTANCE' },
          data: { 
            status: 'ACCEPTED', 
            providerId, 
            acceptedAt: new Date() 
          }
        }),
        tx.providerProfile.update({
          where: { id: providerId },
          data: { currentLoad: { increment: 1 } }
        })
      ])
      
      return updated
    } finally {
      await tx.$executeRaw`SELECT pg_advisory_unlock(hashtext('assignment_' || ${assignmentId}))`
    }
  }, {
    isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    maxWait: 5000,
    timeout: 10000
  })
}
3.2 Financial Saga (80/20 Split)
TypeScript
class PaymentSaga {
  async execute(invoiceId: string, amount: Decimal, providerId: string) {
    const steps: Array<{ name: string; compensate: () => Promise<void> }> = []
    
    try {
      // Step 1: Mark invoice paid
      await this.markPaid(invoiceId)
      steps.push({
        name: 'invoice',
        compensate: () => this.revertInvoice(invoiceId)
      })
      
      // Step 2: Credit provider 80%
      const providerShare = amount.mul(0.8)
      await this.creditWallet(providerId, providerShare)
      steps.push({
        name: 'provider_credit',
        compensate: () => this.debitWallet(providerId, providerShare)
      })
      
      // Step 3: Record platform revenue 20%
      const platformShare = amount.mul(0.2)
      await this.recordRevenue(platformShare)
      
      // Step 4: Activate assignment
      await this.activateAssignment(invoiceId)
      
    } catch (error) {
      // Reverse all completed steps
      for (const step of steps.reverse()) {
        try { await step.compensate() } 
        catch (e) { await this.alertOps({ step: step.name, error: e }) }
      }
      throw error
    }
  }
}
________________________________________
IV. STATE MACHINE ENFORCEMENT
4.1 Database Triggers
SQL
CREATE OR REPLACE FUNCTION check_assignment_transition()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status = 'PENDING_ACCEPTANCE' AND NEW.status NOT IN ('ACCEPTED', 'REJECTED', 'EXPIRED') THEN
    RAISE EXCEPTION 'Invalid transition from PENDING_ACCEPTANCE to %', NEW.status;
  END IF;
  
  IF OLD.status = 'COMPLETED' AND NEW.status NOT IN ('DISPUTED', 'VERIFIED') THEN
    RAISE EXCEPTION 'Completed assignments can only be disputed or verified';
  END IF;
  
  -- Timestamp integrity
  IF NEW.completed_at IS NOT NULL AND NEW.accepted_at IS NULL THEN
    RAISE EXCEPTION 'Cannot complete before accepting';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER assignment_guard BEFORE UPDATE ON assignments 
FOR EACH ROW EXECUTE FUNCTION check_assignment_transition();
________________________________________
V. BACKGROUND JOBS (pg-boss)
TypeScript
// Expiration cron (runs every 5 minutes)
boss.work('expire-assignments', async (job) => {
  const expired = await prisma.assignment.findMany({
    where: {
      status: 'PENDING_ACCEPTANCE',
      offerExpiresAt: { lt: new Date() }
    }
  })
  
  for (const a of expired) {
    await prisma.$transaction([
      prisma.assignment.update({
        where: { id: a.id },
        data: { status: 'EXPIRED' }
      }),
      // Trigger reassignment
      boss.send('assign-provider', { agreementId: a.agreementId })
    ])
  }
})

// Daily reconciliation
boss.work('daily-reconcile', async () => {
  const orphans = await prisma.$queryRaw`
    SELECT i.id FROM invoices i
    LEFT JOIN wallet_transactions wt ON wt.assignment_id = i.agreement_id
    WHERE i.status = 'PAID' AND wt.id IS NULL
  `
  if (orphans.length) await alertFinance(orphans)
})
________________________________________
VI. SECURITY IMPLEMENTATION
6.1 Field Encryption (Prisma Middleware)
TypeScript
const sensitive = ['phone', 'encryptedId', 'encryptedAddress']

prisma.$use(async (params, next) => {
  if (params.action === 'create' || params.action === 'update') {
    for (const field of sensitive) {
      if (params.args.data?.[field]) {
        params.args.data[field] = await encrypt(params.args.data[field])
      }
    }
  }
  
  const result = await next(params)
  
  // Decrypt on read
  const records = Array.isArray(result) ? result : [result]
  for (const r of records) {
    for (const f of sensitive) {
      if (r?.[f]) r[f] = await decrypt(r[f])
    }
  }
  return result
})
6.2 Rate Limiting
TypeScript
import { Ratelimit } from '@upstash/ratelimit'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s')
})

// In Server Action
const { success } = await ratelimit.limit(user.id)
if (!success) throw new Error('Rate limit exceeded')
________________________________________
VII. TESTING STRATEGY
7.1 Integration Test: Payment Saga
TypeScript
test('payment saga is atomic', async () => {
  const agreement = await createTestAgreement()
  
  // Trigger webhook
  await fetch('/api/webhooks/selcom', {
    method: 'POST',
    body: JSON.stringify({
      order_id: agreement.invoiceId,
      status: 'SUCCESS',
      amount: 100000
    })
  })
  
  // Verify state
  const invoice = await prisma.invoice.findUnique({ 
    where: { id: agreement.invoiceId } 
  })
  expect(invoice.status).toBe('PAID')
  
  const wallet = await prisma.providerWallet.findUnique({
    where: { providerId: agreement.providerId }
  })
  expect(wallet.available).toBe(80000) // 80%
  
  // Idempotency test
  const dup = await fetch('/api/webhooks/selcom', { /* same payload */ })
  expect(dup.status).toBe(200)
  
  const txns = await prisma.walletTransaction.count({
    where: { assignmentId: agreement.assignmentId }
  })
  expect(txns).toBe(1) // Not doubled
})
7.2 Concurrency Test
TypeScript
test('double acceptance prevented', async () => {
  const assignment = await createPendingAssignment()
  
  const [r1, r2] = await Promise.all([
    acceptAssignment(providerA, assignment.id),
    acceptAssignment(providerB, assignment.id)
  ])
  
  expect(r1.status === 'ACCEPTED' || r2.status === 'ACCEPTED').toBe(true)
  expect(r1.status === 'ACCEPTED' && r2.status === 'ACCEPTED').toBe(false)
})
________________________________________
VIII. DEPLOYMENT CHECKLIST
•	 Database: RLS enabled, indexes on offer_expires_at, location (Gist)
•	 Secrets: SELCOM_SECRET, ENCRYPTION_KEY, CRON_SECRET in Vercel
•	 Cron: Vercel Cron configured for /api/cron/expire, /api/cron/reconcile
•	 Monitoring: Sentry for errors, Datadog for DB performance
•	 Backups: Neon daily snapshots tested for restore
•	 Migrations: Zero-downtime strategy verified (expand-contract pattern)
•	 SSL: Strict TLS 1.3, HSTS headers
•	 CORS: Restricted to oweru.co.tz domains only
________________________________________
IX. MONITORING & ALERTING
Metric	Threshold	Action
Failed payment saga	> 0 in 5 min	Page on-call engineer
Assignment expiration backlog	> 50 queued	Scale cron job
DB connection pool saturation	> 80%	Enable read replicas
Provider strike rate	> 10% daily	Alert operations manager
Webhook latency (Selcom)	> 5s p99	Escalate to payment team

________________________________________
PRODUCTION CODEBASE STRUCTURE ADDENDUM
Industrial MVP Baseline (Scalable + Professional)

Objective
Define a mandatory codebase structure that supports strict financial consistency, privacy isolation, background orchestration, and independent domain scaling.

Canonical Layout
.
|-- src/
|   |-- app/                                  # Next.js 16 App Router layer
|   |   |-- (auth)/                           # Unauthenticated flows
|   |   |-- (platform)/                       # Authenticated role dashboards
|   |   |   |-- admin/
|   |   |   |-- owner/
|   |   |   `-- provider/
|   |   |-- api/
|   |   |   |-- auth/[...nextauth]/route.ts
|   |   |   |-- webhooks/selcom/route.ts
|   |   |   |-- cron/expire-assignments/route.ts
|   |   |   |-- cron/reconcile-payments/route.ts
|   |   |   |-- cron/overdue-tasks/route.ts
|   |   |   `-- health/route.ts
|   |   `-- layout.tsx
|   |
|   |-- core/                                 # Infrastructure and cross-cutting concerns
|   |   |-- auth/
|   |   |-- config/
|   |   |-- database/
|   |   |-- errors/                           # RFC 7807/problem-details wrappers
|   |   |-- idempotency/                      # Webhook/event dedupe
|   |   |-- observability/                    # Logger, metrics, trace, correlation-id
|   |   |-- policy/                           # RBAC, masking, PII filtering rules
|   |   `-- security/                         # Encryption, hashing, rate limits
|   |
|   |-- features/                             # Vertical business domains
|   |   |-- users/
|   |   |-- properties/
|   |   |-- service-catalog/
|   |   |-- pricing/
|   |   |-- agreements/
|   |   |-- assignments/
|   |   |-- tasks/
|   |   |-- invoices/
|   |   |-- payments/
|   |   |-- wallets/
|   |   |-- disputes/
|   |   |-- utilities/
|   |   |-- notifications/
|   |   |-- analytics/
|   |   `-- audits/
|   |
|   |-- integrations/                         # Third-party adapters isolated from domain logic
|   |   |-- selcom/
|   |   |-- sms/
|   |   |-- email/
|   |   |-- storage/
|   |   `-- geolocation/
|   |
|   |-- jobs/                                 # Queue + schedulers (pg-boss)
|   |   |-- boss.ts
|   |   |-- handlers/
|   |   |   |-- expire-assignments.ts
|   |   |   |-- reassign-provider.ts
|   |   |   |-- mark-overdue-tasks.ts
|   |   |   |-- generate-recurring-tasks.ts
|   |   |   |-- reconcile-payments.ts
|   |   |   `-- send-reminders.ts
|   |   `-- schedulers/
|   |
|   `-- shared/                               # Reusable UI/types/helpers without domain ownership
|       |-- components/
|       |-- constants/
|       |-- lib/
|       `-- types/
|
|-- prisma/
|   |-- schema.prisma
|   `-- migrations/
|-- tests/
|   |-- unit/
|   |-- integration/
|   |-- e2e/
|   `-- fixtures/
|-- scripts/
|-- docs/
|   |-- adr/
|   `-- runbooks/
|-- proxy.ts                                 # Next.js 16 request boundary
`-- instrumentation.ts                        # Observability bootstrapping

Feature Module Contract (Mandatory)
Each folder under features/ MUST include this internal shape:

features/<domain>/
|-- actions/                                  # Server Actions and route handlers entrypoints
|-- services/                                 # Business rules and orchestration
|-- repositories/                             # Prisma/data access boundary
|-- schemas/                                  # Zod contracts and DTOs
|-- ui/                                       # Domain-specific UI components
|-- tests/                                    # Unit + integration tests for domain
`-- index.ts                                  # Public exports only

Industrial MVP Domain Minimum
- users
- properties
- service-catalog
- pricing
- agreements
- assignments
- tasks
- invoices
- payments
- wallets
- disputes
- utilities
- notifications
- analytics
- audits

Engineering Governance Rules
1. Business logic is forbidden in app/ and integrations/. Keep orchestration in features/*/services.
2. All money flows (invoice status, wallet ledger, revenue split) execute through serializable transactions.
3. All external webhooks and payout callbacks require idempotency keys and replay protection.
4. PII access is mediated via core/policy and core/security only; staff views must consume masked selectors.
5. All state transitions emit append-only audit events.
6. Every feature must expose typed contracts from schemas and reject unvalidated input.
7. Cross-feature calls go through public index.ts exports, not deep imports.

Release Quality Gates (Required)
- Unit tests for pricing, policy, and transition guards.
- Integration tests for assignment acceptance race and payment 80/20 saga idempotency.
- E2E tests for owner request -> provider execution -> verification -> wallet availability.
- Scheduled job tests for expiration, overdue reassignment, and reconciliation.
- Observability checks: structured logs include traceId, actorId, assignmentId/invoiceId where applicable.

PRODUCTION LIBRARY SPECIFICATION
Curated Stack for Next.js 16 + TypeScript + PostgreSQL
Selection Criteria: Tree-shakeable, TypeScript-native, App Router compatible, zero-runtime CSS, production-hardened.
________________________________________
I. UI/UX LAYER (Beautiful, Lightweight)
Library	Purpose	Why This Choice	Install
shadcn/ui	Component foundation	Not an NPM dependency—copy-paste Radix primitives. Zero bundle bloat, full customization, accessibility built-in.	npx shadcn-ui@latest init
Radix UI	Headless primitives	Unstyled, accessible components (Dialog, Dropdown, Select). Used by shadcn.	Comes with shadcn
Framer Motion	Animations	Tree-shakeable, declarative API, AnimatePresence for route transitions, layout animations.	npm install framer-motion
Tailwind CSS	Styling	Zero runtime, purged in production, design system via config.	npm install -D tailwindcss postcss autoprefixer
Tailwind Merge + clsx	Class utilities	Handle conditional classes without conflicts. Essential for shadcn.	npm install tailwind-merge clsx
Lucide React	Icons	Tree-shakeable, crisp SVG icons, matches shadcn aesthetic.	npm install lucide-react
Sonner	Toast notifications	Lightweight (3KB), promise-based toasts, beautiful defaults, no heavy ToastContainer setup.	npm install sonner
TanStack Table v8	Data tables	Headless, virtualized rows for large datasets, perfect for provider lists/audit logs.	npm install @tanstack/react-table
React Hook Form	Form management	Performance-optimized (minimizes re-renders), Zod resolver built-in.	npm install react-hook-form @hookform/resolvers
@radix-ui/react-slot	Component composition	Essential for shadcn's asChild pattern.	Comes with shadcn
Avoid: Material UI (300KB+), Chakra UI (heavy runtime), Ant Design (outdated patterns), Bootstrap.
________________________________________
II. BACKEND & SAFETY LAYER (Strong, Type-Safe)
Library	Purpose	Safety Feature	Install
Prisma	Database ORM	Type-safe queries, connection pooling, migration system, prevents SQL injection by default.	npm install prisma @prisma/client
Zod	Schema validation	Static type inference, runtime validation, perfect for Server Actions/APIs.	npm install zod
zod-prisma-types	Schema sync	Auto-generates Zod schemas from Prisma models (single source of truth).	npm install zod-prisma-types
Auth.js v5	Authentication	Edge-compatible, database session strategy, CSRF protection, TypeScript native.	npm install next-auth@beta @auth/prisma-adapter
@upstash/ratelimit	Rate limiting	Redis-based sliding windows, distributed rate limiting for serverless (Vercel).	npm install @upstash/ratelimit @upstash/redis
pg-boss	Job queue	PostgreSQL-native (no Redis needed), reliable cron jobs, saga pattern support.	npm install pg-boss
Pino	Logging	JSON structured logs, 5x faster than console, redaction for PII, Datadog/Sentry compatible.	npm install pino pino-pretty
bcryptjs	Password hashing	Argon2 alternative (lighter), salt rounds 12 for production.	npm install bcryptjs
nanoid	ID generation	UUID alternative (smaller, URL-safe), collision-resistant for short links/IDs.	npm install nanoid
date-fns	Date manipulation	Modular imports (tree-shakeable), TZ handling, immutable operations.	npm install date-fns
sharp	Image processing	Next.js native integration, WebP conversion, resize on upload.	npm install sharp
Resend	Email delivery	React Email integration, delivery tracking, transactional focus.	npm install resend react-email
react-phone-number-input	Phone validation	TZ number formatting, validation, country flags.	npm install react-phone-number-input
Avoid: Sequelize (no Type safety), Express in Next.js (use Route Handlers), Moment.js (heavy, mutable), Bull (requires Redis—use pg-boss instead).
________________________________________
III. NEXT.JS 16 SPECIFIC INTEGRATIONS
Feature	Library/Config	Purpose
Cache Components	Built-in Next.js 16	'use cache' directive for PPR, automatic cache key generation.
Server Actions	Built-in Next.js 16	Form submissions without API routes, progressive enhancement.
React Compiler	babel-plugin-react-compiler	Automatic memoization (opt-in via reactCompiler: true in next.config).
Turbopack	Built-in Next.js 16	Default bundler (stable), 5-10x faster HMR.
Zod Server Actions	next-safe-action	Type-safe Server Actions with Zod validation, error handling.
________________________________________
IV. DEVELOPMENT & MONITORING
Library	Purpose	Install
TypeScript	Type safety	Strict mode enabled (strict: true in tsconfig).
ESLint + Prettier	Code quality	Flat config format (Next.js 16 default).
@playwright/test	E2E testing	Test payment flows, provider acceptance races.
Vitest	Unit testing	Vite-based, fast, compatible with Next.js.
Sentry	Error tracking	Capture saga failures, payment errors.
@neondatabase/serverless	DB Driver	WebSocket-free connection for Edge functions (if needed).
________________________________________
V. PACKAGE.JSON TEMPLATE
JSON
{
  "dependencies": {
    "next": "^16.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@prisma/client": "^5.20.0",
    "prisma": "^5.20.0",
    "zod": "^3.23.0",
    "next-auth": "^5.0.0-beta",
    "@auth/prisma-adapter": "^2.0.0",
    "react-hook-form": "^7.53.0",
    "@hookform/resolvers": "^3.9.0",
    "framer-motion": "^11.0.0",
    "lucide-react": "^0.453.0",
    "sonner": "^1.5.0",
    "@tanstack/react-table": "^8.20.0",
    "pg-boss": "^10.1.0",
    "@upstash/ratelimit": "^2.0.0",
    "@upstash/redis": "^1.34.0",
    "pino": "^9.5.0",
    "bcryptjs": "^2.4.3",
    "nanoid": "^5.0.0",
    "date-fns": "^4.0.0",
    "sharp": "^0.33.0",
    "resend": "^4.0.0",
    "react-phone-number-input": "^3.4.0",
    "next-safe-action": "^7.0.0",
    "tailwind-merge": "^2.5.0",
    "clsx": "^2.1.0"
  },
  "devDependencies": {
    "typescript": "^5.6.0",
    "@types/node": "^20.0.0",
    "@types/bcryptjs": "^2.4.6",
    "@types/react": "^18.3.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "eslint": "^9.0.0",
    "eslint-config-next": "^16.0.0",
    "prettier": "^3.3.0",
    "@playwright/test": "^1.48.0",
    "vitest": "^2.1.0",
    "pino-pretty": "^11.0.0",
    "zod-prisma-types": "^3.1.0"
  }
}
________________________________________
VI. ARCHITECTURE CONSTRAINTS (Critical)
Bundle Size Budgets:
•	Max initial JS: 200KB (gzipped)
•	Lucide icons: Tree-shake imports (import { Phone } from 'lucide-react' not import * as Icons)
•	Date-fns: Import specific functions (import { format } from 'date-fns' not barrel import)
Server Action Constraints:
•	Max execution time: 10s (Vercel Hobby), 30s (Pro)
•	Payload size: < 4MB (for image uploads, use presigned URLs instead)
Database Connection Limits:
•	Neon Free: 10 concurrent connections
•	Use connection_limit=10 in Prisma config
•	pg-boss uses same pool (no additional connections)
Security Non-Negotiables:
•	Zod validation on ALL Server Actions (no any types)
•	bcryptjs hash rounds: 12 (minimum)
•	nanoid for public IDs (UUIDs are too long for URLs)
•	Pino redact: ['req.headers.authorization', 'password', '*.phone']

COMPLETE SYSTEM WORKFLOW
I. Property Onboarding
1.	Owner submits property details (location, type, units, images)
2.	System validates location data and image requirements
3.	Administrator or automated system approves property
4.	Property status changes: PENDING → ACTIVE
5.	Audit logged: Property creation with owner ID and timestamp
II. Service Request & Pricing
1.	Owner selects service type, frequency, and unit count
2.	System calculates price using rule engine (location + units + frequency + service type)
3.	System generates quote with 24-hour expiration timestamp
4.	Cache: Price quote cached with 24h TTL
5.	Owner submits request before expiration → Request status: ACTIVE
6.	If expired: Owner must recalculate (new quote generated)
III. Internal Provider Assignment (6-Hour Window)
1.	System filters providers by:
•	Service category match
•	Geographic radius (configurable km)
•	Verification status = ACTIVE
•	Current workload < max concurrent (default 3)
•	No schedule conflicts with existing assignments
•	Not in blocked date range
2.	System ranks eligible providers by composite score:
•	Rating (40%) + Completion rate (30%) + Acceptance rate (20%) + Responsiveness (10%)
•	New provider boost: 20% of offers go to providers with < 5 completed services
3.	System creates ASSIGNMENT with status: PENDING_ACCEPTANCE
4.	System sends offer to top-ranked provider via Push + SMS
•	Contains: Service details, schedule, property address, net pay (80%), 6-hour deadline
5.	Audit logged: Assignment created, provider notified
6.	If provider accepts within 6h: Status → ACCEPTED → Proceed to IV
7.	If provider rejects or 6h expires:
•	Status → REJECTED/EXPIRED
•	System logs rejection reason (if provided)
•	Automatic reassignment to next ranked provider (repeat from step 3)
•	If no providers available: Assignment status → NO_PROVIDER_AVAILABLE, Staff notified for manual intervention
IV. Contract Activation & Invoice Generation
1.	Upon provider acceptance:
•	Service Agreement between Owner ↔ Oweru activated
•	Internal Work Order between Oweru ↔ Provider created
•	Assignment status: ACCEPTED
2.	System generates INVOICE (Owner → Oweru)
•	Invoice contains: Service details, total amount (100%), due date (7 days)
•	Status: PENDING_PAYMENT
3.	Audit logged: Contract activation, invoice generated with UUID
V. Payment Processing & Revenue Split
1.	Owner initiates payment via Selcom (mobile money)
2.	Success path:
•	Payment confirmed via Selcom webhook
•	Invoice status: PAID
•	Immediate revenue split executed:
•	20% to Oweru revenue account
•	80% to Provider internal wallet (status: AVAILABLE)
•	Assignment status: SCHEDULED
•	Audit logged: Transaction ID, split amounts, timestamps
3.	Failure path:
•	Payment fails or timeout
•	Invoice remains PENDING_PAYMENT
•	Owner notified (SMS/App)
•	Retry allowed (max 3 attempts)
•	After 3 failures: Assignment status → PAYMENT_FAILED, Service suspended
•	After 7 days unpaid: Contract terminated, reassignment cancelled
VI. Task Generation & Execution
1.	System generates first TASK based on schedule (cron job at 6AM daily)
•	Task contains: Assignment ID, scheduled datetime, property address (system provides to provider)
•	Status: SCHEDULED
2.	Pre-execution:
•	Provider receives reminder 24h before via SMS
•	Provider receives reminder 1h before via App Push
3.	Execution day:
•	Provider checks in via mobile app (GPS captured, must match property location within 200m)
•	Status → IN_PROGRESS
•	Audit logged: Check-in timestamp, GPS coordinates
4.	Completion:
•	Provider uploads evidence: Minimum 3 photos + timestamp + optional notes
•	Provider marks status → COMPLETED
•	Owner receives notification: "Service completed, awaiting verification"
•	Audit logged: Completion timestamp, evidence URLs
VII. Verification & Dispute Resolution
1.	Auto-approval path:
•	Owner takes no action for 24h after completion
•	System auto-approves
•	Provider wallet funds move from AVAILABLE → WITHDRAWABLE (if not already)
•	Provider performance metrics updated (completion rate, rating eligibility)
2.	Owner approval path:
•	Owner clicks "Satisfied" in app
•	Immediate approval, funds released to provider
3.	Dispute path:
•	Owner clicks "Dispute" within 24h window
•	Status → DISPUTED
•	Owner selects reason: (No-show, Incomplete work, Damage, Other)
•	Owner uploads evidence (photos/description)
•	Funds frozen: Provider cannot withdraw disputed amount
•	Staff notified (anonymized view: sees evidence from both sides, masked identities)
•	Staff has 48h to resolve:
•	Resolution A (Provider at fault):
•	Funds returned to Owner
•	Provider receives strike (strike count +1)
•	If 3 strikes → Provider status SUSPENDED (30 days)
•	Assignment marked CANCELLED, new provider assigned
•	Resolution B (Owner at fault):
•	Funds released to Provider
•	Owner receives warning
•	Assignment marked COMPLETED
•	Resolution C (Split):
•	Partial refund to owner, remainder to provider
•	Assignment marked RESOLVED
•	Audit logged: Dispute reason, resolution, arbitrator ID
VIII. Provider Performance & Strikes
1.	After each completed service:
•	Owner prompted to rate (1-5 stars) and review
•	Rating attributed to provider profile
•	Provider score recalculated
2.	Strike system:
•	No-show (check-in missed by 4h) = 1 strike
•	Dispute lost = 1 strike
•	Late completion (>2h overdue) = 0.5 strike
•	At 3 strikes: Provider status → SUSPENDED (cannot receive offers for 30 days)
•	Audit logged: All strikes with reasons and dates
IX. Wallet & Withdrawals
1.	Earnings accumulation:
•	Approved service payments → 80% credited to provider wallet (AVAILABLE)
2.	Withdrawal request:
•	Provider requests withdrawal (minimum 50,000 TZS)
•	System checks: Balance ≥ 50,000 TZS, No disputed funds frozen
•	Status: PENDING_WITHDRAWAL
3.	Processing (within 24h):
•	Admin/Automated system approves
•	Selcom API transfers to provider mobile money
•	Status: COMPLETED or FAILED (if MM number invalid)
•	Audit logged: Withdrawal ID, amount, transaction reference
X. Utility Management (Parallel Track)
1.	Staff or Owner uploads utility bill (water/electricity) to system
2.	System allocates cost across tenants using configured method:
•	Per unit (equal split)
•	Per person (occupant count)
•	Per square meter (unit size)
3.	System generates tenant-specific utility charges
4.	Note: Utility payments tracked separately from service payments
5.	Audit logged: Bill upload, allocation calculation, distribution list
XI. Cancellation at Various Stages
1.	Before Provider Acceptance (Within 6h window):
•	Owner cancels → No penalty
•	Assignment status: CANCELLED_BY_OWNER
•	Invoice voided if generated
2.	After Provider Acceptance (Before Payment):
•	Owner cancels → 20% penalty charged immediately
•	15% credited to Provider wallet (compensation), 5% to Oweru
•	Assignment status: CANCELLED_POST_ACCEPTANCE
•	Provider notified, strike NOT applied (owner cancellation)
3.	After Payment (Before Execution):
•	Owner cancels → 20% penalty, 80% refunded
•	Provider keeps 15% compensation, Oweru keeps 5%
4.	During Execution (After check-in):
•	Cannot be cancelled by owner
•	Only dispute resolution applies
XII. Overdue & Reassignment
1.	Task overdue detection (Cron job every hour):
•	Scheduled time + 2h passed, status still SCHEDULED → FLAGGED_OVERDUE
•	Scheduled time + 4h passed → AUTO_CANCELLED
2.	Reassignment trigger:
•	Provider marked no-show
•	Strike applied
•	System automatically creates new ASSIGNMENT (return to Step III)
•	New provider selected, 6-hour clock starts again
•	Owner notified of delay and new provider assignment
XIII. Recurring Cycle
1.	Upon successful verification of current task:
2.	System calculates next execution date based on frequency (weekly/bi-weekly/monthly)
3.	Creates next TASK with status SCHEDULED
4.	Provider receives calendar update
5.	Loop repeats from Step VI
XIV. Analytics & Reporting
1.	Real-time updates:
•	Owner dashboard: Total paid to Oweru, active services, upcoming tasks
•	Provider dashboard: Earnings, completion rate, upcoming assignments
•	Admin dashboard: Platform revenue, active disputes, provider performance
2.	Monthly reports:
•	Auto-generated owner statements (service costs + utilities)
•	Provider earning statements
•	Oweru commission reports

Tuesday, October 21st 2025

Next.js 16
Posted by
Jimmy Lai
Jimmy Lai
@feedthejim
Josh Story
Josh Story
@joshcstory
Sebastian Markbåge
Sebastian Markbåge
@sebmarkbage
Tim Neutkens
Tim Neutkens
@timneutkens
Ahead of our upcoming Next.js Conf 2025, Next.js 16 is now available.

This release provides the latest improvements to Turbopack, caching, and the Next.js architecture. Since the previous beta release, we added several new features and improvements:

Cache Components: New model using Partial Pre-Rendering (PPR) and use cache for instant navigation.
Next.js Devtools MCP: Model Context Protocol integration for improved debugging and workflow.
Proxy: Middleware replaced by proxy.ts to clarify network boundary.
DX: Improved logging for builds and development requests.
For reminder, those features were available since the previous beta release:

Turbopack (stable): Default bundler for all apps with up to 5-10x faster Fast Refresh, and 2-5x faster builds
Turbopack File System Caching (beta): Even faster startup and compile times for the largest apps
React Compiler Support (stable): Built-in integration for automatic memoization
Build Adapters API (alpha): Create custom adapters to modify the build process
Enhanced Routing: Optimized navigations and prefetching with layout deduplication and incremental prefetching
Improved Caching APIs: New updateTag() and refined revalidateTag()
React 19.2: View Transitions, useEffectEvent(), <Activity/>
Breaking Changes: Async params, next/image defaults, and more
Upgrade to Next.js 16:

terminal
# Use the automated upgrade CLI
npx @next/codemod@canary upgrade latest
 
# ...or upgrade manually
npm install next@latest react@latest react-dom@latest
 
# ...or start a new project
npx create-next-app@latest
For cases where the codemod can't fully migrate your code, please read the upgrade guide.

New Features and Improvements
Cache Components
Cache Components are a new set of features designed to make caching in Next.js both more explicit, and more flexible. They center around the new "use cache" directive, which can be used to cache pages, components, and functions, and which leverages the compiler to automatically generate cache keys wherever it’s used.

Unlike the implicit caching found in previous versions of the App Router, caching with Cache Components is entirely opt-in. All dynamic code in any page, layout, or API route is executed at request time by default, giving Next.js an out-of-the-box experience that’s better aligned with what developers expect from a full-stack application framework.

Cache Components also complete the story of Partial Prerendering (PPR), which was first introduced in 2023. Prior to PPR, Next.js had to choose whether to render each URL statically or dynamically; there was no middle ground. PPR eliminated this dichotomy, and let developers opt portions of their static pages into dynamic rendering (via Suspense) without sacrificing the fast initial load of fully static pages.

You can enable Cache Components in your next.config.ts file:

next.config.ts
const nextConfig = {
  cacheComponents: true,
};
 
export default nextConfig;
We will be sharing more about Cache Components and how to use them at Next.js Conf 2025 on October 22nd, and we will be sharing more content in our blog and documentation in the coming weeks.

Note: as previously announced in the beta release, the previous experimental experimental.ppr flag and configuration options have been removed in favor of the Cache Components configuration.

Learn more in the documentation here.

Next.js Devtools MCP
Next.js 16 introduces Next.js DevTools MCP, a Model Context Protocol integration for AI-assisted debugging with contextual insight into your application.

The Next.js DevTools MCP provides AI agents with:

Next.js knowledge: Routing, caching, and rendering behavior
Unified logs: Browser and server logs without switching contexts
Automatic error access: Detailed stack traces without manual copying
Page awareness: Contextual understanding of the active route
This enables AI agents to diagnose issues, explain behavior, and suggest fixes directly within your development workflow.

Learn more in the documentation here.

proxy.ts (formerly middleware.ts)
proxy.ts replaces middleware.ts and makes the app’s network boundary explicit. proxy.ts runs on the Node.js runtime.

What to do: Rename middleware.ts → proxy.ts and rename the exported function to proxy. Logic stays the same.
Why: Clearer naming and a single, predictable runtime for request interception.
proxy.ts
export default function proxy(request: NextRequest) {
  return NextResponse.redirect(new URL('/home', request.url));
}
Note: The middleware.ts file is still available for Edge runtime use cases, but it is deprecated and will be removed in a future version.

Learn more in the documentation here.

Logging Improvements
In Next.js 16 the development request logs are extended showing where time is spent.

Compile: Routing and compilation
Render: Running your code and React rendering

The build is also extended to show where time is spent. Each step in the build process is now shown with the time it took to complete.

terminal
   ▲ Next.js 16 (Turbopack)
 
 ✓ Compiled successfully in 615ms
 ✓ Finished TypeScript in 1114ms
 ✓ Collecting page data in 208ms
 ✓ Generating static pages in 239ms
 ✓ Finalizing page optimization in 5ms
The following features were previously announced in the beta release:

Developer Experience
Turbopack (stable)
Turbopack has reached stability for both development and production builds, and is now the default bundler for all new Next.js projects. Since its beta release earlier this summer, adoption has scaled rapidly: more than 50% of development sessions and 20% of production builds on Next.js 15.3+ are already running on Turbopack.

With Turbopack, you can expect:

2–5× faster production builds
Up to 10× faster Fast Refresh
We're making Turbopack the default to bring these performance gains to every Next.js developer, no configuration required. For apps with custom webpack setups, you can continue using webpack by running:

terminal
next dev --webpack
next build --webpack
Turbopack File System Caching (beta)
Turbopack now supports filesystem caching in development, storing compiler artifacts on disk between runs for significantly faster compile times across restarts, especially in large projects.

Enable filesystem caching in your configuration:

next.config.ts
const nextConfig = {
  experimental: {
    turbopackFileSystemCacheForDev: true,
  },
};
 
export default nextConfig;
All internal Vercel apps are already using this feature, and we’ve seen notable improvements in developer productivity across large repositories.

We’d love to hear your feedback as we iterate on filesystem caching. Please try it out and share your experience.

Simplified create-next-app
create-next-app has been redesigned with a simplified setup flow, updated project structure, and improved defaults. The new template includes the App Router by default, TypeScript-first configuration, Tailwind CSS, and ESLint.

Build Adapters API (alpha)
Following the Build Adapters RFC, we've worked with the community and deployment platforms to deliver the first alpha version of the Build Adapters API.

Build Adapters allow you to create custom adapters that hook into the build process, enabling deployment platforms and custom build integrations to modify Next.js configuration or process build output.

next.config.js
const nextConfig = {
  experimental: {
    adapterPath: require.resolve('./my-adapter.js'),
  },
};
 
module.exports = nextConfig;
Share your feedback in the RFC discussion.

React Compiler Support (stable)
Built-in support for the React Compiler is now stable in Next.js 16 following the React Compiler's 1.0 release. The React Compiler automatically memoizes components, reducing unnecessary re-renders with zero manual code changes.

The reactCompiler configuration option has been promoted from experimental to stable. It is not enabled by default as we continue gathering build performance data across different application types. Expect compile times in development and during builds to be higher when enabling this option as the React Compiler relies on Babel.

next.config.ts
const nextConfig = {
  reactCompiler: true,
};
 
export default nextConfig;
Install the latest version of the React Compiler plugin:

terminal
npm install babel-plugin-react-compiler@latest
Core Features & Architecture
Enhanced Routing and Navigation
Next.js 16 includes a complete overhaul of the routing and navigation system, making page transitions leaner and faster.

Layout deduplication: When prefetching multiple URLs with a shared layout, the layout is downloaded once instead of separately for each Link. For example, a page with 50 product links now downloads the shared layout once instead of 50 times, dramatically reducing the network transfer size.

Incremental prefetching: Next.js only prefetches parts not already in cache, rather than entire pages. The prefetch cache now:

Cancels requests when the link leaves the viewport
Prioritizes link prefetching on hover or when re-entering the viewport
Re-prefetches links when their data is invalidated
Works seamlessly with upcoming features like Cache Components
Trade-off: You may see more individual prefetch requests, but with much lower total transfer sizes. We believe this is the right trade-off for nearly all applications. If the increased request count causes issues, please let us know. We're working on additional optimizations to inline data chunks more efficiently.

These changes require no code modifications and are designed to improve performance across all apps.

Improved Caching APIs
Next.js 16 introduces refined caching APIs for more explicit control over cache behavior.

revalidateTag() (updated)
revalidateTag() now requires a cacheLife profile as the second argument to enable stale-while-revalidate (SWR) behavior:

import { revalidateTag } from 'next/cache';
 
// ✅ Use built-in cacheLife profile (we recommend 'max' for most cases)
revalidateTag('blog-posts', 'max');
 
// Or use other built-in profiles
revalidateTag('news-feed', 'hours');
revalidateTag('analytics', 'days');
 
// Or use an inline object with a custom revalidation time
revalidateTag('products', { expire: 3600 });
 
// ⚠️ Deprecated - single argument form
revalidateTag('blog-posts');
The profile argument accepts built-in cacheLife profile names (like 'max', 'hours', 'days') or custom profiles defined in your next.config. You can also pass an inline { expire: number } object. We recommend using 'max' for most cases, as it enables background revalidation for long-lived content. When users request tagged content, they receive cached data immediately while Next.js revalidates in the background.

Use revalidateTag() when you want to invalidate only properly tagged cached entries with stale-while-revalidate behavior. This is ideal for static content that can tolerate eventual consistency.

Migration guidance: Add the second argument with a cacheLife profile (we recommend 'max') for SWR behavior, or use updateTag() in Server Actions if you need read-your-writes semantics.

updateTag() (new)
updateTag() is a new Server Actions-only API that provides read-your-writes semantics, expiring and immediately reading fresh data within the same request:

'use server';
 
import { updateTag } from 'next/cache';
 
export async function updateUserProfile(userId: string, profile: Profile) {
  await db.users.update(userId, profile);
 
  // Expire cache and refresh immediately - user sees their changes right away
  updateTag(`user-${userId}`);
}
This ensures interactive features reflect changes immediately. Perfect for forms, user settings, and any workflow where users expect to see their updates instantly.

refresh() (new)
refresh() is a new Server Actions-only API for refreshing uncached data only. It doesn't touch the cache at all:

'use server';
 
import { refresh } from 'next/cache';
 
export async function markNotificationAsRead(notificationId: string) {
  // Update the notification in the database
  await db.notifications.markAsRead(notificationId);
 
  // Refresh the notification count displayed in the header
  // (which is fetched separately and not cached)
  refresh();
}
This API is complementary to the client-side router.refresh(). Use it when you need to refresh uncached data displayed elsewhere on the page after performing an action. Your cached page shells and static content remain fast while dynamic data like notification counts, live metrics, or status indicators refresh.

React 19.2 and Canary Features
The App Router in Next.js 16 uses the latest React Canary release, which includes the newly released React 19.2 features and other features being incrementally stabilized. Highlights include:

View Transitions: Animate elements that update inside a Transition or navigation
useEffectEvent: Extract non-reactive logic from Effects into reusable Effect Event functions
Activity: Render "background activity" by hiding UI with display: none while maintaining state and cleaning up Effects
Learn more in the React 19.2 announcement.

Breaking Changes and Other Updates
Version Requirements
Change	Details
Node.js 20.9+	Minimum version now 20.9.0 (LTS); Node.js 18 no longer supported
TypeScript 5+	Minimum version now 5.1.0
Browsers	Chrome 111+, Edge 111+, Firefox 111+, Safari 16.4+
Removals
These features were previously deprecated and are now removed:

Removed	Replacement
AMP support	All AMP APIs and configs removed (useAmp, export const config = { amp: true })
next lint command	Use Biome or ESLint directly; next build no longer runs linting. A codemod is available: npx @next/codemod@canary next-lint-to-eslint-cli .
devIndicators options	appIsrStatus, buildActivity, buildActivityPosition removed from config. The indicator remains.
serverRuntimeConfig, publicRuntimeConfig	Use environment variables (.env files)
experimental.turbopack location	Config moved to top-level turbopack (no longer in experimental)
experimental.dynamicIO flag	Renamed to cacheComponents
experimental.ppr flag	PPR flag removed; evolving into Cache Components programming model
export const experimental_ppr	Route-level PPR export removed; evolving into Cache Components programming model
Automatic scroll-behavior: smooth	Add data-scroll-behavior="smooth" to HTML document to opt back in
unstable_rootParams()	We are working on an alternative API that we will ship in an upcoming minor
Sync params, searchParams props access	Must use async: await params, await searchParams
Sync cookies(), headers(), draftMode() access	Must use async: await cookies(), await headers(), await draftMode()
Metadata image route params argument	Changed to async params; id from generateImageMetadata now Promise<string>
next/image local src with query strings	Now requires images.localPatterns config to prevent enumeration attacks
Behavior Changes
These features have new default behaviors in Next.js 16:

Changed Behavior	Details
Default bundler	Turbopack is now the default bundler for all apps; opt out with next build --webpack
images.minimumCacheTTL default	Changed from 60s to 4 hours (14400s); reduces revalidation cost for images without cache-control headers
images.imageSizes default	Removed 16 from default sizes (used by only 4.2% of projects); reduces srcset size and API variations
images.qualities default	Changed from [1..100] to [75]; quality prop is now coerced to closest value in images.qualities
images.dangerouslyAllowLocalIP	New security restriction blocks local IP optimization by default; set to true for private networks only
images.maximumRedirects default	Changed from unlimited to 3 redirects maximum; set to 0 to disable or increase for rare edge cases
@next/eslint-plugin-next default	Now defaults to ESLint Flat Config format, aligning with ESLint v10 which will drop legacy config support
Prefetch cache behavior	Complete rewrite with layout deduplication and incremental prefetching
revalidateTag() signature	Now requires cacheLife profile as second argument for stale-while-revalidate behavior
Babel configuration in Turbopack	Automatically enables Babel if a babel config is found (previously exited with hard error)
Terminal output	Redesigned with clearer formatting, better error messages, and improved performance metrics
Dev and build output directories	next dev and next build now use separate output directories, enabling concurrent execution
Lockfile behavior	Added lockfile mechanism to prevent multiple next dev or next build instances on the same project
Parallel routes default.js	All parallel route slots now require explicit default.js files; builds fail without them. Create default.js that calls notFound() or returns null for previous behavior
Modern Sass API	Bumped sass-loader to v16, which supports modern Sass syntax and new features
Deprecations
These features are deprecated in Next.js 16 and will be removed in a future version:

Deprecated	Details
middleware.ts filename	Rename to proxy.ts to clarify network boundary and routing focus
next/legacy/image component	Use next/image instead for improved performance and features
images.domains config	Use images.remotePatterns config instead for improved security restriction
revalidateTag() single argument	Use revalidateTag(tag, profile) for SWR, or updateTag(tag) in Actions for read-your-writes
Additional Improvements
Performance improvements: Significant performance optimizations for next dev and next start commands
Node.js native TypeScript for next.config.ts: Run next dev, next build, and next start commands with --experimental-next-config-strip-types flag to enable native TypeScript for next.config.ts.
We'll aim to share a more comprehensive migration guide ahead of the stable release in our documentation.

Feedback and Community
Share your feedback and help shape the future of Next.js:

GitHub Discussions
GitHub Issues
Discord Community
Contributors
Next.js is the result of the combined work of over 3,000 individual developers. This release was brought to you by:

The Next.js team: Andrew, Hendrik, Janka, Jiachi, Jimmy, Jiwon, JJ, Josh, Jude, Sam, Sebastian, Sebbie, Wyatt, and Zack.
The Turbopack team: Benjamin, Josh, Luke, Niklas, Tim, Tobias, and Will.
The Next.js Docs team: Delba, Rich, Ismael, and Joseph.