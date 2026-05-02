import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import type { Column } from '@/components/ui/DataTable';

interface ServiceRequest {
  id: string;
  property: string;
  serviceType: string;
  requestDate: string;
  cost: string;
  status: 'URGENT' | 'IN PROGRESS' | 'SCHEDULED' | 'COMPLETED';
}

const defaultRequests: ServiceRequest[] = [
  {
    id: '1',
    property: 'The Heights',
    serviceType: 'Plumbing',
    requestDate: '2024-01-15',
    cost: '$450.00',
    status: 'URGENT',
  },
  {
    id: '2',
    property: 'Ironwood',
    serviceType: 'Electrical',
    requestDate: '2024-01-14',
    cost: '$280.00',
    status: 'IN PROGRESS',
  },
  {
    id: '3',
    property: 'Nexus',
    serviceType: 'HVAC',
    requestDate: '2024-01-12',
    cost: '$1,200.00',
    status: 'SCHEDULED',
  },
  {
    id: '4',
    property: 'The Heights',
    serviceType: 'Cleaning',
    requestDate: '2024-01-10',
    cost: '$150.00',
    status: 'COMPLETED',
  },
  {
    id: '5',
    property: 'Ironwood',
    serviceType: 'Landscaping',
    requestDate: '2024-01-08',
    cost: '$350.00',
    status: 'COMPLETED',
  },
];

interface ServiceRequestsTableProps {
  requests?: ServiceRequest[];
}

export function ServiceRequestsTable({ requests = defaultRequests }: ServiceRequestsTableProps) {
  const columns: Column<ServiceRequest>[] = [
    {
      key: 'status',
      header: 'Status',
      accessor: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'property',
      header: 'Property',
      accessor: (row) => <span className="font-medium text-[var(--text-primary)]">{row.property}</span>,
    },
    {
      key: 'serviceType',
      header: 'Service Type',
      accessor: (row) => <span className="text-[var(--text-secondary)]">{row.serviceType}</span>,
    },
    {
      key: 'requestDate',
      header: 'Request Date',
      accessor: (row) => <span className="text-[var(--font-data-tabular)]">{row.requestDate}</span>,
    },
    {
      key: 'cost',
      header: 'Cost',
      accessor: (row) => (
        <span className="text-right font-semibold text-[var(--font-data-tabular)] text-[var(--text-primary)]">
          {row.cost}
        </span>
      ),
      className: 'text-right',
    },
  ];

  return (
    <div>
      <h2 className="mb-4 text-[var(--font-h2)] text-[var(--text-primary)]">Service Requests</h2>
      <DataTable
        columns={columns}
        data={requests}
        keyExtractor={(row) => row.id}
        emptyMessage="No service requests yet."
      />
    </div>
  );
}
