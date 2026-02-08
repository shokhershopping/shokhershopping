import { z } from 'zod';

export const findAllOrdersSchema = z.object({
    body: z
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
            q: z.string().optional(),
            status: z.string().optional(),
            userId: z.string().optional(),
        })
        .strict(),
});

export const findByIdSchema = z.object({
    params: z.object({
        id: z.string(),
    }),
});

export const createOrderSchema = z.object({
    body: z
        .object({
            order: z
                .object({
                    userId: z.string(),
                    status: z.string().optional(),
                    deliveryCharge: z.number(),
                    deliveryOption: z.string().optional(),
                    couponId: z.string().optional(),
                })
                .strict(),
            items: z
                .array(
                    z
                        .object({
                            quantity: z.number(),
                            productId: z.string().optional(),
                            variableProductId: z.string().optional(),
                        })
                        .refine((item) => item.quantity > 0, {
                            message: 'Quantity must be greater than 0',
                        })

                        .refine(
                            (item) =>
                                (item.productId && !item.variableProductId) ||
                                (!item.productId && item.variableProductId),
                            {
                                message:
                                    'Either productId or variableProductId must be provided',
                            }
                        )
                )
                .refine((items) => items.length > 0, {
                    message: 'Items array must contain at least one item',
                }),
            shippingAddress: z
                .object({
                    name: z.string(),
                    address: z.string(),
                    city: z.string(),
                    state: z.string(),
                    country: z.string(),
                    zip: z.string(),
                    phone: z.string(),
                })
                .strict(),
            billingAddress: z
                .object({
                    name: z.string(),
                    address: z.string(),
                    city: z.string(),
                    state: z.string(),
                    country: z.string(),
                    zip: z.string(),
                    phone: z.string(),
                })
                .strict()
                .optional(),
        })
        .strict(),
});

export const updateOrderSchema = z.object({
    params: z.object({
        id: z.string(),
    }),
    body: z
        .object({
            order: z
                .object({
                    userId: z.string().optional(),
                    status: z.string().optional(),
                    deliveryCharge: z.number().optional(),
                    deliveryOption: z.string().optional(),
                    couponId: z.string().optional(),
                })
                .strict(),

            billingAddress: z
                .object({
                    id: z.string(),
                    userId: z.string().optional(),
                    name: z.string().optional(),
                    address: z.string().optional(),
                    city: z.string().optional(),
                    state: z.string().optional(),
                    country: z.string().optional(),
                    zip: z.string().optional(),
                    phone: z.string().optional(),
                    isPrimary: z.boolean().optional(),
                })
                .strict()
                .optional(),

            shippingAddress: z
                .object({
                    id: z.string(),
                    userId: z.string().optional(),
                    name: z.string().optional(),
                    address: z.string().optional(),
                    city: z.string().optional(),
                    state: z.string().optional(),
                    country: z.string().optional(),
                    zip: z.string().optional(),
                    phone: z.string().optional(),
                    isPrimary: z.boolean().optional(),
                })
                .strict()
                .optional(),
        })
        .strict(),
});

export const updateOrderStatusSchema = z.object({
    params: z.object({
        id: z.string(),
    }),
    body: z
        .object({
            status: z.string(),
        })
        .strict(),
});

export const deleteOrderSchema = z.object({
    params: z.object({
        id: z.string(),
    }),
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

export const findAllByPaymentMethodSchema = z.object({
    params: z.object({
        paymentMethod: z.string(),
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
