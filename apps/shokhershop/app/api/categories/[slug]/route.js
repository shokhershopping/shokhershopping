import { NextResponse } from 'next/server';
import { getCategoryById } from 'firebase-config/services/category.service';
import { adminDb } from 'firebase-config';
import { Collections } from 'firebase-config';

export async function GET(request, { params }) {
  try {
    const { slug } = await params;

    // First try to get by ID
    const byIdResult = await getCategoryById(slug);
    if (byIdResult.status === 'success' && byIdResult.data) {
      return NextResponse.json(byIdResult, { status: 200 });
    }

    // If not found by ID, try to find by name (slug match)
    const snapshot = await adminDb
      .collection(Collections.CATEGORIES)
      .where('name', '==', decodeURIComponent(slug))
      .limit(1)
      .get();

    if (snapshot.empty) {
      // Try case-insensitive by converting slug to title case
      const slugName = slug
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());

      const snapshot2 = await adminDb
        .collection(Collections.CATEGORIES)
        .where('name', '==', slugName)
        .limit(1)
        .get();

      if (snapshot2.empty) {
        return NextResponse.json(
          { status: 'error', message: 'Category not found', data: null },
          { status: 404 }
        );
      }

      const doc = snapshot2.docs[0];
      const category = { id: doc.id, ...doc.data() };
      return NextResponse.json(
        { status: 'success', message: 'Category retrieved', data: category },
        { status: 200 }
      );
    }

    const doc = snapshot.docs[0];
    const category = { id: doc.id, ...doc.data() };
    return NextResponse.json(
      { status: 'success', message: 'Category retrieved', data: category },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET /api/categories/[slug] error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to fetch category', data: null },
      { status: 500 }
    );
  }
}
