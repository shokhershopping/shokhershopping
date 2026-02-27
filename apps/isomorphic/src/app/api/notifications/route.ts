import { NextRequest, NextResponse } from 'next/server';
import {
  getNotificationsByUserId,
  createNotification,
  markAllAsRead,
  getUnreadCount,
} from 'firebase-config/services/notification.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page') || '1', 10) || 1;
    const limit = parseInt(searchParams.get('limit') || '10', 10) || 10;

    if (!userId) {
      return NextResponse.json(
        { status: 'error', message: 'userId is required', data: null },
        { status: 400 }
      );
    }

    // If countOnly=true, just return unread count
    if (searchParams.get('countOnly') === 'true') {
      const count = await getUnreadCount(userId);
      return NextResponse.json({ status: 'success', data: { unreadCount: count } });
    }

    const result = await getNotificationsByUserId(userId, limit, page);

    const statusCode = result.status === 'success' ? 200 : (result.code || 500);
    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    console.error('GET /api/notifications error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to fetch notifications', data: null },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { status: 'error', message: 'userId is required', data: null },
        { status: 400 }
      );
    }

    const result = await markAllAsRead(userId);
    const statusCode = result.status === 'success' ? 200 : (result.code || 500);
    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    console.error('PATCH /api/notifications error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to mark all as read', data: null },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { recipientIds, ...data } = body;

    if (!recipientIds || !Array.isArray(recipientIds) || recipientIds.length === 0) {
      return NextResponse.json(
        { status: 'error', message: 'recipientIds array is required', data: null },
        { status: 400 }
      );
    }

    const result = await createNotification(data, recipientIds);

    const statusCode = result.status === 'success' ? 201 : (result.code || 500);
    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    console.error('POST /api/notifications error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to create notification', data: null },
      { status: 500 }
    );
  }
}
