'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useFirebaseAuth } from '@/lib/firebase-auth-provider';
import { useRouter, useParams } from 'next/navigation';
import { Button, Input, Select, Switch, Title, Text } from 'rizzui';
import Link from 'next/link';
import { routes } from '@/config/routes';
import { PiArrowLeftBold } from 'react-icons/pi';

const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB
const REQUIRED_WIDTH = 2000;
const REQUIRED_HEIGHT = 1125;

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  buttonText: string | null;
  buttonLink: string | null;
  imageUrl: string;
  textColor: 'light' | 'dark' | 'auto';
  sortOrder: number;
  isActive: boolean;
}

export default function EditBannerPage() {
  const { user, getToken } = useFirebaseAuth();
  const router = useRouter();
  const params = useParams();
  const bannerId = params.id as string;

  const [bannerLoading, setBannerLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [buttonText, setButtonText] = useState('');
  const [buttonLink, setButtonLink] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchBanner = useCallback(async () => {
    try {
      setBannerLoading(true);
      const res = await fetch(`/api/banners/${bannerId}`);
      if (res.ok) {
        const data = await res.json();
        const banner: Banner = data.data;
        if (banner) {
          setTitle(banner.title);
          setSubtitle(banner.subtitle || '');
          setButtonText(banner.buttonText || 'Shop Now');
          setButtonLink(banner.buttonLink || '/shop');
          setIsActive(banner.isActive);
          setImagePreview(banner.imageUrl);
        }
      }
    } catch (err) {
      // silently handle fetch error
    } finally {
      setBannerLoading(false);
    }
  }, [bannerId]);

  useEffect(() => {
    if (bannerId) fetchBanner();
  }, [bannerId, fetchBanner]);

  const validateImage = (file: File): Promise<string | null> => {
    return new Promise((resolve) => {
      if (file.size > MAX_FILE_SIZE) {
        resolve(`Image must be 1MB or less. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
        return;
      }
      if (!file.type.startsWith('image/')) {
        resolve('File must be an image (JPG, PNG, WebP)');
        return;
      }

      const img = new Image();
      img.onload = () => {
        if (img.width !== REQUIRED_WIDTH || img.height !== REQUIRED_HEIGHT) {
          resolve(`Image must be ${REQUIRED_WIDTH}x${REQUIRED_HEIGHT} pixels. Your image is ${img.width}x${img.height}`);
        } else {
          resolve(null);
        }
        URL.revokeObjectURL(img.src);
      };
      img.onerror = () => {
        resolve('Could not read image dimensions');
        URL.revokeObjectURL(img.src);
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    const validationError = await validateImage(file);
    if (validationError) {
      setError(validationError);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    try {
      setLoading(true);
      const token = await getToken();
      const fd = new FormData();
      fd.append('title', title.trim());
      fd.append('subtitle', subtitle.trim());
      fd.append('buttonText', buttonText.trim());
      fd.append('buttonLink', buttonLink.trim());
      fd.append('isActive', String(isActive));

      if (image) {
        fd.append('image', image);
      }

      const res = await fetch(`/api/banners/${bannerId}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Failed to update banner');
        return;
      }

      router.push(routes.eCommerce.banners);
    } catch (err) {
      setError('Failed to update banner');
    } finally {
      setLoading(false);
    }
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

  if (bannerLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
      </div>
    );
  }

  return (
    <div className="@container">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <Link href={routes.eCommerce.banners}>
          <Button variant="outline" size="sm">
            <PiArrowLeftBold className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <Title as="h4" className="font-semibold">Edit Banner</Title>
          <Text className="mt-1 text-gray-500">
            Update banner details or replace the image
          </Text>
        </div>
      </div>

      {/* Form */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:bg-gray-100">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 gap-4 @lg:grid-cols-2">
            <Input
              label="Title *"
              placeholder="e.g., Summer Collection 2026"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <Input
              label="Subtitle"
              placeholder="e.g., Up to 50% off"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
            />
            <Input
              label="Button Text"
              placeholder="e.g., Shop Now"
              value={buttonText}
              onChange={(e) => setButtonText(e.target.value)}
            />
            <Input
              label="Button Link"
              placeholder="e.g., /shop"
              value={buttonLink}
              onChange={(e) => setButtonLink(e.target.value)}
            />
          </div>

          {/* Current Image & Upload */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Banner Image (2000 x 1125px, max 1MB)
            </label>
            {imagePreview && (
              <div className="mb-3">
                <img
                  src={imagePreview}
                  alt="Current banner"
                  className="h-auto max-h-56 w-full rounded-lg border object-cover"
                />
                <Text className="mt-1 text-xs text-gray-400">
                  {image ? 'New image selected' : 'Current banner image'}
                </Text>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
            />
            <Text className="mt-1 text-xs text-gray-400">
              Leave empty to keep the current image
            </Text>
          </div>

          {/* Active Toggle */}
          <div className="flex items-center gap-3">
            <Switch
              checked={isActive}
              onChange={() => setIsActive(!isActive)}
            />
            <Text className="text-sm font-medium">
              {isActive ? 'Active (visible on storefront)' : 'Inactive (hidden from storefront)'}
            </Text>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-3">
              <Text className="text-sm text-red-600">{error}</Text>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Link href={routes.eCommerce.banners}>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              isLoading={loading}
              disabled={loading}
            >
              Update Banner
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
