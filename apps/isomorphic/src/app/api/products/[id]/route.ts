import { NextRequest, NextResponse } from 'next/server';
import {
  getProductById,
  updateProduct,
  deleteProduct,
} from 'firebase-config/services/product.service';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const result = await getProductById(id);

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

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const result = await updateProduct(id, body);

    const statusCode = result.status === 'success' ? 200 : (result.code || 500);
    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    console.error('PATCH /api/products/[id] error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to update product', data: null },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const result = await deleteProduct(id);

    const statusCode = result.status === 'success' ? 200 : (result.code || 500);
    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    console.error('DELETE /api/products/[id] error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to delete product', data: null },
      { status: 500 }
    );
  }
}
