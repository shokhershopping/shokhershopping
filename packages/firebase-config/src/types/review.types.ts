import type { Timestamp } from 'firebase-admin/firestore';
import type { ReviewStatus } from './enums';

/** Firestore: /reviews/{reviewId} */
export interface FirestoreReview {
  id: string;
  userId: string;
  userName: string;
  userImage: string | null;
  productId: string | null;
  variantId: string | null;
  productName: string;
  rating: number;
  comment: string | null;
  status: ReviewStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
