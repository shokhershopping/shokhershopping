import {
    Address,
    Order,
    OrderItem,
    OrderStatus,
    PaymentMethod,
} from '@prisma/client';
import prisma from '../../prismaClient';
import { IResponse } from '../../types';

/**
 * get all orders
 * @param {number} page - The page number to retrieve.
 * @param {number} limit - The number of items per page.
 * @param {string} sort - The field to sort by.
 * @param {string} order - The order to sort in (asc or desc).
 * @param {string} status - The status to filter by.
 * @param {string} userId - The user ID to filter by.
 */

export const findAll = async (
    page: number,
    limit: number,
    sort: string,
    order: string,
    status: string | undefined,
    userId: string | undefined
): Promise<IResponse<Order[]>> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (userId) {
        where.userId = userId;
    }

    if (status) {
        where.status = {
            contains: status,
            mode: 'insensitive',
        };
    }

    const [orders, total] = await prisma.$transaction([
        prisma.order.findMany({
            where,
            orderBy: {
                [sort]: order,
            },
            skip: (page - 1) * limit,
            take: limit,
            include: {
                user: true,
                billingAddress: true,
                shippingAddress: true,
                items: {
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
                coupon: true,
            },
        }),
        prisma.order.count({
            where,
        }),
    ]);

    // Handle legacy orders without billing address
    const ordersWithBilling = orders.map((order) => {
        if (!order.billingAddress && order.shippingAddress) {
            return { ...order, billingAddress: order.shippingAddress };
        }
        return order;
    });

    const response: IResponse<Order[]> = {
        status: 'success',
        code: 200,
        error: '',
        message: 'Orders retrieved successfully',
        data: ordersWithBilling,
        total,
        totalPages: Math.ceil(total / limit),
        page,
        limit,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
    };

    return response;
};

/**
 * get order by id
 * @param id order id
 * @returns order || null
 * @throws {Error} if operation fails
 */
export const findById = async (
    id: string
): Promise<IResponse<Order | null>> => {
    const order = await prisma.order.findUnique({
        where: {
            id,
        },
        include: {
            user: true,
            items: {
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
            coupon: true,
            billingAddress: true,
            shippingAddress: true,
            transaction: true,
        },
    });

    // Handle legacy orders: If billingAddress is null but shippingAddress exists, use shipping as billing
    // This ensures backward compatibility with orders created before billingAddress field was added
    let orderData = order;
    if (order && !order.billingAddress && order.shippingAddress) {
        orderData = {
            ...order,
            billingAddress: order.shippingAddress,
        } as any;
    }

    const response: IResponse<Order | null> = {
        status: 'success',
        code: 200,
        error: '',
        message: 'Order retrieved successfully',
        data: orderData,
    };
    return response;
};

/**
 * find all orders by user id
 * @param userId user id
 * @param page page number
 * @param limit number of items per page
 * @param sort field to sort by
 * @param order order to sort in (asc or desc)
 * @returns IResponse<Order[]>
 * @throws {Error} if operation fails
 */

export const findAllByUserId = async (
    userId: string,
    page: number,
    limit: number,
    sort: string,
    order: string
): Promise<IResponse<Order[]>> => {
    const [orders, total] = await prisma.$transaction([
        prisma.order.findMany({
            where: {
                userId,
            },
            orderBy: {
                [sort]: order,
            },
            skip: (page - 1) * limit,
            take: limit,
            include: {
                user: true,
                items: {
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
                coupon: true,
                billingAddress: true,
                shippingAddress: true,
            },
        }),
        prisma.order.count({
            where: {
                userId,
            },
        }),
    ]);
    const response: IResponse<Order[]> = {
        status: 'success',
        code: 200,
        error: '',
        message: 'Orders retrieved successfully',
        data: orders,
        total,
        totalPages: Math.ceil(total / limit),
        page,
        limit,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
    };
    return response;
};

/**
 * create order
 * @param order
 * @returns IResponse<Order>
 * @throws {Error} if operation fails
 */
export const create = async (
    order: Omit<Order, 'id'>,
    items: OrderItem[],
    shippingAddress: Omit<Address, 'id'>,
    billingAddress?: Omit<Address, 'id'>
): Promise<IResponse<Order>> => {
    // get all products / variable products from items
    const productIds = items
        .map((item) => item.productId)
        .filter((id) => id !== null);

    // Create shipping address
    const createdShippingAddress = await prisma.address.create({
        data: {
            ...shippingAddress,
            userId: order.userId,
        },
    });

    // Create billing address if provided, otherwise use shipping address
    const createdBillingAddress = billingAddress
        ? await prisma.address.create({
              data: {
                  ...billingAddress,
                  userId: order.userId,
              },
          })
        : createdShippingAddress;

    // check if all products / variable products exist
    const [products, variableProducts, coupon] = await Promise.all([
        prisma.product.findMany({
            where: {
                id: {
                    in: productIds as string[],
                },
            },
        }),

        prisma.variableProduct.findMany({
            where: {
                id: {
                    in: productIds as string[],
                },
            },
        }),

        order.couponId
            ? prisma.coupon.findUnique({
                  where: {
                      id: order.couponId,
                  },
              })
            : null,
    ]);

    console.log('Products:', products);
    console.log('Variable Products:', variableProducts);

    const allProducts = [...products, ...variableProducts];

    // get total discount from products / variable products (price - salePrice)
    const totalDiscount = allProducts.reduce((acc, product) => {
        const item = items.find((item) => item.productId === product.id);
        if (item) {
            return (
                acc + (product.price - (product.salePrice ?? 0)) * item.quantity
            );
        }
        return acc;
    }, 0);

    // get total price from products / variable products (price)
    const totalPrice = allProducts.reduce((acc, product) => {
        const item = items.find((item) => item.productId === product.id);
        if (item) {
            return acc + product.price * item.quantity;
        }
        return acc;
    }, 0);

    // check if coupon is valid
    if (coupon) {
        if (coupon.status !== 'ACTIVE') {
            throw new Error('Coupon is not active');
        }
        if (coupon.start && coupon.end < new Date()) {
            throw new Error('Coupon has expired');
        }
        if (coupon.limit && coupon.used >= coupon.limit) {
            throw new Error('Coupon usage limit reached');
        }
        if (coupon.minimum && totalPrice < coupon.minimum) {
            throw new Error(
                `Coupon minimum purchase amount is ${coupon.minimum}`
            );
        }
    }

    // get coupon discount with minimum purchase amount
    // and maximum discount amoun

    const couponDiscount = coupon
        ? coupon.minimum <= totalPrice
            ? coupon.type === 'PERCENTAGE'
                ? totalPrice * (coupon.amount / 100) > coupon.maximum
                    ? coupon.maximum
                    : totalPrice * (coupon.amount / 100)
                : coupon.amount > coupon.maximum
                  ? coupon.maximum
                  : coupon.amount
            : 0
        : 0;

    const newOrder = await prisma.order.create({
        data: {
            ...order,
            total: totalPrice,
            itemsTotalDiscount: totalDiscount,
            couponAppliedDiscount: couponDiscount,
            totalWithDiscount: totalPrice - totalDiscount - couponDiscount,
            netTotal:
                totalPrice -
                totalDiscount -
                couponDiscount +
                order.deliveryCharge,
            items: {
                createMany: {
                    data: items.map((item) => ({
                        quantity: item.quantity,
                        productId: products.find(
                            (product) => product.id === item.productId
                        )
                            ? item.productId
                            : null,
                        variableProductId: variableProducts.find(
                            (variableProduct) =>
                                variableProduct.id === item.productId
                        )
                            ? item.productId
                            : null,
                    })),
                },
            },
            billingAddressId: createdBillingAddress.id,
            shippingAddressId: createdShippingAddress.id,
        },
        include: {
            user: true,
            items: true,
            coupon: true,
        },
    });

    const response: IResponse<Order> = {
        status: 'success',
        code: 201,
        error: '',
        message: 'Order created successfully',
        data: newOrder,
    };
    return response;
};

/**
 * update order
 * @param id order id
 * @param order order data
 * @returns IResponse<Order>
 * @throws {Error} if operation fails
 */
export const update = async (
    id: string,
    order: Omit<Order, 'id'>,
    billingAddress?: Address,
    shippingAddress?: Address
): Promise<IResponse<Order>> => {
    // update billing address if provided
    if (billingAddress) {
        await prisma.address.update({
            where: {
                id: billingAddress.id,
            },
            data: {
                ...billingAddress,
            },
        });
    }

    // update shipping address if provided
    if (shippingAddress) {
        await prisma.address.update({
            where: {
                id: shippingAddress.id,
            },
            data: {
                ...shippingAddress,
            },
        });
    }

    const updatedOrder = await prisma.order.update({
        where: {
            id,
        },
        data: {
            ...order,
        },
        include: {
            user: true,
            items: true,
            coupon: true,
            billingAddress: true,
            shippingAddress: true,
        },
    });
    const response: IResponse<Order> = {
        status: 'success',
        code: 200,
        error: '',
        message: 'Order updated successfully',
        data: updatedOrder,
    };
    return response;
};
/**
 * delete order
 * @param id order id
 * @returns IResponse<Order>
 * @throws {Error} if operation fails
 */
export const remove = async (id: string): Promise<IResponse<Order>> => {
    const deletedOrder = await prisma.order.delete({
        where: {
            id,
        },
        include: {
            user: true,
            items: true,
            coupon: true,
        },
    });

    const response: IResponse<Order> = {
        status: 'success',
        code: 200,
        error: '',
        message: 'Order deleted successfully',
        data: deletedOrder,
    };
    return response;
};
/**
 * update order status
 * @param id order id
 * @param status order status
 * @returns IResponse<Order>
 * @throws {Error} if operation fails
 */
export const updateStatus = async (
    id: string,
    status: OrderStatus
): Promise<IResponse<Order>> => {
    const updatedOrder = await prisma.order.update({
        where: {
            id,
        },
        data: {
            status,
        },
        include: {
            user: true,
            items: true,
            coupon: true,
        },
    });

    const response: IResponse<Order> = {
        status: 'success',
        code: 200,
        error: '',
        message: 'Order status updated successfully',
        data: updatedOrder,
    };
    return response;
};

/**
 * get all orders for a product
 * @param productId product id or variable product id
 * @param page page number
 * @param limit number of items per page
 * @param sort field to sort by
 * @param order order to sort in (asc or desc)
 */

export const findAllByProductId = async (
    productId: string,
    page: number,
    limit: number,
    sort: string,
    order: string
): Promise<IResponse<Order[]>> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
        OR: [
            {
                items: {
                    some: {
                        productId: productId,
                    },
                },
            },
            {
                items: {
                    some: {
                        variableProductId: productId,
                    },
                },
            },
        ],
    };

    const [orders, total] = await prisma.$transaction([
        prisma.order.findMany({
            where,
            orderBy: {
                [sort]: order,
            },
            skip: (page - 1) * limit,
            take: limit,
            include: {
                user: true,
                items: true,
                coupon: true,
            },
        }),
        prisma.order.count({
            where,
        }),
    ]);

    const response: IResponse<Order[]> = {
        status: 'success',
        code: 200,
        error: '',
        message: 'Orders retrieved successfully',
        data: orders,
        total,
        totalPages: Math.ceil(total / limit),
        page,
        limit,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
    };

    return response;
};

/**
 * find all orders by payment method
 * @param paymentMethod
 * @param page
 * @param limit
 * @param sort
 * @param order
 * @returns IResponse<Order[]>
 * @throws {Error} if operation fails
 */

export const findAllByPaymentMethod = async (
    paymentMethod: string,
    page: number,
    limit: number,
    sort: string,
    order: string
): Promise<IResponse<Order[]>> => {
    const [orders, total] = await prisma.$transaction([
        prisma.order.findMany({
            where: {
                transaction: {
                    paymentMethod: paymentMethod as PaymentMethod,
                },
            },
            orderBy: {
                [sort]: order,
            },
            skip: (page - 1) * limit,
            take: limit,
            include: {
                user: true,
                items: true,
                coupon: true,
                transaction: true,
            },
        }),
        prisma.order.count({
            where: {
                transaction: {
                    paymentMethod: paymentMethod as PaymentMethod,
                },
            },
        }),
    ]);

    const response: IResponse<Order[]> = {
        status: 'success',
        code: 200,
        error: '',
        message: 'Orders retrieved successfully',
        data: orders,
        total,
        totalPages: Math.ceil(total / limit),
        page,
        limit,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
    };

    return response;
};
