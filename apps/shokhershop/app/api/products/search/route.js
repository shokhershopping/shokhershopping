import { NextResponse } from 'next/server';
import { searchProducts } from 'firebase-config/services/product.service';
import { transformProducts } from '@/lib/transformProduct';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '10', 10) || 10;
    const page = parseInt(searchParams.get('page') || '1', 10) || 1;

    if (!q) {
      return NextResponse.json(
        { status: 'error', message: 'Search query is required', data: null },
        { status: 400 }
      );
    }

    const result = await searchProducts(q, limit, page);

    if (result.status === 'success' && Array.isArray(result.data)) {
      result.data = transformProducts(result.data);
    }

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
