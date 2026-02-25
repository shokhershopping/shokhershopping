/**
 * Firestore collection name constants.
 * Use these instead of hardcoded strings to prevent typos.
 */
export const Collections = {
  USERS: 'users',
  ADDRESSES: 'addresses',
  PREFERENCES: 'preferences',
  PRODUCTS: 'products',
  VARIANTS: 'variants',
  CATEGORIES: 'categories',
  ORDERS: 'orders',
  ORDER_ITEMS: 'items',
  COUPONS: 'coupons',
  REVIEWS: 'reviews',
  WISHLISTS: 'wishlists',
  CARTS: 'carts',
  NOTIFICATIONS: 'notifications',
  NOTIFICATION_RECIPIENTS: 'recipients',
  AFFILIATES: 'affiliates',
  AFFILIATE_CLICKS: 'clicks',
  AFFILIATE_PURCHASES: 'purchases',
  AFFILIATE_WITHDRAWALS: 'withdrawals',
  INVOICES: 'invoices',
  QNA: 'qna',
  REPLIES: 'replies',
  BANNERS: 'banners',
  MARQUEES: 'marquees',
} as const;

export type CollectionName = (typeof Collections)[keyof typeof Collections];
