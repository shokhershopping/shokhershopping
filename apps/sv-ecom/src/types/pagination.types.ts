export interface PaginationParams {
    limit: number;
    page: number;
}

export interface PaginatedResponse<T> {
    data: T;
    totalCount: number;
}
