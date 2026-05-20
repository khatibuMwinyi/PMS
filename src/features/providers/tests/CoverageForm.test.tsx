import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const updateProviderCoverage = vi.fn();
vi.mock('../actions', () => ({
  updateProviderProfile: vi.fn(),
  updateProviderCoverage: (...args: unknown[]) => updateProviderCoverage(...args),
  addBlockedDate: vi.fn(),
  removeBlockedDate: vi.fn(),
}));

const toastSuccess = vi.fn();
const toastError = vi.fn();
vi.mock('sonner', () => ({
  toast: { success: (...a: unknown[]) => toastSuccess(...a), error: (...a: unknown[]) => toastError(...a) },
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

import { CoverageForm } from '../components/CoverageForm';

const CATALOG = [
  { id: 't-1', name: 'CLEANING' },
  { id: 't-2', name: 'PLUMBING' },
  { id: 't-3', name: 'ELECTRICAL' },
];

beforeEach(() => {
  updateProviderCoverage.mockReset();
  toastSuccess.mockReset();
  toastError.mockReset();
});

describe('CoverageForm', () => {
  it('toggles category selection on click', async () => {
    updateProviderCoverage.mockResolvedValue({ success: true });
    render(
      <CoverageForm
        initial={{ serviceCategories: ['CLEANING'], serviceRadiusKm: 10 }}
        catalog={CATALOG}
      />,
    );
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /PLUMBING/i }));
    await user.click(screen.getByRole('button', { name: /save coverage/i }));

    expect(updateProviderCoverage).toHaveBeenCalledWith({
      serviceCategories: ['CLEANING', 'PLUMBING'],
      serviceRadiusKm: 10,
    });
  });

  it('removes category when clicked while selected', async () => {
    updateProviderCoverage.mockResolvedValue({ success: true });
    render(
      <CoverageForm
        initial={{ serviceCategories: ['CLEANING'], serviceRadiusKm: 10 }}
        catalog={CATALOG}
      />,
    );
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /CLEANING/i }));
    await user.click(screen.getByRole('button', { name: /PLUMBING/i }));
    await user.click(screen.getByRole('button', { name: /save coverage/i }));

    expect(updateProviderCoverage).toHaveBeenCalledWith({
      serviceCategories: ['PLUMBING'],
      serviceRadiusKm: 10,
    });
  });

  it('disables Save when no categories selected', async () => {
    render(
      <CoverageForm
        initial={{ serviceCategories: ['CLEANING'], serviceRadiusKm: 10 }}
        catalog={CATALOG}
      />,
    );
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /CLEANING/i }));
    expect(screen.getByRole('button', { name: /save coverage/i })).toBeDisabled();
    expect(screen.getByText(/Pick at least one/i)).toBeInTheDocument();
  });

  it('submits radius as integer', async () => {
    updateProviderCoverage.mockResolvedValue({ success: true });
    render(
      <CoverageForm
        initial={{ serviceCategories: ['CLEANING'], serviceRadiusKm: 10 }}
        catalog={CATALOG}
      />,
    );
    const user = userEvent.setup();

    const radius = screen.getByLabelText(/service radius/i);
    await user.clear(radius);
    await user.type(radius, '20');

    await user.click(screen.getByRole('button', { name: /save coverage/i }));

    expect(updateProviderCoverage).toHaveBeenCalledWith({
      serviceCategories: ['CLEANING'],
      serviceRadiusKm: 20,
    });
  });
});
