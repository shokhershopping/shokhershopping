import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from 'firebase-config/admin';
import { createUser, getUsers } from 'firebase-config/services/user.service';
import type { Role } from 'firebase-config/types/enums';

/**
 * GET /api/users/admin - List all admin and editor users
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10) || 1;
    const limit = parseInt(searchParams.get('limit') || '50', 10) || 50;

    const result = await getUsers(limit, page);

    if (result.status === 'success' && Array.isArray(result.data)) {
      // Filter to only ADMIN and EDITOR users
      const adminUsers = result.data.filter(
        (user: any) => user.role === 'ADMIN' || user.role === 'EDITOR'
      );
      return NextResponse.json(
        { ...result, data: adminUsers },
        { status: 200 }
      );
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('GET /api/users/admin error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to fetch admin users', data: null },
      { status: 500 }
    );
  }
}

/**
 * POST /api/users/admin - Create a new admin or editor user
 * Creates both the Firebase Auth user and the Firestore user record
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, role } = body;

    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { status: 'error', message: 'Email, password, name, and role are required', data: null },
        { status: 400 }
      );
    }

    if (role !== 'ADMIN' && role !== 'EDITOR') {
      return NextResponse.json(
        { status: 'error', message: 'Role must be ADMIN or EDITOR', data: null },
        { status: 400 }
      );
    }

    // Create Firebase Auth user
    const authUser = await adminAuth.createUser({
      email,
      password,
      displayName: name,
    });

    // Create Firestore user record with role
    const result = await createUser({
      id: authUser.uid,
      email,
      name,
      role: role as Role,
    });

    if (result.status === 'success') {
      return NextResponse.json(result, { status: 201 });
    }

    return NextResponse.json(result, { status: result.code || 500 });
  } catch (error: any) {
    console.error('POST /api/users/admin error:', error);

    // Handle Firebase Auth specific errors
    if (error?.code === 'auth/email-already-exists') {
      return NextResponse.json(
        { status: 'error', message: 'A user with this email already exists', data: null },
        { status: 409 }
      );
    }
    if (error?.code === 'auth/invalid-email') {
      return NextResponse.json(
        { status: 'error', message: 'Invalid email address', data: null },
        { status: 400 }
      );
    }
    if (error?.code === 'auth/weak-password') {
      return NextResponse.json(
        { status: 'error', message: 'Password must be at least 6 characters', data: null },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { status: 'error', message: 'Failed to create admin user', data: null },
      { status: 500 }
    );
  }
}
