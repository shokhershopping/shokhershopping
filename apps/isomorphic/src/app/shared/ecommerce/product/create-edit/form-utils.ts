import { CreateProductInput } from '@/validators/create-product.schema';
import isEmpty from 'lodash/isEmpty';

export const customFields = [
  {
    label: '',
    value: '',
  },
];
export const locationShipping = [
  {
    name: '',
    shippingCharge: '',
  },
];
export const productVariants = [
  // empty default — variants added dynamically
];

// ─── Product Attribute Presets ───────────────────────────────────────
export interface ProductAttribute {
  key: string;
  label: string;
  inputType: 'text' | 'select';
  options: string[];
}

export const ATTRIBUTE_PRESETS: Record<string, ProductAttribute[]> = {
  clothing: [
    { key: 'color', label: 'Color', inputType: 'text', options: [] },
    { key: 'size', label: 'Size', inputType: 'select', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] },
  ],
  shoes: [
    { key: 'color', label: 'Color', inputType: 'text', options: [] },
    { key: 'size', label: 'Shoe Size', inputType: 'select', options: ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'] },
  ],
  electronics: [
    { key: 'color', label: 'Color', inputType: 'text', options: [] },
    { key: 'storage', label: 'Storage', inputType: 'text', options: [] },
    { key: 'ram', label: 'RAM', inputType: 'text', options: [] },
  ],
  generic: [],
};

export const PRESET_OPTIONS = [
  { value: 'clothing', label: 'Clothing (Color + Size)' },
  { value: 'shoes', label: 'Shoes (Color + Shoe Size)' },
  { value: 'electronics', label: 'Electronics (Color + Storage + RAM)' },
  { value: 'generic', label: 'Generic (No Attributes)' },
  { value: 'custom', label: 'Custom Attributes' },
];

/** Try to detect which preset matches a set of specification keys */
export function inferPresetFromSpecs(specKeys: string[]): string {
  const sorted = [...specKeys].sort().join(',');
  for (const [presetKey, attrs] of Object.entries(ATTRIBUTE_PRESETS)) {
    const presetSorted = attrs.map((a) => a.key).sort().join(',');
    if (sorted === presetSorted) return presetKey;
  }
  return specKeys.length > 0 ? 'custom' : 'generic';
}

/** Build ProductAttribute array from specification keys (for edit mode) */
export function buildAttributesFromSpecs(specKeys: string[], preset: string): ProductAttribute[] {
  if (preset !== 'custom' && ATTRIBUTE_PRESETS[preset]) {
    return ATTRIBUTE_PRESETS[preset];
  }
  return specKeys.map((key) => ({
    key,
    label: key.charAt(0).toUpperCase() + key.slice(1),
    inputType: 'text' as const,
    options: [],
  }));
}

// ─── Default Values ─────────────────────────────────────────────────
export function defaultValues(product?: CreateProductInput) {
  return {
    title: product?.title ?? '',
    sku: product?.sku ?? '',
    type: product?.type ?? '',
    categories: product?.categories ?? '',
    description: product?.description ?? '',
    price: product?.price ?? undefined,
    salePrice: product?.salePrice ?? undefined,
    currentStock: product?.currentStock ?? '',
    productImages: product?.productImages ?? undefined,
    brand: product?.brand ?? '',
    deliveryTime: product?.deliveryTime ?? '5',
    returnTime: product?.returnTime ?? '15',
    productAttributePreset: product?.productAttributePreset ?? 'clothing',
    productAttributes: !isEmpty(product?.productAttributes)
      ? product?.productAttributes
      : ATTRIBUTE_PRESETS.clothing,
    productVariants: !isEmpty(product?.productVariants)
      ? product?.productVariants
      : productVariants,
    pageTitle: product?.pageTitle ?? '',
    metaDescription: product?.metaDescription ?? '',
    metaKeywords: product?.metaKeywords ?? '',
    productUrl: product?.productUrl ?? '',
    tags: product?.tags ?? [],
  };
}

export const productData = {
  title: 'Apple',
  description: 'Fresh Express Iceberg Garden Salad Blend',
  sku: 'SKU-28935',
  type: 'Digital Product',
  categories: 'Grocery',
  price: 10,
  costPrice: 20,
  retailPrice: 15,
  salePrice: 25,
  productImages: undefined,
  inventoryTracking: 'no',
  currentStock: '150',
  lowStock: '20',
  productAvailability: 'online',
  tradeNumber: '12345',
  manufacturerNumber: '154',
  brand: 'Foska',
  upcEan: 'Ean',
  customFields: [
    {
      label: 'Color',
      value: 'Red',
    },
  ],
  freeShipping: false,
  shippingPrice: 45,
  locationBasedShipping: true,
  locationShipping: [
    {
      name: 'USA',
      shippingCharge: '150',
    },
  ],
  pageTitle: 'apple',
  metaDescription: 'apple',
  metaKeywords: 'grocery, foods',
  productUrl: 'http://localhost:3000/',
  isPurchaseSpecifyDate: true,
  isLimitDate: true,
  dateFieldName: 'Date Field',
  productVariants: [
    {
      name: 'Jhon',
      value: '150',
    },
  ],
  tags: ['iPhone', 'mobile'],
};

export const menuItems = [
  {
    label: 'Summary',
    value: 'summary',
  },
  {
    label: 'Images & Gallery',
    value: 'images_gallery',
  },
  {
    label: 'Pricing & Inventory',
    value: 'pricing_inventory',
  },
  {
    label: 'Product Identifiers & Custom Fields',
    value: 'product_identifiers',
  },
  {
    label: 'Shipping & Availability',
    value: 'shipping_availability',
  },
  {
    label: 'SEO',
    value: 'seo',
  },
  {
    label: 'Variant Options',
    value: 'variant_options',
  },
];

// Category option
export const categoryOption = [
  { value: 'fruits', label: 'Fruits' },
  { value: 'grocery', label: 'Grocery' },
  { value: 'meat', label: 'Meat' },
  { value: 'cat food', label: 'Cat Food' },
];

// Type option
export const typeOption = [
  { value: 'PHYSICAL', label: 'Physical Product' },
  { value: 'DIGITAL', label: 'Digital Product' },
];

// Legacy exports (kept for backward compat)
export const variantOption = [
  { value: 'XS', label: 'XS' },
  { value: 'S', label: 'S' },
  { value: 'M', label: 'M' },
  { value: 'L', label: 'L' },
  { value: 'XL', label: 'XL' },
  { value: 'XXL', label: 'XXL' },
  { value: 'XXXL', label: 'XXXL' },
];

export const specificationOption = [
  { value: 'Color', label: 'Color' },
  { value: 'Size', label: 'Size' },
];
