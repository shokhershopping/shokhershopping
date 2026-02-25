import { NextResponse } from 'next/server';
import { getTopSellingProducts } from 'firebase-config/services/product.service';
import { transformProducts } from '@/lib/transformProduct';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10', 10) || 10;

    const result = await getTopSellingProducts(limit);

    if (result.status === 'success' && Array.isArray(result.data)) {
      result.data = transformProducts(result.data);
    }

    const statusCode = result.status === 'success' ? 200 : (result.code || 500);
    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    console.error('GET /api/products/top-selling error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to fetch top selling products', data: null },
      { status: 500 }
    );
  }
}
