import { NextRequest, NextResponse } from 'next/server';
import { getCoupons, createCoupon, getCouponByCode } from 'firebase-config/services/coupon.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    // If a code is provided, look up by code (for validation)
    if (code) {
      const result = await getCouponByCode(code);
      const statusCode = result.status === 'success' ? 200 : (result.code || 500);
      return NextResponse.json(result, { status: statusCode });
    }

    const page = parseInt(searchParams.get('page') || '1', 10) || 1;
    const limit = parseInt(searchParams.get('limit') || '10', 10) || 10;

    const result = await getCoupons(limit, page);

    const statusCode = result.status === 'success' ? 200 : (result.code || 500);
    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    console.error('GET /api/coupons error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to fetch coupons', data: null },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await createCoupon(body);

    const statusCode = result.status === 'success' ? 201 : (result.code || 500);
    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    console.error('POST /api/coupons error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to create coupon', data: null },
      { status: 500 }
    );
  }
}
