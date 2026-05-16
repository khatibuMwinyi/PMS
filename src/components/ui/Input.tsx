'use client';

import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Size = 'sm' | 'md' | 'lg';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  helper?: string;
  error?: string;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  size?: Size;
}

const SIZE: Record<Size, string> = {
  sm: 'h-8 text-body-sm',
  md: 'h-10 text-body',
  lg: 'h-12 text-body-lg',
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, helper, error, iconLeft, iconRight, size = 'md', className, id, ...rest },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const helperId = `${inputId}-helper`;
  const hasError = Boolean(error);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-caption mb-1.5 text-text-primary font-medium">
          {label}
        </label>
      )}
      <div className="relative">
        {iconLeft && (
          <span className="absolute inset-y-0 left-3 flex items-center text-text-muted pointer-events-none">
            {iconLeft}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={hasError || undefined}
          aria-describedby={(helper || error) ? helperId : undefined}
          className={cn(
            'w-full rounded-md bg-surface-card text-text-primary',
            'border placeholder:text-text-muted',
            'transition-all duration-base',
            'focus:outline-none focus:shadow-focus',
            'disabled:bg-surface-overlay disabled:text-text-muted disabled:cursor-not-allowed',
            iconLeft && 'pl-10',
            iconRight && 'pr-10',
            !iconLeft && 'px-3',
            SIZE[size],
            hasError ? 'border-state-error focus:border-state-error' : 'border-border-default focus:border-border-focus',
            className,
          )}
          {...rest}
        />
        {iconRight && (
          <span className="absolute inset-y-0 right-3 flex items-center text-text-muted">
            {iconRight}
          </span>
        )}
      </div>
      {(error || helper) && (
        <p
          id={helperId}
          className={cn('mt-1.5 text-body-sm', hasError ? 'text-state-error' : 'text-text-muted')}
        >
          {error ?? helper}
        </p>
      )}
    </div>
  );
});
