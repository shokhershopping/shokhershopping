import { NextRequest, NextResponse } from 'next/server';
import { getOrders, createOrder } from 'firebase-config/services/order.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10) || 1;
    const limit = parseInt(searchParams.get('limit') || '10', 10) || 10;
    const status = searchParams.get('status') || undefined;
    const userId = searchParams.get('userId') || undefined;

    const result = await getOrders(limit, page, {
      status: status as any,
      userId,
    });

    const statusCode = result.status === 'success' ? 200 : (result.code || 500);
    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    console.error('GET /api/orders error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to fetch orders', data: null },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, ...orderData } = body;
    const result = await createOrder(orderData, items || []);

    const statusCode = result.status === 'success' ? 201 : (result.code || 500);
    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    console.error('POST /api/orders error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to create order', data: null },
      { status: 500 }
    );
  }
}
