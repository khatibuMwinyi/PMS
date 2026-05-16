import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from './Badge';

describe('Badge', () => {
  it('renders label', () => {
    render(<Badge variant="success">Active</Badge>);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders dot when prop set', () => {
    const { container } = render(<Badge variant="success" dot>Active</Badge>);
    expect(container.querySelector('[data-testid="badge-dot"]')).toBeInTheDocument();
  });

  it('applies info variant class', () => {
    const { container } = render(<Badge variant="info">Pending</Badge>);
    expect(container.firstChild).toHaveClass('bg-state-info-bg');
  });
});
