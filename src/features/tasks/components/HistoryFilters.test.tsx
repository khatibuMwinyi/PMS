import { render, screen } from '@testing-library/react';
import { HistoryFilters } from './HistoryFilters';

describe('HistoryFilters', () => {
  it('renders all 5 status pills', () => {
    render(<HistoryFilters active={[]} />);
    for (const label of ['Completed', 'Verified', 'Disputed', 'Overdue', 'Cancelled']) {
      expect(screen.getByRole('link', { name: label })).toBeInTheDocument();
    }
  });

  it('toggles VERIFIED into the URL when not active', () => {
    render(<HistoryFilters active={['DISPUTED']} />);
    const verified = screen.getByRole('link', { name: 'Verified' });
    expect(verified).toHaveAttribute('href', '/provider/history?status=DISPUTED%2CVERIFIED');
  });

  it('removes VERIFIED from the URL when already active', () => {
    render(<HistoryFilters active={['DISPUTED', 'VERIFIED']} />);
    const verified = screen.getByRole('link', { name: 'Verified' });
    expect(verified).toHaveAttribute('href', '/provider/history?status=DISPUTED');
  });

  it('omits status param when removing the only active status', () => {
    render(<HistoryFilters active={['VERIFIED']} />);
    const verified = screen.getByRole('link', { name: 'Verified' });
    expect(verified).toHaveAttribute('href', '/provider/history');
  });

  it('marks active pills with data-active="true"', () => {
    render(<HistoryFilters active={['VERIFIED']} />);
    expect(screen.getByRole('link', { name: 'Verified' })).toHaveAttribute('data-active', 'true');
    expect(screen.getByRole('link', { name: 'Disputed' })).toHaveAttribute('data-active', 'false');
  });
});
