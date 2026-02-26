'use client';

import { routes } from '@/config/routes';
import TableRowActionGroup from '@core/components/table-utils/table-row-action-group';
import DateCell from '@core/ui/date-cell';
import { createColumnHelper } from '@tanstack/react-table';
import { Badge, Select, Text } from 'rizzui';

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

const statusOptions = [
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Expired', value: 'EXPIRED' },
  { label: 'Blocked', value: 'BLOCKED' },
];

function getStatusColor(status: string) {
  switch (status) {
    case 'ACTIVE':
      return 'success';
    case 'EXPIRED':
      return 'danger';
    case 'BLOCKED':
      return 'warning';
    default:
      return 'secondary';
  }
}

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
    size: 160,
    header: 'Status',
    enableSorting: false,
    cell: ({
      row,
      table: {
        options: { meta },
      },
    }) => (
      <Select
        size="sm"
        options={statusOptions}
        value={statusOptions.find((o) => o.value === row.original.status)}
        onChange={(option: any) => {
          if (option?.value && option.value !== row.original.status) {
            meta?.handleStatusChange?.(row.original, option.value);
          }
        }}
        selectClassName="min-w-[120px]"
        suffix={
          <Badge
            size="sm"
            renderAsDot
            color={getStatusColor(row.original.status) as any}
            className="me-1.5"
          />
        }
      />
    ),
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
