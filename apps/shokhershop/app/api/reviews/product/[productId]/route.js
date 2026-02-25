import { NextResponse } from 'next/server';
import { getReviewsByProductId } from 'firebase-config/services/review.service';

export async function GET(request, { params }) {
  try {
    const { productId } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10', 10) || 10;
    const page = parseInt(searchParams.get('page') || '1', 10) || 1;

    const result = await getReviewsByProductId(productId, limit, page);

    const statusCode = result.status === 'success' ? 200 : (result.code || 500);
    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    console.error('GET /api/reviews/product/[productId] error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to fetch reviews', data: null },
      { status: 500 }
    );
  }
}
