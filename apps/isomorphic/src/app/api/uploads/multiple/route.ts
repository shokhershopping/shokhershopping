import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import path from 'path';
import { adminStorage } from 'firebase-config/admin';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILES = 5;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'No files uploaded.',
          data: null,
        },
        { status: 400 }
      );
    }

    if (files.length > MAX_FILES) {
      return NextResponse.json(
        {
          status: 'error',
          message: `Maximum ${MAX_FILES} files allowed per upload.`,
          data: null,
        },
        { status: 400 }
      );
    }

    // Validate all files before uploading
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        return NextResponse.json(
          {
            status: 'error',
            message: `File "${file.name}" is not an image. Only image files are allowed.`,
            data: null,
          },
          { status: 400 }
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          {
            status: 'error',
            message: `File "${file.name}" exceeds the 5MB size limit.`,
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

    const uploadPromises = files.map(async (file) => {
      const ext = path.extname(file.name) || '.jpg';
      const randomHex = crypto.randomBytes(6).toString('hex');
      const filename = `${Date.now()}-${randomHex}${ext}`;
      const filePath = `uploads/${year}/${month}/${filename}`;

      const buffer = Buffer.from(await file.arrayBuffer());
      const storageFile = bucket.file(filePath);

      await storageFile.save(buffer, {
        metadata: {
          contentType: file.type,
        },
      });

      await storageFile.makePublic();

      const url = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

      return {
        filename,
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
  } catch (error) {
    console.error('Multiple upload error:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to upload files.',
        data: null,
      },
      { status: 500 }
    );
  }
}
