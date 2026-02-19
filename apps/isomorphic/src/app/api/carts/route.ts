import { NextRequest, NextResponse } from 'next/server';
import {
  getCartByUserId,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from 'firebase-config/services/cart.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { status: 'error', message: 'userId is required', data: null },
        { status: 400 }
      );
    }

    const result = await getCartByUserId(userId);

    const statusCode = result.status === 'success' ? 200 : (result.code || 500);
    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    console.error('GET /api/carts error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to fetch cart', data: null },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, ...item } = body;

    if (!userId) {
      return NextResponse.json(
        { status: 'error', message: 'userId is required', data: null },
        { status: 400 }
      );
    }

    const result = await addToCart(userId, item);

    const statusCode = result.status === 'success' ? 200 : (result.code || 500);
    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    console.error('POST /api/carts error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to add to cart', data: null },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, itemId, quantity } = body;

    if (!userId || !itemId) {
      return NextResponse.json(
        { status: 'error', message: 'userId and itemId are required', data: null },
        { status: 400 }
      );
    }

    const result = await updateCartItem(userId, itemId, quantity);

    const statusCode = result.status === 'success' ? 200 : (result.code || 500);
    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    console.error('PATCH /api/carts error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to update cart item', data: null },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const itemId = searchParams.get('itemId');
    const clearAll = searchParams.get('clear') === 'true';

    if (!userId) {
      return NextResponse.json(
        { status: 'error', message: 'userId is required', data: null },
        { status: 400 }
      );
    }

    if (clearAll) {
      const result = await clearCart(userId);
      const statusCode = result.status === 'success' ? 200 : (result.code || 500);
      return NextResponse.json(result, { status: statusCode });
    }

    if (!itemId) {
      return NextResponse.json(
        { status: 'error', message: 'itemId is required (or use clear=true)', data: null },
        { status: 400 }
      );
    }

    const result = await removeFromCart(userId, itemId);

    const statusCode = result.status === 'success' ? 200 : (result.code || 500);
    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    console.error('DELETE /api/carts error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to update cart', data: null },
      { status: 500 }
    );
  }
}
