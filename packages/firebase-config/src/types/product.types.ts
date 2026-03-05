import type { Timestamp } from 'firebase-admin/firestore';
import type { ProductType, ProductStatus } from './enums';

/** Product attribute definition (e.g. Color=text, Size=dropdown) */
export interface ProductAttributeDefinition {
  key: string;
  label: string;
  inputType: 'text' | 'select';
  options: string[];
}

/** Firestore: /products/{productId} */
export interface FirestoreProduct {
  id: string;
  name: string;
  description: string;
  imageUrls: string[];
  specifications: Record<string, unknown>;
  sizeGuideUrl: string | null;
  deliveryTime: string | null;
  returnTime: string | null;
  price: number;
  salePrice: number | null;
  brand: string | null;
  sku: string | null;
  stock: number;
  kind: ProductType;
  status: ProductStatus;
  isSlide: boolean;
  isFeatured: boolean;
  categoryIds: string[];
  categoryNames: string[];
  /** Attribute preset used (clothing, shoes, electronics, generic, custom) */
  productAttributePreset: string | null;
  /** Attribute definitions for this product's variants */
  productAttributes: ProductAttributeDefinition[];
  /** Denormalized counter for "top selling" queries */
  orderCount: number;
  /** Denormalized average rating */
  averageRating: number;
  /** Denormalized review count */
  reviewCount: number;
  /** Tokenized name/brand for search via array-contains-any */
  searchTokens: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/** Firestore: /products/{productId}/variants/{variantId} */
export interface FirestoreVariant {
  id: string;
  name: string;
  description: string | null;
  imageUrls: string[];
  specifications: Record<string, unknown>;
  price: number;
  salePrice: number | null;
  stock: number;
  sku: string;
  status: ProductStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
