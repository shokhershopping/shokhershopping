import { Request, Response, NextFunction } from 'express';
import {
  createInvoice,
  getInvoicesByOrderId,
  getInvoiceById,
} from './invoice.service';
import { CreateInvoiceInput } from './req.types';

/**
 * Create a new invoice
 * POST /invoices
 */
export async function createInvoiceController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data: CreateInvoiceInput = req.body;

    // Get user ID from Clerk auth (if available)
    const printedBy = (req as any).auth?.userId || data.printedBy;

    const invoice = await createInvoice({
      ...data,
      printedBy,
    });

    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: invoice,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get invoices by order ID
 * GET /invoices/order/:orderId
 */
export async function getInvoicesByOrderIdController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { orderId } = req.params;

    const invoices = await getInvoicesByOrderId(orderId);

    res.status(200).json({
      success: true,
      message: 'Invoices retrieved successfully',
      data: invoices,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get invoice by ID
 * GET /invoices/:id
 */
export async function getInvoiceByIdController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;

    const invoice = await getInvoiceById(id);

    res.status(200).json({
      success: true,
      message: 'Invoice retrieved successfully',
      data: invoice,
    });
  } catch (error) {
    next(error);
  }
}
