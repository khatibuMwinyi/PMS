"use client";

import Image from 'next/image';
import Link from 'next/link';
import { TopbarUserMenu } from './Topbar';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';

interface DashboardShellProps {
  children: React.ReactNode;
  role: string;
  userName?: string | null;
  pageTitle?: string;
}

function getDashboardHref(role: string): string {
  if (role === 'ADMIN') return '/admin';
  return `/${role.toLowerCase()}/dashboard`;
}

export function DashboardShell({ children, role, userName, pageTitle }: DashboardShellProps) {
  return (
    <div className="h-screen overflow-hidden flex flex-col bg-[var(--surface-page)]">

      {/* Topbar */}
      <header className="flex-none z-50 h-16 flex items-center gap-3 px-4 sm:px-6 bg-[var(--surface-card)] border-b border-[var(--border-subtle)] shadow-sm">
        <div className="md:hidden">
          <MobileNav role={role} />
        </div>

        <Link href={getDashboardHref(role)} className="flex items-center gap-2 shrink-0">
          <div className="relative w-8 h-8 rounded-md overflow-hidden shrink-0">
            <Image src="/images/logo.jpeg" alt="Oweru" fill sizes="32px" className="object-cover" />
          </div>
          <span className="hidden sm:block text-h4 font-serif font-semibold text-[var(--text-primary)]">
            Oweru
          </span>
        </Link>

        {pageTitle && (
          <div className="hidden sm:flex items-center gap-3 ml-4">
            <span className="text-[var(--border-default)] text-lg leading-none">·</span>
            <span className="text-[15px] font-medium text-[var(--text-primary)]">{pageTitle}</span>
          </div>
        )}

        <div className="ml-auto">
          <TopbarUserMenu userName={userName} userRole={role} />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="hidden md:block shrink-0">
          <Sidebar role={role} userName={userName || undefined} />
        </div>

        <main className="flex-1 min-w-0 overflow-y-auto p-6 animate-fade-up">
          {children}
        </main>
      </div>

    </div>
  );
}
