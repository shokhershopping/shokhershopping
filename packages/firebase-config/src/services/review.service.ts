import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '../admin';
import { Collections } from '../collections/index';
import { successResponse, errorResponse } from '../helpers/response';
import { paginateQuery } from '../helpers/pagination';
import { buildQuery } from '../helpers/query-builder';
import type { FirestoreReview } from '../types/review.types';
import type { ReviewStatus } from '../types/enums';
import type { IResponse } from '../helpers/response';
import type { PaginatedResult } from '../helpers/pagination';
import type { QueryFilter } from '../helpers/query-builder';

const reviewsCollection = adminDb.collection(Collections.REVIEWS);

/**
 * Get a paginated list of reviews with optional filters.
 */
export async function getReviews(
  limit: number = 10,
  page: number = 1,
  filters?: { productId?: string; status?: ReviewStatus; userId?: string }
): Promise<IResponse<PaginatedResult<FirestoreReview>['data']>> {
  try {
    const queryFilters: QueryFilter[] = [];

    if (filters?.productId) {
      queryFilters.push({ field: 'productId', operator: '==', value: filters.productId });
    }
    if (filters?.status) {
      queryFilters.push({ field: 'status', operator: '==', value: filters.status });
    }
    if (filters?.userId) {
      queryFilters.push({ field: 'userId', operator: '==', value: filters.userId });
    }

    const query = buildQuery(reviewsCollection, {
      filters: queryFilters,
      orderByField: 'createdAt',
      orderDirection: 'desc',
    });

    const result = await paginateQuery<FirestoreReview>(query, { limit, page });

    return successResponse(result.data, 'Reviews retrieved successfully', {
      total: result.total,
      page: result.page,
      limit: result.limit,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Failed to retrieve reviews', 500, message);
  }
}

/**
 * Get a single review by ID.
 */
export async function getReviewById(
  id: string
): Promise<IResponse<FirestoreReview | null>> {
  try {
    const doc = await reviewsCollection.doc(id).get();

    if (!doc.exists) {
      return errorResponse('Review not found', 404);
    }

    const review = { id: doc.id, ...doc.data() } as FirestoreReview;
    return successResponse(review, 'Review retrieved successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Failed to retrieve review', 500, message);
  }
}

/**
 * Get reviews for a specific product.
 */
export async function getReviewsByProductId(
  productId: string,
  limit: number = 10,
  page: number = 1
): Promise<IResponse<PaginatedResult<FirestoreReview>['data']>> {
  return getReviews(limit, page, { productId, status: 'APPROVED' });
}

/**
 * Get reviews by a specific user.
 */
export async function getReviewsByUserId(
  userId: string,
  limit: number = 10,
  page: number = 1
): Promise<IResponse<PaginatedResult<FirestoreReview>['data']>> {
  return getReviews(limit, page, { userId });
}

/**
 * Get review statistics for a product (count per rating 1-5).
 */
export async function getReviewStats(
  productId: string
): Promise<IResponse<{ rating: number; count: number }[]>> {
  try {
    const snapshot = await reviewsCollection
      .where('productId', '==', productId)
      .where('status', '==', 'APPROVED')
      .get();

    // Manually aggregate ratings
    const ratingCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    snapshot.docs.forEach((doc) => {
      const rating = (doc.data() as FirestoreReview).rating;
      if (rating >= 1 && rating <= 5) {
        ratingCounts[rating]++;
      }
    });

    const stats = Object.entries(ratingCounts).map(([rating, count]) => ({
      rating: parseInt(rating, 10),
      count,
    }));

    return successResponse(stats, 'Review stats retrieved successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Failed to retrieve review stats', 500, message);
  }
}

/**
 * Create a new review.
 */
export async function createReview(data: {
  userId: string;
  userName: string;
  userImage?: string;
  productId?: string;
  variantId?: string;
  productName: string;
  rating: number;
  comment?: string;
}): Promise<IResponse<FirestoreReview>> {
  try {
    const now = Timestamp.now();

    const reviewData: Omit<FirestoreReview, 'id'> = {
      userId: data.userId,
      userName: data.userName,
      userImage: data.userImage ?? null,
      productId: data.productId ?? null,
      variantId: data.variantId ?? null,
      productName: data.productName,
      rating: data.rating,
      comment: data.comment ?? null,
      status: 'PENDING',
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await reviewsCollection.add(reviewData);
    const review = { id: docRef.id, ...reviewData } as FirestoreReview;

    return successResponse(review, 'Review created successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Failed to create review', 500, message);
  }
}

/**
 * Update review status (approve/reject workflow).
 */
export async function updateReviewStatus(
  id: string,
  status: ReviewStatus
): Promise<IResponse<FirestoreReview | null>> {
  try {
    const docRef = reviewsCollection.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return errorResponse('Review not found', 404);
    }

    await docRef.update({
      status,
      updatedAt: Timestamp.now(),
    });

    const updatedDoc = await docRef.get();
    const review = { id: updatedDoc.id, ...updatedDoc.data() } as FirestoreReview;

    return successResponse(review, `Review ${status.toLowerCase()} successfully`);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Failed to update review status', 500, message);
  }
}

/**
 * Delete a review.
 */
export async function deleteReview(
  id: string
): Promise<IResponse<null>> {
  try {
    const docRef = reviewsCollection.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return errorResponse('Review not found', 404);
    }

    await docRef.delete();

    return successResponse(null, 'Review deleted successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Failed to delete review', 500, message);
  }
}
