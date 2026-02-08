"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useContextElement } from "@/context/Context";

export default function QuickAdd() {
  const {
    quickAddItem,
    addProductToCart,
    isAddedToCartProducts,
    addToCompareItem,
    isAddedtoCompareItem,
  } = useContextElement();

  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [availableColors, setAvailableColors] = useState([]);
  const [availableSizes, setAvailableSizes] = useState([]);

  // Get base URL for images
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "";

  // No need for pre-initialization - ProductCard handles opening programmatically

  // Reset state when product changes
  useEffect(() => {
    if (!quickAddItem) return;

    // Debug: Log product data to console (only if stock is undefined)
    if (quickAddItem.stock === undefined) {
      console.warn("Quick Add: Product stock is undefined!", {
        id: quickAddItem.id,
        name: quickAddItem.name,
        hasVariants: quickAddItem.variableProducts?.length > 0,
        product: quickAddItem,
      });
    }

    // Check if product has variants
    const hasVariants =
      quickAddItem.variableProducts &&
      quickAddItem.variableProducts.length > 0;

    if (hasVariants) {
      // Extract unique colors from variants
      const colors = getUniqueColors(quickAddItem.variableProducts);
      setAvailableColors(colors);

      // Find first available (in-stock) color, or fallback to first color
      const firstAvailableColor = colors.find(color => {
        const sizesForColor = getSizesForColor(quickAddItem.variableProducts, color.value);
        return sizesForColor.some(size => size.available);
      }) || colors[0];

      // Set first available color as default
      if (firstAvailableColor) {
        setSelectedColor(firstAvailableColor);
      }

      // Extract sizes for the selected color
      const sizesForFirstColor = getSizesForColor(
        quickAddItem.variableProducts,
        firstAvailableColor?.value
      );
      setAvailableSizes(sizesForFirstColor);

      // Find first available (in-stock) size, or fallback to first size
      const firstAvailableSize = sizesForFirstColor.find(size => size.available) || sizesForFirstColor[0];

      // Set first available size as default
      if (firstAvailableSize) {
        setSelectedSize(firstAvailableSize);
      }

      // Find and set the matching variant
      const variant = findMatchingVariant(
        quickAddItem.variableProducts,
        firstAvailableColor?.value,
        firstAvailableSize?.value
      );
      setSelectedVariant(variant);
    } else {
      // Simple product without variants
      setAvailableColors([]);
      setAvailableSizes([]);
      setSelectedVariant(null);
      setSelectedColor(null);
      setSelectedSize(null);
    }

    // Reset quantity
    setQuantity(1);
  }, [quickAddItem]);

  // Update sizes when color changes
  useEffect(() => {
    if (!quickAddItem || !selectedColor) return;

    const hasVariants =
      quickAddItem.variableProducts &&
      quickAddItem.variableProducts.length > 0;

    if (hasVariants) {
      const sizes = getSizesForColor(
        quickAddItem.variableProducts,
        selectedColor.value
      );
      setAvailableSizes(sizes);

      // Set first available size
      if (sizes.length > 0) {
        setSelectedSize(sizes[0]);
      }
    }
  }, [selectedColor, quickAddItem]);

  // Update variant when color or size changes
  useEffect(() => {
    if (!quickAddItem || !selectedColor || !selectedSize) return;

    const hasVariants =
      quickAddItem.variableProducts &&
      quickAddItem.variableProducts.length > 0;

    if (hasVariants) {
      const variant = findMatchingVariant(
        quickAddItem.variableProducts,
        selectedColor.value,
        selectedSize.value
      );
      setSelectedVariant(variant);
    }
  }, [selectedColor, selectedSize, quickAddItem]);

  // Helper function to get unique colors from variants
  const getUniqueColors = (variants) => {
    const colorMap = new Map();

    variants.forEach((variant) => {
      const color =
        variant.specifications?.color || variant.name?.split("-")[0]?.trim();
      if (color && !colorMap.has(color)) {
        // Get the first image for this variant
        const variantImage = variant.images?.[0];
        colorMap.set(color, {
          value: color,
          className: `bg-${color.toLowerCase().replace(/\s+/g, "-")}`,
          image: variantImage,
        });
      }
    });

    return Array.from(colorMap.values());
  };

  // Helper function to get sizes for a specific color
  const getSizesForColor = (variants, colorValue) => {
    if (!colorValue) return [];

    const sizeMap = new Map();

    variants
      .filter((variant) => {
        const variantColor =
          variant.specifications?.color ||
          variant.name?.split("-")[0]?.trim();
        return variantColor === colorValue;
      })
      .forEach((variant) => {
        const size =
          variant.specifications?.size || variant.name?.split("-")[1]?.trim();
        if (size && !sizeMap.has(size)) {
          // Ensure stock is treated as a number
          const stock = Number(variant.stock) || 0;
          sizeMap.set(size, {
            value: size,
            available: stock > 0,
            stock: stock,
          });
        }
      });

    return Array.from(sizeMap.values());
  };

  // Helper function to find matching variant
  const findMatchingVariant = (variants, colorValue, sizeValue) => {
    return variants.find((variant) => {
      const variantColor =
        variant.specifications?.color || variant.name?.split("-")[0]?.trim();
      const variantSize =
        variant.specifications?.size || variant.name?.split("-")[1]?.trim();
      return variantColor === colorValue && variantSize === sizeValue;
    });
  };

  // Get display image
  const getDisplayImage = () => {
    if (!quickAddItem) return "/images/default-product.jpg";

    // If variant selected and has images, use variant image
    if (selectedVariant?.images?.[0]) {
      const image = selectedVariant.images[0];
      return image.path ? `${baseUrl}/${image.path}` : quickAddItem.imgSrc;
    }

    // Otherwise use product main image
    if (quickAddItem.images?.[0]?.path) {
      return `${baseUrl}/${quickAddItem.images[0].path}`;
    }

    // Fallback to imgSrc if available
    return quickAddItem.imgSrc || "/images/default-product.jpg";
  };

  // Get display price
  const getDisplayPrice = () => {
    if (selectedVariant) {
      return selectedVariant.salePrice || selectedVariant.price;
    }
    return quickAddItem?.salePrice || quickAddItem?.price || 0;
  };

  // Get original price (for strikethrough)
  const getOriginalPrice = () => {
    if (selectedVariant && selectedVariant.salePrice) {
      return selectedVariant.price;
    }
    if (quickAddItem?.salePrice) {
      return quickAddItem.price;
    }
    return null;
  };

  // Get stock availability
  const getStock = () => {
    const hasVariants =
      quickAddItem?.variableProducts &&
      quickAddItem.variableProducts.length > 0;

    // For products with variants, check the selected variant's stock
    if (hasVariants && selectedVariant) {
      return Number(selectedVariant.stock) || 0;
    }

    // For simple products without variants, check the product's stock
    if (!hasVariants) {
      return Number(quickAddItem?.stock) || 0;
    }

    // If product has variants but none selected yet, return 0 (we need variant selection)
    return 0;
  };

  // Check if out of stock
  const isOutOfStock = () => {
    const stock = getStock();
    return stock <= 0;
  };

  // Handle add to cart
  const handleAddToCart = () => {
    if (!quickAddItem || isOutOfStock()) return;

    const hasVariants =
      quickAddItem.variableProducts &&
      quickAddItem.variableProducts.length > 0;

    let cartItem;

    if (hasVariants && selectedVariant) {
      // Add variant to cart
      cartItem = {
        id: selectedVariant.id,
        name: quickAddItem.name,
        price: selectedVariant.salePrice || selectedVariant.price,
        quantity: quantity,
        stock: selectedVariant.stock,
        images: selectedVariant.images,
        specifications: {
          ...selectedVariant.specifications,
          color: selectedColor?.value,
          size: selectedSize?.value,
        },
        sku: selectedVariant.sku,
        isVariant: true,
        parentProductId: quickAddItem.id,
      };
    } else {
      // Add simple product to cart
      cartItem = {
        id: quickAddItem.id,
        name: quickAddItem.name,
        price: quickAddItem.salePrice || quickAddItem.price,
        quantity: quantity,
        stock: quickAddItem.stock,
        images: quickAddItem.images,
        specifications: quickAddItem.specifications || {},
        isVariant: false,
      };
    }

    addProductToCart(cartItem, quantity);
  };

  // Quantity handlers
  const increaseQuantity = () => {
    const stock = getStock();
    if (quantity < stock) {
      setQuantity(quantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  if (!quickAddItem) {
    return null;
  }

  const hasVariants =
    quickAddItem.variableProducts && quickAddItem.variableProducts.length > 0;
  const displayPrice = getDisplayPrice();
  const originalPrice = getOriginalPrice();
  const outOfStock = isOutOfStock();

  return (
    <div
      className="modal fade modalDemo"
      id="quick_add"
      tabIndex={-1}
      aria-labelledby="quickAddLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="header">
            <span
              className="icon-close icon-close-popup"
              onClick={() => {
                const modalElement = document.getElementById('quick_add');
                if (modalElement) {
                  try {
                    if (window.bootstrap?.Modal) {
                      const modalInstance = window.bootstrap.Modal.getInstance(modalElement);
                      if (modalInstance) {
                        modalInstance.hide();
                      }
                    } else {
                      // Fallback close
                      modalElement.classList.remove('show');
                      modalElement.style.display = 'none';
                      document.body.classList.remove('modal-open');
                      const backdrop = document.getElementById('quick-add-backdrop');
                      if (backdrop) {
                        backdrop.remove();
                      }
                    }
                  } catch (error) {
                    console.error('Error closing modal:', error);
                  }
                }
              }}
              style={{ cursor: 'pointer' }}
            />
          </div>
          <div className="wrap">
            <div className="tf-product-info-item">
              <div className="image">
                <Image
                  alt={quickAddItem.name || "Product"}
                  style={{ objectFit: "contain" }}
                  src={getDisplayImage()}
                  width={720}
                  height={1005}
                />
              </div>
              <div className="content">
                <Link href={`/product-detail/${quickAddItem.id}`}>
                  {quickAddItem.name || quickAddItem.title}
                </Link>
                <div className="tf-product-info-price">
                  <div className="price">
                    {originalPrice && (
                      <span className="price-old text-decoration-line-through me-2">
                        {originalPrice.toFixed(2)} TK
                      </span>
                    )}
                    <span className={originalPrice ? "price-sale" : ""}>
                      {displayPrice.toFixed(2)} TK
                    </span>
                  </div>
                </div>
                {selectedVariant?.sku && (
                  <div className="text-muted small mt-1">
                    SKU: {selectedVariant.sku}
                  </div>
                )}
                {outOfStock && (
                  <div className="text-danger small mt-1">
                    <strong>Out of Stock</strong>
                  </div>
                )}
              </div>
            </div>

            {/* Color Selection */}
            {hasVariants && availableColors.length > 0 && (
              <div className="tf-product-info-variant-picker mb_15">
                <div className="variant-picker-item">
                  <div className="variant-picker-label">
                    Color:
                    <span className="fw-6 variant-picker-label-value">
                      {selectedColor?.value || ""}
                    </span>
                  </div>
                  <div className="variant-picker-values">
                    {availableColors.map((color, index) => (
                      <React.Fragment key={index}>
                        <input
                          type="radio"
                          name="color1"
                          readOnly
                          checked={selectedColor?.value === color.value}
                        />
                        <label
                          onClick={() => setSelectedColor(color)}
                          className="hover-tooltip radius-60"
                          data-value={color.value}
                          style={{ cursor: "pointer" }}
                        >
                          <span className={`btn-checkbox ${color.className}`} />
                          <span className="tooltip">{color.value}</span>
                        </label>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Size Selection */}
            {hasVariants && availableSizes.length > 0 && (
              <div className="tf-product-info-variant-picker mb_15">
                <div className="variant-picker-item">
                  <div className="variant-picker-label">
                    Size:{" "}
                    <span className="fw-6 variant-picker-label-value">
                      {selectedSize?.value || ""}
                    </span>
                  </div>
                  <div className="variant-picker-values">
                    {availableSizes.map((size, index) => (
                      <React.Fragment key={index}>
                        <input
                          type="radio"
                          name="size1"
                          readOnly
                          checked={selectedSize?.value === size.value}
                          disabled={!size.available}
                        />
                        <label
                          onClick={() =>
                            size.available && setSelectedSize(size)
                          }
                          className="style-text"
                          data-value={size.value}
                          style={{
                            cursor: size.available ? "pointer" : "not-allowed",
                            opacity: size.available ? 1 : 0.5,
                          }}
                        >
                          <p>{size.value}</p>
                        </label>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Quantity Selection */}
            <div className="tf-product-info-quantity mb_15">
              <div className="quantity-title fw-6">Quantity</div>
              <div className="wg-quantity">
                <span
                  className="btn-quantity minus-btn"
                  onClick={decreaseQuantity}
                >
                  -
                </span>
                <input
                  type="text"
                  name="number"
                  value={quantity}
                  readOnly
                  className="quantity-product"
                />
                <span
                  className="btn-quantity plus-btn"
                  onClick={increaseQuantity}
                >
                  +
                </span>
              </div>
              {!outOfStock && (
                <div className="text-muted small mt-1">
                  {getStock()} items available
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="tf-product-info-buy-button">
              <form onSubmit={(e) => e.preventDefault()} className="">
                <button
                  type="button"
                  className="tf-btn btn-fill justify-content-center fw-6 fs-16 flex-grow-1 animate-hover-btn"
                  onClick={handleAddToCart}
                  disabled={outOfStock}
                  style={{
                    opacity: outOfStock ? 0.5 : 1,
                    cursor: outOfStock ? "not-allowed" : "pointer",
                  }}
                >
                  <span>
                    {outOfStock
                      ? "Out of Stock"
                      : isAddedToCartProducts(
                          selectedVariant?.id || quickAddItem.id
                        )
                      ? "Already Added ("
                      : "Add to cart ("}
                  </span>
                  {!outOfStock && (
                    <span className="tf-qty-price">
                      {displayPrice.toFixed(2)} TK)
                    </span>
                  )}
                </button>
                {/* <a
                  href="#compare"
                  data-bs-toggle="offcanvas"
                  aria-controls="offcanvasLeft"
                  onClick={() =>
                    addToCompareItem(selectedVariant?.id || quickAddItem.id)
                  }
                  className="tf-product-btn-wishlist box-icon bg_white compare btn-icon-action"
                >
                  <span className="icon icon-compare" />
                  <span className="icon icon-check" />
                </a> */}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
