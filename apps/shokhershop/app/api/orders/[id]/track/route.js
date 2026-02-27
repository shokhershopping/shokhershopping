import { NextResponse } from 'next/server';
import { getOrderById, updateOrder } from 'firebase-config/services/order.service';
import { getSettings } from 'firebase-config/services/settings.service';
import { getSteadfastStatus } from 'firebase-config/services/steadfast.service';

/**
 * GET /api/orders/[id]/track
 * Fetches latest delivery status from Steadfast for a customer order.
 */
export async function GET(_request, { params }) {
  try {
    const { id } = await params;

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
        { status: 'error', message: 'No courier shipment found for this order', data: null },
        { status: 400 }
      );
    }

    // 2. Get API keys
    const settingsResult = await getSettings();
    const settings = settingsResult.data;

    if (!settings?.steadfastApiKey || !settings?.steadfastSecretKey) {
      return NextResponse.json(
        { status: 'error', message: 'Courier tracking not available', data: null },
        { status: 400 }
      );
    }

    // 3. Fetch status from Steadfast
    const trackResult = await getSteadfastStatus(
      settings.steadfastApiKey,
      settings.steadfastSecretKey,
      order.steadfastConsignmentId
    );

    // 4. Update order with latest status if changed
    const newStatus = trackResult.delivery_status || order.steadfastStatus;
    if (newStatus !== order.steadfastStatus) {
      await updateOrder(id, { steadfastStatus: newStatus });
    }

    return NextResponse.json({
      status: 'success',
      message: 'Tracking status retrieved',
      data: {
        steadfastTrackingCode: order.steadfastTrackingCode,
        steadfastStatus: newStatus,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch tracking status';
    console.error('GET /api/orders/[id]/track error:', message);
    return NextResponse.json(
      { status: 'error', message: 'Failed to fetch tracking status', data: null },
      { status: 500 }
    );
  }
}
