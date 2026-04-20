'use client';

import { Home, Wrench } from 'lucide-react';

type Role = 'owner' | 'provider';

interface RoleToggleProps {
  value: Role;
  onChange: (role: Role) => void;
}

const OPTIONS: { value: Role; label: string; icon: React.ReactNode }[] = [
  { value: 'owner',    label: "I'm a Property Owner",  icon: <Home size={15} /> },
  { value: 'provider', label: "I'm a Service Provider", icon: <Wrench size={15} /> },
];

export function RoleToggle({ value, onChange }: RoleToggleProps) {
  return (
    <div
      className="flex p-1 rounded-pill gap-1"
      style={{ background: 'var(--surface-overlay)' }}
      role="group"
      aria-label="Account type"
    >
      {OPTIONS.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className="flex items-center gap-2 flex-1 justify-center px-4 py-2 rounded-pill text-[13px] font-medium transition-all duration-200"
            style={
              active
                ? {
                    background:  'var(--surface-card)',
                    color:       'var(--text-primary)',
                    boxShadow:   'var(--shadow-card)',
                  }
                : {
                    background: 'transparent',
                    color:      'var(--text-secondary)',
                  }
            }
            aria-pressed={active}
          >
            <span
              style={{
                color: active ? 'var(--brand-primary)' : 'var(--text-muted)',
                transition: 'color 200ms',
              }}
            >
              {opt.icon}
            </span>
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}