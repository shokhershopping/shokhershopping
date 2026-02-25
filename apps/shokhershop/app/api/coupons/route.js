import { NextResponse } from 'next/server';
import { getCouponByCode } from 'firebase-config/services/coupon.service';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json(
        { status: 'error', message: 'Coupon code is required', data: null },
        { status: 400 }
      );
    }

    const result = await getCouponByCode(code);
    const statusCode = result.status === 'success' ? 200 : (result.code || 500);
    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    console.error('GET /api/coupons error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to validate coupon', data: null },
      { status: 500 }
    );
  }
}
