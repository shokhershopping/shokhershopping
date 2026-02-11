import type { Timestamp } from 'firebase-admin/firestore';
import type { Role, PaymentMethod } from './enums';

/** Firestore: /users/{userId} */
export interface FirestoreUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: Role;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/** Firestore: /users/{userId}/addresses/{addressId} */
export interface FirestoreAddress {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zip: string;
  phone: string;
  isPrimary: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/** Firestore: /users/{userId}/preferences/{preferenceId} */
export interface FirestorePreference {
  id: string;
  notificationChannels: string[];
  paymentMethod: PaymentMethod;
  addressId: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
