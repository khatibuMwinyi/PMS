'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/Input';

// Import role-specific forms
import { RoleToggle } from './RoleToggle';
import { OwnerRegisterForm } from './OwnerRegisterForm';
import { ProviderRegisterForm } from './ProviderRegisterForm';

// Validation schema for base fields
const RegisterSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type Role = 'owner' | 'provider';

export default function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [role, setRole] = useState<Role>('owner');
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [password, setPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong'>('weak');

  // Preselect plan from URL query param
  useEffect(() => {
    const plan = searchParams.get('plan');
    if (plan) setSelectedPlan(plan);
  }, [searchParams]);

  // Calculate password strength (UI only)
  useEffect(() => {
    const strength = calculatePasswordStrength(password);
    setPasswordStrength(strength);
  }, [password]);

  const calculatePasswordStrength = (pwd: string): 'weak' | 'medium' | 'strong' => {
    if (pwd.length >= 12) return 'strong';
    if (pwd.length >= 8) return 'medium';
    return 'weak';
  };

  const getStrengthColor = (strength: 'weak' | 'medium' | 'strong') => {
    switch (strength) {
      case 'strong': return 'text-[var(--state-success)]';
      case 'medium': return 'text-[var(--state-warning)]';
      default: return 'text-[var(--text-muted)]';
    }
  };

  const handleSuccess = () => {
    router.push('/login?registered=true');
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-2xl font-bold text-white mb-2">Create Account</h2>
        <p className="text-[var(--text-muted)]">Join Oweru today</p>
      </motion.div>

      <motion.div
        className="relative bg-[var(--surface-card)] p-6 rounded-2xl shadow-card border border-[var(--border-default)]"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
      >
        {/* Role Toggle */}
        <div className="mb-6">
          <RoleToggle value={role} onChange={setRole} />
        </div>

        {/* Role-Specific Forms */}
        <div className="space-y-6">
          {role === 'owner' && (
            <OwnerRegisterForm onSuccess={handleSuccess} />
          )}
          {role === 'provider' && (
            <ProviderRegisterForm onSuccess={handleSuccess} />
          )}
        </div>

        {/* Password Strength Indicator */}
        <div className="mt-4 pt-4 border-t border-[var(--border-default)]">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-white">Password Strength: </span>
            <div className={`h-2 rounded-full transition-all ${getStrengthColor(passwordStrength)}`} style={{ width: '100px' }} />
            <span className="text-xs text-[var(--text-muted)]">{passwordStrength}</span>
          </div>
          {password && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`text-xs ${getStrengthColor(passwordStrength)}`}
            >
              {passwordStrength === 'weak' && 'Consider adding uppercase, numbers, or symbols'}
              {passwordStrength === 'medium' && 'Good strength, but can be stronger'}
              {passwordStrength === 'strong' && 'Strong password! ✅'}
            </motion.span>
          )}
        </div>

        {/* Plan Selection */}
        {selectedPlan && (
          <div className="mt-4 p-3 bg-[var(--surface-overlay)] rounded-lg border border-[var(--brand-gold)]/20">
            <p className="text-sm text-white font-medium">Selected Plan: <span className="text-[var(--brand-gold)]">{selectedPlan}</span></p>
            <p className="text-xs text-[var(--text-muted)] mt-1">Plan will be applied during registration</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}

// Helper component for role indicator pins
const RolePin: React.FC<{ icon: string; label: string }> = ({ icon, label }) => (
  <div className="flex items-center gap-2 text-white/70 text-xs">
    <span>{icon}</span>
    <span>{label}</span>
  </div>
);
