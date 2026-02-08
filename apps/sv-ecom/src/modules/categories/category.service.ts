import { IResponse } from '../../types';
import { Category } from '@prisma/client';
import prisma from '../../prismaClient';
import { CustomError } from '../../utils/CustomError';
export const getAllCategories = async (
    page: number,
    limit: number,
    parentId?: string
): Promise<IResponse<Category[]>> => {
    try {
        const [categories, counts] = await Promise.all([
            prisma.category.findMany({
                where: {
                    parentId: parentId || undefined,
                },
                include: {
                    image: true,
                    products: true,
                    parent: true,
                },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.category.count({
                where: {
                    parentId: parentId || undefined,
                },
            }),
        ]);
        const response: IResponse<Category[]> = {
            status: 'success',
            message: 'Categories fetched successfully',
            data: categories,
            total: counts,
            totalPages: Math.ceil(counts / limit),
            page,
            limit,
            hasNextPage: counts > page * limit,
            hasPrevPage: page > 1,
        };

        return response;
    } catch (error) {
        console.error('Error fetching categories:', error);
        throw new CustomError('Error occurred while fetching categories', 500);
    }
};

export const getCategoryById = async (
    categoryId: string
): Promise<IResponse<Category | null>> => {
    try {
        const category = await prisma.category.findUnique({
            where: { id: categoryId },
            include: {
                products: true,
                parent: true,
                children: {
                    include: {
                        products: true,
                    },
                },
            },
        });
        const response: IResponse<Category | null> = {
            status: 'success',
            message: 'Category fetched successfully',
            data: category,
            total: 1,
            totalPages: 1,
            page: 1,
            limit: 1,
            hasNextPage: false,
            hasPrevPage: false,
        };
        return response;
    } catch (error) {
        console.error('Error fetching category by ID:', error);
        throw new CustomError('Error occurred while fetching category', 500);
    }
};

export const getFeaturedCategories = async (
    page: number,
    limit: number,
    parentId?: string
): Promise<IResponse<Category[]>> => {
    try {
        const [categories, counts] = await Promise.all([
            prisma.category.findMany({
                where: {
                    parentId: parentId || undefined,
                    isFeatured: true,
                },
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    products: true,
                },
            }),
            prisma.category.count({
                where: {
                    parentId: parentId || undefined,
                    isFeatured: true,
                },
            }),
        ]);

        const response: IResponse<Category[]> = {
            status: 'success',
            message: 'Featured categories fetched successfully',
            data: categories,
            total: counts,
            totalPages: Math.ceil(counts / limit),
            page,
            limit,
            hasNextPage: counts > page * limit,
            hasPrevPage: page > 1,
        };
        return response;
    } catch (error) {
        console.error('Error fetching featured categories:', error);
        throw new CustomError(
            'Error occurred while fetching featured categories',
            500
        );
    }
};

export const getSlideCategories = async (
    page: number,
    limit: number,
    parentId?: string
): Promise<IResponse<Category[]>> => {
    try {
        const [categories, counts] = await Promise.all([
            prisma.category.findMany({
                where: {
                    parentId: parentId || undefined,
                    isSlide: true,
                },
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    products: true,
                },
            }),
            prisma.category.count({
                where: {
                    parentId: parentId || undefined,
                    isSlide: true,
                },
            }),
        ]);
        const response: IResponse<Category[]> = {
            status: 'success',
            message: 'Slide categories fetched successfully',
            data: categories,
            total: counts,
            totalPages: Math.ceil(counts / limit),
            page,
            limit,
            hasNextPage: counts > page * limit,
            hasPrevPage: page > 1,
        };
        return response;
    } catch (error) {
        console.error('Error fetching slide categories:', error);
        throw new CustomError(
            'Error occurred while fetching slide categories',
            500
        );
    }
};

export const getMenuCategories = async (
    page: number,
    limit: number,
    parentId?: string
): Promise<IResponse<Category[]>> => {
    try {
        const [categories, counts] = await Promise.all([
            prisma.category.findMany({
                where: {
                    parentId: parentId || undefined,
                    isMenu: true,
                },
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    products: true,
                },
            }),
            prisma.category.count({
                where: {
                    parentId: parentId || undefined,
                    isMenu: true,
                },
            }),
        ]);
        const response: IResponse<Category[]> = {
            status: 'success',
            message: 'Menu categories fetched successfully',
            data: categories,
            total: counts,
            totalPages: Math.ceil(counts / limit),
            page,
            limit,
            hasNextPage: counts > page * limit,
            hasPrevPage: page > 1,
        };
        return response;
    } catch (error) {
        console.error('Error fetching menu categories:', error);
        throw new CustomError(
            'Error occurred while fetching menu categories',
            500
        );
    }
};

export const getAllCategoriesByParentId = async (
    parentId: string,
    page: number,
    limit: number
): Promise<IResponse<Category[]>> => {
    try {
        const [categories, counts] = await Promise.all([
            prisma.category.findMany({
                where: {
                    parentId: parentId,
                },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.category.count({
                where: {
                    parentId: parentId,
                },
            }),
        ]);
        const response: IResponse<Category[]> = {
            status: 'success',
            message: 'Categories fetched successfully',
            data: categories,
            total: counts,
            totalPages: Math.ceil(counts / limit),
            page,
            limit,
            hasNextPage: counts > page * limit,
            hasPrevPage: page > 1,
        };
        return response;
    } catch (error) {
        console.error('Error fetching categories by parent ID:', error);
        throw new CustomError(
            'Error occurred while fetching categories by parent ID',
            500
        );
    }
};

/**
 * create category
 * @param category
 * @returns Category
 * @throws CustomError
 */

export const createCategory = async (
    category: Category,
    imageFilename: string,
    sliderImageFilename: string,
    title: string
): Promise<IResponse<Category>> => {
    try {
        const data = {
            name: category.name,
            description: category.description,
            isFeatured: category.isFeatured ?? false,
            isSlide: category.isSlide ?? false,
            isMenu: category.isMenu ?? false,
        } as Category;

        if (category.parentId) {
            data.parentId = category.parentId;
        }

        if (imageFilename) {
            data.imageFilename = imageFilename;
        }

        if (sliderImageFilename) {
            data.slideImageFilename = sliderImageFilename;
        }

        if (title) {
            data.title = title;
        }

        console.log('category', data);

        const createdCategory = await prisma.category.create({
            data,
        });

        const response: IResponse<Category> = {
            status: 'success',
            message: 'Category created successfully',
            data: createdCategory,
            total: 1,
            totalPages: 1,
            page: 1,
            limit: 1,
            hasNextPage: false,
            hasPrevPage: false,
        };
        return response;
    } catch (error) {
        console.error('Error creating category:', error);
        throw new CustomError('Error occurred while creating category', 500);
    }
};

export const updateCategory = async (
    categoryId: string,
    category: Category,
    imageFilename: string,
    sliderImageFilename: string,
    title: string
): Promise<IResponse<Category>> => {
    try {
        const data = {
            name: category.name,
            description: category.description,
        } as Category;

        // Update boolean fields - only if explicitly provided in category object
        if (category.isFeatured !== undefined) {
            data.isFeatured = category.isFeatured;
        }
        if (category.isSlide !== undefined) {
            data.isSlide = category.isSlide;
        }
        if (category.isMenu !== undefined) {
            data.isMenu = category.isMenu;
        }

        if (category.parentId) {
            data.parentId = category.parentId;
        }

        if (imageFilename) {
            data.imageFilename = imageFilename;
        }

        if (sliderImageFilename) {
            data.slideImageFilename = sliderImageFilename;
        }

        if (title) {
            data.title = title;
        }
        console.log('updated category', data);

        const updatedCategory = await prisma.category.update({
            where: { id: categoryId },
            data,
        });

        const response: IResponse<Category> = {
            status: 'success',
            message: 'Category updated successfully',
            data: updatedCategory,
            total: 1,
            totalPages: 1,
            page: 1,
            limit: 1,
            hasNextPage: false,
            hasPrevPage: false,
        };
        return response;
    } catch (error) {
        console.error('Error updating category:', error);
        throw new CustomError('Error occurred while updating category', 500);
    }
};

export const deleteCategory = async (
    categoryId: string
): Promise<IResponse<Category>> => {
    try {
        const deletedCategory = await prisma.category.delete({
            where: { id: categoryId },
        });

        const response: IResponse<Category> = {
            status: 'success',
            message: 'Category deleted successfully',
            data: deletedCategory,
            total: 1,
            totalPages: 1,
            page: 1,
            limit: 1,
            hasNextPage: false,
            hasPrevPage: false,
        };
        return response;
    } catch (error) {
        console.error('Error deleting category:', error);
        throw new CustomError('Error occurred while deleting category', 500);
    }
};

/**
 * Get all descendant category IDs recursively
 * @param categoryId - The parent category ID
 * @returns Array of category IDs including the parent and all descendants
 * @throws CustomError
 */
export const getAllDescendantCategoryIds = async (
    categoryId: string
): Promise<string[]> => {
    try {
        const categoryIds: string[] = [categoryId];

        // Recursive function to fetch all descendants
        const fetchDescendants = async (parentId: string): Promise<void> => {
            const children = await prisma.category.findMany({
                where: { parentId },
                select: { id: true },
            });

            for (const child of children) {
                categoryIds.push(child.id);
                // Recursively fetch descendants of this child
                await fetchDescendants(child.id);
            }
        };

        await fetchDescendants(categoryId);
        return categoryIds;
    } catch (error) {
        console.error('Error fetching descendant category IDs:', error);
        throw new CustomError(
            'Error occurred while fetching descendant categories',
            500
        );
    }
};
