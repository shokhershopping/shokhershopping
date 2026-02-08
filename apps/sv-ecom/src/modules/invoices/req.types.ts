import { z } from 'zod';

// Zod schema for creating invoice
export const createInvoiceZodSchema = z.object({
  body: z.object({
    orderId: z.string().uuid('Invalid order ID'),
    type: z.enum(['ADMIN', 'CUSTOMER']),
    printedBy: z.string().optional(),
  }),
  query: z.object({}),
  params: z.object({}),
});

// Zod schema for getting invoices by order ID
export const getInvoicesByOrderIdZodSchema = z.object({
  body: z.object({}),
  query: z.object({}),
  params: z.object({
    orderId: z.string().uuid('Invalid order ID'),
  }),
});

// Zod schema for getting invoice by ID
export const getInvoiceByIdZodSchema = z.object({
  body: z.object({}),
  query: z.object({}),
  params: z.object({
    id: z.string().uuid('Invalid invoice ID'),
  }),
});

// TypeScript types
export type CreateInvoiceInput = z.infer<typeof createInvoiceZodSchema>['body'];
export type GetInvoicesByOrderIdParams = z.infer<
  typeof getInvoicesByOrderIdZodSchema
>['params'];
export type GetInvoiceByIdParams = z.infer<
  typeof getInvoiceByIdZodSchema
>['params'];
