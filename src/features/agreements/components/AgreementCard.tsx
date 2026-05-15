import React from 'react';
import { motion } from 'framer-motion';
import { AgreementStatus } from '../types';
import { StatusBadge } from '@/components/ui/Badge';

interface AgreementCardProps {
  id: string;
  propertyName: string;
  quotedPrice: string | number;
  status: AgreementStatus;
  createdAt: string;
  isImmutable?: boolean;
  onView?: (id: string) => void;
}

export function AgreementCard({
  id,
  propertyName,
  quotedPrice,
  status,
  createdAt,
  isImmutable,
  onView,
}: AgreementCardProps) {
  const getStatusBadge = (status: AgreementStatus) => {
    switch (status) {
      case AgreementStatus.QUOTED:
        return <StatusBadge status="IN PROGRESS" variant="default" />;
      case AgreementStatus.PENDING_ASSIGNMENT:
        return <StatusBadge status="COMPLETED" variant="secondary" />;
      case AgreementStatus.ACTIVE:
        return <StatusBadge status="IN PROGRESS" variant="default" />;
      case AgreementStatus.COMPLETED:
        return <StatusBadge status="COMPLETED" variant="secondary" />;
      case AgreementStatus.CANCELLED:
        return <StatusBadge status="URGENT" variant="outline" />;
      default:
        return <StatusBadge status="SCHEDULED" variant="outline" />;
    }
  };

  return (
    <motion.div
      className="bg-[var(--surface-card)] p-6 rounded-xl border border-[var(--border-default)] shadow-card hover:shadow-lg transition-shadow"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">
            {propertyName}
          </h3>
          <p className="text-sm text-[var(--text-muted)]">
            Agreement #{id.slice(0, 8)}
          </p>
        </div>
        {getStatusBadge(status)}
      </div>

      <div className="mb-4">
        <p className="text-2xl font-bold text-[var(--brand-primary)] font-data-tabular">
          ${typeof quotedPrice === 'number' ? quotedPrice.toFixed(2) : quotedPrice}
        </p>
        <p className="text-xs text-[var(--text-muted)] mt-1 font-data-tabular">
          Created: {createdAt}
        </p>
        {isImmutable && (
          <p className="text-xs text-[var(--state-warning)] mt-1">
            🔒 Price is immutable
          </p>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onView?.(id)}
          className="flex-1 bg-[var(--surface-overlay)] text-[var(--text-primary)] hover:bg-[var(--surface-card)] border border-[var(--border-default)] h-10 px-4 text-sm font-medium rounded-[var(--radius-md)] transition-colors"
        >
          View Details
        </button>
      </div>
    </motion.div>
  );
}
