import { NextRequest, NextResponse } from 'next/server';
import { getDeliveryAreas, createDeliveryArea } from 'firebase-config/services/delivery-area.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10) || 1;
    const limit = parseInt(searchParams.get('limit') || '10', 10) || 10;

    const result = await getDeliveryAreas(limit, page);

    const statusCode = result.status === 'success' ? 200 : (result.code || 500);
    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    console.error('GET /api/delivery-areas error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to fetch delivery areas', data: null },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await createDeliveryArea(body);

    const statusCode = result.status === 'success' ? 201 : (result.code || 500);
    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    console.error('POST /api/delivery-areas error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to create delivery area', data: null },
      { status: 500 }
    );
  }
}
