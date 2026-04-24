import * as React from 'react';
import { cn } from '@/core/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'bold' | 'auth' | 'animated';
  size?: 'sm' | 'md' | 'lg';
  state?: 'default' | 'error' | 'success' | 'warning';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  label?: string;
  helper?: string;
  error?: string;
  loading?: boolean;
  loading?: boolean;
  required?: boolean;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  className?: string;
}

export const UnifiedInput = React.forwardRef<HTMLInputElement, InputProps>((
  {
    variant = 'default',
    size = 'md',
    state = 'default',
    leftIcon,
    rightIcon,
    label,
    helper,
    error,
    loading = false,
    required = false,
    disabled,
    ariaLabel,
    ariaDescribedBy,
    className,
    id,
    ...props
  },
  ref
) => {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  const [isFocused, setIsFocused] = React.useState(false);

  const sizeClasses = {
    sm: 'h-9 px-3 text-xs',
    md: 'h-10 px-3 text-sm',
    lg: 'h-12 px-4 text-base',
  };

  const labelClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const stateTextClasses = {
    default: '',
    error: 'text-[var(--state-error)]',
    success: 'text-[var(--state-success)]',
    warning: 'text-[var(--state-warning)]',
  };

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className={cn(
            labelClasses[size],
            'font-medium leading-none',
            disabled && 'text-[var(--text-muted)]'
          )}
        >
          {label}
          {required && <span className="text-[var(--state-error)] ml-1">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          aria-label={ariaLabel || label}
          aria-describedby={ariaDescribedBy || (error ? `${inputId}-error` : undefined)}
          aria-invalid={state === 'error'}
          aria-required={required}
          aria-busy={loading}
          className={cn(
            'w-full bg-transparent border-none shadow-none outline-none ring-none',
            stateTextClasses[state],
            sizeClasses[size],
            leftIcon && 'pl-10',
            (rightIcon || loading) && 'pr-10',
            className,
          )}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
      </div>

      <div className="space-y-1">
        {error && (
          <p className="text-xs text-[var(--state-error)]">
            {error}
          </p>
        )}
        {helper && !error && (
          <p className="text-xs text-[var(--text-muted)]">
            {helper}
          </p>
        )}
      </div>
    </div>
  );
});

UnifiedInput.displayName = 'UnifiedInput';