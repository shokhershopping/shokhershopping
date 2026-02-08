/**
 * Transform product data for Stock View display
 * Groups variants by color and maps stock to size columns
 */

export type SizeOption = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'XXXL';

export const ALL_SIZES: SizeOption[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

export interface StockBySize {
  XS?: number;
  S?: number;
  M?: number;
  L?: number;
  XL?: number;
  XXL?: number;
  XXXL?: number;
}

export interface StockViewRow {
  id: string; // Unique ID for the row
  productId: string; // Parent product ID
  productName: string;
  productImage: string;
  color: string; // Color variant name or 'Base Product'
  stockBySize: StockBySize;
  totalStock: number;
  hasVariants: boolean;
}

interface VariableProduct {
  id: string;
  name: string;
  color?: string;
  size?: string;
  stock: number;
  sku: string;
}

interface ProductData {
  id: string;
  name: string;
  image: string;
  stock: number;
  variableProducts?: VariableProduct[];
}

/**
 * Transform products with variants into stock view rows
 * Groups by color and maps stock to size columns
 */
function transformProductWithVariants(product: ProductData): StockViewRow[] {
  const rows: StockViewRow[] = [];

  if (!product.variableProducts || product.variableProducts.length === 0) {
    return [];
  }

  // Group variants by color
  const variantsByColor = product.variableProducts.reduce((acc, variant) => {
    const color = variant.color || 'No Color';
    console.log(`  🎨 Variant: ${variant.name}, Color: "${color}", Size: "${variant.size}", Stock: ${variant.stock}`);
    if (!acc[color]) {
      acc[color] = [];
    }
    acc[color].push(variant);
    return acc;
  }, {} as Record<string, VariableProduct[]>);

  console.log(`  📊 Grouped into ${Object.keys(variantsByColor).length} color groups:`, Object.keys(variantsByColor));

  // Create a row for each color
  Object.entries(variantsByColor).forEach(([color, variants]) => {
    const stockBySize: StockBySize = {};
    let totalStock = 0;

    // Map each variant's stock to its size
    variants.forEach((variant) => {
      const size = (variant.size?.toUpperCase() || '') as SizeOption;
      if (ALL_SIZES.includes(size)) {
        // If multiple variants have same size, sum the stock
        stockBySize[size] = (stockBySize[size] || 0) + variant.stock;
      }
      totalStock += variant.stock;
    });

    rows.push({
      id: `${product.id}-${color}`,
      productId: product.id,
      productName: product.name || 'Unknown Product',
      productImage: product.image || 'https://placehold.co/600x400.png',
      color,
      stockBySize,
      totalStock,
      hasVariants: true,
    });
  });

  return rows;
}

/**
 * Transform product without variants into stock view row
 * Shows only total stock
 */
function transformProductWithoutVariants(product: ProductData): StockViewRow {
  return {
    id: product.id,
    productId: product.id,
    productName: product.name || 'Unknown Product',
    productImage: product.image || 'https://placehold.co/600x400.png',
    color: 'Base Product',
    stockBySize: {}, // No size-based stock
    totalStock: product.stock || 0,
    hasVariants: false,
  };
}

/**
 * Main transformation function
 * Converts product list to stock view format
 */
export function transformToStockView(products: ProductData[]): StockViewRow[] {
  const rows: StockViewRow[] = [];

  console.log('🔄 Transforming to stock view, products count:', products.length);

  products.forEach((product) => {
    if (product.variableProducts && product.variableProducts.length > 0) {
      // Product has variants - create multiple rows (one per color)
      console.log(`📦 Product "${product.name}" has ${product.variableProducts.length} variants`);
      const variantRows = transformProductWithVariants(product);
      console.log(`✅ Generated ${variantRows.length} stock view rows for "${product.name}"`);
      rows.push(...variantRows);
    } else {
      // Product has no variants - create single row
      const baseRow = transformProductWithoutVariants(product);
      rows.push(baseRow);
    }
  });

  console.log('📊 Total stock view rows:', rows.length);
  console.log('📊 Sample row:', rows[0]);

  return rows;
}
