import { NextRequest, NextResponse } from 'next/server';
import { searchProducts } from 'firebase-config/services/product.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1', 10) || 1;
    const limit = parseInt(searchParams.get('limit') || '10', 10) || 10;

    if (!query.trim()) {
      return NextResponse.json(
        { status: 'error', message: 'Search query is required', data: null },
        { status: 400 }
      );
    }

    const result = await searchProducts(query, limit, page);

    const statusCode = result.status === 'success' ? 200 : (result.code || 500);
    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    console.error('GET /api/products/search error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to search products', data: null },
      { status: 500 }
    );
  }
}
