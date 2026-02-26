'use client';

import { useState } from 'react';
import { OrdersDataType } from '@/app/shared/ecommerce/dashboard/recent-order';
import { routes } from '@/config/routes';
import { getStatusBadge } from '@core/components/table-utils/get-status-badge';
import TableRowActionGroup from '@core/components/table-utils/table-row-action-group';
import TableAvatar from '@core/ui/avatar-card';
import DateCell from '@core/ui/date-cell';
import { createColumnHelper } from '@tanstack/react-table';
import { PiCaretDownBold, PiCaretUpBold, PiEyeBold } from 'react-icons/pi';
import { ActionIcon, Select, Text } from 'rizzui';
import Link from 'next/link';
import toast from 'react-hot-toast';

const ORDER_STATUSES = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'DISPATCHED', label: 'Dispatched' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

function OrderStatusCell({ orderId, currentStatus }: { orderId: string; currentStatus: string }) {
  const [status, setStatus] = useState(currentStatus);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === status) return;
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setStatus(newStatus);
        toast.success(`Order status updated to ${newStatus}`);
      } else {
        toast.error('Failed to update order status');
      }
    } catch {
      toast.error('Failed to update order status');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Select
      options={ORDER_STATUSES}
      value={status}
      onChange={handleStatusChange}
      size="sm"
      placeholder="Select status"
      disabled={isUpdating}
      getOptionValue={(option) => option.value}
      displayValue={(selected) =>
        ORDER_STATUSES.find((opt) => opt.value === selected)?.label || selected
      }
      dropdownClassName="z-[999]"
      className="min-w-[150px]"
      suffix={isUpdating ? <span className="animate-spin text-xs">...</span> : undefined}
    />
  );
}

const columnHelper = createColumnHelper<OrdersDataType>();

export const ordersColumns = (expanded: boolean = true) => {
  const columns = [
    columnHelper.display({
      id: 'id',
      size: 120,
      header: 'Order Id',
      cell: ({ row }) => <>#{row.original.id}</>,
    }),
    columnHelper.accessor('name', {
      id: 'customer',
      size: 300,
      header: 'Customer',
      enableSorting: false,
      cell: ({ row }) => (
        <TableAvatar
          src={row.original.avatar}
          name={row.original.name}
          description={(row.original.email || '').toLowerCase()}
        />
      ),
    }),
    columnHelper.display({
      id: 'items',
      size: 150,
      header: 'Items',
      cell: ({ row }) => (
        <Text className="font-medium text-gray-700">{row.original.items}</Text>
      ),
    }),
    columnHelper.accessor('price', {
      id: 'price',
      size: 150,
      header: 'Price',
      cell: ({ row }) => (
        <Text className="font-medium text-gray-700">৳{row.original.price}</Text>
      ),
    }),
    columnHelper.accessor('createdAt', {
      id: 'createdAt',
      size: 200,
      header: 'Created',
      cell: ({ row }) => <DateCell date={new Date(row.original.createdAt)} />,
    }),
    columnHelper.accessor('updatedAt', {
      id: 'updatedAt',
      size: 200,
      header: 'Modified',
      cell: ({ row }) => <DateCell date={new Date(row.original.updatedAt)} />,
    }),
    columnHelper.accessor('status', {
      id: 'status',
      size: 200,
      header: 'Order Status',
      enableSorting: false,
      cell: ({ row }) => (
        <OrderStatusCell
          orderId={row.original.id}
          currentStatus={row.original.status}
        />
      ),
    }),
    columnHelper.display({
      id: 'view',
      size: 80,
      header: 'View',
      cell: ({ row }) => (
        <Link href={routes.eCommerce.orderDetails(row.original.id)}>
          <ActionIcon
            size="sm"
            variant="outline"
            title="View Order Details"
            className="hover:bg-primary hover:text-white"
          >
            <PiEyeBold className="size-4" />
          </ActionIcon>
        </Link>
      ),
    }),
    columnHelper.display({
      id: 'action',
      size: 130,
      cell: ({
        row,
        table: {
          options: { meta },
        },
      }) => (
        <TableRowActionGroup
          editUrl={routes.eCommerce.editOrder(row.original.id)}
          deletePopoverTitle={`Delete the order`}
          deletePopoverDescription={`Are you sure you want to delete this #${row.original.id} order?`}
          onDelete={() => meta?.handleDeleteRow?.(row.original)}
        />
      ),
    }),
  ];

  return expanded ? [expandedOrdersColumns, ...columns] : columns;
};

const expandedOrdersColumns = columnHelper.display({
  id: 'expandedHandler',
  size: 60,
  cell: ({ row }) => (
    <>
      {row.getCanExpand() && (
        <ActionIcon
          size="sm"
          rounded="full"
          aria-label="Expand row"
          className="ms-2"
          variant={row.getIsExpanded() ? 'solid' : 'outline'}
          onClick={row.getToggleExpandedHandler()}
        >
          {row.getIsExpanded() ? (
            <PiCaretUpBold className="size-3.5" />
          ) : (
            <PiCaretDownBold className="size-3.5" />
          )}
        </ActionIcon>
      )}
    </>
  ),
});
