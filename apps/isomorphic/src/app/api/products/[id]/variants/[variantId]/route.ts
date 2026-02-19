import { NextRequest, NextResponse } from 'next/server';
import {
  updateVariant,
  deleteVariant,
} from 'firebase-config/services/product.service';

type RouteContext = {
  params: Promise<{ id: string; variantId: string }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id, variantId } = await context.params;
    const body = await request.json();
    const result = await updateVariant(id, variantId, body);

    const statusCode = result.status === 'success' ? 200 : (result.code || 500);
    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    console.error('PATCH /api/products/[id]/variants/[variantId] error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to update variant', data: null },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { id, variantId } = await context.params;
    const result = await deleteVariant(id, variantId);

    const statusCode = result.status === 'success' ? 200 : (result.code || 500);
    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    console.error('DELETE /api/products/[id]/variants/[variantId] error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to delete variant', data: null },
      { status: 500 }
    );
  }
}
