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
    <motion.div
      className="w-full space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
    >
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-white mb-2">Create Account</h2>
        <p className="text-sm text-white/60">Join Oweru today</p>
      </motion.div>

      <div className="mb-6">
        <RoleToggle value={role} onChange={handleRoleChange} />
      </div>

      <motion.div
        className="mb-6 px-4 py-4 rounded-xl bg-white/5 border border-[#C89128]/20 backdrop-blur-sm"
        key={role}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {role === 'owner' ? (
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#C89128]/20 flex items-center justify-center flex-shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C89128" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">Property Owner</h3>
              <p className="text-sm text-white/60">
                Professionally manage your property services. Get instant quotes, track work orders, and pay securely.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#C89128]/20 flex items-center justify-center flex-shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C89128" strokeWidth="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
              </svg>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">Service Provider</h3>
              <p className="text-sm text-white/60">
                Receive work orders from Oweru, build your rating, and receive direct payouts.
              </p>
            </div>
          </div>
        )}
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={role}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {role === 'owner' ? (
            <OwnerRegisterForm onSuccess={handleSuccess} />
          ) : (
            <ProviderRegisterForm onSuccess={handleSuccess} />
          )}
        </motion.div>
      </AnimatePresence>

      <motion.p
        className="text-center text-sm text-white/60"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        Already have an account?{' '}
        <a href="/login" className="text-[#C89128] font-medium hover:text-[#E5B972] transition-colors">
          Sign in →
        </a>
      </motion.p>
    </motion.div>
  );
}