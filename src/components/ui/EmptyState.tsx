'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/core/lib/utils';
import { Home, Building2, Users, AlertCircle, Search, FileText, DollarSign } from 'lucide-react';

interface EmptyStateProps {
  /** Icon to display */
  icon?: React.ReactNode;
  /** Title text */
  title: string;
  /** Description text */
  description?: string;
  /** Action button */
  action?: React.ReactNode;
  /** Secondary action */
  secondaryAction?: React.ReactNode;
  /** Size of the icon */
  iconSize?: 'sm' | 'md' | 'lg';
  /** Custom CSS classes */
  className?: string;
  /** Animation variant */
  variant?: 'default' | 'compact';
}

/**
 * Pre-built icon components for common empty states
 */
export const EmptyStateIcons = {
  properties: <Home className="w-12 h-12" />,
  buildings: <Building2 className="w-12 h-12" />,
  users: <Users className="w-12 h-12" />,
  search: <Search className="w-12 h-12" />,
  documents: <FileText className="w-12 h-12" />,
  payments: <DollarSign className="w-12 h-12" />,
  default: <AlertCircle className="w-12 h-12" />,
};

/**
 * Empty state component for when there's no data to display
 */
export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({
    icon,
    title,
    description,
    action,
    secondaryAction,
    iconSize = 'md',
    className,
    variant = 'default',
  }, ref) => {
    const getIconSize = () => {
      switch (iconSize) {
        case 'sm': return 'w-8 h-8';
        case 'md': return 'w-12 h-12';
        case 'lg': return 'w-16 h-16';
      }
    };

    const getSpacing = () => {
      switch (variant) {
        case 'compact': return 'py-8';
        default: return 'py-12';
      }
    };

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={cn(
          'text-center',
          getSpacing(),
          className
        )}
        role="status"
        aria-live="polite"
      >
        {/* Icon container */}
        <div className="mx-auto mb-4">
          <div
            className={cn(
              'inline-flex items-center justify-center rounded-full',
              'bg-[var(--surface-overlay)] text-[var(--text-muted)]',
              getIconSize()
            )}
          >
            {icon || EmptyStateIcons.default}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">
          {title}
        </h3>

        {/* Description */}
        {description && (
          <p className="text-sm text-[var(--text-muted)] mb-6 max-w-md mx-auto">
            {description}
          </p>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {action && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              {action}
            </motion.div>
          )}
          {secondaryAction && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              {secondaryAction}
            </motion.div>
          )}
        </div>

        {/* Additional info */}
        {variant === 'default' && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xs text-[var(--text-muted)] mt-6"
          >
            No data available
          </motion.p>
        )}
      </motion.div>
    );
  }
);

EmptyState.displayName = 'EmptyState';

/**
 * Empty state for list/table views with search capabilities
 */
export const ListEmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({
    icon = EmptyStateIcons.search,
    title = "No results found",
    description = "Try adjusting your search or filter criteria",
    action,
    className,
    ...props
  }, ref) => {
    return (
      <EmptyState
        ref={ref}
        icon={icon}
        title={title}
        description={description}
        action={action}
        className={cn('border-t border-[var(--border-subtle)] pt-8', className)}
        {...props}
      >
        {/* Search suggestions */}
        <div className="mt-6 space-y-2">
          <p className="text-sm text-[var(--text-muted)]">Suggestions:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            <span className="text-xs px-3 py-1 bg-[var(--surface-overlay)] rounded-full">
              Check your spelling
            </span>
            <span className="text-xs px-3 py-1 bg-[var(--surface-overlay)] rounded-full">
              Use fewer keywords
            </span>
            <span className="text-xs px-3 py-1 bg-[var(--surface-overlay)] rounded-full">
              Browse all items
            </span>
          </div>
        </div>
      </EmptyState>
    );
  }
);

ListEmptyState.displayName = 'ListEmptyState';

/**
 * Loading state component that can replace empty state
 */
export const LoadingState = ({
  message = "Loading...",
  className,
}: {
  message?: string;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12',
        className
      )}
      role="status"
      aria-live="polite"
    >
      <div className="animate-spin w-8 h-8 border-2 border-[var(--border-default)] border-t-[var(--brand-primary)] rounded-full mb-4" />
      <p className="text-sm text-[var(--text-muted)]">{message}</p>
    </div>
  );
};

/**
 * Error state component for failed data loading
 */
export const ErrorState = React.forwardRef<HTMLDivElement, {
  message: string;
  onRetry?: () => void;
  className?: string;
}>(({ message, onRetry, className }, ref) => {
  return (
    <EmptyState
      ref={ref}
      icon={<AlertCircle className="w-12 h-12 text-[var(--state-error)]" />}
      title="Something went wrong"
      description={message}
      action={
        onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-[var(--brand-primary)] text-white rounded-md hover:bg-[var(--brand-primary-dark)] transition-colors"
          >
            Try again
          </button>
        )
      }
      className={cn('border-t border-[var(--border-subtle)]', className)}
    />
  );
});

ErrorState.displayName = 'ErrorState';