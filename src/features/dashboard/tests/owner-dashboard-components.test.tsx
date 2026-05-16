// src/features/dashboard/tests/owner-dashboard-components.test.tsx
import { describe, it, expect, vi } from 'vitest';

// Stub server-only modules so the panel components (which transitively import
// '@/features/dashboard/queries/owner', which calls `import 'server-only'`)
// can be loaded inside the jsdom test environment.
vi.mock('server-only', () => ({}));
vi.mock('@/features/dashboard/queries/owner', () => ({
  getOwnerActiveProperties: vi.fn(),
  getOwnerRecentRequests: vi.fn(),
}));

import { render, screen } from '@testing-library/react';
import { KpiCard } from '@/shared/components/ui/KpiCard';
import { DollarSign } from 'lucide-react';
import { ActivePropertiesEmptyState } from '@/features/dashboard/components/owner/OwnerActivePropertiesPanel';
import { RecentRequestsEmptyState } from '@/features/dashboard/components/owner/OwnerRecentRequestsPanel';
import { DashboardHeader } from '@/shared/components/dashboard/DashboardHeader';

describe('KpiCard', () => {
  it('renders label and value', () => {
    render(<KpiCard label="Total Spent" value="TZS 42,500.00" icon={DollarSign} />);
    expect(screen.getByText('Total Spent')).toBeInTheDocument();
    expect(screen.getByText('TZS 42,500.00')).toBeInTheDocument();
  });

  it('renders up trend with arrow', () => {
    render(
      <KpiCard
        label="Spend"
        value="TZS 100"
        icon={DollarSign}
        trend={{ direction: 'up', pctFormatted: '12.0%', comparisonLabel: 'vs last year' }}
      />,
    );
    expect(screen.getByText('12.0% vs last year')).toBeInTheDocument();
  });

  it('renders subtext when provided', () => {
    render(
      <KpiCard
        label="Active"
        value="24"
        icon={DollarSign}
        subtext={{ text: '8 Pending Acceptance' }}
      />,
    );
    expect(screen.getByText('8 Pending Acceptance')).toBeInTheDocument();
  });
});

describe('DashboardHeader', () => {
  it('renders title without subtitle/asOf', () => {
    render(<DashboardHeader title="Dashboard Overview" />);
    expect(screen.getByRole('heading', { name: 'Dashboard Overview' })).toBeInTheDocument();
  });

  it('renders asOf timestamp when provided', () => {
    render(<DashboardHeader title="X" asOf={new Date('2026-05-16T09:41:00Z')} />);
    expect(screen.getByText('Data as of')).toBeInTheDocument();
  });
});

describe('ActivePropertiesEmptyState', () => {
  it('renders CTA link to add property', () => {
    render(<ActivePropertiesEmptyState />);
    const link = screen.getByRole('link', { name: /add your first property/i });
    expect(link).toHaveAttribute('href', '/owner/properties/new');
  });
});

describe('RecentRequestsEmptyState', () => {
  it('renders empty message', () => {
    render(<RecentRequestsEmptyState />);
    expect(screen.getByText('No recent requests.')).toBeInTheDocument();
  });
});
