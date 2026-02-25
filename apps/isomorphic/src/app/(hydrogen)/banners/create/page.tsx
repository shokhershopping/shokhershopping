'use client';

import { useState, useRef } from 'react';
import { useFirebaseAuth } from '@/lib/firebase-auth-provider';
import { useRouter } from 'next/navigation';
import { Button, Input, Select, Switch, Title, Text } from 'rizzui';
import Link from 'next/link';
import { routes } from '@/config/routes';
import { PiArrowLeftBold } from 'react-icons/pi';

const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB
const REQUIRED_WIDTH = 2000;
const REQUIRED_HEIGHT = 1125;

export default function CreateBannerPage() {
  const { user, getToken } = useFirebaseAuth();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [buttonText, setButtonText] = useState('Shop Now');
  const [buttonLink, setButtonLink] = useState('/shop');
  const [textColor, setTextColor] = useState<string>('auto');
  const [isActive, setIsActive] = useState(true);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    if (!image) {
      setError('Banner image is required');
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
      fd.append('textColor', textColor);
      fd.append('isActive', String(isActive));
      fd.append('image', image);

      const res = await fetch('/api/banners', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Failed to create banner');
        return;
      }

      router.push(routes.eCommerce.banners);
    } catch (err) {
      setError('Failed to create banner');
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
          <Title as="h4" className="font-semibold">Create Banner</Title>
          <Text className="mt-1 text-gray-500">
            Add a new hero banner for the homepage slider
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

          {/* Text Color */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Text Color
            </label>
            <div className="flex gap-3">
              {[
                { value: 'auto', label: 'Auto Detect', desc: 'Detects image brightness automatically' },
                { value: 'light', label: 'White Text', desc: 'For dark images' },
                { value: 'dark', label: 'Dark Text', desc: 'For light images' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setTextColor(opt.value)}
                  className={`flex-1 rounded-lg border-2 p-3 text-left transition-all ${
                    textColor === opt.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-5 w-5 rounded-full border ${
                        opt.value === 'light'
                          ? 'border-gray-300 bg-white'
                          : opt.value === 'dark'
                          ? 'border-gray-700 bg-gray-800'
                          : 'bg-gradient-to-r from-gray-800 to-white border-gray-300'
                      }`}
                    />
                    <Text className="text-sm font-medium">{opt.label}</Text>
                  </div>
                  <Text className="mt-1 text-xs text-gray-500">{opt.desc}</Text>
                </button>
              ))}
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Banner Image * (2000 x 1125px, max 1MB)
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
            />
            {imagePreview && (
              <div className="mt-3">
                <img
                  src={imagePreview}
                  alt="Banner preview"
                  className="h-auto max-h-56 w-full rounded-lg border object-cover"
                />
              </div>
            )}
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
              Create Banner
            </Button>
          </div>
        </form>
      </div>

      {/* Info Box */}
      <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:bg-blue-900/10">
        <Title as="h6" className="mb-2 font-semibold text-blue-800">Banner Guidelines</Title>
        <ul className="list-inside list-disc space-y-1 text-sm text-blue-700">
          <li>Image dimensions: <strong>2000 x 1125 pixels</strong> (16:9 aspect ratio)</li>
          <li>Maximum file size: <strong>1MB</strong></li>
          <li>Supported formats: JPEG, PNG, WebP</li>
        </ul>
      </div>
    </div>
  );
}
