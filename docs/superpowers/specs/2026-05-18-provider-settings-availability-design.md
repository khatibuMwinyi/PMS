# Provider Settings + Availability — Design Spec

**Status:** Approved 2026-05-18
**Scope:** P1.6 (single feature, single implementation plan)
**Owner:** Provider section
**Related:** Provider P0 (merged `aa4fb0c`), P1.5 Task History (merged `b25a2eb`), P1.7 Strike Banner (merged `12ba27f`).

---

## Goal

Build `/provider/settings` so a logged-in PROVIDER can edit their business name, mobile-money default, service categories, service radius, and a list of blocked dates. Wire the blocked-date set into `findBestProvider` so providers actually stop receiving offers for blocked days.

## Non-Goals

- Operational zones edit (existing field, deferred — picker UX is its own design).
- Max concurrent assignments edit (admin-controlled per Full.md §XI).
- Date ranges for availability (single dates only this iteration).
- KYC document upload (P1.8).
- Encrypting `mobileMoneyNumber` (matches existing raw-storage pattern on `Withdrawal.mobileNumber`; flagged as a P2 followup).
- Operational-zone radius UI for property owners.

## Constraints

- **Schema:** add `ProviderProfile.mobileMoneyNumber String?` + new `ProviderBlockedDate` model. One Prisma migration.
- **Privacy / ownership:** every server action gates via `auth()` + `providerProfile.userId === session.user.id`. Pattern matches Provider P0 [server-action-security].
- **Matching contract:** `findBestProvider` MUST honor blocked dates when a scheduled date is supplied. Call sites without a date pass `undefined` and skip the check (graceful degradation, no false-skip).
- **Tailwind:** CSS-variable tokens, Lucide icons, Sonner toasts. No new dependencies.
- **Mobile money format:** Tanzania format `+255\d{9}` per existing `WithdrawalRequestSchema` regex.
- **Service radius:** integer 5–30 km. Matches the spec's `serviceRadiusKm` default of 10.

## Architecture

```
/provider/settings
  └── src/app/(dashboard)/provider/settings/page.tsx  (Server Component)
        ├── DashboardHeader
        ├── BusinessProfileForm  (client)
        ├── CoverageForm         (client)
        └── AvailabilityCalendar (client)
              ↓ all three call server actions in
              src/features/providers/actions.ts
```

Server page fetches a single `getProviderSettings(userId)` snapshot, hands typed props to three independent client form sections. Each section commits independently. No global form state.

## Schema additions

```prisma
// ProviderProfile (modify)
model ProviderProfile {
  // ...existing fields...
  mobileMoneyNumber String? @map("mobile_money_number")

  blockedDates  ProviderBlockedDate[]
}

// NEW
model ProviderBlockedDate {
  id          String   @id @default(uuid())
  providerId  String   @map("provider_id")
  blockedDate DateTime @map("blocked_date") @db.Date
  createdAt   DateTime @default(now()) @map("created_at")

  provider    ProviderProfile @relation(fields: [providerId], references: [id], onDelete: Cascade)

  @@unique([providerId, blockedDate])
  @@index([blockedDate])
  @@map("provider_blocked_dates")
}
```

Migration name: `provider_settings`. Run `pnpm prisma migrate dev --name provider_settings`.

## Components

| Unit | Path | Responsibility |
|---|---|---|
| Settings query | `src/features/providers/queries.ts` (extend) | `getProviderSettings(userId)` returns `{ profile, blockedDates: string[], serviceCatalog }`. Ownership-gated. |
| Settings Zod schemas | `src/features/providers/schemas.ts` (NEW) | `BusinessProfileSchema`, `CoverageSchema`, `BlockedDateSchema`. |
| Settings actions | `src/features/providers/actions.ts` (NEW) | `updateProviderProfile`, `updateProviderCoverage`, `addBlockedDate`, `removeBlockedDate`. Each is `'use server'`, each calls `requireProviderProfile` helper. |
| Provider auth helper | `src/features/providers/actions.ts` | `requireProviderProfile()` — same shape as the one in `features/tasks/actions.ts`; returns `{ providerId, userId }`, throws on miss. |
| `BusinessProfileForm` | `src/features/providers/components/BusinessProfileForm.tsx` (NEW) | Client. `businessName` (text) + `mobileMoneyNumber` (tel). Save button. Toast on success/error. |
| `CoverageForm` | `src/features/providers/components/CoverageForm.tsx` (NEW) | Client. Multi-select service categories from `serviceCatalog` + `serviceRadiusKm` number input. |
| `AvailabilityCalendar` | `src/features/providers/components/AvailabilityCalendar.tsx` (NEW) | Client. `<input type="date">` + Add button + list of blocked dates with remove buttons. Sorted ascending. |
| `/provider/settings/page.tsx` | `src/app/(dashboard)/provider/settings/page.tsx` (NEW) | Server Component. RoleGuard + DashboardHeader + Suspense + three sections. |
| `findBestProvider` query | `src/features/services/queries.ts:5` (modify) | Add optional 5th param `scheduledDate?: Date`. Pass through to repository. |
| `findBestProvider` repo | `src/features/services/repositories/index.ts:15` (modify) | Add `NOT EXISTS (...)` SQL clause when `scheduledDate` provided. Same clause when undefined: skip. |
| Agreement / assignment call sites | `src/features/agreements/actions.ts`, `src/features/assignments/actions.ts` | Pass `scheduledDate` if available, else `undefined`. |

Each file has one clear responsibility. Largest is `AvailabilityCalendar` (~80 lines). Actions file is split per concern.

## Data flow

### Read

1. Browser hits `/provider/settings`.
2. Page Server Component awaits session, calls `getProviderSettings(userId)`.
3. Query fetches `providerProfile.findUnique({ where: { userId }, include: { blockedDates: true } })` + `serviceType.findMany({ where: { isActive: true } })`.
4. Returns shaped snapshot.
5. Page renders `BusinessProfileForm initial={profile} />`, `<CoverageForm initial={profile} catalog={serviceCatalog} />`, `<AvailabilityCalendar dates={blockedDates} />`.

### Write (per section)

1. User edits, clicks Save (or Add for blocked date).
2. Client component calls server action with payload.
3. Server action: `auth()` → `requireProviderProfile()` → Zod parse → `prisma.providerProfile.update(...)` or `prisma.providerBlockedDate.create/delete(...)`.
4. Returns `{ success: true }` or throws with friendly message.
5. Client shows `toast.success(...)` and calls `router.refresh()` to re-pull the snapshot.

### Matching engine

`findBestProvider(propertyId, serviceTypeId, radiusKm, minScoreThreshold, scheduledDate?)`:
- When `scheduledDate` provided: SQL adds `AND NOT EXISTS (SELECT 1 FROM provider_blocked_dates WHERE provider_id = pp.id AND blocked_date = ${scheduledDate}::date)`.
- When undefined: clause omitted, all providers eligible (current behavior preserved).

Call site `src/features/agreements/actions.ts`: locate where assignment is first created. If a `scheduledDate` is computed at that point, pass it. Otherwise pass `undefined`.

Call site `src/features/assignments/actions.ts:108` (`reassignAssignment`): already loads the assignment; pass `assignment.scheduledDate ?? undefined`.

## Validation rules

| Field | Rule |
|---|---|
| `businessName` | min 2 chars, max 80 |
| `mobileMoneyNumber` | matches `/^\+255\d{9}$/` or null |
| `serviceCategories` | non-empty `string[]`, max 8 |
| `serviceRadiusKm` | int, 5 ≤ x ≤ 30 |
| `blockedDate` | parsable ISO date, `>= startOfToday()` in server time (UTC) — cannot block past dates |

Server-side rejection returns a Zod issue message string. Client shows it inline below the affected field; toast remains success-only.

## Empty / error states

- No profile yet (impossible for a logged-in provider — `RoleGuard` ensures PROVIDER role). If `getProviderSettings` returns null (defensive), show "Your provider profile is being verified" placeholder.
- No service categories selected → CoverageForm disables Save and shows "Pick at least one service category."
- No blocked dates → AvailabilityCalendar shows "No dates blocked. Add a date below to make yourself unavailable."
- Unique constraint violation on blocked date → friendly toast "That date is already blocked."

## Tests

| Test | File |
|---|---|
| `getProviderSettings` returns profile + dates + catalog | `src/features/providers/tests/settings.queries.test.ts` |
| `getProviderSettings` returns null when profile missing | same |
| `updateProviderProfile` validates phone format | `src/features/providers/tests/settings.actions.test.ts` |
| `updateProviderProfile` rejects unauthenticated | same |
| `updateProviderCoverage` validates radius range | same |
| `updateProviderCoverage` requires at least 1 category | same |
| `addBlockedDate` rejects past dates | same |
| `addBlockedDate` rejects duplicates with friendly message | same |
| `removeBlockedDate` ownership-gated | same |
| `findBestProvider` skips providers with matching blocked date | `src/features/services/tests/findBestProvider.test.ts` (NEW) |
| `findBestProvider` ignores blocked dates when scheduledDate undefined | same |
| `BusinessProfileForm` Save calls action with correct payload | `src/features/providers/components/BusinessProfileForm.test.tsx` |
| `CoverageForm` multi-select toggle works | `src/features/providers/components/CoverageForm.test.tsx` |
| `AvailabilityCalendar` adds + removes dates | `src/features/providers/components/AvailabilityCalendar.test.tsx` |

E2E deferred. ~14 new tests.

## Out of scope (followups)

- `mobileMoneyNumber` encryption via existing Prisma middleware (P2 — security pattern alignment).
- Operational zones picker (separate spec).
- Date-range blocked periods (defer until single-date model proves insufficient).
- Settings page on mobile breakpoint polish (use existing responsive utility classes).
