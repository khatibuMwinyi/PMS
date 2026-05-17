import { DollarSign, Wrench, CheckCircle2 } from 'lucide-react';
import { KpiCard } from '@/shared/components/ui/KpiCard';
import { getOwnerKpis } from '@/features/dashboard/queries/owner';

interface Props {
  ownerUserId: string;
}

export async function OwnerKpiCards({ ownerUserId }: Props) {
  const kpis = await getOwnerKpis(ownerUserId);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <KpiCard
        label="Total Paid to Oweru (YTD)"
        value={kpis.totalSpentYtdFormatted}
        icon={DollarSign}
        trend={
          kpis.ytdTrendDirection && kpis.ytdTrendPct
            ? {
                direction: kpis.ytdTrendDirection,
                pctFormatted: `${kpis.ytdTrendPct.toFixed(1)}%`,
                comparisonLabel: 'vs last year',
              }
            : null
        }
      />
      <KpiCard
        label="Active Services"
        value={String(kpis.activeServices)}
        icon={Wrench}
        subtext={{ text: `${kpis.pendingAcceptance} Pending Acceptance` }}
      />
      <KpiCard
        label="Completion Rate"
        value={kpis.completionRateFormatted}
        icon={CheckCircle2}
        subtext={{ text: 'Verified services to date' }}
      />
    </div>
  );
}
