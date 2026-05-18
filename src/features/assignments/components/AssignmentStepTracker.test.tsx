import { render, screen } from '@testing-library/react';
import { AssignmentStepTracker } from './AssignmentStepTracker';

describe('AssignmentStepTracker', () => {
  it('marks Assigned as completed and On Site as active when status=ACCEPTED', () => {
    render(<AssignmentStepTracker status="ACCEPTED" />);
    expect(screen.getByText('Assigned').closest('[data-state]')?.getAttribute('data-state')).toBe('completed');
    expect(screen.getByText('On Site').closest('[data-state]')?.getAttribute('data-state')).toBe('active');
    expect(screen.getByText('In Progress').closest('[data-state]')?.getAttribute('data-state')).toBe('pending');
  });
  it('marks In Progress as active when status=IN_PROGRESS', () => {
    render(<AssignmentStepTracker status="IN_PROGRESS" />);
    expect(screen.getByText('In Progress').closest('[data-state]')?.getAttribute('data-state')).toBe('active');
  });
  it('marks Review as completed when status=VERIFIED', () => {
    render(<AssignmentStepTracker status="VERIFIED" />);
    expect(screen.getByText('Review').closest('[data-state]')?.getAttribute('data-state')).toBe('completed');
  });
});
