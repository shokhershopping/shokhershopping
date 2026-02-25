/**
 * Standard API response interface.
 * Matches the existing IResponse<T> from sv-ecom for backward compatibility.
 */
export interface IResponse<T> {
  status: string;
  message: string;
  data: T | null;
  error?: string;
  code?: number;
  total?: number;
  totalPages?: number;
  page?: number;
  limit?: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}

/**
 * Create a success response.
 */
export function successResponse<T>(
  data: T,
  message = 'Success',
  pagination?: {
    total: number;
    page: number;
    limit: number;
  }
): IResponse<T> {
  const response: IResponse<T> = {
    status: 'success',
    message,
    data,
  };

  if (pagination) {
    const totalPages = Math.ceil(pagination.total / pagination.limit);
    response.total = pagination.total;
    response.totalPages = totalPages;
    response.page = pagination.page;
    response.limit = pagination.limit;
    response.hasNextPage = pagination.page < totalPages;
    response.hasPrevPage = pagination.page > 1;
  }

  return response;
}

/**
 * Create an error response.
 */
export function errorResponse<T = null>(
  message: string,
  code = 500,
  error?: string
): IResponse<T> {
  return {
    status: 'error',
    message,
    data: null,
    code,
    error,
  };
}
