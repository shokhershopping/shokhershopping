"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useContextElement } from "@/context/Context";
// import CountdownComponent from "../common/Countdown";
export const ProductCard = ({ product }) => {
  const [currentImage, setCurrentImage] = useState(product.imgSrc);
  const { setQuickViewItem } = useContextElement();
  const {
    addProductToCart,
    setQuickAddItem,
    addToWishlist,
    isAddedtoWishlist,
    removeFromWishlist,
    addToCompareItem,
    isAddedtoCompareItem,
  } = useContextElement();
  useEffect(() => {
    setCurrentImage(product.imgSrc);
  }, [product]);

  const handleWishlistToggle = () => {
    const wishlistProduct = {
      ...product,
      id: product.id, // Ensure ID is set
    };
    if (isAddedtoWishlist(product.id)) {
      removeFromWishlist(wishlistProduct);
    } else {
      addToWishlist(wishlistProduct);
    }
  };
  return (
    <div className="card-product fl-item" key={product.id}>
      <div className="card-product-wrapper">
        <Link href={`/product-detail/${product.id}`} className="product-img">
          <Image
            key={currentImage}
            className="img-product"
            src={currentImage}
            alt="image-product"
            width={720}
            height={1005}
          />
          <Image
            className="lazyload img-hover"
            data-src={
              product.imgHoverSrc ? product.imgHoverSrc : product.imgSrc
            }
            src={product.imgHoverSrc ? product.imgHoverSrc : product.imgSrc}
            alt="image-product"
            width={720}
            height={1005}
          />
        </Link>
        {product.soldOut ? (
          <div className="sold-out">
            <span>Sold out</span>
          </div>
        ) : (
          <>
            <div className="list-product-btn">
              <a
                href="#quick_add"
                onClick={(e) => {
                  e.preventDefault();
                  setQuickAddItem(product);
                  // Open modal programmatically
                  setTimeout(() => {
                    const modalElement = document.getElementById('quick_add');
                    if (modalElement) {
                      try {
                        // Try to use Bootstrap if available
                        if (typeof window !== 'undefined' && window.bootstrap?.Modal) {
                          let modalInstance = window.bootstrap.Modal.getInstance(modalElement);
                          if (!modalInstance) {
                            modalInstance = new window.bootstrap.Modal(modalElement);
                          }
                          modalInstance.show();
                        } else {
                          // Fallback: use data-bs-toggle
                          modalElement.classList.add('show');
                          modalElement.style.display = 'block';
                          document.body.classList.add('modal-open');
                          const backdrop = document.createElement('div');
                          backdrop.className = 'modal-backdrop fade show';
                          backdrop.id = 'quick-add-backdrop';
                          document.body.appendChild(backdrop);
                        }
                      } catch (error) {
                        // Silently handle modal open error
                      }
                    }
                  }, 50);
                }}
                className="box-icon bg_white quick-add tf-btn-loading"
              >
                <span className="icon icon-bag" />
                <span className="tooltip">Quick Add</span>
              </a>
              <a
                onClick={handleWishlistToggle}
                className="box-icon bg_white wishlist btn-icon-action"
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
            {product.sizes && (
              <div className="size-list">
                {product.sizes.map((size) => (
                  <span key={size}>{size}</span>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      <div className="card-product-info">
        <Link href={`/product-detail/${product.id}`} className="title link">
          {product.title}
        </Link>
        <span className="price">{product.salePrice} TK</span>
        {product.colors && (
          <ul className="list-color-product">
            {product.colors.map((color, i) => (
              <li
                className={`list-color-item color-swatch ${
                  currentImage === color.imgSrc ? "active" : ""
                } `}
                key={i}
                onMouseOver={() => setCurrentImage(color.imgSrc)}
              >
                <span className="tooltip">{color.name}</span>
                <span
                  className="swatch-value"
                  style={{ backgroundColor: color.name }}
                />
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
