import React from 'react';
import { motion } from 'framer-motion';
import { QuoteStatus } from '../types';
import { StatusBadge } from '@/components/ui/StatusBadge';

interface QuoteCardProps {
  id: string;
  propertyName: string;
  serviceTypeName: string;
  quotedPrice: string | number;
  status: QuoteStatus;
  createdAt: string;
  isLocked?: boolean;
  isExpired?: boolean;
  onView?: (id: string) => void;
  onAccept?: (id: string) => void;
}

export function QuoteCard({
  id,
  propertyName,
  serviceTypeName,
  quotedPrice,
  status,
  createdAt,
  isLocked,
  isExpired,
  onView,
  onAccept,
}: QuoteCardProps) {
  const getStatusBadge = (status: QuoteStatus) => {
    switch (status) {
      case QuoteStatus.QUOTED:
        return <StatusBadge status="IN PROGRESS" variant="default" />;
      case QuoteStatus.ACCEPTED:
        return <StatusBadge status="COMPLETED" variant="secondary" />;
      case QuoteStatus.EXPIRED:
        return <StatusBadge status="SCHEDULED" variant="outline" />;
      case QuoteStatus.DRAFT:
        return <StatusBadge status="URGENT" variant="outline" />;
      default:
        return <StatusBadge status={status} variant="outline" />;
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
            {serviceTypeName}
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
        {isLocked && (
          <p className="text-xs text-[var(--state-warning)] mt-1">
            🔒 Price locked for 24 hours
          </p>
        )}
        {isExpired && (
          <p className="text-xs text-[var(--state-error)] mt-1">
            ⚠️ Quote expired
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
        {status === QuoteStatus.QUOTED && !isExpired && (
          <button
            onClick={() => onAccept?.(id)}
            className="flex-1 bg-[var(--brand-primary)] text-[var(--text-on-brand)] hover:bg-[var(--brand-primary-dark)] h-10 px-4 text-sm font-medium rounded-[var(--radius-md)] transition-colors"
          >
            Accept Quote
          </button>
        )}
      </div>
    </motion.div>
  );
}
