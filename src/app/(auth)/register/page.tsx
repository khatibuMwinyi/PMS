import { Suspense } from 'react';
import type { Metadata } from 'next';
import RegisterForm from '@/features/users/components/RegisterForm';
import { GlassPanel } from '@/components/auth/GlassPanel';

export const metadata: Metadata = { title: 'Create Account — Oweru' };

export default function RegisterPage() {
  return (
    <GlassPanel padding="spacious">
      <Suspense fallback={<div className="py-8 text-center text-text-muted">Loading...</div>}>
        <RegisterForm />
      </Suspense>
    </GlassPanel>
  );
}
