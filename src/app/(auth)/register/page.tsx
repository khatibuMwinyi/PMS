import type { Metadata } from 'next';
import { RegisterForm } from '@/features/users/components/RegisterForm';
import { AuthLayout } from '@/components/auth/AuthLayout';

export const metadata: Metadata = { title: 'Create Account — Oweru' };

export default function RegisterPage() {
  return (
    <AuthLayout
      branding={{
        title: 'Oweru',
        tagline: 'Join thousands of property owners and service providers',
      }}
    >
      <RegisterForm />
    </AuthLayout>
  );
}
