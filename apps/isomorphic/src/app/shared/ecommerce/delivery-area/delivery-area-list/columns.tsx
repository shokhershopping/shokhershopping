'use client';

import { routes } from '@/config/routes';
import TableRowActionGroup from '@core/components/table-utils/table-row-action-group';
import { createColumnHelper } from '@tanstack/react-table';
import { Badge, Select, Text } from 'rizzui';

export type DeliveryAreaDataType = {
  id: string;
  name: string;
  price: number;
  isDefault: boolean;
  status: string;
  createdAt: string;
};

const statusOptions = [
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Inactive', value: 'INACTIVE' },
];

function getStatusColor(status: string) {
  switch (status) {
    case 'ACTIVE':
      return 'success';
    case 'INACTIVE':
      return 'danger';
    default:
      return 'secondary';
  }
}

const columnHelper = createColumnHelper<DeliveryAreaDataType>();

export const deliveryAreaColumns = [
  columnHelper.accessor('name', {
    id: 'name',
    size: 200,
    header: 'Area Name',
    cell: ({ row }) => (
      <Text className="font-semibold text-gray-700">{row.original.name}</Text>
    ),
  }),
  columnHelper.accessor('price', {
    id: 'price',
    size: 150,
    header: 'Delivery Price',
    cell: ({ row }) => (
      <Text className="font-medium text-gray-700">
        ৳{row.original.price}
      </Text>
    ),
  }),
  columnHelper.display({
    id: 'isDefault',
    size: 120,
    header: 'Default',
    cell: ({ row }) => (
      <Badge
        variant={row.original.isDefault ? 'solid' : 'outline'}
        color={row.original.isDefault ? 'success' : 'secondary'}
        className="font-medium"
      >
        {row.original.isDefault ? 'Yes' : 'No'}
      </Badge>
    ),
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
        editUrl={routes.eCommerce.editDeliveryArea(row.original.id)}
        deletePopoverTitle="Delete this delivery area"
        deletePopoverDescription={`Are you sure you want to delete "${row.original.name}"?`}
        onDelete={() => meta?.handleDeleteRow?.(row.original)}
      />
    ),
  }),
];
