import { Suspense } from 'react';
import type { Metadata } from 'next';
import { LoginForm } from '@/features/users/components/LoginForm';
import { RegistrationSuccessBanner } from './RegistrationSuccessBanner';
import { GlassPanel } from '@/components/auth/GlassPanel';

export const metadata: Metadata = { title: 'Sign In — Oweru' };

export default function LoginPage() {
  return (
    <GlassPanel padding="spacious">
      <Suspense fallback={null}>
        <RegistrationSuccessBanner />
      </Suspense>
      <LoginForm />
    </GlassPanel>
  );
}
