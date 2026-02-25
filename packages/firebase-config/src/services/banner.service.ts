import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '../admin';
import { Collections } from '../collections/index';
import { successResponse, errorResponse } from '../helpers/response';
import type { FirestoreBanner } from '../types/banner.types';
import type { IResponse } from '../helpers/response';

const bannersCollection = adminDb.collection(Collections.BANNERS);

/**
 * Get all banners ordered by sortOrder.
 */
export async function getBanners(): Promise<IResponse<FirestoreBanner[]>> {
  try {
    const snapshot = await bannersCollection.orderBy('sortOrder', 'asc').get();
    const banners = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as FirestoreBanner[];

    return successResponse(banners, 'Banners retrieved successfully');
  } catch (error) {
    // Fallback without ordering if index not ready
    try {
      const snapshot = await bannersCollection.get();
      const banners = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as FirestoreBanner[];
      banners.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      return successResponse(banners, 'Banners retrieved successfully');
    } catch (fallbackError) {
      const message = fallbackError instanceof Error ? fallbackError.message : 'Unknown error occurred';
      return errorResponse('Failed to retrieve banners', 500, message);
    }
  }
}

/**
 * Get only active banners (for frontend display).
 */
export async function getActiveBanners(): Promise<IResponse<FirestoreBanner[]>> {
  try {
    const snapshot = await bannersCollection
      .where('isActive', '==', true)
      .orderBy('sortOrder', 'asc')
      .get();
    const banners = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as FirestoreBanner[];

    return successResponse(banners, 'Active banners retrieved successfully');
  } catch (error) {
    // Fallback if composite index not ready
    try {
      const snapshot = await bannersCollection.orderBy('sortOrder', 'asc').get();
      const banners = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }) as FirestoreBanner)
        .filter((b) => b.isActive);
      return successResponse(banners, 'Active banners retrieved successfully');
    } catch (fallbackError) {
      const message = fallbackError instanceof Error ? fallbackError.message : 'Unknown error occurred';
      return errorResponse('Failed to retrieve active banners', 500, message);
    }
  }
}

/**
 * Get a single banner by ID.
 */
export async function getBannerById(
  id: string
): Promise<IResponse<FirestoreBanner | null>> {
  try {
    const doc = await bannersCollection.doc(id).get();

    if (!doc.exists) {
      return errorResponse('Banner not found', 404);
    }

    const banner = { id: doc.id, ...doc.data() } as FirestoreBanner;
    return successResponse(banner, 'Banner retrieved successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Failed to retrieve banner', 500, message);
  }
}

/**
 * Create a new banner.
 */
export async function createBanner(data: {
  title: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  imageUrl: string;
  textColor?: 'light' | 'dark' | 'auto';
  sortOrder?: number;
  isActive?: boolean;
}): Promise<IResponse<FirestoreBanner>> {
  try {
    const now = Timestamp.now();

    // Auto-determine sort order if not provided
    let sortOrder = data.sortOrder ?? 0;
    if (!data.sortOrder && data.sortOrder !== 0) {
      const snapshot = await bannersCollection.orderBy('sortOrder', 'desc').limit(1).get();
      if (!snapshot.empty) {
        const lastBanner = snapshot.docs[0].data();
        sortOrder = (lastBanner.sortOrder || 0) + 1;
      }
    }

    const bannerData: Omit<FirestoreBanner, 'id'> = {
      title: data.title,
      subtitle: data.subtitle ?? null,
      buttonText: data.buttonText ?? 'Shop Now',
      buttonLink: data.buttonLink ?? '/shop',
      imageUrl: data.imageUrl,
      textColor: data.textColor ?? 'auto',
      sortOrder,
      isActive: data.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await bannersCollection.add(bannerData);
    const banner = { id: docRef.id, ...bannerData } as FirestoreBanner;

    return successResponse(banner, 'Banner created successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Failed to create banner', 500, message);
  }
}

/**
 * Update a banner.
 */
export async function updateBanner(
  id: string,
  data: Partial<Omit<FirestoreBanner, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<IResponse<FirestoreBanner | null>> {
  try {
    const docRef = bannersCollection.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return errorResponse('Banner not found', 404);
    }

    const updateData: Record<string, unknown> = {
      ...data,
      updatedAt: Timestamp.now(),
    };

    await docRef.update(updateData);

    const updatedDoc = await docRef.get();
    const banner = { id: updatedDoc.id, ...updatedDoc.data() } as FirestoreBanner;

    return successResponse(banner, 'Banner updated successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Failed to update banner', 500, message);
  }
}

/**
 * Delete a banner.
 */
export async function deleteBanner(
  id: string
): Promise<IResponse<null>> {
  try {
    const docRef = bannersCollection.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return errorResponse('Banner not found', 404);
    }

    await docRef.delete();

    return successResponse(null, 'Banner deleted successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Failed to delete banner', 500, message);
  }
}
