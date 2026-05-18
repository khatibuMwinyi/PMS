import Link from 'next/link';
import type { ProviderDashboardData } from '../../schemas/provider-dashboard.schema';

function statusBadge(s: string): string {
  if (s === 'IN_PROGRESS') return 'bg-[var(--state-warning-bg)] text-[var(--state-warning)]';
  if (s === 'COMPLETED') return 'bg-[var(--state-success-bg)] text-[var(--state-success)]';
  return 'bg-[var(--surface-overlay)] text-[var(--text-secondary)]';
}

function formatWhen(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-GB', { weekday: 'short', hour: '2-digit', minute: '2-digit' });
}

export function ActivePipelineTable({ pipeline }: { pipeline: ProviderDashboardData['pipeline'] }) {
  if (pipeline.length === 0) {
    return (
      <section>
        <h2 className="text-h2 font-semibold text-[var(--text-primary)] mb-2">Active Pipeline</h2>
        <div className="rounded-lg border border-dashed border-[var(--border-subtle)] bg-[var(--surface-card)] p-6 text-center text-body-sm text-[var(--text-muted)]">
          No active assignments. Accept a job offer to fill your pipeline.
        </div>
      </section>
    );
  }
  return (
    <section>
      <h2 className="text-h2 font-semibold text-[var(--text-primary)] mb-2">Active Pipeline</h2>
      <div className="border border-[var(--border-subtle)] rounded-lg bg-[var(--surface-card)] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--surface-page)] border-b border-[var(--border-subtle)]">
              <th className="text-label uppercase text-[var(--text-muted)] px-3 py-2">ID</th>
              <th className="text-label uppercase text-[var(--text-muted)] px-3 py-2">Service</th>
              <th className="text-label uppercase text-[var(--text-muted)] px-3 py-2">Zone</th>
              <th className="text-label uppercase text-[var(--text-muted)] px-3 py-2">Scheduled</th>
              <th className="text-label uppercase text-[var(--text-muted)] px-3 py-2 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="text-body-sm text-[var(--text-primary)] tabular-nums">
            {pipeline.map((p, i) => (
              <tr
                key={p.assignmentId}
                className={`border-b border-[var(--border-subtle)] hover:bg-[var(--surface-page)] ${i % 2 === 1 ? 'bg-[var(--surface-page)]' : ''}`}
              >
                <td className="px-3 py-2 text-[var(--text-secondary)]">#{p.assignmentId.slice(0, 6).toUpperCase()}</td>
                <td className="px-3 py-2 font-medium">{p.serviceTypeName}</td>
                <td className="px-3 py-2 text-[var(--text-secondary)]">{p.zone}</td>
                <td className="px-3 py-2">{formatWhen(p.scheduledFor)}</td>
                <td className="px-3 py-2 text-right">
                  <Link
                    href={`/provider/tasks/${p.assignmentId}`}
                    className={`inline-flex items-center px-2 py-0.5 rounded text-label font-semibold ${statusBadge(p.status)}`}
                  >
                    {p.status.replaceAll('_', ' ')}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
