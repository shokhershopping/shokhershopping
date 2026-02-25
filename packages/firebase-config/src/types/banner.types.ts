import type { Timestamp } from 'firebase-admin/firestore';

export interface FirestoreBanner {
  id: string;
  title: string;
  subtitle: string | null;
  buttonText: string | null;
  buttonLink: string | null;
  imageUrl: string;
  textColor: 'light' | 'dark' | 'auto';
  sortOrder: number;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
