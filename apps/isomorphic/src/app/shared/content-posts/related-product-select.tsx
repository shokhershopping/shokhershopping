'use client';

import { KeyboardEvent, useEffect, useId, useRef, useState } from 'react';
import Image from 'next/image';
import {
  PiMagnifyingGlassBold,
  PiPackageDuotone,
  PiXBold,
} from 'react-icons/pi';
import { ActionIcon, FieldError, Input, Loader, Text, Tooltip } from 'rizzui';

interface ProductOption {
  id: string;
  name: string;
  imageUrl: string;
}

interface ProductRecord {
  id?: unknown;
  name?: unknown;
  title?: unknown;
  imageUrls?: unknown;
  imageUrl?: unknown;
  image?: unknown;
}

interface ProductApiResponse {
  message?: string;
  data?: unknown;
}

export interface RelatedProductSelectProps {
  value: string | null;
  onChange: (value: string | null) => void;
  error?: string;
  disabled?: boolean;
}

function toProductOption(record: ProductRecord): ProductOption | null {
  if (typeof record.id !== 'string') return null;

  const name =
    typeof record.name === 'string'
      ? record.name
      : typeof record.title === 'string'
        ? record.title
        : '';
  if (!name) return null;

  let imageUrl = '';
  if (
    Array.isArray(record.imageUrls) &&
    typeof record.imageUrls[0] === 'string'
  ) {
    imageUrl = record.imageUrls[0];
  } else if (typeof record.imageUrl === 'string') {
    imageUrl = record.imageUrl;
  } else if (
    record.image &&
    typeof record.image === 'object' &&
    'url' in record.image &&
    typeof record.image.url === 'string'
  ) {
    imageUrl = record.image.url;
  }

  return { id: record.id, name, imageUrl };
}

export default function RelatedProductSelect({
  value,
  onChange,
  error,
  disabled = false,
}: RelatedProductSelectProps) {
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<ProductOption | null>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ProductOption[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isHydrating, setIsHydrating] = useState(false);
  const [notice, setNotice] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  useEffect(() => {
    if (!value) {
      setSelected(null);
      setIsHydrating(false);
      return;
    }

    if (selected?.id === value) return;

    const controller = new AbortController();
    setIsHydrating(true);
    setNotice('');

    const hydrateProduct = async () => {
      try {
        const response = await fetch(
          `/api/products/${encodeURIComponent(value)}`,
          {
            signal: controller.signal,
          }
        );
        const payload = (await response.json()) as ProductApiResponse;
        const option =
          payload.data && typeof payload.data === 'object'
            ? toProductOption(payload.data as ProductRecord)
            : null;

        if (!response.ok || !option) {
          throw new Error(
            payload.message || 'The selected product is unavailable.'
          );
        }

        setSelected(option);
      } catch (caught) {
        if (controller.signal.aborted) return;
        setSelected(null);
        setNotice(
          caught instanceof Error
            ? caught.message
            : 'The selected product is unavailable.'
        );
      } finally {
        if (!controller.signal.aborted) setIsHydrating(false);
      }
    };

    void hydrateProduct();
    return () => controller.abort();
  }, [selected?.id, value]);

  useEffect(() => {
    const trimmedQuery = query.trim();
    if (!isOpen || value || trimmedQuery.length < 2) {
      setResults([]);
      setIsSearching(false);
      setActiveIndex(-1);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setIsSearching(true);
      setNotice('');

      try {
        const params = new URLSearchParams({
          q: trimmedQuery,
          page: '1',
          limit: '10',
        });
        const response = await fetch(`/api/products/search?${params}`, {
          signal: controller.signal,
        });
        const payload = (await response.json()) as ProductApiResponse;

        if (!response.ok) {
          throw new Error(payload.message || 'Product search is unavailable.');
        }

        const products = Array.isArray(payload.data) ? payload.data : [];
        setResults(
          products
            .map((product) => toProductOption(product as ProductRecord))
            .filter((product): product is ProductOption => product !== null)
        );
        setActiveIndex(-1);
      } catch (caught) {
        if (controller.signal.aborted) return;
        setResults([]);
        setNotice(
          caught instanceof Error
            ? `${caught.message} You can continue without a related product.`
            : 'Product search is unavailable. You can continue without a related product.'
        );
      } finally {
        if (!controller.signal.aborted) setIsSearching(false);
      }
    }, 350);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [isOpen, query, value]);

  const chooseProduct = (product: ProductOption) => {
    setSelected(product);
    setQuery('');
    setResults([]);
    setNotice('');
    setIsOpen(false);
    onChange(product.id);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || results.length === 0) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % results.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((current) =>
        current <= 0 ? results.length - 1 : current - 1
      );
    } else if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault();
      chooseProduct(results[activeIndex]);
    } else if (event.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      {value ? (
        <div>
          <Text className="mb-1.5 font-medium text-gray-700 dark:text-gray-600">
            Related product
          </Text>
          <div className="flex min-h-14 items-center gap-3 rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded bg-gray-100">
              {selected?.imageUrl ? (
                <Image
                  src={selected.imageUrl}
                  alt=""
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              ) : isHydrating ? (
                <Loader size="sm" />
              ) : (
                <PiPackageDuotone className="h-5 w-5 text-gray-500" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <Text className="truncate font-medium">
                {selected?.name ||
                  (isHydrating ? 'Loading product...' : 'Product unavailable')}
              </Text>
              {!selected && !isHydrating && (
                <Text className="truncate text-xs text-gray-500">{value}</Text>
              )}
            </div>
            <Tooltip content="Clear related product" placement="top">
              <ActionIcon
                type="button"
                variant="text"
                disabled={disabled}
                onClick={() => {
                  setSelected(null);
                  setNotice('');
                  onChange(null);
                }}
                aria-label="Clear related product"
              >
                <PiXBold className="h-4 w-4" />
              </ActionIcon>
            </Tooltip>
          </div>
        </div>
      ) : (
        <Input
          label="Related product"
          placeholder="Search published products"
          value={query}
          disabled={disabled}
          prefix={<PiMagnifyingGlassBold className="h-4 w-4" />}
          suffix={isSearching ? <Loader size="sm" /> : undefined}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          onFocus={() => setIsOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
        />
      )}

      {!value && isOpen && query.trim().length >= 2 && (
        <div
          id={listboxId}
          role="listbox"
          className="absolute z-20 mt-1 max-h-72 w-full overflow-y-auto rounded-md border border-gray-200 bg-gray-0 p-1 shadow-lg dark:border-gray-700 dark:bg-gray-50"
        >
          {!isSearching && results.length === 0 ? (
            <Text className="px-3 py-4 text-center text-sm text-gray-500">
              No published products found.
            </Text>
          ) : (
            results.map((product, index) => (
              <button
                key={product.id}
                type="button"
                role="option"
                aria-selected={activeIndex === index}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => chooseProduct(product)}
                className={`flex w-full items-center gap-3 rounded px-3 py-2 text-start transition ${
                  activeIndex === index
                    ? 'bg-gray-100 dark:bg-gray-200'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-200'
                }`}
              >
                <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded bg-gray-100">
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt=""
                      fill
                      sizes="36px"
                      className="object-cover"
                    />
                  ) : (
                    <PiPackageDuotone className="h-4 w-4 text-gray-500" />
                  )}
                </div>
                <span className="min-w-0 truncate text-sm font-medium">
                  {product.name}
                </span>
              </button>
            ))
          )}
        </div>
      )}

      {!value && query.trim().length > 0 && query.trim().length < 2 && (
        <Text className="mt-1 text-xs text-gray-500">
          Enter at least two characters to search.
        </Text>
      )}
      {notice && <Text className="mt-1 text-xs text-gray-500">{notice}</Text>}
      {error && <FieldError className="mt-1" error={error} />}
    </div>
  );
}
