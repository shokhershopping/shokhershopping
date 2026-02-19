import { api } from '@/config/api';
import type {
  DashboardApiResponse,
  DashboardStats,
  SalesReportData,
  TopProduct,
  CustomerAnalyticsData,
  UserLocationData,
  StockReportProduct,
} from '@/types/dashboard';

const API_BASE_URL = '/api';

/**
 * Generic fetch function with error handling and authentication
 * @param endpoint - API endpoint
 * @param token - Clerk authentication token (optional for now during development)
 * @param options - Fetch options
 */
async function fetchAPI<T>(
  endpoint: string,
  token?: string | null,
  options?: RequestInit
): Promise<DashboardApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: `HTTP ${response.status}: ${response.statusText}`,
      }));
      throw new Error(error.message || 'API request failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Dashboard API Error:', error);
    throw error;
  }
}

/**
 * Get dashboard statistics (orders, sales, products)
 * @param period - Number of days to calculate stats for (default 30)
 * @param token - Optional Clerk auth token
 */
export async function getDashboardStats(
  period = 30,
  token?: string | null
): Promise<DashboardApiResponse<DashboardStats>> {
  const endpoint = `${api.dashboard.stats}?period=${period}`;
  return fetchAPI<DashboardStats>(endpoint, token);
}

/**
 * Get sales report grouped by month for a year
 * @param year - The year to get sales report for (default current year)
 * @param token - Optional Clerk auth token
 */
export async function getSalesReport(
  year?: number,
  token?: string | null
): Promise<DashboardApiResponse<SalesReportData[]>> {
  const selectedYear = year || new Date().getFullYear();
  const endpoint = `${api.dashboard.salesReport}?year=${selectedYear}`;
  return fetchAPI<SalesReportData[]>(endpoint, token);
}

/**
 * Get top selling products
 * @param params - Query parameters (limit, startDate, endDate)
 * @param token - Optional Clerk auth token
 */
export async function getTopProducts(
  params?: {
    limit?: number;
    startDate?: string;
    endDate?: string;
  },
  token?: string | null
): Promise<DashboardApiResponse<TopProduct[]>> {
  const queryParams = new URLSearchParams();

  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);

  const endpoint = `${api.dashboard.topProducts}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  return fetchAPI<TopProduct[]>(endpoint, token);
}

/**
 * Get customer analytics (new vs repeat customers) by year
 * @param year - The year to get analytics for (default current year)
 * @param token - Optional Clerk auth token
 */
export async function getCustomerAnalytics(
  year?: number,
  token?: string | null
): Promise<DashboardApiResponse<CustomerAnalyticsData[]>> {
  const selectedYear = year || new Date().getFullYear();
  const endpoint = `${api.dashboard.customerAnalytics}?year=${selectedYear}`;
  return fetchAPI<CustomerAnalyticsData[]>(endpoint, token);
}

/**
 * Get user geographic distribution by country
 * @param token - Optional Clerk auth token
 */
export async function getUserLocation(
  token?: string | null
): Promise<DashboardApiResponse<UserLocationData[]>> {
  return fetchAPI<UserLocationData[]>(api.dashboard.userLocation, token);
}

/**
 * Get stock report (low stock products)
 * @param params - Query parameters (page, limit, threshold)
 * @param token - Optional Clerk auth token
 */
export async function getStockReport(
  params?: {
    page?: number;
    limit?: number;
    threshold?: number;
  },
  token?: string | null
): Promise<DashboardApiResponse<StockReportProduct[]>> {
  const queryParams = new URLSearchParams();

  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.threshold) queryParams.append('threshold', params.threshold.toString());

  const endpoint = `${api.dashboard.stockReport}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  return fetchAPI<StockReportProduct[]>(endpoint, token);
}

/**
 * Get recent orders (uses existing orders API)
 * @param params - Query parameters (page, limit, sort, order)
 * @param token - Optional Clerk auth token
 */
export async function getRecentOrders(
  params?: {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
  },
  token?: string | null
): Promise<any> {
  const queryParams = new URLSearchParams();

  queryParams.append('page', (params?.page || 1).toString());
  queryParams.append('limit', (params?.limit || 7).toString());
  queryParams.append('sort', params?.sort || 'createdAt');
  queryParams.append('order', params?.order || 'desc');

  const endpoint = `${api.order.list}?${queryParams.toString()}`;
  return fetchAPI<any>(endpoint, token);
}
