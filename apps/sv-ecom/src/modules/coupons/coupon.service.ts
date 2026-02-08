import { Coupon } from '@prisma/client';
import prisma from '../../prismaClient';
import { IResponse } from '../../types';

/**
 * get coupon by id
 * @param id coupon id
 * @returns coupon || null
 * @throws {Error} if operation fails
 */

export const getCouponById = async (
    id: string
): Promise<IResponse<Coupon | null>> => {
    const coupon = await prisma.coupon.findUnique({
        where: {
            id,
        },
    });

    const response: IResponse<Coupon | null> = {
        status: 'success',
        code: 200,
        error: '',
        message: 'Coupon retrieved successfully',
        data: coupon,
    };
    return response;
};

/**
 * get coupon by code
 * @param code coupon code
 * @returns coupon || null
 * @throws {Error} if operation fails
 */
export const getCouponByCode = async (
    code: string
): Promise<IResponse<Coupon | null>> => {
    const coupon = await prisma.coupon.findFirst({
        where: {
            code,
            status: 'ACTIVE',
        },
    });
    const response: IResponse<Coupon | null> = {
        status: 'success',
        code: 200,
        error: '',
        message: 'Coupon retrieved successfully',
        data: coupon,
    };
    return response;
};

/**
 * create coupon
 * @param coupon
 * @returns
 */

export const createCoupon = async (
    coupon: Omit<Coupon, 'id'>,
    userId?: string
): Promise<IResponse<Coupon>> => {
    console.log(coupon);
    const newCoupon = await prisma.coupon.create({
        data: {
            ...coupon,
            userId: userId || undefined,
        },
    });
    const response: IResponse<Coupon> = {
        status: 'success',
        code: 201,
        error: '',
        message: 'Coupon created successfully',
        data: newCoupon,
    };
    return response;
};

// /**
//  * apply coupon
//  * @param couponCode
//  * @returns coupon || null
//  * @throws {Error} if operation fails
//  */

// export const applyCoupon = async (
//     couponCode: string
// ): Promise<Coupon | null> => {
//     const coupon = await prisma.coupon.findFirst({
//         where: {
//             code: couponCode,
//             status: 'ACTIVE',
//             start: {
//                 lte: new Date(),
//             },
//             expiry: {
//                 gte: new Date(),
//             },
//         },
//     });

//     if (!coupon) {
//         throw new Error('Coupon not found or expired');
//     }

//     if (coupon.limit && coupon.limit <= coupon.used) {
//         throw new Error('Coupon usage limit reached');
//     }

//     return coupon;
// };

/**
 * update coupon
 * @param id
 * @param coupon
 * @returns
 */

export const updateCoupon = async (
    id: string,
    coupon: Partial<Coupon>
): Promise<IResponse<Coupon>> => {
    const updatedCoupon = await prisma.coupon.update({
        where: {
            id,
        },
        data: coupon,
    });
    const response: IResponse<Coupon> = {
        status: 'success',
        code: 200,
        error: '',
        message: 'Coupon updated successfully',
        data: updatedCoupon,
    };
    return response;
};

/**
 * delete coupon
 * @param id
 * @returns
 */

export const deleteCoupon = async (id: string): Promise<IResponse<Coupon>> => {
    const deletedCoupon = await prisma.coupon.delete({
        where: {
            id,
        },
    });
    const response: IResponse<Coupon> = {
        status: 'success',
        code: 200,
        error: '',
        message: 'Coupon deleted successfully',
        data: deletedCoupon,
    };
    return response;
};
