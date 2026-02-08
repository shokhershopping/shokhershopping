"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import CountdownComponent from "../common/Countdown";
import { paymentImages, sizeOptions } from "@/data/singleProductOptions";
import StickyItem from "./StickyItem";
import Quantity from "./Quantity";
import Slider1ZoomOuter from "./sliders/Slider1ZoomOuter";
import { useContextElement } from "@/context/Context";
import { openCartModal } from "@/utlis/openCartModal";

export default function DetailsOuterZoom({ product }) {
  const variantColors =
    product.variableProducts?.map((variant) => ({
      value: variant.specifications?.color,
      className: variant.specifications?.color?.toLowerCase(),
      variantId: variant.id,
      colorValue:
        variant.specifications?.colorValue ||
        variant.specifications?.color?.toLowerCase(),
    })) || [];

  const colorWiseVariantSizes = product.variableProducts?.reduce(
    (acc, variant) => {
      const color = variant.specifications?.color?.toLowerCase();
      if (!acc[color]) {
        acc[color] = [];
      }
      acc[color].push({
        id: variant.id,
        value: variant.specifications?.size,
      });
      return acc;
    },
    {}
  );

  console.log("Variant colors:", variantColors);
  console.log("Color-wise variant sizes:", colorWiseVariantSizes);

  // Set initial color from first variant or product specs
  const initialColor = variantColors[0] || {
    value: product.specifications?.color,
    className: product.specifications?.color?.toLowerCase(),
    variantId: product.id,
    colorValue:
      product.specifications?.colorValue ||
      product.specifications?.color?.toLowerCase(),
  };

  // Set initial size based on first color's first size
  const initialSize = colorWiseVariantSizes[
    initialColor.value.toLowerCase()
  ]?.[0] || {
    id: product.id || "default-size",
    value: product.specifications?.size || "M",
  };

  const [currentColor, setCurrentColor] = useState(initialColor);
  const [currentSize, setCurrentSize] = useState(initialSize);
  const [quantity, setQuantity] = useState(1);

  // Update selected size when color changes
  useEffect(() => {
    if (variantColors.length > 0) {
      const sizesForColor =
        colorWiseVariantSizes[currentColor.value.toLowerCase()];
      if (sizesForColor && sizesForColor.length > 0) {
        setCurrentSize(sizesForColor[0]);
      }
    }
  }, [currentColor, variantColors.length]);

  // Find selected variant based on color
  // const selectedVariant =
  //   product.variableProducts?.find(
  //     (v) =>
  //       v.specifications?.color?.toLowerCase() ===
  //       currentColor.value?.toLowerCase()
  //   ) || product;

  // Find selected variant based on color and size
  const selectedVariant =
    product.variableProducts?.find((v) => v.id === currentSize.id) || product;

  console.log("Selected variant:", selectedVariant);

  // Get all variant images (from all color variants)
  const allVariantImages =
    product.variableProducts?.flatMap((variant) =>
      variant.images?.map((img) => ({
        ...img,
        color: variant.specifications?.color,
        variantId: variant.id,
      }))
    ) || [];

  // Get images for currently selected color variant only
  const currentVariantImages = selectedVariant.images || [];

  const handleColorChange = (color) => {
    const selected = variantColors.find(
      (c) => c.value?.toLowerCase() === color.toLowerCase()
    );
    if (selected) {
      setCurrentColor(selected);
    }
  };

  const handleSizeChange = (size) => {
    setCurrentSize(size);
  };

  // Get price from selected variant or main product
  const displayPrice =
    selectedVariant?.salePrice ||
    selectedVariant?.price ||
    product.salePrice ||
    product.price;
  const originalPrice = selectedVariant?.price || product.price;
  const discountPercentage = Math.round(
    ((originalPrice - displayPrice) / originalPrice) * 100
  );

  const {
    addProductToCart,
    isAddedToCartProducts,
    addToCompareItem,
    isAddedtoCompareItem,
    removeFromWishlist,
    addToWishlist,
    isAddedtoWishlist,
    setShareProduct,
  } = useContextElement();

  const handleAddToCart = () => {
    // Create a cart-ready product object
    const cartProduct = {
      ...selectedVariant,
      name: product.name, // Keep parent product name
      price: displayPrice,
      specifications: {
        ...selectedVariant.specifications,
        size: currentSize.value,
        color: currentColor.value,
      },
    };

    addProductToCart(cartProduct, quantity);
  };

  const handleWishlistToggle = () => {
    const wishlistProduct = {
      ...product,
      id: product.id, // Ensure ID is set
      selectedVariant: selectedVariant,
      selectedColor: currentColor,
      selectedSize: currentSize,
      price: displayPrice,
      images: currentVariantImages,
    };
    if (isAddedtoWishlist(product.id)) {
      removeFromWishlist(wishlistProduct);
    } else {
      addToWishlist(wishlistProduct);
    }
  };

  return (
    <section className="flat-spacing-4 pt_0">
      <div className="tf-main-product section-image-zoom">
        <div className="container">
          <div className="row">
            <div className="col-md-6">
              <div className="tf-product-media-wrap sticky-top">
                <div className="thumbs-slider">
                  <Slider1ZoomOuter
                    handleColor={handleColorChange}
                    currentColor={currentColor.value}
                    allImages={allVariantImages}
                    currentVariantImages={currentVariantImages}
                  />
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="tf-product-info-wrap position-relative">
                <div className="tf-zoom-main" />
                <div className="tf-product-info-list other-image-zoom">
                  <div className="tf-product-info-title">
                    <h5>{product.name}</h5>
                  </div>
                  {/* SKU Display */}
                  {(selectedVariant?.sku || product.sku) && (
                    <div className="tf-product-info-meta">
                      <div className="meta-item">
                        <span className="text-muted">SKU: </span>
                        <span className="fw-6">{selectedVariant?.sku || product.sku}</span>
                      </div>
                    </div>
                  )}
                  <div className="tf-product-info-badges">
                    <div className="badges">Best seller</div>
                    <div className="product-status-content">
                      <i className="icon-lightning" />
                      <p className="fw-6">
                        Selling fast! 56 people have this in their carts.
                      </p>
                    </div>
                  </div>
                  {/* Price Section */}
                  <div className="tf-product-info-price">
                    <div className="price-on-sale">
                      TK {displayPrice.toFixed(2)}
                    </div>
                    {displayPrice < originalPrice && (
                      <div className="compare-at-price">
                        TK{originalPrice.toFixed(2)}
                      </div>
                    )}
                    {discountPercentage > 0 && (
                      <div className="badges-on-sale">
                        <span>{discountPercentage}</span>% OFF
                      </div>
                    )}
                  </div>
                  <div className="tf-product-info-countdown">
                    <div className="countdown-wrap">
                      <div className="countdown-title">
                        <i className="icon-time tf-ani-tada" />
                        <p>HURRY UP! SALE ENDS IN:</p>
                      </div>
                      <div className="tf-countdown style-1">
                        <div className="js-countdown">
                          <CountdownComponent labels="Days :,Hours :,Mins :,Secs" />
                        </div>
                      </div>
                    </div>
                  </div>
                  {variantColors.length > 0 && (
                    <div className="variant-picker-item">
                      <div className="variant-picker-label">
                        COLOR:{" "}
                        <span className="fw-6 variant-picker-label-value">
                          {currentColor.value?.toUpperCase()}
                        </span>
                      </div>
                      <form className="variant-picker-values">
                        {variantColors.map((color) => (
                          <React.Fragment key={color.variantId}>
                            <input
                              id={`color-${color.variantId}`}
                              type="radio"
                              name="color"
                              readOnly
                              checked={currentColor.value === color.value}
                              onChange={() => handleColorChange(color.value)}
                            />
                            <label
                              onClick={() => setCurrentColor(color)}
                              className="hover-tooltip radius-60"
                              htmlFor={`color-${color.variantId}`}
                              data-value={color.value}
                            >
                              <span
                                className="btn-checkbox"
                                style={{ backgroundColor: color.colorValue }}
                              ></span>
                              <span className="tooltip">
                                {color.value?.toUpperCase()}
                              </span>
                            </label>
                          </React.Fragment>
                        ))}
                      </form>
                    </div>
                  )}

                  <div className="variant-picker-item">
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="variant-picker-label">
                        Size:{" "}
                        <span className="fw-6 variant-picker-label-value">
                          {currentSize.value}
                        </span>
                      </div>
                      <a
                        href="#find_size"
                        data-bs-toggle="modal"
                        className="find-size fw-6"
                      >
                        Find your size
                      </a>
                    </div>
                    <form className="variant-picker-values">
                      {colorWiseVariantSizes[
                        currentColor.value.toLowerCase()
                      ]?.map((size) => (
                        <React.Fragment key={size.id}>
                          <input
                            type="radio"
                            name="size"
                            id={`size-${size.id}`}
                            checked={currentSize.id === size.id}
                            onChange={() => handleSizeChange(size)}
                          />
                          <label
                            className="style-text"
                            htmlFor={`size-${size.id}`}
                          >
                            <p>{size.value}</p>
                          </label>
                        </React.Fragment>
                      ))}
                    </form>
                  </div>
                  <div className="tf-product-info-quantity">
                    <div className="quantity-title fw-6">Quantity</div>
                    <Quantity setQuantity={setQuantity} />
                  </div>
                  {/* Add to Cart Section */}
                  <div className="tf-product-info-buy-button">
                    <form onSubmit={(e) => e.preventDefault()}>
                      <a
                        onClick={() => {
                          handleAddToCart();
                          openCartModal();
                        }}
                        className="tf-btn btn-fill justify-content-center fw-6 fs-16 flex-grow-1 animate-hover-btn"
                      >
                        <span>
                          {isAddedToCartProducts(selectedVariant.id)
                            ? "Already Added"
                            : "Add to cart"}{" "}
                          -
                        </span>
                        <span className="tf-qty-price">
                          TK{(displayPrice * quantity).toFixed(2)}
                        </span>
                      </a>
                      {/* Wishlist and Compare buttons */}
                      <a
                        onClick={handleWishlistToggle}
                        className="tf-product-btn-wishlist hover-tooltip box-icon bg_white wishlist btn-icon-action"
                      >
                        <span
                          className={`icon icon-heart ${
                            isAddedtoWishlist(product.id) ? "added" : ""
                          }`}
                        />
                        <span className="tooltip">
                          {isAddedtoWishlist(product.id)
                            ? "Remove from Wishlist"
                            : "Add to Wishlist"}
                        </span>
                      </a>
                      <div className="w-100">
                        <a
                          onClick={handleAddToCart}
                          href="/checkout"
                          className="btns-full"
                        >
                          Buy Now
                        </a>
                        {/* <a href="/checkout" className="payment-more-option">
                          More payment options
                        </a> */}
                      </div>
                    </form>
                  </div>
                  <div className="tf-product-info-extra-link">
                    <a
                      href="#compare_color"
                      data-bs-toggle="modal"
                      className="tf-product-extra-icon"
                    >
                      <div className="icon">
                        <Image
                          alt="image"
                          src="/images/item/compare.svg"
                          width={20}
                          height={20}
                        />
                      </div>
                      <div className="text fw-6">Compare color</div>
                    </a>
                    <a
                      href="#ask_question"
                      data-bs-toggle="modal"
                      className="tf-product-extra-icon"
                    >
                      <div className="icon">
                        <i className="icon-question" />
                      </div>
                      <div className="text fw-6">Ask a question</div>
                    </a>
                    <a
                      href="#delivery_return"
                      data-bs-toggle="modal"
                      className="tf-product-extra-icon"
                    >
                      <div className="icon">
                        <svg
                          className="d-inline-block"
                          xmlns="http://www.w3.org/2000/svg"
                          width={22}
                          height={18}
                          viewBox="0 0 22 18"
                          fill="currentColor"
                        >
                          <path d="M21.7872 10.4724C21.7872 9.73685 21.5432 9.00864 21.1002 8.4217L18.7221 5.27043C18.2421 4.63481 17.4804 4.25532 16.684 4.25532H14.9787V2.54885C14.9787 1.14111 13.8334 0 12.4255 0H9.95745V1.69779H12.4255C12.8948 1.69779 13.2766 2.07962 13.2766 2.54885V14.5957H8.15145C7.80021 13.6052 6.85421 12.8936 5.74468 12.8936C4.63515 12.8936 3.68915 13.6052 3.33792 14.5957H2.55319C2.08396 14.5957 1.70213 14.2139 1.70213 13.7447V2.54885C1.70213 2.07962 2.08396 1.69779 2.55319 1.69779H9.95745V0H2.55319C1.14528 0 0 1.14111 0 2.54885V13.7447C0 15.1526 1.14528 16.2979 2.55319 16.2979H3.33792C3.68915 17.2884 4.63515 18 5.74468 18C6.85421 18 7.80021 17.2884 8.15145 16.2979H13.423C13.7742 17.2884 14.7202 18 15.8297 18C16.9393 18 17.8853 17.2884 18.2365 16.2979H21.7872V10.4724ZM16.684 5.95745C16.9494 5.95745 17.2034 6.08396 17.3634 6.29574L19.5166 9.14894H14.9787V5.95745H16.684ZM5.74468 16.2979C5.27545 16.2979 4.89362 15.916 4.89362 15.4468C4.89362 14.9776 5.27545 14.5957 5.74468 14.5957C6.21392 14.5957 6.59575 14.9776 6.59575 15.4468C6.59575 15.916 6.21392 16.2979 5.74468 16.2979ZM15.8298 16.2979C15.3606 16.2979 14.9787 15.916 14.9787 15.4468C14.9787 14.9776 15.3606 14.5957 15.8298 14.5957C16.299 14.5957 16.6809 14.9776 16.6809 15.4468C16.6809 15.916 16.299 16.2979 15.8298 16.2979ZM18.2366 14.5957C17.8853 13.6052 16.9393 12.8936 15.8298 12.8936C15.5398 12.8935 15.252 12.943 14.9787 13.04V10.8511H20.0851V14.5957H18.2366Z" />
                        </svg>
                      </div>
                      <div className="text fw-6">Delivery &amp; Return</div>
                    </a>
                    <a
                      href="#share_social"
                      data-bs-toggle="modal"
                      className="tf-product-extra-icon"
                      onClick={() => setShareProduct(product)}
                    >
                      <div className="icon">
                        <i className="icon-share" />
                      </div>
                      <div className="text fw-6">Share</div>
                    </a>
                  </div>
                  <div className="tf-product-info-delivery-return">
                    <div className="row">
                      <div className="col-xl-6 col-12">
                        <div className="tf-product-delivery">
                          <div className="icon">
                            <i className="icon-delivery-time" />
                          </div>
                          <p>
                            Estimate delivery times:
                            <span className="fw-7">
                              {" "}
                              {product.deliveryTime} days
                            </span>
                            {/* <span className="fw-7">
                              3-{product.deliveryTime} days
                            </span>{" "}
                            (United States). */}
                          </p>
                        </div>
                      </div>
                      <div className="col-xl-6 col-12">
                        <div className="tf-product-delivery mb-0">
                          <div className="icon">
                            <i className="icon-return-order" />
                          </div>
                          <p>
                            Return within{" "}
                            <span className="fw-7">
                              {product.returnTime} days
                            </span>{" "}
                            of purchase. Duties &amp; taxes are non-refundable.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* <div className="tf-product-info-trust-seal">
                    <div className="tf-product-trust-mess">
                      <i className="icon-safe" />
                      <p className="fw-6">
                        Guarantee Safe <br />
                        Checkout
                      </p>
                    </div>
                    <div className="tf-payment">
                      {paymentImages.map((image, index) => (
                        <Image
                          key={index}
                          alt={image.alt}
                          src={image.src}
                          width={image.width}
                          height={image.height}
                        />
                      ))}
                    </div>
                  </div> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <StickyItem /> */}
    </section>
  );
}
