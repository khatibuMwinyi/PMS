import * as React from 'react';
import { cn } from '@/core/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  rightElement?: React.ReactNode;
  inputSize?: 'md' | 'lg';
  variant?: 'default' | 'bold';
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helper, rightElement, inputSize = 'md', variant = 'default', id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-[13px] font-medium text-[var(--text-secondary)] leading-none"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full rounded-[var(--radius-md)] border bg-[var(--surface-card)]',
              'text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
              'transition-all duration-200',
              // Focus and hover effects based on variant
              variant === 'default' && [
                'focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent',
                !error && 'border-[var(--border-default)]',
                error && 'border-[var(--state-error)] focus:ring-[var(--state-error)]',
                'hover:shadow-[var(--shadow-bold)]',
              ],
              variant === 'bold' && [
                'focus:outline-none focus:ring-2 focus:ring-[var(--brand-gold)] focus:border-transparent',
                !error && 'border-[var(--border-subtle)]',
                error && 'border-[var(--state-error)] focus:ring-[var(--state-error)]',
                'hover:shadow-[var(--shadow-bold)]',
              ],
              // Sizes
              inputSize === 'md' && 'h-10 px-3 text-[14px]',
              inputSize === 'lg' && 'h-12 px-4 text-[15px]',
              // Right padding when there's a right element
              rightElement && 'pr-10',
              className,
            )}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-3 flex items-center text-[var(--text-muted)]">
              {rightElement}
            </div>
          )}
        </div>

        {error && (
          <p className="text-[13px] text-[var(--state-error)] leading-snug animate-fade-up">
            {error}
          </p>
        )}
        {helper && !error && (
          <p className="text-[12px] text-[var(--text-muted)] leading-snug">
            {helper}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';