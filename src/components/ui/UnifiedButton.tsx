'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/core/lib/utils';

export type ButtonVariant = 'default' | 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger' | 'bold';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type ButtonState = 'default' | 'loading' | 'disabled' | 'success';

interface UnifiedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style variant */
  variant?: ButtonVariant;
  /** Size of the button */
  size?: ButtonSize;
  /** Current state of the button */
  state?: ButtonState;
  /** Loading spinner */
  loading?: boolean;
  /** Icon to display on the left */
  leftIcon?: React.ReactNode;
  /** Icon to display on the right */
  rightIcon?: React.ReactNode;
  /** Accessible label for screen readers */
  ariaLabel?: string;
  /** Describes the button for screen readers */
  ariaDescribedBy?: string;
  /** Custom CSS classes */
  className?: string;
  /** Full width button */
  fullWidth?: boolean;
  /** Whether button should have ripple effect */
  ripple?: boolean;
}

const sizeClasses = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
};

const labelClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

const baseClasses = 'font-medium rounded-[var(--radius-md)] transition-all duration-200 inline-flex items-center justify-center gap-2';

const variantClasses = {
  default: 'bg-[var(--surface-overlay)] text-[var(--text-primary)] hover:bg-[var(--surface-card)] border border-[var(--border-default)]',
  primary: 'bg-[var(--brand-primary)] text-[var(--text-on-brand)] hover:bg-[var(--brand-primary-dark)] focus:ring-[var(--brand-primary)]',
  secondary: 'bg-[var(--surface-overlay)] text-[var(--text-primary)] hover:bg-[var(--surface-card)] border border-[var(--border-default)]',
  ghost: 'text-[var(--text-primary)] hover:bg-[var(--surface-overlay)]',
  outline: 'border-[var(--border-default)] text-[var(--text-primary)] hover:bg-[var(--surface-overlay)]',
  danger: 'bg-[var(--state-error)] text-white hover:bg-[var(--state-error)]/90 focus:ring-[var(--state-error)]',
  bold: 'bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] text-white hover:shadow-[var(--shadow-bold)] focus:ring-[var(--brand-gold)]',
};

const stateClasses = {
  default: '',
  loading: 'cursor-not-allowed opacity-70',
  disabled: 'cursor-not-allowed opacity-50',
  success: 'bg-[var(--state-success)] text-white hover:bg-[var(--state-success)]',
};

const rippleClasses = {
  default: 'bg-[var(--text-muted)]/20',
  primary: 'bg-white/20',
  secondary: 'bg-[var(--text-muted)]/20',
  ghost: 'bg-[var(--text-muted)]/20',
  outline: 'bg-[var(--text-muted)]/20',
  danger: 'bg-white/20',
  bold: 'bg-white/20',
};

/**
 * Unified button component supporting all variants with consistent API
 */
export const UnifiedButton = React.forwardRef<HTMLButtonElement, UnifiedButtonProps>(
  ({
    variant = 'default',
    size = 'md',
    state = 'default',
    loading = false,
    leftIcon,
    rightIcon,
    disabled,
    ariaLabel,
    ariaDescribedBy,
    fullWidth = false,
    ripple = true,
    children,
    className,
    ...props
  }, ref) => {
    const [ripples, setRipples] = React.useState<Array<{ x: number; y: number; id: number }>>([]);
    const rippleId = React.useRef(0);
    const internalRef = React.useRef<HTMLButtonElement>(null);

    React.useEffect(() => {
      if (ref && typeof ref === 'object' && 'current' in ref) {
        (ref as React.MutableRefObject<HTMLButtonElement>).current = internalRef.current;
      }
    }, [ref]);

    const isDisabled = disabled || state === 'disabled' || state === 'loading' || loading;

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (isDisabled || !ripple) return;

      const rect = internalRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const newRipple = { x, y, id: rippleId.current++ };
      setRipples((prev) => [...prev, newRipple]);

      // Remove ripple after animation
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
      }, 500);

      props.onClick?.(e);
    };

    const getVariantClass = () => {
      return variantClasses[variant];
    };

    const getStateClass = () => {
      return stateClasses[state];
    };

    return (
      <button
        ref={internalRef}
        disabled={isDisabled}
        aria-label={ariaLabel || (typeof children === 'string' ? children : undefined)}
        aria-describedby={ariaDescribedBy}
        aria-busy={state === 'loading' || loading}
        aria-disabled={isDisabled}
        className={cn(
          baseClasses,
          getVariantClass(),
          getStateClass(),
          sizeClasses[size],
          fullWidth && 'w-full',
          isDisabled && 'cursor-not-allowed',
          className
        )}
        onClick={handleClick}
        {...props}
      >
        {/* Ripple effects */}
        {ripples.length > 0 && (
          <div className="absolute inset-0 overflow-hidden rounded-[var(--radius-md)]">
            {ripples.map((ripple) => (
              <motion.span
                key={ripple.id}
                className={cn(
                  'absolute rounded-full pointer-events-none',
                  rippleClasses[variant]
                )}
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 4, opacity: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                style={{
                  left: ripple.x - 10,
                  top: ripple.y - 10,
                  width: 20,
                  height: 20,
                }}
              />
            ))}
          </div>
        )}

        {/* Loading spinner */}
        {(state === 'loading' || loading) && (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}

        {/* Left icon */}
        {!loading && leftIcon && (
          <span className="w-4 h-4">{leftIcon}</span>
        )}

        {/* Children */}
        <span className={cn(loading && 'opacity-0')}>{children}</span>

        {/* Right icon */}
        {!loading && rightIcon && (
          <span className="w-4 h-4">{rightIcon}</span>
        )}
      </button>
    );
  }
);

UnifiedButton.displayName = 'UnifiedButton';

/**
 * Animated button with enhanced interactions
 */
export const AnimatedButton = React.forwardRef<HTMLButtonElement, UnifiedButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      children,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: variant === 'bold' ? 1.02 : 1.05 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          'relative overflow-hidden',
          className
        )}
        {...props}
      >
        {/* Shine effect */}
        {variant === 'bold' && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
            initial={{ x: '-100%' }}
            whileHover={{ x: '100%' }}
            transition={{ duration: 0.8 }}
          />
        )}

        {children}
      </motion.button>
    );
  }
);

AnimatedButton.displayName = 'AnimatedButton';

/**
 * Button group for related actions
 */
export const ButtonGroup = ({
  children,
  orientation = 'horizontal',
  className,
}: {
  children: React.ReactNode;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}) => {
  return (
    <div
      className={cn(
        'inline-flex',
        orientation === 'horizontal' ? 'space-x-1' : 'flex-col space-y-1',
        className
      )}
    >
      {React.Children.map(children, (child, index) => (
        <React.Fragment key={index}>
          {child}
        </React.Fragment>
      ))}
    </div>
  );
};

/**
 * Icon button for actions with just an icon
 */
export const IconButton = React.forwardRef<HTMLButtonElement, Omit<UnifiedButtonProps, 'children'>>(
  ({ leftIcon, rightIcon, ...props }, ref) => {
    return (
      <UnifiedButton
        ref={ref}
        size="sm"
        {...props}
      >
        {leftIcon}
      </UnifiedButton>
    );
  }
);

IconButton.displayName = 'IconButton';