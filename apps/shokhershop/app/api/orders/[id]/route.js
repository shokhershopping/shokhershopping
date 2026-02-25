import { NextResponse } from 'next/server';
import { getOrderById, updateOrderStatus } from 'firebase-config/services/order.service';

export async function GET(_request, { params }) {
  try {
    const { id } = await params;
    const result = await getOrderById(id);

    const statusCode = result.status === 'success' ? 200 : (result.code || 500);
    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    console.error('GET /api/orders/[id] error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to fetch order', data: null },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const result = await updateOrderStatus(id, body.status);

    const statusCode = result.status === 'success' ? 200 : (result.code || 500);
    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    console.error('PATCH /api/orders/[id] error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to update order', data: null },
      { status: 500 }
    );
  }
}
