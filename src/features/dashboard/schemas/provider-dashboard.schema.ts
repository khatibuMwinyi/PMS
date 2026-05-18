export interface ProviderDashboardData {
  earnings: {
    todayTZS: number;
    pendingTZS: number;
    availableTZS: number;
  };
  metrics: {
    activeTaskCount: number;
    acceptanceRate: number;
    acceptanceRateDeltaPct: number;
    rating: number;
    ratingCount: number;
    strikeCount: number;
  };
  nextUpcoming: {
    assignmentId: string;
    taskId: string | null;
    serviceTypeName: string;
    zone: string;
    scheduledFor: string;
    priority: 'ROUTINE' | 'URGENT';
    estDurationHours: number;
  } | null;
  pipeline: Array<{
    assignmentId: string;
    serviceTypeName: string;
    zone: string;
    scheduledFor: string | null;
    status: string;
  }>;
  todayProgress: Array<{
    key: string;
    label: string;
    state: 'completed' | 'active' | 'pending';
    detail: string;
  }>;
}
