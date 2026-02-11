import { NextRequest, NextResponse } from 'next/server';
import { updateUserMetadata } from 'firebase-config/services/user.service';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Request body must be a JSON object',
          data: null,
        },
        { status: 400 }
      );
    }

    const result = await updateUserMetadata(id, body);

    const statusCode = result.status === 'success' ? 200 : (result.code || 500);

    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    console.error('PUT /api/users/[id]/metadata error:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to update user metadata',
        data: null,
      },
      { status: 500 }
    );
  }
}
