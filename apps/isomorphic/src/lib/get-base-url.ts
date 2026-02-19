/**
 * Returns the absolute base URL for internal API routes.
 * Used in server components where relative URLs don't work with fetch().
 */
export function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    // Client-side: use relative URL
    return '';
  }

  // Server-side: need absolute URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // Fallback to localhost
  return `http://localhost:${process.env.PORT || 3000}`;
}
