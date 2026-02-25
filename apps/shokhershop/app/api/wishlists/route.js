import { NextResponse } from 'next/server';
import { addToWishlist } from 'firebase-config/services/wishlist.service';

export async function POST(request) {
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
