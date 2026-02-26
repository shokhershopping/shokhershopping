import { NextRequest, NextResponse } from 'next/server';
import {
  getDeliveryAreaById,
  updateDeliveryArea,
  deleteDeliveryArea,
} from 'firebase-config/services/delivery-area.service';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const result = await getDeliveryAreaById(id);

    const statusCode = result.status === 'success' ? 200 : (result.code || 500);
    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    console.error('GET /api/delivery-areas/[id] error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to fetch delivery area', data: null },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const result = await updateDeliveryArea(id, body);

    const statusCode = result.status === 'success' ? 200 : (result.code || 500);
    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    console.error('PATCH /api/delivery-areas/[id] error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to update delivery area', data: null },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const result = await deleteDeliveryArea(id);

    const statusCode = result.status === 'success' ? 200 : (result.code || 500);
    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    console.error('DELETE /api/delivery-areas/[id] error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to delete delivery area', data: null },
      { status: 500 }
    );
  }
}
