'use client';

import { useState, useEffect } from 'react';
import { ActionIcon, Title, Button } from 'rizzui';
import { useDrawer } from '@/app/shared/drawer-views/use-drawer';
import RatingFilter from '@/app/shared/ecommerce/shop/shop-filters/rating-filter';
import PriceFilter from '@/app/shared/ecommerce/shop/shop-filters/price-filter';
import { useFilterControls } from '@core/hooks/use-filter-control';
import { initialState } from '@/app/shared/ecommerce/shop/shop-filters/filter-utils';
import FilterWithSearch from '@core/components/filter-with-search';
import { PiXBold } from 'react-icons/pi';
import hasSearchedParams from '@core/utils/has-searched-params';

export default function ShopFilters() {
  const { state, applyFilter, clearFilter, reset } = useFilterControls<
    typeof initialState,
    any
  >(initialState);

  const { closeDrawer } = useDrawer();

  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/categories?limit=50')
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'success' && Array.isArray(data.data)) {
          setCategories(
            data.data.map((cat: any, i: number) => ({
              id: cat.id || i + 1,
              name: cat.name,
              count: cat.productCount || 0,
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  return (
    <>
      <div className="flex items-center justify-between border-b border-muted px-5 py-3.5">
        <Title as="h5" className="font-semibold">
          Filters
        </Title>
        <ActionIcon
          variant="outline"
          onClick={() => closeDrawer()}
          className="border-0 p-0"
        >
          <PiXBold className="h-auto w-5" />
        </ActionIcon>
      </div>

      <div className="custom-scrollbar h-[calc(100vh-136px)] space-y-9 overflow-y-auto px-5 py-6">
        <FilterWithSearch
          title="Category"
          name="categories"
          data={categories}
          state={state}
          applyFilter={applyFilter}
          clearFilter={clearFilter}
        />
        <PriceFilter state={state} applyFilter={applyFilter} />
        <RatingFilter state={state} applyFilter={applyFilter} />
      </div>

      <div className="flex h-16 flex-shrink-0 items-center justify-center gap-3 bg-white px-5 py-3 dark:bg-gray-100">
        {hasSearchedParams() ? (
          <Button
            size="lg"
            variant="outline"
            className="w-full"
            onClick={() => {
              reset();
              closeDrawer();
            }}
          >
            Reset All
          </Button>
        ) : null}
        <Button size="lg" onClick={() => closeDrawer()} className="w-full">
          Show results
        </Button>
      </div>
    </>
  );
}
