'use client';

import { useEffect, useState, useMemo } from 'react';
import { useFirebaseAuth } from '@/lib/firebase-auth-provider';
import { ordersColumns } from '@/app/shared/ecommerce/order/order-list/columns';
import WidgetCard from '@core/components/cards/widget-card';
import Table from '@core/components/table';
import { useTanStackTable } from '@core/components/table/custom/use-TanStack-Table';
import TablePagination from '@core/components/table/pagination';
import cn from '@core/utils/class-names';
import { Input } from 'rizzui';
import { PiMagnifyingGlassBold } from 'react-icons/pi';
import { getRecentOrders } from '@/lib/dashboard-api';

export type OrdersDataType = any;

export default function RecentOrder({ className }: { className?: string }) {
  const { getToken } = useFirebaseAuth();
  const [orders, setOrders] = useState<OrdersDataType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      try {
        setLoading(true);
        const token = await getToken();

        const response = await getRecentOrders({
          page: 1,
          limit: 7,
          sort: 'createdAt',
          order: 'desc',
        }, token);

        // Helper to parse Firestore timestamps
        const parseTimestamp = (ts: any): string => {
          if (!ts) return '';
          if (ts._seconds) return new Date(ts._seconds * 1000).toISOString();
          return new Date(ts).toISOString();
        };

        // Transform the data to match column expectations
        const transformedOrders = (response.data || []).map((order: any) => ({
          ...order,
          name: order.userName || order.userEmail || order.user?.name || 'Unknown',
          avatar: order.user?.image || '',
          email: order.userEmail || order.user?.email || '',
          items: Array.isArray(order.items) ? order.items.length : 0,
          price: order.netTotal || order.total || 0,
          createdAt: parseTimestamp(order.createdAt),
          updatedAt: parseTimestamp(order.updatedAt),
        }));

        setOrders(transformedOrders);
        setError(null);
      } catch (err) {
        setError('Failed to load recent orders');
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [getToken]);

  const columns = useMemo(() => ordersColumns(false), []);

  const { table, setData } = useTanStackTable<OrdersDataType>({
    tableData: orders,
    columnConfig: columns,
    options: {
      initialState: {
        pagination: {
          pageIndex: 0,
          pageSize: 7,
        },
      },
      getRowId: (row) => row.id,
      meta: {
        handleDeleteRow: (row) => {
          setData((prev) => prev.filter((r) => r.id !== row.id));
        },
      },
      enableColumnResizing: false,
    },
  });

  return (
    <WidgetCard
      title="Recent Orders"
      className={cn('p-0 lg:p-0', className)}
      headerClassName="px-5 pt-5 lg:px-7 lg:pt-7 mb-6"
      action={
        <Input
          type="search"
          clearable={true}
          inputClassName="h-[36px]"
          placeholder="Search orders..."
          onClear={() => table.setGlobalFilter('')}
          value={table.getState().globalFilter ?? ''}
          prefix={<PiMagnifyingGlassBold className="size-4" />}
          onChange={(e) => table.setGlobalFilter(e.target.value)}
          className="w-full @3xl:order-3 @3xl:ms-auto @3xl:max-w-72"
        />
      }
    >
      {loading ? (
        <div className="flex items-center justify-center h-[400px]">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-[400px]">
          <p className="text-red-600">{error}</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="flex items-center justify-center h-[400px]">
          <p className="text-gray-500">No recent orders</p>
        </div>
      ) : (
        <>
          <Table
            table={table}
            variant="modern"
            classNames={{
              cellClassName: 'first:ps-6',
              headerCellClassName: 'first:ps-6',
            }}
          />
          <TablePagination table={table} className="p-4" />
        </>
      )}
    </WidgetCard>
  );
}
