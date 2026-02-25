/**
 * Resolve an image path to a full URL.
 * Handles both Firebase Storage URLs (already full URLs) and
 * legacy relative paths from the old Express backend.
 */
export function getImageUrl(path) {
  if (!path) return '/default-product-image.jpg';

  // Already a full URL (Firebase Storage or CDN)
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // Legacy relative path - use configured base URL
  const baseUrl = process.env.NEXT_PUBLIC_IMAGE_BASE_URL || '';
  const cleanPath = path.replace(/^\//, '');
  return baseUrl ? `${baseUrl}/${cleanPath}` : `/${cleanPath}`;
}
