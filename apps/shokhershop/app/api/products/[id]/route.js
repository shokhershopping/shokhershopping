import { NextResponse } from 'next/server';
import { getProductById } from 'firebase-config/services/product.service';
import { transformProduct } from '@/lib/transformProduct';

export async function GET(_request, { params }) {
  try {
    const { id } = await params;
    const result = await getProductById(id);

    if (result.status === 'success' && result.data) {
      result.data = transformProduct(result.data);
    }

    const statusCode = result.status === 'success' ? 200 : (result.code || 500);
    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    console.error('GET /api/products/[id] error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to fetch product', data: null },
      { status: 500 }
    );
  }
}
