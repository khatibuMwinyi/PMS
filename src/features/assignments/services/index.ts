import { assignmentRepository } from '../repositories';

export class AssignmentService {
  static async acceptAssignment(assignmentId: string, providerId: string) {
    const assignment = await assignmentRepository.findById(assignmentId);
    if (!assignment || assignment.status !== 'PENDING_ACCEPTANCE') {
      throw new Error('Assignment not available');
    }
    return assignmentRepository.updateStatus(assignmentId, 'ACCEPTED');
  }

  static async completeAssignment(assignmentId: string) {
    return assignmentRepository.updateStatus(assignmentId, 'COMPLETED');
  }

  static async cancelAssignment(assignmentId: string) {
    return assignmentRepository.updateStatus(assignmentId, 'CANCELLED');
  }
}

export const assignmentService = AssignmentService;