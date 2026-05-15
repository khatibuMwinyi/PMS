import { type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'elevated' | 'outlined' | 'flat';
type Padding = 'none' | 'compact' | 'comfortable' | 'spacious';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: Variant;
  padding?: Padding;
  interactive?: boolean;
  header?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
}

const VARIANT: Record<Variant, string> = {
  elevated: 'bg-surface-card shadow-card border border-border-subtle',
  outlined: 'bg-surface-card border border-border-default',
  flat:     'bg-surface-card',
};

const PADDING: Record<Padding, string> = {
  none:        'p-0',
  compact:     'p-4',
  comfortable: 'p-6',
  spacious:    'p-8',
};

export function Card({
  variant = 'elevated',
  padding = 'comfortable',
  interactive = false,
  header,
  footer,
  children,
  className,
  ...rest
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-lg transition-all duration-base',
        VARIANT[variant],
        interactive && 'cursor-pointer hover:-translate-y-0.5 hover:shadow-bold',
        className,
      )}
      {...rest}
    >
      {header && <div className="px-6 pt-6 pb-3 border-b border-border-subtle">{header}</div>}
      <div className={cn(PADDING[padding], header && 'pt-3', footer && 'pb-3')}>{children}</div>
      {footer && <div className="px-6 pb-6 pt-3 border-t border-border-subtle">{footer}</div>}
    </div>
  );
}

// Compatibility shims for shadcn-style sub-exports used by existing consumers
export function CardContent({ children, className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-6', className)} {...rest}>{children}</div>;
}

export function CardHeader({ children, className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-6 pt-6 pb-3', className)} {...rest}>{children}</div>;
}

export function CardTitle({ children, className, ...rest }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('text-h3', className)} {...rest}>{children}</h3>;
}

export function CardFooter({ children, className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-6 pb-6 pt-3 border-t border-border-subtle', className)} {...rest}>{children}</div>;
}

export function CardDescription({ children, className, ...rest }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-body-sm text-text-muted', className)} {...rest}>{children}</p>;
}
