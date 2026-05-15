import { assignmentRepository } from '../repositories';

export class AssignmentService {
  static async acceptAssignment(assignmentId: string, _providerId: string) {
    const assignment = await assignmentRepository.findById(assignmentId);
    if (!assignment || assignment.status !== 'PENDING_ACCEPTANCE') {
      throw new Error('Assignment not available');
    }
    return assignmentRepository.updateStatus(assignmentId, 'ACCEPTED');
  }

  static async completeAssignment(assignmentId: string) {
    return assignmentRepository.updateStatus(assignmentId, 'COMPLETED');
  }

  static async cancelByOwner(assignmentId: string) {
    return assignmentRepository.updateStatus(assignmentId, 'CANCELLED_BY_OWNER');
  }
}

export const assignmentService = AssignmentService;
