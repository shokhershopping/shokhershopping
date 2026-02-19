import { NextRequest, NextResponse } from 'next/server';
import { getReviews, createReview } from 'firebase-config/services/review.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10) || 1;
    const limit = parseInt(searchParams.get('limit') || '10', 10) || 10;
    const productId = searchParams.get('productId') || undefined;
    const status = searchParams.get('status') || undefined;
    const userId = searchParams.get('userId') || undefined;

    const result = await getReviews(limit, page, {
      productId,
      status: status as any,
      userId,
    });

    const statusCode = result.status === 'success' ? 200 : (result.code || 500);
    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    console.error('GET /api/reviews error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to fetch reviews', data: null },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await createReview(body);

    const statusCode = result.status === 'success' ? 201 : (result.code || 500);
    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    console.error('POST /api/reviews error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to create review', data: null },
      { status: 500 }
    );
  }
}
