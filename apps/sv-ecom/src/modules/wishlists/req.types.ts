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

export const addToWishlistSchema = z.object({
    body: z
        .object({
            items: z.array(
                z
                    .object({
                        wishlistId: z.string().optional(),
                        productId: z.string().optional(),
                        variableProductId: z.string().optional(),
                    })
                    .refine(
                        (item) => item.productId || item.variableProductId,
                        {
                            message:
                                'At least one of productId or variableProductId must be provided',
                        }
                    )
            ),
            userId: z.string(),
        })
        .strict(),
});

export const removeFromWishlistSchema = z.object({
    body: z
        .object({
            userId: z.string(),
            itemIds: z.array(z.string()), // Array of item IDs to remove
        })
        .strict(),
});
