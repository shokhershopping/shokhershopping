import type { Timestamp } from 'firebase-admin/firestore';

export interface FirestoreMarquee {
  id: string;
  text: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
