import { prisma } from '@/core/database/client';
import { reassignAssignment } from '@/features/assignments/actions';

export const assignmentExpirationWorker = {
  name: 'assignment-expiration',
  handler: async () => {
    const expiredAssignments = await prisma.assignment.findMany({
      where: {
        status: 'PENDING_ACCEPTANCE',
        expiresAt: { lt: new Date() },
      },
      select: { id: true },
    });

    for (const assignment of expiredAssignments) {
      await reassignAssignment(assignment.id);
    }
  },
};
