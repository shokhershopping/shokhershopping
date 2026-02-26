import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '../admin';
import { Collections } from '../collections/index';
import { successResponse, errorResponse } from '../helpers/response';
import { paginateQuery } from '../helpers/pagination';
import type { FirestoreDeliveryArea } from '../types/delivery-area.types';
import type { DeliveryAreaStatus } from '../types/enums';
import type { IResponse } from '../helpers/response';
import type { PaginatedResult } from '../helpers/pagination';

const deliveryAreasCollection = adminDb.collection(Collections.DELIVERY_AREAS);

/**
 * Get a paginated list of delivery areas (admin).
 */
export async function getDeliveryAreas(
  limit: number = 10,
  page: number = 1
): Promise<IResponse<PaginatedResult<FirestoreDeliveryArea>['data']>> {
  try {
    const query = deliveryAreasCollection.orderBy('createdAt', 'desc');
    const result = await paginateQuery<FirestoreDeliveryArea>(query, { limit, page });

    return successResponse(result.data, 'Delivery areas retrieved successfully', {
      total: result.total,
      page: result.page,
      limit: result.limit,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Failed to retrieve delivery areas', 500, message);
  }
}

/**
 * Get all active delivery areas (for checkout dropdown).
 */
export async function getActiveDeliveryAreas(): Promise<IResponse<FirestoreDeliveryArea[]>> {
  try {
    const snapshot = await deliveryAreasCollection
      .where('status', '==', 'ACTIVE')
      .get();

    const areas = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as FirestoreDeliveryArea[];

    // Sort in memory to avoid composite index requirement
    areas.sort((a, b) => {
      const aTime = a.createdAt?.toMillis?.() || 0;
      const bTime = b.createdAt?.toMillis?.() || 0;
      return aTime - bTime;
    });

    return successResponse(areas, 'Active delivery areas retrieved successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Failed to retrieve active delivery areas', 500, message);
  }
}

/**
 * Get a single delivery area by ID.
 */
export async function getDeliveryAreaById(
  id: string
): Promise<IResponse<FirestoreDeliveryArea | null>> {
  try {
    const doc = await deliveryAreasCollection.doc(id).get();

    if (!doc.exists) {
      return errorResponse('Delivery area not found', 404);
    }

    const area = { id: doc.id, ...doc.data() } as FirestoreDeliveryArea;
    return successResponse(area, 'Delivery area retrieved successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Failed to retrieve delivery area', 500, message);
  }
}

/**
 * Create a new delivery area.
 */
export async function createDeliveryArea(data: {
  name: string;
  price: number;
  isDefault?: boolean;
  status?: DeliveryAreaStatus;
}): Promise<IResponse<FirestoreDeliveryArea>> {
  try {
    const now = Timestamp.now();

    // If this area is set as default, unset other defaults
    if (data.isDefault) {
      const existingDefaults = await deliveryAreasCollection
        .where('isDefault', '==', true)
        .get();
      const batch = adminDb.batch();
      existingDefaults.docs.forEach((doc) => {
        batch.update(doc.ref, { isDefault: false, updatedAt: now });
      });
      await batch.commit();
    }

    const areaData: Omit<FirestoreDeliveryArea, 'id'> = {
      name: data.name.trim(),
      price: data.price,
      isDefault: data.isDefault ?? false,
      status: data.status ?? 'ACTIVE',
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await deliveryAreasCollection.add(areaData);
    const area = { id: docRef.id, ...areaData } as FirestoreDeliveryArea;

    return successResponse(area, 'Delivery area created successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Failed to create delivery area', 500, message);
  }
}

/**
 * Update a delivery area.
 */
export async function updateDeliveryArea(
  id: string,
  data: Partial<Omit<FirestoreDeliveryArea, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<IResponse<FirestoreDeliveryArea | null>> {
  try {
    const docRef = deliveryAreasCollection.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return errorResponse('Delivery area not found', 404);
    }

    const now = Timestamp.now();

    // If setting as default, unset other defaults
    if (data.isDefault) {
      const existingDefaults = await deliveryAreasCollection
        .where('isDefault', '==', true)
        .get();
      const batch = adminDb.batch();
      existingDefaults.docs.forEach((d) => {
        if (d.id !== id) {
          batch.update(d.ref, { isDefault: false, updatedAt: now });
        }
      });
      await batch.commit();
    }

    const updateData: Record<string, unknown> = {
      ...data,
      updatedAt: now,
    };

    if (data.name) {
      updateData.name = (data.name as string).trim();
    }

    await docRef.update(updateData);

    const updatedDoc = await docRef.get();
    const area = { id: updatedDoc.id, ...updatedDoc.data() } as FirestoreDeliveryArea;

    return successResponse(area, 'Delivery area updated successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Failed to update delivery area', 500, message);
  }
}

/**
 * Delete a delivery area.
 */
export async function deleteDeliveryArea(
  id: string
): Promise<IResponse<null>> {
  try {
    const docRef = deliveryAreasCollection.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return errorResponse('Delivery area not found', 404);
    }

    await docRef.delete();

    return successResponse(null, 'Delivery area deleted successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Failed to delete delivery area', 500, message);
  }
}
