'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { RoleToggle } from './RoleToggle';
import { OwnerRegisterForm } from './OwnerRegisterForm';
import { ProviderRegisterForm } from './ProviderRegisterForm';

type Role = 'owner' | 'provider';

export function RegisterForm() {
  const router = useRouter();
  const [role, setRole] = useState<Role>('owner');

  const handleRoleChange = (next: Role) => {
    setRole(next);
  };

  const handleSuccess = () => {
    router.push('/login?registered=true');
  };

  return (
    <div className="w-full space-y-4">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-xl font-bold text-white">Create Account</h2>
        <p className="text-xs text-white/50">Join Oweru today</p>
      </motion.div>

      <RoleToggle value={role} onChange={handleRoleChange} />

      <motion.div
        className="px-3 py-2.5 rounded-lg bg-white/5 border border-[var(--brand-gold)]/20"
        key={role}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {role === 'owner' ? (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--brand-gold)]/20 flex items-center justify-center flex-shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--brand-gold)" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
            </div>
            <div>
              <h3 className="text-sm text-white font-medium">Property Owner</h3>
              <p className="text-[10px] text-white/50">Get instant quotes, track work, pay securely</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--brand-gold)]/20 flex items-center justify-center flex-shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--brand-gold)" strokeWidth="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
              </svg>
            </div>
            <div>
              <h3 className="text-sm text-white font-medium">Service Provider</h3>
              <p className="text-[10px] text-white/50">Receive work orders, build rating</p>
            </div>
          </div>
        )}
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={role}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {role === 'owner' ? (
            <OwnerRegisterForm onSuccess={handleSuccess} />
          ) : (
            <ProviderRegisterForm onSuccess={handleSuccess} />
          )}
        </motion.div>
      </AnimatePresence>

      <motion.p
        className="text-center text-xs text-white/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Already have an account?{' '}
        <a href="/login" className="text-[var(--brand-gold)] font-medium hover:text-[var(--brand-gold-light)] transition-colors">
          Sign in →
        </a>
      </motion.p>
    </div>
  );
}