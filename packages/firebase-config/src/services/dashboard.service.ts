import { adminDb } from '../admin';
import { Collections } from '../collections/index';
import { successResponse, errorResponse } from '../helpers/response';
import { paginateQuery } from '../helpers/pagination';
import type { FirestoreProduct } from '../types/product.types';
import type { IResponse } from '../helpers/response';
import type { PaginatedResult } from '../helpers/pagination';

/**
 * Dashboard statistics: order count, total sales, product count, user count.
 */
export async function getDashboardStats(): Promise<
  IResponse<{
    totalOrders: number;
    totalSales: number;
    totalProducts: number;
    totalUsers: number;
  }>
> {
  try {
    const [ordersCount, productsCount, usersCount] = await Promise.all([
      adminDb.collection(Collections.ORDERS).count().get(),
      adminDb.collection(Collections.PRODUCTS).count().get(),
      adminDb.collection(Collections.USERS).count().get(),
    ]);

    // Calculate total sales by summing netTotal from all orders
    const ordersSnapshot = await adminDb
      .collection(Collections.ORDERS)
      .select('netTotal')
      .get();

    let totalSales = 0;
    ordersSnapshot.docs.forEach((doc) => {
      totalSales += (doc.data().netTotal as number) || 0;
    });

    return successResponse(
      {
        totalOrders: ordersCount.data().count,
        totalSales,
        totalProducts: productsCount.data().count,
        totalUsers: usersCount.data().count,
      },
      'Dashboard stats retrieved successfully'
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Failed to retrieve dashboard stats', 500, message);
  }
}

/**
 * Get top selling products by order count.
 */
export async function getTopProducts(
  limit: number = 10
): Promise<IResponse<FirestoreProduct[]>> {
  try {
    const snapshot = await adminDb
      .collection(Collections.PRODUCTS)
      .orderBy('orderCount', 'desc')
      .limit(limit)
      .get();

    const products = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as FirestoreProduct));

    return successResponse(products, 'Top products retrieved successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Failed to retrieve top products', 500, message);
  }
}

/**
 * Get products below a stock threshold (low stock report).
 */
export async function getStockReport(
  threshold: number = 10,
  limit: number = 10,
  page: number = 1
): Promise<IResponse<PaginatedResult<FirestoreProduct>['data']>> {
  try {
    const query = adminDb
      .collection(Collections.PRODUCTS)
      .where('stock', '<=', threshold)
      .orderBy('stock', 'asc');

    const result = await paginateQuery<FirestoreProduct>(query, { limit, page });

    return successResponse(result.data, 'Stock report retrieved successfully', {
      total: result.total,
      page: result.page,
      limit: result.limit,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Failed to retrieve stock report', 500, message);
  }
}
