'use client';

import { forwardRef, type ButtonHTMLAttributes, type AnchorHTMLAttributes, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'gold' | 'secondary' | 'ghost' | 'danger' | 'outline';
type Size = 'sm' | 'md' | 'lg';

interface BaseProps {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  children?: ReactNode;
  className?: string;
}

type ButtonAsButton = BaseProps & Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps> & { as?: 'button' };
type ButtonAsAnchor = BaseProps & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseProps> & { as: 'a'; href: string };
type ButtonProps = ButtonAsButton | ButtonAsAnchor;

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:   'bg-primary text-white hover:bg-primary-light active:translate-y-px border border-white/15',
  gold:      'bg-accent text-accent-foreground hover:bg-accent-light active:translate-y-px shadow-card',
  secondary: 'bg-transparent text-text-primary border border-border-default hover:bg-surface-overlay',
  ghost:     'bg-transparent text-text-primary hover:bg-surface-overlay',
  danger:    'bg-state-error text-white hover:opacity-90',
  outline:   'bg-transparent border border-border-default text-text-primary hover:bg-surface-overlay',
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: 'h-8 px-3 text-body-sm gap-1.5',
  md: 'h-10 px-4 text-body gap-2',
  lg: 'h-12 px-6 text-body-lg gap-2',
};

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(function Button(
  props,
  ref,
) {
  const {
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    fullWidth = false,
    iconLeft,
    iconRight,
    children,
    className,
    as = 'button',
    ...rest
  } = props as ButtonAsButton & { as?: 'a'; href?: string };

  const classes = cn(
    'inline-flex items-center justify-center rounded-md font-medium transition-all duration-base',
    'focus-visible:outline-none focus-visible:shadow-focus',
    'disabled:opacity-50 disabled:pointer-events-none',
    SIZE_CLASSES[size],
    VARIANT_CLASSES[variant],
    fullWidth && 'w-full',
    className,
  );

  const content = (
    <>
      {loading ? <Loader2 data-testid="spinner" className="animate-spin" size={16} /> : iconLeft}
      {children}
      {!loading && iconRight}
    </>
  );

  if ((as as string) === 'a') {
    const { href, onClick, ...anchorRest } = rest as AnchorHTMLAttributes<HTMLAnchorElement>;
    return (
      <a
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={disabled ? undefined : href}
        className={classes}
        onClick={disabled || loading ? (e) => e.preventDefault() : onClick}
        aria-disabled={disabled || loading || undefined}
        {...anchorRest}
      >
        {content}
      </a>
    );
  }

  const { onClick, type = 'button', ...buttonRest } = rest as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      type={type}
      disabled={disabled || loading}
      className={classes}
      onClick={loading ? undefined : onClick}
      {...buttonRest}
    >
      {content}
    </button>
  );
});
