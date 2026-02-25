import { NextResponse } from 'next/server';
import { getWishlistByUserId } from 'firebase-config/services/wishlist.service';

export async function GET(_request, { params }) {
  try {
    const { userId } = await params;
    const result = await getWishlistByUserId(userId);

    const statusCode = result.status === 'success' ? 200 : (result.code || 500);
    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    console.error('GET /api/wishlists/[userId] error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to fetch wishlist', data: null },
      { status: 500 }
    );
  }
}
