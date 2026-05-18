import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProofOfWorkUpload } from './ProofOfWorkUpload';

const submitMock = vi.fn();
vi.mock('../actions', () => ({ submitTaskEvidence: (...args: any[]) => submitMock(...args) }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn() }) }));

describe('ProofOfWorkUpload', () => {
  beforeEach(() => submitMock.mockReset());

  it('disables submit until at least 3 photos selected', () => {
    render(<ProofOfWorkUpload taskId="T-1" existing={[]} />);
    expect(screen.getByRole('button', { name: /submit/i })).toBeDisabled();
  });

  it('enables submit once 3 photos added', async () => {
    render(<ProofOfWorkUpload taskId="T-1" existing={[]} />);
    const input = screen.getByLabelText(/upload evidence/i, { selector: 'input' });
    const file = new File(['x'], 'a.jpg', { type: 'image/jpeg' });
    await userEvent.upload(input, [file, file, file]);
    expect(screen.getByRole('button', { name: /submit/i })).not.toBeDisabled();
  });
});
