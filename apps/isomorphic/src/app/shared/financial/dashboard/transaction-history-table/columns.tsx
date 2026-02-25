'use client';

import AvatarCard from '@core/ui/avatar-card';
import DateCell from '@core/ui/date-cell';
import { createColumnHelper } from '@tanstack/react-table';
import { Badge, Checkbox, Text } from 'rizzui';

export interface TransactionData {
  id: string;
  orderId: string;
  customer: {
    name: string;
    email: string;
  };
  date: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  transactionStatus: string;
  orderStatus: string;
}

const columnHelper = createColumnHelper<TransactionData>();

const paymentMethodLabels: Record<string, string> = {
  COD: 'Cash on Delivery',
  BKASH: 'bKash',
  SSLCOMMERZ: 'SSLCommerz',
};

const orderStatusColors: Record<string, string> = {
  PENDING: 'before:bg-orange text-orange-dark',
  PROCESSING: 'before:bg-blue text-blue-dark',
  DISPATCHED: 'before:bg-indigo text-indigo-dark',
  DELIVERED: 'text-green-dark before:bg-green-dark',
  CANCELLED: 'text-red-dark before:bg-red-dark',
};

export const transactionHistoryColumns = [
  columnHelper.display({
    id: 'select',
    size: 50,
    header: ({ table }) => (
      <Checkbox
        className="ps-3.5"
        aria-label="Select all rows"
        checked={table.getIsAllPageRowsSelected()}
        onChange={() => table.toggleAllPageRowsSelected()}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        className="ps-3.5"
        aria-label="Select row"
        checked={row.getIsSelected()}
        onChange={() => row.toggleSelected()}
      />
    ),
  }),
  columnHelper.display({
    id: 'orderId',
    size: 130,
    header: 'Order ID',
    cell: ({ row }) => (
      <Text className="font-medium text-gray-700">
        #{row.original.orderId.slice(0, 8)}
      </Text>
    ),
  }),
  columnHelper.display({
    id: 'date',
    size: 180,
    header: 'Date',
    cell: ({ row }) => <DateCell date={new Date(row.original.date)} />,
  }),
  columnHelper.accessor('customer.name', {
    id: 'customer',
    size: 250,
    header: 'Customer',
    enableSorting: false,
    cell: ({ row }) => (
      <AvatarCard
        name={row.original.customer.name}
        description={row.original.customer.email}
      />
    ),
  }),
  columnHelper.accessor('amount', {
    id: 'amount',
    size: 120,
    header: 'Amount',
    enableSorting: true,
    cell: ({ row }) => (
      <span className="whitespace-nowrap font-semibold">
        ৳{row.original.amount.toLocaleString('bn-BD')}
      </span>
    ),
  }),
  columnHelper.display({
    id: 'currency',
    size: 80,
    header: 'Currency',
    cell: ({ row }) => (
      <Text className="font-medium">{row.original.currency}</Text>
    ),
  }),
  columnHelper.accessor('paymentMethod', {
    id: 'paymentMethod',
    size: 150,
    header: 'Payment Method',
    cell: ({ row }) => (
      <Badge variant="outline" className="font-medium">
        {paymentMethodLabels[row.original.paymentMethod] || row.original.paymentMethod}
      </Badge>
    ),
  }),
  columnHelper.accessor('orderStatus', {
    id: 'orderStatus',
    size: 130,
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.orderStatus;
      const colorClass = orderStatusColors[status] || 'text-gray-600 before:bg-gray-400';
      return (
        <span
          className={`inline-flex items-center gap-1.5 before:inline-block before:h-2 before:w-2 before:rounded-full ${colorClass}`}
        >
          <span className="capitalize">{status.toLowerCase()}</span>
        </span>
      );
    },
  }),
];
