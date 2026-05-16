'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { signOut } from 'next-auth/react';
import { LogOut, ChevronDown, User, Bell, HelpCircle, Settings } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Logo } from '@/components/ui/Logo';
import { cn } from '@/core/lib/utils';
import { NotificationBell } from '@/features/notifications/components';

interface TopbarUserMenuProps {
  userName?: string | null;
  userRole?: string;
}

function getInitials(name?: string | null) {
  if (!name) return 'U';
  const parts = name.split(' ').filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function TopbarUserMenu({ userName, userRole }: TopbarUserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isSigningOut) return;
    
    setIsSigningOut(true);
    try {
      await signOut({ callbackUrl: '/login' });
    } catch (error) {
      console.error('Sign out error:', error);
      setIsSigningOut(false);
    }
  };

  const toggleDropdown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  };

  return (
    <div className="flex items-center gap-3">
      {/* Notification Bell */}
      <NotificationBell />

      {/* Help Icon */}
      <button
        type="button"
        aria-label="Help"
        className="rounded-full p-2 hover:bg-[var(--surface-overlay)] transition-colors duration-120"
      >
        <HelpCircle size={18} className="text-[var(--text-muted)]" />
      </button>

      {/* Settings Icon */}
      <button
        type="button"
        aria-label="Settings"
        className="rounded-full p-2 hover:bg-[var(--surface-overlay)] transition-colors duration-120"
      >
        <Settings size={18} className="text-[var(--text-muted)]" />
      </button>

      {userRole && <Badge variant="gold">{userRole}</Badge>}

      <div className="relative" ref={dropdownRef}>
        <button
          ref={buttonRef}
          type="button"
          aria-label="User menu"
          aria-expanded={isOpen}
          aria-haspopup="true"
          onClick={toggleDropdown}
          className="flex items-center gap-1.5 rounded-full px-1 py-1 hover:bg-[var(--surface-overlay)] transition-colors duration-120 cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full bg-[var(--surface-overlay)] border border-[var(--border-default)] flex items-center justify-center text-xs font-medium text-[var(--text-secondary)]">
            {getInitials(userName)}
          </div>
          <ChevronDown
            size={14}
            className={cn('text-[var(--text-muted)] transition-transform duration-120', isOpen && 'rotate-180')}
          />
        </button>

        {isOpen && (
          <div
            role="menu"
            className="absolute right-0 top-full mt-2 w-56 bg-[var(--surface-card)] rounded-lg border border-[var(--border-subtle)] shadow-lg py-1 z-[9999] overflow-hidden"
            style={{ opacity: 1, transform: 'translateY(0)' }}
          >
            <div className="px-3 py-2.5 border-b border-[var(--border-subtle)]">
              <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                {userName || 'Unknown User'}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                {userRole && (
                  <span className="text-xs text-[var(--text-muted)]">
                    Role: {userRole}
                  </span>
                )}
              </div>
            </div>
            
            <div className="py-1">
              <button
                type="button"
                role="menuitem"
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-[var(--state-error)] hover:bg-[var(--state-error-bg)] transition-colors duration-120 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <LogOut size={16} />
                {isSigningOut ? 'Signing out...' : 'Sign Out'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function TopNavBar() {
  return (
    <header className="sticky top-0 z-50 h-16 flex items-center gap-3 px-4 sm:px-6 bg-[var(--surface-card)] border-b border-[var(--border-subtle)] shadow-sm">
      {/* Logo */}
      <div className="flex items-center">
        <span className="text-lg font-bold text-[var(--brand-primary)]">PropManager Pro</span>
      </div>

      {/* Nav Links */}
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

      {/* Right side - User Menu */}
      <div className="ml-auto">
        <TopbarUserMenu userName="User" userRole="OWNER" />
      </div>
    </header>
  );
}
