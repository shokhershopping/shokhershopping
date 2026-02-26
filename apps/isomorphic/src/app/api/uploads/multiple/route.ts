import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import path from 'path';
import { adminStorage } from 'firebase-config/admin';

// Force Node.js runtime for file upload handling
export const runtime = 'nodejs';

// Allow large file uploads (up to 50MB per request)
export const maxDuration = 60;

const MAX_FILE_SIZE = 1.5 * 1024 * 1024; // 1.5MB per file
const MAX_FILES = 10;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Collect all file entries - accept any non-string FormData value
    const fileEntries: File[] = [];
    for (const [key, value] of formData.entries()) {
      if (typeof value !== 'string') {
        fileEntries.push(value as File);
      }
    }

    console.log('Upload request - form keys:', [...formData.keys()], 'files found:', fileEntries.length);

    if (fileEntries.length === 0) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'No files uploaded. Received keys: ' + [...formData.keys()].join(', '),
          data: null,
        },
        { status: 400 }
      );
    }

    if (fileEntries.length > MAX_FILES) {
      return NextResponse.json(
        {
          status: 'error',
          message: `Maximum ${MAX_FILES} files allowed per upload.`,
          data: null,
        },
        { status: 400 }
      );
    }

    // Validate file sizes
    for (const file of fileEntries) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          {
            status: 'error',
            message: `File "${file.name}" (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds the 1.5MB size limit. Please compress or resize the image.`,
            data: null,
          },
          { status: 400 }
        );
      }
    }

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const bucket = adminStorage.bucket();

    const uploadPromises = fileEntries.map(async (file) => {
      const ext = path.extname(file.name || '') || '.jpg';
      const randomHex = crypto.randomBytes(6).toString('hex');
      const filename = `${Date.now()}-${randomHex}${ext}`;
      const filePath = `uploads/${year}/${month}/${filename}`;

      const buffer = Buffer.from(await file.arrayBuffer());
      const storageFile = bucket.file(filePath);

      // Generate a download token for public access
      const downloadToken = crypto.randomUUID();

      await storageFile.save(buffer, {
        metadata: {
          contentType: file.type || 'application/octet-stream',
          metadata: {
            firebaseStorageDownloadTokens: downloadToken,
          },
        },
      });

      // Use Firebase Storage public URL format with token
      const url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(filePath)}?alt=media&token=${downloadToken}`;

      return {
        filename,
        originalname: file.name || filename,
        name: file.name || filename,
        path: filePath,
        size: file.size,
        mimetype: file.type,
        url,
      };
    });

    const results = await Promise.all(uploadPromises);

    return NextResponse.json(
      {
        status: 'success',
        message: `${results.length} file(s) uploaded successfully.`,
        data: results,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: error?.message || 'Failed to upload files.',
        data: null,
      },
      { status: 500 }
    );
  }
}
