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
} from './services/user.service';
