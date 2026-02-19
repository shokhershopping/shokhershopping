import { NextRequest, NextResponse } from 'next/server';
import {
  getWishlistByUserId,
  addToWishlist,
  removeFromWishlist,
} from 'firebase-config/services/wishlist.service';

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

    const result = await getWishlistByUserId(userId);

    const statusCode = result.status === 'success' ? 200 : (result.code || 500);
    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    console.error('GET /api/wishlists error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to fetch wishlist', data: null },
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

    const result = await addToWishlist(userId, item);

    const statusCode = result.status === 'success' ? 200 : (result.code || 500);
    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    console.error('POST /api/wishlists error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to add to wishlist', data: null },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const itemId = searchParams.get('itemId');

    if (!userId || !itemId) {
      return NextResponse.json(
        { status: 'error', message: 'userId and itemId are required', data: null },
        { status: 400 }
      );
    }

    const result = await removeFromWishlist(userId, itemId);

    const statusCode = result.status === 'success' ? 200 : (result.code || 500);
    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    console.error('DELETE /api/wishlists error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to remove from wishlist', data: null },
      { status: 500 }
    );
  }
}
