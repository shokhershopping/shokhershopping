import type { Timestamp } from 'firebase-admin/firestore';

/** Firestore: /notifications/{notificationId} */
export interface FirestoreNotification {
  id: string;
  title: string;
  message: string;
  actionLink: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/** Firestore: /notifications/{notificationId}/recipients/{recipientId} */
export interface FirestoreNotificationRecipient {
  id: string;
  userId: string;
  isRead: boolean;
  readAt: Timestamp | null;
}
