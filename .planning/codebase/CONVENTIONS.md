# Coding Conventions

**Analysis Date:** 2026-05-02

## Naming Patterns

**Files:**
- Components: PascalCase with descriptive names - `PropertyCard.tsx`, `LoginForm.tsx`, `UnifiedButton.tsx`
- Utility/action files: camelCase - `actions.ts`, `queries.ts`, `utils.ts`, `upload.ts`
- Type/schema files: camelCase with descriptive names - `types.ts`, often co-located with feature
- Test files: Co-located with `.test.ts` or `.test.tsx` suffix - `input.test.ts`, `LoginForm.test.tsx`
- Barrel files: `index.ts` used throughout features and components directories
- Config files: kebab-case - `tailwind.config.ts`, `vitest.config.ts`, `next.config.ts`

**Functions:**
- camelCase for all functions - `createProperty`, `registerOwner`, `encrypt`, `decrypt`
- Server actions exported as async functions from `actions.ts` files
- Event handlers prefixed with `handle` - `handleSubmit`

**Variables:**
- camelCase - `propertyCard`, `isSubmitting`, `serverError`
- Constants in UPPER_SNAKE_CASE - `DAR_ES_SALAAM_LAT`, `DAR_ES_SALAAM_LNG`, `MAX_REQUESTS`, `WINDOW_MS`, `ALGORITHM`, `IV_LENGTH`

**Types/Interfaces:**
- PascalCase with descriptive suffixes:
  - Props interfaces: `PropertyCardProps`, `UnifiedButtonProps`, `InputProps`
  - Schema types: `CreatePropertySchema`, `LoginSchema`, `OwnerRegisterSchema`
  - Inferred types: `CreatePropertyInput`, `LoginInput`, `OwnerRegisterInput`
  - Type exports use `type` keyword: `export type CreatePropertyInput = z.infer<typeof CreatePropertySchema>`

## Code Style

**Formatting:**
- No ESLint or Prettier config files detected - relies on Next.js built-in `next lint` command
- Lint command: `npm run lint` (runs `next lint`)
- Indentation: 2 spaces (inferred from code)
- Semicolons: Used consistently
- Single quotes for strings (inferred from code patterns)
- Trailing commas in multiline objects/arrays

**TypeScript Configuration (`tsconfig.json`):**
- Target: ES2020
- Module: esnext with bundler resolution
- Strict mode: enabled
- JSX: react-jsx
- Path aliases: `@/*` maps to `./src/*`
- Incremental compilation enabled
- Isolated modules enabled

**Directives:**
- `'use client'` directive at top of client components - `src/features/users/components/LoginForm.tsx`
- `'use server'` directive at top of server actions - `src/features/properties/actions.ts`, `src/features/users/actions.ts`

## Import Organization

**Order observed in codebase:**
1. React and Next.js imports
2. Third-party library imports (lucide-react, framer-motion, zod, etc.)
3. Absolute imports using `@/` path alias
4. Relative imports for co-located modules

**Path Aliases:**
- `@/` → `./src/` (configured in `tsconfig.json` and `vitest.config.ts`)
- Examples: `@/components/ui/UnifiedInput`, `@/core/database/client`, `@/core/lib/utils`

**Import patterns:**
```typescript
// React/Next
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Third-party
import { z } from 'zod';
import { signIn } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';

// Internal (absolute with @/)
import { UnifiedInput } from '@/components/ui/UnifiedInput';
import { prisma } from '@/core/database/client';
import { cn } from '@/core/lib/utils';

// Internal (relative)
import { CreatePropertySchema } from './types';
```

## Error Handling

**Patterns:**
- **Zod validation:** Uses `schema.safeParse()` returning `{ success, error, data }` pattern - `src/features/properties/actions.ts`
- **Server actions:** Return `{ success: boolean; error?: string }` objects - `src/features/users/actions.ts`
- **Thrown errors:** `throw new Error('Descriptive message')` for auth/validation failures - `src/features/services/actions.ts`
- **Try-catch with empty catch:** Some places use `try/catch` with empty catch blocks (e.g., `src/features/properties/actions.ts` line 49)
- **Auth checks:** Early return pattern with unauthorized responses - `if (!session?.user) return { success: false, error: 'Unauthorized' }`

**Example pattern from `src/features/properties/actions.ts`:**
```typescript
export async function createProperty(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user || session.user.role !== 'OWNER') {
    return { success: false, error: 'Unauthorized' };
  }

  const parsed = CreatePropertySchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.errors[0];
    return { success: false, error: first?.message ?? 'Validation failed' };
  }

  try {
    // operation
  } catch {
    // Non-fatal: skip failed images
  }
}
```

## Logging

**Framework:** console (no dedicated logging framework detected)

**Patterns:**
- Server-side: `console.log`, `console.error` not prominently used; errors thrown instead
- Client-side: Error states managed via React state (`serverError`, `setServerError`)
- toast notifications via `sonner` package for user-facing messages

## Comments

**When to Comment:**
- Section dividers using comment blocks: `// ── Upload images ────────────────────────────────────`
- JSDoc for exported components and functions: `/** Unified button component... */`
- Inline comments for non-obvious logic or workarounds

**JSDoc/TSDoc:**
- Used for exported components and utility functions
- Example from `src/components/ui/UnifiedButton.tsx`:
```typescript
/**
 * Unified button component supporting all variants with consistent API
 */
export const UnifiedButton = React.forwardRef<HTMLButtonElement, UnifiedButtonProps>(...
```

## Function Design

**Size:** Functions vary from small (5-10 lines) to larger server actions (30-50 lines)

**Parameters:**
- Destructured parameters with explicit types
- Optional parameters use `?` syntax: `ariaLabel?: string`
- Default values set in parameter destructuring: `variant = 'default'`, `size = 'md'`

**Return Values:**
- Server actions return result objects: `{ success: boolean; error?: string }`
- Queries return Prisma query results directly
- Components return JSX elements

## Module Design

**Exports:**
- Named exports preferred: `export function createProperty()`, `export const UnifiedButton`
- `React.forwardRef` used for components needing ref access
- `displayName` set for forwardRef components: `UnifiedButton.displayName = 'UnifiedButton'`

**Barrel Files:**
- Used extensively in features and components
- Examples: `src/features/properties/components/index.ts`, `src/features/users/components/index.ts`
- Export all public components/types from index.ts files

## Encryption & Security Patterns

**Field-level encryption:**
- PII fields encrypted at database layer via Prisma extension - `src/core/database/client.ts`
- `encrypt()` and `decrypt()` functions in `src/core/security/encryption.ts`
- Uses AES-256-GCM with PBKDF2 key derivation
- Fields encrypted: `user.phone`, `property.encryptedAddress`

**Rate limiting:**
- Simple in-memory rate limiter in `src/core/lib/rate-limit.ts`
- Uses Map-based store with sliding window
- 10 requests per 60-second window

## Feature Flags

**Configuration:** `src/config/featureFlags.ts`
- Uses environment variables with `NEXT_PUBLIC_` prefix for client-side access
- Example: `NEXT_PUBLIC_FEATURE_AUTH_REGISTER`

---

*Convention analysis: 2026-05-02*
