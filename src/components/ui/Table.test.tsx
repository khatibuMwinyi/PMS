import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Table, type Column } from './Table';

interface Row { id: string; name: string; }

const columns: Column<Row>[] = [
  { key: 'name', header: 'Name', accessor: (r) => r.name },
];

describe('Table', () => {
  it('renders rows', () => {
    render(<Table columns={columns} data={[{ id: '1', name: 'Ann' }]} keyExtractor={(r) => r.id} />);
    expect(screen.getByText('Ann')).toBeInTheDocument();
  });

  it('renders empty state when no data', () => {
    render(<Table columns={columns} data={[]} keyExtractor={(r) => r.id} emptyState="Nothing here" />);
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
  });

  it('renders skeleton rows when loading', () => {
    const { container } = render(<Table columns={columns} data={[]} keyExtractor={(r) => r.id} loading />);
    expect(container.querySelectorAll('[data-testid="skeleton-row"]').length).toBeGreaterThan(0);
  });
});
