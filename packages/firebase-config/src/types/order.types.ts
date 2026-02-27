import type { Timestamp } from 'firebase-admin/firestore';
import type { OrderStatus, PaymentMethod, DeliveryOption } from './enums';

/** Embedded address snapshot in orders */
export interface OrderAddress {
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zip: string;
  phone: string;
}

/** Embedded transaction in orders */
export interface OrderTransaction {
  amount: number;
  status: string;
  paymentMethod: PaymentMethod;
}

/** Firestore: /orders/{orderId} */
export interface FirestoreOrder {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  status: OrderStatus;
  deliveryCharge: number;
  deliveryOption: DeliveryOption;
  total: number;
  itemsTotalDiscount: number;
  couponAppliedDiscount: number;
  totalWithDiscount: number;
  netTotal: number;
  couponId: string | null;
  couponCode: string | null;
  billingAddress: OrderAddress | null;
  shippingAddress: OrderAddress | null;
  transaction: OrderTransaction | null;
  /** Steadfast courier tracking fields */
  steadfastConsignmentId?: number | null;
  steadfastTrackingCode?: string | null;
  steadfastStatus?: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/** Firestore: /orders/{orderId}/items/{itemId} */
export interface FirestoreOrderItem {
  id: string;
  quantity: number;
  productId: string | null;
  variantId: string | null;
  /** Denormalized snapshot at time of order */
  productName: string;
  productPrice: number;
  productImageUrl: string | null;
  createdAt: Timestamp;
}
