import { NextRequest, NextResponse } from 'next/server';
import { getProducts, createProduct, createVariant } from 'firebase-config/services/product.service';
import { getCategoryById } from 'firebase-config/services/category.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10) || 1;
    const limit = parseInt(searchParams.get('limit') || '10', 10) || 10;
    const status = searchParams.get('status') || undefined;
    const categoryId = searchParams.get('categoryId') || undefined;

    const result = await getProducts(limit, page, {
      status: status as any,
      categoryId,
    });

    const statusCode = result.status === 'success' ? 200 : (result.code || 500);
    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    return NextResponse.json(
      { status: 'error', message: 'Failed to fetch products', data: null },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Support both flat format and wrapped { product: {...} } format
    const productData = body.product ? body.product : body;

    // Extract variants before creating product
    const variants = productData.variants || productData.variableProducts || [];
    delete productData.variants;
    delete productData.variableProducts;
    delete productData.deletedVariableIds;

    // Resolve categoryNames from categoryIds if not provided
    if (productData.categoryIds?.length > 0 && (!productData.categoryNames || productData.categoryNames.length === 0)) {
      const names: string[] = [];
      for (const catId of productData.categoryIds) {
        try {
          const catResult = await getCategoryById(catId);
          if (catResult.status === 'success' && catResult.data) {
            names.push(catResult.data.name);
          }
        } catch {
          // Skip unresolvable categories
        }
      }
      productData.categoryNames = names;
    }

    const result = await createProduct(productData);

    // If product created successfully and variants exist, create them
    if (result.status === 'success' && result.data && variants.length > 0) {
      const productId = result.data.id;
      const createdVariants = [];

      for (const variant of variants) {
        const variantResult = await createVariant(productId, {
          name: variant.name || '',
          description: variant.description,
          imageUrls: variant.imageUrls || [],
          specifications: variant.specifications || {},
          price: variant.price || 0,
          salePrice: variant.salePrice,
          stock: variant.stock || 0,
          sku: variant.sku || '',
          status: variant.status || 'DRAFT',
        });
        if (variantResult.status === 'success' && variantResult.data) {
          createdVariants.push(variantResult.data);
        } else if (variantResult.code === 409) {
          // SKU duplicate - return error immediately
          return NextResponse.json(variantResult, { status: 409 });
        }
      }

      // Attach variants to the response
      (result.data as any).variableProducts = createdVariants;
    }

    const statusCode = result.status === 'success' ? 201 : (result.code || 500);
    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    console.error('POST /api/products error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to create product', data: null },
      { status: 500 }
    );
  }
}
