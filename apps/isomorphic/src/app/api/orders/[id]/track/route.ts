import { NextRequest, NextResponse } from 'next/server';
import { getOrderById, updateOrder } from 'firebase-config/services/order.service';
import { getSettings } from 'firebase-config/services/settings.service';
import { getSteadfastStatus } from 'firebase-config/services/steadfast.service';
import { notifyAdmins } from 'firebase-config/services/admin-notification.helper';

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/orders/[id]/track
 * Fetches latest delivery status from Steadfast and updates the order.
 */
export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    // 1. Get order
    const orderResult = await getOrderById(id);
    if (orderResult.status !== 'success' || !orderResult.data) {
      return NextResponse.json(
        { status: 'error', message: 'Order not found', data: null },
        { status: 404 }
      );
    }

    const order = orderResult.data;

    if (!order.steadfastConsignmentId) {
      return NextResponse.json(
        { status: 'error', message: 'No Steadfast shipment found for this order', data: null },
        { status: 400 }
      );
    }

    // 2. Get API keys
    const settingsResult = await getSettings();
    const settings = settingsResult.data;

    if (!settings?.steadfastApiKey || !settings?.steadfastSecretKey) {
      return NextResponse.json(
        { status: 'error', message: 'Steadfast API keys not configured', data: null },
        { status: 400 }
      );
    }

    // 3. Fetch status from Steadfast
    const trackResult = await getSteadfastStatus(
      settings.steadfastApiKey,
      settings.steadfastSecretKey,
      order.steadfastConsignmentId
    );

    // 4. Update order with latest status
    const newStatus = trackResult.delivery_status || order.steadfastStatus;
    if (newStatus !== order.steadfastStatus) {
      const updateData: any = { steadfastStatus: newStatus };

      // Auto-update order status on delivery/cancellation
      if (['delivered', 'delivered_approval_pending'].includes(newStatus)) {
        updateData.status = 'DELIVERED';
        notifyAdmins(
          'Order Delivered',
          `Order #${id.slice(0, 8)} has been delivered successfully`,
          `/orders/${id}`
        );
      } else if (['cancelled', 'cancelled_approval_pending'].includes(newStatus)) {
        updateData.status = 'CANCELLED';
        notifyAdmins(
          'Order Cancelled by Courier',
          `Order #${id.slice(0, 8)} was cancelled by Steadfast`,
          `/orders/${id}`
        );
      }

      await updateOrder(id, updateData);
    }

    return NextResponse.json({
      status: 'success',
      message: 'Tracking status retrieved',
      data: {
        steadfastConsignmentId: order.steadfastConsignmentId,
        steadfastTrackingCode: order.steadfastTrackingCode,
        steadfastStatus: newStatus,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch tracking status';
    console.error('GET /api/orders/[id]/track error:', message);
    return NextResponse.json(
      { status: 'error', message, data: null },
      { status: 500 }
    );
  }
}
