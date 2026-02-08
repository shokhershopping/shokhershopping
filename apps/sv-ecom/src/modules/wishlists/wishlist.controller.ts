import { Request, Response, NextFunction } from 'express';
import {
    addToWishlist,
    findAllByUserId,
    removeFromWishlist,
} from './wishlist.service';

export const findAllByUserIdController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { userId } = req.params;
        const { limit, page } = req.query;
        const wishlists = await findAllByUserId(
            userId,
            isNaN(Number(limit)) ? 10 : Number(limit),
            isNaN(Number(page)) ? 1 : Number(page)
        );
        res.json(wishlists);
    } catch (error) {
        return next(error);
    }
};

export const addToWishlistController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { userId, items } = req.body;
        const wishlist = await addToWishlist(userId, items);
        res.status(201).json(wishlist);
    } catch (error) {
        return next(error);
    }
};

export const removeFromWishlistController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { userId, itemIds } = req.body;
        const wishlist = await removeFromWishlist(userId, itemIds);
        res.status(201).json(wishlist);
    } catch (error) {
        return next(error);
    }
};
