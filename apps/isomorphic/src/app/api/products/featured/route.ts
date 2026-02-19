import { NextRequest, NextResponse } from 'next/server';
import {
  getFeaturedProducts,
  getSlideProducts,
  getLatestProducts,
  getTopSellingProducts,
} from 'firebase-config/services/product.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'featured';
    const limit = parseInt(searchParams.get('limit') || '10', 10) || 10;

    let result;
    switch (type) {
      case 'slide':
        result = await getSlideProducts(limit);
        break;
      case 'latest':
        result = await getLatestProducts(limit);
        break;
      case 'top-selling':
        result = await getTopSellingProducts(limit);
        break;
      case 'featured':
      default:
        result = await getFeaturedProducts(limit);
        break;
    }

    const statusCode = result.status === 'success' ? 200 : (result.code || 500);
    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    console.error('GET /api/products/featured error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to fetch products', data: null },
      { status: 500 }
    );
  }
}
