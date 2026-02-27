import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '../admin';
import { Collections } from '../collections/index';
import { successResponse, errorResponse } from '../helpers/response';
import { paginateQuery } from '../helpers/pagination';
import { buildQuery } from '../helpers/query-builder';
import type { FirestoreOrder, FirestoreOrderItem, OrderAddress, OrderTransaction } from '../types/order.types';
import type { OrderStatus, DeliveryOption } from '../types/enums';
import type { IResponse } from '../helpers/response';
import type { PaginatedResult } from '../helpers/pagination';
import type { QueryFilter } from '../helpers/query-builder';

const ordersCollection = adminDb.collection(Collections.ORDERS);

/**
 * Get a paginated list of orders with optional filters.
 */
export async function getOrders(
  limit: number = 10,
  page: number = 1,
  filters?: { status?: OrderStatus; userId?: string }
): Promise<IResponse<PaginatedResult<FirestoreOrder>['data']>> {
  try {
    const queryFilters: QueryFilter[] = [];

    if (filters?.status) {
      queryFilters.push({ field: 'status', operator: '==', value: filters.status });
    }
    if (filters?.userId) {
      queryFilters.push({ field: 'userId', operator: '==', value: filters.userId });
    }

    const query = buildQuery(ordersCollection, {
      filters: queryFilters,
      orderByField: 'createdAt',
      orderDirection: 'desc',
    });

    const result = await paginateQuery<FirestoreOrder>(query, { limit, page });

    return successResponse(result.data, 'Orders retrieved successfully', {
      total: result.total,
      page: result.page,
      limit: result.limit,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Failed to retrieve orders', 500, message);
  }
}

/**
 * Get a single order by ID, including its items subcollection.
 */
export async function getOrderById(
  id: string
): Promise<IResponse<(FirestoreOrder & { items: FirestoreOrderItem[] }) | null>> {
  try {
    const doc = await ordersCollection.doc(id).get();

    if (!doc.exists) {
      return errorResponse('Order not found', 404);
    }

    // Fetch order items subcollection
    let itemsSnapshot;
    try {
      itemsSnapshot = await ordersCollection
        .doc(id)
        .collection(Collections.ORDER_ITEMS)
        .orderBy('createdAt', 'asc')
        .get();
    } catch {
      // Fallback if index not available
      itemsSnapshot = await ordersCollection
        .doc(id)
        .collection(Collections.ORDER_ITEMS)
        .get();
    }

    const items = itemsSnapshot.docs.map((itemDoc) => ({
      id: itemDoc.id,
      ...itemDoc.data(),
    } as FirestoreOrderItem));

    const order = { id: doc.id, ...doc.data(), items } as FirestoreOrder & { items: FirestoreOrderItem[] };
    return successResponse(order, 'Order retrieved successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Failed to retrieve order', 500, message);
  }
}

/**
 * Get orders for a specific user.
 */
export async function getOrdersByUserId(
  userId: string,
  limit: number = 10,
  page: number = 1
): Promise<IResponse<PaginatedResult<FirestoreOrder>['data']>> {
  try {
    // Try with composite index (userId + createdAt desc)
    try {
      const query = ordersCollection
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc');

      const result = await paginateQuery<FirestoreOrder>(query, { limit, page });

      return successResponse(result.data, 'User orders retrieved successfully', {
        total: result.total,
        page: result.page,
        limit: result.limit,
      });
    } catch (indexError) {
      // If composite index is missing, fall back to simple query without orderBy
      // and sort in memory
      console.warn('Composite index may be missing for orders userId+createdAt, falling back to in-memory sort:',
        indexError instanceof Error ? indexError.message : indexError);

      const snapshot = await ordersCollection
        .where('userId', '==', userId)
        .limit(limit)
        .get();

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as FirestoreOrder[];

      // Sort by createdAt descending in memory
      data.sort((a, b) => {
        const aTime = a.createdAt && typeof a.createdAt === 'object' && 'toMillis' in a.createdAt
          ? (a.createdAt as Timestamp).toMillis()
          : 0;
        const bTime = b.createdAt && typeof b.createdAt === 'object' && 'toMillis' in b.createdAt
          ? (b.createdAt as Timestamp).toMillis()
          : 0;
        return bTime - aTime;
      });

      return successResponse(data, 'User orders retrieved successfully', {
        total: data.length,
        page: 1,
        limit,
      });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Failed to retrieve user orders', 500, message);
  }
}

/**
 * Create an order with its items.
 */
export async function createOrder(
  data: {
    userId: string;
    userName: string;
    userEmail: string;
    status?: OrderStatus;
    deliveryCharge?: number;
    deliveryOption?: DeliveryOption;
    total: number;
    itemsTotalDiscount?: number;
    couponAppliedDiscount?: number;
    totalWithDiscount?: number;
    netTotal: number;
    couponId?: string;
    couponCode?: string;
    billingAddress?: OrderAddress;
    shippingAddress?: OrderAddress;
    transaction?: OrderTransaction;
  },
  items: Array<{
    quantity: number;
    productId?: string;
    variantId?: string;
    productName: string;
    productPrice: number;
    productImageUrl?: string;
  }>
): Promise<IResponse<FirestoreOrder>> {
  try {
    const now = Timestamp.now();
    const batch = adminDb.batch();

    const orderData: Omit<FirestoreOrder, 'id'> = {
      userId: data.userId,
      userName: data.userName,
      userEmail: data.userEmail,
      status: data.status ?? 'PENDING',
      deliveryCharge: data.deliveryCharge ?? 0,
      deliveryOption: data.deliveryOption ?? 'STANDARD',
      total: data.total,
      itemsTotalDiscount: data.itemsTotalDiscount ?? 0,
      couponAppliedDiscount: data.couponAppliedDiscount ?? 0,
      totalWithDiscount: data.totalWithDiscount ?? data.total,
      netTotal: data.netTotal,
      couponId: data.couponId ?? null,
      couponCode: data.couponCode ?? null,
      billingAddress: data.billingAddress ?? null,
      shippingAddress: data.shippingAddress ?? null,
      transaction: data.transaction ?? null,
      createdAt: now,
      updatedAt: now,
    };

    const orderRef = ordersCollection.doc();
    batch.set(orderRef, orderData);

    // Create order items in subcollection
    for (const item of items) {
      const itemRef = orderRef.collection(Collections.ORDER_ITEMS).doc();
      const itemData: Omit<FirestoreOrderItem, 'id'> = {
        quantity: item.quantity,
        productId: item.productId ?? null,
        variantId: item.variantId ?? null,
        productName: item.productName,
        productPrice: item.productPrice,
        productImageUrl: item.productImageUrl ?? null,
        createdAt: now,
      };
      batch.set(itemRef, itemData);
    }

    await batch.commit();

    const order = { id: orderRef.id, ...orderData } as FirestoreOrder;
    return successResponse(order, 'Order created successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Failed to create order', 500, message);
  }
}

/**
 * Update order fields.
 */
export async function updateOrder(
  id: string,
  data: Partial<Omit<FirestoreOrder, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<IResponse<FirestoreOrder | null>> {
  try {
    const docRef = ordersCollection.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return errorResponse('Order not found', 404);
    }

    const updateData = {
      ...data,
      updatedAt: Timestamp.now(),
    };

    await docRef.update(updateData);

    const updatedDoc = await docRef.get();
    const order = { id: updatedDoc.id, ...updatedDoc.data() } as FirestoreOrder;

    return successResponse(order, 'Order updated successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Failed to update order', 500, message);
  }
}

/**
 * Find an order by Steadfast consignment ID.
 */
export async function getOrderBySteadfastConsignmentId(
  consignmentId: number
): Promise<IResponse<FirestoreOrder | null>> {
  try {
    const snapshot = await ordersCollection
      .where('steadfastConsignmentId', '==', consignmentId)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return errorResponse('Order not found for this consignment', 404);
    }

    const doc = snapshot.docs[0];
    const order = { id: doc.id, ...doc.data() } as FirestoreOrder;
    return successResponse(order, 'Order found');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Failed to find order by consignment ID', 500, message);
  }
}

/**
 * Update only the order status.
 */
export async function updateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<IResponse<FirestoreOrder | null>> {
  return updateOrder(id, { status });
}

/**
 * Delete an order and its items subcollection.
 */
export async function deleteOrder(
  id: string
): Promise<IResponse<null>> {
  try {
    const docRef = ordersCollection.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return errorResponse('Order not found', 404);
    }

    // Delete all items in subcollection
    const itemsSnapshot = await docRef.collection(Collections.ORDER_ITEMS).get();
    const batch = adminDb.batch();
    itemsSnapshot.docs.forEach((itemDoc) => batch.delete(itemDoc.ref));
    batch.delete(docRef);
    await batch.commit();

    return successResponse(null, 'Order deleted successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Failed to delete order', 500, message);
  }
}
