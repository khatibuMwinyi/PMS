'use client';

import { useState, useRef, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { LogOut, ChevronDown } from 'lucide-react';
import { RoleBadge } from '@/components/shared/RoleBadge';
import { cn } from '@/core/lib/utils';

interface TopbarUserMenuProps {
  userName?: string | null;
  userRole?: string;
}

function getInitials(name?: string | null) {
  if (!name) return '?';
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
}

export function TopbarUserMenu({ userName, userRole }: TopbarUserMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="flex items-center gap-3" ref={ref}>
      {userRole && <RoleBadge role={userRole} />}

      <div className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-1.5 rounded-pill px-1.5 py-1 hover:bg-[var(--surface-overlay)] transition-colors duration-120"
          aria-label="User menu"
        >
          <div className="w-8 h-8 rounded-full bg-[var(--surface-overlay)] border border-[var(--border-default)] flex items-center justify-center text-[12px] font-medium text-[var(--text-secondary)]">
            {getInitials(userName)}
          </div>
          <ChevronDown
            size={14}
            className={cn('text-[var(--text-muted)] transition-transform duration-120', open && 'rotate-180')}
          />
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-1 w-48 bg-[var(--surface-card)] rounded-[var(--radius-md)] border border-[var(--border-subtle)] shadow-[var(--shadow-dropdown)] py-1 z-50 animate-fade-up">
            {userName && (
              <div className="px-3 py-2 border-b border-[var(--border-subtle)]">
                <p className="text-[13px] font-medium text-[var(--text-primary)] truncate">{userName}</p>
                {userRole && <p className="text-[11px] text-[var(--text-muted)]">{userRole}</p>}
              </div>
            )}
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="flex items-center gap-2 w-full px-3 py-2 text-[13px] text-[var(--state-error)] hover:bg-[var(--state-error-bg)] transition-colors duration-120"
            >
              <LogOut size={14} />
              Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}