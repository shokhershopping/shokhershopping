import {
  Timestamp,
  type DocumentData,
  type DocumentSnapshot,
  type Query,
  type UpdateData,
} from 'firebase-admin/firestore';
import { adminDb } from '../admin';
import { Collections } from '../collections';
import { generateSearchTokens } from '../helpers/query-builder';
import { errorResponse, successResponse, type IResponse } from '../helpers/response';
import { sanitizeContentHtml } from '../helpers/sanitize-content-html';
import { validateContentCtaUrl } from '../helpers/validate-content-url';
import type {
  ContentPostDTO,
  CreateContentPostInput,
  FirestoreContentPost,
  UpdateContentPostInput,
} from '../types/content-post.types';
import { ContentPostStatus } from '../types/enums';

const postsCollection = adminDb.collection(Collections.CONTENT_POSTS);
const slugsCollection = adminDb.collection(Collections.CONTENT_POST_SLUGS);

export function normalizeContentPostSlug(value: string): string {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (!slug) throw new Error('A valid slug is required');
  return slug;
}

function timestampToIso(value: Timestamp | null): string | null {
  return value ? value.toDate().toISOString() : null;
}

export function serializeContentPost(post: FirestoreContentPost): ContentPostDTO {
  return {
    ...post,
    publishedAt: timestampToIso(post.publishedAt),
    createdAt: timestampToIso(post.createdAt) as string,
    updatedAt: timestampToIso(post.updatedAt) as string,
  };
}

function postFromSnapshot(doc: DocumentSnapshot): FirestoreContentPost {
  return { id: doc.id, ...doc.data() } as FirestoreContentPost;
}

function prepareWritableFields(data: UpdateContentPostInput) {
  const prepared: Record<string, unknown> = { ...data };

  if (data.slug !== undefined) prepared.slug = normalizeContentPostSlug(data.slug);
  if (data.contentHtml !== undefined) {
    prepared.contentHtml = sanitizeContentHtml(data.contentHtml);
  }
  if (data.ctaUrl !== undefined) {
    prepared.ctaUrl = validateContentCtaUrl(data.ctaUrl);
  }
  if (data.relatedProductId !== undefined) {
    prepared.relatedProductId = data.relatedProductId?.trim() || null;
  }

  return prepared;
}

export async function isContentPostSlugAvailable(
  slug: string,
  excludePostId?: string
): Promise<boolean> {
  const normalizedSlug = normalizeContentPostSlug(slug);
  const reservation = await slugsCollection.doc(normalizedSlug).get();
  return !reservation.exists || reservation.data()?.postId === excludePostId;
}

export async function getContentPosts(
  limit = 20,
  page = 1,
  filters: { search?: string; status?: FirestoreContentPost['status'] } = {}
): Promise<IResponse<ContentPostDTO[]>> {
  try {
    const safeLimit = Math.max(1, Math.min(limit, 100));
    const safePage = Math.max(1, page);
    let query: Query<DocumentData> = postsCollection;
    if (filters.status) query = query.where('status', '==', filters.status);
    if (filters.search?.trim()) {
      const tokens = generateSearchTokens(filters.search).slice(0, 30);
      if (tokens.length === 0) {
        return successResponse([], 'Content posts retrieved successfully', {
          total: 0,
          page: safePage,
          limit: safeLimit,
        });
      }
      query = query.where('searchTokens', 'array-contains-any', tokens);
    }
    const countSnapshot = await query.count().get();
    const total = countSnapshot.data().count;
    const snapshot = await query
      .orderBy('createdAt', 'desc')
      .offset((safePage - 1) * safeLimit)
      .limit(safeLimit)
      .get();
    const posts = snapshot.docs.map((doc) => serializeContentPost(postFromSnapshot(doc)));

    return successResponse(posts, 'Content posts retrieved successfully', {
      total,
      page: safePage,
      limit: safeLimit,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Failed to retrieve content posts', 500, message);
  }
}

export async function getContentPostById(
  id: string
): Promise<IResponse<ContentPostDTO | null>> {
  try {
    const doc = await postsCollection.doc(id).get();
    if (!doc.exists) return errorResponse('Content post not found', 404);
    return successResponse(
      serializeContentPost(postFromSnapshot(doc)),
      'Content post retrieved successfully'
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Failed to retrieve content post', 500, message);
  }
}

export async function getPublishedContentPostBySlug(
  slug: string
): Promise<IResponse<ContentPostDTO | null>> {
  try {
    const normalizedSlug = normalizeContentPostSlug(slug);
    const reservation = await slugsCollection.doc(normalizedSlug).get();
    const postId = reservation.data()?.postId as string | undefined;
    if (!postId) return errorResponse('Content post not found', 404);

    const postDoc = await postsCollection.doc(postId).get();
    if (!postDoc.exists) return errorResponse('Content post not found', 404);

    const post = postFromSnapshot(postDoc);
    if (post.slug !== normalizedSlug || post.status !== ContentPostStatus.PUBLISHED) {
      return errorResponse('Content post not found', 404);
    }

    return successResponse(serializeContentPost(post), 'Content post retrieved successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Failed to retrieve content post', 500, message);
  }
}

export async function createContentPost(
  data: CreateContentPostInput
): Promise<IResponse<ContentPostDTO>> {
  try {
    const slug = normalizeContentPostSlug(data.slug);
    const now = Timestamp.now();
    const postRef = postsCollection.doc();
    const slugRef = slugsCollection.doc(slug);
    const status = data.status ?? ContentPostStatus.DRAFT;
    const postData: Omit<FirestoreContentPost, 'id'> = {
      title: data.title.trim(),
      slug,
      excerpt: data.excerpt?.trim() ?? '',
      contentHtml: sanitizeContentHtml(data.contentHtml),
      featuredImage: data.featuredImage?.trim() ?? '',
      featuredImageAlt: data.featuredImageAlt?.trim() ?? '',
      relatedProductId: data.relatedProductId?.trim() || null,
      ctaText: data.ctaText?.trim() ?? '',
      ctaUrl: validateContentCtaUrl(data.ctaUrl),
      status,
      seoTitle: data.seoTitle?.trim() ?? '',
      metaDescription: data.metaDescription?.trim() ?? '',
      ogTitle: data.ogTitle?.trim() ?? '',
      ogDescription: data.ogDescription?.trim() ?? '',
      ogImage: data.ogImage?.trim() ?? '',
      authorId: data.authorId,
      authorName: data.authorName,
      publishedAt: status === ContentPostStatus.PUBLISHED ? now : null,
      createdAt: now,
      updatedAt: now,
      searchTokens: generateSearchTokens(`${data.title} ${data.excerpt ?? ''}`),
    };

    await adminDb.runTransaction(async (transaction) => {
      const slugDoc = await transaction.get(slugRef);
      if (slugDoc.exists) throw new Error('CONTENT_POST_SLUG_CONFLICT');
      transaction.create(slugRef, { postId: postRef.id, createdAt: now });
      transaction.create(postRef, postData);
    });

    return successResponse(
      serializeContentPost({ id: postRef.id, ...postData }),
      'Content post created successfully'
    );
  } catch (error) {
    if (error instanceof Error && error.message === 'CONTENT_POST_SLUG_CONFLICT') {
      return errorResponse('Slug is already in use', 409);
    }
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Failed to create content post', 500, message);
  }
}

export async function updateContentPost(
  id: string,
  data: UpdateContentPostInput
): Promise<IResponse<ContentPostDTO | null>> {
  try {
    const postRef = postsCollection.doc(id);
    const now = Timestamp.now();

    await adminDb.runTransaction(async (transaction) => {
      const postDoc = await transaction.get(postRef);
      if (!postDoc.exists) throw new Error('CONTENT_POST_NOT_FOUND');

      const existing = postFromSnapshot(postDoc);
      const prepared = prepareWritableFields(data);
      const nextSlug = (prepared.slug as string | undefined) ?? existing.slug;

      if (nextSlug !== existing.slug) {
        const nextSlugRef = slugsCollection.doc(nextSlug);
        const oldSlugRef = slugsCollection.doc(existing.slug);
        const nextSlugDoc = await transaction.get(nextSlugRef);
        const oldSlugDoc = await transaction.get(oldSlugRef);
        if (nextSlugDoc.exists) throw new Error('CONTENT_POST_SLUG_CONFLICT');

        transaction.create(nextSlugRef, { postId: id, createdAt: now });
        if (oldSlugDoc.data()?.postId === id) transaction.delete(oldSlugRef);
      }

      const nextStatus = (prepared.status as FirestoreContentPost['status'] | undefined) ?? existing.status;
      const updateData: Record<string, unknown> = { ...prepared, updatedAt: now };
      if (nextStatus === ContentPostStatus.PUBLISHED && !existing.publishedAt) {
        updateData.publishedAt = now;
      }
      if (data.title !== undefined || data.excerpt !== undefined) {
        updateData.searchTokens = generateSearchTokens(
          `${data.title ?? existing.title} ${data.excerpt ?? existing.excerpt}`
        );
      }

      transaction.update(
        postRef,
        updateData as UpdateData<Omit<FirestoreContentPost, 'id'>>
      );
    });

    const updated = await postRef.get();
    return successResponse(
      serializeContentPost(postFromSnapshot(updated)),
      'Content post updated successfully'
    );
  } catch (error) {
    if (error instanceof Error && error.message === 'CONTENT_POST_NOT_FOUND') {
      return errorResponse('Content post not found', 404);
    }
    if (error instanceof Error && error.message === 'CONTENT_POST_SLUG_CONFLICT') {
      return errorResponse('Slug is already in use', 409);
    }
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Failed to update content post', 500, message);
  }
}

export async function deleteContentPost(id: string): Promise<IResponse<null>> {
  try {
    const postRef = postsCollection.doc(id);
    await adminDb.runTransaction(async (transaction) => {
      const postDoc = await transaction.get(postRef);
      if (!postDoc.exists) throw new Error('CONTENT_POST_NOT_FOUND');

      const post = postFromSnapshot(postDoc);
      const slugRef = slugsCollection.doc(post.slug);
      const slugDoc = await transaction.get(slugRef);
      transaction.delete(postRef);
      if (slugDoc.data()?.postId === id) transaction.delete(slugRef);
    });

    return successResponse(null, 'Content post deleted successfully');
  } catch (error) {
    if (error instanceof Error && error.message === 'CONTENT_POST_NOT_FOUND') {
      return errorResponse('Content post not found', 404);
    }
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Failed to delete content post', 500, message);
  }
}
