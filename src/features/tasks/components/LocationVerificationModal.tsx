'use client';

import { X, AlertTriangle, MapPin } from 'lucide-react';

interface Props {
  open: boolean;
  distance: number; // meters
  accuracy: number | null;
  reason?: string;
  onRetry: () => void;
  onManualReview: () => void;
  onClose: () => void;
}

export function LocationVerificationModal({ open, distance, accuracy, reason, onRetry, onManualReview, onClose }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(2px)' }}>
      <div className="bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-xl w-full max-w-md flex flex-col shadow-[0_4px_12px_rgba(15,23,42,0.08)] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-[var(--border-subtle)]">
          <h2 className="text-h2 font-semibold text-[var(--text-primary)]">Location Verification</h2>
          <button onClick={onClose} aria-label="Close" className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
            <X size={18} />
          </button>
        </div>
        <div className="p-6 flex flex-col gap-4">
          <div className="flex items-start gap-3 p-3 rounded-md bg-[var(--state-warning-bg)] text-[var(--state-warning)]">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            <p className="text-body-sm">{reason ?? 'Your location does not match the property within the required radius.'}</p>
          </div>
          <dl className="text-body-sm space-y-1.5">
            <div className="flex justify-between">
              <dt className="text-[var(--text-muted)]">Distance from site</dt>
              <dd className="tabular-nums font-medium">{Math.round(distance)}m</dd>
            </div>
            {accuracy !== null && (
              <div className="flex justify-between">
                <dt className="text-[var(--text-muted)]">GPS accuracy</dt>
                <dd className="tabular-nums font-medium">±{Math.round(accuracy)}m</dd>
              </div>
            )}
          </dl>
        </div>
        <div className="p-6 bg-[var(--surface-page)] border-t border-[var(--border-subtle)] flex gap-3 justify-end">
          <button onClick={onManualReview} className="px-4 py-2 text-label border border-[var(--border-subtle)] rounded text-[var(--text-primary)] hover:bg-[var(--surface-overlay)] flex items-center gap-1.5">
            <MapPin size={14} /> Request manual review
          </button>
          <button onClick={onRetry} className="px-4 py-2 text-label bg-[var(--brand-gold)] text-[var(--brand-primary)] rounded hover:opacity-90">
            Retry GPS
          </button>
        </div>
      </div>
    </div>
  );
}
