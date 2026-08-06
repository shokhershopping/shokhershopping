'use client';

import { ChangeEvent, useId, useRef, useState } from 'react';
import Image from 'next/image';
import { PiTrashBold, PiUploadSimpleBold } from 'react-icons/pi';
import { ActionIcon, Button, FieldError, Loader, Text, Tooltip } from 'rizzui';
import { api } from '@/config/api';

const MAX_FILE_SIZE = 1.5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

interface UploadResponse {
  message?: string;
  data?: {
    url?: string;
  } | null;
}

export interface ContentPostImageUploadProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

function uploadErrorMessage(status: number, fallback?: string) {
  if (status === 401) return 'Your session has expired. Sign in and try again.';
  if (status === 403) return 'You do not have permission to upload images.';
  if (status === 413) return 'The image exceeds the 1.5 MB size limit.';
  if (status === 415) return 'Use a JPEG, PNG, WebP, or GIF image.';
  return fallback || 'The image could not be uploaded. Try again.';
}

export default function ContentPostImageUpload({
  label,
  value,
  onChange,
  error,
  disabled = false,
}: ContentPostImageUploadProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const openFilePicker = () => {
    if (!disabled && !isUploading) inputRef.current?.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setUploadError('');

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setUploadError('Use a JPEG, PNG, WebP, or GIF image.');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setUploadError('The image exceeds the 1.5 MB size limit.');
      return;
    }

    if (file.size <= 0) {
      setUploadError('The selected image is empty.');
      return;
    }

    const body = new FormData();
    body.append('file', file);
    setIsUploading(true);

    try {
      const response = await fetch(`/api${api.contentPost.upload}`, {
        method: 'POST',
        body,
      });

      let payload: UploadResponse = {};
      try {
        payload = (await response.json()) as UploadResponse;
      } catch {
        // Preserve the status-specific fallback for a non-JSON response.
      }

      if (!response.ok) {
        throw new Error(uploadErrorMessage(response.status, payload.message));
      }

      const uploadedUrl = payload.data?.url;
      if (!uploadedUrl) {
        throw new Error('The upload completed without an image URL.');
      }

      onChange(uploadedUrl);
    } catch (caught) {
      setUploadError(
        caught instanceof Error
          ? caught.message
          : 'The image could not be uploaded. Try again.'
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <label
          htmlFor={inputId}
          className="font-medium text-gray-700 dark:text-gray-600"
        >
          {label}
        </label>
        {value && (
          <Tooltip content="Remove image" placement="top">
            <ActionIcon
              type="button"
              variant="text"
              color="danger"
              disabled={disabled || isUploading}
              onClick={() => {
                setUploadError('');
                onChange('');
              }}
              aria-label={`Remove ${label.toLowerCase()}`}
            >
              <PiTrashBold className="h-4 w-4" />
            </ActionIcon>
          </Tooltip>
        )}
      </div>

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(',')}
        className="sr-only"
        disabled={disabled || isUploading}
        onChange={handleFileChange}
      />

      {value ? (
        <div className="overflow-hidden rounded-md border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-100">
          <div className="relative aspect-[16/9] w-full">
            <Image
              src={value}
              alt={`${label} preview`}
              fill
              sizes="(max-width: 768px) 100vw, 640px"
              className="object-cover"
            />
          </div>
          <div className="border-t border-gray-200 p-3 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              size="sm"
              isLoading={isUploading}
              disabled={disabled}
              onClick={openFilePicker}
            >
              <PiUploadSimpleBold className="me-2 h-4 w-4" />
              Replace image
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled || isUploading}
          onClick={openFilePicker}
          className="flex min-h-36 w-full flex-col items-center justify-center rounded-md border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center transition hover:border-primary hover:bg-primary-lighter/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-100"
        >
          {isUploading ? (
            <Loader variant="spinner" className="mb-3" />
          ) : (
            <PiUploadSimpleBold className="mb-3 h-6 w-6" />
          )}
          <span className="text-sm font-medium">
            {isUploading ? 'Uploading image...' : 'Choose image'}
          </span>
        </button>
      )}

      <Text className="mt-2 text-xs text-gray-500">
        JPEG, PNG, WebP, or GIF. Maximum file size: 1.5 MB.
      </Text>
      {(uploadError || error) && (
        <FieldError className="mt-1" error={uploadError || error} />
      )}
    </div>
  );
}
