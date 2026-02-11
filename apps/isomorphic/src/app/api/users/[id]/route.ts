import { NextRequest, NextResponse } from 'next/server';
import {
  getUserById,
  updateUser,
  deleteUser,
} from 'firebase-config/services/user.service';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const result = await getUserById(id);

    const statusCode = result.status === 'success' ? 200 : (result.code || 500);

    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    console.error('GET /api/users/[id] error:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to fetch user',
        data: null,
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const result = await updateUser(id, body);

    const statusCode = result.status === 'success' ? 200 : (result.code || 500);

    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    console.error('PATCH /api/users/[id] error:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to update user',
        data: null,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const result = await deleteUser(id);

    const statusCode = result.status === 'success' ? 200 : (result.code || 500);

    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    console.error('DELETE /api/users/[id] error:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to delete user',
        data: null,
      },
      { status: 500 }
    );
  }
}
