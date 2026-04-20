'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Sidebar } from './Sidebar';

interface MobileNavProps {
  role: string;
}

export function MobileNav({ role }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Hamburger trigger */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden p-2 rounded-[var(--radius-sm)] text-[var(--text-secondary)] hover:bg-[var(--surface-overlay)] transition-colors"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Slide-in drawer */}
      <div
        className={[
          'fixed inset-y-0 left-0 z-50 flex flex-col bg-[var(--surface-page)] shadow-[var(--shadow-modal)]',
          'transition-transform duration-300 ease-in-out md:hidden w-[240px]',
          open ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-[var(--border-subtle)]">
          <span className="font-display text-[18px] text-[var(--brand-primary)]">Oweru</span>
          <button
            onClick={() => setOpen(false)}
            className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <Sidebar role={role} />
        </div>
      </div>
    </>
  );
}