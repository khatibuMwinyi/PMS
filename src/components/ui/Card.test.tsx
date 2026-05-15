import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card } from './Card';

describe('Card', () => {
  it('renders children', () => {
    render(<Card>hello</Card>);
    expect(screen.getByText('hello')).toBeInTheDocument();
  });

  it('applies elevated variant by default', () => {
    const { container } = render(<Card>x</Card>);
    expect(container.firstChild).toHaveClass('shadow-card');
  });

  it('applies outlined variant', () => {
    const { container } = render(<Card variant="outlined">x</Card>);
    expect(container.firstChild).toHaveClass('border');
  });

  it('renders header and footer slots', () => {
    render(<Card header={<h2>H</h2>} footer={<span>F</span>}>body</Card>);
    expect(screen.getByText('H')).toBeInTheDocument();
    expect(screen.getByText('F')).toBeInTheDocument();
    expect(screen.getByText('body')).toBeInTheDocument();
  });

  it('adds interactive cursor when interactive', () => {
    const { container } = render(<Card interactive>x</Card>);
    expect(container.firstChild).toHaveClass('cursor-pointer');
  });
});
