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
    }, 200);
  };

  const handleSuccess = () => {
    router.push('/login?registered=true');
  };

  return (
    <div className="w-full space-y-5">
      {/* Role toggle */}
      <div className="mb-6">
        <RoleToggle value={role} onChange={handleRoleChange} />
      </div>

      {/* Role description */}
      <div
        className="mb-6 px-4 py-4 rounded-xl bg-gradient-to-r from-[#0F172A]/50 to-[#1E293B]/50 border border-[#E5B972]/20 backdrop-blur-sm transition-all duration-300 hover:border-[#E5B972]/40"
      >
        {role === 'owner' ? (
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#C89128]/20 flex items-center justify-center flex-shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">Property Owner</h3>
              <p className="text-sm text-[#E5B972]/80">
                Hire Oweru to professionally manage your property services. Get instant price quotes,
                track work orders, and pay securely via mobile money.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#E5B972]/20 flex items-center justify-center flex-shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
              </svg>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">Service Provider</h3>
              <p className="text-sm text-[#E5B972]/80">
                Receive structured work orders from Oweru, build your rating, and receive direct
                80% payouts to your Oweru wallet.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Animated form swap */}
      <div
        className="transition-all duration-200"
        style={{
          opacity:    visible ? 1 : 0,
          transform:  visible ? 'translateY(0)' : 'translateY(10px)',
          height:    visible ? 'auto' : 0,
          overflow:  'hidden',
        }}
      >
        {role === 'owner' ? (
          <OwnerRegisterForm onSuccess={handleSuccess} />
        ) : (
          <ProviderRegisterForm onSuccess={handleSuccess} />
        )}
      </div>

      {/* Sign in link */}
      <p className="text-center text-sm text-[#E5B972]/80">
        Already have an account?{' '}
        <a href="/login" className="text-white font-medium hover:text-[#E5B972] transition-colors">
          Sign in →
        </a>
      </p>
    </div>
  );
}