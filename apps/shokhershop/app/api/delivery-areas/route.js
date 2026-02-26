import { NextResponse } from 'next/server';
import { getActiveDeliveryAreas } from 'firebase-config/services/delivery-area.service';

export async function GET() {
  try {
    const result = await getActiveDeliveryAreas();

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
