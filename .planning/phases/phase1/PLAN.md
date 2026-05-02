---
phase: "01-platform-foundation"
goal: "Owner can register, onboard property, request a quote, and submit an agreement with audit trails"
status: "pending"
---

# Phase 1: Platform Foundation + Owner Onboarding

## Objective

Establish the foundational platform enabling property owners to register, onboard properties, request quotes, and submit service agreements—all with complete audit trails.

## Exit Criteria (Week 1)

- [ ] Owner can register, onboard property, request a quote, and submit an agreement
- [ ] OPSMP design system established with dark navy, gold, off-white, and structured surfaces
- [ ] Logo usage and brand color tokens defined in the design doc and ready for UI implementation
- [ ] Quote locking and expiry behavior is tested
- [ ] All Week 1 state changes generate audit events

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

## Deliverables

### 1. Users & Authentication
- Auth.js v5 login, registration, session management
- Role guards for admin/owner/provider/staff
- User and profile models with validation
- Masked profile selectors for non-admin roles
- Account lifecycle: create, activate, suspend

### 2. Properties
- Property onboarding flow (create, list, detail, update status)
- Validation: location (PostGIS), type, unit count, image metadata
- Owner-scoped property access policies

### 3. Service Catalog
- Admin-managed service types with base price and pricing rules
- Read-only catalog endpoints for owner service selection

### 4. Pricing Engine
- Rule engine: quote = f(service type, location factor, frequency, unit count)
- 24-hour quote lock with expiration timestamp
- Recalculation guard during lock period
- Deterministic pricing tests

### 5. Agreements
- Agreement creation from accepted quote
- Status flow: QUOTED → PENDING_ASSIGNMENT
- Immutable quoted price after submission

### 6. Notifications
- In-app notification foundation
- SMS abstraction layer (swappable provider)
- Templated events for auth and quote lifecycle

### 7. Design System
- OPSMP brand tokens: dark navy (`#1B2A4A`), gold (`#F0A500`), off-white (`#F5F5F5`)
- Typography, logo placement, spacing, border system
- `oweru.jpeg` as primary logo asset

### 8. Audit Trail
- Append-only audit event writer
- Schema: actorId, entityType, entityId, oldValue, newValue, timestamp
- Integrated into all state changes

---

## Task Breakdown by Wave

### Wave 1: Foundation (No Dependencies)

#### Task 1.1: Design System — Brand Tokens & Clean UI Foundation
**Complexity:** High
**Files to Create/Modify:**
- `tailwind.config.ts` — Full OPSMP brand tokens with custom colors, fonts, spacing
- `src/app/globals.css` — CSS custom properties + Inter font import
- `public/oweru.jpeg` — Place logo asset
- `src/components/ui/Logo.tsx` — Create logo component
- `src/components/layout/TopNavBar.tsx` — Create top navigation bar
- `src/components/layout/SideNavBar.tsx` — Create side navigation bar
- `src/components/layout/DashboardShell.tsx` — Main layout wrapper with navbars
- `src/components/ui/BentoCard.tsx` — Reusable bento grid card component
- `src/components/ui/DataTable.tsx` — Reusable data table component
- `src/components/ui/StatusBadge.tsx` — Status badge component (URGENT, IN PROGRESS, etc.)

**Description:**
Implement OPSMP clean UI design system matching the reference interface. Configure Tailwind with:
- **Colors:** Primary (`#000000`/`#131b2e`), accent gold (`#F0A500`), background (`#fcf8fa`/`#ffffff`), surface variants
- **Typography:** Inter font family with h1 (24px/32px), h2 (18px/28px), body-md (14px/20px), body-sm (13px/18px), table-header (12px/16px)
- **Spacing:** xl (32px), lg (24px), md (16px), base (4px), table-cell-padding-x (12px), table-cell-padding-y (8px)
- **Border Radius:** DEFAULT (0.125rem), lg (0.25rem), xl (0.5rem), full (0.75rem)
- **Material Symbols Outlined** icons integration

Create TopNavBar with: logo "PropManager Pro", nav links (Dashboard, Portfolio, Leases), action icons (notifications, help, settings), user avatar
Create SideNavBar with: Management Console header, nav items (Dashboard, Properties, Workflows, Financials, Operations, Reports), New Service Request button, Support/Documentation links
Create reusable BentoCard for financial summary cards with icon, label, value, trend indicator
Create DataTable with proper styling for service requests listing

**Acceptance Criteria:**
- [ ] `tailwind.config.ts` has complete OPSMP color palette (on-primary, secondary-container, tertiary-container, surface-*, etc.)
- [ ] `tailwind.config.ts` has custom fontFamily (h1, h2, body-md, body-sm, table-header, data-tabular, label)
- [ ] `tailwind.config.ts` has custom fontSize with lineHeight and letterSpacing
- [ ] `tailwind.config.ts` has custom spacing and borderRadius
- [ ] `globals.css` imports Inter font from Google Fonts
- [ ] `globals.css` imports Material Symbols Outlined font
- [ ] `globals.css` defines all CSS custom properties for colors
- [ ] TopNavBar renders with logo, nav links, icons, user avatar
- [ ] SideNavBar renders with all nav items, active state highlighting
- [ ] BentoCard component accepts icon, label, value, trend props
- [ ] DataTable component accepts columns and data props with proper styling
- [ ] StatusBadge renders URGENT (red), IN PROGRESS (blue), SCHEDULED (purple), COMPLETED (gray)
- [ ] Logo component renders `oweru.jpeg` from public directory

**Verification:**
```bash
npm run dev
# Visit http://localhost:3000 and verify:
# 1. TopNavBar displays correctly with all elements
# 2. SideNavBar shows all navigation items with proper active states
# 3. Bento cards render with correct styling
# 4. Data table has proper typography and spacing
# 5. All brand colors applied per design system
```

---

#### Task 1.2: Main Dashboard Page — Bento Grid + Data Table
**Complexity:** Medium
**Files to Create/Modify:**
- `src/app/(dashboard)/owner/page.tsx` — Owner dashboard with bento grid
- `src/app/(dashboard)/admin/page.tsx` — Admin dashboard
- `src/features/dashboard/components/PortfolioOverview.tsx` — Portfolio summary section
- `src/features/dashboard/components/FinancialSummaryCards.tsx` — Bento cards (Total Spend, Active Requests, ROI)
- `src/features/dashboard/components/PropertyCardGrid.tsx` — Property cards (The Heights, Ironwood, Nexus)
- `src/features/dashboard/components/ServiceRequestsTable.tsx` — Data table with status badges

**Description:**
Build the main dashboard page matching the reference UI. Create Portfolio Overview section with h1 "Portfolio Overview" and subtitle. Create Financial Summary Cards using BentoCard component: Total Portfolio Spend ($428,950.00), Active Requests (24), Maintenance ROI (94.2%). Create Property Card Grid with property cards showing image, name, type badge, address, units, occupancy. Create Service Requests Data Table with columns: Status (badge), Property, Service Type, Request Date, Cost. Use proper table-header typography, table-cell-padding, and data-tabular font settings.

**Acceptance Criteria:**
- [ ] Dashboard renders with TopNavBar and SideNavBar layout
- [ ] Portfolio Overview section with h1 and subtitle
- [ ] 3 BentoCards with correct values, icons, trend indicators
- [ ] Property cards grid (3 columns) with image, badge, details
- [ ] Service Requests table with 5 rows, status badges, proper typography
- [ ] All cards/tables use correct Tailwind custom classes (font-h1, font-table-header, etc.)
- [ ] Status badges render correctly (URGENT red, IN PROGRESS blue, SCHEDULED purple, COMPLETED gray)

**Verification:**
```bash
npm run dev
# Visit http://localhost:3000/dashboard
# Verify layout matches reference UI exactly
# Check bento cards, property cards, data table styling
```

---

#### Task 1.3: Database Schema — Prisma Models
**Complexity:** High  
**Files to Create/Modify:**
- `prisma/schema.prisma` — Add all Phase 1 models
- `prisma/seed.ts` — Update seed with new models (if needed)

**Description:**
Update Prisma schema with User (including role enum: ADMIN, OWNER, PROVIDER, STAFF), Profile, Property (with PostGIS geometry for location), ServiceType, Quote (with pricing fields and expiration), Agreement, Notification, AuditEvent models. Configure proper relations, indexes, and extensions (pgcrypto, postgis).

**Prisma Models to Create/Update:**
```prisma
enum Role { ADMIN OWNER PROVIDER STAFF }

model User {
  id            String   @id @default(cuid())
  email         String   @unique
  passwordHash  String
  role          Role     @default(OWNER)
  status        String   @default("ACTIVE")
  profile       Profile?
  properties    Property[]
  quotes        Quote[]
  agreements    Agreement[]
  sentNotifications Notification[] @relation("Sender")
  auditEvents   AuditEvent[] @relation("Actor")
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Profile {
  id        String   @id @default(cuid())
  userId    String   @unique
  user      User     @relation(fields: [userId], references: [id])
  firstName String?
  lastName  String?
  phone     String?  // Encrypted at app layer
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Property {
  id             String   @id @default(cuid())
  ownerId        String
  owner          User     @relation(fields: [ownerId], references: [id])
  name           String
  location       Unsupported("geometry(Point, 4326)") // PostGIS
  locationText   String   // Human-readable address (encrypted)
  type           String   // RESIDENTIAL, COMMERCIAL, etc.
  unitCount      Int
  imageUrls      String[] // Array of uploaded image URLs
  status         String   @default("PENDING")
  quotes         Quote[]
  agreements     Agreement[]
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}

model ServiceType {
  id             String   @id @default(cuid())
  name           String
  basePrice      Decimal  @db.Decimal(10, 2)
  pricingRules   Json     // Store pricing rules as JSON
  isActive       Boolean  @default(true)
  quotes         Quote[]
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}

model Quote {
  id             String   @id @default(cuid())
  ownerId        String
  owner          User     @relation(fields: [ownerId], references: [id])
  propertyId     String
  property       Property @relation(fields: [propertyId], references: [id])
  serviceTypeId  String
  serviceType    ServiceType @relation(fields: [serviceTypeId], references: [id])
  quotedPrice    Decimal  @db.Decimal(10, 2)
  priceLockedUntil DateTime? // 24-hour lock
  status         String   @default("DRAFT") // DRAFT, QUOTED, EXPIRED, ACCEPTED
  agreement      Agreement?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}

model Agreement {
  id             String   @id @default(cuid())
  quoteId        String   @unique
  quote          Quote     @relation(fields: [quoteId], references: [id])
  ownerId        String
  owner          User      @relation(fields: [ownerId], references: [id])
  propertyId     String
  property       Property  @relation(fields: [propertyId], references: [id])
  quotedPrice    Decimal   @db.Decimal(10, 2) // Immutable after submission
  status         String    @default("QUOTED") // QUOTED, PENDING_ASSIGNMENT, ACTIVE, COMPLETED, CANCELLED
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
}

model Notification {
  id             String   @id @default(cuid())
  userId         String
  user           User     @relation("Sender", fields: [userId], references: [id])
  type           String   // EMAIL, SMS, IN_APP
  event          String   // AUTH_REGISTER, QUOTE_REQUESTED, etc.
  payload        Json     // Event-specific data
  isRead         Boolean  @default(false)
  createdAt      DateTime @default(now())
}

model AuditEvent {
  id             String   @id @default(cuid())
  actorId        String?
  actor          User?    @relation("Actor", fields: [actorId], references: [id])
  entityType     String   // User, Property, Quote, Agreement, etc.
  entityId       String
  action         String   // CREATE, UPDATE, DELETE, STATUS_CHANGE
  oldValue       Json?
  newValue       Json?
  timestamp      DateTime @default(now())
}
```

**Acceptance Criteria:**
- [ ] All models defined with correct fields and relations
- [ ] PostGIS extension enabled for Property location field
- [ ] pgcrypto extension enabled for encryption support
- [ ] Prisma schema validates: `npx prisma validate`
- [ ] Migration generated: `npx prisma migrate dev --name phase1_foundation`

**Verification:**
```bash
npx prisma validate
npx prisma migrate dev --name phase1_foundation
```

---

#### Task 1.4: Auth Foundation — NextAuth v5 + Registration
**Complexity:** High  
**Files to Create/Modify:**
- `src/core/auth/index.ts` — NextAuth config (update if exists)
- `src/core/auth/callbacks.ts` — JWT callbacks for role extraction
- `src/app/api/auth/[...nextauth]/route.ts` — Auth API route
- `src/app/api/auth/register/route.ts` — Registration endpoint
- `src/features/users/types.ts` — User schemas with Zod
- `src/features/users/actions.ts` — Server Actions for auth
- `src/features/users/components/LoginForm.tsx` — Login UI (update if exists)
- `src/features/users/components/RegisterForm.tsx` — Registration UI
- `src/app/(auth)/login/page.tsx` — Login page (update if exists)
- `src/app/(auth)/register/page.tsx` — Registration page

**Description:**
Configure NextAuth v5 with credentials provider using bcryptjs for password hashing. Implement JWT strategy with role extraction in callbacks. Create registration API endpoint and Server Action. Build login and registration forms with Zod validation. Session management with `useSession` and `SessionProvider`.

**Acceptance Criteria:**
- [ ] User can register with email, password, role (defaults to OWNER)
- [ ] Password hashed with bcryptjs before storage
- [ ] User can login and receive JWT session with role
- [ ] `session.user.role` accessible in client and server
- [ ] LoginForm and RegisterForm have Zod validation
- [ ] Protected routes redirect to login when unauthenticated

**Verification:**
```bash
npm run dev
# 1. Visit /register, create account
# 2. Visit /login, sign in
# 3. Check session has role: useSession() or check JWT callback
```

---

### Wave 2: Core Models (Depends on Wave 1)

#### Task 2.1: User Management + Role Guards
**Complexity:** Medium  
**Files to Create/Modify:**
- `src/components/RoleGuard.tsx` — Client-side role guard (update if exists)
- `src/core/auth/guards.ts` — Server-side role check helper
- `src/features/users/actions.ts` — Add account lifecycle actions
- `src/features/users/queries.ts` — Add user queries with masked profiles
- `src/app/api/admin/users/route.ts` — Admin user management API
- `src/app/(dashboard)/admin/users/page.tsx` — Admin user list page

**Description:**
Implement RoleGuard component for client-side auth checks (already exists, verify/update). Create server-side role guard helper (`requireRole()`). Add account lifecycle Server Actions: activate, suspend. Build masked profile selectors that hide PII for non-admin roles. Admin user management page with list, activate, suspend actions.

**Acceptance Criteria:**
- [ ] RoleGuard component works for admin/owner/provider/staff
- [ ] `requireRole(role)` helper throws if unauthorized (server-side)
- [ ] Account lifecycle: create (via register), activate, suspend endpoints work
- [ ] Non-admin users see masked profiles (phone hidden)
- [ ] Admin can list all users and change status

**Verification:**
```bash
# Test RoleGuard with different user roles
# Test account lifecycle endpoints with admin user
npm test -- --run src/__tests__/api/register.test.ts
```

---

#### Task 2.2: Property Onboarding Flow + Clean Property Cards
**Complexity:** High  
**Files to Create/Modify:**
- `src/features/properties/types.ts` — Property schemas with Zod
- `src/features/properties/actions.ts` — Create, update, list properties
- `src/features/properties/queries.ts` — Server-side data fetching
- `src/features/properties/components/PropertyCard.tsx` — Clean property card (matching reference UI)
- `src/features/properties/components/CreatePropertyForm.tsx` — Onboarding form
- `src/features/properties/components/PropertyList.tsx` — List owner properties (grid layout)
- `src/features/properties/components/PropertyDetail.tsx` — Property details
- `src/app/(dashboard)/owner/properties/page.tsx` — Owner property list page (3-col grid)
- `src/app/(dashboard)/owner/properties/new/page.tsx` — Create property page
- `src/app/(dashboard)/owner/properties/[id]/page.tsx` — Property detail page

**Description:**
Build property onboarding flow with create, list, detail, update status. Validation for location (lat/lng with PostGIS), type (enum), unit count (min 1), image metadata (URL array). Owner-scoped access: owners can only see their own properties.

PropertyCard component matching reference UI:
- Card with border, rounded corners, overflow-hidden
- Property image (h-32, object-cover, hover:scale-105 transition)
- Card content with property name (font-bold), type badge (uppercase, 10px, rounded)
- Address text (body-sm, on-surface-variant)
- Footer with units icon + count, occupancy percentage (font-bold)

PropertyList page uses 3-column grid (grid-cols-1 md:grid-cols-3) with PropertyCard components.
Use Server Actions for mutations, Server Components for data fetching.

**Acceptance Criteria:**
- [ ] Owner can create property with validation (location, type, unit count, images)
- [ ] Owner can list their properties (scoped by ownerId) in 3-col grid
- [ ] PropertyCard matches reference UI design (image, badge, details, footer)
- [ ] PropertyCard has hover effect (border color, image scale)
- [ ] Owner can view property details page
- [ ] Owner can update property status
- [ ] Non-owner cannot access other's properties (server + client check)
- [ ] Images uploaded and URLs stored in `imageUrls` array

**Verification:**
```bash
npm run dev
# 1. Login as owner
# 2. Create new property with all fields
# 3. View property list (3-col grid, only shows owner's properties)
# 4. Verify PropertyCard styling matches reference UI
# 5. View property detail
# 6. Try accessing another owner's property (should 403)
```

---

#### Task 2.3: Service Catalog + Clean Service Cards
**Complexity:** Medium  
**Files to Create/Modify:**
- `src/features/services/types.ts` — ServiceType schemas
- `src/features/services/actions.ts` — Admin CRUD for service types
- `src/features/services/queries.ts` — Read services (public + admin)
- `src/features/services/components/ServiceCard.tsx` — Clean service card with pricing
- `src/features/services/components/ServiceForm.tsx` — Admin create/edit
- `src/features/services/components/ServiceList.tsx` — List services (grid layout)
- `src/app/(dashboard)/admin/services/page.tsx` — Admin service management
- `src/app/api/services/route.ts` — Public read-only catalog endpoint
- `prisma/schema.prisma` — Verify ServiceType model (from Task 1.3)

**Description:**
Create admin-managed service types with name, base price (Decimal), and pricing rules (JSON storage). Build admin UI for CRUD operations.

ServiceCard component matching reference UI:
- Card with border, rounded corners, hover:border-on-surface transition
- Service name (font-h2, 14px, font-bold)
- Service type badge (10px, bg-slate-100, uppercase)
- Base price display (font-data-tabular, text-right, font-semibold)
- Optional: unit count or location factor display

ServiceList page uses grid layout matching PropertyList (3-col on md+).
Public read-only API endpoint for owners to browse services. Pricing rules stored as JSON: `{ "locationFactor": {...}, "frequencyMultiplier": {...} }`.

**Acceptance Criteria:**
- [ ] Admin can create service type with base price and pricing rules
- [ ] Admin can edit and deactivate service types
- [ ] ServiceCard matches reference UI styling (card, badge, price)
- [ ] ServiceList uses grid-cols-1 md:grid-cols-3 layout
- [ ] Owners can view read-only catalog via API (`/api/services`)
- [ ] Pricing rules stored as JSON and retrieved correctly
- [ ] Service list displays base price and active status

**Verification:**
```bash
# Test admin service creation
# Test public catalog endpoint: curl http://localhost:3000/api/services
# Verify ServiceCard matches reference UI styling
npm test -- --run src/__tests__/api/services.test.ts
```

---

### Wave 3: Business Logic (Depends on Wave 2)

#### Task 3.1: Pricing Engine + Quote Locking
**Complexity:** High  
**Files to Create/Modify:**
- `src/features/pricing/types.ts` — Pricing rule types
- `src/features/pricing/engine.ts` — Quote calculation logic
- `src/features/pricing/actions.ts` — Pricing Server Actions
- `src/features/pricing/queries.ts` — Pricing queries
- `src/__tests__/pricing/engine.test.ts` — Deterministic pricing tests
- `src/features/quotes/types.ts` — Quote schemas (update)
- `src/features/quotes/actions.ts` — Create quote with pricing (update)

**Description:**
Implement pricing rule engine: `quote = basePrice × locationFactor × frequencyMultiplier × unitCount`. Build 24-hour quote lock: set `priceLockedUntil` timestamp on quote creation. Recalculation guard: reject price recalc if lock active. Write deterministic tests: same inputs always produce same quote.

**Pricing Engine Logic:**
```typescript
// src/features/pricing/engine.ts
export function calculateQuote(params: {
  basePrice: Decimal;
  locationFactor: number;  // e.g., 1.0 for city center, 0.8 for suburbs
  frequencyMultiplier: number; // e.g., 1.0 for one-time, 0.9 for weekly
  unitCount: number;
}): Decimal {
  return params.basePrice
    .times(params.locationFactor)
    .times(params.frequencyMultiplier)
    .times(params.unitCount);
}
```

**Acceptance Criteria:**
- [ ] Quote calculation is deterministic (same inputs = same output)
- [ ] Location factor applied correctly (test with known values)
- [ ] Frequency multiplier applied correctly
- [ ] Unit count scales price linearly
- [ ] 24-hour lock sets `priceLockedUntil` on quote
- [ ] Recalculation throws error if lock is active
- [ ] Pricing tests pass with repeatable outputs

**Verification:**
```bash
npm test -- --run src/__tests__/pricing/
# Test edge cases: zero units, high unit count, various location factors
```

---

#### Task 3.2: Quote Request Flow + Clean Data Table
**Complexity:** High  
**Files to Create/Modify:**
- `src/features/quotes/types.ts` — Quote schemas with Zod
- `src/features/quotes/actions.ts` — Request quote, update status
- `src/features/quotes/queries.ts` — List quotes, get quote details
- `src/features/quotes/components/QuoteRequestForm.tsx` — Request form
- `src/features/quotes/components/QuoteCard.tsx` — Display quote (card view)
- `src/features/quotes/components/QuoteList.tsx` — List owner quotes (uses DataTable)
- `src/features/quotes/components/QuoteTable.tsx` — DataTable view with status badges
- `src/app/(dashboard)/owner/quotes/page.tsx` — Owner quote list (table + cards)
- `src/app/(dashboard)/owner/quotes/new/page.tsx` — Request quote page
- `src/app/(dashboard)/owner/quotes/[id]/page.tsx` — Quote detail

**Description:**
Build quote request flow: owner selects property + service type, pricing engine calculates quote, 24-hour lock applied. Quote status flow: DRAFT → QUOTED → ACCEPTED/EXPIRED. Owner can view their quotes, see quoted price, accept quote (moves to agreement creation). Integrate with pricing engine from Task 3.1.

QuoteTable component using DataTable with columns:
- Status (badge: QUOTED blue, ACCEPTED green, EXPIRED gray, DRAFT light)
- Property name (font-data-tabular)
- Service Type (font-data-tabular)
- Quote Date (font-data-tabular)
- Quoted Price (text-right, font-semibold, font-data-tabular)
- Actions (View/Accept buttons)

Use proper table-header typography, table-cell-padding-x (12px), table-cell-padding-y (8px) from design system.

**Acceptance Criteria:**
- [ ] Owner can request quote by selecting property + service type
- [ ] Pricing engine calculates and displays quoted price
- [ ] Quote saved with 24-hour `priceLockedUntil`
- [ ] Owner can list their quotes (scoped by ownerId) in table view
- [ ] QuoteTable uses DataTable component with proper styling
- [ ] Status badges render correctly (QUOTED, ACCEPTED, EXPIRED, DRAFT)
- [ ] Table uses font-table-header for headers, font-data-tabular for cells
- [ ] Owner can view quote details with breakdown
- [ ] Accepting quote transitions status to ACCEPTED
- [ ] Expired quotes (past lock time) show EXPIRED status

**Verification:**
```bash
npm run dev
# 1. Login as owner
# 2. Create property (if not already)
# 3. Request quote: select property + service
# 4. View quote list (table view with proper styling)
# 5. View quote with price breakdown
# 6. Accept quote (status → ACCEPTED)
# 7. Verify lock timestamp and expiry behavior
# 8. Verify DataTable styling matches reference UI
```

---

#### Task 3.3: Agreement Creation
**Complexity:** Medium  
**Files to Create/Modify:**
- `src/features/agreements/types.ts` — Agreement schemas
- `src/features/agreements/actions.ts` — Create agreement from quote
- `src/features/agreements/queries.ts` — List agreements, get details
- `src/features/agreements/components/AgreementCard.tsx` — Display agreement
- `src/features/agreements/components/AgreementList.tsx` — List agreements
- `src/app/(dashboard)/owner/agreements/page.tsx` — Owner agreement list
- `src/app/(dashboard)/owner/agreements/[id]/page.tsx` — Agreement detail

**Description:**
Build agreement creation from accepted quote. Status flow: QUOTED → PENDING_ASSIGNMENT. Immutable quoted price: copy `quotedPrice` from Quote to Agreement on creation, prevent modification after submission. Owner can view their agreements.

**Acceptance Criteria:**
- [ ] Agreement created from accepted quote (status: QUOTED)
- [ ] Quoted price copied from quote and immutable after submission
- [ ] Agreement status transitions: QUOTED → PENDING_ASSIGNMENT
- [ ] Owner can list their agreements (scoped by ownerId)
- [ ] Owner can view agreement details with immutable price
- [ ] Attempting to modify price after submission throws error

**Verification:**
```bash
npm run dev
# 1. Accept quote (from Task 3.2)
# 2. Agreement auto-created with status QUOTED
# 3. Verify quotedPrice matches original quote
# 4. Submit agreement (status → PENDING_ASSIGNMENT)
# 5. Attempt to modify price (should fail)
```

---

### Wave 4: Cross-Cutting Concerns (Depends on Wave 3)

#### Task 4.1: Notification Foundation
**Complexity:** Medium  
**Files to Create/Modify:**
- `src/features/notifications/types.ts` — Notification schemas
- `src/features/notifications/actions.ts` — Create notifications
- `src/features/notifications/queries.ts` — Get user notifications
- `src/features/notifications/components/NotificationBell.tsx` — UI bell
- `src/features/notifications/components/NotificationList.tsx` — List
- `src/integrations/sms/` — SMS abstraction (factory pattern)
- `src/core/events/index.ts` — Templated event system
- `src/app/api/notifications/route.ts` — Notification API

**Description:**
Create notification foundation with in-app notifications (stored in DB) and SMS abstraction layer (swappable provider). Build templated events: AUTH_REGISTER, QUOTE_REQUESTED, QUOTE_ACCEPTED, AGREEMENT_SUBMITTED. Wire events to triggers in Server Actions. SMS abstraction: `src/integrations/sms/` with `sendSMS(phone, message)` interface.

**Acceptance Criteria:**
- [ ] In-app notifications created and stored in Notification model
- [ ] NotificationBell shows unread count in dashboard header
- [ ] NotificationList displays notifications with read/unread state
- [ ] SMS abstraction layer with `sendSMS()` interface (mock for now)
- [ ] Templated events fire on auth and quote lifecycle
- [ ] Events create appropriate notifications

**Verification:**
```bash
npm run dev
# 1. Register new user → AUTH_REGISTER event → notification created
# 2. Request quote → QUOTE_REQUESTED event → notification created
# 3. Click NotificationBell → see notifications
# 4. Mark notification as read
```

---

#### Task 4.2: Audit Trail Integration
**Complexity:** Medium  
**Files to Create/Modify:**
- `src/features/audits/writer.ts` — Append-only audit writer
- `src/features/audits/queries.ts` — Query audit events
- Integration into all Server Actions:
  - `src/features/users/actions.ts`
  - `src/features/properties/actions.ts`
  - `src/features/quotes/actions.ts`
  - `src/features/agreements/actions.ts`
- `src/app/(dashboard)/admin/audits/page.tsx` — Admin audit log viewer

**Description:**
Create append-only audit event writer: `writeAudit(actorId, entityType, entityId, action, oldValue, newValue)`. Integrate into all Server Actions to log CREATE, UPDATE, STATUS_CHANGE events. Schema includes: actorId, entityType, entityId, action, oldValue (JSON), newValue (JSON), timestamp. Build admin audit log viewer.

**Audit Writer Example:**
```typescript
// src/features/audits/writer.ts
'use server';
import { prisma } from '@/core/database/client';

export async function writeAudit(params: {
  actorId: string;
  entityType: string;
  entityId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'STATUS_CHANGE';
  oldValue?: any;
  newValue?: any;
}) {
  await prisma.auditEvent.create({
    data: {
      actorId: params.actorId,
      entityType: params.entityType,
      entityId: params.entityId,
      action: params.action,
      oldValue: params.oldValue ?? null,
      newValue: params.newValue ?? null,
    },
  });
}
```

**Acceptance Criteria:**
- [ ] Audit writer creates events with all required fields
- [ ] All CREATE actions log audit (users, properties, quotes, agreements)
- [ ] All UPDATE/STATUS_CHANGE actions log audit with old/new values
- [ ] Audit events are append-only (no update/delete methods exposed)
- [ ] Admin can view audit log with filters (entityType, date range)
- [ ] All Week 1 state changes generate audit events

**Verification:**
```bash
npm run dev
# 1. Perform actions: register, create property, request quote, accept quote
# 2. Check audit log: http://localhost:3000/admin/audits
# 3. Verify all actions logged with correct actorId, entityType, action
```

---

### Wave 5: Verification (Depends on Wave 4)

#### Task 5.1: End-to-End Owner Flow Test
**Complexity:** Medium  
**Files to Create/Modify:**
- `src/__tests__/e2e/owner-flow.test.ts` — E2E test script
- Manual test checklist (documented below)

**Description:**
Execute complete owner flow manually and/or with automated tests: Register → Login → Onboard Property → Request Quote → Accept Quote → Submit Agreement. Verify each step works end-to-end. Document any issues.

**Manual Test Checklist:**
- [ ] **Register:** Visit `/register`, create owner account with email/password
- [ ] **Login:** Visit `/login`, sign in with new account, redirected to dashboard
- [ ] **Onboard Property:** Visit `/owner/properties/new`, create property with:
  - [ ] Name: "Sunset Apartments"
  - [ ] Location: Select on map or enter lat/lng
  - [ ] Type: RESIDENTIAL
  - [ ] Unit Count: 4
  - [ ] Images: Upload 1-2 property images
- [ ] **Request Quote:** Visit `/owner/quotes/new`, select property + service type
  - [ ] Pricing engine calculates quote correctly
  - [ ] Quote shows price breakdown
  - [ ] 24-hour lock timestamp displayed
- [ ] **Accept Quote:** View quote detail, click "Accept Quote"
  - [ ] Quote status → ACCEPTED
  - [ ] Agreement auto-created (status: QUOTED)
- [ ] **Submit Agreement:** View agreement, click "Submit Agreement"
  - [ ] Agreement status → PENDING_ASSIGNMENT
  - [ ] Quoted price is immutable (verify in DB)
- [ ] **Verify Audit Trail:** Visit `/admin/audits`
  - [ ] All actions logged: user create, property create, quote create, quote accept, agreement create, agreement submit

**Verification:**
```bash
# Run any automated E2E tests
npm test -- --run src/__tests__/e2e/

# Complete manual checklist above
# Document any failures or bugs
```

---

#### Task 5.2: Exit Criteria Final Verification + UI Audit
**Complexity:** Low  
**Files:** (Verification only, no code changes)

**Description:**
Verify all Week 1 exit criteria are met. Complete the checklist below. If any criterion fails, create follow-up tasks. Additionally, perform a UI audit against the reference design to ensure the interface matches the clean, professional look shown in the example.

**Exit Criteria Checklist:**

- [ ] **Criterion 1:** Owner can register, onboard property, request a quote, and submit an agreement
  - [ ] Registration works with email/password
  - [ ] Property onboarding creates property with validation
  - [ ] Quote request calculates price via pricing engine
  - [ ] Agreement submission works with immutable price

- [ ] **Criterion 2:** OPSMP design system established with dark navy, gold, off-white, structured surfaces
  - [ ] `tailwind.config.ts` has complete brand tokens (colors, fonts, spacing, borderRadius)
  - [ ] `globals.css` defines CSS custom properties matching brand colors
  - [ ] Logo component renders `oweru.jpeg`
  - [ ] TopNavBar renders with logo "PropManager Pro", nav links, icons, user avatar
  - [ ] SideNavBar renders with Management Console header, nav items, active states
  - [ ] All UI components use brand colors

- [ ] **Criterion 3:** Logo usage and brand color tokens defined
  - [ ] Logo component created: `src/components/ui/Logo.tsx`
  - [ ] Brand colors documented in `tailwind.config.ts`
  - [ ] Material Symbols Outlined icons integrated
  - [ ] Inter font imported and configured

- [ ] **Criterion 4:** Quote locking and expiry behavior tested
  - [ ] 24-hour lock sets `priceLockedUntil`
  - [ ] Recalculation guard prevents changes during lock
  - [ ] Expired quotes show EXPIRED status
  - [ ] Pricing engine tests pass (deterministic outputs)

- [ ] **Criterion 5:** All Week 1 state changes generate audit events
  - [ ] User registration logs audit
  - [ ] Property create/update logs audit
  - [ ] Quote create/accept logs audit
  - [ ] Agreement create/submit logs audit
  - [ ] Audit log viewer shows all events

**UI Audit Checklist (against reference design):**
- [ ] **TopNavBar:** Logo "PropManager Pro", nav links (Dashboard, Portfolio, Leases), action icons (notifications, help, settings), user avatar
- [ ] **SideNavBar:** Management Console header, role subtitle, nav items with icons (Dashboard, Properties, Workflows, Financials, Operations, Reports), New Service Request button, Support/Documentation links
- [ ] **Bento Cards:** 3 cards (Total Portfolio Spend, Active Requests, Maintenance ROI) with icon, label, value, trend indicator
- [ ] **Property Cards:** 3-column grid, image (h-32, object-cover), name (font-bold), type badge (10px, uppercase), address (body-sm), units + occupancy footer
- [ ] **Data Table:** Service Requests table with proper typography (table-header for headers, data-tabular for cells), status badges (URGENT red, IN PROGRESS blue, SCHEDULED purple, COMPLETED gray), proper padding (table-cell-padding-x, table-cell-padding-y)
- [ ] **Typography:** h1 (24px/32px), h2 (18px/28px), body-md (14px/20px), body-sm (13px/18px) applied correctly
- [ ] **Colors:** Background (#fcf8fa), surface (#ffffff), primary (#000000/#131b2e), borders (outline-variant) applied correctly
- [ ] **Hover Effects:** Property cards scale image, border color changes; nav items highlight; buttons have transition-all

**Verification:**
```bash
npm run dev
# Visit http://localhost:3000/dashboard
# Complete all checklists above
# Compare UI against reference design
# If any item fails, document and create fix tasks
echo "Phase 1 Exit Criteria + UI Audit Complete"
```

---

## Dependency Graph

```
Wave 1 (Foundation) — No Dependencies
├── Task 1.1: Design System — Brand Tokens & Clean UI Foundation
├── Task 1.2: Main Dashboard Page — Bento Grid + Data Table
├── Task 1.3: Database Schema — Prisma Models
└── Task 1.4: Auth Foundation — NextAuth v5 + Registration

Wave 2 (Core Models) — Depends on Wave 1
├── Task 2.1: User Management + Role Guards (needs 1.4)
├── Task 2.2: Property Onboarding Flow (needs 1.3, 1.4)
└── Task 2.3: Service Catalog (needs 1.3)

Wave 3 (Business Logic) — Depends on Wave 2
├── Task 3.1: Pricing Engine + Quote Locking (needs 2.3)
├── Task 3.2: Quote Request Flow (needs 2.2, 3.1)
└── Task 3.3: Agreement Creation (needs 3.2)

Wave 4 (Cross-Cutting) — Depends on Wave 3
├── Task 4.1: Notification Foundation (needs 1.4, 3.2)
└── Task 4.2: Audit Trail Integration (needs 2.1, 2.2, 3.2, 3.3)

Wave 5 (Verification) — Depends on Wave 4
├── Task 5.1: End-to-End Owner Flow Test
└── Task 5.2: Exit Criteria Final Verification
```

---

## File Creation Summary

| Task | Files Created | Files Modified |
|------|---------------|----------------|
| 1.1 | `Logo.tsx`, `TopNavBar.tsx`, `SideNavBar.tsx`, `DashboardShell.tsx`, `BentoCard.tsx`, `DataTable.tsx`, `StatusBadge.tsx` | `tailwind.config.ts`, `globals.css` |
| 1.2 | `owner/page.tsx`, `admin/page.tsx`, `PortfolioOverview.tsx`, `FinancialSummaryCards.tsx`, `PropertyCardGrid.tsx`, `ServiceRequestsTable.tsx` | (new files) |
| 1.3 | (Prisma schema update) | `schema.prisma` |
| 1.4 | Login/Register pages, forms, auth config | `users/types.ts`, `users/actions.ts` |
| 2.1 | Role guards, admin user pages | `users/actions.ts`, `users/queries.ts` |
| 2.2 | Property forms, pages, components | `properties/*` (all files) |
| 2.3 | Service catalog pages, components | `services/*` (all files) |
| 3.1 | Pricing engine, tests | `pricing/*`, `quotes/actions.ts` |
| 3.2 | Quote forms, pages, components | `quotes/*` (all files) |
| 3.3 | Agreement forms, pages, components | `agreements/*` (all files) |
| 4.1 | Notifications, SMS abstraction, events | `notifications/*`, `integrations/sms/` |
| 4.2 | Audit writer, admin audit page | `audits/writer.ts`, all `actions.ts` |
| 5.1 | E2E test script | (verification only) |
| 5.2 | (verification only) | (verification only) |

---

## Conventions to Follow

- **Components:** PascalCase (`PropertyCard.tsx`)
- **Utilities/Actions:** camelCase (`actions.ts`, `queries.ts`)
- **Server Actions:** `'use server'` directive at top of file
- **Client Components:** `'use client'` directive where needed (forms, hooks)
- **Validation:** Zod schemas with `@hookform/resolvers`
- **Data Fetching:** Server Components + Server Actions (no API routes for mutations)
- **Styling:** Tailwind CSS utility classes with brand tokens
- **Tests:** Co-located `.test.tsx` or `src/__tests__/` directory
- **Imports:** Absolute with `@/` alias, organized: React → Third-party → Internal

---

## Next Steps

After PLAN.md is created:

1. **Review this plan** with the team/user
2. **Execute tasks in wave order** (Wave 1 → Wave 2 → ...)
3. **Commit after each task** with descriptive messages
4. **Run tests frequently:** `npm test -- --run`
5. **Verify exit criteria** at the end of Wave 5

```bash
# To execute this phase:
# /gsd-execute-phase 01
```
