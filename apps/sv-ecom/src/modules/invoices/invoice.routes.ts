import { Router } from 'express';
import { requireAuth } from '@clerk/express';
import { validate } from '../../middlewares/validate';
import {
  createInvoiceController,
  getInvoicesByOrderIdController,
  getInvoiceByIdController,
} from './invoice.controller';
import {
  createInvoiceZodSchema,
  getInvoicesByOrderIdZodSchema,
  getInvoiceByIdZodSchema,
} from './req.types';

const router = Router();

// Create invoice (protected route)
router.post(
  '/',
  requireAuth(),
  validate(createInvoiceZodSchema),
  createInvoiceController
);

// Get invoices by order ID (protected route)
router.get(
  '/order/:orderId',
  requireAuth(),
  validate(getInvoicesByOrderIdZodSchema),
  getInvoicesByOrderIdController
);

// Get invoice by ID (protected route)
router.get(
  '/:id',
  requireAuth(),
  validate(getInvoiceByIdZodSchema),
  getInvoiceByIdController
);

export default router;
