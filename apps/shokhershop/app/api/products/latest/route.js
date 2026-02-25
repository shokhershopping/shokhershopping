import { NextResponse } from 'next/server';
import { getLatestProducts } from 'firebase-config/services/product.service';
import { transformProducts } from '@/lib/transformProduct';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10', 10) || 10;

    const result = await getLatestProducts(limit);

    if (result.status === 'success' && Array.isArray(result.data)) {
      result.data = transformProducts(result.data);
    }

    const statusCode = result.status === 'success' ? 200 : (result.code || 500);
    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    console.error('GET /api/products/latest error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to fetch latest products', data: null },
      { status: 500 }
    );
  }
}
