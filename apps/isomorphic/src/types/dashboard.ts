// Dashboard API Response Types

export interface WeeklyDataPoint {
  day: string;
  value: number;
}

export interface MetricData {
  current: number;
  previous: number;
  percentageChange: number;
  weeklyData: WeeklyDataPoint[];
}

export interface DashboardStats {
  orders: MetricData;
  sales: MetricData;
  products: MetricData;
}

export interface SalesReportData {
  month: string;
  sales: number;
}

export interface TopProduct {
  id: string;
  name: string;
  thumbnail: string;
  price: number;
  salePrice: number | null;
  rating: number;
  totalSold: number;
}

export interface CustomerAnalyticsData {
  month: string;
  newCustomer: number;
  oldCustomer: number;
}

export interface UserLocationData {
  country: string;
  name: string;
  value: number;
}

export interface StockReportProduct {
  id: string;
  name: string;
  thumbnail: string;
  stock: number;
  status: string;
  price: number;
  salePrice: number | null;
}

// API Response wrapper
export interface DashboardApiResponse<T> {
  status: string;
  code: number;
  message: string;
  data: T;
  total?: number;
  totalPages?: number;
  page?: number;
  limit?: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}

// Chart data formats for components
export interface StatCardChartData {
  day: string;
  sale: number;
  cost?: number;
}

export interface SalesChartData {
  month: string;
  sales: number;
}

export interface CustomerChartData {
  month: string;
  newCustomer: number;
  oldCustomer: number;
}
