'use client';

import DeletePopover from '@core/components/delete-popover';
import { getRatings } from '@core/components/table-utils/get-ratings';
import { getStatusBadge } from '@core/components/table-utils/get-status-badge';
import { routes } from '@/config/routes';
import { ProductType } from '@/data/products-data';
import EyeIcon from '@core/components/icons/eye';
import PencilIcon from '@core/components/icons/pencil';
import AvatarCard from '@core/ui/avatar-card';
import { createColumnHelper } from '@tanstack/react-table';
import Link from 'next/link';
import { ActionIcon, Checkbox, Flex, Text, Tooltip } from 'rizzui';
import { PiStorefront } from 'react-icons/pi';

const columnHelper = createColumnHelper<ProductType>();

export const productsListColumns = [
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
  columnHelper.accessor('name', {
    id: 'name',
    size: 300,
    header: 'Product',
    enableSorting: false,
    cell: ({ row }) => {
      const name = row.original?.name || 'Unknown Product';
      const image = row.original?.image || 'https://placehold.co/600x400.png';
      const category = row.original?.category || 'Uncategorized';

      return (
        <AvatarCard
          src={image}
          name={name}
          description={category}
          avatarProps={{
            name: name,
            size: 'lg',
            className: 'rounded-lg',
          }}
        />
      );
    },
  }),
  columnHelper.accessor('sku', {
    id: 'sku',
    size: 150,
    header: 'SKU',
    cell: ({ row }) => (
      <Text className="text-sm font-medium">{row.original?.sku || 'N/A'}</Text>
    ),
  }),
  columnHelper.accessor('stock', {
    id: 'stock',
    size: 150,
    header: 'Stock',
    cell: ({ row }) => {
      const stock = row.original?.stock || 0;
      let color = 'text-green-600 bg-green-50';
      let label = 'In Stock';
      if (stock === 0) {
        color = 'text-red-600 bg-red-50';
        label = 'Out of Stock';
      } else if (stock <= 20) {
        color = 'text-orange-600 bg-orange-50';
        label = 'Low Stock';
      }
      return (
        <div className="flex flex-col">
          <Text className="font-medium text-gray-700">{stock}</Text>
          <span className={`mt-0.5 inline-block w-fit rounded px-1.5 py-0.5 text-[11px] font-medium ${color}`}>
            {label}
          </span>
        </div>
      );
    },
  }),
  columnHelper.accessor('price', {
    id: 'price',
    size: 150,
    header: 'Price',
    cell: ({ row }) => (
      <Text className="font-medium text-gray-700">৳{row.original?.price || 0}</Text>
    ),
  }),
  columnHelper.display({
    id: 'rating',
    size: 200,
    header: 'Rating',
    cell: ({ row }) => getRatings((row.original?.rating || 5) as any),
  }),
  columnHelper.accessor('status', {
    id: 'status',
    size: 120,
    header: 'Status',
    enableSorting: false,
    cell: ({ row }) => getStatusBadge(row.original?.status || 'DRAFT'),
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
      <Flex align="center" justify="end" gap="3" className="pe-4">
        <Tooltip
          size="sm"
          content={'View on Storefront'}
          placement="top"
          color="invert"
        >
          <Link
            href={`${process.env.NEXT_PUBLIC_SHOKHERSHOP_URL}/product-detail/${row.original?.id || ''}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ActionIcon
              as="span"
              size="sm"
              variant="outline"
              aria-label={'View on Storefront'}
            >
              <PiStorefront className="h-4 w-4" />
            </ActionIcon>
          </Link>
        </Tooltip>
        <Tooltip
          size="sm"
          content={'Edit Product'}
          placement="top"
          color="invert"
        >
          <Link href={routes.eCommerce.editProduct(row.original?.id || '')}>
            <ActionIcon
              as="span"
              size="sm"
              variant="outline"
              aria-label={'Edit Product'}
            >
              <PencilIcon className="h-4 w-4" />
            </ActionIcon>
          </Link>
        </Tooltip>
        <DeletePopover
          title={`Delete the product`}
          description={`Are you sure you want to delete this #${row.original?.id || 'N/A'} product?`}
          onDelete={() =>
            meta?.handleDeleteRow && meta?.handleDeleteRow(row.original)
          }
        />
      </Flex>
    ),
  }),
];
