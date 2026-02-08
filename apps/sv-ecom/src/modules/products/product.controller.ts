import { NextFunction, Request, Response } from 'express';
import {
    getProducts,
    createProduct,
    updateProduct,
    deleteProductWithVariables,
    getProductById,
    getTopSellingProducts,
    getLatestProducts,
    getFeaturedProducts,
    getSlideProducts,
    searchProducts,
} from './product.service';
import { ProductStatus } from '@prisma/client';

export const getAllProducts = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { page, limit, category, status } = req.query;
        const products = await getProducts(
            isNaN(Number(limit)) ? 10 : Number(limit),
            isNaN(Number(page)) ? 1 : Number(page),
            category as string | undefined,
            status as ProductStatus | undefined
        );
        res.json(products);
    } catch (error) {
        return next(error);
    }
};

export const getProductByIdController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const product = await getProductById(id);
        res.json(product);
    } catch (error) {
        return next(error);
    }
};

export const getLatestProductsController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { limit, page, category, status } = req.query;
        const products = await getLatestProducts(
            isNaN(Number(limit)) ? 10 : Number(limit),
            isNaN(Number(page)) ? 1 : Number(page),
            category as string | undefined,
            status as ProductStatus | undefined
        );
        res.json(products);
    } catch (error) {
        return next(error);
    }
};

export const getTopSellingProductsController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { limit, page, category, status } = req.query;
        const products = await getTopSellingProducts(
            isNaN(Number(limit)) ? 10 : Number(limit),
            isNaN(Number(page)) ? 1 : Number(page),
            category as string | undefined,
            status as ProductStatus | undefined
        );
        res.json(products);
    } catch (error) {
        console.log(error);
        return next(error);
    }
};

export const getFeaturedProductsController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { limit, page, category, status } = req.query;
        const products = await getFeaturedProducts(
            isNaN(Number(limit)) ? 10 : Number(limit),
            isNaN(Number(page)) ? 1 : Number(page),
            category as string | undefined,
            status as ProductStatus | undefined
        );
        res.json(products);
    } catch (error) {
        console.log(error);
        return next(error);
    }
};

export const getSlideProductsController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { limit, page, category, status } = req.query;
        const products = await getSlideProducts(
            isNaN(Number(limit)) ? 10 : Number(limit),
            isNaN(Number(page)) ? 1 : Number(page),
            category as string | undefined,
            status as ProductStatus | undefined
        );
        res.json(products);
    } catch (error) {
        console.log(error);
        return next(error);
    }
};

export const searchProductsController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { q, limit, page, category, status } = req.query;

        // Return empty results if no search query
        if (!q || typeof q !== 'string' || q.trim() === '') {
            return res.json({
                status: 'success',
                message: 'No search query provided',
                data: [],
                total: 0,
                totalPages: 0,
                page: 1,
                limit: 10,
                hasNextPage: false,
                hasPrevPage: false,
            });
        }

        const products = await searchProducts(
            q.trim(),
            isNaN(Number(limit)) ? 10 : Number(limit),
            isNaN(Number(page)) ? 1 : Number(page),
            category as string | undefined,
            status as ProductStatus | undefined
        );
        res.json(products);
    } catch (error) {
        console.log(error);
        return next(error);
    }
};

export const createProductController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { product, productVariables } = req.body;
        console.log(req.body);
        const createdProduct = await createProduct(product, productVariables);
        res.json(createdProduct);
    } catch (error) {
        return next(error);
    }
};

export const updateProductController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const { product, productVariables, deletedVariableIds } = req.body;
        const updatedProduct = await updateProduct(
            id,
            product,
            productVariables,
            deletedVariableIds
        );
        res.json(updatedProduct);
    } catch (error) {
        return next(error);
    }
};

export const deleteProductController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const deletedProduct = await deleteProductWithVariables(id);
        res.json(deletedProduct);
    } catch (error) {
        return next(error);
    }
};
