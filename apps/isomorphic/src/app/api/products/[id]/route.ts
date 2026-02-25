import { NextRequest, NextResponse } from 'next/server';
import {
  getProductById,
  updateProduct,
  deleteProduct,
  createVariant,
  updateVariant,
  deleteVariant,
} from 'firebase-config/services/product.service';
import { getCategoryById } from 'firebase-config/services/category.service';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const result = await getProductById(id);

    const statusCode = result.status === 'success' ? 200 : (result.code || 500);
    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    return NextResponse.json(
      { status: 'error', message: 'Failed to fetch product', data: null },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    // Extract variants and deleted variant IDs before updating product
    const variants = body.variants || body.variableProducts || [];
    const deletedVariableIds = body.deletedVariableIds || [];
    delete body.variants;
    delete body.variableProducts;
    delete body.deletedVariableIds;

    // Resolve categoryNames from categoryIds if not provided
    if (body.categoryIds?.length > 0 && (!body.categoryNames || body.categoryNames.length === 0)) {
      const names: string[] = [];
      for (const catId of body.categoryIds) {
        try {
          const catResult = await getCategoryById(catId);
          if (catResult.status === 'success' && catResult.data) {
            names.push(catResult.data.name);
          }
        } catch {
          // Skip unresolvable categories
        }
      }
      body.categoryNames = names;
    }

    // Update the base product
    const result = await updateProduct(id, body);

    if (result.status === 'success') {
      // Delete removed variants
      for (const variantId of deletedVariableIds) {
        await deleteVariant(id, variantId);
      }

      // Create or update variants
      const updatedVariants = [];
      for (const variant of variants) {
        const variantData = {
          name: variant.name || '',
          description: variant.description,
          imageUrls: variant.imageUrls || [],
          specifications: variant.specifications || {},
          price: variant.price || 0,
          salePrice: variant.salePrice,
          stock: variant.stock || 0,
          sku: variant.sku || '',
          status: variant.status || 'DRAFT',
        };

        if (variant.id) {
          // Existing variant — update
          const variantResult = await updateVariant(id, variant.id, variantData);
          if (variantResult.status === 'success' && variantResult.data) {
            updatedVariants.push(variantResult.data);
          }
        } else {
          // New variant — create
          const variantResult = await createVariant(id, variantData);
          if (variantResult.status === 'success' && variantResult.data) {
            updatedVariants.push(variantResult.data);
          }
        }
      }

      // Attach variants to the response
      if (result.data) {
        (result.data as any).variableProducts = updatedVariants;
      }
    }

    const statusCode = result.status === 'success' ? 200 : (result.code || 500);
    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    return NextResponse.json(
      { status: 'error', message: 'Failed to update product', data: null },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const result = await deleteProduct(id);

    const statusCode = result.status === 'success' ? 200 : (result.code || 500);
    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    return NextResponse.json(
      { status: 'error', message: 'Failed to delete product', data: null },
      { status: 500 }
    );
  }
}
