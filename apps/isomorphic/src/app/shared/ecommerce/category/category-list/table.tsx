'use client';

import { categories } from '@/data/product-categories';
import Table from '@core/components/table';
import { useTanStackTable } from '@core/components/table/custom/use-TanStack-Table';
import { categoriesColumns } from './columns';
import TableFooter from '@core/components/table/footer';
import TablePagination from '@core/components/table/pagination';
import Filters from './filters';
import { useEffect, useState } from 'react';

export type CategoryDataType = (typeof categories)[number];

export default function CategoryTable() {
  const { table, setData } = useTanStackTable<CategoryDataType>({
    tableData: categories,
    columnConfig: categoriesColumns,
    options: {
      initialState: {
        pagination: {
          pageIndex: 0,
          pageSize: 10,
        },
      },
      meta: {
        handleDeleteRow: (row) => {
          setData((prev) => prev.filter((r) => r.id !== row.id));
        },
        handleMultipleDelete: (rows) => {
          setData((prev) => prev.filter((r) => !rows.includes(r)));
        },
      },
      enableColumnResizing: false,
    },
  });

  useEffect(() => {
    // Simulate fetching categories from an API
    const fetchCategories = async () => {
      // Replace this with your actual API call
      const res = await fetch(
        `/api/categories?limit=10000`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      if (!res.ok) {
        throw new Error('Failed to fetch categories');
      }

      const data: any = await res.json();

      setData(
        data.data.map((cat: any) => ({
          id: cat.id,
          image: cat.image?.url || cat.image?.path || 'https://placehold.co/600x400.png',
          name: cat.name,
          description: cat.description,
          isFeatured: cat.isFeatured ?? false,
          isSlide: cat.isSlide ?? false,
          isMenu: cat.isMenu ?? false,
          products: cat.products.length ?? 0,
        }))
      );
    };
    fetchCategories();
  }, [setData]);

  return (
    <>
      <Filters table={table} />
      <Table
        table={table}
        variant="modern"
        classNames={{
          container: 'border border-muted rounded-md',
          rowClassName: 'last:border-0',
        }}
      />
      <TableFooter table={table} />
      <TablePagination table={table} className="py-4" />
    </>
  );
}
