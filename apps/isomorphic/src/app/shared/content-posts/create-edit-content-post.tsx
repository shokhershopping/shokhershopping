'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ContentPostDTO } from 'firebase-config/types/content-post.types';
import { useRouter } from 'next/navigation';
import {
  Controller,
  FormProvider,
  type FieldPath,
  type SubmitHandler,
  useForm,
  useWatch,
} from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  Button,
  Checkbox,
  Input,
  Loader,
  Select,
  Text,
  Textarea,
  Title,
} from 'rizzui';
import FormFooter from '@core/components/form-footer';
import FormGroup from '@/app/shared/form-group';
import { api } from '@/config/api';
import { routes } from '@/config/routes';
import { useFirebaseAuth } from '@/lib/firebase-auth-provider';
import {
  contentPostDefaultValues,
  contentPostFormSchema,
  type ContentPostFormInput,
  normalizeContentPostSlug,
} from './content-post-form.schema';
import ContentPostEditor from './content-post-editor';
import ContentPostImageUpload from './content-post-image-upload';
import RelatedProductSelect from './related-product-select';
import useUnsavedChanges from './use-unsaved-changes';

type CreateEditContentPostProps = {
  postId?: string;
};

type ValidationError = {
  fieldErrors?: Record<string, string[] | undefined>;
  formErrors?: string[];
};

type ApiResponse<T> = {
  status: string;
  message: string;
  data: T | null;
  error?: string | ValidationError;
};

type SlugCheckState = 'idle' | 'checking' | 'available' | 'unavailable';

const statusOptions = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PUBLISHED', label: 'Published' },
  { value: 'ARCHIVED', label: 'Archived' },
] as const;

const API_BASE = '/api';

function isValidationError(error: unknown): error is ValidationError {
  return typeof error === 'object' && error !== null;
}

function normalizeSlugInput(value: string) {
  try {
    return normalizeContentPostSlug(value);
  } catch {
    return '';
  }
}

async function readApiResponse<T>(response: Response): Promise<ApiResponse<T>> {
  try {
    return (await response.json()) as ApiResponse<T>;
  } catch {
    return {
      status: 'error',
      message: `Request failed with status ${response.status}`,
      data: null,
    };
  }
}

export default function CreateEditContentPost({
  postId,
}: CreateEditContentPostProps) {
  const router = useRouter();
  const { user, isLoaded } = useFirebaseAuth();
  const [isLoadingPost, setIsLoadingPost] = useState(Boolean(postId));
  const [loadError, setLoadError] = useState('');
  const [slugCheckState, setSlugCheckState] = useState<SlugCheckState>('idle');
  const [useFeaturedImageForOg, setUseFeaturedImageForOg] = useState(true);
  const slugManuallyEdited = useRef(Boolean(postId));

  const methods = useForm<ContentPostFormInput>({
    resolver: zodResolver(contentPostFormSchema),
    defaultValues: contentPostDefaultValues(),
    mode: 'onBlur',
  });

  const {
    clearErrors,
    control,
    formState: { errors, isDirty, isSubmitting },
    getFieldState,
    getValues,
    handleSubmit,
    register,
    reset,
    setError,
    setValue,
  } = methods;

  const slug = useWatch({ control, name: 'slug' });
  const canManageContent = user?.role === 'ADMIN' || user?.role === 'EDITOR';
  const confirmNavigation = useUnsavedChanges(isDirty && !isSubmitting);

  const loadPost = useCallback(async () => {
    if (!postId) return;

    setIsLoadingPost(true);
    setLoadError('');

    try {
      const response = await fetch(
        `${API_BASE}${api.contentPost.details(postId)}`,
        { cache: 'no-store' }
      );
      const result = await readApiResponse<ContentPostDTO>(response);

      if (!response.ok || !result.data) {
        throw new Error(result.message || 'Failed to load content post');
      }

      const values = contentPostDefaultValues(result.data);
      reset(values);
      setUseFeaturedImageForOg(
        !result.data.ogImage ||
          result.data.ogImage === result.data.featuredImage
      );
      slugManuallyEdited.current = true;
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : 'Failed to load content post'
      );
    } finally {
      setIsLoadingPost(false);
    }
  }, [postId, reset]);

  useEffect(() => {
    if (!postId || !isLoaded || !canManageContent) return;
    void loadPost();
  }, [canManageContent, isLoaded, loadPost, postId]);

  useEffect(() => {
    if (!slug || !canManageContent) {
      setSlugCheckState('idle');
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setSlugCheckState('checking');

      try {
        const params = new URLSearchParams({ slug });
        if (postId) params.set('excludeId', postId);

        const response = await fetch(
          `${API_BASE}${api.contentPost.checkSlug}?${params.toString()}`,
          { signal: controller.signal, cache: 'no-store' }
        );
        const result = await readApiResponse<{
          slug: string;
          available: boolean;
        }>(response);

        if (!response.ok || !result.data) {
          setSlugCheckState('idle');
          return;
        }

        if (result.data.available) {
          setSlugCheckState('available');
          if (getFieldState('slug').error?.type === 'slugAvailability') {
            clearErrors('slug');
          }
        } else {
          setSlugCheckState('unavailable');
          setError('slug', {
            type: 'slugAvailability',
            message: 'This slug is already in use',
          });
        }
      } catch (error) {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          setSlugCheckState('idle');
        }
      }
    }, 500);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [canManageContent, clearErrors, getFieldState, postId, setError, slug]);

  const applyServerValidationErrors = useCallback(
    (error: ApiResponse<unknown>['error']) => {
      if (!isValidationError(error) || !error.fieldErrors) return;

      for (const [field, messages] of Object.entries(error.fieldErrors)) {
        const message = messages?.[0];
        if (!message) continue;
        setError(field as FieldPath<ContentPostFormInput>, {
          type: 'server',
          message,
        });
      }
    },
    [setError]
  );

  const onSubmit: SubmitHandler<ContentPostFormInput> = async (data) => {
    const payload = {
      title: data.title,
      slug: normalizeContentPostSlug(data.slug),
      excerpt: data.excerpt,
      contentHtml: data.contentHtml,
      featuredImage: data.featuredImage,
      featuredImageAlt: data.featuredImageAlt,
      relatedProductId: data.relatedProductId || null,
      ctaText: data.ctaText,
      ctaUrl: data.ctaUrl,
      status: data.status,
      seoTitle: data.seoTitle,
      metaDescription: data.metaDescription,
      ogTitle: data.ogTitle,
      ogDescription: data.ogDescription,
      ogImage: useFeaturedImageForOg ? data.featuredImage : data.ogImage,
    };

    const endpoint = postId
      ? `${API_BASE}${api.contentPost.update(postId)}`
      : `${API_BASE}${api.contentPost.create}`;

    try {
      const response = await fetch(endpoint, {
        method: postId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await readApiResponse<ContentPostDTO>(response);

      if (!response.ok || !result.data) {
        applyServerValidationErrors(result.error);
        if (response.status === 409) {
          setError('slug', {
            type: 'server',
            message: 'This slug was just claimed by another post',
          });
        }
        toast.error(result.message || 'Unable to save content post');
        return;
      }

      const savedValues = contentPostDefaultValues(result.data);
      reset(savedValues);
      slugManuallyEdited.current = true;
      setUseFeaturedImageForOg(
        !result.data.ogImage ||
          result.data.ogImage === result.data.featuredImage
      );

      if (postId) {
        toast.success('Content post updated successfully');
        router.refresh();
      } else {
        toast.success('Content post created successfully');
        router.push(routes.eCommerce.contentPosts);
      }
    } catch {
      toast.error('Unable to save content post');
    }
  };

  const titleField = register('title');
  const slugField = register('slug');

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    void titleField.onChange(event);
    if (slugManuallyEdited.current) return;

    setValue('slug', normalizeSlugInput(event.target.value), {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const handleSlugChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    slugManuallyEdited.current = true;
    setValue('slug', normalizeSlugInput(event.target.value), {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const handleCancel = () => {
    if (confirmNavigation()) {
      router.push(routes.eCommerce.contentPosts);
    }
  };

  if (!isLoaded || isLoadingPost) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <Loader variant="spinner" size="xl" />
      </div>
    );
  }

  if (!canManageContent) {
    return (
      <div className="border border-muted p-8 text-center">
        <Title as="h3" className="mb-2 text-lg">
          Access denied
        </Title>
        <Text className="text-gray-500">
          Your account cannot manage content posts.
        </Text>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="border border-muted p-8 text-center">
        <Title as="h3" className="mb-2 text-lg">
          Content post unavailable
        </Title>
        <Text className="mb-5 text-gray-500">{loadError}</Text>
        <div className="flex justify-center gap-3">
          <Button variant="outline" onClick={handleCancel}>
            Back to list
          </Button>
          <Button onClick={() => void loadPost()}>Try again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="@container">
      <FormProvider {...methods}>
        <form
          noValidate
          onSubmit={handleSubmit(onSubmit)}
          className="relative z-[19] [&_label.block>span]:font-medium"
        >
          <div className="mb-10 grid gap-7 divide-y divide-dashed divide-gray-200 @2xl:gap-9 @3xl:gap-11">
            <FormGroup title="Content">
              <Input
                label="Title"
                placeholder="Content post title"
                {...titleField}
                onChange={handleTitleChange}
                error={errors.title?.message}
                className="col-span-full"
              />
              <div className="col-span-full">
                <Input
                  label="Slug"
                  placeholder="content-post-slug"
                  {...slugField}
                  onChange={handleSlugChange}
                  error={errors.slug?.message}
                />
                {!errors.slug && slugCheckState !== 'idle' && (
                  <Text
                    className={`mt-1.5 text-xs ${
                      slugCheckState === 'available'
                        ? 'text-green-600'
                        : slugCheckState === 'unavailable'
                          ? 'text-red-600'
                          : 'text-gray-500'
                    }`}
                  >
                    {slugCheckState === 'checking'
                      ? 'Checking slug availability...'
                      : slugCheckState === 'available'
                        ? 'Slug is available'
                        : 'Slug is already in use'}
                  </Text>
                )}
              </div>
              <Textarea
                label="Excerpt"
                placeholder="Short summary"
                {...register('excerpt')}
                error={errors.excerpt?.message}
                className="col-span-full"
              />
              <Controller
                name="contentHtml"
                control={control}
                render={({ field }) => (
                  <ContentPostEditor
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.contentHtml?.message}
                  />
                )}
              />
              <Controller
                name="featuredImage"
                control={control}
                render={({ field }) => (
                  <ContentPostImageUpload
                    label="Featured image"
                    value={field.value}
                    onChange={(url) => {
                      field.onChange(url);
                      if (useFeaturedImageForOg) {
                        setValue('ogImage', url, {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                      }
                    }}
                    error={errors.featuredImage?.message}
                    disabled={isSubmitting}
                  />
                )}
              />
              <Input
                label="Featured image alt text"
                placeholder="Describe the image"
                {...register('featuredImageAlt')}
                error={errors.featuredImageAlt?.message}
                className="col-span-full"
              />
            </FormGroup>

            <FormGroup title="Product and CTA" className="pt-7 @2xl:pt-9">
              <Controller
                name="relatedProductId"
                control={control}
                render={({ field }) => (
                  <RelatedProductSelect
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.relatedProductId?.message}
                    disabled={isSubmitting}
                  />
                )}
              />
              <Input
                label="CTA text"
                placeholder="Shop now"
                {...register('ctaText')}
                error={errors.ctaText?.message}
              />
              <Input
                label="CTA URL"
                placeholder="/shop or https://example.com"
                {...register('ctaUrl')}
                error={errors.ctaUrl?.message}
                className="col-span-full"
              />
            </FormGroup>

            <FormGroup title="Publishing" className="pt-7 @2xl:pt-9">
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select
                    label="Status"
                    options={[...statusOptions]}
                    value={field.value}
                    onChange={field.onChange}
                    getOptionValue={(option) => option.value}
                    displayValue={(selected) =>
                      statusOptions.find((option) => option.value === selected)
                        ?.label ?? ''
                    }
                    error={errors.status?.message}
                    dropdownClassName="h-auto"
                  />
                )}
              />
            </FormGroup>

            <FormGroup title="SEO and social" className="pt-7 @2xl:pt-9">
              <Input
                label="SEO title"
                placeholder="Search result title"
                {...register('seoTitle')}
                error={errors.seoTitle?.message}
              />
              <Textarea
                label="Meta description"
                placeholder="Search result description"
                {...register('metaDescription')}
                error={errors.metaDescription?.message}
              />
              <Input
                label="Open Graph title"
                placeholder="Social sharing title"
                {...register('ogTitle')}
                error={errors.ogTitle?.message}
              />
              <Textarea
                label="Open Graph description"
                placeholder="Social sharing description"
                {...register('ogDescription')}
                error={errors.ogDescription?.message}
              />
              <Checkbox
                label="Use featured image for social preview"
                checked={useFeaturedImageForOg}
                onChange={(event) => {
                  const checked = event.target.checked;
                  setUseFeaturedImageForOg(checked);
                  if (checked) {
                    setValue('ogImage', getValues('featuredImage'), {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                  }
                }}
                className="col-span-full"
              />
              {!useFeaturedImageForOg && (
                <Controller
                  name="ogImage"
                  control={control}
                  render={({ field }) => (
                    <ContentPostImageUpload
                      label="Social preview image"
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.ogImage?.message}
                      disabled={isSubmitting}
                    />
                  )}
                />
              )}
            </FormGroup>
          </div>

          <FormFooter
            isLoading={isSubmitting}
            altBtnText="Cancel"
            submitBtnText={
              postId ? 'Update Content Post' : 'Create Content Post'
            }
            handleAltBtn={handleCancel}
          />
        </form>
      </FormProvider>
    </div>
  );
}
