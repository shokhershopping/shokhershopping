import type { Timestamp } from 'firebase-admin/firestore';

/** Firestore: /categories/{categoryId} */
export interface FirestoreCategory {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  sliderImageUrl: string | null;
  title: string | null;
  isSlide: boolean;
  isFeatured: boolean;
  isMenu: boolean;
  parentId: string | null;
  parentName: string | null;
  childIds: string[];
  productCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
