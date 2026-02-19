import { NextRequest, NextResponse } from 'next/server';
import {
  getReviewById,
  updateReviewStatus,
  deleteReview,
  getReviewStats,
} from 'firebase-config/services/review.service';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const stats = searchParams.get('stats') === 'true';

    // If stats=true, treat id as productId and return rating stats
    if (stats) {
      const result = await getReviewStats(id);
      const statusCode = result.status === 'success' ? 200 : (result.code || 500);
      return NextResponse.json(result, { status: statusCode });
    }

    const result = await getReviewById(id);
    const statusCode = result.status === 'success' ? 200 : (result.code || 500);
    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    console.error('GET /api/reviews/[id] error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to fetch review', data: null },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const result = await updateReviewStatus(id, body.status);
    const statusCode = result.status === 'success' ? 200 : (result.code || 500);
    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    console.error('PATCH /api/reviews/[id] error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to update review', data: null },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const result = await deleteReview(id);

    const statusCode = result.status === 'success' ? 200 : (result.code || 500);
    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    console.error('DELETE /api/reviews/[id] error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to delete review', data: null },
      { status: 500 }
    );
  }
}
