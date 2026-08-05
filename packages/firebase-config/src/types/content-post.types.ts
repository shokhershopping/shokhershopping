import type { Timestamp } from 'firebase-admin/firestore';
import type { ContentPostStatus } from './enums';

/** Firestore: /contentPosts/{contentPostId} */
export interface FirestoreContentPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  contentHtml: string;
  featuredImage: string;
  featuredImageAlt: string;
  relatedProductId: string | null;
  ctaText: string;
  ctaUrl: string;
  status: ContentPostStatus;
  seoTitle: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  authorId: string;
  authorName: string;
  publishedAt: Timestamp | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  searchTokens: string[];
}

/** JSON-safe content-post representation for APIs and client components. */
export interface ContentPostDTO
  extends Omit<
    FirestoreContentPost,
    'publishedAt' | 'createdAt' | 'updatedAt'
  > {
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContentPostInput {
  title: string;
  slug: string;
  excerpt?: string;
  contentHtml: string;
  featuredImage?: string;
  featuredImageAlt?: string;
  relatedProductId?: string | null;
  ctaText?: string;
  ctaUrl?: string;
  status?: ContentPostStatus;
  seoTitle?: string;
  metaDescription?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  authorId: string;
  authorName: string;
}

export type UpdateContentPostInput = Partial<
  Omit<CreateContentPostInput, 'authorId' | 'authorName'>
>;
