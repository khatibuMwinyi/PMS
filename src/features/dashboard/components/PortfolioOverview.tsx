import Link from 'next/link';

interface PortfolioOverviewProps {
  title?: string;
  subtitle?: string;
}

export function PortfolioOverview({
  title = 'Portfolio Overview',
  subtitle = 'Manage your properties and services',
}: PortfolioOverviewProps) {
  return (
    <div className="mb-6">
      <h1 className="text-[var(--font-h1)] text-[var(--text-primary)]">{title}</h1>
      <p className="mt-1 text-[var(--font-body-sm)] text-[var(--text-secondary)]">
        {subtitle}
      </p>
    </div>
  );
}
