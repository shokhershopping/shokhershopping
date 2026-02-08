import {
    Category,
    Image,
    Product,
    ProductStatus,
    VariableProduct,
} from '@prisma/client';
import { CustomError } from '../../utils/CustomError';
import { IResponse } from '../../types';
import prisma from '../../prismaClient';
import { getAllDescendantCategoryIds } from '../categories/category.service';

/**
 * get all products
 * @param limit
 * @param page
 * @param category optional - category ID or slug
 * @param status optional
 * @param cursor optional
 * @returns Product[]
 */
export const getProducts = async (
    limit: number,
    page: number,
    category?: string,
    status?: ProductStatus
): Promise<IResponse<Product[]>> => {
    const where = {};

    if (category) {
        // Get all descendant category IDs recursively
        const categoryIds = await getAllDescendantCategoryIds(category);
        Object.assign(where, {
            categories: {
                some: {
                    categoryId: {
                        in: categoryIds,
                    },
                },
            },
        });
    }

    if (status) {
        Object.assign(where, { status });
    }

    try {
        const [products, count] = await Promise.all([
            prisma.product.findMany({
                where,
                include: {
                    variableProducts: {
                        include: {
                            images: true,
                        },
                    },
                    images: true,
                    categories: {
                        include: {
                            category: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },

                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.product.count({
                where,
            }),
        ]);
        const resp: IResponse<Product[]> = {
            status: 'success',
            message: 'Products fetched successfully',
            data: products,
            total: count,
            totalPages: Math.ceil(count / limit),
            page,
            limit,
            hasNextPage: count > page * limit,
            hasPrevPage: page > 1,
        };
        return resp;
    } catch (error) {
        throw new CustomError('Error occurred while fetching users', 500);
    }
};

/**
 * get product by id
 * @param productId
 * @returns Product
 * @throws CustomError
 */

export const getProductById = async (
    productId: string
): Promise<IResponse<Product | null>> => {
    try {
        const product = await prisma.product.findUnique({
            where: {
                id: productId,
            },
            include: {
                images: true,
                categories: true,
                variableProducts: {
                    include: {
                        images: true,
                    },
                },
            },
        });

        const response: IResponse<Product | null> = {
            status: 'success',
            message: 'Product fetched successfully',
            data: product,
            total: 1,
            totalPages: 1,
            page: 1,
            limit: 1,
            hasNextPage: false,
            hasPrevPage: false,
        };
        return response;
    } catch (error) {
        throw new CustomError('Error occurred while fetching product', 500);
    }
};

/**
 * get latest products
 * @param limit
 * @param page
 * @param category optional - category ID or slug
 * @param status optional
 * @returns Product[]
 */

export const getLatestProducts = async (
    limit: number,
    page: number,
    category?: string,
    status?: ProductStatus
): Promise<IResponse<Product[]>> => {
    const where = {};
    if (category) {
        // Get all descendant category IDs recursively
        const categoryIds = await getAllDescendantCategoryIds(category);
        Object.assign(where, {
            categories: {
                some: {
                    categoryId: {
                        in: categoryIds,
                    },
                },
            },
        });
    }
    if (status) {
        Object.assign(where, { status });
    }
    try {
        const [products, count] = await Promise.all([
            prisma.product.findMany({
                where,
                include: {
                    variableProducts: {
                        include: {
                            images: true,
                        },
                    },
                    images: true,
                    categories: {
                        include: {
                            category: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.product.count({
                where,
            }),
        ]);
        const resp: IResponse<Product[]> = {
            status: 'success',
            message: 'Products fetched successfully',
            data: products,
            total: count,
            totalPages: Math.ceil(count / limit),
            page,
            limit,
            hasNextPage: count > page * limit,
            hasPrevPage: page > 1,
        };
        return resp;
    } catch (error) {
        throw new CustomError('Error occurred while fetching users', 500);
    }
};

/**
 * get top selling products
 * @param limit
 * @param page
 * @param category optional - category ID or slug
 * @param status optional
 * @returns Product[]
 */

export async function getTopSellingProducts(
    limit: number,
    page: number,
    category?: string,
    status?: ProductStatus
): Promise<IResponse<Product[]>> {
    const skip = (page - 1) * limit;

    try {
        // Build where clause with recursive category filtering
        const where: any = {};
        if (status) {
            where.status = status;
        }
        if (category) {
            // Get all descendant category IDs recursively
            const categoryIds = await getAllDescendantCategoryIds(category);
            where.categories = {
                some: {
                    categoryId: {
                        in: categoryIds,
                    },
                },
            };
        }

        const products = await Promise.all([
            prisma.product.findMany({
                take: limit,
                skip: skip,
                where,
                include: {
                    categories: {
                        include: {
                            category: true,
                        },
                    },
                    images: true,
                    variableProducts: {
                        include: {
                            images: true,
                        },
                    },
                    _count: {
                        select: {
                            orderItem: true,
                        },
                    },
                },
                orderBy: {
                    orderItem: {
                        _count: 'desc',
                    },
                },
            }),
            prisma.product.count({
                where,
            }),
        ]);
        const resp: IResponse<Product[]> = {
            status: 'success',
            message: 'Products fetched successfully',
            data: products[0],
            total: products[1],
            totalPages: Math.ceil(products[1] / limit),
            page,
            limit,
            hasNextPage: products[1] > page * limit,
            hasPrevPage: page > 1,
        };
        return resp;
    } catch (error) {
        console.error('Error fetching top selling products:', error);
        throw new CustomError(
            'Error occurred while fetching top selling products',
            500
        );
    }
}

/**
 * get featured products
 * @param limit
 * @param page
 * @param category optional - category ID or slug
 * @param status optional
 * @returns Product[]
 */

export async function getFeaturedProducts(
    limit: number,
    page: number,
    category?: string,
    status?: ProductStatus
): Promise<IResponse<Product[]>> {
    const skip = (page - 1) * limit;
    try {
        // Build where clause with recursive category filtering
        const where: any = {
            isFeatured: true,
        };
        if (status) {
            where.status = status;
        }
        if (category) {
            // Get all descendant category IDs recursively
            const categoryIds = await getAllDescendantCategoryIds(category);
            where.categories = {
                some: {
                    categoryId: {
                        in: categoryIds,
                    },
                },
            };
        }

        const [products, counts] = await Promise.all([
            prisma.product.findMany({
                take: limit,
                skip: skip,
                where,
                include: {
                    categories: {
                        include: {
                            category: true,
                        },
                    },
                    images: true,
                    variableProducts: true,
                },
            }),
            prisma.product.count({
                where,
            }),
        ]);
        const resp: IResponse<Product[]> = {
            status: 'success',
            message: 'Products fetched successfully',
            data: products,
            total: counts,
            totalPages: Math.ceil(counts / limit),
            page,
            limit,
            hasNextPage: counts > page * limit,
            hasPrevPage: page > 1,
        };
        return resp;
    } catch (error) {
        console.error('Error fetching featured products:', error);
        throw new CustomError(
            'Error occurred while fetching featured products',
            500
        );
    }
}

export async function getSlideProducts(
    limit: number,
    page: number,
    category?: string,
    status?: ProductStatus
): Promise<IResponse<Product[]>> {
    const skip = (page - 1) * limit;
    try {
        // Build where clause with recursive category filtering
        const where: any = {
            isSlide: true,
        };
        if (status) {
            where.status = status;
        }
        if (category) {
            // Get all descendant category IDs recursively
            const categoryIds = await getAllDescendantCategoryIds(category);
            where.categories = {
                some: {
                    categoryId: {
                        in: categoryIds,
                    },
                },
            };
        }

        const [products, counts] = await Promise.all([
            prisma.product.findMany({
                take: limit,
                skip: skip,
                where,
                include: {
                    categories: {
                        include: {
                            category: true,
                        },
                    },
                    images: true,
                    variableProducts: true,
                },
            }),
            prisma.product.count({
                where,
            }),
        ]);
        const resp: IResponse<Product[]> = {
            status: 'success',
            message: 'Products fetched successfully',
            data: products,
            total: counts,
            totalPages: Math.ceil(counts / limit),
            page,
            limit,
            hasNextPage: counts > page * limit,
            hasPrevPage: page > 1,
        };
        return resp;
    } catch (error) {
        console.error('Error fetching slide products:', error);
        throw new CustomError(
            'Error occurred while fetching slide products',
            500
        );
    }
}

/**
 * search products by query string
 * @param searchQuery - search term
 * @param limit
 * @param page
 * @param category optional - category ID or slug
 * @param status optional
 * @returns Product[]
 */
export async function searchProducts(
    searchQuery: string,
    limit: number,
    page: number,
    category?: string,
    status?: ProductStatus
): Promise<IResponse<Product[]>> {
    const skip = (page - 1) * limit;

    try {
        // Build where clause with search conditions
        const where: any = {
            OR: [
                {
                    name: {
                        contains: searchQuery,
                        mode: 'insensitive',
                    },
                },
                {
                    description: {
                        contains: searchQuery,
                        mode: 'insensitive',
                    },
                },
                {
                    brand: {
                        contains: searchQuery,
                        mode: 'insensitive',
                    },
                },
                {
                    variableProducts: {
                        some: {
                            name: {
                                contains: searchQuery,
                                mode: 'insensitive',
                            },
                        },
                    },
                },
            ],
        };

        // Add status filter
        if (status) {
            where.status = status;
        }

        // Add category filter with recursive descendants
        if (category) {
            const categoryIds = await getAllDescendantCategoryIds(category);
            where.categories = {
                some: {
                    categoryId: {
                        in: categoryIds,
                    },
                },
            };
        }

        const [products, count] = await Promise.all([
            prisma.product.findMany({
                where,
                include: {
                    categories: {
                        include: {
                            category: true,
                        },
                    },
                    images: true,
                    variableProducts: {
                        include: {
                            images: true,
                        },
                    },
                },
                orderBy: [
                    {
                        // Prioritize exact name matches
                        name: 'asc',
                    },
                    {
                        createdAt: 'desc',
                    },
                ],
                skip: skip,
                take: limit,
            }),
            prisma.product.count({
                where,
            }),
        ]);

        const resp: IResponse<Product[]> = {
            status: 'success',
            message: `Found ${count} product${count !== 1 ? 's' : ''} matching "${searchQuery}"`,
            data: products,
            total: count,
            totalPages: Math.ceil(count / limit),
            page,
            limit,
            hasNextPage: count > page * limit,
            hasPrevPage: page > 1,
        };
        return resp;
    } catch (error) {
        console.error('Error searching products:', error);
        throw new CustomError(
            'Error occurred while searching products',
            500
        );
    }
}

/**
 * get all variables of a product
 * @param productId
 * @returns VariableProduct[]
 * @throws CustomError
 */
export const getProductVariables = async (
    productId: string
): Promise<VariableProduct[]> => {
    try {
        const productVariables = await prisma.variableProduct.findMany({
            where: {
                productId,
            },
        });

        return productVariables;
    } catch (error) {
        throw new CustomError(
            'Error occurred while fetching product variables',
            500
        );
    }
};

/**
 * get all variables of a product by status
 * @param status ProductStatus
 * @returns VariableProduct[]
 * @throws CustomError
 */
export const getProductVariablesByStatus = async (
    status: ProductStatus
): Promise<VariableProduct[]> => {
    try {
        const productVariables = await prisma.variableProduct.findMany({
            where: {
                status,
            },
        });

        return productVariables;
    } catch (error) {
        throw new CustomError(
            'Error occurred while fetching product variables',
            500
        );
    }
};

/**
 * get all categories
 * @returns Category[]
 * @throws CustomError
 */
export const getCategories = async (): Promise<Category[]> => {
    try {
        const categories = await prisma.category.findMany();

        return categories;
    } catch (error) {
        throw new CustomError('Error occurred while fetching categories', 500);
    }
};

/**
 * get all subcategories of a category
 * @param categoryId
 * @returns Category[]
 * @throws CustomError
 */
export const getSubcategories = async (
    categoryId: string
): Promise<Category[]> => {
    try {
        const subcategories = await prisma.category.findMany({
            where: {
                parentId: categoryId,
            },
        });

        return subcategories;
    } catch (error) {
        throw new CustomError(
            'Error occurred while fetching subcategories',
            500
        );
    }
};

/**
 * create product with category and product variables
 *
 * @param product
 * @param productVariables
 *
 * @returns Product
 * @throws CustomError
 */
export const createProduct = async (
    product: Product & {
        imageIds: string[];
        categoryIds: string[];
    },
    productVariables: (VariableProduct & {
        imageIds: string[];
    })[]
): Promise<Product> => {
    try {
        const createdProduct = await prisma.product.create({
            data: {
                name: product.name,
                description: product.description,
                images: {
                    connect: product.imageIds.map((imageId) => ({
                        filename: imageId,
                    })),
                },
                sizeGuide: {
                    connect: {
                        filename: product.sizeGuideId || '',
                    },
                },
                specifications: product.specifications || {},
                price: product.price,
                salePrice: product.salePrice,
                stock: product.stock,
                sku: product.sku, // Add SKU field
                kind: product.kind,
                brand: product.brand,
                deliveryTime: product.deliveryTime,
                returnTime: product.returnTime,
                categories: {
                    create: product.categoryIds.map((categoryId) => ({
                        category: {
                            connect: {
                                id: categoryId,
                            },
                        },
                    })),
                },
                isSlide: product.isSlide,
                isFeatured: product.isFeatured,
                status: product.status,
                variableProducts: {
                    create: productVariables.map((variable) => ({
                        name: variable.name,
                        description: variable.description,
                        images: {
                            connect: variable.imageIds.map((imageId) => ({
                                filename: imageId,
                            })),
                        },
                        specifications: variable.specifications || {},
                        price: variable.price,
                        salePrice: variable.salePrice,
                        stock: variable.stock,
                        sku: variable.sku,
                        status: variable.status,
                    })),
                },
            },
        });
        return createdProduct;
    } catch (error) {
        console.error('Error creating product:', error);
        throw new CustomError('Error occurred while creating product', 500);
    }
};

/**
 * create & attach variables for a product
 * @param productId
 * @param productVariables
 * @param images optional
 * @returns VariableProduct[]
 * @throws CustomError
 */
export const createProductVariables = async (
    productId: string,
    productVariables: VariableProduct[],
    images?: Image[]
): Promise<VariableProduct[]> => {
    try {
        const imageConnect = images && images.length > 0 ? images : [];
        const createdProductVariables =
            await prisma.variableProduct.createManyAndReturn({
                data: productVariables.map((variable) => ({
                    productId,
                    name: variable.name,
                    description: variable.description,
                    images: {
                        connectOrCreate: imageConnect.map((image) => ({
                            where: {
                                filename: image.filename,
                            },
                            create: {
                                filename: image.filename,
                                fieldname: image.fieldname,
                                originalname: image.originalname,
                                encoding: image.encoding,
                                mimetype: image.mimetype,
                                destination: image.destination,
                                path: image.path,
                                size: image.size,
                            },
                        })),
                    },
                    specifications: variable.specifications || {},
                    price: variable.price,
                    stock: variable.stock,
                    sku: variable.sku,
                })),
            });

        return createdProductVariables;
    } catch (error) {
        throw new CustomError(
            'Error occurred while creating product variables',
            500
        );
    }
};

/**
 * create & attach category for a product
 * @param productId
 * @param category
 * @returns Category
 * @throws CustomError
 */

export const createProductCategory = async (
    productId: string,
    category: Category
): Promise<Category> => {
    try {
        const createdCategory = await prisma.category.create({
            data: {
                name: category.name,
                description: category.description,
                products: {
                    create: {
                        product: {
                            connect: {
                                id: productId,
                            },
                        },
                    },
                },
            },
        });

        return createdCategory;
    } catch (error) {
        throw new CustomError('Error occurred while creating category', 500);
    }
};

/**
 * attach variables to a product
 * @param productId
 * @param variableIds
 * @returns Product[]
 * @throws CustomError
 */

export const attachProductVariables = async (
    productId: string,
    variableIds: string[]
): Promise<Product> => {
    try {
        const attachedProductVariables = await prisma.product.update({
            where: {
                id: productId,
            },
            data: {
                variableProducts: {
                    connect: variableIds.map((id) => ({
                        id,
                    })),
                },
            },
        });

        return attachedProductVariables;
    } catch (error) {
        throw new CustomError(
            'Error occurred while attaching product variables',
            500
        );
    }
};

/**
 * attach category to a product
 * @param productId
 * @param categoryId
 * @returns Product
 * @throws CustomError
 */

export const attachProductCategory = async (
    productId: string,
    categoryId: string
): Promise<Product> => {
    try {
        const attachedProductCategory = await prisma.product.update({
            where: {
                id: productId,
            },
            data: {
                categories: {
                    create: {
                        category: {
                            connect: {
                                id: categoryId,
                            },
                        },
                    },
                },
            },
        });

        return attachedProductCategory;
    } catch (error) {
        throw new CustomError(
            'Error occurred while attaching product category',
            500
        );
    }
};

/**
 * attach subcategory to a category
 * @param categoryId
 * @param subcategoryId
 * @returns Category
 * @throws CustomError
 */

export const attachSubcategory = async (
    categoryId: string,
    subcategoryId: string
): Promise<Category> => {
    try {
        const attachedSubcategory = await prisma.category.update({
            where: {
                id: subcategoryId,
            },
            data: {
                parent: {
                    connect: {
                        id: categoryId,
                    },
                },
            },
        });

        return attachedSubcategory;
    } catch (error) {
        throw new CustomError(
            'Error occurred while attaching subcategory',
            500
        );
    }
};

/**
 * update product with optional category and product variables
 * @param productId
 * @param product
 * @param productVariables
 * @param deletedVariableIds
 * @returns Product
 * @throws CustomError
 */

export const updateProduct = async (
    productId: string,
    product: Partial<Product> & {
        imageIds?: string[];
        categoryIds?: string[];
    },
    productVariables?: Array<
        Partial<VariableProduct> & {
            imageIds?: string[];
            id?: string; // For existing variables
        }
    >,
    deletedVariableIds?: string[]
): Promise<Product> => {
    try {
        // First handle deletions if any
        if (deletedVariableIds && deletedVariableIds.length > 0) {
            await prisma.variableProduct.deleteMany({
                where: {
                    id: { in: deletedVariableIds },
                    productId: productId,
                },
            });
        }

        // Then handle the product update
        const updatedProduct = await prisma.product.update({
            where: { id: productId },
            data: {
                name: product.name,
                description: product.description,
                images: product.imageIds
                    ? {
                          set: product.imageIds.map((imageId) => ({
                              filename: imageId,
                          })),
                      }
                    : undefined,
                sizeGuide: product.sizeGuideId
                    ? {
                          connect: {
                              filename: product.sizeGuideId,
                          },
                      }
                    : undefined,
                specifications: product.specifications ?? {},
                price: product.price,
                salePrice: product.salePrice,
                stock: product.stock,
                sku: product.sku, // Add SKU field
                kind: product.kind,
                brand: product.brand,
                deliveryTime: product.deliveryTime,
                returnTime: product.returnTime,
                categories: product.categoryIds
                    ? {
                          deleteMany: {}, // Remove all existing category connections
                          create: product.categoryIds.map((categoryId) => ({
                              category: {
                                  connect: {
                                      id: categoryId,
                                  },
                              },
                          })),
                      }
                    : undefined,
                isSlide: product.isSlide,
                isFeatured: product.isFeatured,
                status: product.status,
                variableProducts: productVariables
                    ? {
                          // Upsert for each variable product
                          upsert: productVariables.map((variable) => ({
                              where: { id: variable.id || '' }, // Empty string will force create
                              create: {
                                  name: variable.name!,
                                  description: variable.description!,
                                  images: variable.imageIds
                                      ? {
                                            connect: variable.imageIds.map(
                                                (imageId) => ({
                                                    filename: imageId,
                                                })
                                            ),
                                        }
                                      : undefined,
                                  specifications: variable.specifications || {},
                                  price: variable.price!,
                                  salePrice: variable.salePrice!,
                                  stock: variable.stock!,
                                  sku: variable.sku!,
                                  status: variable.status!,
                              },
                              update: {
                                  name: variable.name,
                                  description: variable.description,
                                  images: variable.imageIds
                                      ? {
                                            set: variable.imageIds.map(
                                                (imageId) => ({
                                                    filename: imageId,
                                                })
                                            ),
                                        }
                                      : undefined,
                                  specifications: variable.specifications || {},
                                  price: variable.price,
                                  salePrice: variable.salePrice,
                                  stock: variable.stock,
                                  ...{
                                      ...(variable.sku
                                          ? { sku: variable.sku }
                                          : {}),
                                  },
                                  status: variable.status,
                              },
                          })),
                      }
                    : undefined,
            },
            include: {
                variableProducts: true,
            },
        });

        return updatedProduct;
    } catch (error) {
        console.error('Error updating product:', error);
        throw new CustomError('Error occurred while updating product', 500);
    }
};
/**
 * update product variables
 * @param productId
 * @param productVariables
 * @param images optional
 * @returns VariableProduct[]
 * @throws CustomError
 */

export const updateProductVariables = async (
    productId: string,
    productVariables: VariableProduct[],
    images?: Image[]
): Promise<VariableProduct[]> => {
    try {
        const updatedProductVariables =
            await prisma.variableProduct.updateManyAndReturn({
                where: {
                    productId,
                },
                data: productVariables.map((variable) => ({
                    name: variable.name,
                    description: variable.description,
                    images: {
                        connectOrCreate: images?.map((image) => ({
                            where: {
                                filename: image.filename,
                            },
                            create: {
                                filename: image.filename,
                                fieldname: image.fieldname,
                                originalname: image.originalname,
                                encoding: image.encoding,
                                mimetype: image.mimetype,
                                destination: image.destination,
                                path: image.path,
                                size: image.size,
                            },
                        })),
                    },
                    specifications: variable.specifications || {},
                    price: variable.price,
                    stock: variable.stock,
                    sku: variable.sku,
                })),
            });

        return updatedProductVariables;
    } catch (error) {
        throw new CustomError(
            'Error occurred while updating product variables',
            500
        );
    }
};

/**
 * update category
 * @param categoryId
 * @param category
 * @returns Category
 * @throws CustomError
 */

export const updateCategory = async (
    categoryId: string,
    category: Category
): Promise<Category> => {
    try {
        const updatedCategory = await prisma.category.update({
            where: {
                id: categoryId,
            },
            data: {
                name: category.name,
                description: category.description,
            },
        });

        return updatedCategory;
    } catch (error) {
        throw new CustomError('Error occurred while updating category', 500);
    }
};

/**
 * delete product by id, cascade delete product variables
 * @param productId
 * @returns Product
 * @throws CustomError
 */

export const deleteProduct = async (productId: string): Promise<Product> => {
    try {
        const deletedProduct = await prisma.product.delete({
            where: {
                id: productId,
            },
        });

        return deletedProduct;
    } catch (error) {
        throw new CustomError('Error occurred while deleting product', 500);
    }
};

/**
 * delete product variables
 * @param variableIds
 * @returns Number of deleted product variables
 * @throws CustomError
 */

export const deleteProductVariables = async (
    variableIds: string[]
): Promise<number> => {
    try {
        const deletedProductVariables = await prisma.variableProduct.deleteMany(
            {
                where: {
                    id: {
                        in: variableIds,
                    },
                },
            }
        );

        return deletedProductVariables.count;
    } catch (error) {
        throw new CustomError(
            'Error occurred while deleting product variables',
            500
        );
    }
};

export const deleteProductWithVariables = async (
    productId: string
): Promise<Product> => {
    // check if product exists
    const product = await prisma.product.findUnique({
        where: {
            id: productId,
        },
    });
    if (!product) {
        throw new CustomError('Product not found', 404);
    }
    const variables = await getProductVariables(productId);
    if (variables.length) {
        await deleteProductVariables(variables.map((v) => v.id));
    }
    // delete categoriesonproduct
    await prisma.categoriesOnProduct.deleteMany({
        where: {
            productId,
        },
    });
    return await deleteProduct(productId);
};

/**
 * delete category, cascade delete subcategories
 * @param categoryId
 * @returns Category
 * @throws CustomError
 */

export const deleteCategory = async (categoryId: string): Promise<Category> => {
    const deletedCategory = await prisma.category.delete({
        where: {
            id: categoryId,
        },
    });

    return deletedCategory;
};
