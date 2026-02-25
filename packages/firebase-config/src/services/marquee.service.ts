import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '../admin';
import { Collections } from '../collections/index';
import { successResponse, errorResponse } from '../helpers/response';
import type { FirestoreMarquee } from '../types/marquee.types';
import type { IResponse } from '../helpers/response';

const marqueesCollection = adminDb.collection(Collections.MARQUEES);

/** Get all marquee items ordered by sortOrder */
export async function getMarquees(): Promise<IResponse<FirestoreMarquee[]>> {
  try {
    const snapshot = await marqueesCollection.orderBy('sortOrder', 'asc').get();
    const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as FirestoreMarquee[];
    return successResponse(items, 'Marquees retrieved successfully');
  } catch {
    try {
      const snapshot = await marqueesCollection.get();
      const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as FirestoreMarquee[];
      items.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      return successResponse(items, 'Marquees retrieved successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return errorResponse('Failed to retrieve marquees', 500, message);
    }
  }
}

/** Get only active marquee items for frontend display */
export async function getActiveMarquees(): Promise<IResponse<FirestoreMarquee[]>> {
  try {
    const snapshot = await marqueesCollection
      .where('isActive', '==', true)
      .orderBy('sortOrder', 'asc')
      .get();
    const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as FirestoreMarquee[];
    return successResponse(items, 'Active marquees retrieved successfully');
  } catch {
    try {
      const snapshot = await marqueesCollection.get();
      const items = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }) as FirestoreMarquee)
        .filter((m) => m.isActive)
        .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      return successResponse(items, 'Active marquees retrieved successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return errorResponse('Failed to retrieve active marquees', 500, message);
    }
  }
}

/** Get a single marquee item by ID */
export async function getMarqueeById(id: string): Promise<IResponse<FirestoreMarquee | null>> {
  try {
    const doc = await marqueesCollection.doc(id).get();
    if (!doc.exists) return errorResponse('Marquee not found', 404);
    return successResponse({ id: doc.id, ...doc.data() } as FirestoreMarquee, 'Marquee retrieved successfully');
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return errorResponse('Failed to retrieve marquee', 500, message);
  }
}

/** Create a new marquee item */
export async function createMarquee(data: {
  text: string;
  isActive?: boolean;
  sortOrder?: number;
}): Promise<IResponse<FirestoreMarquee>> {
  try {
    // Get current max sortOrder
    const snapshot = await marqueesCollection.orderBy('sortOrder', 'desc').limit(1).get();
    const maxOrder = snapshot.empty ? 0 : (snapshot.docs[0].data().sortOrder || 0);

    const now = Timestamp.now();
    const docData = {
      text: data.text,
      isActive: data.isActive !== undefined ? data.isActive : true,
      sortOrder: data.sortOrder !== undefined ? data.sortOrder : maxOrder + 1,
      createdAt: now,
      updatedAt: now,
    };

    const ref = await marqueesCollection.add(docData);
    const created = { id: ref.id, ...docData } as FirestoreMarquee;
    return successResponse(created, 'Marquee created successfully');
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return errorResponse('Failed to create marquee', 500, message);
  }
}

/** Update an existing marquee item */
export async function updateMarquee(
  id: string,
  data: Partial<{ text: string; isActive: boolean; sortOrder: number }>
): Promise<IResponse<FirestoreMarquee>> {
  try {
    const doc = await marqueesCollection.doc(id).get();
    if (!doc.exists) return errorResponse('Marquee not found', 404);

    const updateData = { ...data, updatedAt: Timestamp.now() };
    await marqueesCollection.doc(id).update(updateData);

    const updated = await marqueesCollection.doc(id).get();
    return successResponse({ id: updated.id, ...updated.data() } as FirestoreMarquee, 'Marquee updated successfully');
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return errorResponse('Failed to update marquee', 500, message);
  }
}

/** Delete a marquee item */
export async function deleteMarquee(id: string): Promise<IResponse<null>> {
  try {
    const doc = await marqueesCollection.doc(id).get();
    if (!doc.exists) return errorResponse('Marquee not found', 404);
    await marqueesCollection.doc(id).delete();
    return successResponse(null, 'Marquee deleted successfully');
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return errorResponse('Failed to delete marquee', 500, message);
  }
}
