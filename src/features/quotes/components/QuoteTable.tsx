import React from 'react';
import { Table } from '@/components/ui/Table';
import { QuoteStatus } from '../types';
import { StatusBadge } from '@/components/ui/Badge';

interface Quote {
  id: string;
  propertyName: string;
  serviceTypeName: string;
  quotedPrice: string | number;
  status: QuoteStatus;
  formattedDate: string;
  isLocked?: boolean;
  isExpired?: boolean;
}

interface QuoteTableProps {
  quotes: Quote[];
  onView?: (id: string) => void;
  onAccept?: (id: string) => void;
}

export function QuoteTable({ quotes, onView, onAccept }: QuoteTableProps) {
  const columns = [
    {
      key: 'status',
      header: 'Status',
      accessor: (quote: Quote) => {
        let badgeStatus = 'SCHEDULED';
        let badgeVariant: 'default' | 'secondary' | 'outline' = 'outline';
        
        if (quote.status === QuoteStatus.QUOTED) {
          badgeStatus = 'IN PROGRESS';
          badgeVariant = 'default'; // blue
        } else if (quote.status === QuoteStatus.ACCEPTED) {
          badgeStatus = 'COMPLETED';
          badgeVariant = 'secondary'; // green
        } else if (quote.status === QuoteStatus.EXPIRED) {
          badgeStatus = 'SCHEDULED';
          badgeVariant = 'outline'; // gray
        } else if (quote.status === QuoteStatus.DRAFT) {
          badgeStatus = 'URGENT';
          badgeVariant = 'outline'; // light
        }
        
        return (
          <StatusBadge 
            status={badgeStatus} 
            variant={badgeVariant} 
          />
        );
      },
      className: 'w-32',
    },
    {
      key: 'property',
      header: 'Property Name',
      accessor: (quote: Quote) => (
        <span className="text-caption uppercase tracking-wide text-[var(--text-primary)]">
          {quote.propertyName}
        </span>
      ),
      className: 'text-body-sm tabular-nums',
    },
    {
      key: 'service',
      header: 'Service Type',
      accessor: (quote: Quote) => (
        <span className="text-caption uppercase tracking-wide text-[var(--text-primary)]">
          {quote.serviceTypeName}
        </span>
      ),
      className: 'text-body-sm tabular-nums',
    },
    {
      key: 'date',
      header: 'Quote Date',
      accessor: (quote: Quote) => (
        <span className="text-body-sm tabular-nums text-[var(--text-primary)]">
          {quote.formattedDate}
        </span>
      ),
      className: 'text-body-sm tabular-nums',
    },
    {
      key: 'price',
      header: 'Quoted Price',
      accessor: (quote: Quote) => (
        <span className="text-right font-semibold text-body-sm tabular-nums text-[var(--text-primary)]">
          ${typeof quote.quotedPrice === 'number'
            ? quote.quotedPrice.toFixed(2)
            : quote.quotedPrice}
        </span>
      ),
      className: 'text-right text-body-sm tabular-nums',
    },
    {
      key: 'actions',
      header: 'Actions',
      accessor: (quote: Quote) => (
        <div className="flex gap-2 justify-end">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onView?.(quote.id);
            }}
            className="bg-[var(--surface-overlay)] text-[var(--text-primary)] hover:bg-[var(--surface-card)] border border-[var(--border-default)] h-8 px-3 text-xs font-medium rounded-[var(--radius-md)] transition-colors"
          >
            View
          </button>
          {quote.status === QuoteStatus.QUOTED && !quote.isExpired && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAccept?.(quote.id);
              }}
              className="bg-[var(--brand-primary)] text-[var(--text-on-brand)] hover:bg-[var(--brand-primary-dark)] h-8 px-3 text-xs font-medium rounded-[var(--radius-md)] transition-colors"
            >
              Accept
            </button>
          )}
        </div>
      ),
      className: 'text-right',
    },
  ];

  return (
    <Table
      columns={columns}
      data={quotes}
      keyExtractor={(quote) => quote.id}
      emptyState="No quotes found. Request a quote to get started."
      className="w-full"
    />
  );
}
