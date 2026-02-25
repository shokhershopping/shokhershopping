import { NextResponse } from 'next/server';
import { getUserById, updateUser } from 'firebase-config/services/user.service';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const result = await getUserById(id);
    const statusCode = result.status === 'success' ? 200 : (result.code || 500);
    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    console.error('GET /api/users/[id] error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to fetch user', data: null },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const result = await updateUser(id, body);
    const statusCode = result.status === 'success' ? 200 : (result.code || 500);
    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    console.error('PATCH /api/users/[id] error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to update user', data: null },
      { status: 500 }
    );
  }
}
