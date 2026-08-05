import crypto from 'crypto';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { adminStorage } from 'firebase-config/admin';
import {
  authorizationErrorResponse,
  requireAdminAuthorization,
} from '@/lib/server/authorization';

export const runtime = 'nodejs';

const MAX_FILE_SIZE = 1.5 * 1024 * 1024;
const formats = {
  'image/jpeg': { extensions: ['.jpg', '.jpeg'], matches: (b: Buffer) => b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  'image/png': { extensions: ['.png'], matches: (b: Buffer) => b.length >= 8 && b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  'image/webp': { extensions: ['.webp'], matches: (b: Buffer) => b.length >= 12 && b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP' },
  'image/gif': { extensions: ['.gif'], matches: (b: Buffer) => b.length >= 6 && ['GIF87a', 'GIF89a'].includes(b.toString('ascii', 0, 6)) },
} as const;

function error(message: string, status = 400) {
  return NextResponse.json({ status: 'error', message, data: null }, { status });
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminAuthorization(['ADMIN', 'EDITOR']);
    const formData = await request.formData();
    const entries = [...formData.values()].filter((value): value is File => typeof value !== 'string');
    if (entries.length !== 1) return error('Exactly one image file is required');

    const file = entries[0];
    if (file.size <= 0) return error('Uploaded file is empty');
    if (file.size > MAX_FILE_SIZE) return error('File size exceeds the 1.5 MB limit');

    const format = formats[file.type as keyof typeof formats];
    if (!format) return error('Only JPEG, PNG, WebP, and GIF images are allowed');

    const originalName = path.basename(file.name).replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 180);
    const extension = path.extname(originalName).toLowerCase();
    if (!(format.extensions as readonly string[]).includes(extension)) {
      return error('File extension does not match an allowed image type');
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    if (!format.matches(buffer)) return error('File content does not match its declared image type');

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const filename = `${Date.now()}-${crypto.randomBytes(12).toString('hex')}${extension}`;
    const filePath = `uploads/content-posts/${year}/${month}/${filename}`;
    const bucket = adminStorage.bucket();
    const downloadToken = crypto.randomUUID();

    await bucket.file(filePath).save(buffer, {
      metadata: {
        contentType: file.type,
        metadata: { firebaseStorageDownloadTokens: downloadToken },
      },
    });

    const url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(filePath)}?alt=media&token=${downloadToken}`;
    return NextResponse.json({
      status: 'success',
      message: 'Content image uploaded successfully',
      data: {
        filename,
        originalName,
        path: filePath,
        size: file.size,
        mimetype: file.type,
        url,
      },
    });
  } catch (caught) {
    const authResponse = authorizationErrorResponse(caught);
    if (authResponse) return authResponse;
    console.error('POST /api/content-posts/upload error:', caught);
    return error('Failed to upload content image', 500);
  }
}
