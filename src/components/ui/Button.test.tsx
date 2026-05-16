import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('applies variant class', () => {
    render(<Button variant="gold">Go</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-accent');
  });

  it('disables and shows spinner when loading', () => {
    render(<Button loading>Save</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    expect(btn.querySelector('[data-testid="spinner"]')).toBeInTheDocument();
  });

  it('fires onClick when not loading', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Hi</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('does not fire onClick when loading', () => {
    const onClick = vi.fn();
    render(<Button loading onClick={onClick}>Hi</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('renders as anchor when as="a" and href provided', () => {
    render(<Button as="a" href="/x">Link</Button>);
    expect(screen.getByRole('link', { name: 'Link' })).toHaveAttribute('href', '/x');
  });
});
