import * as React from 'react';
import { cn } from '@/core/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bold';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-[var(--radius-lg)] border transition-all duration-200',
        variant === 'default' && [
          'border-[var(--border-subtle)]',
          'bg-[var(--surface-card)] shadow-[var(--shadow-card)]',
        ],
        variant === 'bold' && [
          'border-[var(--border-default)] shadow-bold',
          'hover:scale-[1.02] hover:-translate-y-1 hover:shadow-xl hover:shadow-[var(--shadow-card-bold)]',
        ],
        className,
      )}
      {...props}
    />
  )
);
Card.displayName = 'Card';

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pb-0', className)} {...props} />
  )
);
CardHeader.displayName = 'CardHeader';

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6', className)} {...props} />
  )
);
CardContent.displayName = 'CardContent';