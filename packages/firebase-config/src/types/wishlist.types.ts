import type { Timestamp } from 'firebase-admin/firestore';

/** Embedded wishlist item */
export interface WishlistItem {
  id: string;
  productId: string | null;
  variantId: string | null;
  productName: string;
  productImageUrl: string;
  productPrice: number;
  addedAt: Timestamp;
}

/** Firestore: /wishlists/{userId} (document ID = userId) */
export interface FirestoreWishlist {
  items: WishlistItem[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
