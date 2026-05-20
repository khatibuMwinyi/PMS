import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const updateProviderProfile = vi.fn();
vi.mock('../actions', () => ({
  updateProviderProfile: (...args: unknown[]) => updateProviderProfile(...args),
  updateProviderCoverage: vi.fn(),
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

import { BusinessProfileForm } from '../components/BusinessProfileForm';

beforeEach(() => {
  updateProviderProfile.mockReset();
  toastSuccess.mockReset();
  toastError.mockReset();
});

describe('BusinessProfileForm', () => {
  it('submits trimmed businessName and normalized mobileMoneyNumber', async () => {
    updateProviderProfile.mockResolvedValue({ success: true });
    render(
      <BusinessProfileForm
        initial={{ businessName: 'Acme', mobileMoneyNumber: null }}
      />,
    );
    const user = userEvent.setup();

    const nameInput = screen.getByLabelText(/business name/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'Acme Pro  ');

    const phoneInput = screen.getByLabelText(/mobile money/i);
    await user.type(phoneInput, '+255712345678');

    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(updateProviderProfile).toHaveBeenCalledWith({
      businessName: 'Acme Pro',
      mobileMoneyNumber: '+255712345678',
    });
    expect(toastSuccess).toHaveBeenCalled();
  });

  it('sends null when mobile money field is empty', async () => {
    updateProviderProfile.mockResolvedValue({ success: true });
    render(
      <BusinessProfileForm
        initial={{ businessName: 'Acme', mobileMoneyNumber: '+255712345678' }}
      />,
    );
    const user = userEvent.setup();

    const phoneInput = screen.getByLabelText(/mobile money/i);
    await user.clear(phoneInput);

    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(updateProviderProfile).toHaveBeenCalledWith({
      businessName: 'Acme',
      mobileMoneyNumber: null,
    });
  });

  it('shows toast.error and keeps inputs when action throws', async () => {
    updateProviderProfile.mockRejectedValue(new Error('Invalid phone'));
    render(
      <BusinessProfileForm
        initial={{ businessName: 'Acme', mobileMoneyNumber: null }}
      />,
    );
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/mobile money/i), '0712345678');
    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(toastError).toHaveBeenCalledWith('Invalid phone');
    expect(toastSuccess).not.toHaveBeenCalled();
  });
});
