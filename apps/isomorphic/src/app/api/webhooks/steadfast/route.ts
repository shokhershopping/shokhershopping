import { NextRequest, NextResponse } from 'next/server';
import { getOrderBySteadfastConsignmentId, updateOrder } from 'firebase-config/services/order.service';

/**
 * POST /api/webhooks/steadfast
 *
 * Steadfast sends a webhook when delivery status changes.
 * Payload: { consignment_id, tracking_code, status, delivery_status, ... }
 *
 * This automatically updates the order's steadfastStatus and,
 * if delivered, also updates the order status to DELIVERED.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const consignmentId = body.consignment_id;
    const deliveryStatus = body.delivery_status || body.status;

    if (!consignmentId || !deliveryStatus) {
      return NextResponse.json(
        { status: 'error', message: 'Missing consignment_id or delivery_status' },
        { status: 400 }
      );
    }

    // Find the order by Steadfast consignment ID
    const orderResult = await getOrderBySteadfastConsignmentId(
      typeof consignmentId === 'string' ? parseInt(consignmentId, 10) : consignmentId
    );

    if (orderResult.status !== 'success' || !orderResult.data) {
      // Return 200 anyway so Steadfast doesn't keep retrying
      console.warn(`Webhook: No order found for consignment ${consignmentId}`);
      return NextResponse.json({ status: 'ok', message: 'No matching order found' });
    }

    const order = orderResult.data;

    // Build update data
    const updateData: any = {
      steadfastStatus: deliveryStatus,
    };

    // Auto-update order status based on delivery status
    if (['delivered', 'delivered_approval_pending'].includes(deliveryStatus)) {
      updateData.status = 'DELIVERED';
    } else if (['cancelled', 'cancelled_approval_pending'].includes(deliveryStatus)) {
      updateData.status = 'CANCELLED';
    }

    await updateOrder(order.id, updateData);

    console.log(
      `Webhook: Order ${order.id} updated — steadfastStatus: ${deliveryStatus}` +
      (updateData.status ? `, orderStatus: ${updateData.status}` : '')
    );

    return NextResponse.json({ status: 'ok', message: 'Order updated' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Webhook processing failed';
    console.error('POST /api/webhooks/steadfast error:', message);
    // Return 200 to prevent Steadfast from retrying on our errors
    return NextResponse.json({ status: 'ok', message: 'Processed' });
  }
}
