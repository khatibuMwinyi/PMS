import { Suspense } from 'react';
import { auth } from '@/core/auth';
import { redirect } from 'next/navigation';
import RoleGuard from '@/components/RoleGuard';
import { Table } from '@/components/ui/Table';
import { StatusBadge } from '@/components/ui/Badge';
import type { Column } from '@/components/ui/Table';
import { Users, UserCheck, UserX } from 'lucide-react';
import { getUsers } from '@/features/users/queries';
import { activateUser, suspendUser } from '@/features/users/actions';
import { revalidatePath } from 'next/cache';

interface UserRow {
  id: string;
  email: string;
  phone: string | null;
  role: string;
  status: string;
  name: string;
  joinedAt: string;
}

export const dynamic = 'force-dynamic';

export default function AdminUsersPage() {
  return (
    <RoleGuard allowedRoles={['ADMIN']}>
      <Suspense fallback={<div>Loading...</div>}>
        <AdminUsersContent />
      </Suspense>
    </RoleGuard>
  );
}

async function AdminUsersContent() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  if (session.user.role !== 'ADMIN') redirect('/login');

  const users = await getUsers();

  const userRows: UserRow[] = users.map((user) => ({
    id: user.id,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
    name:
      user.ownerProfile
        ? `${user.ownerProfile.firstName} ${user.ownerProfile.lastName}`
        : user.providerProfile
          ? user.providerProfile.businessName
          : user.email,
    joinedAt: user.createdAt.toISOString().split('T')[0],
  }));

  const columns: Column<UserRow>[] = [
    {
      key: 'name',
      header: 'Name',
      accessor: (row) => (
        <span className="font-medium text-[var(--text-primary)]">{row.name}</span>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      accessor: (row) => (
        <span className="text-[var(--text-secondary)]">{row.email}</span>
      ),
    },
    {
      key: 'phone',
      header: 'Phone',
      accessor: (row) => (
        <span className="text-body-sm tabular-nums">
          {row.phone || 'N/A'}
        </span>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      accessor: (row) => (
        <span className="px-2 py-1 rounded-pill text-[var(--text-xs)] font-medium bg-[var(--surface-overlay)]">
          {row.role}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (row) => <StatusBadge status={row.status as any} />,
    },
    {
      key: 'joinedAt',
      header: 'Joined',
      accessor: (row) => (
        <span className="text-body-sm tabular-nums">{row.joinedAt}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      accessor: (row) => (
        <UserActions
          userId={row.id}
          status={row.status}
          isSelf={row.id === session?.user.id}
        />
      ),
    },
  ];

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="flex items-center gap-4 p-4 rounded-[var(--radius-lg)] bg-[var(--surface)] border border-[var(--border-default)]">
          <div className="p-3 rounded-[var(--radius-md)] bg-[var(--surface-overlay)]">
            <Users size={20} className="text-[var(--brand-primary)]" />
          </div>
          <div>
            <p className="text-[var(--text-sm)] text-[var(--text-secondary)]">Total Users</p>
            <p className="text-h2 font-bold text-[var(--text-primary)]">
              {userRows.length}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 p-4 rounded-[var(--radius-lg)] bg-[var(--surface)] border border-[var(--border-default)]">
          <div className="p-3 rounded-[var(--radius-md)] bg-[var(--surface-overlay)]">
            <UserCheck size={20} className="text-[var(--color-success)]" />
          </div>
          <div>
            <p className="text-[var(--text-sm)] text-[var(--text-secondary)]">Active</p>
            <p className="text-h2 font-bold text-[var(--text-primary)]">
              {userRows.filter((u) => u.status === 'ACTIVE').length}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 p-4 rounded-[var(--radius-lg)] bg-[var(--surface)] border border-[var(--border-default)]">
          <div className="p-3 rounded-[var(--radius-md)] bg-[var(--surface-overlay)]">
            <UserX size={20} className="text-[var(--color-danger)]" />
          </div>
          <div>
            <p className="text-[var(--text-sm)] text-[var(--text-secondary)]">Suspended</p>
            <p className="text-h2 font-bold text-[var(--text-primary)]">
              {userRows.filter((u) => u.status === 'SUSPENDED').length}
            </p>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div>
        <h2 className="mb-4 text-h2 text-[var(--text-primary)]">
          All Users
        </h2>
        <Table
          columns={columns}
          data={userRows}
          keyExtractor={(row) => row.id}
          emptyState="No users found."
        />
      </div>
    </>
  );
}

function UserActions({
  userId,
  status,
  isSelf,
}: {
  userId: string;
  status: string;
  isSelf: boolean;
}) {
  const isActive = status === 'ACTIVE';

  return (
    <div className="flex items-center gap-2">
      <form
        action={async () => {
          'use server';
          if (isActive) {
            await suspendUser(userId);
          } else {
            await activateUser(userId);
          }
          revalidatePath('/admin/users');
        }}
      >
        <button
          type="submit"
          disabled={isSelf}
          className={`px-3 py-1.5 text-[var(--text-xs)] font-medium rounded-[var(--radius-pill)] transition-colors ${
            isActive
              ? 'bg-[var(--color-danger-bg)] text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)]/80'
              : 'bg-[var(--color-success-bg)] text-[var(--color-success)] hover:bg-[var(--color-success-bg)]/80'
          } ${isSelf ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isActive ? 'Suspend' : 'Activate'}
        </button>
      </form>
    </div>
  );
}
