import { NextRequest, NextResponse } from 'next/server';
import { getOrderById, updateOrder } from 'firebase-config/services/order.service';
import { getSettings } from 'firebase-config/services/settings.service';
import { createSteadfastOrder } from 'firebase-config/services/steadfast.service';
import { notifyAdmins } from 'firebase-config/services/admin-notification.helper';

type RouteContext = { params: Promise<{ id: string }> };

/**
 * POST /api/orders/[id]/dispatch
 * Creates a Steadfast shipment and updates order to DISPATCHED status.
 */
export async function POST(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    // 1. Get order details
    const orderResult = await getOrderById(id);
    if (orderResult.status !== 'success' || !orderResult.data) {
      return NextResponse.json(
        { status: 'error', message: 'Order not found', data: null },
        { status: 404 }
      );
    }

    const order = orderResult.data;

    // 2. Check order has shipping address
    if (!order.shippingAddress) {
      return NextResponse.json(
        { status: 'error', message: 'Order has no shipping address', data: null },
        { status: 400 }
      );
    }

    // 3. Get Steadfast API keys from settings
    const settingsResult = await getSettings();
    const settings = settingsResult.data;

    if (!settings?.steadfastApiKey || !settings?.steadfastSecretKey) {
      return NextResponse.json(
        { status: 'error', message: 'Steadfast API keys not configured. Go to Settings to add them.', data: null },
        { status: 400 }
      );
    }

    // 4. Build item description from order items
    const items = (order as any).items || [];
    const itemDescription = items.length > 0
      ? items.map((item: any) => `${item.productName} x${item.quantity}`).join(', ')
      : 'Order items';

    // 5. Build full address
    const addr = order.shippingAddress;
    const fullAddress = [addr.address, addr.city, addr.state, addr.zip, addr.country]
      .filter(Boolean)
      .join(', ');

    // 6. Create Steadfast order
    const steadfastResult = await createSteadfastOrder(
      settings.steadfastApiKey,
      settings.steadfastSecretKey,
      {
        invoice: id,
        recipient_name: addr.name,
        recipient_phone: addr.phone,
        recipient_address: fullAddress,
        cod_amount: order.netTotal || 0,
        note: `Order #${id}`,
        item_description: itemDescription,
      }
    );

    // 7. Update order with tracking info and DISPATCHED status
    const updateData: any = {
      status: 'DISPATCHED',
      steadfastConsignmentId: steadfastResult.consignment.consignment_id,
      steadfastTrackingCode: steadfastResult.consignment.tracking_code,
      steadfastStatus: steadfastResult.consignment.status || 'in_review',
    };

    await updateOrder(id, updateData);

    // Notify admins
    notifyAdmins(
      'Order Dispatched',
      `Order #${id.slice(0, 8)} shipped via Steadfast — Tracking: ${steadfastResult.consignment.tracking_code}`,
      `/orders/${id}`
    );

    return NextResponse.json({
      status: 'success',
      message: 'Shipment created with Steadfast and order dispatched',
      data: {
        consignmentId: steadfastResult.consignment.consignment_id,
        trackingCode: steadfastResult.consignment.tracking_code,
        steadfastStatus: steadfastResult.consignment.status,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to dispatch order';
    console.error('POST /api/orders/[id]/dispatch error:', message);
    return NextResponse.json(
      { status: 'error', message, data: null },
      { status: 500 }
    );
  }
}
