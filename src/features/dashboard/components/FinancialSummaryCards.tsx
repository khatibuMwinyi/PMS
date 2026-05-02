import { BentoCard } from '@/components/ui/BentoCard';
import { DollarSign, ClipboardList, TrendingUp } from 'lucide-react';

interface FinancialSummaryCardsProps {
  totalSpend?: string;
  activeRequests?: number;
  maintenanceROI?: string;
}

export function FinancialSummaryCards({
  totalSpend = '$428,950.00',
  activeRequests = 24,
  maintenanceROI = '94.2%',
}: FinancialSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <BentoCard
        icon={<DollarSign size={20} />}
        label="Total Portfolio Spend"
        value={totalSpend}
        trend={{ value: 12, isPositive: true }}
      />
      <BentoCard
        icon={<ClipboardList size={20} />}
        label="Active Requests"
        value={activeRequests.toString()}
        trend={{ value: 5, isPositive: true }}
      />
      <BentoCard
        icon={<TrendingUp size={20} />}
        label="Maintenance ROI"
        value={maintenanceROI}
        trend={{ value: 3, isPositive: true }}
      />
    </div>
  );
}
