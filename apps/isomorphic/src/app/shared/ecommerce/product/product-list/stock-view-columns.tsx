'use client';

import AvatarCard from '@core/ui/avatar-card';
import { createColumnHelper } from '@tanstack/react-table';
import { Text, Badge } from 'rizzui';
import { StockViewRow, ALL_SIZES } from './transform-stock-data';
import cn from '@core/utils/class-names';

const columnHelper = createColumnHelper<StockViewRow>();

// Helper to render stock count with color coding
function StockCell({ stock, isTotal = false }: { stock?: number; isTotal?: boolean }) {
  if (stock === undefined || stock === null) {
    return <Text className="text-center text-sm text-gray-400">-</Text>;
  }

  const stockValue = stock || 0;

  // Color coding based on stock level
  let colorClass = 'text-gray-700';
  let bgClass = '';

  if (stockValue === 0) {
    colorClass = 'text-red-600';
    bgClass = 'bg-red-50';
  } else if (stockValue < 10) {
    colorClass = 'text-orange-600';
    bgClass = 'bg-orange-50';
  } else if (stockValue < 50) {
    colorClass = 'text-yellow-600';
    bgClass = 'bg-yellow-50';
  } else {
    colorClass = 'text-green-600';
    bgClass = 'bg-green-50';
  }

  return (
    <div className="flex justify-center">
      <Text
        className={cn(
          'text-center font-medium',
          isTotal ? 'text-base' : 'text-sm',
          colorClass,
          bgClass,
          'rounded px-2 py-1'
        )}
      >
        {stockValue}
      </Text>
    </div>
  );
}

const sizeColumns = ALL_SIZES.map((size) =>
  columnHelper.display({
    id: `size-${size}`,
    size: 80,
    header: () => (
      <Text className="text-center font-semibold text-gray-700">{size}</Text>
    ),
    cell: ({ row }) => {
      const stock = row.original?.stockBySize?.[size];
      // Only show stock for products with variants
      if (!row.original?.hasVariants) {
        return <Text className="text-center text-sm text-gray-400">-</Text>;
      }
      return <StockCell stock={stock} />;
    },
  })
);

console.log('📏 Size columns created:', sizeColumns.length, 'columns for sizes:', ALL_SIZES);

export const stockViewColumns = [
  columnHelper.accessor('productName', {
    id: 'product',
    size: 250,
    header: 'Product',
    enableSorting: true,
    cell: ({ row }) => {
      const productName = row.original?.productName || 'Unknown Product';
      const productImage = row.original?.productImage || 'https://placehold.co/600x400.png';
      const color = row.original?.color || 'N/A';

      return (
        <AvatarCard
          src={productImage}
          name={productName}
          description={color}
          avatarProps={{
            name: productName,
            size: 'lg',
            className: 'rounded-lg',
          }}
        />
      );
    },
  }),
  columnHelper.accessor('color', {
    id: 'color',
    size: 150,
    header: 'Color/Variant',
    enableSorting: true,
    cell: ({ row }) => {
      const color = row.original?.color || 'N/A';
      const isBaseProduct = color === 'Base Product';
      return (
        <Badge
          variant={isBaseProduct ? 'outline' : 'flat'}
          color={isBaseProduct ? 'secondary' : 'primary'}
          className="font-medium"
        >
          {color}
        </Badge>
      );
    },
  }),
  // Dynamic size columns
  ...sizeColumns,
  columnHelper.accessor('totalStock', {
    id: 'totalStock',
    size: 120,
    header: () => (
      <Text className="text-center font-semibold text-gray-900">Total Stock</Text>
    ),
    enableSorting: true,
    cell: ({ row }) => <StockCell stock={row.original?.totalStock || 0} isTotal />,
  }),
];
