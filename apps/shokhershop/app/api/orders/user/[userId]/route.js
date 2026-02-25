import { NextResponse } from 'next/server';
import { getOrdersByUserId } from 'firebase-config/services/order.service';

export async function GET(request, { params }) {
  try {
    const { userId } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100', 10) || 100;
    const page = parseInt(searchParams.get('page') || '1', 10) || 1;

    const result = await getOrdersByUserId(userId, limit, page);

    const statusCode = result.status === 'success' ? 200 : (result.code || 500);
    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    console.error('GET /api/orders/user/[userId] error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to fetch user orders', data: null },
      { status: 500 }
    );
  }
}
