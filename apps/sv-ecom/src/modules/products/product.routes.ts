import { Router } from 'express';
import {
    createProductController,
    deleteProductController,
    getAllProducts,
    getFeaturedProductsController,
    getLatestProductsController,
    getProductByIdController,
    getSlideProductsController,
    getTopSellingProductsController,
    updateProductController,
    searchProductsController,
} from './product.controller';
import { validate } from '../../middlewares/validate';
import {
    getAllProductsZodSchema,
    getLatestProductsZodSchema,
    getProductByIdZodSchema,
    getTopSellingProductsZodSchema,
    productCreateZodSchema,
    productDeleteZodSchema,
    productUpdateZodSchema,
    searchProductsZodSchema,
} from './req.types';

const router = Router();

// get all products
router.get('/', validate(getAllProductsZodSchema), getAllProducts);
router.get(
    '/search',
    validate(searchProductsZodSchema),
    searchProductsController
);
router.get(
    '/top-selling',
    validate(getTopSellingProductsZodSchema),
    getTopSellingProductsController
);
router.get(
    '/latest',
    validate(getLatestProductsZodSchema),
    getLatestProductsController
);
router.get(
    '/featured',
    validate(getLatestProductsZodSchema),
    getFeaturedProductsController
);
router.get(
    '/slider',
    validate(getLatestProductsZodSchema),
    getSlideProductsController
);
router.get('/:id', validate(getProductByIdZodSchema), getProductByIdController);
// get all variables of a product

// get all variables of a product by status

// get all categories

// get all subcategories of a category

// create product with optional category and product variables
router.post('/', validate(productCreateZodSchema), createProductController);
router.post('/:id', validate(productUpdateZodSchema), updateProductController);
// create & attach variables for a product

// create & attach category for a product

// attach variables to a product

// attach category to a product

// attach subcategory to a category

// update product with optional category and product variables

// update product variables

// update category

// delete product by id, cascade delete product variables
router.delete(
    '/:id',
    validate(productDeleteZodSchema),
    deleteProductController
);

// delete product variables

// delete category, cascade delete subcategories

export default router;
