import { z } from 'zod';

export const categoryCreateZodSchema = z.object({
    body: z.object({
        category: z.object({
            name: z.string().min(1, 'Category name is required'),
            description: z.string().optional(),
            parentId: z.string().optional(),
            isFeatured: z.boolean().optional(),
            isSlide: z.boolean().optional(),
            isMenu: z.boolean().optional(),
        }),
        imageFilename: z.string().optional(),
        sliderImageFilename: z.string().optional(),
        title: z.string().optional(),
    }),
});

export const getCategoryByIdZodSchema = z.object({
    params: z.object({
        categoryId: z.string().min(10, 'Category ID is required'),
    }),
});

export const getAllCategoriesByParentIdZodSchema = z.object({
    query: z.object({
        page: z.string().optional(),
        limit: z.string().optional(),
        parentId: z.string(),
    }),
});

export const deleteCategoryByIdZodSchema = z.object({
    params: z.object({
        categoryId: z.string().min(10, 'Category ID is required'),
    }),
});
