'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import DeletePopover from '@core/components/delete-popover';
import PencilIcon from '@core/components/icons/pencil';
import Table from '@core/components/table';
import TablePagination from '@core/components/table/pagination';
import DateCell from '@core/ui/date-cell';
import {
  createColumnHelper,
  getCoreRowModel,
  type PaginationState,
  useReactTable,
} from '@tanstack/react-table';
import type { ContentPostDTO } from 'firebase-config/types/content-post.types';
import toast from 'react-hot-toast';
import {
  ActionIcon,
  Avatar,
  Badge,
  Button,
  Empty,
  Flex,
  Input,
  Select,
  type SelectOption,
  Text,
  Tooltip,
} from 'rizzui';
import { PiArrowClockwiseBold, PiMagnifyingGlassBold } from 'react-icons/pi';
import { api } from '@/config/api';
import { routes } from '@/config/routes';
import { useFirebaseAuth } from '@/lib/firebase-auth-provider';

const CONTENT_POSTS_ENDPOINT = `/api${api.contentPost.list}`;
const DEFAULT_PAGE_SIZE = 10;

const statusOptions = [
  { label: 'All statuses', value: '' },
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Published', value: 'PUBLISHED' },
  { label: 'Archived', value: 'ARCHIVED' },
];

interface ContentPostsResponse {
  status: string;
  message: string;
  data: ContentPostDTO[] | null;
  total?: number;
  totalPages?: number;
  page?: number;
  limit?: number;
}

function useDebouncedValue<T>(value: T, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedValue(value), delay);
    return () => window.clearTimeout(timeout);
  }, [delay, value]);

  return debouncedValue;
}

function PostDate({
  value,
  emptyLabel = 'Not published',
}: {
  value: string | null;
  emptyLabel?: string;
}) {
  if (!value) {
    return <Text className="text-sm text-gray-500">{emptyLabel}</Text>;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return <Text className="text-sm text-gray-500">Unavailable</Text>;
  }

  return <DateCell date={date} dateFormat="MMM D, YYYY" />;
}

function ContentPostStatus({ status }: { status: ContentPostDTO['status'] }) {
  const styles = {
    DRAFT: { dot: 'bg-gray-500', text: 'text-gray-600', label: 'Draft' },
    PUBLISHED: {
      dot: 'bg-green-dark',
      text: 'text-green-dark',
      label: 'Published',
    },
    ARCHIVED: {
      dot: 'bg-orange-dark',
      text: 'text-orange-dark',
      label: 'Archived',
    },
  }[status];

  return (
    <Flex align="center" gap="2" className="w-auto">
      <Badge renderAsDot className={styles.dot} />
      <Text className={`font-medium ${styles.text}`}>{styles.label}</Text>
    </Flex>
  );
}

const columnHelper = createColumnHelper<ContentPostDTO>();

export default function ContentPostList() {
  const { user, isLoaded } = useFirebaseAuth();
  const [posts, setPosts] = useState<ContentPostDTO[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE,
  });
  const [total, setTotal] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const debouncedSearch = useDebouncedValue(search.trim(), 350);
  const canEdit = user?.role === 'ADMIN' || user?.role === 'EDITOR';
  const canDelete = user?.role === 'ADMIN';

  const fetchPosts = useCallback(
    async (signal?: AbortSignal) => {
      if (!isLoaded) return;

      if (!canEdit) {
        setPosts([]);
        setTotal(0);
        setPageCount(1);
        setError('You do not have permission to manage content posts.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          page: String(pagination.pageIndex + 1),
          limit: String(pagination.pageSize),
        });
        if (debouncedSearch) params.set('search', debouncedSearch);
        if (status) params.set('status', status);

        const response = await fetch(`${CONTENT_POSTS_ENDPOINT}?${params}`, {
          credentials: 'include',
          signal,
        });
        const payload = (await response.json()) as ContentPostsResponse;

        if (!response.ok || payload.status !== 'success') {
          throw new Error(payload.message || 'Failed to load content posts.');
        }

        const nextPageCount = Math.max(payload.totalPages ?? 1, 1);
        setPosts(payload.data ?? []);
        setTotal(payload.total ?? 0);
        setPageCount(nextPageCount);

        if (pagination.pageIndex >= nextPageCount) {
          setPagination((current) => ({
            ...current,
            pageIndex: nextPageCount - 1,
          }));
        }
      } catch (fetchError) {
        if (
          fetchError instanceof DOMException &&
          fetchError.name === 'AbortError'
        ) {
          return;
        }
        setPosts([]);
        setTotal(0);
        setPageCount(1);
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : 'Failed to load content posts.'
        );
      } finally {
        if (!signal?.aborted) setIsLoading(false);
      }
    },
    [
      canEdit,
      debouncedSearch,
      isLoaded,
      pagination.pageIndex,
      pagination.pageSize,
      status,
    ]
  );

  useEffect(() => {
    const controller = new AbortController();
    void fetchPosts(controller.signal);
    return () => controller.abort();
  }, [fetchPosts, refreshKey]);

  const handleDelete = useCallback(
    async (post: ContentPostDTO) => {
      if (!canDelete || deletingId) return;

      setDeletingId(post.id);
      try {
        const response = await fetch(`${CONTENT_POSTS_ENDPOINT}/${post.id}`, {
          method: 'DELETE',
          credentials: 'include',
        });
        const payload = (await response.json()) as ContentPostsResponse;

        if (!response.ok || payload.status !== 'success') {
          throw new Error(payload.message || 'Failed to delete content post.');
        }

        toast.success('Content post deleted successfully.');
        if (posts.length === 1 && pagination.pageIndex > 0) {
          setPagination((current) => ({
            ...current,
            pageIndex: current.pageIndex - 1,
          }));
        } else {
          setRefreshKey((key) => key + 1);
        }
      } catch (deleteError) {
        toast.error(
          deleteError instanceof Error
            ? deleteError.message
            : 'Failed to delete content post.'
        );
      } finally {
        setDeletingId(null);
      }
    },
    [canDelete, deletingId, pagination.pageIndex, posts.length]
  );

  const columns = useMemo(
    () => [
      columnHelper.accessor('featuredImage', {
        id: 'featuredImage',
        size: 80,
        header: 'Image',
        enableSorting: false,
        cell: ({ row }) => (
          <Avatar
            name={row.original.title}
            src={row.original.featuredImage || undefined}
            size="lg"
            className="rounded-md"
          />
        ),
      }),
      columnHelper.accessor('title', {
        id: 'title',
        size: 260,
        header: 'Title',
        enableSorting: false,
        cell: ({ row }) => (
          <Text className="line-clamp-2 font-medium text-gray-900">
            {row.original.title}
          </Text>
        ),
      }),
      columnHelper.accessor('slug', {
        id: 'slug',
        size: 220,
        header: 'Slug',
        enableSorting: false,
        cell: ({ row }) => (
          <Text className="truncate font-mono text-xs text-gray-600">
            {row.original.slug}
          </Text>
        ),
      }),
      columnHelper.accessor('status', {
        id: 'status',
        size: 130,
        header: 'Status',
        enableSorting: false,
        cell: ({ row }) => <ContentPostStatus status={row.original.status} />,
      }),
      columnHelper.accessor('authorName', {
        id: 'authorName',
        size: 170,
        header: 'Author',
        enableSorting: false,
        cell: ({ row }) => (
          <Text className="text-sm text-gray-700">
            {row.original.authorName || 'Unknown'}
          </Text>
        ),
      }),
      columnHelper.accessor('publishedAt', {
        id: 'publishedAt',
        size: 175,
        header: 'Published',
        enableSorting: false,
        cell: ({ row }) => <PostDate value={row.original.publishedAt} />,
      }),
      columnHelper.accessor('updatedAt', {
        id: 'updatedAt',
        size: 175,
        header: 'Updated',
        enableSorting: false,
        cell: ({ row }) => (
          <PostDate value={row.original.updatedAt} emptyLabel="Unavailable" />
        ),
      }),
      columnHelper.display({
        id: 'actions',
        size: 110,
        header: '',
        cell: ({ row }) => (
          <Flex align="center" justify="end" gap="3" className="pe-4">
            {canEdit ? (
              <Tooltip
                size="sm"
                content="Edit content post"
                placement="top"
                color="invert"
              >
                <Link href={routes.eCommerce.editContentPost(row.original.id)}>
                  <ActionIcon
                    as="span"
                    size="sm"
                    variant="outline"
                    aria-label="Edit content post"
                  >
                    <PencilIcon className="size-4" />
                  </ActionIcon>
                </Link>
              </Tooltip>
            ) : null}
            {canDelete ? (
              <DeletePopover
                title="Delete content post"
                description={`Are you sure you want to delete \"${row.original.title}\"?`}
                onDelete={() => void handleDelete(row.original)}
              />
            ) : null}
          </Flex>
        ),
      }),
    ],
    [canDelete, canEdit, handleDelete]
  );

  const table = useReactTable({
    data: posts,
    columns,
    state: { pagination },
    onPaginationChange: setPagination,
    manualPagination: true,
    pageCount,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPagination((current) => ({ ...current, pageIndex: 0 }));
  };

  const handleStatusChange = (option: SelectOption) => {
    setStatus(String(option.value));
    setPagination((current) => ({ ...current, pageIndex: 0 }));
  };

  return (
    <div>
      <Flex
        align="center"
        justify="between"
        gap="3"
        className="mb-4 flex-col sm:flex-row"
      >
        <Input
          type="search"
          placeholder="Search by title or excerpt..."
          value={search}
          onClear={() => handleSearchChange('')}
          onChange={(event) => handleSearchChange(event.target.value)}
          inputClassName="h-9"
          className="w-full sm:max-w-sm"
          clearable
          prefix={<PiMagnifyingGlassBold className="size-4" />}
        />
        <Select
          options={statusOptions}
          value={status}
          onChange={handleStatusChange}
          className="w-full sm:w-48"
          selectClassName="h-9"
          aria-label="Filter content posts by status"
        />
      </Flex>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-8 text-center">
          <Text className="font-medium text-red-700">{error}</Text>
          {canEdit ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => setRefreshKey((key) => key + 1)}
            >
              <PiArrowClockwiseBold className="me-1.5 size-4" />
              Retry
            </Button>
          ) : null}
        </div>
      ) : !isLoading && posts.length === 0 ? (
        <div className="rounded-md border border-muted px-4 py-12 text-center">
          <Empty />
          <Text className="mt-3 font-medium text-gray-700">
            No content posts found.
          </Text>
          <Text className="mt-1 text-sm text-gray-500">
            Try changing the search term or status filter.
          </Text>
        </div>
      ) : (
        <Table
          table={table}
          variant="modern"
          isLoading={isLoading}
          showLoadingText
          classNames={{
            container: 'rounded-md border border-muted',
            rowClassName: 'last:border-0',
          }}
        />
      )}

      {!error && total > 0 ? (
        <div className="mt-4">
          <Text className="mb-3 text-sm text-gray-500 sm:hidden">
            {total.toLocaleString()} total posts
          </Text>
          <TablePagination table={table} />
        </div>
      ) : null}
    </div>
  );
}
