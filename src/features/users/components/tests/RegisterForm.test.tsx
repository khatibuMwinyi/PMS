import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RegisterForm } from '../RegisterForm';
import { vi } from 'vitest';

// Mock next/router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  useSearchParams: () => {
    return {
      get: vi.fn(() => null),
    } as any;
  },
}));

describe('RegisterForm - Core Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    render(<RegisterForm />);
  });

  test('renders registration form with role toggle', () => {
    expect(screen.getByText('Create Account')).toBeInTheDocument();
    expect(screen.getByText('Property Owner')).toBeInTheDocument();
    expect(screen.getByText('Service Provider')).toBeInTheDocument();
    expect(screen.getByText('Administrator')).toBeInTheDocument();
  });

  test('shows password strength indicator when typing', async () => {
    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;
    const strengthBar = screen.getByRole('progressbar');

    // Initially weak
    expect(strengthBar).toHaveClass(/text-muted/);

    // Type 6 chars - still weak
    fireEvent.change(passwordInput, { target: { value: 'abc123' } });
    await waitFor(() => {
      expect(strengthBar).toHaveClass(/text-muted/);
    });

    // Type 10 chars - medium
    fireEvent.change(passwordInput, { target: { value: 'abc123ABC!' } });
    await waitFor(() => {
      expect(strengthBar).toHaveClass(/text-warning/);
    });

    // Type 15 chars - strong
    fireEvent.change(passwordInput, { target: { value: 'Abcdefg123!@#' } });
    await waitFor(() => {
      expect(strengthBar).toHaveClass(/text-success/);
    });
  });

  test('role toggle switches between owner/provider/admin forms', async () => {
    // Start with owner form (default)
    expect(screen.getByText('Owner badge')).toBeInTheDocument();

    // Click provider role
    fireEvent.click(screen.getByText('Service Provider'));
    expect(screen.getByText('Provider badge')).toBeInTheDocument();
    expect(screen.queryByText('Owner badge')).not.toBeInTheDocument();

    // Click admin role
    fireEvent.click(screen.getByText('Administrator'));
    expect(screen.getByText('Admin badge')).toBeInTheDocument();
    expect(screen.queryByText('Provider badge')).not.toBeInTheDocument();
  });

  test('preselects plan from URL query param', async () => {
    // Mock searchParams to return 'pro'
    vi.mocked(useSearchParams).mockReturnValue({
      get: vi.fn(() => 'pro'),
    } as any);

    // Re-render with mocked params
    render(<RegisterForm />);

    await waitFor(() => {
      expect(screen.getByText(/selected plan: pro/i)).toBeInTheDocument();
    });
  });

  test('does not preselect plan when no query param', async () => {
    // Mock searchParams to return null
    vi.mocked(useSearchParams).mockReturnValue({
      get: vi.fn(() => null),
    } as any);

    render(<RegisterForm />);

    expect(screen.queryByText(/selected plan:/i)).not.toBeInTheDocument();
  });
});
