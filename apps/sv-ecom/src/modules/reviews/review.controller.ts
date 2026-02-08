import { Request, Response, NextFunction } from 'express';
import {
    aggregateByProductId,
    create,
    deleteAllByProductId,
    deleteReview,
    findAllByProductId,
    findAllByUserId,
    findById,
    update,
} from './review.service';

export const findAllByProductIdController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { productId } = req.params;
        const { limit, page } = req.query;
        const reviews = await findAllByProductId(
            productId,
            isNaN(Number(limit)) ? 10 : Number(limit),
            isNaN(Number(page)) ? 1 : Number(page)
        );
        res.json(reviews);
    } catch (error) {
        return next(error);
    }
};

export const findAllByUserIdController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { userId } = req.params;
        const { limit, page } = req.query;
        const reviews = await findAllByUserId(
            userId,
            isNaN(Number(limit)) ? 10 : Number(limit),
            isNaN(Number(page)) ? 1 : Number(page)
        );
        res.json(reviews);
    } catch (error) {
        return next(error);
    }
};

export const findByIdController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const review = await findById(id);
        res.json(review);
    } catch (error) {
        return next(error);
    }
};

export const aggregateByProductIdController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { productId } = req.params;
        const reviews = await aggregateByProductId(productId);
        res.json(reviews);
    } catch (error) {
        return next(error);
    }
};

export const createReviewController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { review } = req.body;
        const newReview = await create(review);
        res.status(201).json(newReview);
    } catch (error) {
        return next(error);
    }
};

export const updateReviewController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const { review } = req.body;
        const updatedReview = await update(id, review);
        res.json(updatedReview);
    } catch (error) {
        return next(error);
    }
};

export const deleteReviewController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const deletedReview = await deleteReview(id);
        res.json(deletedReview);
    } catch (error) {
        return next(error);
    }
};

export const deleteAllByProductIdController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { productId } = req.params;
        const deletedReviews = await deleteAllByProductId(productId);
        res.json(deletedReviews);
    } catch (error) {
        return next(error);
    }
};
