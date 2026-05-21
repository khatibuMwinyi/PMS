import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OwnerInvoicesClient } from './OwnerInvoicesClient';
import type { OwnerInvoiceDisplay } from '../services';

const makeRow = (overrides: Partial<OwnerInvoiceDisplay>): OwnerInvoiceDisplay => ({
  id: 'id-1',
  shortRef: 'INV-ABC123',
  propertyName: 'Msasani Villa',
  serviceTypeName: 'Cleaning',
  amountFormatted: 'TZS 420,000.00',
  status: 'PAID',
  dateFormatted: '12 May 2026',
  attempts: 0,
  ...overrides,
});

const rows: OwnerInvoiceDisplay[] = [
  makeRow({ id: '1', shortRef: 'INV-111', status: 'PAID' }),
  makeRow({ id: '2', shortRef: 'INV-222', status: 'PENDING' }),
  makeRow({ id: '3', shortRef: 'INV-333', status: 'OVERDUE' }),
  makeRow({ id: '4', shortRef: 'INV-444', status: 'FAILED' }),
  makeRow({ id: '5', shortRef: 'INV-555', status: 'CANCELLED' }),
];

describe('OwnerInvoicesClient', () => {
  it('renders all rows under All filter by default', () => {
    render(<OwnerInvoicesClient rows={rows} />);
    expect(screen.getByText('INV-111')).toBeInTheDocument();
    expect(screen.getByText('INV-555')).toBeInTheDocument();
  });

  it('filters to PENDING only when Pending pill clicked', () => {
    render(<OwnerInvoicesClient rows={rows} />);
    fireEvent.click(screen.getByRole('button', { name: 'Pending' }));
    expect(screen.getByText('INV-222')).toBeInTheDocument();
    expect(screen.queryByText('INV-111')).not.toBeInTheDocument();
    expect(screen.queryByText('INV-555')).not.toBeInTheDocument();
  });

  it('filters to OVERDUE only when Overdue pill clicked', () => {
    render(<OwnerInvoicesClient rows={rows} />);
    fireEvent.click(screen.getByRole('button', { name: 'Overdue' }));
    expect(screen.getByText('INV-333')).toBeInTheDocument();
    expect(screen.queryByText('INV-222')).not.toBeInTheDocument();
  });

  it('filters to FAILED only when Failed pill clicked', () => {
    render(<OwnerInvoicesClient rows={rows} />);
    fireEvent.click(screen.getByRole('button', { name: 'Failed' }));
    expect(screen.getByText('INV-444')).toBeInTheDocument();
    expect(screen.queryByText('INV-111')).not.toBeInTheDocument();
  });

  it('CANCELLED row visible under All but not under Paid', () => {
    render(<OwnerInvoicesClient rows={rows} />);
    expect(screen.getByText('INV-555')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Paid' }));
    expect(screen.queryByText('INV-555')).not.toBeInTheDocument();
    expect(screen.getByText('INV-111')).toBeInTheDocument();
  });

  it('shows Pay via Selcom button for PENDING rows', () => {
    render(<OwnerInvoicesClient rows={[makeRow({ id: '1', status: 'PENDING' })]} />);
    expect(screen.getByRole('button', { name: 'Pay via Selcom' })).toBeInTheDocument();
  });

  it('shows Pay via Selcom button for OVERDUE rows', () => {
    render(<OwnerInvoicesClient rows={[makeRow({ id: '1', status: 'OVERDUE' })]} />);
    expect(screen.getByRole('button', { name: 'Pay via Selcom' })).toBeInTheDocument();
  });

  it('shows Pay via Selcom button for FAILED rows', () => {
    render(<OwnerInvoicesClient rows={[makeRow({ id: '1', status: 'FAILED' })]} />);
    expect(screen.getByRole('button', { name: 'Pay via Selcom' })).toBeInTheDocument();
  });

  it('shows Receipt link for PAID rows', () => {
    render(<OwnerInvoicesClient rows={[makeRow({ id: '1', status: 'PAID' })]} />);
    expect(screen.getByRole('link', { name: /receipt/i })).toBeInTheDocument();
  });

  it('shows empty state message when no rows match filter', () => {
    render(<OwnerInvoicesClient rows={[makeRow({ status: 'PAID' })]} />);
    fireEvent.click(screen.getByRole('button', { name: 'Pending' }));
    expect(screen.getByText('No invoices match this filter.')).toBeInTheDocument();
  });

  it('shows attempts count for non-PAID rows with attempts > 0', () => {
    render(<OwnerInvoicesClient rows={[makeRow({ status: 'FAILED', attempts: 2 })]} />);
    expect(screen.getByText('2/3')).toBeInTheDocument();
  });
});
