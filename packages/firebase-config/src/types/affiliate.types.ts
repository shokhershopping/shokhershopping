import type { Timestamp } from 'firebase-admin/firestore';
import type { AffiliateStatus, AffiliateWithdrawalStatus } from './enums';

/** Firestore: /affiliates/{affiliateId} */
export interface FirestoreAffiliate {
  id: string;
  userId: string;
  link: string;
  status: AffiliateStatus;
  totalPoints: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/** Firestore: /affiliates/{affiliateId}/clicks/{clickId} */
export interface FirestoreAffiliateClick {
  id: string;
  ipAddress: string;
  userAgent: string;
  userId: string | null;
  createdAt: Timestamp;
}

/** Firestore: /affiliates/{affiliateId}/purchases/{purchaseId} */
export interface FirestoreAffiliatedPurchase {
  id: string;
  orderId: string;
  pointAwarded: number;
  createdAt: Timestamp;
}

/** Firestore: /affiliates/{affiliateId}/withdrawals/{withdrawalId} */
export interface FirestoreAffiliateWithdrawal {
  id: string;
  rate: number;
  points: number;
  amount: number;
  status: AffiliateWithdrawalStatus;
  createdAt: Timestamp;
}
