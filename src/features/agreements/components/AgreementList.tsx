import React from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { AgreementStatus } from '../types';
import { StatusBadge } from '@/components/ui/StatusBadge';

interface Agreement {
  id: string;
  quoteId: string;
  quotedPrice: string | number;
  status: AgreementStatus;
  propertyName?: string;
  createdAt: string;
  formattedDate: string;
  isImmutable?: boolean;
}

interface AgreementListProps {
  agreements: Agreement[];
  onView?: (id: string) => void;
}

export function AgreementList({ agreements, onView }: AgreementListProps) {
  const columns = [
    {
      key: 'status',
      header: 'Status',
      accessor: (agreement: Agreement) => {
        let badgeStatus = 'SCHEDULED';
        let badgeVariant: 'default' | 'secondary' | 'outline' = 'outline';
        
        if (agreement.status === AgreementStatus.QUOTED) {
          badgeStatus = 'IN PROGRESS';
          badgeVariant = 'default'; // blue
        } else if (agreement.status === AgreementStatus.PENDING_ASSIGNMENT) {
          badgeStatus = 'COMPLETED';
          badgeVariant = 'secondary'; // green
        } else if (agreement.status === AgreementStatus.ACTIVE) {
          badgeStatus = 'IN PROGRESS';
          badgeVariant = 'default'; // blue
        } else if (agreement.status === AgreementStatus.COMPLETED) {
          badgeStatus = 'COMPLETED';
          badgeVariant = 'secondary'; // green
        } else if (agreement.status === AgreementStatus.CANCELLED) {
          badgeStatus = 'URGENT';
          badgeVariant = 'outline'; // red
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
      header: 'Property',
      accessor: (agreement: Agreement) => (
        <span className="font-[var(--font-table-header)] text-[var(--text-primary)]">
          {agreement.propertyName || 'N/A'}
        </span>
      ),
      className: 'font-data-tabular',
    },
    {
      key: 'quoteId',
      header: 'Quote ID',
      accessor: (agreement: Agreement) => (
        <span className="font-[var(--font-data-tabular)] text-[var(--text-primary)] text-xs">
          {agreement.quoteId.slice(0, 8)}...
        </span>
      ),
      className: 'font-data-tabular',
    },
    {
      key: 'date',
      header: 'Created',
      accessor: (agreement: Agreement) => (
        <span className="font-[var(--font-data-tabular)] text-[var(--text-primary)]">
          {agreement.formattedDate}
        </span>
      ),
      className: 'font-data-tabular',
    },
    {
      key: 'price',
      header: 'Quoted Price',
      accessor: (agreement: Agreement) => (
        <span className="text-right font-semibold font-[var(--font-data-tabular)] text-[var(--text-primary)]">
          ${typeof agreement.quotedPrice === 'number' 
            ? agreement.quotedPrice.toFixed(2) 
            : agreement.quotedPrice}
        </span>
      ),
      className: 'text-right font-data-tabular',
    },
    {
      key: 'immutable',
      header: 'Price Status',
      accessor: (agreement: Agreement) => (
        <span className={`text-xs ${agreement.isImmutable ? 'text-[var(--state-warning)]' : 'text-[var(--state-success)]'}`}>
          {agreement.isImmutable ? '🔒 Immutable' : '✏️ Editable'}
        </span>
      ),
      className: 'text-center',
    },
    {
      key: 'actions',
      header: 'Actions',
      accessor: (agreement: Agreement) => (
        <div className="flex gap-2 justify-end">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onView?.(agreement.id);
            }}
            className="bg-[var(--surface-overlay)] text-[var(--text-primary)] hover:bg-[var(--surface-card)] border border-[var(--border-default)] h-8 px-3 text-xs font-medium rounded-[var(--radius-md)] transition-colors"
          >
            View
          </button>
        </div>
      ),
      className: 'text-right',
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={agreements}
      keyExtractor={(agreement) => agreement.id}
      emptyMessage="No agreements found. Accept a quote to create an agreement."
      className="w-full"
    />
  );
}
