import { NextRequest, NextResponse } from 'next/server';
import {
  isContentPostSlugAvailable,
  normalizeContentPostSlug,
} from 'firebase-config/services/content-post.service';
import {
  authorizationErrorResponse,
  requireAdminAuthorization,
} from '@/lib/server/authorization';
import { contentPostSlugQuerySchema } from '@/validators/content-post.schema';

export async function GET(request: NextRequest) {
  try {
    await requireAdminAuthorization(['ADMIN', 'EDITOR']);
    const parsed = contentPostSlugQuerySchema.safeParse(
      Object.fromEntries(request.nextUrl.searchParams.entries())
    );
    if (!parsed.success) {
      return NextResponse.json(
        { status: 'error', message: 'Validation failed', data: null, error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const slug = normalizeContentPostSlug(parsed.data.slug);
    const available = await isContentPostSlugAvailable(slug, parsed.data.excludeId);
    return NextResponse.json({
      status: 'success',
      message: 'Slug availability checked',
      data: { slug, available },
    });
  } catch (error) {
    const authResponse = authorizationErrorResponse(error);
    if (authResponse) return authResponse;
    console.error('GET /api/content-posts/check-slug error:', error);
    return NextResponse.json({ status: 'error', message: 'Failed to check slug', data: null }, { status: 500 });
  }
}
