import { NextRequest, NextResponse } from 'next/server';
import { getMarquees, getActiveMarquees, createMarquee } from 'firebase-config/services/marquee.service';
import { verifySessionCookie } from 'firebase-config/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';
    const result = activeOnly ? await getActiveMarquees() : await getMarquees();
    return NextResponse.json(result, { status: result.status === 'success' ? 200 : (result.code || 500) });
  } catch (error) {
    console.error('GET /api/marquee error:', error);
    return NextResponse.json({ status: 'error', message: 'Failed to fetch marquees', data: null }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ status: 'error', message: 'Unauthorized', data: null }, { status: 401 });
    }

    const body = await request.json();
    const { text, isActive, sortOrder } = body;

    if (!text || !text.trim()) {
      return NextResponse.json({ status: 'error', message: 'Text is required', data: null }, { status: 400 });
    }

    const result = await createMarquee({ text: text.trim(), isActive, sortOrder });
    return NextResponse.json(result, { status: result.status === 'success' ? 201 : (result.code || 500) });
  } catch (error) {
    console.error('POST /api/marquee error:', error);
    return NextResponse.json({ status: 'error', message: 'Failed to create marquee', data: null }, { status: 500 });
  }
}
