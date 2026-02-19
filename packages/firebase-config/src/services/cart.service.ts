import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '../admin';
import { Collections } from '../collections/index';
import { successResponse, errorResponse } from '../helpers/response';
import type { FirestoreCart, CartItem } from '../types/cart.types';
import type { IResponse } from '../helpers/response';

const cartsCollection = adminDb.collection(Collections.CARTS);

/**
 * Get a user's cart. Document ID = userId.
 */
export async function getCartByUserId(
  userId: string
): Promise<IResponse<FirestoreCart & { id: string }>> {
  try {
    const doc = await cartsCollection.doc(userId).get();

    if (!doc.exists) {
      // Return empty cart if none exists
      const emptyCart = { id: userId, items: [], createdAt: Timestamp.now(), updatedAt: Timestamp.now() };
      return successResponse(emptyCart, 'Cart retrieved successfully');
    }

    const cart = { id: doc.id, ...doc.data() } as FirestoreCart & { id: string };
    return successResponse(cart, 'Cart retrieved successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Failed to retrieve cart', 500, message);
  }
}

/**
 * Add an item to the cart or update quantity if it already exists.
 */
export async function addToCart(
  userId: string,
  item: {
    productId?: string;
    variantId?: string;
    quantity: number;
    productName: string;
    productPrice: number;
    productImageUrl?: string;
  }
): Promise<IResponse<FirestoreCart & { id: string }>> {
  try {
    const docRef = cartsCollection.doc(userId);
    const doc = await docRef.get();
    const now = Timestamp.now();

    const itemId = `${item.productId || ''}_${item.variantId || ''}`;

    const newItem: CartItem = {
      id: itemId,
      productId: item.productId ?? null,
      variantId: item.variantId ?? null,
      quantity: item.quantity,
      productName: item.productName,
      productPrice: item.productPrice,
      productImageUrl: item.productImageUrl ?? null,
    };

    if (!doc.exists) {
      const cartData: FirestoreCart = {
        items: [newItem],
        createdAt: now,
        updatedAt: now,
      };
      await docRef.set(cartData);
    } else {
      const data = doc.data() as FirestoreCart;
      const existingIndex = data.items.findIndex((i) => i.id === itemId);

      if (existingIndex >= 0) {
        // Update quantity of existing item
        data.items[existingIndex].quantity += item.quantity;
      } else {
        data.items.push(newItem);
      }

      await docRef.update({
        items: data.items,
        updatedAt: now,
      });
    }

    const updatedDoc = await docRef.get();
    const cart = { id: updatedDoc.id, ...updatedDoc.data() } as FirestoreCart & { id: string };

    return successResponse(cart, 'Item added to cart');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Failed to add to cart', 500, message);
  }
}

/**
 * Update the quantity of a specific cart item.
 */
export async function updateCartItem(
  userId: string,
  itemId: string,
  quantity: number
): Promise<IResponse<FirestoreCart & { id: string }>> {
  try {
    const docRef = cartsCollection.doc(userId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return errorResponse('Cart not found', 404);
    }

    const data = doc.data() as FirestoreCart;
    const itemIndex = data.items.findIndex((i) => i.id === itemId);

    if (itemIndex < 0) {
      return errorResponse('Cart item not found', 404);
    }

    if (quantity <= 0) {
      // Remove item if quantity is zero or negative
      data.items.splice(itemIndex, 1);
    } else {
      data.items[itemIndex].quantity = quantity;
    }

    await docRef.update({
      items: data.items,
      updatedAt: Timestamp.now(),
    });

    const updatedDoc = await docRef.get();
    const cart = { id: updatedDoc.id, ...updatedDoc.data() } as FirestoreCart & { id: string };

    return successResponse(cart, 'Cart item updated');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Failed to update cart item', 500, message);
  }
}

/**
 * Remove a specific item from the cart.
 */
export async function removeFromCart(
  userId: string,
  itemId: string
): Promise<IResponse<FirestoreCart & { id: string }>> {
  try {
    const docRef = cartsCollection.doc(userId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return errorResponse('Cart not found', 404);
    }

    const data = doc.data() as FirestoreCart;
    const updatedItems = data.items.filter((item) => item.id !== itemId);

    await docRef.update({
      items: updatedItems,
      updatedAt: Timestamp.now(),
    });

    const updatedDoc = await docRef.get();
    const cart = { id: updatedDoc.id, ...updatedDoc.data() } as FirestoreCart & { id: string };

    return successResponse(cart, 'Item removed from cart');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Failed to remove from cart', 500, message);
  }
}

/**
 * Clear all items from a user's cart.
 */
export async function clearCart(
  userId: string
): Promise<IResponse<null>> {
  try {
    const docRef = cartsCollection.doc(userId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return successResponse(null, 'Cart is already empty');
    }

    await docRef.update({
      items: [],
      updatedAt: Timestamp.now(),
    });

    return successResponse(null, 'Cart cleared successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Failed to clear cart', 500, message);
  }
}
