import { NextFunction, Request, Response } from 'express';
import { getUsers, getUserById, updateUserMetadata, ensureUserExists } from './user.service';

export const getAllUsers = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { limit, page } = req.query;
        const users = await getUsers({
            limit: isNaN(Number(limit)) ? 10 : Number(limit),
            page: isNaN(Number(page)) ? 1 : Number(page),
        });
        res.json(users);
    } catch (error) {
        return next(error);
    }
};

export const getUserByIdController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const user = await getUserById(id as string);
        res.json(user);
    } catch (error) {
        return next(error);
    }
};

export const updateUserMetadataController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const { metadata } = req.body;
        const user = await updateUserMetadata(id as string, metadata);
        res.json(user);
    } catch (error) {
        return next(error);
    }
};

export const ensureUserExistsController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id, email, name, image } = req.body;
        const result = await ensureUserExists({ id, email, name, image });
        res.json(result);
    } catch (error) {
        return next(error);
    }
};
