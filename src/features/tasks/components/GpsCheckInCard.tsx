'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { HardHat, MapPin, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { checkInToTask } from '../actions';
import { LocationVerificationModal } from './LocationVerificationModal';

interface Props {
  taskId: string;
  propertyLat: number;
  propertyLng: number;
  alreadyCheckedIn: boolean;
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000,
    toRad = (v: number) => (v * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1),
    dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function GpsCheckInCard({ taskId, propertyLat, propertyLng, alreadyCheckedIn }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [modal, setModal] = useState<null | { distance: number; accuracy: number | null; reason: string }>(null);
  const [distance, setDistance] = useState<number | null>(null);

  const requestCheckIn = (forceManualReview = false) => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported on this device.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const d = haversine(pos.coords.latitude, pos.coords.longitude, propertyLat, propertyLng);
        setDistance(d);
        startTransition(async () => {
          const result = await checkInToTask(taskId, pos.coords.latitude, pos.coords.longitude, {
            accuracy: pos.coords.accuracy,
            forceManualReview,
          });
          if (result.success) {
            toast.success('Checked in — task is now in progress.');
            router.refresh();
          } else if (result.method === 'MANUAL_REVIEW') {
            toast.message('Submitted for manual review.');
            router.refresh();
          } else {
            setModal({ distance: d, accuracy: pos.coords.accuracy, reason: result.reason ?? 'Verification failed' });
          }
        });
      },
      (err) => toast.error(`GPS error: ${err.message}`),
      { enableHighAccuracy: true, timeout: 15000 },
    );
  };

  if (alreadyCheckedIn) {
    return (
      <div className="bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-lg p-4 flex items-center gap-3">
        <MapPin size={18} className="text-[var(--state-success)]" />
        <p className="text-body-sm text-[var(--text-primary)]">Already checked in. Continue with proof of work below.</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-lg overflow-hidden flex flex-col">
        <div className="p-4 flex flex-col gap-3">
          <div>
            <h3 className="text-label uppercase tracking-wider text-[var(--text-muted)] mb-1">Location Status</h3>
            {distance !== null ? (
              <p className="text-body-md text-[var(--text-primary)] font-medium">{Math.round(distance)}m from site</p>
            ) : (
              <p className="text-body-md text-[var(--text-secondary)]">GPS not yet captured.</p>
            )}
          </div>
          <button
            onClick={() => requestCheckIn(false)}
            disabled={isPending}
            className="w-full py-2.5 bg-[var(--brand-gold)] text-[var(--brand-primary)] text-label rounded hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isPending ? <Loader2 size={16} className="animate-spin" /> : <HardHat size={16} />}
            {isPending ? 'Verifying…' : 'Check In & Start Task'}
          </button>
          <p className="text-body-sm text-[var(--text-muted)] text-center">GPS verification required (within 200m of property).</p>
        </div>
      </div>
      <LocationVerificationModal
        open={modal !== null}
        distance={modal?.distance ?? 0}
        accuracy={modal?.accuracy ?? null}
        reason={modal?.reason}
        onRetry={() => {
          setModal(null);
          requestCheckIn(false);
        }}
        onManualReview={() => {
          setModal(null);
          requestCheckIn(true);
        }}
        onClose={() => setModal(null)}
      />
    </>
  );
}
