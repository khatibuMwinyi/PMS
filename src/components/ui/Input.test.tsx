import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Input } from './Input';

describe('Input', () => {
  it('renders with label', () => {
    render(<Input label="Email" />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('shows helper text', () => {
    render(<Input label="Email" helper="we never share" />);
    expect(screen.getByText('we never share')).toBeInTheDocument();
  });

  it('shows error and aria-invalid', () => {
    render(<Input label="Email" error="required" />);
    expect(screen.getByText('required')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
  });

  it('renders left icon', () => {
    render(<Input label="Search" iconLeft={<span data-testid="leaf">L</span>} />);
    expect(screen.getByTestId('leaf')).toBeInTheDocument();
  });
});
