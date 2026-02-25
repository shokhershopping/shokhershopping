'use client';

import { useEffect, useState } from 'react';
import { useFirebaseAuth } from '@/lib/firebase-auth-provider';
import WorldMap from 'react-svg-worldmap';
import WidgetCard from '@core/components/cards/widget-card';
import { Badge, Text } from 'rizzui';
import cn from '@core/utils/class-names';
import { DatePicker } from '@core/ui/datepicker';
import { useElementSize } from '@core/hooks/use-element-size';
import { getUserLocation } from '@/lib/dashboard-api';
import type { UserLocationData } from '@/types/dashboard';

const colorPalette = [
  'bg-[#028ca6]',
  'bg-[#8bcad6]',
  'bg-[#a1d4de]',
  'bg-[#cce8ed]',
  'bg-[#e0f2f5]',
];

export default function UserLocation({ className }: { className?: string }) {
  const { getToken } = useFirebaseAuth();
  const [ref, { width }] = useElementSize();
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [locationData, setLocationData] = useState<UserLocationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLocationData() {
      try {
        setLoading(true);
        const token = await getToken();
        const response = await getUserLocation(token);
        setLocationData(Array.isArray(response.data) ? response.data : []);
        setError(null);
      } catch (err) {
        setError('Failed to load user location data');
      } finally {
        setLoading(false);
      }
    }

    fetchLocationData();
  }, [getToken]);
  return (
    <WidgetCard
      title={'User Location'}
      action={
        <DatePicker
          selected={startDate}
          onChange={(date: Date | null) => setStartDate(date)}
          dateFormat="MMM, yyyy"
          placeholderText="Select Month"
          showMonthYearPicker
          popperPlacement="bottom-end"
          inputProps={{
            variant: 'text',
            inputClassName: 'p-0 px-1 h-auto [&_input]:text-ellipsis',
          }}
          className="w-36"
        />
      }
      className={cn(
        'relative grid grid-cols-1 place-content-between gap-3',
        className
      )}
    >
      {loading ? (
        <div className="col-span-full h-[400px] flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
        </div>
      ) : error ? (
        <div className="col-span-full h-[400px] flex items-center justify-center">
          <p className="text-red-600">{error}</p>
        </div>
      ) : locationData.length === 0 ? (
        <div className="col-span-full h-[400px] flex items-center justify-center">
          <p className="text-gray-500">No location data available</p>
        </div>
      ) : (
        <>
          <div
            ref={ref}
            className="col-span-full [&_figure]:!bg-transparent [&_svg]:dark:invert"
          >
            <WorldMap
              color="#028ca6"
              valueSuffix="%"
              size={width}
              data={locationData.map(loc => ({
                country: loc.country,
                value: loc.value
              }))}
            />
          </div>

          <div className="col-span-full -mx-5 border-t border-dashed border-muted px-5 pt-5 lg:-mx-7 lg:px-7">
            <div className="mx-auto flex w-full max-w-md flex-wrap justify-center gap-x-3 gap-y-1.5 text-center">
              {locationData.map((country, index) => (
                <div key={country.name} className="flex items-center gap-1">
                  <Badge
                    renderAsDot
                    className={cn(
                      colorPalette[index % colorPalette.length],
                      'dark:invert'
                    )}
                  />
                  <Text className="text-gray-500 dark:text-gray-600">
                    {country.name}
                    <Text
                      as="span"
                      className="ms-1 font-lexend font-medium text-gray-700"
                    >
                      {`${country.value}%`}
                    </Text>
                  </Text>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </WidgetCard>
  );
}
