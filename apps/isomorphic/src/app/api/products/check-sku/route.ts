import { NextRequest, NextResponse } from 'next/server';
import { isSkuUnique } from 'firebase-config/services/product.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sku = searchParams.get('sku');
    const excludeProductId = searchParams.get('excludeProductId') || undefined;
    const excludeVariantId = searchParams.get('excludeVariantId') || undefined;

    if (!sku || !sku.trim()) {
      return NextResponse.json(
        { status: 'error', message: 'SKU is required', data: null },
        { status: 400 }
      );
    }

    const unique = await isSkuUnique(sku, excludeProductId, excludeVariantId);

    return NextResponse.json({
      status: 'success',
      message: unique ? 'SKU is available' : 'SKU is already in use',
      data: { unique },
    });
  } catch (error) {
    return NextResponse.json(
      { status: 'error', message: 'Failed to check SKU', data: null },
      { status: 500 }
    );
  }
}
