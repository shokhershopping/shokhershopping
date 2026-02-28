import { NextResponse } from 'next/server';
import { createOrder, getOrders } from 'firebase-config/services/order.service';
import { getProductById } from 'firebase-config/services/product.service';
import { getUserById } from 'firebase-config/services/user.service';
import { notifyAdmins } from 'firebase-config/services/admin-notification.helper';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const status = searchParams.get('status') || undefined;
    const userId = searchParams.get('userId') || undefined;

    const result = await getOrders(limit, page, { status, userId });
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

export async function POST(request) {
  try {
    const body = await request.json();
    const { order = {}, items = [], shippingAddress, billingAddress } = body;

    if (!items.length) {
      return NextResponse.json(
        { status: 'error', message: 'Order must have at least one item', data: null },
        { status: 400 }
      );
    }

    // Lookup user info (or use guest info)
    let userName = order.guestName || '';
    let userEmail = order.guestEmail || '';
    if (order.userId) {
      try {
        const userResult = await getUserById(order.userId);
        if (userResult.status === 'success' && userResult.data) {
          userName = userResult.data.name || userResult.data.email || userName;
          userEmail = userResult.data.email || userEmail;
        }
      } catch (_) {
        // Continue even if user lookup fails
      }
    }

    // Lookup product details for each item and compute totals
    const enrichedItems = [];
    let total = 0;

    for (const item of items) {
      // Use client-provided data as defaults (fallback if product lookup fails)
      let productName = item.productName || 'Unknown Product';
      let productPrice = item.productPrice || 0;
      let productImageUrl = item.productImageUrl || null;

      if (item.productId) {
        try {
          const productResult = await getProductById(item.productId);
          if (productResult.status === 'success' && productResult.data) {
            const product = productResult.data;
            productName = product.name || productName;
            productPrice = product.salePrice || product.price || productPrice;
            productImageUrl = product.imageUrls?.[0] || productImageUrl;

            // If a variant ID was specified, try to find variant price
            if (item.variantId && product.variableProducts) {
              const variant = product.variableProducts.find(v => v.id === item.variantId);
              if (variant) {
                productPrice = variant.salePrice || variant.price || productPrice;
                productImageUrl = variant.imageUrls?.[0] || productImageUrl;
              }
            }
          } else {
            console.warn(`[Orders API] Product lookup failed for ${item.productId}:`, productResult.message);
          }
        } catch (err) {
          console.warn(`[Orders API] Product lookup error for ${item.productId}:`, err.message);
          // Use client-provided fallback data
        }
      }

      total += productPrice * (item.quantity || 1);

      enrichedItems.push({
        quantity: item.quantity || 1,
        productId: item.productId || null,
        variantId: item.variantId || null,
        productName,
        productPrice,
        productImageUrl,
      });
    }

    const deliveryCharge = order.deliveryCharge || 0;
    const couponDiscount = order.discount || 0;
    const netTotal = total + deliveryCharge - couponDiscount;

    const orderData = {
      userId: order.userId || null,
      userName,
      userEmail,
      guestPhone: order.guestPhone || null,
      isGuestOrder: !order.userId,
      status: 'PENDING',
      deliveryCharge,
      total,
      itemsTotalDiscount: 0,
      couponAppliedDiscount: couponDiscount,
      totalWithDiscount: total - couponDiscount,
      netTotal,
      couponId: order.couponId || undefined,
      shippingAddress: shippingAddress || null,
      billingAddress: billingAddress || null,
    };

    const result = await createOrder(orderData, enrichedItems);

    // Notify admins about new order
    if (result.status === 'success' && result.data) {
      const orderId = result.data.id;
      const itemCount = enrichedItems.length;
      notifyAdmins(
        'New Order Received',
        `Order #${orderId.slice(0, 8)} — ${itemCount} item${itemCount > 1 ? 's' : ''}, ৳${netTotal.toFixed(2)}`,
        `/orders/${orderId}`
      );
    }

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
