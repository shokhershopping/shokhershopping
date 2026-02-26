import { NextResponse } from 'next/server';
import { removeFromWishlist } from 'firebase-config/services/wishlist.service';

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, itemId, itemIds } = body;

    // Support both itemId (singular) and itemIds (array)
    const id = itemId || (Array.isArray(itemIds) ? itemIds[0] : null);

    if (!userId || !id) {
      return NextResponse.json(
        { status: 'error', message: 'userId and itemId are required', data: null },
        { status: 400 }
      );
    }

    const result = await removeFromWishlist(userId, id);

    const statusCode = result.status === 'success' ? 200 : (result.code || 500);
    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    console.error('POST /api/wishlists/remove error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to remove from wishlist', data: null },
      { status: 500 }
    );
  }
}
