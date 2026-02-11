'use client';

import { useEffect, useState } from 'react';
import { useFirebaseAuth } from '@/lib/firebase-auth-provider';
import WidgetCard from '@core/components/cards/widget-card';
import { CustomTooltip } from '@core/components/charts/custom-tooltip';
import { useMedia } from '@core/hooks/use-media';
import { DatePicker } from '@core/ui/datepicker';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Badge, Text } from 'rizzui';
import { getCustomerAnalytics } from '@/lib/dashboard-api';
import type { CustomerAnalyticsData } from '@/types/dashboard';

export default function RepeatCustomerRate({
  className,
}: {
  className?: string;
}) {
  const { getToken } = useFirebaseAuth();
  const isTablet = useMedia('(max-width: 820px)', false);
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [analyticsData, setAnalyticsData] = useState<CustomerAnalyticsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setLoading(true);
        const year = startDate?.getFullYear() || new Date().getFullYear();
        const token = await getToken();
        const response = await getCustomerAnalytics(year, token);
        setAnalyticsData(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching customer analytics:', err);
        setError('Failed to load customer analytics');
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, [startDate, getToken]);
  return (
    <WidgetCard
      title={'Repeat Customer Rate'}
      description={
        <>
          <Badge renderAsDot className="ms-1 bg-[#10b981]" /> New
          <Text as="span" className="hidden xs:inline-flex">
            Customer
          </Text>
          <Badge renderAsDot className="me-1 ms-4 bg-[#0470f2]" /> Old{' '}
          <Text as="span" className="hidden xs:inline-flex">
            Customer
          </Text>
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
        <div className="h-[480px] flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
        </div>
      ) : error ? (
        <div className="h-[480px] flex items-center justify-center">
          <p className="text-red-600">{error}</p>
        </div>
      ) : (
        <div className='custom-scrollbar overflow-x-auto scroll-smooth'>
          <div className="h-[480px] w-full pt-9">
            <ResponsiveContainer
              width="100%"
              height="100%"
              {...(isTablet && { minWidth: '700px' })}
            >
              <AreaChart
                data={analyticsData}
                margin={{
                  left: -16,
                }}
              className="[&_.recharts-cartesian-axis-tick-value]:fill-gray-500 rtl:[&_.recharts-cartesian-axis.yAxis]:-translate-x-12 [&_.recharts-cartesian-grid-vertical]:opacity-0"
            >
              <defs>
                <linearGradient id="newCustomer" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ffdadf" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="oldCustomer" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#dbeafe" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#3872FA" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="8 10" strokeOpacity={0.435} />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                className=" "
              />
              <YAxis axisLine={false} tickLine={false} className=" " />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="natural"
                dataKey="newCustomer"
                stroke="#10b981"
                strokeWidth={2.3}
                fillOpacity={1}
                fill="url(#newCustomer)"
              />
              <Area
                type="natural"
                dataKey="oldCustomer"
                stroke="#3872FA"
                strokeWidth={2.3}
                fillOpacity={1}
                fill="url(#oldCustomer)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      )}
    </WidgetCard>
  );
}
