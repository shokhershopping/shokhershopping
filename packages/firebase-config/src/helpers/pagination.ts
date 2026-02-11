import type {
  Query,
  DocumentData,
  QueryDocumentSnapshot,
} from 'firebase-admin/firestore';

export interface PaginationParams {
  limit: number;
  page: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Apply offset-based pagination to a Firestore query.
 *
 * Note: Firestore doesn't natively support offset-based pagination efficiently.
 * For large datasets, consider cursor-based pagination with startAfter().
 * This uses offset() for backward compatibility with the existing API.
 */
export async function paginateQuery<T extends DocumentData>(
  query: Query<DocumentData>,
  params: PaginationParams,
  transform?: (doc: QueryDocumentSnapshot<DocumentData>) => T
): Promise<PaginatedResult<T>> {
  const { limit, page } = params;
  const offset = (page - 1) * limit;

  // Get total count with a separate query (Firestore limitation)
  const countSnapshot = await query.count().get();
  const total = countSnapshot.data().count;

  // Get paginated data
  const snapshot = await query.offset(offset).limit(limit).get();

  const data = snapshot.docs.map((doc) => {
    if (transform) {
      return transform(doc);
    }
    return { id: doc.id, ...doc.data() } as T;
  });

  const totalPages = Math.ceil(total / limit);

  return {
    data,
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

/**
 * Parse pagination query parameters with defaults.
 */
export function parsePaginationParams(
  query: Record<string, string | undefined>
): PaginationParams {
  return {
    limit: Math.min(Math.max(parseInt(query.limit || '10', 10) || 10, 1), 1000),
    page: Math.max(parseInt(query.page || '1', 10) || 1, 1),
  };
}
