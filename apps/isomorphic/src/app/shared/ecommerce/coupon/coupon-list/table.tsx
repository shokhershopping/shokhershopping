'use client';

import { useEffect, useState } from 'react';
import Table from '@core/components/table';
import { useTanStackTable } from '@core/components/table/custom/use-TanStack-Table';
import TablePagination from '@core/components/table/pagination';
import { couponColumns, CouponDataType } from './columns';
import toast from 'react-hot-toast';

// Helper to parse Firestore timestamps
function parseTimestamp(ts: any): string {
  if (!ts) return '';
  if (ts._seconds) return new Date(ts._seconds * 1000).toISOString();
  return new Date(ts).toISOString();
}

export default function CouponTable() {
  const [loading, setLoading] = useState(true);

  const { table, setData } = useTanStackTable<CouponDataType>({
    tableData: [],
    columnConfig: couponColumns,
    options: {
      initialState: {
        pagination: {
          pageIndex: 0,
          pageSize: 10,
        },
      },
      meta: {
        handleDeleteRow: async (row: CouponDataType) => {
          try {
            const res = await fetch(`/api/coupons/${row.id}`, {
              method: 'DELETE',
            });
            if (res.ok) {
              setData((prev) => prev.filter((r) => r.id !== row.id));
              toast.success('Coupon deleted successfully');
            } else {
              toast.error('Failed to delete coupon');
            }
          } catch {
            toast.error('Failed to delete coupon');
          }
        },
      },
      enableColumnResizing: false,
    },
  });

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/coupons?limit=10000');
        if (!res.ok) throw new Error('Failed to fetch');
        const json = await res.json();
        const items = Array.isArray(json?.data) ? json.data : [];

        const transformed: CouponDataType[] = items.map((coupon: any) => ({
          id: coupon.id,
          code: coupon.code || '',
          description: coupon.description || '',
          type: coupon.type || 'FIXED',
          amount: coupon.amount || 0,
          minimum: coupon.minimum || 0,
          maximum: coupon.maximum || 0,
          used: coupon.used || 0,
          limit: coupon.limit || 0,
          status: coupon.status || 'ACTIVE',
          expiry: parseTimestamp(coupon.expiry || coupon.end),
          createdAt: parseTimestamp(coupon.createdAt),
        }));

        setData(transformed);
      } catch {
        toast.error('Failed to load coupons');
      } finally {
        setLoading(false);
      }
    };

    fetchCoupons();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
      </div>
    );
  }

  return (
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
  );
}
