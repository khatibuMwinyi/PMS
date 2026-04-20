'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Settings, Users, Home, AlertTriangle, BarChart2,
  ClipboardList, Wrench, Receipt, CheckSquare, Wallet, Star,
  LucideIcon,
} from 'lucide-react';
import { cn } from '@/core/lib/utils';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const NAV_ITEMS: Record<string, NavItem[]> = {
  ADMIN: [
    { href: '/admin/services',   label: 'Services',   icon: Settings },
    { href: '/admin/providers',  label: 'Providers',  icon: Users },
    { href: '/admin/owners',     label: 'Owners',     icon: Home },
    { href: '/admin/disputes',   label: 'Disputes',   icon: AlertTriangle },
    { href: '/admin/analytics',  label: 'Analytics',  icon: BarChart2 },
  ],
  STAFF: [
    { href: '/staff/disputes',    label: 'Disputes',    icon: AlertTriangle },
    { href: '/staff/assignments', label: 'Assignments', icon: ClipboardList },
  ],
  OWNER: [
    { href: '/owner/properties', label: 'Properties', icon: Home },
    { href: '/owner/services',   label: 'Services',   icon: Wrench },
    { href: '/owner/invoices',   label: 'Invoices',   icon: Receipt },
    { href: '/owner/analytics',  label: 'Analytics',  icon: BarChart2 },
  ],
  PROVIDER: [
    { href: '/provider/assignments', label: 'Assignments', icon: ClipboardList },
    { href: '/provider/tasks',       label: 'Tasks',       icon: CheckSquare },
    { href: '/provider/wallet',      label: 'Wallet',      icon: Wallet },
    { href: '/provider/ratings',     label: 'Ratings',     icon: Star },
  ],
};

interface SidebarProps {
  role: string;
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const items = NAV_ITEMS[role] ?? [];

  return (
    <aside
      className="w-[240px] shrink-0 border-r border-[var(--border-subtle)] bg-[var(--surface-page)] flex flex-col"
      style={{ minHeight: 'calc(100vh - 64px)' }}
    >
      <nav className="flex flex-col gap-0.5 p-3">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-[var(--radius-md)]',
                'text-[14px] font-sans transition-all duration-120',
                active
                  ? 'bg-[#e8f7f2] text-[var(--brand-primary-dim)] font-medium border-l-2 border-[var(--brand-primary)] pl-[10px]'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--surface-overlay)] hover:text-[var(--text-primary)]',
              )}
            >
              <Icon
                size={16}
                className={active ? 'text-[var(--brand-primary)]' : 'text-[var(--text-muted)]'}
              />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}