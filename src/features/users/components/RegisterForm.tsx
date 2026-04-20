'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { RoleToggle } from './RoleToggle';
import { OwnerRegisterForm } from './OwnerRegisterForm';
import { ProviderRegisterForm } from './ProviderRegisterForm';

type Role = 'owner' | 'provider';

export function RegisterForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const [role, setRole]   = useState<Role>('owner');
  const [visible, setVisible] = useState(true);

  // Animate form swap when role changes
  const handleRoleChange = (next: Role) => {
    setVisible(false);
    setTimeout(() => {
      setRole(next);
      setVisible(true);
    }, 120);
  };

  const handleSuccess = () => {
    router.push('/login?registered=true');
  };

  return (
    <div className="w-full max-w-[520px] animate-fade-up">
      {/* Heading */}
      <h1 className="font-display text-[28px] text-[var(--text-primary)] leading-tight mb-1">
        Create your account
      </h1>
      <p className="text-[14px] text-[var(--text-secondary)] mb-6">
        Join Oweru as a property owner or service provider.
      </p>

      {/* Role toggle */}
      <div className="mb-6">
        <RoleToggle value={role} onChange={handleRoleChange} />
      </div>

      {/* Role description */}
      <div
        className="mb-6 px-4 py-3 rounded-[var(--radius-md)]"
        style={{ background: 'var(--surface-overlay)' }}
      >
        {role === 'owner' ? (
          <p className="text-[13px] text-[var(--text-secondary)]">
            <span className="font-medium text-[var(--text-primary)]">Property Owner — </span>
            Hire Oweru to professionally manage your property services. Get instant price quotes,
            track work orders, and pay securely via mobile money.
          </p>
        ) : (
          <p className="text-[13px] text-[var(--text-secondary)]">
            <span className="font-medium text-[var(--text-primary)]">Service Provider — </span>
            Receive structured work orders from Oweru, build your rating, and receive direct
            80% payouts to your Oweru wallet.
          </p>
        )}
      </div>

      {/* Animated form swap */}
      <div
        style={{
          opacity:    visible ? 1 : 0,
          transform:  visible ? 'translateY(0)' : 'translateY(6px)',
          transition: 'opacity 120ms ease, transform 120ms ease',
        }}
      >
        {role === 'owner' ? (
          <OwnerRegisterForm onSuccess={handleSuccess} />
        ) : (
          <ProviderRegisterForm onSuccess={handleSuccess} />
        )}
      </div>

      {/* Sign in link */}
      <p className="text-center text-[14px] text-[var(--text-secondary)] mt-6">
        Already have an account?{' '}
        <a href="/login" className="text-[var(--brand-primary)] font-medium hover:underline">
          Sign in →
        </a>
      </p>
    </div>
  );
}