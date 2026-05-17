import { redirect } from 'next/navigation';
import { auth } from '@/core/auth';
import RoleGuard from '@/components/RoleGuard';
import { CreatePropertyForm } from '@/features/properties/components/CreatePropertyForm';

export const metadata = {
  title: 'Add Property — Oweru',
};

export default function NewPropertyPage() {
  return (
    <RoleGuard allowedRoles={['OWNER']}>
      <NewPropertyContent />
    </RoleGuard>
  );
}

async function NewPropertyContent() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  if (session.user.role !== 'OWNER') redirect('/login');

  return (
    <div className="max-w-2xl">
        <p className="text-[var(--text-13px)] mb-6" style={{ color: 'var(--text-secondary)' }}>
          Fill in the details below to onboard a new property to the platform.
          All information is encrypted and stored securely.
        </p>

        <div className="bg-[var(--surface)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-6 md:p-8">
          <CreatePropertyForm redirectTo="/owner/properties" />
        </div>
      </div>
  );
}
