import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '../admin';
import { Collections } from '../collections/index';
import { successResponse, errorResponse } from '../helpers/response';
import { paginateQuery } from '../helpers/pagination';
import type { FirestoreUser } from '../types/user.types';
import type { Role } from '../types/enums';
import type { IResponse } from '../helpers/response';
import type { PaginatedResult } from '../helpers/pagination';

const usersCollection = adminDb.collection(Collections.USERS);

/**
 * Get a paginated list of users.
 */
export async function getUsers(
  limit: number = 10,
  page: number = 1
): Promise<IResponse<PaginatedResult<FirestoreUser>['data']>> {
  try {
    const query = usersCollection.orderBy('createdAt', 'desc');

    const result = await paginateQuery<FirestoreUser>(query, { limit, page });

    return successResponse(result.data, 'Users retrieved successfully', {
      total: result.total,
      page: result.page,
      limit: result.limit,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Failed to retrieve users', 500, message);
  }
}

/**
 * Get a single user by ID.
 */
export async function getUserById(
  id: string
): Promise<IResponse<FirestoreUser | null>> {
  try {
    const doc = await usersCollection.doc(id).get();

    if (!doc.exists) {
      return errorResponse('User not found', 404);
    }

    const user = { id: doc.id, ...doc.data() } as FirestoreUser;
    return successResponse(user, 'User retrieved successfully');
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Failed to retrieve user', 500, message);
  }
}

/**
 * Create or upsert a user. Uses the provided id as the Firestore document ID.
 */
export async function createUser(data: {
  id: string;
  email: string;
  name?: string;
  image?: string;
  role?: Role;
}): Promise<IResponse<FirestoreUser>> {
  try {
    const now = Timestamp.now();

    const userData: Omit<FirestoreUser, 'id'> & { id: string } = {
      id: data.id,
      email: data.email,
      name: data.name ?? null,
      image: data.image ?? null,
      role: data.role ?? 'USER',
      createdAt: now,
      updatedAt: now,
    };

    // Use set with merge to upsert - creates if not exists, merges if exists
    await usersCollection.doc(data.id).set(userData, { merge: true });

    const user = userData as FirestoreUser;
    return successResponse(user, 'User created successfully');
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Failed to create user', 500, message);
  }
}

/**
 * Update specific fields on a user document.
 */
export async function updateUser(
  id: string,
  data: Partial<Pick<FirestoreUser, 'email' | 'name' | 'image' | 'role'>>
): Promise<IResponse<FirestoreUser | null>> {
  try {
    const docRef = usersCollection.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return errorResponse('User not found', 404);
    }

    const updateData = {
      ...data,
      updatedAt: Timestamp.now(),
    };

    await docRef.update(updateData);

    // Fetch the updated document
    const updatedDoc = await docRef.get();
    const user = { id: updatedDoc.id, ...updatedDoc.data() } as FirestoreUser;

    return successResponse(user, 'User updated successfully');
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Failed to update user', 500, message);
  }
}

/**
 * Delete a user document by ID.
 */
export async function deleteUser(
  id: string
): Promise<IResponse<null>> {
  try {
    const docRef = usersCollection.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return errorResponse('User not found', 404);
    }

    await docRef.delete();

    return successResponse(null, 'User deleted successfully');
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Failed to delete user', 500, message);
  }
}

/**
 * Update the metadata field on a user document.
 * Merges the provided metadata with any existing metadata.
 */
export async function updateUserMetadata(
  id: string,
  metadata: Record<string, any>
): Promise<IResponse<FirestoreUser | null>> {
  try {
    const docRef = usersCollection.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return errorResponse('User not found', 404);
    }

    const existingData = doc.data() || {};
    const existingMetadata = existingData.metadata || {};

    const updateData = {
      metadata: { ...existingMetadata, ...metadata },
      updatedAt: Timestamp.now(),
    };

    await docRef.update(updateData);

    // Fetch the updated document
    const updatedDoc = await docRef.get();
    const user = { id: updatedDoc.id, ...updatedDoc.data() } as FirestoreUser;

    return successResponse(user, 'User metadata updated successfully');
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Failed to update user metadata', 500, message);
  }
}
