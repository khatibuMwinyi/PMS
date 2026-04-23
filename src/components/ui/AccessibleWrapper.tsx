'use client';

import * as React from 'react';
import { cn } from '@/core/lib/utils';

interface AccessibleWrapperProps {
  children: React.ReactNode;
  /** Accessible label for screen readers */
  ariaLabel?: string;
  /** Describes the element for screen readers */
  ariaDescribedBy?: string;
  /** Explicit role for assistive technologies */
  role?: string;
  /** Makes element visible only to screen readers */
  srOnly?: boolean;
  /** Indicates loading state */
  ariaBusy?: boolean;
  /** Indicates disabled state */
  ariaDisabled?: boolean;
  /** Element that receives keyboard focus */
  tabIndex?: number;
  /** Custom CSS classes */
  className?: string;
}

/**
 * Accessibility wrapper component that ensures proper ARIA attributes
 * and screen reader support for any content it wraps.
 */
export const AccessibleWrapper = React.forwardRef<HTMLDivElement, AccessibleWrapperProps>(
  ({
    children,
    ariaLabel,
    ariaDescribedBy,
    role,
    srOnly = false,
    ariaBusy = false,
    ariaDisabled = false,
    tabIndex,
    className,
    ...props
  }, ref) => {
    const combinedProps = {
      ref,
      role,
      'aria-label': ariaLabel,
      'aria-describedby': ariaDescribedBy,
      'aria-busy': ariaBusy,
      'aria-disabled': ariaDisabled,
      tabIndex,
      ...props,
    };

    if (srOnly) {
      return (
        <span
          className="sr-only"
          {...combinedProps}
        >
          {children}
        </span>
      );
    }

    return (
      <div
        className={cn(
          className,
          // Focus management
          '[&:focus-visible]:outline-none [&:focus-visible]:ring-2 [&:focus-visible]:ring-offset-2 [&:focus-visible]:ring-[var(--border-focus)]'
        )}
        {...combinedProps}
      >
        {children}
      </div>
    );
  }
);

AccessibleWrapper.displayName = 'AccessibleWrapper';

/**
 * Hook for managing focus within a component
 */
export const useFocusManagement = () => {
  const focusRef = React.useRef<HTMLElement>(null);

  const focus = () => {
    focusRef.current?.focus();
  };

  const blur = () => {
    focusRef.current?.blur();
  };

  return {
    focusRef,
    focus,
    blur,
  };
};

/**
 * Hook for trap focus within a modal or dialog
 */
export const useFocusTrap = (active: boolean = true) => {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!active || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [active]);

  return { containerRef };
};