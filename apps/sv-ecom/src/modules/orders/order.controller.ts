import { OrderStatus, PaymentMethod } from '@prisma/client';
import {
    create,
    findAll,
    findAllByPaymentMethod,
    findAllByProductId,
    findAllByUserId,
    findById,
    remove,
    update,
    updateStatus,
} from './order.service';
import { Request, Response, NextFunction } from 'express';

export const getAllController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { limit, page, status, sort, order, userId } = req.query;
        const orders = await findAll(
            isNaN(Number(page)) ? 1 : Number(page),
            isNaN(Number(limit)) ? 10 : Number(limit),
            (sort ?? 'createdAt') as string,
            (order ?? 'desc') as string,
            status as OrderStatus | undefined,
            userId as string | undefined
        );
        res.json(orders);
    } catch (error) {
        return next(error);
    }
};

export const getByIdController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const order = await findById(id);
        res.json(order);
    } catch (error) {
        return next(error);
    }
};

export const getByUserIdController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { userId } = req.params;
        const { limit, page, sort, order } = req.query;
        const orders = await findAllByUserId(
            userId,
            isNaN(Number(page)) ? 1 : Number(page),
            isNaN(Number(limit)) ? 10 : Number(limit),
            sort as string,
            order as string
        );
        res.json(orders);
    } catch (error) {
        return next(error);
    }
};

export const createOrderController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { order, items, shippingAddress, billingAddress } = req.body;
        const newOrder = await create(
            order,
            items,
            shippingAddress,
            billingAddress
        );
        res.status(201).json(newOrder);
    } catch (error) {
        return next(error);
    }
};

export const updateOrderController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const { order, billingAddress, shippingAddress } = req.body;
        const updatedOrder = await update(
            id,
            order,
            billingAddress,
            shippingAddress
        );
        res.json(updatedOrder);
    } catch (error) {
        return next(error);
    }
};

export const updateOrderStatusController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const updatedOrder = await updateStatus(id, status);
        res.json(updatedOrder);
    } catch (error) {
        return next(error);
    }
};

export const deleteOrderController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const deletedOrder = await remove(id);
        res.json(deletedOrder);
    } catch (error) {
        return next(error);
    }
};

export const findAllByProductIdController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { productId } = req.params;
        const { limit, page, sort, order } = req.query;
        const orders = await findAllByProductId(
            productId,
            isNaN(Number(page)) ? 1 : Number(page),
            isNaN(Number(limit)) ? 10 : Number(limit),
            sort as string,
            order as string
        );
        res.json(orders);
    } catch (error) {
        return next(error);
    }
};

export const findAllByPaymentMethodController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { paymentMethod } = req.params;
        const { limit, page, sort, order } = req.query;
        const orders = await findAllByPaymentMethod(
            paymentMethod,
            isNaN(Number(page)) ? 1 : Number(page),
            isNaN(Number(limit)) ? 10 : Number(limit),
            sort as string,
            order as string
        );
        res.json(orders);
    } catch (error) {
        return next(error);
    }
};
