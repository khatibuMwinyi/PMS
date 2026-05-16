import type { Metadata } from 'next';
import RegisterForm from '@/features/users/components/RegisterForm';
import { GlassPanel } from '@/components/auth/GlassPanel';

export const metadata: Metadata = { title: 'Create Account — Oweru' };

export default function RegisterPage() {
  return (
    <GlassPanel padding="spacious">
      <RegisterForm />
    </GlassPanel>
  );
}
