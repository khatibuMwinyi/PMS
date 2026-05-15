import { Stat } from '@/components/ui/Stat';
import { Card } from '@/components/ui/Card';
import { DollarSign, ClipboardList, TrendingUp } from 'lucide-react';
import { getDashboardFinancials } from '@/features/dashboard/actions';

export async function FinancialSummaryCards() {
  const { totalSpend, activeRequests, maintenanceROI } = await getDashboardFinancials();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <Card padding="compact">
        <Stat
          icon={DollarSign}
          label="Total Portfolio Spend"
          value={totalSpend}
          trend={{ direction: 'up', value: 12 }}
        />
      </Card>
      <Card padding="compact">
        <Stat
          icon={ClipboardList}
          label="Active Requests"
          value={activeRequests.toString()}
          trend={{ direction: 'up', value: 5 }}
        />
      </Card>
      <Card padding="compact">
        <Stat
          icon={TrendingUp}
          label="Maintenance ROI"
          value={maintenanceROI}
          trend={{ direction: 'up', value: 3 }}
        />
      </Card>
    </div>
  );
}
