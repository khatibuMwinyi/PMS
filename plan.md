SOFTWARE REQUIREMENTS DOCUMENT (SRD)

Oweru Property Service Management Platform (OPSMP)

I. System Overview

The Oweru Property Service Management Platform is a web-based system designed to manage recurring property services across multiple properties owned by clients.

The system enables property owners to register properties and select required services. Oweru acts as the sole service provider to property owners. Internally, Oweru coordinates verified service providers to fulfill these services. Property owners interact exclusively with Oweru; they have no visibility into or direct contractual relationship with individual service providers.

The platform handles service orchestration, automated pricing, internal provider assignment, financial management, utility tracking, and analytics.

Technical Stack: Next.js 16 (App Router), TypeScript, PostgreSQL via Neon, Prisma ORM, Auth.js authentication, Vercel hosting.

II. System Objectives

The system aims to provide a scalable and automated solution for managing recurring property services.

It eliminates manual negotiation by introducing a rule-based pricing engine with 24-hour price locks, ensures efficient service delivery through intelligent provider selection with availability checking, and enables transparent financial tracking for both Oweru and property owners.

III. Stakeholders

Oweru Company is the sole legal service provider to property owners, operating the platform, processing all payments, coordinating provider fulfillment, and managing all service contracts.

Property Owners manage multiple properties, request services from Oweru, view costs instantly, pay Oweru directly, and access financial analytics. Owners have no direct interaction or contractual relationship with service providers.

Service Providers are independent contractors engaged by Oweru to fulfill service orders. They accept assignments from Oweru (not from owners), maintain availability calendars, execute tasks, and receive payment from Oweru (80% of service fee). Providers have no visibility of or contact with property owners.

Staff Members supervise operational workflows, handle disputes, and manage provider verification without access to sensitive personal data.

Administrators manage system configuration, provider verification, financial oversight, and secure data access.

IV. User Roles and Access Control

Administrators have full system access, including visibility of sensitive information such as contact details of property owners and service providers.

Staff Members manage operational workflows such as monitoring assignments and service execution. They are restricted from accessing sensitive contact information and see masked data (e.g., +255 7*** ****).

Property Owners can manage their properties, request services from Oweru, view pricing, receive invoices from Oweru, make payments to Oweru, and access analytics. Cannot see provider identities or contact details.

Service Providers can view assignment offers from Oweru, accept internal work orders, manage availability calendars, execute tasks, and track earnings from Oweru. Cannot see property owner identities or contact details.

All interactions between owners and providers are mediated exclusively through Oweru.

V. Multi-Property Management

Property owners can register and manage multiple properties under a single account.

Each property operates independently in terms of services, billing, and analytics.

Properties with multiple units (apartments) can configure services per unit or per building, with pricing adjusted accordingly.

VI. Property Onboarding

Property owners submit property details including location, type, number of units, and supporting images.

The system validates and stores the property. Approved properties become eligible for service requests.

VII. Service Selection and Pricing Engine

Property owners select services required for each property or unit from Oweru's service catalog.

The system calculates service costs instantly using a rule-based pricing engine based on number of units, service frequency, location, and service type.

Pricing Lock: Calculated prices are locked for 24 hours. If the owner does not submit the request within 24 hours, the quote expires and must be recalculated.

Displayed pricing is final and binding upon submission.

VIII. Contract Model

Service Agreement Structure:

Between Property Owner and Oweru: The property owner enters into a service agreement with Oweru Company only. Oweru is the sole legal entity responsible for service delivery.
Between Oweru and Service Provider: Oweru internally assigns fulfillment to verified service providers through work orders. Providers contract with Oweru, not with property owners.
Agreement Formation:

Owner submits service request to Oweru (accepts displayed price).
Oweru system identifies and offers internal work order to selected provider (6-hour acceptance window).
Provider accepts the work order from Oweru.
Oweru confirms service activation to the owner.
No direct contract exists between owner and provider.
Cancellation Rules:

Before provider acceptance of work order: Owner may cancel request with no penalty.
After provider acceptance:
Owner cancels: 20% penalty applies (15% compensates provider via Oweru, 5% to Oweru platform).
Provider no-show: Work order terminated, provider receives strike.
IX. Service Structure

Each service request creates an independent service order under the owner-Oweru agreement.

Each service order is fulfilled internally by Oweru through assignment to a specific service provider.

Services operate in parallel. Failure or delay in one service does not affect others.

X. Provider Registration and Verification

Service providers register as independent contractors for Oweru by submitting required personal or business information, service categories, operational locations, and availability schedules.

Administrators verify providers before they become eligible for internal work order assignment.

New providers are introduced with a baseline performance score and receive priority placement in 20% of assignments to ensure fairness.

XI. Provider Recommendation Engine

The system selects providers for internal fulfillment using a ranking algorithm.

Provider Scoring:

Rating (40%)
Completion rate (30%)
Acceptance rate (20%)
Responsiveness (10%)
Availability Check: System filters providers based on:

Service category and location
Existing schedule conflicts
Maximum concurrent assignments (default: 3 active assignments per provider)
Blocked dates (vacation/time-off)
XII. Internal Assignment and Work Order Acceptance

Work Order Lifecycle (Internal to Oweru):

Pending Acceptance: System sends internal work order offer to top-ranked provider. Provider sees service details, schedule, and payment amount (80% of total price collected from owner). Offer valid for 6 hours.
Accepted: Provider accepts work order from Oweru. Oweru confirms service activation to owner.
Scheduled: Task generated based on service frequency.
In Progress: Provider checks in at property (address provided by Oweru system).
Completed: Provider submits completion evidence through Oweru platform.
Verified: Owner confirms satisfaction via Oweru platform or auto-approves after 24 hours.
Cancelled: Work order terminated by Oweru (owner request) or system (no-show).
Rejection Handling: If a provider rejects or does not respond within 6 hours, the system automatically selects the next best provider.

XIII. Task Scheduling and Execution

Accepted work orders generate service tasks based on defined schedules (weekly, bi-weekly, monthly).

Service providers execute tasks and update status via Oweru platform.

Overdue Handling: Tasks not marked complete within 2 hours of scheduled time are flagged as overdue. After 4 hours, the work order is auto-cancelled and reassigned to a new provider.

XIV. Invoice Generation

Oweru invoices the Property Owner.

Invoices are generated after successful provider allocation and acceptance (work order confirmed).

Each service generates a separate invoice from Oweru to the owner reflecting the total service cost.

Invoice is submitted to the property owner for payment to Oweru.

XV. Payment Processing

Property Owners pay Oweru. Payments are processed through Selcom integration (mobile money).

Upon successful payment to Oweru:

Invoice marked as paid
Revenue distribution by Oweru:
20% retained by Oweru (platform commission)
80% credited to Service Provider's internal wallet
Failed payments keep invoices in pending state. After 3 failed attempts, the service is suspended.

XVI. Revenue Model

Oweru collects 100% of service fees from owners and retains 20% as commission.

Oweru pays providers 80% of the service fee upon successful task completion.

Provider earnings are available for withdrawal immediately after task verification.

XVII. Provider Wallet System

Service providers have internal wallets tracking earnings owed by Oweru (80% of each service fee).

Providers can request withdrawals after reaching minimum threshold (50,000 TZS).

Withdrawals processed by Oweru within 24 hours to provider's mobile money.

Transaction history includes earnings, withdrawals, and penalties.

XVIII. Utility Management

Utility costs (water, electricity) are managed separately from Oweru services.

Utility bills are recorded manually and distributed among tenants using configurable allocation methods (per unit, per person, or square footage).

Utility expenses are tracked and included in financial analytics.

XIX. Owner Analytics

The system provides property owners with financial insights across all their properties.

Analytics include total service costs paid to Oweru, utility expenses, and overall property costs.

XX. Parallel Service Execution

Multiple services under a single property operate independently.

Each service maintains its own internal provider assignment, execution, and completion lifecycle.

Delays or failures in one service do not affect others.

XXI. Security and Data Privacy

The system enforces strict role-based access control.

Isolation Principle: Property owner data (names, contacts, addresses) is never visible to providers. Provider data (names, contacts, personal details) is never visible to owners. All communication occurs through Oweru platform messaging.

Sensitive data is encrypted (AES-256) and accessible only to administrators. Staff view masked data.

Audit Trail: All state changes (price updates, assignments, status changes, payments) are logged with timestamps and user IDs for 7 years.

XXII. Exception Handling

Provider Rejection: Automatic re-selection to next ranked provider within 6-hour windows until accepted.

No-Show: Provider fails to check in within 2 hours of scheduled time. Task flagged as overdue. After 4 hours, work order auto-cancelled, provider receives strike (3 strikes = 30-day suspension), new provider assigned by Oweru.

Payment Failure: Invoice remains pending, owner notified. Service suspended after 7 days unpaid.

Disputes:

Owner may dispute completed tasks through Oweru within 24 hours of completion.
Oweru Staff reviews evidence within 48 hours.
Resolution: Refund to owner (full or partial) or payment release to provider (via Oweru).
XXIII. Non-Functional Requirements

Performance: Pricing calculations complete within 200ms. Page loads under 2 seconds.

Availability: 99.9% uptime.

Scalability: Support for 10,000 properties without architecture changes.

Data Retention: Financial records 7 years, system logs 90 days, deleted accounts anonymized after 3 years.

XXIV. Future Enhancements

Mobile applications for providers and owners, automated utility meter integrations, AI-driven provider optimization, and multi-language support.