import { z } from 'zod';

export const createCouponSchema = z.object({
    body: z.object({
        coupon: z
            .object({
                code: z.string(),
                description: z.string().optional(),
                amount: z.number().min(1, 'Amount must be greater than 0'),
                type: z.enum(['PERCENTAGE', 'FIXED']).optional(),
                start: z.string().refine((val) => {
                    const date = new Date(val);
                    return !isNaN(date.getTime());
                }, 'Invalid start date'),
                expiry: z.string().refine((val) => {
                    const date = new Date(val);
                    return !isNaN(date.getTime());
                }, 'Invalid expiry date'),
                minimum: z.number().optional(),
                maximum: z.number().optional(),
                used: z.number().optional(),
                limit: z.number().optional(),
                status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
            })
            .strict(),
        userId: z.string().optional(),
    }),
});

export const updateCouponSchema = z.object({
    params: z.object({
        id: z.string(),
    }),
    body: z.object({
        coupon: z
            .object({
                code: z.string().optional(),
                description: z.string().optional(),
                amount: z
                    .number()
                    .min(1, 'Amount must be greater than 0')
                    .optional(),
                type: z.enum(['PERCENTAGE', 'FIXED']).optional(),
                start: z.date().optional(),
                expiry: z.date().optional(),
                minimum: z.number().optional(),
                maximum: z.number().optional(),
                used: z.number().optional(),
                limit: z.number().optional(),
                status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
            })
            .strict(),
    }),
});

export const getByIdSchema = z.object({
    params: z.object({
        id: z.string(),
    }),
});

export const getByCodeSchema = z.object({
    params: z.object({
        code: z.string(),
    }),
});

export const deleteCouponSchema = z.object({
    params: z.object({
        id: z.string(),
    }),
});
