import { NextRequest, NextResponse } from 'next/server';
import { getMarqueeById, updateMarquee, deleteMarquee } from 'firebase-config/services/marquee.service';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const result = await getMarqueeById(params.id);
    return NextResponse.json(result, { status: result.status === 'success' ? 200 : (result.code || 500) });
  } catch (error) {
    console.error('GET /api/marquee/[id] error:', error);
    return NextResponse.json({ status: 'error', message: 'Failed to fetch marquee', data: null }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ status: 'error', message: 'Unauthorized', data: null }, { status: 401 });
    }

    const body = await request.json();
    const updateData: { text?: string; isActive?: boolean; sortOrder?: number } = {};

    if (body.text !== undefined) updateData.text = body.text.trim();
    if (body.isActive !== undefined) updateData.isActive = Boolean(body.isActive);
    if (body.sortOrder !== undefined) updateData.sortOrder = Number(body.sortOrder);

    const result = await updateMarquee(params.id, updateData);
    return NextResponse.json(result, { status: result.status === 'success' ? 200 : (result.code || 500) });
  } catch (error) {
    console.error('PATCH /api/marquee/[id] error:', error);
    return NextResponse.json({ status: 'error', message: 'Failed to update marquee', data: null }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ status: 'error', message: 'Unauthorized', data: null }, { status: 401 });
    }

    const result = await deleteMarquee(params.id);
    return NextResponse.json(result, { status: result.status === 'success' ? 200 : (result.code || 500) });
  } catch (error) {
    console.error('DELETE /api/marquee/[id] error:', error);
    return NextResponse.json({ status: 'error', message: 'Failed to delete marquee', data: null }, { status: 500 });
  }
}
