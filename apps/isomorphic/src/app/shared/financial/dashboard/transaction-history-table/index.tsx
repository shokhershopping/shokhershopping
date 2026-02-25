'use client';

import { useEffect, useState, useCallback } from 'react';
import Table from '@core/components/table';
import { transactionHistoryColumns, type TransactionData } from './columns';
import WidgetCard from '@core/components/cards/widget-card';
import { useTanStackTable } from '@core/components/table/custom/use-TanStack-Table';
import TablePagination from '@core/components/table/pagination';
import cn from '@core/utils/class-names';
import Filters from './filters';
import { useFirebaseAuth } from '@/lib/firebase-auth-provider';
import { Text } from 'rizzui';

export type TransactionHistoryDataType = TransactionData;

export default function TransactionHistoryTable({
  className,
}: {
  className?: string;
}) {
  const { getToken } = useFirebaseAuth();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<TransactionData[]>([]);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const res = await fetch('/api/transactions?limit=100', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTransactions(data?.data || []);
      }
    } catch (error) {
      // silently handle error
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const { table, setData } = useTanStackTable<TransactionData>({
    tableData: transactions,
    columnConfig: transactionHistoryColumns,
    options: {
      initialState: {
        pagination: {
          pageIndex: 0,
          pageSize: 7,
        },
      },
      enableColumnResizing: false,
    },
  });

  // Update table data when transactions change
  useEffect(() => {
    setData(transactions);
  }, [transactions, setData]);

  return (
    <WidgetCard
      className={cn('p-0 lg:p-0', className)}
      actionClassName="w-full ps-0 items-center"
      headerClassName="mb-6 items-start flex-col @[57rem]:flex-row @[57rem]:items-center px-5 pt-5 lg:pt-7 lg:px-7"
      action={<Filters table={table} />}
    >
      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
        </div>
      ) : transactions.length === 0 ? (
        <div className="flex h-40 items-center justify-center">
          <Text className="text-gray-500">No transactions found. Transactions will appear here when orders are placed.</Text>
        </div>
      ) : (
        <>
          <Table table={table} variant="modern" />
          <TablePagination table={table} className="p-4" />
        </>
      )}
    </WidgetCard>
  );
}
