import { NextRequest, NextResponse } from 'next/server';
import {
  deleteContentPost,
  getContentPostById,
  updateContentPost,
} from 'firebase-config/services/content-post.service';
import type { ContentPostStatus } from 'firebase-config/types/enums';
import {
  authorizationErrorResponse,
  requireAdminAuthorization,
} from '@/lib/server/authorization';
import {
  contentPostStateSchema,
  contentPostUpdateSchema,
} from '@/validators/content-post.schema';

type RouteContext = { params: Promise<{ id: string }> };

function validationResponse(error: unknown) {
  return NextResponse.json(
    { status: 'error', message: 'Validation failed', data: null, error },
    { status: 400 }
  );
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    await requireAdminAuthorization(['ADMIN', 'EDITOR']);
    const { id } = await context.params;
    const result = await getContentPostById(id);
    return NextResponse.json(result, { status: result.status === 'success' ? 200 : result.code || 500 });
  } catch (error) {
    const authResponse = authorizationErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ status: 'error', message: 'Failed to fetch content post', data: null }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    await requireAdminAuthorization(['ADMIN', 'EDITOR']);
    const { id } = await context.params;
    const parsed = contentPostUpdateSchema.safeParse(await request.json());
    if (!parsed.success) return validationResponse(parsed.error.flatten());

    const existingResult = await getContentPostById(id);
    if (existingResult.status !== 'success' || !existingResult.data) {
      return NextResponse.json(existingResult, { status: existingResult.code || 404 });
    }
    const existing = existingResult.data;
    const state = contentPostStateSchema.safeParse({
      title: existing.title,
      slug: existing.slug,
      excerpt: existing.excerpt,
      contentHtml: existing.contentHtml,
      featuredImage: existing.featuredImage,
      featuredImageAlt: existing.featuredImageAlt,
      relatedProductId: existing.relatedProductId,
      ctaText: existing.ctaText,
      ctaUrl: existing.ctaUrl,
      status: existing.status,
      seoTitle: existing.seoTitle,
      metaDescription: existing.metaDescription,
      ogTitle: existing.ogTitle,
      ogDescription: existing.ogDescription,
      ogImage: existing.ogImage,
      ...parsed.data,
    });
    if (!state.success) return validationResponse(state.error.flatten());

    const result = await updateContentPost(id, {
      ...parsed.data,
      status: parsed.data.status as ContentPostStatus | undefined,
    });
    return NextResponse.json(result, { status: result.status === 'success' ? 200 : result.code || 500 });
  } catch (error) {
    const authResponse = authorizationErrorResponse(error);
    if (authResponse) return authResponse;
    console.error('PATCH /api/content-posts/[id] error:', error);
    return NextResponse.json({ status: 'error', message: 'Failed to update content post', data: null }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    await requireAdminAuthorization(['ADMIN']);
    const { id } = await context.params;
    const result = await deleteContentPost(id);
    return NextResponse.json(result, { status: result.status === 'success' ? 200 : result.code || 500 });
  } catch (error) {
    const authResponse = authorizationErrorResponse(error);
    if (authResponse) return authResponse;
    console.error('DELETE /api/content-posts/[id] error:', error);
    return NextResponse.json({ status: 'error', message: 'Failed to delete content post', data: null }, { status: 500 });
  }
}
