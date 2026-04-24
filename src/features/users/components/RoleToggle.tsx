'use client';

import { Home, Wrench, Shield } from 'lucide-react';
import { cn } from '@/core/lib/utils';

type Role = 'owner' | 'provider' | 'admin';

interface RoleToggleProps {
  value: Role;
  onChange: (role: Role) => void;
}

const OPTIONS: { value: Role; label: string; icon: React.ReactNode; bgColor: string }[] = [
  { value: 'owner', label: "I'm a Property Owner", icon: <Home size={15} />, bgColor: 'from-[var(--gradient-dark-primary)]/50 to-[var(--gradient-dark-secondary)]/50' },
  { value: 'provider', label: "I'm a Service Provider", icon: <Wrench size={15} />, bgColor: 'from-[var(--gradient-dark-secondary)]/50 to-[var(--gradient-dark-tertiary)]/50' },
  { value: 'admin', label: "I'm an Administrator", icon: <Shield size={15} />, bgColor: 'from-[var(--gradient-dark-tertiary)]/50 to-purple-600/50' },
];

export function RoleToggle({ value, onChange }: RoleToggleProps) {
  return (
    <div className="relative p-1 rounded-[var(--rounded-2rem)] bg-gradient-to-r from-[var(--gradient-dark-primary)]/30 to-[var(--gradient-dark-tertiary)]/30 backdrop-blur-sm border border-[var(--brand-gold-light)]/20 overflow-hidden">
      {/* Animated background */}
      <div
        className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-[var(--brand-gold-medium)]/20 to-transparent rounded-[var(--rounded-2rem)] transition-all duration-300"
        style={{
          left: value === 'owner' ? '0%' : '50%',
        }}
      />

      {/* Border glow */}
      <div className="absolute inset-0 rounded-[var(--rounded-2rem)] bg-gradient-to-r from-transparent via-[var(--brand-gold-light)]/30 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />

      <div className="relative flex p-1 rounded-[2rem]">
        {OPTIONS.map((opt, index) => {
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={cn(
                'relative z-10 flex items-center gap-2 flex-1 justify-center px-6 py-3 rounded-[var(--rounded-1-5rem)] text-sm font-medium transition-all duration-300',
                active
                  ? 'text-white'
                  : 'text-[var(--brand-gold-light)]/60 hover:text-[var(--brand-gold-light)]'
              )}
              aria-pressed={active}
            >
              {/* Icon background */}
              <div className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300',
                active
                  ? opt.bgColor.replace('/50', '/40') + ' border border-[var(--brand-gold-light)]/30'
                  : 'bg-black/30 hover:bg-black/40'
              )}>
                <span
                  className={cn(
                    'transition-all duration-300',
                    active ? 'text-[var(--brand-gold-light)]' : 'text-[var(--brand-gold-light)]/60'
                  )}
                >
                  {opt.icon}
                </span>
              </div>
              {opt.label}

              {/* Active state indicator */}
              {active && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-[var(--brand-gold-medium)] to-[var(--brand-gold-light)] rounded-full animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}