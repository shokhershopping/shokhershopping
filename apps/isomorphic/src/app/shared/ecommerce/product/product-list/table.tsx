'use client';

import Table from '@core/components/table';
import { useTanStackTable } from '@core/components/table/custom/use-TanStack-Table';
import TablePagination from '@core/components/table/pagination';
import { productsListColumns } from './columns';
import { stockViewColumns } from './stock-view-columns';
import Filters, { ViewMode } from './filters';
import { transformToStockView } from './transform-stock-data';
import TableFooter from '@core/components/table/footer';
import { TableClassNameProps } from '@core/components/table/table-types';
import cn from '@core/utils/class-names';
import { exportToCSV } from '@core/utils/export-to-csv';
import toast from 'react-hot-toast';
import { useState, useMemo, useEffect } from 'react';

export default function ProductsTable({
  pageSize = 5,
  hideFilters = false,
  hidePagination = false,
  hideFooter = false,
  classNames = {
    container: 'border border-muted rounded-md',
    rowClassName: 'last:border-0',
  },
  paginationClassName,
  productsData = [],
}: {
  pageSize?: number;
  hideFilters?: boolean;
  hidePagination?: boolean;
  hideFooter?: boolean;
  classNames?: TableClassNameProps;
  paginationClassName?: string;
  productsData?: any;
}) {
  const [viewMode, setViewMode] = useState<ViewMode>('product');

  // Transform data based on view mode
  const tableData = useMemo(() => {
    console.log('🔄 TableData memo - viewMode:', viewMode);
    if (viewMode === 'stock') {
      const stockData = transformToStockView(productsData);
      console.log('📊 Stock view data generated:', stockData.length, 'rows');
      return stockData;
    }
    console.log('📋 Product view data:', productsData.length, 'products');
    return productsData;
  }, [productsData, viewMode]);

  // Select columns based on view mode
  const columnConfig = useMemo(() => {
    return viewMode === 'stock' ? stockViewColumns : productsListColumns;
  }, [viewMode]);

  const { table, setData } = useTanStackTable<any>({
    tableData,
    columnConfig,
    options: {
      initialState: {
        pagination: {
          pageIndex: 0,
          pageSize: pageSize,
        },
      },
      meta: {
        handleDeleteRow:
          viewMode === 'product'
            ? async (row) => {
                try {
                  const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/products/${row.id}`,
                    {
                      method: 'DELETE',
                    }
                  );

                  if (!response.ok) {
                    throw new Error('Failed to delete product');
                  }

                  setData((prev) => prev.filter((r) => r.id !== row.id));
                  table.resetRowSelection();
                  toast.success('Product deleted successfully');
                } catch (error) {
                  toast.error('Failed to delete product');
                  console.error('Delete error:', error);
                }
              }
            : undefined,
        handleMultipleDelete:
          viewMode === 'product'
            ? async (rows) => {
                try {
                  const deletePromises = rows.map((row: any) =>
                    fetch(
                      `${process.env.NEXT_PUBLIC_API_URL}/products/${row.id}`,
                      {
                        method: 'DELETE',
                      }
                    )
                  );

                  const results = await Promise.all(deletePromises);
                  const failedDeletes = results.filter((res: Response) => !res.ok);

                  if (failedDeletes.length > 0) {
                    throw new Error(
                      `Failed to delete ${failedDeletes.length} product(s)`
                    );
                  }

                  setData((prev) => prev.filter((r) => !rows.includes(r)));
                  table.resetRowSelection();
                  toast.success(`${rows.length} product(s) deleted successfully`);
                } catch (error) {
                  toast.error('Failed to delete some products');
                  console.error('Bulk delete error:', error);
                }
              }
            : undefined,
      },
      enableColumnResizing: false,
    },
  });

  // Update table data when tableData changes (important for view mode switching)
  useEffect(() => {
    console.log('📌 Effect: Updating table data, length:', tableData.length);
    setData(tableData);
    table.resetRowSelection();
  }, [tableData, setData, table]);

  const selectedData = table
    .getSelectedRowModel()
    .rows.map((row) => row.original);

  function handleExportData() {
    exportToCSV(
      selectedData,
      'ID,Name,Category,Sku,Price,Stock,Status,Rating',
      `product_data_${selectedData.length}`
    );
  }

  return (
    <>
      {!hideFilters && (
        <Filters
          table={table}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
      )}
      <Table
        key={viewMode}
        table={table}
        variant="modern"
        classNames={classNames}
      />
      {!hideFooter && viewMode === 'product' && (
        <TableFooter table={table} onExport={handleExportData} />
      )}
      {!hidePagination && (
        <TablePagination
          table={table}
          className={cn('py-4', paginationClassName)}
        />
      )}
    </>
  );
}
