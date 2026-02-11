import type { Timestamp } from 'firebase-admin/firestore';

/** Embedded cart item */
export interface CartItem {
  id: string;
  productId: string | null;
  variantId: string | null;
  quantity: number;
  productName: string;
  productPrice: number;
  productImageUrl: string | null;
}

/** Firestore: /carts/{userId} (document ID = userId) */
export interface FirestoreCart {
  items: CartItem[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
