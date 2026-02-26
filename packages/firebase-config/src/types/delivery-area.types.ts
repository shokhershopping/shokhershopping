import { Timestamp } from 'firebase-admin/firestore';
import type { DeliveryAreaStatus } from './enums';

export interface FirestoreDeliveryArea {
  id: string;
  name: string;
  price: number;
  isDefault: boolean;
  status: DeliveryAreaStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
