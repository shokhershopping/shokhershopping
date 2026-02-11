// All enums migrated from Prisma schema

export const Role = {
  USER: 'USER',
  ADMIN: 'ADMIN',
} as const;
export type Role = (typeof Role)[keyof typeof Role];

export const PaymentMethod = {
  COD: 'COD',
  BKASH: 'BKASH',
  SSLCOMMERZ: 'SSLCOMMERZ',
} as const;
export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export const OrderStatus = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  DISPATCHED: 'DISPATCHED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
} as const;
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export const ProductType = {
  PHYSICAL: 'PHYSICAL',
  DIGITAL: 'DIGITAL',
} as const;
export type ProductType = (typeof ProductType)[keyof typeof ProductType];

export const ProductStatus = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED: 'ARCHIVED',
} as const;
export type ProductStatus = (typeof ProductStatus)[keyof typeof ProductStatus];

export const DiscountType = {
  PERCENTAGE: 'PERCENTAGE',
  FIXED: 'FIXED',
} as const;
export type DiscountType = (typeof DiscountType)[keyof typeof DiscountType];

export const CouponType = {
  PERCENTAGE: 'PERCENTAGE',
  FIXED: 'FIXED',
} as const;
export type CouponType = (typeof CouponType)[keyof typeof CouponType];

export const CouponStatus = {
  ACTIVE: 'ACTIVE',
  EXPIRED: 'EXPIRED',
  BLOCKED: 'BLOCKED',
} as const;
export type CouponStatus = (typeof CouponStatus)[keyof typeof CouponStatus];

export const ReviewStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;
export type ReviewStatus = (typeof ReviewStatus)[keyof typeof ReviewStatus];

export const AffiliateStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
} as const;
export type AffiliateStatus = (typeof AffiliateStatus)[keyof typeof AffiliateStatus];

export const AffiliateWithdrawalStatus = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;
export type AffiliateWithdrawalStatus =
  (typeof AffiliateWithdrawalStatus)[keyof typeof AffiliateWithdrawalStatus];

export const ReplyBy = {
  USER: 'USER',
  ADMIN: 'ADMIN',
} as const;
export type ReplyBy = (typeof ReplyBy)[keyof typeof ReplyBy];

export const DeliveryOption = {
  STANDARD: 'STANDARD',
  EXPRESS: 'EXPRESS',
} as const;
export type DeliveryOption = (typeof DeliveryOption)[keyof typeof DeliveryOption];

export const InvoiceType = {
  ADMIN: 'ADMIN',
  CUSTOMER: 'CUSTOMER',
} as const;
export type InvoiceType = (typeof InvoiceType)[keyof typeof InvoiceType];
