# Testing Patterns

**Analysis Date:** 2026-05-02

## Test Framework

**Runner:**
- Vitest ^4.1.5
- Config: `vitest.config.ts`

**Environment:**
- jsdom (simulates browser DOM for React component tests)

**Assertion Library:**
- Vitest's built-in expect (compatible with Jest assertions)

**Additional Libraries:**
- @testing-library/react ^16.3.2 - React component rendering and interaction
- @testing-library/jest-dom ^6.9.1 - DOM-specific matchers (toBeInTheDocument, toHaveTextContent, etc.)

**Run Commands:**
```bash
npm test              # Start Vitest in watch mode
npm run test:run      # Run all tests once (CI mode)
npx vitest run        # Alternative direct command
```

## Test File Organization

**Location Patterns:**
- **Centralized test folder:** `src/__tests__/` containing subdirectories by type:
  - `src/__tests__/api/` - API route tests (register.test.ts, nextauth.test.ts)
  - `src/__tests__/pages/` - Page component tests (provider.test.tsx, owner.test.tsx)
  - `src/__tests__/ui/` - UI component tests (DashboardLayout.test.tsx)
- **Co-located tests:** Some tests live next to the files they test:
  - `src/features/users/components/tests/LoginForm.test.tsx`
  - `src/features/users/components/tests/RegisterForm.test.tsx`
  - `src/components/ui/input.test.ts`
  - `src/components/auth/AuthLayout.test.ts`
  - `src/components/auth/AuthBrandingPanel.test.ts`
  - `src/app/globals.css.test.ts`

**Naming:**
- Pattern: `*.test.ts` or `*.test.tsx` (no `*.spec.*` files found in source)
- API tests: `[route-name].test.ts` (e.g., `register.test.ts`)
- Component tests: `[ComponentName].test.tsx` (e.g., `LoginForm.test.tsx`)

## Test Configuration

**Vitest config (`vitest.config.ts`):**
```typescript
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{js,ts,jsx,tsx}'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        'src/test/**',
        '**/*.d.ts',
        '**/*.config.*',
        '.next/**',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

**Setup file (`src/test/setup.ts`):**
```typescript
import '@testing-library/jest-dom';
```

## Test Structure

**API Test Pattern (from `src/__tests__/api/register.test.ts`):**
```typescript
import { expect, test } from 'vitest';
import { POST } from '@/app/api/auth/register/route';

test('register endpoint creates user and returns 201', async () => {
  process.env.NEXT_PUBLIC_FEATURE_AUTH_REGISTER = 'true';

  const payload = {
    email: 'test@example.com',
    password: 'Passw0rd!',
    role: 'owner' as const,
  };

  const request = new Request('http://localhost/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const response = await POST(request);
  expect(response.status).toBe(201);
});
```

**Component Test Pattern (from `src/features/users/components/tests/LoginForm.test.tsx`):**
```typescript
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { LoginForm } from '../LoginForm';
import { vi } from 'vitest';

// Mock next-auth
vi.mock('next-auth/react', () => ({
  signIn: vi.fn(),
}));

// Mock fetch
(global as any).fetch = vi.fn();

describe('LoginForm - Client-side Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    render(<LoginForm />);
  });

  test('renders login form with email and password fields', () => {
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
  });

  test('shows error for empty email field on submit', async () => {
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));
    await waitFor(() => {
      expect(screen.getByText('Enter a valid email address')).toBeInTheDocument();
    });
  });
});
```

**File Content Test Pattern (from `src/components/ui/input.test.ts`):**
```typescript
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const inputContent = fs.readFileSync(
  path.join(process.cwd(), 'src/components/ui/input.tsx'),
  'utf-8'
);

describe('Input Component', () => {
  describe('auth variant glassmorphism', () => {
    it('should use backdrop-blur-md for stronger blur effect', () => {
      expect(inputContent).toMatch(/backdrop-blur-md/);
    });
  });
});
```

## Mocking

**Framework:** Vitest's built-in `vi` object

**Patterns:**
- **Module mocking:** `vi.mock('next-auth/react', () => ({ signIn: vi.fn() }))`
- **Function mocking:** `vi.fn()` for fetch, signIn, etc.
- **Clearing mocks:** `vi.clearAllMocks()` in `beforeEach`

**What to Mock:**
- NextAuth methods (`signIn`, `useSession`) - `src/features/users/components/tests/LoginForm.test.tsx`
- Global fetch API - `(global as any).fetch = vi.fn()`
- Server actions and API routes (tested at integration level)

**What NOT to Mock:**
- React components being tested (render normally)
- Utility functions from same module (test directly)
- Prisma client in API tests (uses actual database)

## Fixtures and Factories

**Test Data:**
- Inline test data objects created in each test
- No centralized fixtures or factory files detected
- Example from `register.test.ts`:
```typescript
const payload = {
  email: 'test@example.com',
  password: 'Passw0rd!',
  role: 'owner' as const,
};
```

**Location:**
- Test data defined locally within test files
- No `src/test/fixtures/` or `src/test/factories/` directories present

## Coverage

**Requirements:** No enforced coverage threshold detected in vitest.config.ts

**Provider:** v8 (built into Node.js)

**Reporters:** text, json, html

**View Coverage:**
```bash
npx vitest run --coverage        # Generate coverage
# HTML report: coverage/index.html
# Text report: printed to console
```

**Exclusions:**
- node_modules/**
- src/test/**
- **/*.d.ts
- **/*.config.*
- .next/**

## Test Types

**Unit Tests:**
- Component rendering and interaction tests (`LoginForm.test.tsx`, `RegisterForm.test.tsx`)
- UI component tests (`input.test.ts`, `AuthLayout.test.ts`)
- CSS variable tests (`globals.css.test.ts`)

**Integration Tests:**
- API route tests (`register.test.ts`, `nextauth.test.ts`, `nextauth-callbacks.test.ts`)
- Page rendering tests (`provider.test.tsx`, `owner.test.tsx`)

**E2E Tests:**
- Playwright ^1.59.1 installed
- No E2E test files found (no `e2e/` or `playwright/` directory)
- Playwright config not present

## Common Patterns

**Async Testing:**
```typescript
test('async operation', async () => {
  const response = await someAsyncFunction();
  expect(response.status).toBe(201);
});
```

**Waiting for State Updates:**
```typescript
await waitFor(() => {
  expect(screen.getByText('Error message')).toBeInTheDocument();
});
```

**Event Firing:**
```typescript
fireEvent.change(screen.getByLabelText('Email Address'), {
  target: { value: 'test@example.com' }
});
fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));
```

**Error Testing:**
```typescript
test('shows error for empty field', async () => {
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() => {
    expect(screen.getByText('Field is required')).toBeInTheDocument();
  });
});
```

## CI/CD Integration

**No CI/CD configuration detected:**
- No `.github/workflows/*.yml` files
- No `Dockerfile` or `docker-compose.yml`
- No Jenkinsfile or other CI config

**To add CI testing:**
```yaml
# .github/workflows/test.yml (example)
- name: Run tests
  run: npm run test:run
```

---

*Testing analysis: 2026-05-02*
