import { Suspense } from 'react';
import { auth } from '@/core/auth';
import { redirect } from 'next/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { getOwnerDashboardData } from '@/features/analytics/queries';
import RoleGuard from '@/components/RoleGuard';
import OwnerDashboardSkeleton from '@/components/dashboard/OwnerDashboardSkeleton';
import { ErrorBoundaryWrapper } from '@/components/ui/ErrorBoundary';
import { motion } from 'framer-motion';
import { AnimatedCard, GradientText } from '@/components/animations/BoldAnimations';

export const dynamic = 'force-dynamic';

export default function OwnerPage() {
  return (
    <RoleGuard allowedRoles={['OWNER']}>
      <Suspense fallback={<OwnerDashboardSkeleton />}>
        <ErrorBoundaryWrapper>
          <OwnerDashboardContent />
        </ErrorBoundaryWrapper>
      </Suspense>
    </RoleGuard>
  );
}

async function OwnerDashboardContent() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  if (session.user.role !== 'OWNER') redirect('/login');

  const data = await getOwnerDashboardData(session.user.id);

  return (
    <DashboardShell role="OWNER" userName={session.user.name} pageTitle="Dashboard">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">
          Welcome back, <GradientText>{session.user.name}</GradientText>
        </h2>
        <p className="text-[var(--text-secondary)]">Here's your property overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <AnimatedCard className="p-6">
          <p className="text-sm text-[var(--text-muted)] mb-2">Total Properties</p>
          <p className="text-3xl font-bold text-gradient mb-2">{data.totalProperties}</p>
          <motion.div
            className="mt-2 h-1 bg-gradient-to-r from-[var(--brand-gold)] to-[var(--brand-primary)] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 1 }}
          />
        </AnimatedCard>

        <AnimatedCard className="p-6">
          <p className="text-sm text-[var(--text-muted)] mb-2">Active Services</p>
          <p className="text-3xl font-bold text-gradient mb-2">{data.activeServices}</p>
          <div className="flex items-center gap-1 text-sm text-[var(--text-success)]">
            <span>↑ 12%</span>
            <span>from last month</span>
          </div>
        </AnimatedCard>

        <AnimatedCard className="p-6">
          <p className="text-sm text-[var(--text-muted)] mb-2">Revenue</p>
          <p className="text-3xl font-bold text-gradient mb-2">$12,450</p>
          <div className="flex items-center gap-1 text-sm text-[var(--text-success)]">
            <span>↑ 15%</span>
            <span>from last month</span>
          </div>
        </AnimatedCard>
      </div>

      <AnimatedCard className="p-6">
        <h3 className="font-semibold text-[var(--text-primary)] mb-4">Recent Completed Tasks</h3>
        <ul className="space-y-3">
          {data.recentTasks.map((t, index) => (
            <motion.li
              key={t.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-3 bg-[var(--surface-overlay)] rounded-lg"
            >
              <span className="text-sm">Task {t.id.slice(0, 8)}</span>
              <span className="text-xs text-[var(--text-muted)]">
                {t.checkOutTime ? new Date(t.checkOutTime).toLocaleDateString() : 'N/A'}
              </span>
            </motion.li>
          ))}
        </ul>
      </AnimatedCard>
    </DashboardShell>
  );
}