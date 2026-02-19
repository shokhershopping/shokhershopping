import { Timestamp, FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '../admin';
import { Collections } from '../collections/index';
import { successResponse, errorResponse } from '../helpers/response';
import type { FirestoreWishlist, WishlistItem } from '../types/wishlist.types';
import type { IResponse } from '../helpers/response';

const wishlistsCollection = adminDb.collection(Collections.WISHLISTS);

/**
 * Get a user's wishlist. Document ID = userId.
 */
export async function getWishlistByUserId(
  userId: string
): Promise<IResponse<FirestoreWishlist & { id: string }>> {
  try {
    const doc = await wishlistsCollection.doc(userId).get();

    if (!doc.exists) {
      // Return empty wishlist if none exists
      const emptyWishlist = { id: userId, items: [], createdAt: Timestamp.now(), updatedAt: Timestamp.now() };
      return successResponse(emptyWishlist, 'Wishlist retrieved successfully');
    }

    const wishlist = { id: doc.id, ...doc.data() } as FirestoreWishlist & { id: string };
    return successResponse(wishlist, 'Wishlist retrieved successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Failed to retrieve wishlist', 500, message);
  }
}

/**
 * Add an item to a user's wishlist. Creates the wishlist if it doesn't exist.
 * Skips duplicates (same productId).
 */
export async function addToWishlist(
  userId: string,
  item: {
    productId?: string;
    variantId?: string;
    productName: string;
    productImageUrl: string;
    productPrice: number;
  }
): Promise<IResponse<FirestoreWishlist & { id: string }>> {
  try {
    const docRef = wishlistsCollection.doc(userId);
    const doc = await docRef.get();
    const now = Timestamp.now();

    const newItem: WishlistItem = {
      id: `${item.productId || ''}_${item.variantId || ''}`,
      productId: item.productId ?? null,
      variantId: item.variantId ?? null,
      productName: item.productName,
      productImageUrl: item.productImageUrl,
      productPrice: item.productPrice,
      addedAt: now,
    };

    if (!doc.exists) {
      // Create new wishlist
      const wishlistData: FirestoreWishlist = {
        items: [newItem],
        createdAt: now,
        updatedAt: now,
      };
      await docRef.set(wishlistData);
    } else {
      const data = doc.data() as FirestoreWishlist;
      // Check for duplicate
      const exists = data.items.some((i) => i.id === newItem.id);
      if (exists) {
        const wishlist = { id: doc.id, ...data } as FirestoreWishlist & { id: string };
        return successResponse(wishlist, 'Item already in wishlist');
      }

      await docRef.update({
        items: FieldValue.arrayUnion(newItem),
        updatedAt: now,
      });
    }

    const updatedDoc = await docRef.get();
    const wishlist = { id: updatedDoc.id, ...updatedDoc.data() } as FirestoreWishlist & { id: string };

    return successResponse(wishlist, 'Item added to wishlist');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Failed to add to wishlist', 500, message);
  }
}

/**
 * Remove an item from a user's wishlist by item ID.
 */
export async function removeFromWishlist(
  userId: string,
  itemId: string
): Promise<IResponse<FirestoreWishlist & { id: string }>> {
  try {
    const docRef = wishlistsCollection.doc(userId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return errorResponse('Wishlist not found', 404);
    }

    const data = doc.data() as FirestoreWishlist;
    const updatedItems = data.items.filter((item) => item.id !== itemId);

    await docRef.update({
      items: updatedItems,
      updatedAt: Timestamp.now(),
    });

    const updatedDoc = await docRef.get();
    const wishlist = { id: updatedDoc.id, ...updatedDoc.data() } as FirestoreWishlist & { id: string };

    return successResponse(wishlist, 'Item removed from wishlist');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Failed to remove from wishlist', 500, message);
  }
}
