'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';

interface SlideOverProps {
  open:     boolean;
  onClose:  () => void;
  title:    string;
  children: React.ReactNode;
  /** Panel width — defaults to 520px */
  width?:   number;
}

export function SlideOver({ open, onClose, title, children, width = 520 }: SlideOverProps) {
  // Lock body scroll while open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Esc key closes
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <>
      {/* ── Backdrop ───────────────────────────────────────────── */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className="fixed inset-0 z-40"
        style={{
          background:  'rgba(0,0,0,0.4)',
          opacity:     open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition:  'opacity 200ms ease',
        }}
      />

      {/* ── Panel ──────────────────────────────────────────────── */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="fixed inset-y-0 right-0 z-50 flex flex-col bg-[var(--surface-page)]"
        style={{
          width:      `min(${width}px, 100vw)`,
          boxShadow:  'var(--shadow-modal)',
          transform:  open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 h-16 shrink-0 border-b"
          style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-card)' }}
        >
          <h2 className="text-[16px] font-semibold text-[var(--text-primary)]">{title}</h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-[var(--radius-md)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-overlay)] transition-colors duration-120"
            aria-label="Close panel"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </>
  );
}