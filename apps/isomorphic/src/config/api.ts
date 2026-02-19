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
    stats: '/dashboard?type=stats',
    salesReport: '/dashboard?type=stats',
    topProducts: '/dashboard?type=top-products',
    customerAnalytics: '/dashboard?type=stats',
    userLocation: '/dashboard?type=stats',
    stockReport: '/dashboard?type=stock-report',
  },
};
