import { NextRequest, NextResponse } from 'next/server';
import { getBanners, getActiveBanners, createBanner } from 'firebase-config/services/banner.service';
import { uploadFile } from 'firebase-config/storage';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';

    const result = activeOnly ? await getActiveBanners() : await getBanners();

    const statusCode = result.status === 'success' ? 200 : (result.code || 500);
    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    console.error('GET /api/banners error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to fetch banners', data: null },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const title = formData.get('title') as string;
    const subtitle = formData.get('subtitle') as string | null;
    const buttonText = formData.get('buttonText') as string | null;
    const buttonLink = formData.get('buttonLink') as string | null;
    const textColor = (formData.get('textColor') as string) || 'auto';
    const sortOrder = formData.get('sortOrder') ? parseInt(formData.get('sortOrder') as string, 10) : undefined;
    const isActive = formData.get('isActive') !== 'false';
    const imageFile = formData.get('image') as File | null;

    if (!title) {
      return NextResponse.json(
        { status: 'error', message: 'Title is required', data: null },
        { status: 400 }
      );
    }

    if (!imageFile) {
      return NextResponse.json(
        { status: 'error', message: 'Banner image is required', data: null },
        { status: 400 }
      );
    }

    // Validate file size (max 1MB)
    const MAX_SIZE = 1 * 1024 * 1024; // 1MB
    if (imageFile.size > MAX_SIZE) {
      return NextResponse.json(
        { status: 'error', message: 'Image must be 1MB or less', data: null },
        { status: 400 }
      );
    }

    // Validate file type
    if (!imageFile.type.startsWith('image/')) {
      return NextResponse.json(
        { status: 'error', message: 'File must be an image', data: null },
        { status: 400 }
      );
    }

    // Upload image to Firebase Storage
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    const filename = `banner-${Date.now()}-${imageFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const imageUrl = await uploadFile(buffer, filename, imageFile.type, 'banners');

    const result = await createBanner({
      title,
      subtitle: subtitle || undefined,
      buttonText: buttonText || undefined,
      buttonLink: buttonLink || undefined,
      imageUrl,
      textColor: textColor as 'light' | 'dark' | 'auto',
      sortOrder,
      isActive,
    });

    const statusCode = result.status === 'success' ? 201 : (result.code || 500);
    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    console.error('POST /api/banners error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to create banner', data: null },
      { status: 500 }
    );
  }
}
