import type { Timestamp } from 'firebase-admin/firestore';
import type { ReplyBy } from './enums';

/** Firestore: /qna/{qnaId} */
export interface FirestoreQnA {
  id: string;
  question: string;
  userId: string;
  userName: string;
  productId: string | null;
  variantId: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/** Firestore: /qna/{qnaId}/replies/{replyId} */
export interface FirestoreReply {
  id: string;
  message: string;
  repliedBy: ReplyBy;
  createdAt: Timestamp;
}
