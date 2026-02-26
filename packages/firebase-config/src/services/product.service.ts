import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '../admin';
import { Collections } from '../collections/index';
import { successResponse, errorResponse } from '../helpers/response';
import { paginateQuery } from '../helpers/pagination';
import { buildQuery, generateSearchTokens } from '../helpers/query-builder';
import type { FirestoreProduct, FirestoreVariant } from '../types/product.types';
import type { ProductStatus } from '../types/enums';
import type { IResponse } from '../helpers/response';
import type { PaginatedResult } from '../helpers/pagination';
import type { QueryFilter } from '../helpers/query-builder';

const productsCollection = adminDb.collection(Collections.PRODUCTS);
const categoriesCollection = adminDb.collection(Collections.CATEGORIES);

/**
 * Check if a SKU is already in use by another product or variant.
 * Returns true if the SKU is unique (available), false if taken.
 * @param sku - The SKU to check
 * @param excludeProductId - Optional product ID to exclude (for updates)
 * @param excludeVariantId - Optional variant ID to exclude (for updates)
 */
export async function isSkuUnique(
  sku: string,
  excludeProductId?: string,
  excludeVariantId?: string
): Promise<boolean> {
  if (!sku || !sku.trim()) return true;

  const normalizedSku = sku.trim();

  // Check products collection
  const productSnapshot = await productsCollection
    .where('sku', '==', normalizedSku)
    .limit(1)
    .get();

  if (!productSnapshot.empty) {
    const found = productSnapshot.docs[0];
    if (found.id !== excludeProductId) return false;
  }

  // Check all variant subcollections using collectionGroup
  try {
    const variantSnapshot = await adminDb
      .collectionGroup(Collections.VARIANTS)
      .where('sku', '==', normalizedSku)
      .limit(1)
      .get();

    if (!variantSnapshot.empty) {
      const found = variantSnapshot.docs[0];
      if (found.id !== excludeVariantId) return false;
    }
  } catch {
    // collectionGroup may fail without a Firestore index.
    // Fallback: check each product's variants individually.
    const allProducts = await productsCollection.select().get();
    for (const productDoc of allProducts.docs) {
      const variantSnap = await productDoc.ref
        .collection(Collections.VARIANTS)
        .where('sku', '==', normalizedSku)
        .limit(1)
        .get();
      if (!variantSnap.empty) {
        const found = variantSnap.docs[0];
        if (found.id !== excludeVariantId) return false;
      }
    }
  }

  return true;
}

/**
 * Update productCount on categories when products are created/deleted.
 */
async function updateCategoryProductCounts(categoryIds: string[], increment: number): Promise<void> {
  if (!categoryIds || categoryIds.length === 0) return;
  try {
    const batch = adminDb.batch();
    for (const catId of categoryIds) {
      const catRef = categoriesCollection.doc(catId);
      batch.update(catRef, { productCount: FieldValue.increment(increment) });
    }
    await batch.commit();
  } catch {
    // Non-critical: silently handle count sync errors
  }
}

// ─── Product CRUD ────────────────────────────────────────────────────────────

/**
 * Get a paginated list of products with optional filters, including variants.
 */
export async function getProducts(
  limit: number = 10,
  page: number = 1,
  filters?: { status?: ProductStatus; categoryId?: string }
): Promise<IResponse<PaginatedResult<FirestoreProduct>['data']>> {
  try {
    const queryFilters: QueryFilter[] = [];

    if (filters?.status) {
      queryFilters.push({ field: 'status', operator: '==', value: filters.status });
    }
    if (filters?.categoryId) {
      queryFilters.push({ field: 'categoryIds', operator: 'array-contains', value: filters.categoryId });
    }

    const query = buildQuery(productsCollection, {
      filters: queryFilters,
      orderByField: 'createdAt',
      orderDirection: 'desc',
    });

    const result = await paginateQuery<FirestoreProduct>(query, { limit, page });

    // Fetch variants for each product
    const productsWithVariants = await attachVariantsToProducts(result.data);

    return successResponse(productsWithVariants, 'Products retrieved successfully', {
      total: result.total,
      page: result.page,
      limit: result.limit,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Failed to retrieve products', 500, message);
  }
}

/**
 * Get a single product by ID, including its variants subcollection.
 */
export async function getProductById(
  id: string
): Promise<IResponse<FirestoreProduct | null>> {
  try {
    const docRef = productsCollection.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return errorResponse('Product not found', 404);
    }

    // Fetch variants from subcollection
    let variantsSnapshot;
    try {
      variantsSnapshot = await docRef
        .collection(Collections.VARIANTS)
        .orderBy('createdAt', 'desc')
        .get();
    } catch {
      // Fallback without ordering if index not available
      variantsSnapshot = await docRef
        .collection(Collections.VARIANTS)
        .get();
    }

    const variableProducts = variantsSnapshot.docs.map((vDoc) => ({
      id: vDoc.id,
      ...vDoc.data(),
    } as FirestoreVariant));

    const product = { id: doc.id, ...doc.data(), variableProducts } as FirestoreProduct & { variableProducts: FirestoreVariant[] };
    return successResponse(product, 'Product retrieved successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Failed to retrieve product', 500, message);
  }
}

/**
 * Get latest products ordered by creation date.
 */
export async function getLatestProducts(
  limit: number = 10
): Promise<IResponse<FirestoreProduct[]>> {
  try {
    let snapshot;
    try {
      snapshot = await productsCollection
        .where('status', '==', 'PUBLISHED')
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();
    } catch {
      // Fallback without status filter if composite index is missing
      try {
        snapshot = await productsCollection
          .orderBy('createdAt', 'desc')
          .limit(limit)
          .get();
      } catch {
        // Bare minimum fallback - no ordering
        snapshot = await productsCollection
          .limit(limit)
          .get();
      }
    }

    const products = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as FirestoreProduct));
    const productsWithVariants = await attachVariantsToProducts(products);
    return successResponse(productsWithVariants, 'Latest products retrieved successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Failed to retrieve latest products', 500, message);
  }
}

/**
 * Get top selling products ordered by order count.
 */
export async function getTopSellingProducts(
  limit: number = 10
): Promise<IResponse<FirestoreProduct[]>> {
  try {
    let snapshot;

    // Try 1: status + orderCount (needs composite index)
    try {
      snapshot = await productsCollection
        .where('status', '==', 'PUBLISHED')
        .orderBy('orderCount', 'desc')
        .limit(limit)
        .get();
    } catch {
      // Try 2: status + createdAt (needs composite index)
      try {
        snapshot = await productsCollection
          .where('status', '==', 'PUBLISHED')
          .orderBy('createdAt', 'desc')
          .limit(limit)
          .get();
      } catch {
        // Try 3: no filter, just get latest
        try {
          snapshot = await productsCollection
            .orderBy('createdAt', 'desc')
            .limit(limit)
            .get();
        } catch {
          // Try 4: bare minimum - no ordering
          snapshot = await productsCollection
            .limit(limit)
            .get();
        }
      }
    }

    // If no PUBLISHED products found, try without status filter
    if (snapshot.empty) {
      try {
        snapshot = await productsCollection
          .orderBy('createdAt', 'desc')
          .limit(limit)
          .get();
      } catch {
        snapshot = await productsCollection.limit(limit).get();
      }
    }

    const products = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as FirestoreProduct));
    const productsWithVariants = await attachVariantsToProducts(products);
    return successResponse(productsWithVariants, 'Top selling products retrieved successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Failed to retrieve top selling products', 500, message);
  }
}

/**
 * Get featured products.
 */
export async function getFeaturedProducts(
  limit: number = 10
): Promise<IResponse<FirestoreProduct[]>> {
  try {
    let snapshot;
    try {
      snapshot = await productsCollection
        .where('isFeatured', '==', true)
        .where('status', '==', 'PUBLISHED')
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();
    } catch {
      // Fallback without status filter
      try {
        snapshot = await productsCollection
          .where('isFeatured', '==', true)
          .limit(limit)
          .get();
      } catch {
        // Final fallback: just get latest products
        snapshot = await productsCollection
          .orderBy('createdAt', 'desc')
          .limit(limit)
          .get();
      }
    }

    const products = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as FirestoreProduct));
    return successResponse(products, 'Featured products retrieved successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Failed to retrieve featured products', 500, message);
  }
}

/**
 * Get slide/banner products.
 */
export async function getSlideProducts(
  limit: number = 10
): Promise<IResponse<FirestoreProduct[]>> {
  try {
    const snapshot = await productsCollection
      .where('isSlide', '==', true)
      .where('status', '==', 'PUBLISHED')
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    const products = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as FirestoreProduct));
    return successResponse(products, 'Slide products retrieved successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Failed to retrieve slide products', 500, message);
  }
}

/**
 * Search products using tokenized search.
 */
export async function searchProducts(
  searchQuery: string,
  limit: number = 10,
  page: number = 1
): Promise<IResponse<PaginatedResult<FirestoreProduct>['data']>> {
  try {
    const tokens = generateSearchTokens(searchQuery);

    if (tokens.length === 0) {
      return successResponse([], 'No search results', { total: 0, page, limit });
    }

    // Firestore array-contains-any supports max 30 values
    const searchTokens = tokens.slice(0, 30);

    const query = productsCollection
      .where('searchTokens', 'array-contains-any', searchTokens)
      .where('status', '==', 'PUBLISHED')
      .orderBy('orderCount', 'desc');

    const result = await paginateQuery<FirestoreProduct>(query, { limit, page });

    return successResponse(result.data, 'Search results retrieved successfully', {
      total: result.total,
      page: result.page,
      limit: result.limit,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Failed to search products', 500, message);
  }
}

/**
 * Create a new product.
 */
export async function createProduct(data: {
  name: string;
  description: string;
  imageUrls?: string[];
  specifications?: Record<string, unknown>;
  sizeGuideUrl?: string;
  deliveryTime?: string;
  returnTime?: string;
  price: number;
  salePrice?: number;
  brand?: string;
  sku?: string;
  stock?: number;
  kind?: string;
  status?: string;
  isSlide?: boolean;
  isFeatured?: boolean;
  categoryIds?: string[];
  categoryNames?: string[];
}): Promise<IResponse<FirestoreProduct>> {
  try {
    // Validate SKU uniqueness
    if (data.sku && data.sku.trim()) {
      const unique = await isSkuUnique(data.sku.trim());
      if (!unique) {
        return errorResponse(`SKU "${data.sku.trim()}" is already in use`, 409);
      }
    }

    const now = Timestamp.now();
    const searchTokens = generateSearchTokens(
      `${data.name} ${data.brand || ''}`
    );

    const productData: Omit<FirestoreProduct, 'id'> = {
      name: data.name,
      description: data.description,
      imageUrls: data.imageUrls ?? [],
      specifications: data.specifications ?? {},
      sizeGuideUrl: data.sizeGuideUrl ?? null,
      deliveryTime: data.deliveryTime ?? null,
      returnTime: data.returnTime ?? null,
      price: data.price,
      salePrice: data.salePrice ?? null,
      brand: data.brand ?? null,
      sku: data.sku?.trim() ?? null,
      stock: data.stock ?? 0,
      kind: (data.kind as FirestoreProduct['kind']) ?? 'PHYSICAL',
      status: (data.status as FirestoreProduct['status']) ?? 'DRAFT',
      isSlide: data.isSlide ?? false,
      isFeatured: data.isFeatured ?? false,
      categoryIds: data.categoryIds ?? [],
      categoryNames: data.categoryNames ?? [],
      orderCount: 0,
      averageRating: 0,
      reviewCount: 0,
      searchTokens,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await productsCollection.add(productData);
    const product = { id: docRef.id, ...productData } as FirestoreProduct;

    // Increment productCount on associated categories
    await updateCategoryProductCounts(productData.categoryIds, 1);

    return successResponse(product, 'Product created successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Failed to create product', 500, message);
  }
}

/**
 * Update a product.
 */
export async function updateProduct(
  id: string,
  data: Partial<Omit<FirestoreProduct, 'id' | 'createdAt' | 'updatedAt' | 'searchTokens'>>
): Promise<IResponse<FirestoreProduct | null>> {
  try {
    const docRef = productsCollection.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return errorResponse('Product not found', 404);
    }

    // Validate SKU uniqueness if SKU is being updated
    if (data.sku && data.sku.trim()) {
      const unique = await isSkuUnique(data.sku.trim(), id);
      if (!unique) {
        return errorResponse(`SKU "${data.sku.trim()}" is already in use`, 409);
      }
      data.sku = data.sku.trim();
    }

    const updateData: Record<string, unknown> = {
      ...data,
      updatedAt: Timestamp.now(),
    };

    // Regenerate search tokens if name or brand changed
    if (data.name || data.brand) {
      const existing = doc.data() as Omit<FirestoreProduct, 'id'>;
      const name = data.name ?? existing.name;
      const brand = data.brand ?? existing.brand ?? '';
      updateData.searchTokens = generateSearchTokens(`${name} ${brand}`);
    }

    await docRef.update(updateData);

    const updatedDoc = await docRef.get();
    const product = { id: updatedDoc.id, ...updatedDoc.data() } as FirestoreProduct;

    return successResponse(product, 'Product updated successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Failed to update product', 500, message);
  }
}

/**
 * Delete a product and its variants subcollection.
 */
export async function deleteProduct(
  id: string
): Promise<IResponse<null>> {
  try {
    const docRef = productsCollection.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return errorResponse('Product not found', 404);
    }

    const productData = doc.data() as FirestoreProduct;

    // Delete all variants in subcollection
    const variantsSnapshot = await docRef.collection(Collections.VARIANTS).get();
    const batch = adminDb.batch();
    variantsSnapshot.docs.forEach((variantDoc) => batch.delete(variantDoc.ref));
    batch.delete(docRef);
    await batch.commit();

    // Decrement productCount on associated categories
    await updateCategoryProductCounts(productData.categoryIds || [], -1);

    return successResponse(null, 'Product deleted successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Failed to delete product', 500, message);
  }
}

/**
 * Fetch variants for a list of products and attach them.
 */
async function attachVariantsToProducts(products: FirestoreProduct[]): Promise<(FirestoreProduct & { variableProducts: FirestoreVariant[] })[]> {
  return Promise.all(
    products.map(async (product) => {
      try {
        const variantsSnapshot = await productsCollection
          .doc(product.id)
          .collection(Collections.VARIANTS)
          .orderBy('createdAt', 'desc')
          .get();

        const variableProducts = variantsSnapshot.docs.map((vDoc) => ({
          id: vDoc.id,
          ...vDoc.data(),
        } as FirestoreVariant));

        return { ...product, variableProducts };
      } catch {
        return { ...product, variableProducts: [] as FirestoreVariant[] };
      }
    })
  );
}

// ─── Variant Operations (subcollection) ──────────────────────────────────────

/**
 * Get all variants for a product.
 */
export async function getProductVariants(
  productId: string
): Promise<IResponse<FirestoreVariant[]>> {
  try {
    const productDoc = await productsCollection.doc(productId).get();
    if (!productDoc.exists) {
      return errorResponse('Product not found', 404);
    }

    const snapshot = await productsCollection
      .doc(productId)
      .collection(Collections.VARIANTS)
      .orderBy('createdAt', 'desc')
      .get();

    const variants = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as FirestoreVariant));
    return successResponse(variants, 'Variants retrieved successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Failed to retrieve variants', 500, message);
  }
}

/**
 * Create a variant for a product.
 */
export async function createVariant(
  productId: string,
  data: {
    name: string;
    description?: string;
    imageUrls?: string[];
    specifications?: Record<string, unknown>;
    price: number;
    salePrice?: number;
    stock?: number;
    sku: string;
    status?: string;
  }
): Promise<IResponse<FirestoreVariant>> {
  try {
    const productDoc = await productsCollection.doc(productId).get();
    if (!productDoc.exists) {
      return errorResponse('Product not found', 404);
    }

    // Validate SKU uniqueness
    if (data.sku && data.sku.trim()) {
      const unique = await isSkuUnique(data.sku.trim());
      if (!unique) {
        return errorResponse(`SKU "${data.sku.trim()}" is already in use`, 409);
      }
    }

    const now = Timestamp.now();
    const variantData: Omit<FirestoreVariant, 'id'> = {
      name: data.name,
      description: data.description ?? null,
      imageUrls: data.imageUrls ?? [],
      specifications: data.specifications ?? {},
      price: data.price,
      salePrice: data.salePrice ?? null,
      stock: data.stock ?? 0,
      sku: data.sku?.trim() || '',
      status: (data.status as FirestoreVariant['status']) ?? 'DRAFT',
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await productsCollection
      .doc(productId)
      .collection(Collections.VARIANTS)
      .add(variantData);

    const variant = { id: docRef.id, ...variantData } as FirestoreVariant;
    return successResponse(variant, 'Variant created successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Failed to create variant', 500, message);
  }
}

/**
 * Update a variant.
 */
export async function updateVariant(
  productId: string,
  variantId: string,
  data: Partial<Omit<FirestoreVariant, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<IResponse<FirestoreVariant | null>> {
  try {
    const docRef = productsCollection
      .doc(productId)
      .collection(Collections.VARIANTS)
      .doc(variantId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return errorResponse('Variant not found', 404);
    }

    // Validate SKU uniqueness if SKU is being updated
    if (data.sku && data.sku.trim()) {
      const unique = await isSkuUnique(data.sku.trim(), undefined, variantId);
      if (!unique) {
        return errorResponse(`SKU "${data.sku.trim()}" is already in use`, 409);
      }
      data.sku = data.sku.trim();
    }

    const updateData = {
      ...data,
      updatedAt: Timestamp.now(),
    };

    await docRef.update(updateData);

    const updatedDoc = await docRef.get();
    const variant = { id: updatedDoc.id, ...updatedDoc.data() } as FirestoreVariant;

    return successResponse(variant, 'Variant updated successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Failed to update variant', 500, message);
  }
}

/**
 * Delete a variant.
 */
export async function deleteVariant(
  productId: string,
  variantId: string
): Promise<IResponse<null>> {
  try {
    const docRef = productsCollection
      .doc(productId)
      .collection(Collections.VARIANTS)
      .doc(variantId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return errorResponse('Variant not found', 404);
    }

    await docRef.delete();

    return successResponse(null, 'Variant deleted successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Failed to delete variant', 500, message);
  }
}
