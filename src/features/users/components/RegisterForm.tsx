'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { Home, Wrench, ArrowLeft } from 'lucide-react';

import { RoleSelectCard } from '@/components/auth/RoleSelectCard';
import { Button } from '@/components/ui/Button';
import { OwnerRegisterForm } from './OwnerRegisterForm';
import { ProviderRegisterForm } from './ProviderRegisterForm';

type Role = 'owner' | 'provider';
type Step = 'role' | 'form';

const ROLES: Array<{
  role: Role;
  title: string;
  description: string;
  Icon: typeof Home;
}> = [
  {
    role: 'owner',
    title: 'Property Owner',
    description: 'Book trusted services for my property and track work in real time.',
    Icon: Home,
  },
  {
    role: 'provider',
    title: 'Service Provider',
    description: 'Offer my services and earn through Oweru’s vetted network.',
    Icon: Wrench,
  },
];

export default function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<Step>('role');
  const [role, setRole] = useState<Role | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string>('');

  useEffect(() => {
    const plan = searchParams.get('plan');
    if (plan) setSelectedPlan(plan);
  }, [searchParams]);

  const handleSuccess = () => {
    router.push('/login?registered=true');
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {step === 'role' ? (
          <motion.div
            key="role"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <header className="mb-8 text-center">
              <h1 className="text-2xl font-semibold text-white mb-2">I am a...</h1>
              <p className="text-sm text-white/55">Choose your role to get started</p>
            </header>

            <div className="space-y-3 mb-6">
              {ROLES.map((r) => (
                <RoleSelectCard
                  key={r.role}
                  role={r.role}
                  title={r.title}
                  description={r.description}
                  Icon={r.Icon}
                  selected={role === r.role}
                  onSelect={(value) => setRole(value as Role)}
                />
              ))}
            </div>

            {selectedPlan && (
              <div className="mb-6 p-3 rounded-lg border border-[var(--brand-gold)]/30 bg-[var(--brand-gold)]/10">
                <p className="text-sm text-white">
                  Selected plan: <span className="text-[var(--brand-gold)] font-medium">{selectedPlan}</span>
                </p>
              </div>
            )}

            <Button
              type="button"
              variant="primary"
              disabled={!role}
              onClick={() => role && setStep('form')}
            >
              Continue
            </Button>

            <p className="mt-6 text-center text-sm text-white/55">
              Already have an account?{' '}
              <a
                href="/login"
                className="text-[var(--brand-gold)] font-medium hover:text-[var(--brand-gold-light)] transition-colors"
              >
                Sign in
              </a>
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <header className="mb-6">
              <button
                type="button"
                onClick={() => setStep('role')}
                className="inline-flex items-center gap-1.5 text-sm text-white/55 hover:text-white transition-colors mb-3 group"
              >
                <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-0.5" />
                Change role
              </button>
              <h1 className="text-2xl font-semibold text-white mb-1">
                {role === 'owner' ? 'Owner registration' : 'Provider registration'}
              </h1>
              <p className="text-sm text-white/55">
                {role === 'owner'
                  ? 'Tell us a bit about you and your property.'
                  : 'Tell us about your business and services.'}
              </p>
            </header>

            <div>
              {role === 'owner' && <OwnerRegisterForm onSuccess={handleSuccess} />}
              {role === 'provider' && <ProviderRegisterForm onSuccess={handleSuccess} />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
