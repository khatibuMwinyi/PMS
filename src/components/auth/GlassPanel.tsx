import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Padding = 'comfortable' | 'spacious';

interface GlassPanelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: Padding;
}

const PADDING_MAP: Record<Padding, string> = {
  comfortable: 'p-6 sm:p-8',
  spacious: 'p-8 sm:p-10',
};

export const GlassPanel = forwardRef<HTMLDivElement, GlassPanelProps>(
  function GlassPanel({ children, className, padding = 'comfortable', ...rest }, ref) {
    return (
      <div
        ref={ref}
        className={cn('glass-panel relative overflow-hidden', PADDING_MAP[padding], className)}
        {...rest}
      >
        {children}
      </div>
    );
  }
);
