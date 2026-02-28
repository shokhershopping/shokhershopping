/**
 * Transform backend product data into the format expected by frontend components.
 *
 * Backend format:
 *   product.imageUrls: string[]
 *   product.variableProducts[].imageUrls: string[]
 *
 * Frontend format:
 *   product.images: [{path, id}]
 *   product.variableProducts[].images: [{path, id, variantId}]
 */

function transformImageUrls(imageUrls, variantId = null) {
  if (!Array.isArray(imageUrls)) return [];
  return imageUrls.map((url, index) => ({
    id: `img-${index}`,
    path: url,
    ...(variantId ? { variantId } : {}),
  }));
}

function safeNumber(val, fallback = 0) {
  const num = Number(val);
  return isNaN(num) ? fallback : num;
}

export function transformProduct(product) {
  if (!product) return product;

  const images = transformImageUrls(product.imageUrls);

  const variableProducts = (product.variableProducts || []).map((variant) => ({
    ...variant,
    price: safeNumber(variant.price, 0),
    salePrice: safeNumber(variant.salePrice, 0),
    images: transformImageUrls(variant.imageUrls, variant.id),
  }));

  return {
    ...product,
    price: safeNumber(product.price, 0),
    salePrice: safeNumber(product.salePrice, 0),
    images,
    variableProducts,
    // Ensure these fields exist for the detail page components
    deliveryTime: product.deliveryTime || '3-5',
    returnTime: product.returnTime || '30',
  };
}

export function transformProducts(products) {
  if (!Array.isArray(products)) return [];
  return products.map(transformProduct);
}
