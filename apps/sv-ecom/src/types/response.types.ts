export interface IResponse<T> {
    status: string;
    message: string;
    data: T;
    error?: string;
    code?: number;
    total?: number;
    totalPages?: number;
    page?: number;
    limit?: number;
    hasNextPage?: boolean;
    hasPrevPage?: boolean;
}
