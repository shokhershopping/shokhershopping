import { Timestamp, FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '../admin';
import { Collections } from '../collections/index';
import { successResponse, errorResponse } from '../helpers/response';
import { paginateQuery } from '../helpers/pagination';
import type { FirestoreCategory } from '../types/category.types';
import type { IResponse } from '../helpers/response';
import type { PaginatedResult } from '../helpers/pagination';

const categoriesCollection = adminDb.collection(Collections.CATEGORIES);

/**
 * Get a paginated list of categories (root categories by default).
 */
export async function getAllCategories(
  limit: number = 10,
  page: number = 1,
  rootOnly: boolean = false
): Promise<IResponse<PaginatedResult<FirestoreCategory>['data']>> {
  try {
    let query = categoriesCollection.orderBy('createdAt', 'desc') as FirebaseFirestore.Query;

    if (rootOnly) {
      query = query.where('parentId', '==', null);
    }

    const result = await paginateQuery<FirestoreCategory>(query, { limit, page });

    return successResponse(result.data, 'Categories retrieved successfully', {
      total: result.total,
      page: result.page,
      limit: result.limit,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Failed to retrieve categories', 500, message);
  }
}

/**
 * Get a single category by ID.
 */
export async function getCategoryById(
  id: string
): Promise<IResponse<FirestoreCategory | null>> {
  try {
    const doc = await categoriesCollection.doc(id).get();

    if (!doc.exists) {
      return errorResponse('Category not found', 404);
    }

    const category = { id: doc.id, ...doc.data() } as FirestoreCategory;
    return successResponse(category, 'Category retrieved successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Failed to retrieve category', 500, message);
  }
}

/**
 * Get featured categories.
 */
export async function getFeaturedCategories(
  limit: number = 10
): Promise<IResponse<FirestoreCategory[]>> {
  try {
    const snapshot = await categoriesCollection
      .where('isFeatured', '==', true)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    const categories = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as FirestoreCategory));
    return successResponse(categories, 'Featured categories retrieved successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Failed to retrieve featured categories', 500, message);
  }
}

/**
 * Get slide categories (for carousel/banners).
 */
export async function getSlideCategories(
  limit: number = 10
): Promise<IResponse<FirestoreCategory[]>> {
  try {
    const snapshot = await categoriesCollection
      .where('isSlide', '==', true)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    const categories = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as FirestoreCategory));
    return successResponse(categories, 'Slide categories retrieved successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Failed to retrieve slide categories', 500, message);
  }
}

/**
 * Get menu categories.
 */
export async function getMenuCategories(
  limit: number = 50
): Promise<IResponse<FirestoreCategory[]>> {
  try {
    const snapshot = await categoriesCollection
      .where('isMenu', '==', true)
      .orderBy('name', 'asc')
      .limit(limit)
      .get();

    const categories = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as FirestoreCategory));
    return successResponse(categories, 'Menu categories retrieved successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Failed to retrieve menu categories', 500, message);
  }
}

/**
 * Get subcategories of a parent category.
 */
export async function getSubcategories(
  parentId: string
): Promise<IResponse<FirestoreCategory[]>> {
  try {
    const snapshot = await categoriesCollection
      .where('parentId', '==', parentId)
      .orderBy('name', 'asc')
      .get();

    const categories = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as FirestoreCategory));
    return successResponse(categories, 'Subcategories retrieved successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Failed to retrieve subcategories', 500, message);
  }
}

/**
 * Recursively get all descendant category IDs.
 */
export async function getAllDescendantIds(
  categoryId: string
): Promise<string[]> {
  const ids: string[] = [];

  const snapshot = await categoriesCollection
    .where('parentId', '==', categoryId)
    .get();

  for (const doc of snapshot.docs) {
    ids.push(doc.id);
    const childIds = await getAllDescendantIds(doc.id);
    ids.push(...childIds);
  }

  return ids;
}

/**
 * Create a new category.
 */
export async function createCategory(data: {
  name: string;
  description?: string;
  imageUrl?: string;
  sliderImageUrl?: string;
  title?: string;
  isSlide?: boolean;
  isFeatured?: boolean;
  isMenu?: boolean;
  parentId?: string;
}): Promise<IResponse<FirestoreCategory>> {
  try {
    const now = Timestamp.now();

    let parentName: string | null = null;
    if (data.parentId) {
      const parentDoc = await categoriesCollection.doc(data.parentId).get();
      if (!parentDoc.exists) {
        return errorResponse('Parent category not found', 404);
      }
      parentName = (parentDoc.data() as FirestoreCategory).name;
    }

    const categoryData: Omit<FirestoreCategory, 'id'> = {
      name: data.name,
      description: data.description ?? null,
      imageUrl: data.imageUrl ?? null,
      sliderImageUrl: data.sliderImageUrl ?? null,
      title: data.title ?? null,
      isSlide: data.isSlide ?? false,
      isFeatured: data.isFeatured ?? false,
      isMenu: data.isMenu ?? false,
      parentId: data.parentId ?? null,
      parentName,
      childIds: [],
      productCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await categoriesCollection.add(categoryData);

    // Update parent's childIds array
    if (data.parentId) {
      await categoriesCollection.doc(data.parentId).update({
        childIds: FieldValue.arrayUnion(docRef.id),
        updatedAt: now,
      });
    }

    const category = { id: docRef.id, ...categoryData } as FirestoreCategory;
    return successResponse(category, 'Category created successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Failed to create category', 500, message);
  }
}

/**
 * Update a category.
 */
export async function updateCategory(
  id: string,
  data: Partial<Omit<FirestoreCategory, 'id' | 'createdAt' | 'updatedAt' | 'childIds' | 'productCount'>>
): Promise<IResponse<FirestoreCategory | null>> {
  try {
    const docRef = categoriesCollection.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return errorResponse('Category not found', 404);
    }

    const updateData: Record<string, unknown> = {
      ...data,
      updatedAt: Timestamp.now(),
    };

    // If parentId changed, update parent name
    if (data.parentId !== undefined) {
      if (data.parentId) {
        const parentDoc = await categoriesCollection.doc(data.parentId).get();
        if (!parentDoc.exists) {
          return errorResponse('Parent category not found', 404);
        }
        updateData.parentName = (parentDoc.data() as FirestoreCategory).name;
      } else {
        updateData.parentName = null;
      }
    }

    await docRef.update(updateData);

    const updatedDoc = await docRef.get();
    const category = { id: updatedDoc.id, ...updatedDoc.data() } as FirestoreCategory;

    return successResponse(category, 'Category updated successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Failed to update category', 500, message);
  }
}

/**
 * Delete a category and handle parent/child relationships.
 */
export async function deleteCategory(
  id: string
): Promise<IResponse<null>> {
  try {
    const docRef = categoriesCollection.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return errorResponse('Category not found', 404);
    }

    const categoryData = doc.data() as Omit<FirestoreCategory, 'id'>;
    const batch = adminDb.batch();

    // Remove this category from parent's childIds
    if (categoryData.parentId) {
      const parentRef = categoriesCollection.doc(categoryData.parentId);
      batch.update(parentRef, {
        childIds: FieldValue.arrayRemove(id),
        updatedAt: Timestamp.now(),
      });
    }

    // Set children's parentId to null
    if (categoryData.childIds.length > 0) {
      for (const childId of categoryData.childIds) {
        const childRef = categoriesCollection.doc(childId);
        batch.update(childRef, {
          parentId: null,
          parentName: null,
          updatedAt: Timestamp.now(),
        });
      }
    }

    batch.delete(docRef);
    await batch.commit();

    return successResponse(null, 'Category deleted successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Failed to delete category', 500, message);
  }
}
