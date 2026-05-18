import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RequestPayoutModal } from './RequestPayoutModal';

const requestMock = vi.fn();
vi.mock('../actions', () => ({ requestWithdrawal: (...a: any[]) => requestMock(...a) }));

describe('RequestPayoutModal', () => {
  beforeEach(() => requestMock.mockReset());

  it('shows minimum withdrawal hint', () => {
    render(
      <RequestPayoutModal
        open
        walletId="11111111-1111-1111-1111-111111111111"
        availableBalance={120000}
        onClose={() => {}}
        onSuccess={() => {}}
      />,
    );
    expect(screen.getByText(/Minimum.*50,000/)).toBeInTheDocument();
  });

  it('blocks submit when amount below minimum', async () => {
    render(
      <RequestPayoutModal
        open
        walletId="11111111-1111-1111-1111-111111111111"
        availableBalance={120000}
        onClose={() => {}}
        onSuccess={() => {}}
      />,
    );
    await userEvent.type(screen.getByLabelText(/amount/i), '10000');
    await userEvent.type(screen.getByLabelText(/mobile/i), '+255712345678');
    await userEvent.click(screen.getByRole('button', { name: /confirm/i }));
    expect(requestMock).not.toHaveBeenCalled();
  });

  it('calls requestWithdrawal with valid input', async () => {
    requestMock.mockResolvedValueOnce({ withdrawalId: 'W-99' });
    const onSuccess = vi.fn();
    render(
      <RequestPayoutModal
        open
        walletId="11111111-1111-1111-1111-111111111111"
        availableBalance={120000}
        onClose={() => {}}
        onSuccess={onSuccess}
      />,
    );
    await userEvent.clear(screen.getByLabelText(/amount/i));
    await userEvent.type(screen.getByLabelText(/amount/i), '60000');
    await userEvent.type(screen.getByLabelText(/mobile/i), '+255712345678');
    await userEvent.click(screen.getByRole('button', { name: /confirm/i }));
    await vi.waitFor(() =>
      expect(requestMock).toHaveBeenCalledWith(
        '11111111-1111-1111-1111-111111111111',
        60000,
        '+255712345678',
      ),
    );
    expect(onSuccess).toHaveBeenCalledWith('W-99', 60000);
  });
});
