'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import WidgetCard from '@core/components/cards/widget-card';
import { CustomTooltip } from '@core/components/charts/custom-tooltip';
import { CustomYAxisTick } from '@core/components/charts/custom-yaxis-tick';
import { useMedia } from '@core/hooks/use-media';
import { DatePicker } from '@core/ui/datepicker';
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Badge } from 'rizzui';
import { getSalesReport } from '@/lib/dashboard-api';
import type { SalesReportData } from '@/types/dashboard';

export default function SalesReport({ className }: { className?: string }) {
  const { getToken } = useAuth();
  const isTablet = useMedia('(max-width: 820px)', false);
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [salesData, setSalesData] = useState<SalesReportData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSalesData() {
      try {
        setLoading(true);
        const year = startDate?.getFullYear() || new Date().getFullYear();
        const token = await getToken();
        const response = await getSalesReport(year, token);
        setSalesData(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching sales report:', err);
        setError('Failed to load sales report');
      } finally {
        setLoading(false);
      }
    }

    fetchSalesData();
  }, [startDate, getToken]);
  return (
    <WidgetCard
      title={'Sales Report'}
      description={
        <>
          <Badge renderAsDot className="me-0.5 bg-[#282ECA]" /> Sales
        </>
      }
      descriptionClassName="text-gray-500 mt-1.5"
      action={
        <DatePicker
          selected={startDate}
          onChange={(date: Date | null) => setStartDate(date)}
          dateFormat="yyyy"
          placeholderText="Select Year"
          showYearPicker
          inputProps={{ variant: 'text', inputClassName: 'p-0 px-1 h-auto' }}
          popperPlacement="bottom-end"
          className="w-[100px]"
        />
      }
      className={className}
    >
      {loading ? (
        <div className="h-96 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
        </div>
      ) : error ? (
        <div className="h-96 flex items-center justify-center">
          <p className="text-red-600">{error}</p>
        </div>
      ) : (
        <div className="custom-scrollbar overflow-x-auto scroll-smooth">
          <div className="h-96 w-full pt-9">
            <ResponsiveContainer
              width="100%"
              height="100%"
              {...(isTablet && { minWidth: '700px' })}
            >
              <ComposedChart
                data={salesData}
                barSize={isTablet ? 20 : 24}
              className="[&_.recharts-tooltip-cursor]:fill-opacity-20 dark:[&_.recharts-tooltip-cursor]:fill-opacity-10 [&_.recharts-cartesian-axis-tick-value]:fill-gray-500 [&_.recharts-cartesian-axis.yAxis]:-translate-y-3 rtl:[&_.recharts-cartesian-axis.yAxis]:-translate-x-12 [&_.recharts-cartesian-grid-vertical]:opacity-0"
            >
              <defs>
                <linearGradient id="salesReport" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="#F0F1FF"
                    className="[stop-opacity:0.1]"
                  />
                  <stop offset="95%" stopColor="#8200E9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="8 10" strokeOpacity={0.435} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={<CustomYAxisTick prefix={'$'} />}
              />
              <Tooltip
                content={
                  <CustomTooltip className="[&_.chart-tooltip-item:last-child]:hidden" />
                }
              />
              <Bar
                dataKey="sales"
                fill="#282ECA"
                stackId="a"
                radius={[0, 0, 4, 4]}
              />

              <Area
                type="bump"
                dataKey="sales"
                stroke="#8200E9"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#salesReport)"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
      )}
    </WidgetCard>
  );
}
