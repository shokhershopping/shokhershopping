'use client';

import { useEffect, useState } from 'react';
import Table from '@core/components/table';
import { useTanStackTable } from '@core/components/table/custom/use-TanStack-Table';
import TablePagination from '@core/components/table/pagination';
import { deliveryAreaColumns, DeliveryAreaDataType } from './columns';
import toast from 'react-hot-toast';

function parseTimestamp(ts: any): string {
  if (!ts) return '';
  if (ts._seconds) return new Date(ts._seconds * 1000).toISOString();
  return new Date(ts).toISOString();
}

export default function DeliveryAreaTable() {
  const [loading, setLoading] = useState(true);

  const { table, setData } = useTanStackTable<DeliveryAreaDataType>({
    tableData: [],
    columnConfig: deliveryAreaColumns,
    options: {
      initialState: {
        pagination: {
          pageIndex: 0,
          pageSize: 10,
        },
      },
      meta: {
        handleDeleteRow: async (row: DeliveryAreaDataType) => {
          try {
            const res = await fetch(`/api/delivery-areas/${row.id}`, {
              method: 'DELETE',
            });
            if (res.ok) {
              setData((prev) => prev.filter((r) => r.id !== row.id));
              toast.success('Delivery area deleted successfully');
            } else {
              toast.error('Failed to delete delivery area');
            }
          } catch {
            toast.error('Failed to delete delivery area');
          }
        },
        handleStatusChange: async (row: DeliveryAreaDataType, newStatus: string) => {
          try {
            const res = await fetch(`/api/delivery-areas/${row.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
              setData((prev) =>
                prev.map((r) =>
                  r.id === row.id ? { ...r, status: newStatus } : r
                )
              );
              toast.success(`Status changed to ${newStatus}`);
            } else {
              toast.error('Failed to update status');
            }
          } catch {
            toast.error('Failed to update status');
          }
        },
      },
      enableColumnResizing: false,
    },
  });

  useEffect(() => {
    const fetchDeliveryAreas = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/delivery-areas?limit=10000');
        if (!res.ok) throw new Error('Failed to fetch');
        const json = await res.json();
        const items = Array.isArray(json?.data) ? json.data : [];

        const transformed: DeliveryAreaDataType[] = items.map((area: any) => ({
          id: area.id,
          name: area.name || '',
          price: area.price || 0,
          isDefault: area.isDefault || false,
          status: area.status || 'ACTIVE',
          createdAt: parseTimestamp(area.createdAt),
        }));

        setData(transformed);
      } catch {
        toast.error('Failed to load delivery areas');
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveryAreas();
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
