import { NextRequest, NextResponse } from 'next/server';
import {
  getAllCategories,
  getFeaturedCategories,
  getSlideCategories,
  getMenuCategories,
  createCategory,
} from 'firebase-config/services/category.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10) || 1;
    const limit = parseInt(searchParams.get('limit') || '10', 10) || 10;
    const type = searchParams.get('type');
    const rootOnly = searchParams.get('rootOnly') === 'true';

    let result;
    switch (type) {
      case 'featured':
        result = await getFeaturedCategories(limit);
        break;
      case 'slide':
        result = await getSlideCategories(limit);
        break;
      case 'menu':
        result = await getMenuCategories(limit);
        break;
      default:
        result = await getAllCategories(limit, page, rootOnly);
        break;
    }

    const statusCode = result.status === 'success' ? 200 : (result.code || 500);
    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    console.error('GET /api/categories error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to fetch categories', data: null },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Support both flat format and wrapped { category: {...} } format
    const categoryData = body.category ? { ...body.category, ...(body.imageUrl && { imageUrl: body.imageUrl }) } : body;
    const result = await createCategory(categoryData);

    const statusCode = result.status === 'success' ? 201 : (result.code || 500);
    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    console.error('POST /api/categories error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to create category', data: null },
      { status: 500 }
    );
  }
}
