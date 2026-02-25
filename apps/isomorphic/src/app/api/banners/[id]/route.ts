import { NextRequest, NextResponse } from 'next/server';
import { getBannerById, updateBanner, deleteBanner } from 'firebase-config/services/banner.service';
import { uploadFile } from 'firebase-config/storage';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await getBannerById(id);
    const statusCode = result.status === 'success' ? 200 : (result.code || 500);
    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    console.error('GET /api/banners/[id] error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to fetch banner', data: null },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const formData = await request.formData();

    const updateData: Record<string, unknown> = {};

    const title = formData.get('title');
    if (title !== null) updateData.title = title;

    const subtitle = formData.get('subtitle');
    if (subtitle !== null) updateData.subtitle = subtitle || null;

    const buttonText = formData.get('buttonText');
    if (buttonText !== null) updateData.buttonText = buttonText || null;

    const buttonLink = formData.get('buttonLink');
    if (buttonLink !== null) updateData.buttonLink = buttonLink || null;

    const sortOrder = formData.get('sortOrder');
    if (sortOrder !== null) updateData.sortOrder = parseInt(sortOrder as string, 10);

    const isActive = formData.get('isActive');
    if (isActive !== null) updateData.isActive = isActive === 'true';

    const textColor = formData.get('textColor');
    if (textColor !== null) updateData.textColor = textColor;

    // Handle image upload if new image provided
    const imageFile = formData.get('image') as File | null;
    if (imageFile && imageFile.size > 0) {
      // Validate file size (max 1MB)
      const MAX_SIZE = 1 * 1024 * 1024;
      if (imageFile.size > MAX_SIZE) {
        return NextResponse.json(
          { status: 'error', message: 'Image must be 1MB or less', data: null },
          { status: 400 }
        );
      }

      if (!imageFile.type.startsWith('image/')) {
        return NextResponse.json(
          { status: 'error', message: 'File must be an image', data: null },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const filename = `banner-${Date.now()}-${imageFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      updateData.imageUrl = await uploadFile(buffer, filename, imageFile.type, 'banners');
    }

    const result = await updateBanner(id, updateData);
    const statusCode = result.status === 'success' ? 200 : (result.code || 500);
    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    console.error('PATCH /api/banners/[id] error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to update banner', data: null },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await deleteBanner(id);
    const statusCode = result.status === 'success' ? 200 : (result.code || 500);
    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    console.error('DELETE /api/banners/[id] error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to delete banner', data: null },
      { status: 500 }
    );
  }
}
