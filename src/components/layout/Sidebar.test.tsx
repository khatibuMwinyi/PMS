import { render, screen } from '@testing-library/react';
import { Sidebar } from './Sidebar';

let mockPathname = '/provider';
vi.mock('next/navigation', () => ({ usePathname: () => mockPathname }));

describe('Sidebar PROVIDER nav', () => {
  beforeEach(() => {
    mockPathname = '/provider';
  });

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

  it('Dashboard is active only when on /provider exactly', () => {
    mockPathname = '/provider';
    const { unmount } = render(<Sidebar role="PROVIDER" />);
    const dashboard = screen.getByText('Dashboard').closest('a')!;
    const wallet = screen.getByText('Wallet').closest('a')!;
    expect(dashboard.className).toMatch(/border-l-2/);
    expect(wallet.className).not.toMatch(/border-l-2/);
    unmount();
  });

  it('Dashboard is NOT active when on /provider/wallet', () => {
    mockPathname = '/provider/wallet';
    render(<Sidebar role="PROVIDER" />);
    const dashboard = screen.getByText('Dashboard').closest('a')!;
    const wallet = screen.getByText('Wallet').closest('a')!;
    expect(dashboard.className).not.toMatch(/border-l-2/);
    expect(wallet.className).toMatch(/border-l-2/);
  });

  it('Wallet stays active on nested wallet route', () => {
    mockPathname = '/provider/wallet/anything';
    render(<Sidebar role="PROVIDER" />);
    const wallet = screen.getByText('Wallet').closest('a')!;
    expect(wallet.className).toMatch(/border-l-2/);
  });
});
