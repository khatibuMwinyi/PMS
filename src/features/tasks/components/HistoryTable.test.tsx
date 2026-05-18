import { render, screen } from '@testing-library/react';
import { HistoryTable, HistoryTableSkeleton } from './HistoryTable';
import type { HistoryRow } from '../queries';

const row: HistoryRow = {
  id: 'task-1',
  scheduledFor: '2026-04-01T10:00:00.000Z',
  uiStatus: 'VERIFIED',
  serviceTypeName: 'HVAC',
  zone: 'Downtown',
  providerPayoutTZS: '80000.00',
};

describe('HistoryTable', () => {
  it('renders one row per item', () => {
    render(<HistoryTable rows={[row, { ...row, id: 'task-2', uiStatus: 'DISPUTED' }]} hasFilter={false} />);
    expect(screen.getAllByRole('row')).toHaveLength(3); // header + 2 data rows
  });

  it('row links to /provider/tasks/[id]', () => {
    render(<HistoryTable rows={[row]} hasFilter={false} />);
    const link = screen.getByRole('link', { name: /#TASK-1/i });
    expect(link).toHaveAttribute('href', '/provider/tasks/task-1');
  });

  it('renders payout via formatTZS', () => {
    render(<HistoryTable rows={[row]} hasFilter={false} />);
    expect(screen.getByText('TZS 80,000')).toBeInTheDocument();
  });

  it('shows generic empty state when no filter and no rows', () => {
    render(<HistoryTable rows={[]} hasFilter={false} />);
    expect(screen.getByText(/No history yet/)).toBeInTheDocument();
  });

  it('shows filter-specific empty state when filter active and no rows', () => {
    render(<HistoryTable rows={[]} hasFilter />);
    expect(screen.getByText(/No matches for current filters/)).toBeInTheDocument();
  });
});

describe('HistoryTableSkeleton', () => {
  it('renders 5 skeleton rows', () => {
    const { container } = render(<HistoryTableSkeleton />);
    expect(container.querySelectorAll('[data-skeleton="row"]')).toHaveLength(5);
  });
});
