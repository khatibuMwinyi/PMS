// src/app/(auth)/login/page.tsx
import { Suspense } from 'react';
import type { Metadata } from 'next';
import { LoginForm } from '@/features/users/components/LoginForm';
import { RegistrationSuccessBanner } from './RegistrationSuccessBanner';

export const metadata: Metadata = { title: 'Sign In — Oweru' };

export default function LoginPage() {
  return (
    <div className="w-full space-y-6">
      {/* Logo/Brand */}
      <div className="text-center">
        <h1 className="font-display text-3xl text-text-primary">Oweru</h1>
        <p className="text-text-secondary mt-2">Sign in to your account</p>
      </div>

      {/* Success banner */}
      <Suspense fallback={null}>
        <RegistrationSuccessBanner />
      </Suspense>

      {/* Form */}
      <LoginForm />
    </div>
  );
}