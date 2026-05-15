import { autoVerifyPendingTasks } from '@/features/tasks/actions';

/**
 * Auto-verify completed tasks whose 24h dispute window has passed without dispute.
 * Spec §VII.1
 */
export const autoVerifyTasksWorker = {
  name: 'auto-verify-tasks',
  handler: async () => {
    await autoVerifyPendingTasks();
  },
};
