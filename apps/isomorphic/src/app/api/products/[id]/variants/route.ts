import { NextRequest, NextResponse } from 'next/server';
import {
  getProductVariants,
  createVariant,
} from 'firebase-config/services/product.service';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const result = await getProductVariants(id);

    const statusCode = result.status === 'success' ? 200 : (result.code || 500);
    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    console.error('GET /api/products/[id]/variants error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to fetch variants', data: null },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const result = await createVariant(id, body);

    const statusCode = result.status === 'success' ? 201 : (result.code || 500);
    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    console.error('POST /api/products/[id]/variants error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to create variant', data: null },
      { status: 500 }
    );
  }
}
