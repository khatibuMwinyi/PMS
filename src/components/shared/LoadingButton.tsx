'use client';

import { Loader2 } from 'lucide-react';
import { Button, type ButtonProps } from '@/components/ui/button';
import { cn } from '@/core/lib/utils';

interface LoadingButtonProps extends ButtonProps {
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
    <Button
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
    </Button>
  );
}