import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QuoteDemo } from './QuoteDemo';

describe('QuoteDemo', () => {
  it('renders the section heading', () => {
    render(<QuoteDemo />);
    expect(screen.getByText(/get an instant quote/i)).toBeInTheDocument();
  });

  it('shows a price estimate when service is selected', () => {
    render(<QuoteDemo />);
    const select = screen.getByLabelText(/service/i);
    fireEvent.change(select, { target: { value: 'cleaning' } });
    expect(screen.getByText(/TZS/)).toBeInTheDocument();
  });

  it('updates price when units change', () => {
    render(<QuoteDemo />);
    const serviceSelect = screen.getByLabelText(/service/i);
    fireEvent.change(serviceSelect, { target: { value: 'cleaning' } });
    const unitsInput = screen.getByLabelText(/units/i);
    const priceBefore = screen.getByText(/TZS/).textContent;
    fireEvent.change(unitsInput, { target: { value: '3' } });
    const priceAfter = screen.getByText(/TZS/).textContent;
    expect(priceAfter).not.toBe(priceBefore);
  });
});
