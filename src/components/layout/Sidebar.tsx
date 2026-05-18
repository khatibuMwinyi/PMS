'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Home,
  ClipboardList,
  Wrench,
  BarChart3,
  FileText,
  History,
  PlusCircle,
  LifeBuoy,
  BookOpen,
  Users,
  Bolt,
} from 'lucide-react';
import { cn } from '@/core/lib/utils';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const NAV_ITEMS: Record<string, NavItem[]> = {
  ADMIN: [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/properties', label: 'Properties', icon: Home },
    { href: '/admin/workflows', label: 'Workflows', icon: ClipboardList },
    { href: '/admin/financials', label: 'Financials', icon: BarChart3 },
    { href: '/admin/operations', label: 'Operations', icon: Wrench },
    { href: '/admin/reports', label: 'Reports', icon: FileText },
  ],
  STAFF: [
    { href: '/staff/disputes', label: 'Disputes', icon: ClipboardList },
    { href: '/staff/assignments', label: 'Assignments', icon: ClipboardList },
  ],
  OWNER: [
    { href: '/owner/dashboard',        label: 'Dashboard',       icon: LayoutDashboard },
    { href: '/owner/properties',       label: 'Properties',      icon: Home },
    { href: '/owner/services',         label: 'Services',        icon: Wrench },
    { href: '/owner/utilities',        label: 'Utilities',       icon: Bolt },
    { href: '/owner/financials',       label: 'Financials',      icon: BarChart3 },
    { href: '/owner/service-catalog',  label: 'Service Catalog', icon: Users },
    { href: '/owner/reports',          label: 'Reports',         icon: FileText },
  ],
  PROVIDER: [
    { href: '/provider',            label: 'Dashboard',   icon: LayoutDashboard },
    { href: '/provider/assignments', label: 'Assignments', icon: ClipboardList },
    { href: '/provider/tasks',       label: 'Tasks',       icon: Wrench },
    { href: '/provider/history',     label: 'History',     icon: History },
    { href: '/provider/wallet',      label: 'Wallet',      icon: BarChart3 },
    { href: '/provider/settings',    label: 'Settings',    icon: Bolt },
  ],
};

interface SidebarProps {
  role: string;
  userName?: string;
}

export function Sidebar({ role, userName }: SidebarProps) {
  const pathname = usePathname();
  const items = NAV_ITEMS[role] ?? [];

  return (
    <aside
      className="w-[240px] shrink-0 border-r border-[var(--border-subtle)] bg-[var(--surface-page)] flex flex-col min-h-screen"
    >
      {/* Header */}
      <div className="p-4 border-b border-[var(--border-subtle)]">
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">Oweru</h2>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">
          {userName ?? 'Property Owner'}
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-0.5 p-3">
        {items.map(({ href, label, icon: Icon }) => {
          // Index routes (/provider, /admin, /owner) match only exactly; non-index match prefix.
          const isIndexRoute = /^\/[a-z]+$/.test(href);
          const active = isIndexRoute
            ? pathname === href
            : pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-[var(--radius-md)]',
                'text-[14px] transition-all duration-120',
                active
                  ? 'bg-[var(--surface-overlay)] text-[var(--text-secondary)] font-medium border-l-2 border-[var(--brand-gold)] pl-[10px]'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--surface-overlay)] hover:text-[var(--text-primary)]',
              )}
            >
              <Icon
                size={16}
                className={active ? 'text-[var(--brand-gold)]' : 'text-[var(--text-muted)]'}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Request New Service (Owner only) */}
      {role === 'OWNER' && (
        <div className="p-3 border-t border-[var(--border-subtle)]">
          <Link
            href="/owner/services/new"
            className="flex items-center justify-center gap-2 w-full rounded-lg bg-[var(--brand-gold)] px-4 py-2.5 text-sm font-medium text-[var(--brand-primary)] hover:bg-[var(--brand-gold-dark)] transition-colors duration-120"
          >
            <PlusCircle size={16} />
            Request Service
          </Link>
        </div>
      )}

      {/* Bottom Links */}
      <div className="p-3 border-t border-[var(--border-subtle)] space-y-1">
        <Link
          href="/support"
          className="flex items-center gap-3 px-3 py-2 rounded-[var(--radius-md)] text-[14px] text-[var(--text-muted)] hover:bg-[var(--surface-overlay)] transition-colors duration-120"
        >
          <LifeBuoy size={16} />
          Support
        </Link>
        <Link
          href="/documentation"
          className="flex items-center gap-3 px-3 py-2 rounded-[var(--radius-md)] text-[14px] text-[var(--text-muted)] hover:bg-[var(--surface-overlay)] transition-colors duration-120"
        >
          <BookOpen size={16} />
          Documentation
        </Link>
      </div>
    </aside>
  );
}
