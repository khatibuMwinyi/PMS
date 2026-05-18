import Link from 'next/link';
import { Calendar, Settings } from 'lucide-react';

export function QuickActionsPanel() {
  return (
    <div className="bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-lg p-4">
      <h3 className="text-h2 font-semibold text-[var(--text-primary)] mb-2">Quick Actions</h3>
      <div className="flex flex-col gap-2">
        <Link
          href="/provider/settings"
          className="flex items-center gap-2 p-2 border border-[var(--border-subtle)] rounded hover:border-[var(--brand-primary)] transition-colors text-left"
        >
          <Calendar size={16} className="text-[var(--text-muted)]" />
          <div>
            <div className="text-label text-[var(--text-primary)]">Update Availability</div>
            <div className="text-body-sm text-[var(--text-muted)]">Manage schedule blocks</div>
          </div>
        </Link>
        <Link
          href="/provider/settings"
          className="flex items-center gap-2 p-2 border border-[var(--border-subtle)] rounded hover:border-[var(--brand-primary)] transition-colors text-left"
        >
          <Settings size={16} className="text-[var(--text-muted)]" />
          <div>
            <div className="text-label text-[var(--text-primary)]">Edit Profile</div>
            <div className="text-body-sm text-[var(--text-muted)]">Service categories + radius</div>
          </div>
        </Link>
      </div>
    </div>
  );
}
