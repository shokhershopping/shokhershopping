import prisma from '../../prismaClient';
import { CustomError } from '../../utils/CustomError';
import { CreateInvoiceInput } from './req.types';

/**
 * Generate unique invoice number
 * Format: INV-YYYYMMDD-XXXX
 * Example: INV-20250109-0001
 */
async function generateInvoiceNumber(): Promise<string> {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const datePrefix = `${year}${month}${day}`;

  // Get the count of invoices created today
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  const todayInvoiceCount = await prisma.invoice.count({
    where: {
      createdAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
  });

  // Increment count for new invoice
  const sequence = String(todayInvoiceCount + 1).padStart(4, '0');

  return `INV-${datePrefix}-${sequence}`;
}

/**
 * Create a new invoice record
 */
export async function createInvoice(data: CreateInvoiceInput) {
  // Check if order exists
  const order = await prisma.order.findUnique({
    where: { id: data.orderId },
  });

  if (!order) {
    throw new CustomError('Order not found', 404);
  }

  // Generate unique invoice number
  const invoiceNumber = await generateInvoiceNumber();

  // Create invoice
  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber,
      type: data.type,
      printedBy: data.printedBy,
      orderId: data.orderId,
    },
    include: {
      order: {
        include: {
          user: true,
          items: {
            include: {
              product: {
                include: {
                  images: true,
                },
              },
              variableProduct: {
                include: {
                  images: true,
                },
              },
            },
          },
          billingAddress: true,
          shippingAddress: true,
          transaction: true,
          coupon: true,
        },
      },
    },
  });

  return invoice;
}

/**
 * Get all invoices for an order
 */
export async function getInvoicesByOrderId(orderId: string) {
  const invoices = await prisma.invoice.findMany({
    where: { orderId },
    orderBy: { createdAt: 'desc' },
    include: {
      order: {
        include: {
          user: true,
        },
      },
    },
  });

  return invoices;
}

/**
 * Get invoice by ID
 */
export async function getInvoiceById(id: string) {
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      order: {
        include: {
          user: true,
          items: {
            include: {
              product: {
                include: {
                  images: true,
                },
              },
              variableProduct: {
                include: {
                  images: true,
                },
              },
            },
          },
          billingAddress: true,
          shippingAddress: true,
          transaction: true,
          coupon: true,
        },
      },
    },
  });

  if (!invoice) {
    throw new CustomError('Invoice not found', 404);
  }

  return invoice;
}
