import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { verifySessionCookie } from 'firebase-config/auth';
import { getUserById } from 'firebase-config/services/user.service';
import type { FirestoreUser } from 'firebase-config/types/user.types';
import type { Role } from 'firebase-config/types/enums';

export class AuthorizationError extends Error {
  constructor(
    public readonly statusCode: 401 | 403,
    message: string
  ) {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export interface AuthorizedAdmin {
  uid: string;
  email: string;
  displayName: string;
  profile: FirestoreUser;
}

export async function requireAdminAuthorization(
  requiredRoles: Role[] = ['ADMIN', 'EDITOR']
): Promise<AuthorizedAdmin> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('__session')?.value;
  if (!sessionCookie) throw new AuthorizationError(401, 'Unauthorized');

  const decoded = await verifySessionCookie(sessionCookie, true);
  if (!decoded) throw new AuthorizationError(401, 'Invalid or expired session');

  const userResult = await getUserById(decoded.uid);
  if (userResult.status !== 'success' || !userResult.data) {
    throw new AuthorizationError(403, 'User profile is unavailable');
  }

  const profile = userResult.data;
  if (!requiredRoles.includes(profile.role)) {
    throw new AuthorizationError(403, 'Insufficient permissions');
  }

  return {
    uid: decoded.uid,
    email: decoded.email ?? profile.email,
    displayName: profile.name || decoded.name || decoded.email || profile.email,
    profile,
  };
}

export function authorizationErrorResponse(error: unknown): NextResponse | null {
  if (!(error instanceof AuthorizationError)) return null;
  return NextResponse.json(
    { status: 'error', message: error.message, data: null },
    { status: error.statusCode }
  );
}
