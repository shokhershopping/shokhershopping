// Firebase SDK exports
export { adminDb, adminAuth, adminStorage, adminApp } from './admin';
export { clientAuth, clientDb, clientStorage, clientApp } from './client';

// Auth helpers
export {
  verifyIdToken,
  verifySessionCookie,
  createSessionCookie,
  getUserByUid,
  getUserByEmail,
  setUserClaims,
  extractTokenFromHeader,
} from './auth';

// Storage helpers
export {
  uploadFile,
  uploadMultipleFiles,
  deleteFile,
  getSignedUrl,
  resolveImageUrl,
} from './storage';

// Types
export * from './types';

// Collection constants
export { Collections } from './collections';
export type { CollectionName } from './collections';

// Helpers
export {
  type IResponse,
  successResponse,
  errorResponse,
} from './helpers/response';

export {
  type PaginationParams,
  type PaginatedResult,
  paginateQuery,
  parsePaginationParams,
} from './helpers/pagination';

export {
  type QueryFilter,
  type QueryOptions,
  buildQuery,
  generateSearchTokens,
} from './helpers/query-builder';

// Services
export {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserMetadata,
  getAdminUserIds,
} from './services/user.service';

export {
  getAllCategories,
  getCategoryById,
  getFeaturedCategories,
  getSlideCategories,
  getMenuCategories,
  getSubcategories,
  getAllDescendantIds,
  createCategory,
  updateCategory,
  deleteCategory,
} from './services/category.service';

export {
  getProducts,
  getProductById,
  getLatestProducts,
  getTopSellingProducts,
  getFeaturedProducts,
  getSlideProducts,
  searchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductVariants,
  createVariant,
  updateVariant,
  deleteVariant,
  isSkuUnique,
} from './services/product.service';

export {
  getReviews,
  getReviewById,
  getReviewsByProductId,
  getReviewsByUserId,
  getReviewStats,
  createReview,
  updateReviewStatus,
  deleteReview,
} from './services/review.service';

export {
  getWishlistByUserId,
  addToWishlist,
  removeFromWishlist,
} from './services/wishlist.service';

export {
  getCoupons,
  getCouponById,
  getCouponByCode,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from './services/coupon.service';

export {
  getOrders,
  getOrderById,
  getOrdersByUserId,
  getOrderBySteadfastConsignmentId,
  createOrder,
  updateOrder,
  updateOrderStatus,
  deleteOrder,
} from './services/order.service';

export {
  getInvoicesByOrderId,
  getInvoiceById,
  createInvoice,
} from './services/invoice.service';

export {
  getNotificationsByUserId,
  createNotification,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  deleteNotification,
} from './services/notification.service';

export { notifyAdmins } from './services/admin-notification.helper';

export {
  getDashboardStats,
  getSalesReport,
  getTopProducts,
  getStockReport,
  getUserLocation,
  getCustomerAnalytics,
} from './services/dashboard.service';

export {
  getCartByUserId,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from './services/cart.service';

export {
  getBanners,
  getActiveBanners,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner,
} from './services/banner.service';

export {
  getMarquees,
  getActiveMarquees,
  getMarqueeById,
  createMarquee,
  updateMarquee,
  deleteMarquee,
} from './services/marquee.service';

export {
  getDeliveryAreas,
  getActiveDeliveryAreas,
  getDeliveryAreaById,
  createDeliveryArea,
  updateDeliveryArea,
  deleteDeliveryArea,
} from './services/delivery-area.service';

export {
  getSettings,
  updateSettings,
} from './services/settings.service';

export {
  createSteadfastOrder,
  getSteadfastStatus,
  getSteadfastStatusByTracking,
} from './services/steadfast.service';
export type {
  SteadfastOrderData,
  SteadfastConsignment,
  SteadfastCreateResponse,
  SteadfastStatusResponse,
} from './services/steadfast.service';
