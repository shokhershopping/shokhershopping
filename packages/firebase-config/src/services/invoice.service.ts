import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '../admin';
import { Collections } from '../collections/index';
import { successResponse, errorResponse } from '../helpers/response';
import type { FirestoreInvoice } from '../types/invoice.types';
import type { InvoiceType } from '../types/enums';
import type { IResponse } from '../helpers/response';

const invoicesCollection = adminDb.collection(Collections.INVOICES);

/**
 * Generate an invoice number: INV-YYYYMMDD-XXXX
 */
function generateInvoiceNumber(): string {
  const now = new Date();
  const dateStr =
    now.getFullYear().toString() +
    (now.getMonth() + 1).toString().padStart(2, '0') +
    now.getDate().toString().padStart(2, '0');
  const random = Math.floor(1000 + Math.random() * 9000).toString();
  return `INV-${dateStr}-${random}`;
}

/**
 * Get all invoices for an order.
 */
export async function getInvoicesByOrderId(
  orderId: string
): Promise<IResponse<FirestoreInvoice[]>> {
  try {
    const snapshot = await invoicesCollection
      .where('orderId', '==', orderId)
      .orderBy('createdAt', 'desc')
      .get();

    const invoices = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as FirestoreInvoice));

    return successResponse(invoices, 'Invoices retrieved successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Failed to retrieve invoices', 500, message);
  }
}

/**
 * Get a single invoice by ID.
 */
export async function getInvoiceById(
  id: string
): Promise<IResponse<FirestoreInvoice | null>> {
  try {
    const doc = await invoicesCollection.doc(id).get();

    if (!doc.exists) {
      return errorResponse('Invoice not found', 404);
    }

    const invoice = { id: doc.id, ...doc.data() } as FirestoreInvoice;
    return successResponse(invoice, 'Invoice retrieved successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Failed to retrieve invoice', 500, message);
  }
}

/**
 * Create an invoice for an order.
 */
export async function createInvoice(
  orderId: string,
  type: InvoiceType,
  printedBy?: string
): Promise<IResponse<FirestoreInvoice>> {
  try {
    // Verify the order exists
    const orderDoc = await adminDb.collection(Collections.ORDERS).doc(orderId).get();
    if (!orderDoc.exists) {
      return errorResponse('Order not found', 404);
    }

    const now = Timestamp.now();

    const invoiceData: Omit<FirestoreInvoice, 'id'> = {
      invoiceNumber: generateInvoiceNumber(),
      type,
      printedBy: printedBy ?? null,
      printedAt: now,
      orderId,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await invoicesCollection.add(invoiceData);
    const invoice = { id: docRef.id, ...invoiceData } as FirestoreInvoice;

    return successResponse(invoice, 'Invoice created successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse('Failed to create invoice', 500, message);
  }
}
