import { NextRequest, NextResponse } from 'next/server';
import { getProducts, createProduct } from 'firebase-config/services/product.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10) || 1;
    const limit = parseInt(searchParams.get('limit') || '10', 10) || 10;
    const status = searchParams.get('status') || undefined;
    const categoryId = searchParams.get('categoryId') || undefined;

    const result = await getProducts(limit, page, {
      status: status as any,
      categoryId,
    });

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await createProduct(body);

    const statusCode = result.status === 'success' ? 201 : (result.code || 500);
    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    console.error('POST /api/products error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to create product', data: null },
      { status: 500 }
    );
  }
}
