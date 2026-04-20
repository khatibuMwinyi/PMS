import { TopbarUserMenu } from './Topbar';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';

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

      {/* ── Top bar ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 h-16 flex items-center gap-3 px-4 sm:px-6 bg-[var(--surface-card)] border-b border-[var(--border-subtle)]">

        {/* Mobile hamburger — client component */}
        <div className="md:hidden">
          <MobileNav role={role} />
        </div>

        {/* Logo */}
        <span className="font-display text-[18px] text-[var(--brand-primary)] leading-none select-none">
          Oweru
        </span>

        {/* Page title */}
        {pageTitle && (
          <div className="hidden sm:flex items-center gap-3">
            <span className="text-[var(--border-default)] text-lg leading-none">·</span>
            <span className="text-[15px] font-medium text-[var(--text-primary)]">{pageTitle}</span>
          </div>
        )}

        {/* Right: role badge + avatar — client component */}
        <div className="ml-auto">
          <TopbarUserMenu userName={userName} userRole={role} />
        </div>
      </header>

      {/* ── Body ────────────────────────────────────────────── */}
      <div className="flex">
        {/* Desktop sidebar — client component (needs usePathname) */}
        <div className="hidden md:block shrink-0">
          <Sidebar role={role} />
        </div>

        {/* Page content */}
        <main className="flex-1 min-w-0 p-6 animate-fade-up">
          {children}
        </main>
      </div>

    </div>
  );
}