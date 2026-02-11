import type { Timestamp } from 'firebase-admin/firestore';
import type { CouponType, CouponStatus } from './enums';

/** Firestore: /coupons/{couponId} */
export interface FirestoreCoupon {
  id: string;
  code: string;
  description: string | null;
  amount: number;
  type: CouponType;
  start: Timestamp;
  end: Timestamp;
  expiry: Timestamp;
  minimum: number;
  maximum: number;
  used: number;
  limit: number;
  status: CouponStatus;
  creatorId: string | null;
  eligibleUserIds: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
