import { NextRequest, NextResponse } from 'next/server';
import { adminStorage } from 'firebase-config/admin';

interface RouteParams {
  params: Promise<{ filePath: string[] }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { filePath } = await params;
    const fullPath = filePath.join('/');

    const bucket = adminStorage.bucket();
    const file = bucket.file(fullPath);

    const [exists] = await file.exists();
    if (!exists) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'File not found.',
          data: null,
        },
        { status: 404 }
      );
    }

    const [signedUrl] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 60 * 60 * 1000, // 1 hour
    });

    return NextResponse.redirect(signedUrl);
  } catch (error) {
    console.error('File retrieval error:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to retrieve file.',
        data: null,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { filePath } = await params;
    const fullPath = filePath.join('/');

    const bucket = adminStorage.bucket();
    const file = bucket.file(fullPath);

    const [exists] = await file.exists();
    if (!exists) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'File not found.',
          data: null,
        },
        { status: 404 }
      );
    }

    await file.delete();

    return NextResponse.json(
      {
        status: 'success',
        message: 'File deleted successfully.',
        data: { path: fullPath },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('File deletion error:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to delete file.',
        data: null,
      },
      { status: 500 }
    );
  }
}
