import type { Query, DocumentData } from 'firebase-admin/firestore';

export interface QueryFilter {
  field: string;
  operator: FirebaseFirestore.WhereFilterOp;
  value: unknown;
}

export interface QueryOptions {
  filters?: QueryFilter[];
  orderByField?: string;
  orderDirection?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

/**
 * Build a Firestore query dynamically from options.
 * Similar to the queryBuilder utility in sv-ecom but for Firestore.
 */
export function buildQuery(
  baseQuery: Query<DocumentData>,
  options: QueryOptions
): Query<DocumentData> {
  let query = baseQuery;

  // Apply filters
  if (options.filters) {
    for (const filter of options.filters) {
      if (filter.value !== undefined && filter.value !== null && filter.value !== '') {
        query = query.where(filter.field, filter.operator, filter.value);
      }
    }
  }

  // Apply ordering
  if (options.orderByField) {
    query = query.orderBy(options.orderByField, options.orderDirection || 'desc');
  }

  // Apply offset
  if (options.offset && options.offset > 0) {
    query = query.offset(options.offset);
  }

  // Apply limit
  if (options.limit && options.limit > 0) {
    query = query.limit(options.limit);
  }

  return query;
}

/**
 * Generate search tokens from a string for Firestore array-contains-any search.
 * Splits into lowercase words for tokenized search.
 */
export function generateSearchTokens(text: string): string[] {
  if (!text) return [];

  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter((word) => word.length > 0);

  // Include individual words and progressive prefixes for prefix search
  const tokens = new Set<string>();
  for (const word of words) {
    tokens.add(word);
    // Add prefixes of length >= 2 for partial matching
    for (let i = 2; i <= word.length; i++) {
      tokens.add(word.substring(0, i));
    }
  }

  return Array.from(tokens);
}
