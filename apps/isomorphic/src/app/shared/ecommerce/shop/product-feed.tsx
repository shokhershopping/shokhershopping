'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button, Empty, Input } from 'rizzui';
import ProductModernCard from '@core/components/cards/product-modern-card';
import { routes } from '@/config/routes';
import { PiMagnifyingGlassBold } from 'react-icons/pi';

const LIMIT = 12;

function transformProduct(p: any) {
  return {
    id: p.id,
    slug: p.id,
    title: p.name || 'Untitled',
    description: p.description || '',
    price: p.price || 0,
    sale_price: p.salePrice || undefined,
    thumbnail:
      p.imageUrls?.[0] ||
      'https://isomorphic-furyroad.s3.amazonaws.com/public/products/modern/1.webp',
  };
}

export default function ProductFeed() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const fetchProducts = useCallback(
    async (pageNum: number, append = false) => {
      try {
        const params = new URLSearchParams({
          page: String(pageNum),
          limit: String(LIMIT),
          status: 'PUBLISHED',
        });
        if (search) params.set('search', search);

        const res = await fetch(`/api/products?${params}`);
        const data = await res.json();

        if (data.status === 'success' && Array.isArray(data.data)) {
          const transformed = data.data.map(transformProduct);
          setProducts((prev) => (append ? [...prev, ...transformed] : transformed));
          setTotal(data.total || 0);
          setHasMore(
            data.data.length >= LIMIT &&
              (append
                ? products.length + data.data.length < (data.total || 0)
                : data.data.length < (data.total || 0))
          );
        } else {
          if (!append) setProducts([]);
          setHasMore(false);
        }
      } catch {
        if (!append) setProducts([]);
        setHasMore(false);
      }
    },
    [search, products.length]
  );

  // Initial load + when search changes
  useEffect(() => {
    setIsLoading(true);
    setPage(1);
    fetchProducts(1, false).finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleLoadMore = async () => {
    const nextPage = page + 1;
    setIsLoadingMore(true);
    await fetchProducts(nextPage, true);
    setPage(nextPage);
    setIsLoadingMore(false);
  };

  const handleSearch = () => {
    setSearch(searchInput.trim());
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="@container">
        <div className="mb-6 flex items-center gap-3">
          <Input
            placeholder="Search products..."
            disabled
            className="max-w-sm"
          />
        </div>
        <div className="grid grid-cols-1 gap-x-5 gap-y-6 @md:grid-cols-[repeat(auto-fill,minmax(250px,1fr))] @xl:gap-x-7 @xl:gap-y-9 @4xl:grid-cols-[repeat(auto-fill,minmax(300px,1fr))]">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[4/5.06] w-full rounded-lg bg-gray-200" />
              <div className="mt-3 h-4 w-3/4 rounded bg-gray-200" />
              <div className="mt-2 h-3 w-1/2 rounded bg-gray-200" />
              <div className="mt-2 h-4 w-1/4 rounded bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="@container">
      {/* Search Bar */}
      <div className="mb-6 flex items-center gap-3">
        <Input
          placeholder="Search products..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="max-w-sm"
          prefix={<PiMagnifyingGlassBold className="h-4 w-4 text-gray-500" />}
        />
        <Button onClick={handleSearch} variant="outline">
          Search
        </Button>
        {search && (
          <Button
            variant="text"
            onClick={() => {
              setSearchInput('');
              setSearch('');
            }}
          >
            Clear
          </Button>
        )}
        <span className="ml-auto text-sm text-gray-500">
          {total} product{total !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Product Grid */}
      {products.length === 0 ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <Empty
            text={search ? `No products found for "${search}"` : 'No products found'}
            textClassName="text-base"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-x-5 gap-y-6 @md:grid-cols-[repeat(auto-fill,minmax(250px,1fr))] @xl:gap-x-7 @xl:gap-y-9 @4xl:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] @6xl:grid-cols-[repeat(auto-fill,minmax(364px,1fr))]">
          {products.map((product) => (
            <ProductModernCard
              key={product.id}
              product={product}
              routes={routes}
            />
          ))}
        </div>
      )}

      {/* Load More */}
      {hasMore && products.length > 0 && (
        <div className="mb-4 mt-5 flex flex-col items-center xs:pt-6 sm:pt-8">
          <Button isLoading={isLoadingMore} onClick={handleLoadMore}>
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}
