import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '../admin';
import { Collections } from '../collections/index';
import { successResponse, errorResponse } from '../helpers/response';
import { paginateQuery } from '../helpers/pagination';
import type { FirestoreCoupon } from '../types/coupon.types';
import type { CouponType, CouponStatus } from '../types/enums';
import type { IResponse } from '../helpers/response';
import type { PaginatedResult } from '../helpers/pagination';

const couponsCollection = adminDb.collection(Collections.COUPONS);

/**
 * Get a paginated list of coupons.
 */
export async function getCoupons(
  limit: number = 10,
  page: number = 1
): Promise<IResponse<PaginatedResult<FirestoreCoupon>['data']>> {
  try {
    const query = couponsCollection.orderBy('createdAt', 'desc');
    const result = await paginateQuery<FirestoreCoupon>(query, { limit, page });

    return successResponse(result.data, 'Coupons retrieved successfully', {
      total: result.total,
      page: result.page,
      limit: result.limit,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Failed to retrieve coupons', 500, message);
  }
}

/**
 * Get a single coupon by ID.
 */
export async function getCouponById(
  id: string
): Promise<IResponse<FirestoreCoupon | null>> {
  try {
    const doc = await couponsCollection.doc(id).get();

    if (!doc.exists) {
      return errorResponse('Coupon not found', 404);
    }

    const coupon = { id: doc.id, ...doc.data() } as FirestoreCoupon;
    return successResponse(coupon, 'Coupon retrieved successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Failed to retrieve coupon', 500, message);
  }
}

/**
 * Get an active coupon by its code (for validation at checkout).
 */
export async function getCouponByCode(
  code: string
): Promise<IResponse<FirestoreCoupon | null>> {
  try {
    const snapshot = await couponsCollection
      .where('code', '==', code.toUpperCase())
      .where('status', '==', 'ACTIVE')
      .limit(1)
      .get();

    if (snapshot.empty) {
      return errorResponse('Coupon not found or inactive', 404);
    }

    const doc = snapshot.docs[0];
    const coupon = { id: doc.id, ...doc.data() } as FirestoreCoupon;

    // Check if coupon has expired
    const now = Timestamp.now();
    const expiryTs = coupon.expiry instanceof Timestamp ? coupon.expiry : toTimestamp(coupon.expiry);
    if (expiryTs.toMillis() < now.toMillis()) {
      return errorResponse('Coupon has expired', 400);
    }

    // Check usage limit
    if (coupon.limit > 0 && coupon.used >= coupon.limit) {
      return errorResponse('Coupon usage limit reached', 400);
    }

    return successResponse(coupon, 'Coupon retrieved successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Failed to retrieve coupon', 500, message);
  }
}

/**
 * Create a new coupon.
 */
// Helper to safely convert a date value (string, Date, or undefined) to a Firestore Timestamp
function toTimestamp(value: any, fallback?: Timestamp): Timestamp {
  if (!value) return fallback ?? Timestamp.now();
  if (value instanceof Timestamp) return value;
  if (value instanceof Date) return Timestamp.fromDate(value);
  // String date like "2026-03-01"
  const parsed = new Date(value);
  if (!isNaN(parsed.getTime())) return Timestamp.fromDate(parsed);
  return fallback ?? Timestamp.now();
}

export async function createCoupon(data: {
  code: string;
  description?: string;
  amount: number;
  type: CouponType;
  start?: any;
  end?: any;
  expiry?: any;
  minimum?: number;
  maximum?: number;
  limit?: number;
  status?: CouponStatus;
  creatorId?: string;
  eligibleUserIds?: string[];
}): Promise<IResponse<FirestoreCoupon>> {
  try {
    const now = Timestamp.now();
    // Default expiry: 1 year from now
    const defaultExpiry = Timestamp.fromDate(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000));

    const startTs = toTimestamp(data.start, now);
    const endTs = toTimestamp(data.end || data.expiry, defaultExpiry);

    const couponData: Omit<FirestoreCoupon, 'id'> = {
      code: data.code.toUpperCase(),
      description: data.description ?? null,
      amount: data.amount,
      type: data.type,
      start: startTs,
      end: endTs,
      expiry: endTs,
      minimum: data.minimum ?? 0,
      maximum: data.maximum ?? 0,
      used: 0,
      limit: data.limit ?? 0,
      status: data.status ?? 'ACTIVE',
      creatorId: data.creatorId ?? null,
      eligibleUserIds: data.eligibleUserIds ?? [],
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await couponsCollection.add(couponData);
    const coupon = { id: docRef.id, ...couponData } as FirestoreCoupon;

    return successResponse(coupon, 'Coupon created successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Failed to create coupon', 500, message);
  }
}

/**
 * Update a coupon.
 */
export async function updateCoupon(
  id: string,
  data: Partial<Omit<FirestoreCoupon, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<IResponse<FirestoreCoupon | null>> {
  try {
    const docRef = couponsCollection.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return errorResponse('Coupon not found', 404);
    }

    const updateData: Record<string, unknown> = {
      ...data,
      updatedAt: Timestamp.now(),
    };

    // Convert date values (string or Date) to Timestamps if present
    if (data.start) {
      updateData.start = toTimestamp(data.start);
    }
    if (data.end) {
      updateData.end = toTimestamp(data.end);
    }
    if (data.expiry) {
      updateData.expiry = toTimestamp(data.expiry);
    }

    // Uppercase code if provided
    if (data.code) {
      updateData.code = (data.code as string).toUpperCase();
    }

    await docRef.update(updateData);

    const updatedDoc = await docRef.get();
    const coupon = { id: updatedDoc.id, ...updatedDoc.data() } as FirestoreCoupon;

    return successResponse(coupon, 'Coupon updated successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Failed to update coupon', 500, message);
  }
}

/**
 * Delete a coupon.
 */
export async function deleteCoupon(
  id: string
): Promise<IResponse<null>> {
  try {
    const docRef = couponsCollection.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return errorResponse('Coupon not found', 404);
    }

    await docRef.delete();

    return successResponse(null, 'Coupon deleted successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Failed to delete coupon', 500, message);
  }
}
