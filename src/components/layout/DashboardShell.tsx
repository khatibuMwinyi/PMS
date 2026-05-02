"use client";

import { TopbarUserMenu } from './Topbar';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { Logo } from '@/components/ui/Logo';
import { motion } from 'framer-motion';

interface DashboardShellProps {
  children: React.ReactNode;
  role: string;
  userName?: string | null;
  pageTitle?: string;
}

/**
 * Server component — accepts session data as props so per-role layouts
 * can call auth() once and pass it down without client-side round trips.
 */
export function DashboardShell({ children, role, userName, pageTitle }: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-[var(--surface-page)]">
      
      {/* ── Top Navigation Bar ──────────────────────────────────── */}
      <header className="sticky top-0 z-50 h-16 flex items-center gap-3 px-4 sm:px-6 bg-[var(--surface-card)] border-b border-[var(--border-subtle)] shadow-sm">
        {/* Mobile hamburger — client component */}
        <div className="md:hidden">
          <MobileNav role={role} />
        </div>

        {/* Logo */}
        <Logo width={120} height={32} />

        {/* Nav Links (desktop) */}
        <nav className="hidden md:flex items-center gap-6 ml-8">
          <a href="/dashboard" className="text-sm font-medium text-[var(--text-primary)] hover:text-[var(--brand-gold)] transition-colors">
            Dashboard
          </a>
          <a href="/owner/properties" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--brand-gold)] transition-colors">
            Portfolio
          </a>
          <a href="/owner/leases" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--brand-gold)] transition-colors">
            Leases
          </a>
        </nav>

        {/* Page title */}
        {pageTitle && (
          <div className="hidden sm:flex items-center gap-3">
            <span className="text-[var(--border-default)] text-lg leading-none">·</span>
            <span className="text-[15px] font-medium text-[var(--text-primary)]">{pageTitle}</span>
          </div>
        )}

        {/* Right: action icons + user menu */}
        <div className="ml-auto flex items-center gap-3">
          {/* Notification Bell */}
          <button
            type="button"
            aria-label="Notifications"
            className="rounded-full p-2 hover:bg-[var(--surface-overlay)] transition-colors duration-120"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--text-muted)]">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </button>

          {/* Help */}
          <button
            type="button"
            aria-label="Help"
            className="rounded-full p-2 hover:bg-[var(--surface-overlay)] transition-colors duration-120"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--text-muted)]">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </button>

          {/* Settings */}
          <button
            type="button"
            aria-label="Settings"
            className="rounded-full p-2 hover:bg-[var(--surface-overlay)] transition-colors duration-120"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--text-muted)]">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.65 1.65z" />
            </svg>
          </button>

          {/* User Menu */}
          <TopbarUserMenu userName={userName} userRole={role} />
        </div>
      </header>

      {/* ── Body ────────────────────────────────────────────── */}
      <div className="flex">
        {/* Desktop sidebar — client component (needs usePathname) */}
        <div className="hidden md:block shrink-0">
          <Sidebar role={role} userName={userName || undefined} />
        </div>

        {/* Page content */}
        <main className="flex-1 min-w-0 p-6 animate-fade-up">
          {children}
        </main>
      </div>

    </div>
  );
}
