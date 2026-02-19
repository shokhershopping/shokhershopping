'use client';

import DeletePopover from '@core/components/delete-popover';
import { routes } from '@/config/routes';
import PencilIcon from '@core/components/icons/pencil';
import { createColumnHelper } from '@tanstack/react-table';
import Image from 'next/image';
import Link from 'next/link';
import { ActionIcon, Badge, Checkbox, Text, Title, Tooltip } from 'rizzui';
import { CategoryDataType } from './table';

const columnHelper = createColumnHelper<CategoryDataType>();

export const categoriesColumns = [
  columnHelper.display({
    id: 'checked',
    size: 50,
    cell: ({ row }) => (
      <Checkbox
        aria-label="Select row"
        className="ps-3.5"
        checked={row.getIsSelected()}
        onChange={row.getToggleSelectedHandler()}
      />
    ),
  }),
  columnHelper.display({
    id: 'image',
    size: 100,
    header: 'Image',
    cell: ({ row }) => (
      <figure className="relative aspect-square w-12 overflow-hidden rounded-lg bg-gray-100">
        <Image
          alt={row.original.name}
          src={row.original.image}
          fill
          sizes="(max-width: 768px) 100vw"
          className="object-cover"
        />
      </figure>
    ),
  }),
  columnHelper.accessor('name', {
    id: 'name',
    size: 200,
    header: 'Category Name',
    cell: ({ getValue }) => (
      <Title as="h6" className="!text-sm font-medium">
        {getValue()}
      </Title>
    ),
  }),
  columnHelper.display({
    id: 'description',
    size: 250,
    header: 'Description',
    cell: ({ row }) => (
      <Text
        dangerouslySetInnerHTML={{
          __html: row.original.description
            .replace(/<[^>]+>/g, '')
            .slice(0, 50)
            .concat('...'),
        }}
        className="truncate !text-sm"
      ></Text>
    ),
  }),
  columnHelper.accessor('isFeatured', {
    id: 'isFeatured',
    size: 120,
    header: 'Featured',
    cell: ({ getValue }) => (
      <Badge variant={getValue() ? 'flat' : 'outline'} color={getValue() ? 'success' : 'secondary'}>
        {getValue() ? 'Yes' : 'No'}
      </Badge>
    ),
  }),
  columnHelper.accessor('isSlide', {
    id: 'isSlide',
    size: 120,
    header: 'Slider',
    cell: ({ getValue }) => (
      <Badge variant={getValue() ? 'flat' : 'outline'} color={getValue() ? 'success' : 'secondary'}>
        {getValue() ? 'Yes' : 'No'}
      </Badge>
    ),
  }),
  columnHelper.accessor('isMenu', {
    id: 'isMenu',
    size: 120,
    header: 'Menu',
    cell: ({ getValue }) => (
      <Badge variant={getValue() ? 'flat' : 'outline'} color={getValue() ? 'success' : 'secondary'}>
        {getValue() ? 'Yes' : 'No'}
      </Badge>
    ),
  }),
  columnHelper.display({
    id: 'products',
    size: 120,
    header: 'Products',
    cell: ({ row }) => <div className="ps-6">{row.original.products}</div>,
  }),
  columnHelper.display({
    id: 'action',
    size: 100,
    cell: ({
      row,
      table: {
        options: { meta },
      },
    }) => (
      <div className="flex items-center justify-end gap-3 pe-4">
        <Tooltip content={'Edit Category'} placement="top" color="invert">
          <Link href={routes.eCommerce.editCategory(row.original.id)}>
            <ActionIcon size="sm" variant="outline">
              <PencilIcon className="h-4 w-4" />
            </ActionIcon>
          </Link>
        </Tooltip>
        <DeletePopover
          title={`Delete the category`}
          description={`Are you sure you want to delete this ${row.original.name} category?`}
          onDelete={async () => {
            const res = await fetch(
              `/api/categories/${row.original.id}`,
              {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                },
              }
            );
            if (!res.ok) {
              throw new Error('Failed to delete category');
            }
            const data = await res.json();
            console.log(data);
            meta?.handleDeleteRow?.(row.original);
          }}
        />
      </div>
    ),
  }),
];
