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

export function transformProduct(product) {
  if (!product) return product;

  const images = transformImageUrls(product.imageUrls);

  const variableProducts = (product.variableProducts || []).map((variant) => ({
    ...variant,
    images: transformImageUrls(variant.imageUrls, variant.id),
  }));

  return {
    ...product,
    images,
    variableProducts,
  };
}

export function transformProducts(products) {
  if (!Array.isArray(products)) return [];
  return products.map(transformProduct);
}
