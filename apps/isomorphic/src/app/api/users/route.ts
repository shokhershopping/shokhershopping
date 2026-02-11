import { NextRequest, NextResponse } from 'next/server';
import { getUsers } from 'firebase-config/services/user.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10) || 1;
    const limit = parseInt(searchParams.get('limit') || '10', 10) || 10;

    const result = await getUsers(limit, page);

    const statusCode = result.status === 'success' ? 200 : (result.code || 500);

    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    console.error('GET /api/users error:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to fetch users',
        data: null,
      },
      { status: 500 }
    );
  }
}
