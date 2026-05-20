import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const addBlockedDate = vi.fn();
const removeBlockedDate = vi.fn();
vi.mock('../actions', () => ({
  updateProviderProfile: vi.fn(),
  updateProviderCoverage: vi.fn(),
  addBlockedDate: (...args: unknown[]) => addBlockedDate(...args),
  removeBlockedDate: (...args: unknown[]) => removeBlockedDate(...args),
}));

const toastSuccess = vi.fn();
const toastError = vi.fn();
vi.mock('sonner', () => ({
  toast: { success: (...a: unknown[]) => toastSuccess(...a), error: (...a: unknown[]) => toastError(...a) },
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

import { AvailabilityCalendar } from '../components/AvailabilityCalendar';

beforeEach(() => {
  addBlockedDate.mockReset();
  removeBlockedDate.mockReset();
  toastSuccess.mockReset();
  toastError.mockReset();
});

describe('AvailabilityCalendar', () => {
  it('shows empty-state copy when no dates blocked', () => {
    render(<AvailabilityCalendar dates={[]} />);
    expect(screen.getByText(/No dates blocked/i)).toBeInTheDocument();
  });

  it('renders sorted list of blocked dates with remove buttons', () => {
    render(
      <AvailabilityCalendar
        dates={[
          { id: 'b-1', date: '2026-06-01' },
          { id: 'b-2', date: '2026-06-15' },
        ]}
      />,
    );
    expect(screen.getByText('2026-06-01')).toBeInTheDocument();
    expect(screen.getByText('2026-06-15')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /remove/i })).toHaveLength(2);
  });

  it('calls addBlockedDate with selected date on Add', async () => {
    addBlockedDate.mockResolvedValue({ success: true, id: 'b-new' });
    render(<AvailabilityCalendar dates={[]} />);
    const user = userEvent.setup();

    const dateInput = screen.getByLabelText(/date to block/i);
    await user.type(dateInput, '2026-07-04');
    await user.click(screen.getByRole('button', { name: /^add$/i }));

    expect(addBlockedDate).toHaveBeenCalledWith({ date: '2026-07-04' });
    expect(toastSuccess).toHaveBeenCalled();
  });

  it('does not call addBlockedDate when input empty', async () => {
    render(<AvailabilityCalendar dates={[]} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /^add$/i }));

    expect(addBlockedDate).not.toHaveBeenCalled();
  });

  it('calls removeBlockedDate with id when remove clicked', async () => {
    removeBlockedDate.mockResolvedValue({ success: true });
    render(
      <AvailabilityCalendar
        dates={[{ id: 'b-1', date: '2026-06-01' }]}
      />,
    );
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /remove/i }));

    expect(removeBlockedDate).toHaveBeenCalledWith({ id: 'b-1' });
    expect(toastSuccess).toHaveBeenCalled();
  });

  it('shows toast.error on action failure', async () => {
    addBlockedDate.mockRejectedValue(new Error('That date is already blocked.'));
    render(<AvailabilityCalendar dates={[]} />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/date to block/i), '2026-07-04');
    await user.click(screen.getByRole('button', { name: /^add$/i }));

    expect(toastError).toHaveBeenCalledWith('That date is already blocked.');
  });
});
