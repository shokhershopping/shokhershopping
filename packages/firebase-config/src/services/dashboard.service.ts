import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '../admin';
import { Collections } from '../collections/index';
import { successResponse, errorResponse } from '../helpers/response';
import { paginateQuery } from '../helpers/pagination';
import type { FirestoreProduct } from '../types/product.types';
import type { IResponse } from '../helpers/response';
import type { PaginatedResult } from '../helpers/pagination';

/**
 * Dashboard statistics: orders, sales, products with current/previous period comparison & weekly chart data.
 */
export async function getDashboardStats(
  periodDays: number = 30
): Promise<IResponse<{
  orders: { current: number; previous: number; percentageChange: number; weeklyData: Array<{ day: string; value: number }> };
  sales: { current: number; previous: number; percentageChange: number; weeklyData: Array<{ day: string; value: number }> };
  products: { current: number; previous: number; percentageChange: number; weeklyData: Array<{ day: string; value: number }> };
}>> {
  try {
    const now = new Date();
    const currentPeriodStart = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);
    const previousPeriodStart = new Date(currentPeriodStart.getTime() - periodDays * 24 * 60 * 60 * 1000);

    const currentTimestamp = Timestamp.fromDate(currentPeriodStart);
    const previousTimestamp = Timestamp.fromDate(previousPeriodStart);

    // Fetch orders for current and previous periods
    const [currentOrdersSnap, previousOrdersSnap, currentProductsSnap, previousProductsSnap] = await Promise.all([
      adminDb.collection(Collections.ORDERS)
        .where('createdAt', '>=', currentTimestamp)
        .get(),
      adminDb.collection(Collections.ORDERS)
        .where('createdAt', '>=', previousTimestamp)
        .where('createdAt', '<', currentTimestamp)
        .get(),
      adminDb.collection(Collections.PRODUCTS)
        .where('createdAt', '>=', currentTimestamp)
        .get(),
      adminDb.collection(Collections.PRODUCTS)
        .where('createdAt', '>=', previousTimestamp)
        .where('createdAt', '<', currentTimestamp)
        .get(),
    ]);

    // Calculate order counts
    const currentOrders = currentOrdersSnap.size;
    const previousOrders = previousOrdersSnap.size;

    // Calculate sales totals
    let currentSales = 0;
    currentOrdersSnap.docs.forEach((doc) => {
      currentSales += (doc.data().netTotal as number) || (doc.data().total as number) || 0;
    });
    let previousSales = 0;
    previousOrdersSnap.docs.forEach((doc) => {
      previousSales += (doc.data().netTotal as number) || (doc.data().total as number) || 0;
    });

    // Calculate product counts
    const currentProducts = currentProductsSnap.size;
    const previousProducts = previousProductsSnap.size;

    // Helper to calculate percentage change
    function calcPercentage(current: number, previous: number): number {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    }

    // Generate weekly data for charts (last 7 days)
    function generateWeeklyData(
      docs: FirebaseFirestore.QueryDocumentSnapshot[],
      valueField?: string
    ): Array<{ day: string; value: number }> {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const weekData: Record<string, number> = {};

      // Initialize all 7 days
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dayName = days[d.getDay()];
        weekData[dayName] = 0;
      }

      // Aggregate data from last 7 days
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      docs.forEach((doc) => {
        const data = doc.data();
        const createdAt = data.createdAt?.toDate?.() || new Date();
        if (createdAt >= sevenDaysAgo) {
          const dayName = days[createdAt.getDay()];
          if (valueField) {
            weekData[dayName] = (weekData[dayName] || 0) + ((data[valueField] as number) || 0);
          } else {
            weekData[dayName] = (weekData[dayName] || 0) + 1;
          }
        }
      });

      // Return in order (last 7 days)
      const result: Array<{ day: string; value: number }> = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dayName = days[d.getDay()];
        result.push({ day: dayName, value: weekData[dayName] || 0 });
      }
      return result;
    }

    return successResponse(
      {
        orders: {
          current: currentOrders,
          previous: previousOrders,
          percentageChange: calcPercentage(currentOrders, previousOrders),
          weeklyData: generateWeeklyData(currentOrdersSnap.docs),
        },
        sales: {
          current: currentSales,
          previous: previousSales,
          percentageChange: calcPercentage(currentSales, previousSales),
          weeklyData: generateWeeklyData(currentOrdersSnap.docs, 'netTotal'),
        },
        products: {
          current: currentProducts,
          previous: previousProducts,
          percentageChange: calcPercentage(currentProducts, previousProducts),
          weeklyData: generateWeeklyData(currentProductsSnap.docs),
        },
      },
      'Dashboard stats retrieved successfully'
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Failed to retrieve dashboard stats', 500, message);
  }
}

/**
 * Get monthly sales report for a given year.
 */
export async function getSalesReport(
  year: number = new Date().getFullYear()
): Promise<IResponse<Array<{ month: string; sales: number }>>> {
  try {
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year + 1, 0, 1);

    const snapshot = await adminDb
      .collection(Collections.ORDERS)
      .where('createdAt', '>=', Timestamp.fromDate(startOfYear))
      .where('createdAt', '<', Timestamp.fromDate(endOfYear))
      .select('netTotal', 'total', 'createdAt')
      .get();

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlySales: number[] = new Array(12).fill(0);

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      const createdAt = data.createdAt?.toDate?.();
      if (createdAt) {
        const monthIndex = createdAt.getMonth();
        monthlySales[monthIndex] += (data.netTotal as number) || (data.total as number) || 0;
      }
    });

    const salesData = months.map((month, index) => ({
      month,
      sales: Math.round(monthlySales[index] * 100) / 100,
    }));

    return successResponse(salesData, 'Sales report retrieved successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Failed to retrieve sales report', 500, message);
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
