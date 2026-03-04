import { z } from 'zod';
import { messages } from '@/config/messages';
import { fileSchema } from './common-rules';

const productAttributeSchema = z.object({
  key: z.string().min(1, 'Attribute key is required'),
  label: z.string().min(1, 'Attribute label is required'),
  inputType: z.enum(['text', 'select']),
  options: z.array(z.string()).optional().default([]),
});

export const productFormSchema = z.object({
  title: z.string().min(1, { message: messages.productNameIsRequired }),
  sku: z.string().optional(),
  type: z
    .string({ required_error: messages.productTypeIsRequired })
    .min(1, { message: messages.productTypeIsRequired }),
  categories: z.string(),
  description: z.string(),
  productImages: z.array(fileSchema).optional(),
  price: z.coerce.number().min(1, { message: messages.priceIsRequired }),
  salePrice: z.coerce
    .number()
    .min(1, { message: messages.salePriceIsRequired }),
  currentStock: z.number().or(z.string()).optional(),
  brand: z.string().optional(),
  deliveryTime: z.string().optional(),
  returnTime: z.string().optional(),
  productAttributePreset: z.string().optional(),
  productAttributes: z.array(productAttributeSchema).optional(),
  productVariants: z
    .array(
      z.object({
        id: z.string().optional(),
        name: z
          .string()
          .nonempty({ message: 'Name is required' })
          .min(3, 'Name is too short'),
        description: z.string().optional().default(''),
        images: z.array(fileSchema).optional(),
        specifications: z.record(z.string(), z.string()).optional().default({}),
        price: z.number().positive({ message: 'Price must be positive' }),
        salePrice: z.number().positive({ message: 'Price must be positive' }),
        stock: z.number().positive({ message: 'Stock must be positive' }),
        sku: z.string({ message: 'SKU is required' }),
        status: z.string().optional(),
      })
    )
    .optional(),
  pageTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  productUrl: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export type CreateProductInput = z.infer<typeof productFormSchema>;
