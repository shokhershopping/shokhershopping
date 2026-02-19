import { NextRequest, NextResponse } from 'next/server';
import {
  getCategoryById,
  updateCategory,
  deleteCategory,
  getSubcategories,
} from 'firebase-config/services/category.service';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const children = searchParams.get('children') === 'true';

    if (children) {
      const result = await getSubcategories(id);
      const statusCode = result.status === 'success' ? 200 : (result.code || 500);
      return NextResponse.json(result, { status: statusCode });
    }

    const result = await getCategoryById(id);
    const statusCode = result.status === 'success' ? 200 : (result.code || 500);
    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    console.error('GET /api/categories/[id] error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to fetch category', data: null },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const result = await updateCategory(id, body);

    const statusCode = result.status === 'success' ? 200 : (result.code || 500);
    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    console.error('PATCH /api/categories/[id] error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to update category', data: null },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const result = await deleteCategory(id);

    const statusCode = result.status === 'success' ? 200 : (result.code || 500);
    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    console.error('DELETE /api/categories/[id] error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to delete category', data: null },
      { status: 500 }
    );
  }
}
