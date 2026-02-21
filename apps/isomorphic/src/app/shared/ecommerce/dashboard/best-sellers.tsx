'use client';

import { useEffect, useState } from 'react';
import { useFirebaseAuth } from '@/lib/firebase-auth-provider';
import Image from 'next/image';
import { DatePicker } from '@core/ui/datepicker';
import WidgetCard from '@core/components/cards/widget-card';
import { Button, Text } from 'rizzui';
import Rating from '@core/components/rating';
import { getTopProducts } from '@/lib/dashboard-api';
import type { TopProduct } from '@/types/dashboard';

const currentDate = new Date();
const previousMonthDate = new Date(
  currentDate.getFullYear(),
  currentDate.getMonth() - 1,
  currentDate.getDate()
);

export default function BestSellers({ className }: { className?: string }) {
  const { getToken } = useFirebaseAuth();
  const [rangeDate, setRangeDate] = useState<[Date | null, Date | null]>([
    previousMonthDate,
    currentDate,
  ]);
  const [products, setProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTopProducts() {
      try {
        setLoading(true);
        const token = await getToken();
        const response = await getTopProducts({
          limit: 8,
          startDate: rangeDate[0]?.toISOString(),
          endDate: rangeDate[1]?.toISOString(),
        }, token);
        setProducts(Array.isArray(response.data) ? response.data : []);
        setError(null);
      } catch (err) {
        console.error('Error fetching top products:', err);
        setError('Failed to load top products');
      } finally {
        setLoading(false);
      }
    }

    fetchTopProducts();
  }, [rangeDate, getToken]);

  return (
    <WidgetCard
      title={'Top Products'}
      description={
        <>
          Overview:
          <DatePicker
            selected={rangeDate?.[0]}
            onChange={(dates) => setRangeDate(dates)}
            startDate={rangeDate?.[0] as Date}
            endDate={rangeDate?.[1] as Date}
            monthsShown={1}
            placeholderText="Select Date in a Range"
            selectsRange
            inputProps={{
              variant: 'text',
              inputClassName: 'p-0 pe-1 h-auto ms-2 [&_input]:text-ellipsis',
              prefixClassName: 'hidden',
            }}
          />
        </>
      }
      action={
        <Button variant="text" className="whitespace-nowrap underline">
          View All
        </Button>
      }
      descriptionClassName="mt-1 flex items-center [&_.react-datepicker-wrapper]:w-full [&_.react-datepicker-wrapper]:max-w-[228px] text-gray-500"
      className={className}
    >
      {loading ? (
        <div className="mt-[18px] flex items-center justify-center h-[460px]">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
        </div>
      ) : error ? (
        <div className="mt-[18px] flex items-center justify-center h-[460px]">
          <p className="text-red-600">{error}</p>
        </div>
      ) : products.length === 0 ? (
        <div className="mt-[18px] flex items-center justify-center h-[460px]">
          <p className="text-gray-500">No products sold in this period</p>
        </div>
      ) : (
        <div className="custom-scrollbar -me-2 mt-[18px] grid max-h-[460px] gap-4 overflow-y-auto @sm:gap-5">
          {products.map((product) => {
            const imageUrl = product.thumbnail?.startsWith('http')
              ? product.thumbnail
              : product.thumbnail || '/placeholder.png';

            const displayPrice = product.salePrice || product.price;
            const formattedPrice = `৳${new Intl.NumberFormat('en-US').format(displayPrice)}`;

            return (
              <div
                key={product.id}
                className="flex items-start pe-2"
              >
                <div className="relative me-3 h-11 w-11 shrink-0 overflow-hidden rounded bg-gray-100 @sm:h-12 @sm:w-12">
                  <Image
                    src={imageUrl}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw"
                    className="object-cover"
                  />
                </div>
                <div className="flex w-full items-start justify-between">
                  <div>
                    <Text className="font-lexend text-sm font-medium text-gray-900 dark:text-gray-700">
                      {product.name}
                    </Text>
                    <Text className="text-gray-500">{formattedPrice}</Text>
                  </div>
                  <div>
                    <Rating rating={product.rating > 0 ? [product.rating] : [0]} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </WidgetCard>
  );
}
