'use client';

import { Loader2 } from 'lucide-react';
import { UnifiedButton, type UnifiedButtonProps } from '@/components/ui/UnifiedButton';
import { cn } from '@/core/lib/utils';

interface LoadingButtonProps extends UnifiedButtonProps {
  loading?: boolean;
  loadingText?: string;
}

export function LoadingButton({
  loading = false,
  loadingText,
  children,
  className,
  disabled,
  ...props
}: LoadingButtonProps) {
  return (
    <UnifiedButton
      disabled={disabled || loading}
      className={cn(className)}
      {...props}
    >
      {loading && (
        <Loader2
          size={16}
          className="shrink-0"
          style={{ animation: 'spin 0.8s linear infinite' }}
        />
      )}
      <span className={loading ? 'opacity-60' : undefined}>
        {loading && loadingText ? loadingText : children}
      </span>
    </UnifiedButton>
  );
}