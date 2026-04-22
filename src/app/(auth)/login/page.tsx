import { Suspense } from 'react';
import type { Metadata } from 'next';
import { LoginForm } from '@/features/users/components/LoginForm';
import { RegistrationSuccessBanner } from './RegistrationSuccessBanner';
import { AuthLayout } from '@/components/auth/AuthLayout';

export const metadata: Metadata = { title: 'Sign In — Oweru' };

export default function LoginPage() {
  return (
    <AuthLayout
      branding={{
        title: 'Oweru',
        tagline: 'Your property, professionally managed',
      }}
    >
      <Suspense fallback={null}>
        <RegistrationSuccessBanner />
      </Suspense>
      <LoginForm />
    </AuthLayout>
  );
}
