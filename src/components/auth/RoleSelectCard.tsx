'use client';

import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

interface RoleSelectCardProps {
  role: string;
  title: string;
  description: string;
  Icon: LucideIcon;
  selected: boolean;
  onSelect: (role: string) => void;
}

export function RoleSelectCard({
  role,
  title,
  description,
  Icon,
  selected,
  onSelect,
}: RoleSelectCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(role)}
      aria-pressed={selected}
      className={cn(
        'group relative w-full text-left rounded-2xl p-5 transition-all duration-200',
        'border bg-white/4 hover:bg-white/8',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
        selected
          ? 'border-[var(--brand-gold)] bg-[var(--brand-gold)]/12 shadow-[0_0_0_1px_var(--brand-gold)]'
          : 'border-white/12 hover:border-white/22'
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            'flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-colors',
            selected
              ? 'bg-[var(--brand-gold)]/25 text-[var(--brand-gold)]'
              : 'bg-white/8 text-white/70 group-hover:text-white'
          )}
        >
          <Icon size={22} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold text-white">{title}</p>
          <p className="mt-1 text-sm text-white/55 leading-snug">{description}</p>
        </div>
        <div
          className={cn(
            'flex-shrink-0 w-5 h-5 rounded-full border-2 transition-colors mt-1',
            selected
              ? 'border-[var(--brand-gold)] bg-[var(--brand-gold)]'
              : 'border-white/25 group-hover:border-white/40'
          )}
          aria-hidden="true"
        >
          {selected && (
            <svg viewBox="0 0 12 12" className="w-full h-full text-[var(--brand-primary)]" fill="none">
              <path
                d="M3 6.5l2 2 4-4.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
      </div>
    </button>
  );
}
