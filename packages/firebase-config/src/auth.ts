import { adminAuth } from './admin';
import type { DecodedIdToken } from 'firebase-admin/auth';

/**
 * Verify a Firebase ID token from the client.
 * Used in Next.js API routes and middleware.
 */
export async function verifyIdToken(idToken: string): Promise<DecodedIdToken | null> {
  try {
    return await adminAuth.verifyIdToken(idToken);
  } catch {
    return null;
  }
}

/**
 * Verify a Firebase session cookie.
 * Used in Next.js middleware for protected routes.
 */
export async function verifySessionCookie(
  sessionCookie: string,
  checkRevoked = true
): Promise<DecodedIdToken | null> {
  try {
    return await adminAuth.verifySessionCookie(sessionCookie, checkRevoked);
  } catch {
    return null;
  }
}

/**
 * Create a session cookie from an ID token.
 * Used in the /api/auth/session route after client-side sign-in.
 */
export async function createSessionCookie(
  idToken: string,
  expiresIn: number = 60 * 60 * 24 * 5 * 1000 // 5 days
): Promise<string> {
  return adminAuth.createSessionCookie(idToken, { expiresIn });
}

/**
 * Get user by UID from Firebase Auth.
 */
export async function getUserByUid(uid: string) {
  try {
    return await adminAuth.getUser(uid);
  } catch {
    return null;
  }
}

/**
 * Get user by email from Firebase Auth.
 */
export async function getUserByEmail(email: string) {
  try {
    return await adminAuth.getUserByEmail(email);
  } catch {
    return null;
  }
}

/**
 * Set custom claims on a user (e.g., role).
 */
export async function setUserClaims(uid: string, claims: Record<string, unknown>) {
  await adminAuth.setCustomUserClaims(uid, claims);
}

/**
 * Extract the ID token from an Authorization header.
 * Expects format: "Bearer <token>"
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}
