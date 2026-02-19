import { NextRequest, NextResponse } from 'next/server';
import {
  markAsRead,
  deleteNotification,
} from 'firebase-config/services/notification.service';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { status: 'error', message: 'userId is required', data: null },
        { status: 400 }
      );
    }

    const result = await markAsRead(id, userId);

    const statusCode = result.status === 'success' ? 200 : (result.code || 500);
    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    console.error('PATCH /api/notifications/[id] error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to mark notification as read', data: null },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { status: 'error', message: 'userId is required', data: null },
        { status: 400 }
      );
    }

    const result = await deleteNotification(id, userId);

    const statusCode = result.status === 'success' ? 200 : (result.code || 500);
    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    console.error('DELETE /api/notifications/[id] error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to delete notification', data: null },
      { status: 500 }
    );
  }
}
