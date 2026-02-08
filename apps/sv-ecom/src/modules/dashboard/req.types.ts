import { z } from 'zod';

// Dashboard Stats Query Schema
export const dashboardStatsQuerySchema = z.object({
    query: z.object({
        period: z
            .string()
            .optional()
            .default('30')
            .transform((val) => parseInt(val, 10))
            .refine((val) => val > 0 && val <= 3650, {
                message: 'Period must be between 1 and 3650 days',
            }),
    }),
    params: z.object({}),
    body: z.object({}),
});

// Sales Report Query Schema
export const salesReportQuerySchema = z.object({
    query: z.object({
        year: z
            .string()
            .optional()
            .default(new Date().getFullYear().toString())
            .transform((val) => parseInt(val, 10))
            .refine((val) => val >= 2000 && val <= 2100, {
                message: 'Year must be between 2000 and 2100',
            }),
    }),
    params: z.object({}),
    body: z.object({}),
});

// Top Products Query Schema
export const topProductsQuerySchema = z.object({
    query: z.object({
        limit: z
            .string()
            .optional()
            .default('10')
            .transform((val) => parseInt(val, 10))
            .refine((val) => val > 0 && val <= 50, {
                message: 'Limit must be between 1 and 50',
            }),
        startDate: z
            .string()
            .optional()
            .transform((val) => (val ? new Date(val) : undefined)),
        endDate: z
            .string()
            .optional()
            .transform((val) => (val ? new Date(val) : undefined)),
    }),
    params: z.object({}),
    body: z.object({}),
});

// Customer Analytics Query Schema
export const customerAnalyticsQuerySchema = z.object({
    query: z.object({
        year: z
            .string()
            .optional()
            .default(new Date().getFullYear().toString())
            .transform((val) => parseInt(val, 10))
            .refine((val) => val >= 2000 && val <= 2100, {
                message: 'Year must be between 2000 and 2100',
            }),
    }),
    params: z.object({}),
    body: z.object({}),
});

// User Location Query Schema (no params needed for now)
export const userLocationQuerySchema = z.object({
    query: z.object({}),
    params: z.object({}),
    body: z.object({}),
});

// Stock Report Query Schema
export const stockReportQuerySchema = z.object({
    query: z.object({
        page: z
            .string()
            .optional()
            .default('1')
            .transform((val) => parseInt(val, 10))
            .refine((val) => val > 0, {
                message: 'Page must be greater than 0',
            }),
        limit: z
            .string()
            .optional()
            .default('5')
            .transform((val) => parseInt(val, 10))
            .refine((val) => val > 0 && val <= 100, {
                message: 'Limit must be between 1 and 100',
            }),
        threshold: z
            .string()
            .optional()
            .default('10')
            .transform((val) => parseInt(val, 10))
            .refine((val) => val >= 0, {
                message: 'Threshold must be 0 or greater',
            }),
    }),
    params: z.object({}),
    body: z.object({}),
});

// TypeScript types
export type DashboardStatsQuery = z.infer<
    typeof dashboardStatsQuerySchema
>['query'];
export type SalesReportQuery = z.infer<
    typeof salesReportQuerySchema
>['query'];
export type TopProductsQuery = z.infer<typeof topProductsQuerySchema>['query'];
export type CustomerAnalyticsQuery = z.infer<
    typeof customerAnalyticsQuerySchema
>['query'];
export type StockReportQuery = z.infer<typeof stockReportQuerySchema>['query'];
