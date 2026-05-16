import { redirect } from 'next/navigation';
import { auth } from '@/core/auth';

export default async function OwnerLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect('/login');
  if (session.user.role !== 'OWNER') redirect('/login');
  return <>{children}</>;
}
