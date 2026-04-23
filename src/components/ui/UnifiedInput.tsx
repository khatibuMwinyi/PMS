'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/core/lib/utils';

export type InputVariant = 'default' | 'bold' | 'auth' | 'animated';
export type InputSize = 'sm' | 'md' | 'lg';
export type InputState = 'default' | 'error' | 'success' | 'warning';

interface UnifiedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Visual style variant */
  variant?: InputVariant;
  /** Size of the input */
  size?: InputSize;
  /** Current state of the input */
  state?: InputState;
  /** Icon to display on the left */
  leftIcon?: React.ReactNode;
  /** Icon to display on the right */
  rightIcon?: React.ReactNode;
  /** Label text */
  label?: string;
  /** Helper text below input */
  helper?: string;
  /** Error message when state is error */
  error?: string;
  /** Whether input is loading */
  loading?: boolean;
  /** Whether input is required */
  required?: boolean;
  /** Accessible label for screen readers */
  ariaLabel?: string;
  /** Describes the input for screen readers */
  ariaDescribedBy?: string;
  /** Custom CSS classes */
  className?: string;
}

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

const borderClasses = {
  default: 'border-[var(--border-default)]',
  bold: 'border-[var(--border-subtle)]',
  auth: 'border-[var(--border-subtle)]',
  animated: 'border-[var(--border-default)]',
};

const focusRingClasses = {
  default: 'focus:ring-[var(--brand-primary)]',
  bold: 'focus:ring-[var(--brand-gold)]',
  auth: 'focus:ring-[var(--brand-gold)]',
  animated: 'focus:ring-[var(--brand-primary)]',
};

const stateClasses = {
  default: 'border-[var(--border-default)]',
  error: 'border-[var(--state-error)]',
  success: 'border-[var(--state-success)]',
  warning: 'border-[var(--state-warning)]',
};

const stateFocusClasses = {
  default: 'focus:ring-[var(--brand-primary)]',
  error: 'focus:ring-[var(--state-error)]',
  success: 'focus:ring-[var(--state-success)]',
  warning: 'focus:ring-[var(--state-warning)]',
};

const stateTextClasses = {
  default: '[--text-primary]',
  error: '[--text-error]',
  success: '[--text-success]',
  warning: '[--text-warning]',
};

const stateIconClasses = {
  default: 'text-[var(--text-muted)]',
  error: 'text-[var(--state-error)]',
  success: 'text-[var(--state-success)]',
  warning: 'text-[var(--state-warning)]',
};

const variantClasses = {
  default: 'bg-[var(--surface-card)]',
  bold: 'bg-[var(--surface-card)] hover:shadow-[var(--shadow-bold)]',
  auth: 'bg-white/80 backdrop-blur-md',
  animated: 'bg-[var(--surface-card)]',
};

/**
 * Unified input component supporting all variants with consistent API
 */
export const UnifiedInput = React.forwardRef<HTMLInputElement, UnifiedInputProps>(
  ({
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
  }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    const inputRef = ref as React.RefObject<HTMLInputElement>;
    const [isFocused, setIsFocused] = React.useState(false);
    const [showPassword, setShowPassword] = React.useState(false);

    const isPassword = props.type === 'password';
    const type = isPassword && showPassword ? 'text' : props.type;

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      props.onBlur?.(e);
    };

    const togglePassword = () => {
      setShowPassword(!showPassword);
    };

    // Animation variants for different states
    const animatedVariants = {
      default: {
        borderColor: 'var(--border-default)',
        boxShadow: 'none',
      },
      focus: {
        borderColor: 'var(--border-focus)',
        boxShadow: '0 0 0 3px rgba(200, 145, 40, 0.1)',
      },
      error: {
        borderColor: 'var(--state-error)',
        boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.1)',
      },
      success: {
        borderColor: 'var(--state-success)',
        boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.1)',
      },
    };

    const currentVariant = variant === 'animated' && isFocused ? 'focus' : state;

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

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <div className={cn(stateIconClasses[state], 'transition-colors')}>
                {leftIcon}
              </div>
            </div>
          )}

          <motion.div
            animate={animatedVariants[currentVariant as keyof typeof animatedVariants]}
            transition={{ duration: 0.2 }}
            className={cn(
              'relative w-full rounded-[var(--radius-md)]',
              'border transition-colors duration-200',
              borderClasses[variant],
              stateClasses[state],
              focusRingClasses[variant],
              'focus:outline-none',
              disabled && 'opacity-50 cursor-not-allowed',
              variant === 'auth' && 'backdrop-blur-md',
              sizeClasses[size]
            )}
          >
            <input
              ref={inputRef}
              id={inputId}
              type={type}
              disabled={disabled}
              aria-label={ariaLabel || label}
              aria-describedby={ariaDescribedBy || (error ? `${inputId}-error` : undefined)}
              aria-invalid={state === 'error'}
              aria-required={required}
              aria-busy={loading}
              className={cn(
                'w-full bg-transparent outline-none',
                'placeholder:text-[var(--text-muted)]',
                stateTextClasses[state],
                leftIcon && 'pl-10',
                rightIcon || isPassword ? 'pr-10' : 'pr-3',
                props.className
              )}
              onFocus={handleFocus}
              onBlur={handleBlur}
              {...props}
            />

            {loading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="animate-spin w-4 h-4 border-2 border-[var(--border-default)] border-t-[var(--brand-primary)] rounded-full" />
              </div>
            )}

            {(rightIcon || isPassword) && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {isPassword ? (
                  <button
                    type="button"
                    onClick={togglePassword}
                    className="p-1 rounded hover:bg-[var(--surface-overlay)] transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                ) : (
                  <div className={cn(stateIconClasses[state], 'transition-colors')}>
                    {rightIcon}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>

        <div className="space-y-1">
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-[var(--state-error)] leading-snug"
            >
              {error}
            </motion.p>
          )}
          {helper && !error && (
            <p className="text-xs text-[var(--text-muted)] leading-snug">
              {helper}
            </p>
          )}
        </div>
      </div>
    );
  }
);

UnifiedInput.displayName = 'UnifiedInput';

/**
 * Form field wrapper for consistent form layout
 */
export const FormField = ({
  children,
  error,
  helper,
  className,
}: {
  children: React.ReactNode;
  error?: string;
  helper?: string;
  className?: string;
}) => {
  return (
    <div className={cn('space-y-2', className)}>
      {children}
      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-[var(--state-error)]"
        >
          {error}
        </motion.p>
      )}
      {helper && !error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-[var(--text-muted)]"
        >
          {helper}
        </motion.p>
      )}
    </div>
  );
};