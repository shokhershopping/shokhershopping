'use client';

import { useEffect, useState } from 'react';
import { useFirebaseAuth } from '@/lib/firebase-auth-provider';
import MetricCard from '@core/components/cards/metric-card';
import { Button, Text } from 'rizzui';
import cn from '@core/utils/class-names';
import {
  PiCaretDoubleUpDuotone,
  PiCaretDoubleDownDuotone,
  PiGiftDuotone,
  PiBankDuotone,
  PiChartPieSliceDuotone,
} from 'react-icons/pi';
import { BarChart, Bar, ResponsiveContainer } from 'recharts';
import { getDashboardStats } from '@/lib/dashboard-api';
import type { DashboardStats, StatCardChartData } from '@/types/dashboard';

type ViewMode = 'month' | 'total';

interface StatCardData {
  id: string;
  icon: React.ReactNode;
  title: string;
  metric: string;
  increased: boolean;
  decreased: boolean;
  percentage: string;
  style: string;
  fill: string;
  chart: StatCardChartData[];
}

/**
 * Transform weekly data from API to chart format
 */
function transformWeeklyData(weeklyData: Array<{ day: string; value: number }>): StatCardChartData[] {
  return weeklyData.map(item => ({
    day: item.day,
    sale: item.value,
    cost: 0, // Not used in current design
  }));
}

/**
 * Format number with commas
 */
function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(Math.round(num));
}

export default function StatCards({ className }: { className?: string }) {
  const { getToken } = useFirebaseAuth();
  const [monthStats, setMonthStats] = useState<DashboardStats | null>(null);
  const [totalStats, setTotalStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('month');

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        const token = await getToken();

        // Fetch both month and total stats in parallel
        // This Month = last 30 days, Total = last 3 years (1095 days)
        const [monthResponse, totalResponse] = await Promise.all([
          getDashboardStats(30, token),
          getDashboardStats(1095, token), // 3 years for "all time"
        ]);

        setMonthStats(monthResponse.data);
        setTotalStats(totalResponse.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError('Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    }

    fetchStats();

    // Refresh every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [getToken]);

  // Show loading skeleton
  if (loading) {
    return (
      <div className={cn('space-y-5', className)}>
        <div className="h-10" /> {/* Spacer for toggle buttons */}
        <div className="grid grid-cols-1 gap-5 @2xl:grid-cols-3 @3xl:gap-6 3xl:gap-8 4xl:gap-9">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-[180px] animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800"
            />
          ))}
        </div>
      </div>
    );
  }

  // Show error message
  if (error || !monthStats || !totalStats) {
    return (
      <div className={cn('space-y-5', className)}>
        <div className="h-10" /> {/* Spacer for toggle buttons */}
        <div className="grid grid-cols-1 gap-5 @2xl:grid-cols-3 @3xl:gap-6 3xl:gap-8 4xl:gap-9">
          <div className="col-span-full rounded-lg border border-red-200 bg-red-50 p-4 text-center text-red-600">
            {error || 'Failed to load statistics'}
          </div>
        </div>
      </div>
    );
  }

  // Use stats based on selected view mode
  const activeStats = viewMode === 'month' ? monthStats : totalStats;

  const statCards: StatCardData[] = [
    {
      id: '1',
      icon: <PiGiftDuotone className="h-6 w-6" />,
      title: 'New Orders',
      metric: formatNumber(activeStats.orders.current),
      increased: activeStats.orders.percentageChange > 0,
      decreased: activeStats.orders.percentageChange < 0,
      percentage: activeStats.orders.percentageChange > 0
        ? `+${activeStats.orders.percentageChange.toFixed(2)}`
        : activeStats.orders.percentageChange.toFixed(2),
      style: 'text-[#3872FA]',
      fill: '#3872FA',
      chart: transformWeeklyData(activeStats.orders.weeklyData),
    },
    {
      id: '2',
      icon: <PiChartPieSliceDuotone className="h-6 w-6" />,
      title: 'Sales',
      metric: `৳${formatNumber(activeStats.sales.current)}`,
      increased: activeStats.sales.percentageChange > 0,
      decreased: activeStats.sales.percentageChange < 0,
      percentage: activeStats.sales.percentageChange > 0
        ? `+${activeStats.sales.percentageChange.toFixed(2)}`
        : activeStats.sales.percentageChange.toFixed(2),
      style: 'text-[#10b981]',
      fill: '#10b981',
      chart: transformWeeklyData(activeStats.sales.weeklyData),
    },
    {
      id: '3',
      icon: <PiBankDuotone className="h-6 w-6" />,
      title: 'Products',
      metric: formatNumber(activeStats.products.current),
      increased: activeStats.products.percentageChange > 0,
      decreased: activeStats.products.percentageChange < 0,
      percentage: activeStats.products.percentageChange > 0
        ? `+${activeStats.products.percentageChange.toFixed(2)}`
        : activeStats.products.percentageChange.toFixed(2),
      style: 'text-[#7928ca]',
      fill: '#7928ca',
      chart: transformWeeklyData(activeStats.products.weeklyData),
    },
  ];

  return (
    <div className={cn('space-y-5', className)}>
      {/* Toggle Buttons */}
      <div className="flex justify-end gap-2">
        <Button
          size="sm"
          variant={viewMode === 'month' ? 'solid' : 'outline'}
          onClick={() => setViewMode('month')}
          className={cn(
            'min-w-[100px]',
            viewMode === 'month'
              ? 'bg-gray-900 text-white hover:bg-gray-800'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          )}
        >
          This Month
        </Button>
        <Button
          size="sm"
          variant={viewMode === 'total' ? 'solid' : 'outline'}
          onClick={() => setViewMode('total')}
          className={cn(
            'min-w-[100px]',
            viewMode === 'total'
              ? 'bg-gray-900 text-white hover:bg-gray-800'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          )}
        >
          Total
        </Button>
      </div>

      {/* Stats Cards */}
      <div
        className="grid grid-cols-1 gap-5 @2xl:grid-cols-3 @3xl:gap-6 3xl:gap-8 4xl:gap-9"
      >
        {statCards.map((stat) => (
          <MetricCard
            key={stat.title + stat.id}
            title={stat.title}
            metric={stat.metric}
            metricClassName="lg:text-[22px]"
            icon={stat.icon}
            iconClassName={cn(
              '[&>svg]:w-10 [&>svg]:h-8 lg:[&>svg]:w-11 lg:[&>svg]:h-9 w-auto h-auto p-0 bg-transparent -mx-1.5',
              stat.id === '1' &&
                '[&>svg]:w-9 [&>svg]:h-7 lg:[&>svg]:w-[42px] lg:[&>svg]:h-[34px]',
              stat.style
            )}
            chart={
              <ResponsiveContainer width="100%" height="100%">
                <BarChart barSize={5} barGap={2} data={stat.chart}>
                  <Bar dataKey="sale" fill={stat.fill} radius={5} />
                </BarChart>
              </ResponsiveContainer>
            }
            chartClassName="hidden @[200px]:flex @[200px]:items-center h-14 w-24"
            className="@container [&>div]:items-center"
          >
            <Text className="mt-5 flex items-center border-t border-dashed border-muted pt-4 leading-none text-gray-500">
              <Text
                as="span"
                className={cn(
                  'me-2 inline-flex items-center font-medium',
                  stat.increased ? 'text-green' : 'text-red'
                )}
              >
                {stat.increased ? (
                  <PiCaretDoubleUpDuotone className="me-1 h-4 w-4" />
                ) : (
                  <PiCaretDoubleDownDuotone className="me-1 h-4 w-4" />
                )}
                {stat.percentage}%
              </Text>
              <Text as="span" className="me-1 hidden @[240px]:inline-flex">
                {stat.increased ? 'Increased' : 'Decreased'}
              </Text>{' '}
              {viewMode === 'month' ? 'last month' : 'historically'}
            </Text>
          </MetricCard>
        ))}
      </div>
    </div>
  );
}
