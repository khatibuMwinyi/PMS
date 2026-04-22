'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { signOut } from 'next-auth/react';
import { LogOut, ChevronDown, User } from 'lucide-react';
import { RoleBadge } from '@/components/shared/RoleBadge';
import { cn } from '@/core/lib/utils';

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
      {userRole && <RoleBadge role={userRole} />}

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