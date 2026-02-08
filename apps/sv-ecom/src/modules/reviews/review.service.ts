import prisma from '../../prismaClient';
import { IResponse } from '../../types';
import { Review } from '@prisma/client';

/**
 * find all reviews for a product or variable product
 * @param productId
 * @param limit
 * @param page
 * @param sort
 * @param order
 * @returns IResponse<IReview[]>
 * @throws Error if operation fails
 */

export const findAllByProductId = async (
    productId: string,
    limit: number,
    page: number,
    sort?: string,
    order?: string
): Promise<IResponse<Review[]>> => {
    const [reviews, total] = await Promise.all([
        prisma.review.findMany({
            // product or variable product
            where: {
                OR: [
                    {
                        productId,
                    },
                    {
                        variantId: productId,
                    },
                ],
            },
            orderBy: {
                [sort || 'createdAt']: order || 'desc',
            },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.review.count({
            where: {
                productId,
            },
        }),
    ]);

    const response: IResponse<Review[]> = {
        status: 'success',
        code: 200,
        error: '',
        message: 'Reviews retrieved successfully',
        data: reviews,
        total,
        totalPages: Math.ceil(total / limit),
        page,
        limit,
        hasNextPage: total > page * limit,
        hasPrevPage: page > 1,
    };
    return response;
};

/**
 * find all reviews for a user
 * @param userId
 * @param limit
 * @param page
 * @param sort
 * @param order
 * @returns IResponse<IReview[]>
 * @throws Error if operation fails
 */
export const findAllByUserId = async (
    userId: string,
    limit: number,
    page: number,
    sort?: string,
    order?: string
): Promise<IResponse<Review[]>> => {
    const [reviews, total] = await Promise.all([
        prisma.review.findMany({
            where: {
                userId,
            },
            orderBy: {
                [sort || 'createdAt']: order || 'desc',
            },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.review.count({
            where: {
                userId,
            },
        }),
    ]);

    const response: IResponse<Review[]> = {
        status: 'success',
        code: 200,
        error: '',
        message: 'Reviews retrieved successfully',
        data: reviews,
        total,
        totalPages: Math.ceil(total / limit),
        page,
        limit,
        hasNextPage: total > page * limit,
        hasPrevPage: page > 1,
    };
    return response;
};

/**
 * find review by id
 * @param id
 * @returns IResponse<IReview>
 * @throws Error if operation fails
 */
export const findById = async (
    id: string
): Promise<IResponse<Review | null>> => {
    const review = await prisma.review.findUnique({
        where: {
            id,
        },
    });

    const response: IResponse<Review | null> = {
        status: 'success',
        code: 200,
        error: '',
        message: 'Review retrieved successfully',
        data: review,
    };
    return response;
};

/**
 * aggregate reviews by product id or variable id, total average rating, group by 1, 2, 3, 4, 5 stars
 * @param productId
 * @returns IResponse<IReviewAggregate>
 * @throws Error if operation fails
 */

export const aggregateByProductId = async (
    productId: string
): Promise<IResponse<Review[]>> => {
    const reviews = await prisma.review.groupBy({
        by: ['rating'],
        where: {
            OR: [
                {
                    productId,
                },
                {
                    variantId: productId,
                },
            ],
        },
        _count: {
            rating: true,
        },
        _avg: {
            rating: true,
        },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response: IResponse<any[]> = {
        status: 'success',
        code: 200,
        error: '',
        message: 'Reviews retrieved successfully',
        data: reviews,
    };
    return response;
};

/**
 * create review
 * @param review
 * @returns IResponse<IReview>
 * @throws Error if operation fails
 */
export const create = async (review: Review): Promise<IResponse<Review>> => {
    const providedProductId = review.productId;
    // check if provided productID is actually a product or a variant
    if (providedProductId) {
        const product = await prisma.product.findUnique({
            where: {
                id: providedProductId,
            },
        });
        const variant = await prisma.variableProduct.findUnique({
            where: {
                id: providedProductId,
            },
        });
        if (!product && !variant) {
            throw new Error(
                'Provided productId or variantId does not exist in the database'
            );
        }
        // if product exists, set productId and variantId to null
        if (product) {
            review.productId = providedProductId;
            review.variantId = null;
        } else if (variant) {
            review.variantId = providedProductId;
            review.productId = null;
        }
    } else {
        // if no productId or variantId is provided, throw an error
        throw new Error('Either productId or variantId must be provided');
    }
    const createdReview = await prisma.review.create({
        data: review,
    });

    const response: IResponse<Review> = {
        status: 'success',
        code: 201,
        error: '',
        message: 'Review created successfully',
        data: createdReview,
    };
    return response;
};

/**
 * update review
 * @param id
 * @param review
 * @returns IResponse<IReview>
 * @throws Error if operation fails
 */
export const update = async (
    id: string,
    review: Partial<Review>
): Promise<IResponse<Review>> => {
    const updatedReview = await prisma.review.update({
        where: {
            id,
        },
        data: review,
    });

    const response: IResponse<Review> = {
        status: 'success',
        code: 200,
        error: '',
        message: 'Review updated successfully',
        data: updatedReview,
    };
    return response;
};

/**
 * delete review
 * @param id
 * @returns IResponse<IReview>
 * @throws Error if operation fails
 */
export const deleteReview = async (id: string): Promise<IResponse<Review>> => {
    const deletedReview = await prisma.review.delete({
        where: {
            id,
        },
    });

    const response: IResponse<Review> = {
        status: 'success',
        code: 200,
        error: '',
        message: 'Review deleted successfully',
        data: deletedReview,
    };
    return response;
};

/**
 * delete all reviews for a product or variable product
 * @param productId
 * @returns IResponse<IReview>
 * @throws Error if operation fails
 */
export const deleteAllByProductId = async (
    productId: string
): Promise<IResponse<number>> => {
    const deletedReviews = await prisma.review.deleteMany({
        where: {
            OR: [
                {
                    productId,
                },
                {
                    variantId: productId,
                },
            ],
        },
    });

    const response: IResponse<number> = {
        status: 'success',
        code: 200,
        error: '',
        message: 'Reviews deleted successfully',
        data: deletedReviews.count,
    };
    return response;
};
