import { z } from 'zod';

export const findAllByUserIdSchema = z.object({
    params: z.object({
        userId: z.string(),
    }),
    query: z
        .object({
            limit: z
                .string()
                .optional()
                .transform((val) => (val ? Number(val) : undefined)),
            page: z
                .string()
                .optional()
                .transform((val) => (val ? Number(val) : undefined)),
            sort: z.string().optional(),
            order: z.string().optional(),
        })
        .strict(),
});

export const findAllByProductIdSchema = z.object({
    params: z.object({
        productId: z.string(),
    }),
    query: z
        .object({
            limit: z
                .string()
                .optional()
                .transform((val) => (val ? Number(val) : undefined)),
            page: z
                .string()
                .optional()
                .transform((val) => (val ? Number(val) : undefined)),
            sort: z.string().optional(),
            order: z.string().optional(),
        })
        .strict(),
});

export const findByIdSchema = z.object({
    params: z.object({
        id: z.string(),
    }),
});
export const aggregateByProductIdSchema = z.object({
    params: z.object({
        productId: z.string(),
    }),
    query: z
        .object({
            limit: z
                .string()
                .optional()
                .transform((val) => (val ? Number(val) : undefined)),
            page: z
                .string()
                .optional()
                .transform((val) => (val ? Number(val) : undefined)),
            sort: z.string().optional(),
            order: z.string().optional(),
        })
        .strict(),
});
export const createReviewSchema = z.object({
    body: z
        .object({
            review: z
                .object({
                    rating: z
                        .number()
                        .min(1, 'Rating must be greater than 0')
                        .max(5, 'Rating must be less than or equal to 5'),
                    comment: z.string().optional(),
                    status: z
                        .enum(['PENDING', 'APPROVED', 'REJECTED'])
                        .optional(),
                    userId: z.string(),
                    productId: z.string().optional(),
                    variantId: z.string().optional(),
                })
                .refine(
                    (data) =>
                        (data.productId && !data.variantId) ||
                        (!data.productId && data.variantId),
                    {
                        message:
                            'Either productId or variantId must be provided',
                    }
                ),
        })
        .strict(),
});

export const updateReviewSchema = z.object({
    params: z.object({
        id: z.string(),
    }),
    body: z
        .object({
            review: z
                .object({
                    rating: z
                        .number()
                        .min(1, 'Rating must be greater than 0')
                        .max(5, 'Rating must be less than or equal to 5')
                        .optional(),
                    comment: z.string().optional(),
                    status: z
                        .enum(['PENDING', 'APPROVED', 'REJECTED'])
                        .optional(),
                    userId: z.string().optional(),
                    productId: z.string().optional(),
                    variantId: z.string().optional(),
                })
                .refine(
                    (data) =>
                        (data.productId && !data.variantId) ||
                        (!data.productId && data.variantId),
                    {
                        message:
                            'Either productId or variantId must be provided',
                    }
                ),
        })
        .strict(),
});

export const deleteReviewSchema = z.object({
    params: z.object({
        id: z.string(),
    }),
});

export const deleteAllByProductIdSchema = z.object({
    params: z.object({
        productId: z.string(),
    }),
});
