'use client';

import { routes } from '@/config/routes';
import { getStatusBadge } from '@core/components/table-utils/get-status-badge';
import TableRowActionGroup from '@core/components/table-utils/table-row-action-group';
import DateCell from '@core/ui/date-cell';
import { createColumnHelper } from '@tanstack/react-table';
import { Badge, Text } from 'rizzui';

export type CouponDataType = {
  id: string;
  code: string;
  description: string;
  type: string;
  amount: number;
  minimum: number;
  maximum: number;
  used: number;
  limit: number;
  status: string;
  expiry: string;
  createdAt: string;
};

const columnHelper = createColumnHelper<CouponDataType>();

export const couponColumns = [
  columnHelper.accessor('code', {
    id: 'code',
    size: 180,
    header: 'Code',
    cell: ({ row }) => (
      <Text className="font-semibold text-gray-700">{row.original.code}</Text>
    ),
  }),
  columnHelper.accessor('description', {
    id: 'description',
    size: 250,
    header: 'Description',
    enableSorting: false,
    cell: ({ row }) => (
      <Text className="text-gray-500 truncate max-w-[200px]">
        {row.original.description || '-'}
      </Text>
    ),
  }),
  columnHelper.accessor('type', {
    id: 'type',
    size: 130,
    header: 'Type',
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className="font-medium"
        color={row.original.type === 'PERCENTAGE' ? 'info' : 'success'}
      >
        {row.original.type === 'PERCENTAGE' ? 'Percentage' : 'Fixed'}
      </Badge>
    ),
  }),
  columnHelper.accessor('amount', {
    id: 'amount',
    size: 120,
    header: 'Amount',
    cell: ({ row }) => (
      <Text className="font-medium text-gray-700">
        {row.original.type === 'PERCENTAGE'
          ? `${row.original.amount}%`
          : `৳${row.original.amount}`}
      </Text>
    ),
  }),
  columnHelper.display({
    id: 'usage',
    size: 120,
    header: 'Usage',
    cell: ({ row }) => (
      <Text className="text-gray-600">
        {row.original.used} / {row.original.limit || '∞'}
      </Text>
    ),
  }),
  columnHelper.display({
    id: 'minMax',
    size: 150,
    header: 'Min / Max',
    cell: ({ row }) => (
      <Text className="text-gray-600">
        ৳{row.original.minimum} / {row.original.maximum ? `৳${row.original.maximum}` : '∞'}
      </Text>
    ),
  }),
  columnHelper.accessor('expiry', {
    id: 'expiry',
    size: 150,
    header: 'Expiry',
    cell: ({ row }) => {
      const expiry = row.original.expiry;
      if (!expiry) return <Text className="text-gray-400">-</Text>;
      return <DateCell date={new Date(expiry)} />;
    },
  }),
  columnHelper.accessor('status', {
    id: 'status',
    size: 120,
    header: 'Status',
    enableSorting: false,
    cell: ({ row }) => getStatusBadge(row.original.status),
  }),
  columnHelper.display({
    id: 'action',
    size: 120,
    cell: ({
      row,
      table: {
        options: { meta },
      },
    }) => (
      <TableRowActionGroup
        editUrl={routes.eCommerce.editCoupon(row.original.id)}
        deletePopoverTitle="Delete this coupon"
        deletePopoverDescription={`Are you sure you want to delete coupon "${row.original.code}"?`}
        onDelete={() => meta?.handleDeleteRow?.(row.original)}
      />
    ),
  }),
];
