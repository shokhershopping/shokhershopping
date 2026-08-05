import { NextRequest, NextResponse } from 'next/server';
import {
  createContentPost,
  getContentPosts,
} from 'firebase-config/services/content-post.service';
import type { ContentPostStatus } from 'firebase-config/types/enums';
import {
  authorizationErrorResponse,
  requireAdminAuthorization,
} from '@/lib/server/authorization';
import {
  contentPostCreateSchema,
  contentPostListQuerySchema,
} from '@/validators/content-post.schema';

function validationResponse(error: unknown) {
  return NextResponse.json(
    { status: 'error', message: 'Validation failed', data: null, error },
    { status: 400 }
  );
}

export async function GET(request: NextRequest) {
  try {
    await requireAdminAuthorization(['ADMIN', 'EDITOR']);
    const parsed = contentPostListQuerySchema.safeParse(
      Object.fromEntries(request.nextUrl.searchParams.entries())
    );
    if (!parsed.success) return validationResponse(parsed.error.flatten());

    const { page, limit, search, status } = parsed.data;
    const result = await getContentPosts(limit, page, {
      search,
      status: status as ContentPostStatus | undefined,
    });
    return NextResponse.json(result, { status: result.status === 'success' ? 200 : result.code || 500 });
  } catch (error) {
    const authResponse = authorizationErrorResponse(error);
    if (authResponse) return authResponse;
    console.error('GET /api/content-posts error:', error);
    return NextResponse.json({ status: 'error', message: 'Failed to fetch content posts', data: null }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdminAuthorization(['ADMIN', 'EDITOR']);
    const parsed = contentPostCreateSchema.safeParse(await request.json());
    if (!parsed.success) return validationResponse(parsed.error.flatten());

    const result = await createContentPost({
      ...parsed.data,
      status: parsed.data.status as ContentPostStatus,
      authorId: admin.uid,
      authorName: admin.displayName,
    });
    return NextResponse.json(result, { status: result.status === 'success' ? 201 : result.code || 500 });
  } catch (error) {
    const authResponse = authorizationErrorResponse(error);
    if (authResponse) return authResponse;
    console.error('POST /api/content-posts error:', error);
    return NextResponse.json({ status: 'error', message: 'Failed to create content post', data: null }, { status: 500 });
  }
}
