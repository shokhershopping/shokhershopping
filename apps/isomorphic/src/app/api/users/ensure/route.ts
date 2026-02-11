import { NextRequest, NextResponse } from 'next/server';
import { createUser } from 'firebase-config/services/user.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.id || !body.email) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Fields "id" and "email" are required',
          data: null,
        },
        { status: 400 }
      );
    }

    const result = await createUser({
      id: body.id,
      email: body.email,
      name: body.name,
      image: body.image,
      role: body.role,
    });

    const statusCode = result.status === 'success' ? 200 : (result.code || 500);

    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    console.error('POST /api/users/ensure error:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to ensure user',
        data: null,
      },
      { status: 500 }
    );
  }
}
