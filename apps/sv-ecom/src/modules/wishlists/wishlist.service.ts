import { IResponse } from '../../types/response.types';
import { Wishlist, WishlistItem } from '@prisma/client';
import prisma from '../../prismaClient';
import { CustomError } from '../../utils/CustomError';
/**
 * get all wishlist by user id
 * @param userId user id
 * @param limit number of items per page
 * @param page page number
 * @param sort sort by field
 * @param order order by field
 * @returns IResponse<Wishlist>
 * @returns wishlist
 * @throws {Error} if operation fails
 */

export const findAllByUserId = async (
    userId: string,
    limit: number,
    page: number,
    sort?: string,
    order?: string
): Promise<IResponse<Wishlist | null>> => {
    // Get the wishlist for this user (there's only one per user)
    const wishlist = await prisma.wishlist.findUnique({
        where: {
            userId,
        },
        include: {
            items: {
                skip: (page - 1) * limit,
                take: limit,
                orderBy: {
                    [sort || 'createdAt']: order || 'desc',
                },
                include: {
                    product: {
                        include: {
                            images: true,
                        },
                    },
                    variableProduct: {
                        include: {
                            images: true,
                        },
                    },
                },
            },
            user: true,
        },
    });

    // Count total items in the wishlist
    const total = wishlist
        ? await prisma.wishlistItem.count({
              where: {
                  wishlistId: wishlist.userId,
              },
          })
        : 0;

    const response: IResponse<Wishlist | null> = {
        status: 'success',
        code: 200,
        error: '',
        message: 'Wishlist retrieved successfully',
        data: wishlist,
        total,
        totalPages: Math.ceil(total / limit),
        page,
        limit,
        hasNextPage: total > page * limit,
        hasPrevPage: page > 1,
    };
    return response;
};

/** * Create a new wishlist for a user
 * @param userId user id
 * @returns IResponse<Wishlist>
 * @throws {Error} if operation fails
 */
export const createWishlist = async (
    userId: string
): Promise<IResponse<Wishlist>> => {
    const wishlist = await prisma.wishlist.create({
        data: {
            userId,
        },
        include: {
            items: true,
            user: true,
        },
    });
    const response: IResponse<Wishlist> = {
        status: 'success',
        code: 201,
        error: '',
        message: 'Wishlist created successfully',
        data: wishlist,
    };
    return response;
};

/** * Add items to a user's wishlist
 *  * if wishlist does not exist, it will be created first
 *  * if item already exists, it will be not added again
 * @param userId user id
 * @param items array of WishlistItem objects
 * @returns IResponse<Wishlist>
 * @throws {Error} if operation fails
 */
export const addToWishlist = async (
    userId: string,
    items: WishlistItem[]
): Promise<IResponse<Wishlist>> => {
    // Check if wishlist exists for the user
    let wishlist = await prisma.wishlist.findUnique({
        where: {
            userId,
        },
    });
    console.log('wishlist', wishlist);
    console.log('items', items);

    // If wishlist does not exist, create a new one
    if (!wishlist) {
        const createdWishlistResponse = await createWishlist(userId);
        wishlist = createdWishlistResponse.data;
    }

    // get all the items that are already in the wishlist
    const existingItems = await prisma.wishlist
        .findMany({
            where: {
                userId,
            },
            select: {
                items: {
                    select: {
                        productId: true,
                        variableProductId: true,
                    },
                },
            },
        })
        .then((wishlists) => {
            return wishlists.flatMap((wishlist) => wishlist.items);
        });

    console.log('existingItems', existingItems);

    const existingItemIds = new Set(
        existingItems.map((item) => {
            return item.productId || item.variableProductId;
        })
    );

    // Filter out items that are already in the wishlist
    const newItems = items.filter((item) => {
        const itemId = item.productId || item.variableProductId;
        return !existingItemIds.has(itemId);
    });

    console.log('newItems', newItems);

    // If no new items to add, return the existing wishlist
    if (newItems.length === 0) {
        throw new CustomError('No new items to add to the wishlist', 400);
    }

    // check if productId is actually a productId or variableProductId
    const itemIds = items.map((item) => {
        if (!item.productId && !item.variableProductId) {
            throw new CustomError(
                'At least one of productId or variableProductId must be provided',
                400
            );
        }
        return item.productId || item.variableProductId;
    });

    const [existingProducts, existingVariableProducts] = await Promise.all([
        prisma.product.findMany({
            where: {
                id: {
                    in: itemIds.filter(
                        (id): id is string => typeof id === 'string'
                    ),
                },
            },
        }),
        prisma.variableProduct.findMany({
            where: {
                id: {
                    in: itemIds.filter(
                        (id): id is string => typeof id === 'string'
                    ),
                },
            },
        }),
    ]);

    const existingProductsMap = new Map(
        existingProducts.map((product) => [product.id, product])
    );
    const existingVariableProductsMap = new Map(
        existingVariableProducts.map((variableProduct) => [
            variableProduct.id,
            variableProduct,
        ])
    );

    // Add items to the wishlist
    const updatedWishlist = await prisma.wishlist.update({
        where: {
            userId,
        },
        data: {
            items: {
                createMany: {
                    data: items.map((item) => {
                        const isProduct = existingProductsMap.has(
                            item.productId ?? ''
                        );
                        return isProduct
                            ? {
                                  productId: item.productId,
                                  variableProductId: null,
                              }
                            : {
                                  productId: null,
                                  variableProductId: item.variableProductId,
                              };
                    }),
                    skipDuplicates: true, // Skip duplicates
                },
            },
        },
        include: {
            items: true,
            user: true,
        },
    });
    const response: IResponse<Wishlist> = {
        status: 'success',
        code: 201,
        error: '',
        message: 'Items added to wishlist successfully',
        data: updatedWishlist,
    };
    return response;
};

/**
 * Remove items from a user's wishlist
 * @param userId user id
 * @param itemIds array of item ids to remove
 * @returns IResponse<Wishlist>
 * @throws {Error} if operation fails
 */
export const removeFromWishlist = async (
    userId: string,
    itemIds: string[]
): Promise<IResponse<Wishlist>> => {
    // Check if wishlist exists for the user
    const wishlist = await prisma.wishlist.findUnique({
        where: {
            userId,
        },
        include: {
            items: true,
        },
    });

    if (!wishlist) {
        throw new CustomError('Wishlist not found', 404);
    }

    // Remove items from the wishlist
    const updatedWishlist = await prisma.wishlist.update({
        where: {
            userId,
        },
        data: {
            items: {
                deleteMany: {
                    id: {
                        in: itemIds,
                    },
                },
            },
        },
        include: {
            items: true,
            user: true,
        },
    });

    const response: IResponse<Wishlist> = {
        status: 'success',
        code: 200,
        error: '',
        message: 'Items removed from wishlist successfully',
        data: updatedWishlist,
    };
    return response;
};
