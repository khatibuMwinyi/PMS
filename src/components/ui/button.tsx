import * as React from 'react';
import { cn } from '@/core/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'bold';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', fullWidth = false, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          // Base
          'inline-flex items-center justify-center font-sans font-medium rounded-md',
          'transition-all duration-200 cursor-pointer select-none',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-primary)]',
          // Disabled
          'disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none',
          // Variants
          variant === 'primary'   && 'bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-dim)] active:scale-[0.98]',
          variant === 'secondary' && 'bg-[var(--surface-overlay)] text-[var(--text-primary)] border border-[var(--border-default)] hover:bg-[var(--surface-card)]',
          variant === 'outline'   && 'bg-transparent border border-[var(--border-default)] text-[var(--text-primary)] hover:bg-[var(--surface-overlay)]',
          variant === 'ghost'     && 'bg-transparent text-[var(--text-secondary)] hover:bg-[var(--surface-overlay)] hover:text-[var(--text-primary)]',
          variant === 'danger'    && 'bg-[var(--state-error-bg)] text-[var(--state-error)] hover:brightness-95',
          variant === 'bold'      && [
            'gradient-primary text-white',
            'hover:shadow-lg hover:shadow-[var(--shadow-bold)] hover:scale-[1.03]',
            'active:scale-[0.98]',
          ],
          // Sizes
          size === 'sm' && 'h-8  px-3   text-[13px] gap-1.5 rounded-[var(--radius-sm)]',
          size === 'md' && 'h-10 px-4   text-[14px] gap-2   rounded-[var(--radius-md)]',
          size === 'lg' && 'h-12 px-6   text-[15px] gap-2   rounded-[var(--radius-md)]',
          fullWidth && 'w-full',
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';