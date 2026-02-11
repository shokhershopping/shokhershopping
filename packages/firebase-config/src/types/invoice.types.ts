import type { Timestamp } from 'firebase-admin/firestore';
import type { InvoiceType } from './enums';

/** Firestore: /invoices/{invoiceId} */
export interface FirestoreInvoice {
  id: string;
  invoiceNumber: string;
  type: InvoiceType;
  printedBy: string | null;
  printedAt: Timestamp;
  orderId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
