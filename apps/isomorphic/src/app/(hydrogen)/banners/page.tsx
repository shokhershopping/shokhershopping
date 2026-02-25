'use client';

import { useEffect, useState, useCallback } from 'react';
import { useFirebaseAuth } from '@/lib/firebase-auth-provider';
import { useRouter } from 'next/navigation';
import { Button, Switch, Title, Text, Badge } from 'rizzui';
import Link from 'next/link';
import { routes } from '@/config/routes';
import {
  PiPlusBold,
  PiTrashBold,
  PiPencilSimpleBold,
  PiArrowUpBold,
  PiArrowDownBold,
} from 'react-icons/pi';

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  buttonText: string | null;
  buttonLink: string | null;
  imageUrl: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: any;
  updatedAt: any;
}

export default function BannerListPage() {
  const { user, getToken } = useFirebaseAuth();
  const router = useRouter();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  const [fetchError, setFetchError] = useState('');

  const fetchBanners = useCallback(async () => {
    try {
      setLoading(true);
      setFetchError('');
      const res = await fetch('/api/banners');
      if (res.ok) {
        const data = await res.json();
        setBanners(data?.data || []);
      } else {
        const data = await res.json().catch(() => ({}));
        setFetchError(data?.message || 'Failed to load banners. Try restarting the dev server.');
      }
    } catch (error) {
      // silently handle fetch error
      setFetchError('Failed to connect to banner API. Please restart the dev server (pnpm dev).');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const handleDelete = async (bannerId: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;

    try {
      const token = await getToken();
      const res = await fetch(`/api/banners/${bannerId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        fetchBanners();
      }
    } catch (error) {
      // silently handle delete error
    }
  };

  const handleToggleActive = async (banner: Banner) => {
    try {
      const token = await getToken();
      const fd = new FormData();
      fd.append('isActive', String(!banner.isActive));

      await fetch(`/api/banners/${banner.id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      fetchBanners();
    } catch (error) {
      // silently handle toggle error
    }
  };

  const handleReorder = async (bannerId: string, direction: 'up' | 'down') => {
    const idx = banners.findIndex((b) => b.id === bannerId);
    if (idx === -1) return;
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === banners.length - 1) return;

    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    const token = await getToken();

    const fd1 = new FormData();
    fd1.append('sortOrder', String(banners[swapIdx].sortOrder));
    const fd2 = new FormData();
    fd2.append('sortOrder', String(banners[idx].sortOrder));

    await Promise.all([
      fetch(`/api/banners/${banners[idx].id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: fd1,
      }),
      fetch(`/api/banners/${banners[swapIdx].id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: fd2,
      }),
    ]);

    fetchBanners();
  };

  if (user && user.role !== 'ADMIN') {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <Title as="h4" className="mb-2">Access Denied</Title>
          <Text className="text-gray-500">Only administrators can manage banners.</Text>
        </div>
      </div>
    );
  }

  return (
    <div className="@container">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <Title as="h4" className="font-semibold">Banner List</Title>
          <Text className="mt-1 text-gray-500">
            Manage homepage slider banners. Active banners are shown on the storefront.
          </Text>
        </div>
        <Link href={routes.eCommerce.createBanner}>
          <Button className="flex items-center gap-2">
            <PiPlusBold className="h-4 w-4" />
            Create Banner
          </Button>
        </Link>
      </div>

      {/* Error Message */}
      {fetchError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
          <Text className="text-sm text-red-600">{fetchError}</Text>
          <Button variant="outline" size="sm" className="mt-2" onClick={fetchBanners}>
            Retry
          </Button>
        </div>
      )}

      {/* Banners List */}
      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
        </div>
      ) : banners.length === 0 ? (
        <div className="flex h-40 items-center justify-center rounded-lg border border-gray-200 bg-white dark:bg-gray-100">
          <div className="text-center">
            <Text className="text-gray-500">No banners yet.</Text>
            <Text className="mt-1 text-sm text-gray-400">
              Click &quot;Create Banner&quot; to add your first homepage slider banner.
            </Text>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:bg-gray-100"
            >
              <div className="flex flex-col @lg:flex-row">
                {/* Banner Image Preview */}
                <div className="relative w-full @lg:w-80 @xl:w-96">
                  <img
                    src={banner.imageUrl}
                    alt={banner.title}
                    className="h-48 w-full object-cover @lg:h-full"
                  />
                  {!banner.isActive && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <Badge className="bg-yellow-500 text-white">Inactive</Badge>
                    </div>
                  )}
                </div>

                {/* Banner Details */}
                <div className="flex flex-1 flex-col justify-between p-4">
                  <div>
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <Title as="h6" className="font-semibold">{banner.title}</Title>
                      <Badge
                        className={banner.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}
                      >
                        {banner.isActive ? 'Active' : 'Deactive'}
                      </Badge>
                      <Badge className="bg-blue-100 text-blue-700">
                        Order: {banner.sortOrder}
                      </Badge>
                    </div>
                    {banner.subtitle && (
                      <Text className="mb-1 text-sm text-gray-600">{banner.subtitle}</Text>
                    )}
                    <Text className="text-xs text-gray-400">
                      Button: &quot;{banner.buttonText || 'Shop Now'}&quot; &rarr; {banner.buttonLink || '/shop'}
                    </Text>
                  </div>

                  {/* Actions */}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {/* Reorder */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReorder(banner.id, 'up')}
                      disabled={index === 0}
                      title="Move up"
                    >
                      <PiArrowUpBold className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReorder(banner.id, 'down')}
                      disabled={index === banners.length - 1}
                      title="Move down"
                    >
                      <PiArrowDownBold className="h-3.5 w-3.5" />
                    </Button>

                    {/* Active/Deactive Toggle */}
                    <div className="flex items-center gap-1.5">
                      <Switch
                        checked={banner.isActive}
                        onChange={() => handleToggleActive(banner)}
                      />
                      <Text className="text-xs text-gray-500">
                        {banner.isActive ? 'Active' : 'Deactive'}
                      </Text>
                    </div>

                    {/* Edit */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/banners/${banner.id}/edit`)}
                      className="flex items-center gap-1"
                    >
                      <PiPencilSimpleBold className="h-3.5 w-3.5" />
                      Edit
                    </Button>

                    {/* Delete */}
                    <Button
                      variant="outline"
                      color="danger"
                      size="sm"
                      onClick={() => handleDelete(banner.id)}
                      className="flex items-center gap-1 text-red-500 hover:text-red-700"
                    >
                      <PiTrashBold className="h-3.5 w-3.5" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Box */}
      <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:bg-blue-900/10">
        <Title as="h6" className="mb-2 font-semibold text-blue-800">Banner Guidelines</Title>
        <ul className="list-inside list-disc space-y-1 text-sm text-blue-700">
          <li>Image dimensions: <strong>2000 x 1125 pixels</strong> (16:9 aspect ratio)</li>
          <li>Maximum file size: <strong>1MB</strong></li>
          <li>Supported formats: JPEG, PNG, WebP</li>
          <li>Use the arrow buttons to reorder banners on the homepage slider</li>
          <li>Toggle the switch to activate/deactivate banners on the storefront</li>
        </ul>
      </div>
    </div>
  );
}
