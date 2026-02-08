import { Router } from 'express';
import {
    categoryCreateZodSchema,
    deleteCategoryByIdZodSchema,
    getAllCategoriesByParentIdZodSchema,
    getCategoryByIdZodSchema,
} from './req.types';
import { validate } from '../../middlewares/validate';
import {
    createCategoryController,
    deleteCategoryController,
    getAllCategoriesController,
    getCategoryController,
    getFeaturedCategoriesController,
    getMenuCategoriesController,
    getSlideCategoriesController,
    updateCategoryController,
} from './category.controller';

const router = Router();

// get all categories
router.get('/', getAllCategoriesController);
router.get('/featured', getFeaturedCategoriesController);
router.get('/slider', getSlideCategoriesController);
router.get('/menu', getMenuCategoriesController);

// get all categories by parentId
router.get(
    '/childrens',
    validate(getAllCategoriesByParentIdZodSchema),

    getAllCategoriesController
);
// get category by id
router.get(
    '/:categoryId',
    validate(getCategoryByIdZodSchema),

    getCategoryController
);

// create category
router.post('/', validate(categoryCreateZodSchema), createCategoryController);
router.put(
    '/:categoryId',
    validate(categoryCreateZodSchema),
    updateCategoryController
);
router.delete(
    '/:categoryId',
    validate(deleteCategoryByIdZodSchema),
    deleteCategoryController
);
export default router;
