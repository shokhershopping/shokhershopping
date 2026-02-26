import { NextResponse } from 'next/server';
import { getUserById, createUser } from 'firebase-config/services/user.service';

export async function POST(request) {
  try {
    const body = await request.json();
    const { id, uid, email, displayName, name, photoURL, image } = body;

    // Support both 'id' and 'uid' field names
    const userId = id || uid;

    if (!userId) {
      return NextResponse.json(
        { status: 'error', message: 'id or uid is required', data: null },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existing = await getUserById(userId);
    if (existing.status === 'success' && existing.data) {
      return NextResponse.json(existing, { status: 200 });
    }

    // Create new user
    const result = await createUser({
      id: userId,
      email: email || '',
      name: name || displayName || '',
      image: image || photoURL || '',
      role: 'USER',
    });

    const statusCode = result.status === 'success' ? 201 : (result.code || 500);
    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    console.error('POST /api/users/ensure error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to ensure user', data: null },
      { status: 500 }
    );
  }
}
