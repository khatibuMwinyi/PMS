import Link from 'next/link';
import { Clock, MapPin } from 'lucide-react';
import type { ProviderDashboardData } from '../../schemas/provider-dashboard.schema';

function relativeTime(iso: string): string {
  const ms = new Date(iso).getTime() - Date.now();
  if (ms < 0) return 'Now';
  const mins = Math.floor(ms / 60_000);
  if (mins < 60) return `Starts in ${mins}m`;
  const hrs = Math.floor(mins / 60);
  return `Starts in ${hrs}h ${mins % 60}m`;
}

export function NextUpcomingAssignmentCard({ next }: { next: ProviderDashboardData['nextUpcoming'] }) {
  if (!next) {
    return (
      <section className="bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-lg p-4">
        <h2 className="text-h2 font-semibold text-[var(--text-primary)] mb-2">Next Upcoming Assignment</h2>
        <p className="text-body-sm text-[var(--text-muted)]">No tasks scheduled in the next 48 hours.</p>
      </section>
    );
  }
  return (
    <section className="bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-h2 font-semibold text-[var(--text-primary)]">Next Upcoming Assignment</h2>
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[var(--state-warning-bg)] text-[var(--state-warning)] text-label">
          <Clock size={12} /> {relativeTime(next.scheduledFor)}
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[var(--surface-page)] p-4 rounded border border-[var(--border-subtle)]">
        <div>
          <p className="text-label text-[var(--text-muted)] mb-1">Service Area</p>
          <p className="text-body-md font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
            <MapPin size={14} /> {next.zone}
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-label text-[var(--text-muted)] mb-1">Task Details</p>
            <p className="text-body-md text-[var(--text-primary)]">{next.serviceTypeName}</p>
            <div className="mt-2 flex gap-1.5">
              <span className="px-1.5 py-0.5 rounded bg-[var(--surface-overlay)] text-[var(--text-secondary)] text-label">
                Priority: {next.priority}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-[var(--surface-overlay)] text-[var(--text-secondary)] text-label">
                Est: {next.estDurationHours}h
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            {next.taskId && (
              <Link
                href={`/provider/tasks/${next.taskId}`}
                className="flex-1 text-center py-2 bg-[var(--brand-gold)] text-[var(--brand-primary)] text-label rounded hover:opacity-90"
              >
                Start Task
              </Link>
            )}
            <Link
              href={`/provider/tasks/${next.taskId ?? next.assignmentId}`}
              className="text-center py-2 px-3 border border-[var(--border-subtle)] rounded text-label text-[var(--text-primary)] hover:bg-[var(--surface-overlay)]"
            >
              Details
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
