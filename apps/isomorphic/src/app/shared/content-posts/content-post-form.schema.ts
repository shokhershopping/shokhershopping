import { z } from 'zod';
import type { ContentPostDTO } from 'firebase-config/types';

const contentPostStatusSchema = z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']);

/** Keep this normalization identical to the server-side slug reservation service. */
export function normalizeContentPostSlug(value: string): string {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (!slug) {
    throw new Error('A valid slug is required');
  }

  return slug;
}

const slugSchema = z
  .string()
  .trim()
  .min(1, 'Slug is required')
  .max(160, 'Slug must be 160 characters or fewer')
  .transform((value, context) => {
    try {
      return normalizeContentPostSlug(value);
    } catch {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'A valid slug is required',
      });
      return z.NEVER;
    }
  });

function validateCtaUrl(value: string, context: z.RefinementCtx) {
  const url = value.trim();
  if (!url) return;

  if (/^(?:javascript|data|vbscript):/i.test(url)) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'CTA URL uses an unsupported scheme',
    });
    return;
  }

  if (url.startsWith('/') && !url.startsWith('//')) return;

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'CTA URL is malformed',
    });
    return;
  }

  if (!['http:', 'https:', 'mailto:', 'tel:'].includes(parsed.protocol)) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'CTA URL uses an unsupported scheme',
    });
  }
}

const optionalUrlSchema = z
  .string()
  .trim()
  .max(2048, 'URL must be 2048 characters or fewer')
  .default('');

export const contentPostFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, 'Title is required')
      .max(200, 'Title must be 200 characters or fewer'),
    slug: slugSchema,
    excerpt: z
      .string()
      .trim()
      .max(500, 'Excerpt must be 500 characters or fewer')
      .default(''),
    contentHtml: z.string().max(200_000, 'Content is too long').default(''),
    featuredImage: optionalUrlSchema,
    featuredImageAlt: z
      .string()
      .trim()
      .max(250, 'Image alt text must be 250 characters or fewer')
      .default(''),
    relatedProductId: z
      .string()
      .trim()
      .max(128, 'Product ID is too long')
      .nullable()
      .default(null),
    ctaText: z
      .string()
      .trim()
      .max(100, 'CTA text must be 100 characters or fewer')
      .default(''),
    ctaUrl: z
      .string()
      .trim()
      .max(2048, 'CTA URL must be 2048 characters or fewer')
      .default('')
      .superRefine(validateCtaUrl),
    status: contentPostStatusSchema.default('DRAFT'),
    seoTitle: z
      .string()
      .trim()
      .max(70, 'SEO title must be 70 characters or fewer')
      .default(''),
    metaDescription: z
      .string()
      .trim()
      .max(170, 'Meta description must be 170 characters or fewer')
      .default(''),
    ogTitle: z
      .string()
      .trim()
      .max(100, 'Open Graph title must be 100 characters or fewer')
      .default(''),
    ogDescription: z
      .string()
      .trim()
      .max(300, 'Open Graph description must be 300 characters or fewer')
      .default(''),
    ogImage: optionalUrlSchema,
  })
  .superRefine((value, context) => {
    if (value.status !== 'PUBLISHED') return;

    if (!value.featuredImage.trim()) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['featuredImage'],
        message: 'Featured image is required when published',
      });
    }

    if (!value.contentHtml.trim()) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['contentHtml'],
        message: 'Content is required when published',
      });
    }
  });

export type ContentPostFormInput = z.infer<typeof contentPostFormSchema>;

type ContentPostDefaultSource =
  | Partial<ContentPostDTO>
  | Partial<ContentPostFormInput>
  | null
  | undefined;

export function contentPostDefaultValues(
  post?: ContentPostDefaultSource
): ContentPostFormInput {
  let slug = '';
  if (post?.slug) {
    try {
      slug = normalizeContentPostSlug(post.slug);
    } catch {
      slug = '';
    }
  }

  return {
    title: post?.title ?? '',
    slug,
    excerpt: post?.excerpt ?? '',
    contentHtml: post?.contentHtml ?? '',
    featuredImage: post?.featuredImage ?? '',
    featuredImageAlt: post?.featuredImageAlt ?? '',
    relatedProductId: post?.relatedProductId ?? null,
    ctaText: post?.ctaText ?? '',
    ctaUrl: post?.ctaUrl ?? '',
    status: post?.status ?? 'DRAFT',
    seoTitle: post?.seoTitle ?? '',
    metaDescription: post?.metaDescription ?? '',
    ogTitle: post?.ogTitle ?? '',
    ogDescription: post?.ogDescription ?? '',
    ogImage: post?.ogImage ?? '',
  };
}
