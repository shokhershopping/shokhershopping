import { NextResponse } from 'next/server';
import { getAllCategories } from 'firebase-config/services/category.service';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100', 10) || 100;
    const page = parseInt(searchParams.get('page') || '1', 10) || 1;

    const result = await getAllCategories(limit, page);

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
