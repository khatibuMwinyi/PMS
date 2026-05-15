import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Users } from 'lucide-react';
import { Stat } from './Stat';

describe('Stat', () => {
  it('renders label and value', () => {
    render(<Stat label="Users" value={42} />);
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders unit suffix', () => {
    render(<Stat label="Revenue" value="128,450" unit="TZS" />);
    expect(screen.getByText('TZS')).toBeInTheDocument();
  });

  it('renders trend with direction', () => {
    render(<Stat label="x" value={10} trend={{ direction: 'up', value: 12 }} />);
    expect(screen.getByText(/12%/)).toBeInTheDocument();
  });

  it('renders icon when provided', () => {
    render(<Stat label="x" value={1} icon={Users} />);
    expect(document.querySelector('svg')).toBeInTheDocument();
  });
});
