import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { LoginForm } from '../LoginForm';
import { vi } from 'vitest';

// Mock next-auth
vi.mock('next-auth/react', () => ({
  signIn: vi.fn(),
}));

// Mock fetch
(global as any).fetch = vi.fn();

describe('LoginForm - Client-side Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    render(<LoginForm />);
  });

  test('renders login form with email and password fields', () => {
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
  });

  test('shows error for empty email field on submit', async () => {
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

    await waitFor(() => {
      expect(screen.getByText('Enter a valid email address')).toBeInTheDocument();
    });
  });

  test('shows error for empty password field on submit', async () => {
    fireEvent.change(screen.getByLabelText('Email Address'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

    await waitFor(() => {
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });
  });

  test('show/hide password toggle works correctly', async () => {
    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
    const toggleButton = screen.getByRole('button', { name: /show password/i });

    expect(passwordInput.type).toBe('password');

    fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe('text');
    expect(screen.getByRole('button', { name: /hide password/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /hide password/i }));
    expect(passwordInput.type).toBe('password');
  });

  test('form shows error for invalid email format', async () => {
    fireEvent.change(screen.getByLabelText('Email Address'), {
      target: { value: 'invalid-email' }
    });
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

    await waitFor(() => {
      expect(screen.getByText('Enter a valid email address')).toBeInTheDocument();
    });
  });

  test('form validation passes with valid email and password', async () => {
    fireEvent.change(screen.getByLabelText('Email Address'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' }
    });

    // Should not show validation errors
    await waitFor(() => {
      expect(screen.queryByText(/enter a valid email/i)).toBeNull();
      expect(screen.queryByText(/password is required/i)).toBeNull();
    });
  });
});
