import { NextResponse } from 'next/server';
import { getOrderById, updateOrderStatus } from 'firebase-config/services/order.service';
import { getProductById } from 'firebase-config/services/product.service';

export async function GET(_request, { params }) {
  try {
    const { id } = await params;
    const result = await getOrderById(id);

    // Enrich items that have missing product data (old orders)
    if (result.status === 'success' && result.data?.items) {
      const enrichedItems = await Promise.all(
        result.data.items.map(async (item) => {
          const needsEnrichment =
            !item.productName || item.productName === 'Unknown Product' ||
            !item.productPrice || item.productPrice === 0;

          if (needsEnrichment && item.productId) {
            try {
              const productResult = await getProductById(item.productId);
              if (productResult.status === 'success' && productResult.data) {
                const product = productResult.data;
                return {
                  ...item,
                  productName: product.name || item.productName || 'Unknown Product',
                  productPrice: product.salePrice || product.price || item.productPrice || 0,
                  productImageUrl: product.imageUrls?.[0] || item.productImageUrl || null,
                };
              }
            } catch (err) {
              console.warn(`[Order Detail] Failed to enrich item ${item.productId}:`, err.message);
            }
          }
          return item;
        })
      );
      result.data.items = enrichedItems;
    }

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
