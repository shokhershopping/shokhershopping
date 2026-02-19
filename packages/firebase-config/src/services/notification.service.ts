import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '../admin';
import { Collections } from '../collections/index';
import { successResponse, errorResponse } from '../helpers/response';
import { paginateQuery } from '../helpers/pagination';
import type { FirestoreNotification, FirestoreNotificationRecipient } from '../types/notification.types';
import type { IResponse } from '../helpers/response';
import type { PaginatedResult } from '../helpers/pagination';

const notificationsCollection = adminDb.collection(Collections.NOTIFICATIONS);

/**
 * Get notifications for a specific user (where they are a recipient).
 */
export async function getNotificationsByUserId(
  userId: string,
  limit: number = 10,
  page: number = 1
): Promise<IResponse<PaginatedResult<FirestoreNotification & { isRead: boolean }>['data']>> {
  try {
    // Query all notifications and check recipient subcollection
    // Since Firestore doesn't support subcollection queries across parents easily,
    // we use a collectionGroup query on recipients
    const recipientQuery = adminDb
      .collectionGroup(Collections.NOTIFICATION_RECIPIENTS)
      .where('userId', '==', userId)
      .orderBy('__name__');

    const recipientSnapshot = await recipientQuery.get();

    // Get parent notification IDs and read status
    const notificationMeta = new Map<string, boolean>();
    for (const recipientDoc of recipientSnapshot.docs) {
      const parentRef = recipientDoc.ref.parent.parent;
      if (parentRef) {
        const recipientData = recipientDoc.data() as FirestoreNotificationRecipient;
        notificationMeta.set(parentRef.id, recipientData.isRead);
      }
    }

    if (notificationMeta.size === 0) {
      return successResponse([], 'No notifications found', { total: 0, page, limit });
    }

    // Fetch the actual notification documents
    const notificationIds = Array.from(notificationMeta.keys());
    const total = notificationIds.length;

    // Manual pagination
    const offset = (page - 1) * limit;
    const paginatedIds = notificationIds.slice(offset, offset + limit);

    const notifications: (FirestoreNotification & { isRead: boolean })[] = [];
    for (const notifId of paginatedIds) {
      const doc = await notificationsCollection.doc(notifId).get();
      if (doc.exists) {
        notifications.push({
          id: doc.id,
          ...doc.data(),
          isRead: notificationMeta.get(notifId) ?? false,
        } as FirestoreNotification & { isRead: boolean });
      }
    }

    // Sort by createdAt descending
    notifications.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());

    return successResponse(notifications, 'Notifications retrieved successfully', {
      total,
      page,
      limit,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Failed to retrieve notifications', 500, message);
  }
}

/**
 * Create a notification and add recipients.
 */
export async function createNotification(
  data: {
    title: string;
    message: string;
    actionLink?: string;
  },
  recipientIds: string[]
): Promise<IResponse<FirestoreNotification>> {
  try {
    const now = Timestamp.now();
    const batch = adminDb.batch();

    const notificationData: Omit<FirestoreNotification, 'id'> = {
      title: data.title,
      message: data.message,
      actionLink: data.actionLink ?? '',
      createdAt: now,
      updatedAt: now,
    };

    const notifRef = notificationsCollection.doc();
    batch.set(notifRef, notificationData);

    // Create recipient entries in subcollection
    for (const userId of recipientIds) {
      const recipientRef = notifRef.collection(Collections.NOTIFICATION_RECIPIENTS).doc();
      const recipientData: Omit<FirestoreNotificationRecipient, 'id'> = {
        userId,
        isRead: false,
        readAt: null,
      };
      batch.set(recipientRef, recipientData);
    }

    await batch.commit();

    const notification = { id: notifRef.id, ...notificationData } as FirestoreNotification;
    return successResponse(notification, 'Notification created successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Failed to create notification', 500, message);
  }
}

/**
 * Mark a notification as read for a specific user.
 */
export async function markAsRead(
  notificationId: string,
  userId: string
): Promise<IResponse<null>> {
  try {
    const recipientsRef = notificationsCollection
      .doc(notificationId)
      .collection(Collections.NOTIFICATION_RECIPIENTS);

    const snapshot = await recipientsRef
      .where('userId', '==', userId)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return errorResponse('Notification recipient not found', 404);
    }

    await snapshot.docs[0].ref.update({
      isRead: true,
      readAt: Timestamp.now(),
    });

    return successResponse(null, 'Notification marked as read');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Failed to mark notification as read', 500, message);
  }
}

/**
 * Delete a notification for a specific user (removes their recipient entry).
 */
export async function deleteNotification(
  notificationId: string,
  userId: string
): Promise<IResponse<null>> {
  try {
    const recipientsRef = notificationsCollection
      .doc(notificationId)
      .collection(Collections.NOTIFICATION_RECIPIENTS);

    const snapshot = await recipientsRef
      .where('userId', '==', userId)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return errorResponse('Notification recipient not found', 404);
    }

    await snapshot.docs[0].ref.delete();

    // Check if there are any remaining recipients; if not, delete the notification itself
    const remainingSnapshot = await recipientsRef.limit(1).get();
    if (remainingSnapshot.empty) {
      await notificationsCollection.doc(notificationId).delete();
    }

    return successResponse(null, 'Notification deleted successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Failed to delete notification', 500, message);
  }
}
