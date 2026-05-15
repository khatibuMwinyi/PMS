import { prisma } from '@/core/database/client';
import { applyStrike } from '@/features/providers/strikes';
import { reassignAssignment } from '@/features/assignments/actions';

/**
 * Overdue task detection per Spec §XIII + §XXII:
 *   • scheduledFor + 2h passed, status SCHEDULED → flag OVERDUE
 *   • scheduledFor + 4h passed → auto-cancel assignment, apply strike, reassign
 */
export const overdueTasksWorker = {
  name: 'overdue-tasks',
  handler: async () => {
    const now = new Date();
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000);

    // Flag tasks scheduled 2h+ ago, still in SCHEDULED/NOTIFIED state
    await prisma.task.updateMany({
      where: {
        status: { in: ['SCHEDULED', 'NOTIFIED_24H', 'NOTIFIED_1H'] },
        scheduledFor: { lt: twoHoursAgo, gte: fourHoursAgo },
      },
      data: { status: 'OVERDUE', overdueFlaggedAt: now },
    });

    // Auto-cancel 4h+ overdue tasks, strike provider, trigger reassignment
    const noShowTasks = await prisma.task.findMany({
      where: {
        status: { in: ['SCHEDULED', 'NOTIFIED_24H', 'NOTIFIED_1H', 'OVERDUE'] },
        scheduledFor: { lt: fourHoursAgo },
      },
      include: { assignment: { select: { id: true, providerId: true } } },
    });

    for (const task of noShowTasks) {
      if (!task.assignment) continue;

      await prisma.$transaction(async (tx) => {
        await tx.task.update({
          where: { id: task.id },
          data: { status: 'OVERDUE', overdueFlaggedAt: now },
        });
        await tx.assignment.update({
          where: { id: task.assignment!.id },
          data: {
            status: 'CANCELLED_NO_SHOW',
            cancelledAt: now,
            cancelReason: 'Auto-cancelled: provider no-show 4h after scheduled time',
          },
        });
      });

      if (task.assignment.providerId) {
        await applyStrike(task.assignment.providerId, 'NO_SHOW', {
          taskId: task.id,
          assignmentId: task.assignment.id,
        });
      }

      await reassignAssignment(task.assignment.id);
    }
  },
};
