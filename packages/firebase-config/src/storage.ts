import { adminStorage } from './admin';

/**
 * Upload a file buffer to Firebase Storage.
 * Returns the public download URL.
 */
export async function uploadFile(
  buffer: Buffer,
  filename: string,
  mimetype: string,
  folder = 'uploads'
): Promise<string> {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const filePath = `${folder}/${year}/${month}/${filename}`;

  const bucket = adminStorage.bucket();
  const file = bucket.file(filePath);

  await file.save(buffer, {
    metadata: {
      contentType: mimetype,
    },
  });

  // Make the file publicly accessible
  await file.makePublic();

  return `https://storage.googleapis.com/${bucket.name}/${filePath}`;
}

/**
 * Upload multiple file buffers to Firebase Storage.
 */
export async function uploadMultipleFiles(
  files: Array<{ buffer: Buffer; filename: string; mimetype: string }>,
  folder = 'uploads'
): Promise<string[]> {
  const uploadPromises = files.map((file) =>
    uploadFile(file.buffer, file.filename, file.mimetype, folder)
  );
  return Promise.all(uploadPromises);
}

/**
 * Delete a file from Firebase Storage.
 */
export async function deleteFile(filePath: string): Promise<void> {
  const bucket = adminStorage.bucket();
  const file = bucket.file(filePath);

  try {
    await file.delete();
  } catch (error: unknown) {
    const firebaseError = error as { code?: number };
    // Ignore "not found" errors
    if (firebaseError.code !== 404) {
      throw error;
    }
  }
}

/**
 * Get a signed download URL for a file.
 */
export async function getSignedUrl(
  filePath: string,
  expiresInMs = 60 * 60 * 1000 // 1 hour
): Promise<string> {
  const bucket = adminStorage.bucket();
  const file = bucket.file(filePath);

  const [url] = await file.getSignedUrl({
    action: 'read',
    expires: Date.now() + expiresInMs,
  });

  return url;
}

/**
 * Resolve an image URL — handles both old Express paths and new Firebase Storage URLs.
 * Used during the migration period when some images are still on the old server.
 */
export function resolveImageUrl(
  path: string | null | undefined,
  fallbackBaseUrl?: string
): string {
  if (!path) return '';

  // Already a full URL (Firebase Storage or any other)
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // Old-style relative path from Express server (e.g., "uploads/2025/01/file.jpg")
  if (fallbackBaseUrl) {
    const cleanBase = fallbackBaseUrl.replace(/\/$/, '');
    const cleanPath = path.replace(/^\//, '');
    return `${cleanBase}/${cleanPath}`;
  }

  return path;
}
