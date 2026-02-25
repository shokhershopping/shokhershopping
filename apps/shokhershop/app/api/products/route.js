import { NextResponse } from 'next/server';
import { getProducts } from 'firebase-config/services/product.service';
import { transformProducts } from '@/lib/transformProduct';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10) || 1;
    const limit = parseInt(searchParams.get('limit') || '10', 10) || 10;
    const status = searchParams.get('status') || undefined;
    const categoryId = searchParams.get('categoryId') || searchParams.get('category') || undefined;

    const result = await getProducts(limit, page, { status, categoryId });

    if (result.status === 'success' && Array.isArray(result.data)) {
      result.data = transformProducts(result.data);
    }

    const statusCode = result.status === 'success' ? 200 : (result.code || 500);
    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    console.error('GET /api/products error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to fetch products', data: null },
      { status: 500 }
    );
  }
}
