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
    if (viewMode === 'stock') {
      const stockData = transformToStockView(productsData);
      return stockData;
    }
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
                    `/api/products/${row.id}`,
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
                }
              }
            : undefined,
        handleMultipleDelete:
          viewMode === 'product'
            ? async (rows) => {
                try {
                  // Normalize: rows can be an array of objects ({id}) or an array of ID strings
                  const ids = rows.map((row: any) =>
                    typeof row === 'string' ? row : row.id
                  ).filter(Boolean);

                  if (ids.length === 0) {
                    toast.error('No valid products to delete');
                    return;
                  }

                  const deletePromises = ids.map((id: string) =>
                    fetch(`/api/products/${id}`, { method: 'DELETE' })
                  );

                  const results = await Promise.all(deletePromises);
                  const failedDeletes = results.filter((res: Response) => !res.ok);

                  if (failedDeletes.length > 0) {
                    throw new Error(
                      `Failed to delete ${failedDeletes.length} product(s)`
                    );
                  }

                  const idSet = new Set(ids);
                  setData((prev) => prev.filter((r) => !idSet.has(r.id)));
                  table.resetRowSelection();
                  toast.success(`${ids.length} product(s) deleted successfully`);
                } catch (error) {
                  toast.error('Failed to delete some products');
                }
              }
            : undefined,
      },
      enableColumnResizing: false,
    },
  });

  // Update table data when tableData changes (important for view mode switching)
  useEffect(() => {
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
