import { render, screen } from '@testing-library/react';
import { Pagination } from './Pagination';

describe('Pagination', () => {
  it('renders "Page N of M" label', () => {
    render(<Pagination basePath="/x" currentPage={2} totalPages={5} otherParams={{}} />);
    expect(screen.getByText(/Page 2 of 5/)).toBeInTheDocument();
  });

  it('disables Prev on page 1', () => {
    render(<Pagination basePath="/x" currentPage={1} totalPages={5} otherParams={{}} />);
    const prev = screen.getByRole('link', { name: /previous/i });
    expect(prev).toHaveAttribute('aria-disabled', 'true');
  });

  it('disables Next on last page', () => {
    render(<Pagination basePath="/x" currentPage={5} totalPages={5} otherParams={{}} />);
    const next = screen.getByRole('link', { name: /next/i });
    expect(next).toHaveAttribute('aria-disabled', 'true');
  });

  it('preserves other URL params in links', () => {
    render(<Pagination basePath="/x" currentPage={2} totalPages={5} otherParams={{ status: 'VERIFIED,DISPUTED' }} />);
    const next = screen.getByRole('link', { name: /next/i });
    expect(next).toHaveAttribute('href', '/x?status=VERIFIED%2CDISPUTED&page=3');
  });

  it('returns null when totalPages <= 1', () => {
    const { container } = render(<Pagination basePath="/x" currentPage={1} totalPages={1} otherParams={{}} />);
    expect(container.firstChild).toBeNull();
  });
});
