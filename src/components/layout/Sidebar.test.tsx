import { render, screen } from '@testing-library/react';
import { Sidebar } from './Sidebar';

vi.mock('next/navigation', () => ({ usePathname: () => '/provider' }));

describe('Sidebar PROVIDER nav', () => {
  it('renders Dashboard, Assignments, Tasks, Wallet, Settings', () => {
    render(<Sidebar role="PROVIDER" />);
    for (const label of ['Dashboard', 'Assignments', 'Tasks', 'Wallet', 'Settings']) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });
  it('does not render Earnings or Ratings standalone', () => {
    render(<Sidebar role="PROVIDER" />);
    expect(screen.queryByText('Earnings')).not.toBeInTheDocument();
    expect(screen.queryByText('Ratings')).not.toBeInTheDocument();
  });
});
