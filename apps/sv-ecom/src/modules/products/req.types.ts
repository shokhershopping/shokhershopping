import { DiscountType, ProductStatus, ProductType } from '@prisma/client';
import { z } from 'zod';

// Schema for get all products
export const getAllProductsZodSchema = z.object({
    query: z
        .object({
            category: z.string().optional(),
            status: z.string().optional(),
            limit: z.string().optional(),
            page: z.string().optional(),
        })
        .refine(
            (data) => {
                if (data.limit && isNaN(Number(data.limit))) {
                    return false;
                }
                return true;
            },
            {
                message: 'Limit must be a number',
            }
        )
        .refine(
            (data) => {
                if (data.page && isNaN(Number(data.page))) {
                    return false;
                }
                return true;
            },
            {
                message: 'Page must be a number',
            }
        )
        .refine(
            (data) => {
                if (
                    data.status &&
                    !Object.values(ProductStatus).includes(
                        data.status as ProductStatus
                    )
                ) {
                    return false;
                }
                return true;
            },
            {
                message: 'Invalid product status',
            }
        )
        .optional(),
});

export const getProductByIdZodSchema = z.object({
    params: z
        .object({
            id: z.string().nonempty({ message: 'Product ID is required' }),
        })
        .strict(),
});

export const getLatestProductsZodSchema = z.object({
    query: z
        .object({
            limit: z.string().optional(),
            page: z.string().optional(),
            category: z.string().optional(),
            status: z.string().optional(),
        })
        .refine(
            (data) => {
                if (data.limit && isNaN(Number(data.limit))) {
                    return false;
                }
                return true;
            },
            {
                message: 'Limit must be a number',
            }
        )
        .refine(
            (data) => {
                if (data.page && isNaN(Number(data.page))) {
                    return false;
                }
                return true;
            },
            {
                message: 'Page must be a number',
            }
        )
        .refine(
            (data) => {
                if (
                    data.status &&
                    !Object.values(ProductStatus).includes(
                        data.status as ProductStatus
                    )
                ) {
                    return false;
                }
                return true;
            },
            {
                message: 'Invalid product status',
            }
        )
        .optional(),
});

export const getTopSellingProductsZodSchema = z.object({
    query: z
        .object({
            limit: z.string().optional(),
            page: z.string().optional(),
            category: z.string().optional(),
            status: z.string().optional(),
        })
        .refine(
            (data) => {
                if (data.limit && isNaN(Number(data.limit))) {
                    return false;
                }
                return true;
            },
            {
                message: 'Limit must be a number',
            }
        )
        .refine(
            (data) => {
                if (data.page && isNaN(Number(data.page))) {
                    return false;
                }
                return true;
            },
            {
                message: 'Page must be a number',
            }
        )
        .refine(
            (data) => {
                if (
                    data.status &&
                    !Object.values(ProductStatus).includes(
                        data.status as ProductStatus
                    )
                ) {
                    return false;
                }
                return true;
            },
            {
                message: 'Invalid product status',
            }
        )
        .optional(),
});

// Schema for product creation
export const productCreateZodSchema = z.object({
    body: z
        .object({
            product: z.object({
                name: z
                    .string()
                    .nonempty({ message: 'Name is required' })
                    .min(3, 'Name is too short'),
                description: z.string().min(10, 'Description is too short'),
                imageIds: z.array(z.string()).optional(),
                sizeGuideId: z.string().optional(),
                specifications: z.record(
                    z.string().min(1, 'Specification is too short')
                ),
                deliveryTime: z
                    .string()
                    .min(3, 'Delivery time is too short')
                    .optional(),
                returnTime: z
                    .string()
                    .min(3, 'Return time is too short')
                    .optional(),
                price: z
                    .number()
                    .positive({ message: 'Price must be positive' }),
                salePrice: z
                    .number()
                    .positive({ message: 'Price must be positive' }),
                stock: z
                    .number()
                    .positive({ message: 'Stock must be positive' }),
                sku: z.string().optional(), // SKU for product identification
                kind: z
                    .string()
                    .refine(
                        (val) =>
                            Object.values(ProductType).includes(
                                val as ProductType
                            ),
                        {
                            message: 'Invalid type of product',
                        }
                    ),
                brand: z.string().optional(),
                status: z
                    .string()
                    .refine(
                        (val) =>
                            Object.values(ProductStatus).includes(
                                val as ProductStatus
                            ),
                        {
                            message: 'Invalid product status',
                        }
                    ),
                categoryIds: z.array(z.string()).optional(),
            }),

            productVariables: z
                .array(
                    z.object({
                        name: z
                            .string()
                            .nonempty({ message: 'Name is required' })
                            .min(3, 'Name is too short'),
                        description: z
                            .string()
                            .min(10, 'Description is too short'),
                        imageIds: z.array(z.string()).optional(),
                        specifications: z.record(
                            z.string().min(1, 'Specification is too short')
                        ),
                        price: z
                            .number()
                            .positive({ message: 'Price must be positive' }),
                        salePrice: z
                            .number()
                            .positive({ message: 'Price must be positive' }),
                        stock: z
                            .number()
                            .positive({ message: 'Stock must be positive' }),
                        sku: z.string({ message: 'SKU is required' }),
                        status: z
                            .string()
                            .refine(
                                (val) =>
                                    Object.values(ProductStatus).includes(
                                        val as ProductStatus
                                    ),
                                {
                                    message: 'Invalid product status',
                                }
                            ),
                    })
                )
                .optional(),
        })
        .strict(),
    query: z.object({}).optional(), // Allow empty query objects
    params: z.object({}).optional(), // Allow empty params
});

export const productUpdateZodSchema = z.object({
    body: z
        .object({
            product: z
                .object({
                    name: z
                        .string()
                        .nonempty({ message: 'Name is required' })
                        .min(3, 'Name is too short')
                        .optional(),
                    description: z
                        .string()
                        .min(10, 'Description is too short')
                        .optional(),
                    imageIds: z.array(z.string()).optional(),
                    sizeGuideId: z.string().optional(),
                    specifications: z
                        .record(z.string().min(1, 'Specification is too short'))
                        .optional(),
                    deliveryTime: z
                        .string()
                        .min(3, 'Delivery time is too short')
                        .optional(),
                    returnTime: z
                        .string()
                        .min(3, 'Return time is too short')
                        .optional(),
                    price: z
                        .number()
                        .positive({ message: 'Price must be positive' })
                        .optional(),
                    salePrice: z
                        .number()
                        .positive({ message: 'Price must be positive' })
                        .optional(),
                    stock: z
                        .number()
                        .positive({ message: 'Stock must be positive' })
                        .optional(),
                    sku: z.string().optional(), // SKU for product identification
                    kind: z
                        .string()
                        .refine(
                            (val) =>
                                Object.values(ProductType).includes(
                                    val as ProductType
                                ),
                            {
                                message: 'Invalid type of product',
                            }
                        )
                        .optional(),
                    brand: z.string().optional(),
                    status: z
                        .string()
                        .refine(
                            (val) =>
                                Object.values(ProductStatus).includes(
                                    val as ProductStatus
                                ),
                            {
                                message: 'Invalid product status',
                            }
                        )
                        .optional(),
                    categoryIds: z.array(z.string()).optional(),
                })
                .partial(), // Make all fields optional

            productVariables: z
                .array(
                    z
                        .object({
                            id: z.string().optional(), // Added for existing variables
                            name: z
                                .string()
                                .nonempty({ message: 'Name is required' })
                                .min(3, 'Name is too short')
                                .optional(),
                            description: z
                                .string()
                                .min(10, 'Description is too short')
                                .optional(),
                            imageIds: z.array(z.string()).optional(),
                            specifications: z
                                .record(
                                    z
                                        .string()
                                        .min(1, 'Specification is too short')
                                )
                                .optional(),
                            price: z
                                .number()
                                .positive({ message: 'Price must be positive' })
                                .optional(),
                            salePrice: z
                                .number()
                                .positive({ message: 'Price must be positive' })
                                .optional(),
                            stock: z
                                .number()
                                .positive({ message: 'Stock must be positive' })
                                .optional(),
                            sku: z
                                .string({ message: 'SKU is required' })
                                .optional(),
                            status: z
                                .string()
                                .refine(
                                    (val) =>
                                        Object.values(ProductStatus).includes(
                                            val as ProductStatus
                                        ),
                                    {
                                        message: 'Invalid product status',
                                    }
                                )
                                .optional(),
                        })
                        .partial()
                )
                .optional(),
            deletedVariableIds: z.array(z.string()).optional(), // For deleting variables
        })
        .strict(),
    query: z.object({}).optional(),
    params: z.object({
        id: z.string().nonempty({ message: 'Product ID is required' }),
    }),
});

export const productDeleteZodSchema = z.object({
    body: z.object({}).optional(), // Empty body
    query: z.object({}).optional(), // Empty query
    params: z
        .object({
            id: z.string().nonempty({ message: 'Product ID is required' }),
        })
        .strict(),
});

// Schema for search products
export const searchProductsZodSchema = z.object({
    query: z
        .object({
            q: z
                .string()
                .min(1, { message: 'Search query must be at least 1 character' }),
            limit: z.string().optional(),
            page: z.string().optional(),
            category: z.string().optional(),
            status: z.string().optional(),
        })
        .refine(
            (data) => {
                if (data.limit && isNaN(Number(data.limit))) {
                    return false;
                }
                return true;
            },
            {
                message: 'Limit must be a number',
            }
        )
        .refine(
            (data) => {
                if (data.page && isNaN(Number(data.page))) {
                    return false;
                }
                return true;
            },
            {
                message: 'Page must be a number',
            }
        )
        .refine(
            (data) => {
                if (
                    data.status &&
                    !Object.values(ProductStatus).includes(
                        data.status as ProductStatus
                    )
                ) {
                    return false;
                }
                return true;
            },
            {
                message: 'Invalid product status',
            }
        ),
    body: z.object({}).optional(),
    params: z.object({}).optional(),
});
