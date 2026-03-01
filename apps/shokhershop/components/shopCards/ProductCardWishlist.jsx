"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useContextElement } from "@/context/Context";
import CountdownComponent from "../common/Countdown";
import { getImageUrl } from "@/lib/getImageUrl";

export const ProductCardWishlist = ({ product }) => {
  // Handle both structures: product.product (wishlist item) or direct product
  const wishProduct = product?.product || product;

  // Support both Firestore wishlist item fields and full product fields
  const productId = wishProduct?.productId || wishProduct?.id;
  const productName = wishProduct?.productName || wishProduct?.name || '';
  const productPrice = wishProduct?.productPrice || wishProduct?.salePrice || wishProduct?.price || 0;
  const productImage = wishProduct?.productImageUrl || wishProduct?.images?.[0]?.path || '';
  const productHoverImage = wishProduct?.images?.[1]?.path || productImage;

  const [currentImage, setCurrentImage] = useState(productImage);
  const [hoverImage, setHoverImage] = useState(productHoverImage);

  const { setQuickViewItem } = useContextElement();
  const {
    setQuickAddItem,
    addToWishlist,
    isAddedtoWishlist,
    removeFromWishlist,
    addToCompareItem,
    isAddedtoCompareItem,
  } = useContextElement();

  // Safety check after hooks - don't render if no valid product
  if (!wishProduct || !productId) {
    return null;
  }

  return (
    <div className="card-product fl-item" key={product.id}>
      <div className="card-product-wrapper">
        <Link
          href={`/product-detail/${productId}`}
          className="product-img"
        >
          <Image
            className="lazyload img-product"
            data-src={getImageUrl(currentImage)}
            src={getImageUrl(currentImage)}
            alt="image-product"
            width={720}
            height={1005}
          />
          <Image
            className="lazyload img-hover"
            data-src={getImageUrl(hoverImage)}
            src={getImageUrl(hoverImage)}
            alt="image-product"
            width={720}
            height={1005}
          />
        </Link>
        <div className="list-product-btn type-wishlist">
          <a
            onClick={(e) => {
              e.preventDefault();
              // Pass the actual product object, not the wishlist item wrapper
              removeFromWishlist(wishProduct);
            }}
            className="box-icon bg_white wishlist"
            style={{ cursor: "pointer" }}
          >
            <span className="tooltip">Remove Wishlist</span>
            <span className="icon icon-delete" />
          </a>
        </div>

        <div className="list-product-btn">
          <a
            href="#quick_add"
            onClick={() => setQuickAddItem(product)}
            data-bs-toggle="modal"
            className="box-icon bg_white quick-add tf-btn-loading"
          >
            <span className="icon icon-bag" />
            <span className="tooltip">Quick Add</span>
          </a>
          {/* <a
            onClick={() => addToWishlist(product.id)}
            className="box-icon bg_white wishlist btn-icon-action"
          >
            <span
              className={`icon icon-heart ${
                isAddedtoWishlist(product.id) ? "added" : ""
              }`}
            />
            <span className="tooltip">
              {isAddedtoWishlist(wishProduct.id)
                ? "Already Wishlisted"
                : "Add to Wishlist"}
            </span>
            <span className="icon icon-delete" />
          </a> */}
          {/* <a
            href="#compare"
            data-bs-toggle="offcanvas"
            aria-controls="offcanvasLeft"
            onClick={() => addToCompareItem(product.id)}
            className="box-icon bg_white compare btn-icon-action"
          >
            <span
              className={`icon icon-compare ${
                isAddedtoCompareItem(product.id) ? "added" : ""
              }`}
            />
            <span className="tooltip">
              {" "}
              {isAddedtoCompareItem(product.id)
                ? "Already Compared"
                : "Add to Compare"}
            </span>
            <span className="icon icon-check" />
          </a> */}
          {/* <a
            href="#quick_view"
            onClick={() => setQuickViewItem(product)}
            data-bs-toggle="modal"
            className="box-icon bg_white quickview tf-btn-loading"
          >
            <span className="icon icon-view" />
            <span className="tooltip">Quick View</span>
          </a> */}
        </div>
        {/* {product.countdown && (
          <div className="countdown-box">
            <div className="js-countdown">
              <CountdownComponent />
            </div>
          </div>
        )} */}
        {wishProduct.sizes && (
          <div className="size-list">
            {wishProduct.sizes.map((size) => (
              <span key={size}>{size}</span>
            ))}
          </div>
        )}
      </div>
      <div className="card-product-info">
        <Link href={`/product-detail/${productId}`} className="title link">
          {productName}
        </Link>
        <span className="price">TK {productPrice}</span>
        {product.colors && (
          <ul className="list-color-product">
            {product.colors.map((color) => (
              <li
                className={`list-color-item color-swatch ${
                  currentImage == color.imgSrc ? "active" : ""
                } `}
                key={color.name}
                onMouseOver={() => setCurrentImage(color.imgSrc)}
              >
                <span className="tooltip">{color.name}</span>
                <span className={`swatch-value ${color.colorClass}`} />
                <Image
                  className="lazyload"
                  data-src={color.imgSrc}
                  src={color.imgSrc}
                  alt="image-product"
                  width={720}
                  height={1005}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
