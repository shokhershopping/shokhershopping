import { z } from 'zod';
import { validateContentCtaUrl } from 'firebase-config/helpers/validate-content-url';
import { normalizeContentPostSlug } from 'firebase-config/services/content-post.service';

export const contentPostStatusSchema = z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']);
const slugSchema = z
  .string()
  .trim()
  .min(1)
  .max(160)
  .transform((value, context) => {
    try {
      return normalizeContentPostSlug(value);
    } catch {
      context.addIssue({ code: z.ZodIssueCode.custom, message: 'A valid slug is required' });
      return z.NEVER;
    }
  });
const optionalUrl = z.string().trim().max(2048).optional().default('');
const ctaUrlSchema = optionalUrl.superRefine((value, context) => {
  try {
    validateContentCtaUrl(value);
  } catch (error) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: error instanceof Error ? error.message : 'Invalid CTA URL',
    });
  }
});

const fields = {
  title: z.string().trim().min(1).max(200),
  slug: slugSchema,
  excerpt: z.string().trim().max(500).optional().default(''),
  contentHtml: z.string().max(200_000).optional().default(''),
  featuredImage: optionalUrl,
  featuredImageAlt: z.string().trim().max(250).optional().default(''),
  relatedProductId: z.string().trim().max(128).nullable().optional(),
  ctaText: z.string().trim().max(100).optional().default(''),
  ctaUrl: ctaUrlSchema,
  status: contentPostStatusSchema.optional().default('DRAFT'),
  seoTitle: z.string().trim().max(70).optional().default(''),
  metaDescription: z.string().trim().max(170).optional().default(''),
  ogTitle: z.string().trim().max(100).optional().default(''),
  ogDescription: z.string().trim().max(300).optional().default(''),
  ogImage: optionalUrl,
};

function requirePublishedContent(
  value: { status?: string; featuredImage?: string; contentHtml?: string },
  context: z.RefinementCtx
) {
  if (value.status !== 'PUBLISHED') return;
  if (!value.featuredImage?.trim()) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['featuredImage'], message: 'Featured image is required when published' });
  }
  if (!value.contentHtml?.trim()) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['contentHtml'], message: 'Content is required when published' });
  }
}

export const contentPostCreateSchema = z.object(fields).strict().superRefine(requirePublishedContent);
export const contentPostUpdateSchema = z.object(fields).strict().partial();
export const contentPostStateSchema = z.object(fields).strict().superRefine(requirePublishedContent);

export const contentPostSlugQuerySchema = z.object({
  slug: slugSchema,
  excludeId: z.string().trim().min(1).max(128).optional(),
}).strict();

export const contentPostListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(200).optional(),
  status: contentPostStatusSchema.optional(),
}).strict();
