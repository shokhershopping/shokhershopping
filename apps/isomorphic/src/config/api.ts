export const api = {
  product: {
    list: '/products',
    create: '/products/create',
    update: (id: string) => `/products/${id}`,
    delete: (id: string) => `/products/${id}`,
  },
  contentPost: {
    list: '/content-posts',
    create: '/content-posts',
    details: (id: string) => `/content-posts/${id}`,
    update: (id: string) => `/content-posts/${id}`,
    delete: (id: string) => `/content-posts/${id}`,
    checkSlug: '/content-posts/check-slug',
    upload: '/content-posts/upload',
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
    salesReport: '/dashboard?type=sales-report',
    topProducts: '/dashboard?type=top-products',
    customerAnalytics: '/dashboard?type=customer-analytics',
    userLocation: '/dashboard?type=user-location',
    stockReport: '/dashboard?type=stock-report',
  },
};
