import { Request, Response, NextFunction } from 'express';
import {
    createCategory,
    deleteCategory,
    getAllCategories,
    getCategoryById,
    getFeaturedCategories,
    getMenuCategories,
    getSlideCategories,
    updateCategory,
} from './category.service';

export const createCategoryController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const {
            category,
            imageFilename,
            sliderImageFilename,
            title,
        } = req.body;
        console.log('body', req.body);
        const createdCategory = await createCategory(
            category,
            imageFilename,
            sliderImageFilename,
            title
        );
        res.json(createdCategory);
    } catch (error) {
        return next(error);
    }
};

export const updateCategoryController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { categoryId } = req.params;
        const {
            category,
            imageFilename,
            sliderImageFilename,
            title,
        } = req.body;
        const updatedCategory = await updateCategory(
            categoryId,
            category,
            imageFilename,
            sliderImageFilename,
            title
        );
        res.json(updatedCategory);
    } catch (error) {
        return next(error);
    }
};

export const getCategoryController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { categoryId } = req.params;
        const category = await getCategoryById(categoryId);
        if (!category) {
            res.status(404).json({
                success: false,
                message: 'Category not found',
            });
        }
        res.json(category);
    } catch (error) {
        return next(error);
    }
};

export const getAllCategoriesController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { page, limit, parentId } = req.query;
        const pageNumber = isNaN(Number(page)) ? 1 : Number(page);
        const limitNumber = isNaN(Number(limit)) ? 10 : Number(limit);
        const categories = await getAllCategories(
            pageNumber,
            limitNumber,
            parentId as string
        );
        res.json(categories);
    } catch (error) {
        return next(error);
    }
};

export const getFeaturedCategoriesController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { page, limit } = req.query;
        const pageNumber = isNaN(Number(page)) ? 1 : Number(page);
        const limitNumber = isNaN(Number(limit)) ? 10 : Number(limit);
        const categories = await getFeaturedCategories(pageNumber, limitNumber);
        res.json(categories);
    } catch (error) {
        return next(error);
    }
};

export const getSlideCategoriesController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { page, limit } = req.query;
        const pageNumber = isNaN(Number(page)) ? 1 : Number(page);
        const limitNumber = isNaN(Number(limit)) ? 10 : Number(limit);
        const categories = await getSlideCategories(pageNumber, limitNumber);
        res.json(categories);
    } catch (error) {
        return next(error);
    }
};

export const getMenuCategoriesController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { page, limit } = req.query;
        const pageNumber = isNaN(Number(page)) ? 1 : Number(page);
        const limitNumber = isNaN(Number(limit)) ? 10 : Number(limit);
        const categories = await getMenuCategories(pageNumber, limitNumber);
        res.json(categories);
    } catch (error) {
        return next(error);
    }
};

export const deleteCategoryController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { categoryId } = req.params;
        const deletedCategory = await deleteCategory(categoryId);
        if (!deletedCategory) {
            res.status(404).json({
                success: false,
                message: 'Category not found',
            });
        }
        res.json(deletedCategory);
    } catch (error) {
        return next(error);
    }
};
