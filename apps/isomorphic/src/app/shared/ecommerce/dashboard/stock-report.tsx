'use client';

import { useEffect, useState } from 'react';
import { useFirebaseAuth } from '@/lib/firebase-auth-provider';
import Image from 'next/image';
import WidgetCard from '@core/components/cards/widget-card';
import cn from '@core/utils/class-names';
import { Input, Badge } from 'rizzui';
import { PiMagnifyingGlassBold } from 'react-icons/pi';
import { getStockReport } from '@/lib/dashboard-api';
import type { StockReportProduct } from '@/types/dashboard';

export default function StockReport({ className }: { className?: string }) {
  const { getToken } = useFirebaseAuth();
  const [products, setProducts] = useState<StockReportProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchStockReport() {
      try {
        setLoading(true);
        const token = await getToken();
        const response = await getStockReport({
          page,
          limit: 5,
          threshold: 10,
        }, token);
        setProducts(response.data);
        setTotalPages(response.totalPages || 1);
        setError(null);
      } catch (err) {
        console.error('Error fetching stock report:', err);
        setError('Failed to load stock report');
      } finally {
        setLoading(false);
      }
    }

    fetchStockReport();
  }, [page, getToken]);

  const filteredProducts = searchTerm
    ? products.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : products;
  return (
    <WidgetCard
      title="Stock Report"
      className={cn('p-0 lg:p-0', className)}
      headerClassName="mb-6 px-5 pt-5 lg:px-7 lg:pt-7"
      action={
        <Input
          type="search"
          clearable={true}
          inputClassName="h-[36px]"
          placeholder="Search products..."
          onClear={() => setSearchTerm('')}
          value={searchTerm}
          prefix={<PiMagnifyingGlassBold className="size-4" />}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full @3xl:order-3 @3xl:ms-auto @3xl:max-w-72"
        />
      }
    >
      {loading ? (
        <div className="flex items-center justify-center h-[400px]">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-[400px]">
          <p className="text-red-600">{error}</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="flex items-center justify-center h-[400px]">
          <p className="text-gray-500">
            {searchTerm ? 'No products found' : 'All products are well stocked'}
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProducts.map((product) => {
                  const imageUrl = product.thumbnail?.startsWith('http')
                    ? product.thumbnail
                    : product.thumbnail || '/placeholder.png';

                  return (
                    <tr key={product.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 relative overflow-hidden rounded">
                            <Image
                              src={imageUrl}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{product.stock}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge
                          color={product.status === 'PUBLISHED' ? 'success' : 'warning'}
                          variant="flat"
                        >
                          {product.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ৳{new Intl.NumberFormat('en-US').format(product.salePrice || product.price)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </>
      )}
    </WidgetCard>
  );
}
