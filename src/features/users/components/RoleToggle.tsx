'use client';

import { Home, Wrench } from 'lucide-react';
import { cn } from '@/core/lib/utils';

type Role = 'owner' | 'provider';

interface RoleToggleProps {
  value: Role;
  onChange: (role: Role) => void;
}

const OPTIONS: { value: Role; label: string; icon: React.ReactNode; bgColor: string }[] = [
  { value: 'owner', label: "I'm a Property Owner", icon: <Home size={15} />, bgColor: 'from-[#0F172A]/50 to-[#1E293B]/50' },
  { value: 'provider', label: "I'm a Service Provider", icon: <Wrench size={15} />, bgColor: 'from-[#1E293B]/50 to-[#334155]/50' },
];

export function RoleToggle({ value, onChange }: RoleToggleProps) {
  return (
    <div className="relative p-1 rounded-[2rem] bg-gradient-to-r from-[#0F172A]/30 to-[#334155]/30 backdrop-blur-sm border border-[#E5B972]/20 overflow-hidden">
      {/* Animated background */}
      <div
        className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-[#C89128]/20 to-transparent rounded-[2rem] transition-all duration-300"
        style={{
          left: value === 'owner' ? '0%' : '50%',
        }}
      />

      {/* Border glow */}
      <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-r from-transparent via-[#E5B972]/30 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />

      <div className="relative flex p-1 rounded-[2rem]">
        {OPTIONS.map((opt, index) => {
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={cn(
                'relative z-10 flex items-center gap-2 flex-1 justify-center px-6 py-3 rounded-[1.5rem] text-sm font-medium transition-all duration-300',
                active
                  ? 'text-white'
                  : 'text-[#E5B972]/60 hover:text-[#E5B972]'
              )}
              aria-pressed={active}
            >
              {/* Icon background */}
              <div className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300',
                active
                  ? opt.bgColor.replace('/50', '/40') + ' border border-[#E5B972]/30'
                  : 'bg-black/30 hover:bg-black/40'
              )}>
                <span
                  className={cn(
                    'transition-all duration-300',
                    active ? 'text-[#E5B972]' : 'text-[#E5B972]/60'
                  )}
                >
                  {opt.icon}
                </span>
              </div>
              {opt.label}

              {/* Active state indicator */}
              {active && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-[#C89128] to-[#E5B972] rounded-full animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}