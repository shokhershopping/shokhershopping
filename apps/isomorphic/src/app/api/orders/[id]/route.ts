import { NextRequest, NextResponse } from 'next/server';
import {
  getOrderById,
  updateOrder,
  updateOrderStatus,
  deleteOrder,
} from 'firebase-config/services/order.service';
import { notifyAdmins } from 'firebase-config/services/admin-notification.helper';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
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

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    // If only status is provided, use the dedicated status update
    if (body.status && Object.keys(body).length === 1) {
      const result = await updateOrderStatus(id, body.status);
      if (result.status === 'success') {
        notifyAdmins(
          'Order Status Updated',
          `Order #${id.slice(0, 8)} changed to ${body.status}`,
          `/orders/${id}`
        );
      }
      const statusCode = result.status === 'success' ? 200 : (result.code || 500);
      return NextResponse.json(result, { status: statusCode });
    }

    const result = await updateOrder(id, body);
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

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const result = await deleteOrder(id);

    const statusCode = result.status === 'success' ? 200 : (result.code || 500);
    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    console.error('DELETE /api/orders/[id] error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to delete order', data: null },
      { status: 500 }
    );
  }
}
