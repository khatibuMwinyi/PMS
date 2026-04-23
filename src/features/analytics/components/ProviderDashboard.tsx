'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { UnifiedButton } from '@/components/ui/UnifiedButton';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  Star
} from 'lucide-react';
import { getProviderAnalytics } from '../provider';

interface ProviderDashboardProps {
  providerId: string;
}

interface AnalyticsData {
  earnings: {
    total: number;
    pending: number;
    available: number;
    weekly: number;
    byService: Array<{
      serviceType: string;
      amount: number;
      count: number;
    }>;
  };
  performance: {
    rating: number;
    totalRating: number;
    completionRate: number;
    acceptanceRate: number;
    responsiveness: number;
    strikeCount: number;
  };
  tasks: {
    completed: number;
    pending: number;
    accepted: number;
    disputed: number;
    upcoming: Array<{
      id: string;
      serviceType: string;
      property: string;
      scheduledAt: string;
    }>;
  };
  trends: {
    earnings7d: number[];
    earnings30d: number[];
    ratingTrend: number[];
  };
}

export function ProviderDashboard({ providerId }: ProviderDashboardProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true);
        const analytics = await getProviderAnalytics(providerId);
        setData(analytics);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, [providerId]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-8 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center text-red-500">
            <AlertCircle className="mr-2 h-4 w-4" />
            {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sw-TZ', {
      style: 'currency',
      currency: 'TZS',
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Earnings Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Earnings Overview
          </CardTitle>
          <CardDescription>
            Your performance and earnings this month
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total Earnings</p>
              <p className="text-2xl font-bold">{formatCurrency(data.earnings.total)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Available Balance</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(data.earnings.available)}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {formatCurrency(data.earnings.pending)}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">This Week</p>
              <p className="text-2xl font-bold">{formatCurrency(data.earnings.weekly)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Rating</p>
                <p className="text-sm font-medium">{data.performance.rating.toFixed(1)}</p>
              </div>
              <Progress value={data.performance.rating * 20} />
              <p className="text-xs text-muted-foreground">
                {data.performance.totalRating} reviews
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Completion Rate</p>
                <p className="text-sm font-medium">{formatPercentage(data.performance.completionRate)}</p>
              </div>
              <Progress value={data.performance.completionRate} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Acceptance Rate</p>
                <p className="text-sm font-medium">{formatPercentage(data.performance.acceptanceRate)}</p>
              </div>
              <Progress value={data.performance.acceptanceRate} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Task Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{data.tasks.completed}</div>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{data.tasks.accepted}</div>
              <p className="text-sm text-muted-foreground">Accepted</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">{data.tasks.pending}</div>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{data.tasks.disputed}</div>
              <p className="text-sm text-muted-foreground">Disputed</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Earnings by Service */}
      <Card>
        <CardHeader>
          <CardTitle>Earnings by Service</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.earnings.byService.map((service) => (
              <div key={service.serviceType} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{service.serviceType}</p>
                  <p className="text-sm text-muted-foreground">
                    {service.count} jobs
                  </p>
                </div>
                <p className="font-bold">{formatCurrency(service.amount)}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.tasks.upcoming.length === 0 ? (
            <p className="text-muted-foreground">No upcoming tasks</p>
          ) : (
            <div className="space-y-3">
              {data.tasks.upcoming.slice(0, 5).map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">{task.serviceType}</p>
                    <p className="text-sm text-muted-foreground">{task.property}</p>
                  </div>
                  <Badge variant="outline">
                    {new Date(task.scheduledAt).toLocaleDateString()}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <UnifiedButton className="flex-1">
              <Clock className="mr-2 h-4 w-4" />
              View Schedule
            </UnifiedButton>
            <UnifiedButton variant="outline" className="flex-1">
              <TrendingUp className="mr-2 h-4 w-4" />
              Request Payout
            </UnifiedButton>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}