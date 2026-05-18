import { render, screen } from '@testing-library/react';
import { StrikeBanner } from './StrikeBanner';
import type { ProviderDashboardData } from '../../schemas/provider-dashboard.schema';

function makeMetrics(overrides: Partial<ProviderDashboardData['metrics']> = {}): ProviderDashboardData['metrics'] {
  return {
    activeTaskCount: 0,
    acceptanceRate: 0,
    acceptanceRateDeltaPct: 0,
    rating: 0,
    ratingCount: 0,
    strikeCount: 0,
    suspendedUntil: null,
    ...overrides,
  };
}

describe('StrikeBanner', () => {
  it('renders nothing when 0 strikes and no suspension', () => {
    const { container } = render(<StrikeBanner metrics={makeMetrics()} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when suspendedUntil is in the past and no strikes', () => {
    const past = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { container } = render(<StrikeBanner metrics={makeMetrics({ suspendedUntil: past })} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders warning tier at 1 strike', () => {
    render(<StrikeBanner metrics={makeMetrics({ strikeCount: 1 })} />);
    expect(screen.getByText('You have 1 strike')).toBeInTheDocument();
    expect(screen.getByText(/2 more strikes will result in a 30-day suspension/)).toBeInTheDocument();
  });

  it('renders critical tier at 2 strikes', () => {
    render(<StrikeBanner metrics={makeMetrics({ strikeCount: 2 })} />);
    expect(screen.getByText('You have 2 strikes')).toBeInTheDocument();
    expect(screen.getByText(/One more strike will suspend your account/)).toBeInTheDocument();
  });

  it('renders critical tier at 3 strikes when suspendedUntil is null (data inconsistency)', () => {
    render(<StrikeBanner metrics={makeMetrics({ strikeCount: 3 })} />);
    expect(screen.getByText('You have 3 strikes')).toBeInTheDocument();
    expect(screen.getByText(/One more strike will suspend your account/)).toBeInTheDocument();
  });

  it('renders suspended tier when suspendedUntil is in the future', () => {
    const future = new Date('2026-06-15T00:00:00Z').toISOString();
    render(<StrikeBanner metrics={makeMetrics({ strikeCount: 3, suspendedUntil: future })} />);
    expect(screen.getByText('Account suspended')).toBeInTheDocument();
    expect(screen.getByText(/15 June 2026/)).toBeInTheDocument();
  });

  it('treats expired suspendedUntil as expired (falls through to strike count)', () => {
    const past = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    render(<StrikeBanner metrics={makeMetrics({ strikeCount: 1, suspendedUntil: past })} />);
    expect(screen.getByText('You have 1 strike')).toBeInTheDocument();
    expect(screen.queryByText('Account suspended')).not.toBeInTheDocument();
  });
});
