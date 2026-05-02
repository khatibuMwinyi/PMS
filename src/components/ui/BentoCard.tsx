import type { ReactNode } from 'react';

interface BentoCardProps {
  icon?: ReactNode;
  label: string;
  value: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function BentoCard({ icon, label, value, trend, className = '' }: BentoCardProps) {
  return (
    <div className={`rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 shadow-[var(--shadow-card)] transition-all duration-200 hover:shadow-md ${className}`}>
      <div className="flex items-start justify-between">
        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--surface-100)] text-[var(--brand-gold)]">
            {icon}
          </div>
        )}
        {trend && (
          <span className={`text-sm font-medium ${trend.isPositive ? 'text-[var(--state-success)]' : 'text-[var(--state-error)]'}`}>
            {trend.isPositive ? '+' : ''}{trend.value}%
          </span>
        )}
      </div>
      <div className="mt-3">
        <p className="text-sm font-[var(--font-body-sm)] text-[var(--text-secondary)]">{label}</p>
        <p className="mt-1 text-2xl font-bold text-[var(--text-primary)]">{value}</p>
      </div>
    </div>
  );
}
