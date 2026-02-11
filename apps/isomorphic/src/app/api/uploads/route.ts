import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import path from 'path';
import { adminStorage } from 'firebase-config/admin';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'No file uploaded.',
          data: null,
        },
        { status: 400 }
      );
    }

    // Validate MIME type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Only image files are allowed.',
          data: null,
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'File size exceeds the 5MB limit.',
          data: null,
        },
        { status: 400 }
      );
    }

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const ext = path.extname(file.name) || '.jpg';
    const randomHex = crypto.randomBytes(6).toString('hex');
    const filename = `${Date.now()}-${randomHex}${ext}`;
    const filePath = `uploads/${year}/${month}/${filename}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    const bucket = adminStorage.bucket();
    const storageFile = bucket.file(filePath);

    await storageFile.save(buffer, {
      metadata: {
        contentType: file.type,
      },
    });

    // Make the file publicly accessible
    await storageFile.makePublic();

    const url = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

    return NextResponse.json(
      {
        status: 'success',
        message: 'File uploaded successfully.',
        data: {
          filename,
          path: filePath,
          size: file.size,
          mimetype: file.type,
          url,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to upload file.',
        data: null,
      },
      { status: 500 }
    );
  }
}
