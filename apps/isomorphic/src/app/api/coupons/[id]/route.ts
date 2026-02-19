import { NextRequest, NextResponse } from 'next/server';
import {
  getCouponById,
  updateCoupon,
  deleteCoupon,
} from 'firebase-config/services/coupon.service';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const result = await getCouponById(id);

    const statusCode = result.status === 'success' ? 200 : (result.code || 500);
    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    console.error('GET /api/coupons/[id] error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to fetch coupon', data: null },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const result = await updateCoupon(id, body);

    const statusCode = result.status === 'success' ? 200 : (result.code || 500);
    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    console.error('PATCH /api/coupons/[id] error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to update coupon', data: null },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const result = await deleteCoupon(id);

    const statusCode = result.status === 'success' ? 200 : (result.code || 500);
    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    console.error('DELETE /api/coupons/[id] error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to delete coupon', data: null },
      { status: 500 }
    );
  }
}
