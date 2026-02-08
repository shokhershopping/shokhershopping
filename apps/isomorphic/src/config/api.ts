export const api = {
  product: {
    list: '/products',
    create: '/products/create',
    update: (id: string) => `/products/${id}`,
    delete: (id: string) => `/products/${id}`,
  },
  category: {
    list: '/categories',
    create: '/categories/create',
    update: (id: string) => `/categories/${id}`,
    delete: (id: string) => `/categories/${id}`,
  },
  order: {
    list: '/orders',
    create: '/orders/create',
    update: (id: string) => `/orders/${id}`,
    delete: (id: string) => `/orders/${id}`,
  },
  transaction: {
    list: '/transactions',
    create: '/transactions/create',
    update: (id: string) => `/transactions/${id}`,
    delete: (id: string) => `/transactions/${id}`,
  },
  dashboard: {
    stats: '/dashboard/stats',
    salesReport: '/dashboard/sales-report',
    topProducts: '/dashboard/top-products',
    customerAnalytics: '/dashboard/customer-analytics',
    userLocation: '/dashboard/user-location',
    stockReport: '/dashboard/stock-report',
  },
};
