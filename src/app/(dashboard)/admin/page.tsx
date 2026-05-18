import { Suspense } from 'react';
import { auth } from '@/core/auth';
import { redirect } from 'next/navigation';
import RoleGuard from '@/components/RoleGuard';
import { Stat } from '@/components/ui/Stat';
import { Card } from '@/components/ui/Card';
import { Table } from '@/components/ui/Table';
import { StatusBadge } from '@/components/ui/Badge';
import type { Column } from '@/components/ui/Table';
import { Users, Building2, ClipboardList, DollarSign } from 'lucide-react';

interface UserStats {
  totalUsers: number;
  totalProperties: number;
  activeRequests: number;
  monthlyRevenue: string;
}

interface RecentUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  joinedAt: string;
}

export const dynamic = 'force-dynamic';

export default function AdminDashboardPage() {
  return (
    <RoleGuard allowedRoles={['ADMIN']}>
      <Suspense fallback={<div>Loading...</div>}>
        <AdminDashboardContent />
      </Suspense>
    </RoleGuard>
  );
}

async function AdminDashboardContent() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  if (session.user.role !== 'ADMIN') redirect('/login');

  // TODO: Replace with actual data fetching
  const stats: UserStats = {
    totalUsers: 156,
    totalProperties: 89,
    activeRequests: 42,
    monthlyRevenue: '$128,450.00',
  };

  const recentUsers: RecentUser[] = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'OWNER',
      status: 'ACTIVE',
      joinedAt: '2024-01-15',
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'PROVIDER',
      status: 'ACTIVE',
      joinedAt: '2024-01-14',
    },
    {
      id: '3',
      name: 'Bob Wilson',
      email: 'bob@example.com',
      role: 'OWNER',
      status: 'PENDING_VERIFICATION',
      joinedAt: '2024-01-12',
    },
  ];

  const columns: Column<RecentUser>[] = [
    {
      key: 'name',
      header: 'Name',
      accessor: (row) => <span className="font-medium text-[var(--text-primary)]">{row.name}</span>,
    },
    {
      key: 'email',
      header: 'Email',
      accessor: (row) => <span className="text-[var(--text-secondary)]">{row.email}</span>,
    },
    {
      key: 'role',
      header: 'Role',
      accessor: (row) => <span className="text-[var(--font-data-tabular)]">{row.role}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (row) => <StatusBadge status={row.status as any} />,
    },
    {
      key: 'joinedAt',
      header: 'Joined',
      accessor: (row) => <span className="text-[var(--font-data-tabular)]">{row.joinedAt}</span>,
    },
  ];

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card padding="compact">
          <Stat icon={Users} label="Total Users" value={stats.totalUsers.toString()} />
        </Card>
        <Card padding="compact">
          <Stat icon={Building2} label="Properties" value={stats.totalProperties.toString()} />
        </Card>
        <Card padding="compact">
          <Stat icon={ClipboardList} label="Active Requests" value={stats.activeRequests.toString()} />
        </Card>
        <Card padding="compact">
          <Stat icon={DollarSign} label="Monthly Revenue" value={stats.monthlyRevenue} />
        </Card>
      </div>

      {/* Recent Users Table */}
      <div className="mt-6">
        <h2 className="mb-4 text-[var(--font-h2)] text-[var(--text-primary)]">Recent Users</h2>
        <Table
          columns={columns}
          data={recentUsers}
          keyExtractor={(row) => row.id}
          emptyState="No users found."
        />
      </div>
    </>
  );
}
