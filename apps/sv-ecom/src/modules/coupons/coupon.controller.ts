import { Request, Response, NextFunction } from 'express';
import {
    createCoupon,
    deleteCoupon,
    getCouponByCode,
    getCouponById,
    updateCoupon,
} from './coupon.service';

export const getByIdController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const coupon = await getCouponById(id);
        res.json(coupon);
    } catch (error) {
        return next(error);
    }
};

export const getByCodeController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { code } = req.params;
        const coupon = await getCouponByCode(code);
        res.json(coupon);
    } catch (error) {
        return next(error);
    }
};

export const createCouponController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { coupon, userId } = req.body;
        const newCoupon = await createCoupon(coupon, userId);
        res.status(201).json(newCoupon);
    } catch (error) {
        return next(error);
    }
};

export const updateCouponController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const { coupon } = req.body;
        const updatedCoupon = await updateCoupon(id, coupon);
        res.json(updatedCoupon);
    } catch (error) {
        return next(error);
    }
};

export const deleteCouponController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const deletedCoupon = await deleteCoupon(id);
        res.json(deletedCoupon);
    } catch (error) {
        return next(error);
    }
};
