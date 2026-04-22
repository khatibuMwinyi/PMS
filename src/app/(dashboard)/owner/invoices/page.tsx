import { redirect } from 'next/navigation';
import { auth } from '@/core/auth';
import { getOwnerInvoices } from '@/features/owner/queries';

export default async function OwnerInvoicesPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  if (session.user.role !== 'OWNER') redirect('/login');

  // Fetch invoices for the owner
  const invoices = await getOwnerInvoices();
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[20px] font-semibold text-[var(--text-primary)]">Invoices</h1>
        <p className="text-[14px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
          Recent completed services (treated as invoices)
        </p>
      </div>
      {invoices.length === 0 ? (
        <p>No invoices found.</p>
      ) : (
        <table className="min-w-full border border-gray-200">
          <thead>
            <tr className="bg-[var(--surface-card)]">
              <th className="p-2 text-left">Date</th>
              <th className="p-2 text-left">Property</th>
              <th className="p-2 text-left">Service</th>
              <th className="p-2 text-right">Amount (TZS)</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id} className="border-t">
                <td className="p-2">{new Date(inv.date).toLocaleDateString()}</td>
                <td className="p-2">{inv.property}</td>
                <td className="p-2">{inv.service}</td>
                <td className="p-2 text-right">{inv.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}