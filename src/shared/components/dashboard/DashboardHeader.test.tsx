import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DashboardHeader } from './DashboardHeader';

describe('DashboardHeader', () => {
  it('renders title', () => {
    render(<DashboardHeader title="Financials" />);
    expect(screen.getByRole('heading', { name: 'Financials' })).toBeInTheDocument();
  });

  it('renders subtitle when provided', () => {
    render(<DashboardHeader title="T" subtitle="Sub text" />);
    expect(screen.getByText('Sub text')).toBeInTheDocument();
  });

  it('applies font-serif class when serif prop is true', () => {
    render(<DashboardHeader title="Reports" serif />);
    expect(screen.getByRole('heading')).toHaveClass('font-serif');
  });

  it('does not apply font-serif class by default', () => {
    render(<DashboardHeader title="Reports" />);
    expect(screen.getByRole('heading')).not.toHaveClass('font-serif');
  });

  it('renders action slot when provided', () => {
    render(<DashboardHeader title="T" action={<button>Go</button>} />);
    expect(screen.getByRole('button', { name: 'Go' })).toBeInTheDocument();
  });
});
