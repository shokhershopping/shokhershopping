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
 * Get top selling products by order count, optionally filtered by date range.
 * Returns data shaped for the dashboard widget: { id, name, thumbnail, price, salePrice, rating, totalSold }
 */
export async function getTopProducts(
  limit: number = 10,
  startDate?: string,
  endDate?: string
): Promise<IResponse<any[]>> {
  try {
    // Aggregate sales from order items (with or without date filter)
    let ordersSnap;
    if (startDate && endDate) {
      const start = Timestamp.fromDate(new Date(startDate));
      const end = Timestamp.fromDate(new Date(endDate));
      ordersSnap = await adminDb
        .collection(Collections.ORDERS)
        .where('createdAt', '>=', start)
        .where('createdAt', '<=', end)
        .select('createdAt')
        .get();
    } else {
      // Fetch all orders
      ordersSnap = await adminDb
        .collection(Collections.ORDERS)
        .select('createdAt')
        .get();
    }

    // Count product sales from order items
    const productSales: Record<string, number> = {};

    for (const orderDoc of ordersSnap.docs) {
      const itemsSnap = await adminDb
        .collection(Collections.ORDERS)
        .doc(orderDoc.id)
        .collection(Collections.ORDER_ITEMS)
        .get();
      itemsSnap.docs.forEach((itemDoc) => {
        const data = itemDoc.data();
        if (data.productId) {
          productSales[data.productId] = (productSales[data.productId] || 0) + (data.quantity || 1);
        }
      });
    }

    // If no sales found from orders, fall back to all products sorted by stock (most popular approximation)
    if (Object.keys(productSales).length === 0) {
      const fallbackSnap = await adminDb
        .collection(Collections.PRODUCTS)
        .limit(limit)
        .get();

      const products = fallbackSnap.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || 'Unknown Product',
          thumbnail: data.imageUrls?.[0] || '',
          price: data.price || 0,
          salePrice: data.salePrice ?? null,
          rating: data.averageRating || 5,
          totalSold: 0,
        };
      });

      return successResponse(products, 'Top products retrieved successfully');
    }

    // Sort by sales count and take top N
    const sortedProductIds = Object.entries(productSales)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([id, count]) => ({ id, count }));

    // Fetch product details
    const products: any[] = [];
    for (const { id: pid, count } of sortedProductIds) {
      const doc = await adminDb.collection(Collections.PRODUCTS).doc(pid).get();
      if (doc.exists) {
        const data = doc.data()!;
        products.push({
          id: doc.id,
          name: data.name || 'Unknown Product',
          thumbnail: data.imageUrls?.[0] || '',
          price: data.price || 0,
          salePrice: data.salePrice ?? null,
          rating: data.averageRating || 5,
          totalSold: count,
        });
      }
    }

    return successResponse(products, 'Top products retrieved successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Failed to retrieve top products', 500, message);
  }
}

/**
 * Get products below a stock threshold (low stock report).
 * Calculates total stock from variants when variants exist.
 * Returns data shaped for the dashboard widget: { id, name, thumbnail, stock, status, price, salePrice }
 */
export async function getStockReport(
  threshold: number = 10,
  limit: number = 10,
  page: number = 1
): Promise<IResponse<any[]>> {
  try {
    // Fetch all products and compute real stock (variant sum or base stock)
    const allProductsSnap = await adminDb
      .collection(Collections.PRODUCTS)
      .get();

    const lowStockProducts: Array<{
      id: string;
      name: string;
      thumbnail: string;
      stock: number;
      status: string;
      price: number;
      salePrice: number | null;
    }> = [];

    for (const doc of allProductsSnap.docs) {
      const data = doc.data();

      // Calculate total stock from variants if they exist
      const variantsSnap = await doc.ref
        .collection(Collections.VARIANTS)
        .get();

      let totalStock: number;
      if (variantsSnap.size > 0) {
        totalStock = variantsSnap.docs.reduce(
          (sum, v) => sum + ((v.data().stock as number) || 0),
          0
        );
      } else {
        totalStock = (data.stock as number) || 0;
      }

      if (totalStock <= threshold) {
        lowStockProducts.push({
          id: doc.id,
          name: data.name || 'Unknown Product',
          thumbnail: data.imageUrls?.[0] || '',
          stock: totalStock,
          status: data.status || 'DRAFT',
          price: data.price || 0,
          salePrice: data.salePrice ?? null,
        });
      }
    }

    // Sort by stock ascending (lowest first)
    lowStockProducts.sort((a, b) => a.stock - b.stock);

    // Paginate manually
    const total = lowStockProducts.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const pageData = lowStockProducts.slice(startIndex, startIndex + limit);

    return successResponse(pageData, 'Stock report retrieved successfully', {
      total,
      page,
      limit,
      totalPages,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Failed to retrieve stock report', 500, message);
  }
}

/**
 * Get user geographic distribution from order shipping addresses.
 * Since this is a Bangladesh-focused store, we aggregate by city from shipping addresses.
 * Returns data in { country, name, value } format for world map component.
 */
export async function getUserLocation(): Promise<IResponse<Array<{ country: string; name: string; value: number }>>> {
  try {
    const snapshot = await adminDb
      .collection(Collections.ORDERS)
      .select('shippingAddress')
      .get();

    const cityCounts: Record<string, number> = {};
    let totalOrders = 0;

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      const city = data.shippingAddress?.city || data.shippingAddress?.state || 'Unknown';
      if (city && city !== 'Unknown') {
        cityCounts[city] = (cityCounts[city] || 0) + 1;
        totalOrders++;
      }
    });

    if (totalOrders === 0) {
      // Return Bangladesh as default since it's a BD-focused store
      return successResponse(
        [{ country: 'BD', name: 'Bangladesh', value: 100 }],
        'User location data retrieved successfully'
      );
    }

    // Convert to percentage and sort by value descending
    const locationData = Object.entries(cityCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([city, count]) => ({
        country: 'BD', // Bangladesh ISO code for world map
        name: city,
        value: Math.round((count / totalOrders) * 100),
      }));

    // Ensure percentages add up; adjust the largest if needed
    const totalPercent = locationData.reduce((sum, d) => sum + d.value, 0);
    if (totalPercent !== 100 && locationData.length > 0) {
      locationData[0].value += 100 - totalPercent;
    }

    return successResponse(locationData, 'User location data retrieved successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Failed to retrieve user location data', 500, message);
  }
}

/**
 * Get customer analytics: new vs repeat customers per month for a given year.
 * A "new customer" placed their first-ever order in that month.
 * A "repeat customer" (oldCustomer) had placed orders before that month.
 */
export async function getCustomerAnalytics(
  year: number = new Date().getFullYear()
): Promise<IResponse<Array<{ month: string; newCustomer: number; oldCustomer: number }>>> {
  try {
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year + 1, 0, 1);

    // Fetch all orders for this year
    const yearOrdersSnap = await adminDb
      .collection(Collections.ORDERS)
      .where('createdAt', '>=', Timestamp.fromDate(startOfYear))
      .where('createdAt', '<', Timestamp.fromDate(endOfYear))
      .select('userId', 'createdAt')
      .get();

    // Fetch all orders before this year to know who is a pre-existing customer
    const previousOrdersSnap = await adminDb
      .collection(Collections.ORDERS)
      .where('createdAt', '<', Timestamp.fromDate(startOfYear))
      .select('userId')
      .get();

    // Build set of users who ordered before this year
    const preExistingCustomers = new Set<string>();
    previousOrdersSnap.docs.forEach((doc) => {
      const userId = doc.data().userId;
      if (userId) preExistingCustomers.add(userId);
    });

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyNew: number[] = new Array(12).fill(0);
    const monthlyOld: number[] = new Array(12).fill(0);

    // Track first order month for each user within this year
    const userFirstMonth: Record<string, number> = {};

    // First pass: determine each user's first order month this year
    yearOrdersSnap.docs.forEach((doc) => {
      const data = doc.data();
      const userId = data.userId;
      const createdAt = data.createdAt?.toDate?.();
      if (!userId || !createdAt) return;

      const monthIndex = createdAt.getMonth();
      if (userFirstMonth[userId] === undefined || monthIndex < userFirstMonth[userId]) {
        userFirstMonth[userId] = monthIndex;
      }
    });

    // Second pass: categorize each user-month combination
    // Track unique users per month to avoid counting the same user twice in a month
    const monthUserSets: Set<string>[] = Array.from({ length: 12 }, () => new Set<string>());

    yearOrdersSnap.docs.forEach((doc) => {
      const data = doc.data();
      const userId = data.userId;
      const createdAt = data.createdAt?.toDate?.();
      if (!userId || !createdAt) return;

      const monthIndex = createdAt.getMonth();
      if (monthUserSets[monthIndex].has(userId)) return; // Already counted this month
      monthUserSets[monthIndex].add(userId);

      if (preExistingCustomers.has(userId)) {
        // User ordered before this year — always a repeat customer
        monthlyOld[monthIndex]++;
      } else if (userFirstMonth[userId] === monthIndex) {
        // First order this year is in this month — new customer
        monthlyNew[monthIndex]++;
      } else {
        // First order was in an earlier month this year — repeat customer
        monthlyOld[monthIndex]++;
      }
    });

    const analyticsData = months.map((month, index) => ({
      month,
      newCustomer: monthlyNew[index],
      oldCustomer: monthlyOld[index],
    }));

    return successResponse(analyticsData, 'Customer analytics retrieved successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Failed to retrieve customer analytics', 500, message);
  }
}
