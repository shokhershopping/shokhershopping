import { Timestamp } from 'firebase-admin/firestore';

export interface FirestoreSettings {
  metaPixelId: string;
  steadfastApiKey: string;
  steadfastSecretKey: string;
  updatedAt: Timestamp;
}
