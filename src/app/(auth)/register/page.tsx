import { Suspense } from 'react';
import type { Metadata } from 'next';
import { RegisterForm } from '@/features/users/components/RegisterForm';

export const metadata: Metadata = { title: 'Create Account — Oweru' };

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  );
}