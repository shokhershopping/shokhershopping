"use client";
import { useContextElement } from "@/context/Context";
import { products1 } from "@/data/products";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { getImageUrl } from "@/lib/getImageUrl";
export default function ShopCart() {
  const { cartProducts, totalPrice, setCartProducts, setQuickViewItem } =
    useContextElement();
  const setQuantity = (id, quantity) => {
    if (quantity >= 1) {
      const item = cartProducts.filter((elm) => elm.id == id)[0];
      const items = [...cartProducts];
      const itemIndex = items.indexOf(item);
      item.quantity = quantity;
      items[itemIndex] = item;
      setCartProducts(items);
    }
  };
  const removeItem = (id) => {
    setCartProducts((pre) => [...pre.filter((elm) => elm.id != id)]);
    toast.success("Removed from cart");
  };
  const getImageSrc = (product) => {
    const imagePath =
      product.images?.[0]?.path ||
      product.imgSrc ||
      null;
    return getImageUrl(imagePath);
  };

  const getVariantText = (product) => {
    const color = product.specifications?.color || "";
    const size = product.specifications?.size || "";

    if (color && size) return `${color}, ${size}`;
    if (color) return color;
    if (size) return size;
    return "";
  };

  const addNoteRef = useRef();
  const addGiftRef = useRef();
  const addShipingRef = useRef();

  const [agree, setAgree] = useState(false); // Track agreement state
  const [error, setError] = useState(false); // Track error state
  const router = useRouter(); // Initialize router
  const handleNavigation = (path) => {
    if (!agree) {
      setError(true);
      return;
    }
    router.push(path);
  };
  return (
    <div className="modal fullRight fade modal-shopping-cart" id="shoppingCart">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="header">
            <div className="title fw-5">Shopping cart</div>
            <span
              className="icon-close icon-close-popup"
              data-bs-dismiss="modal"
            />
          </div>
          <div className="wrap">
            <div className="tf-mini-cart-wrap">
              <div className="tf-mini-cart-main">
                <div className="tf-mini-cart-sroll">
                  <div className="tf-mini-cart-items">
                    {cartProducts.map((elm, i) => (
                      <div key={i} className="tf-mini-cart-item">
                        <div className="tf-mini-cart-image">
                          <Link href={`/product-detail/${elm.productId}`}>
                            <Image
                              alt={elm.name}
                              src={getImageSrc(elm)}
                              width={100}
                              height={100}
                              style={{ objectFit: "cover" }}
                            />
                          </Link>
                        </div>
                        <div className="tf-mini-cart-info">
                          <Link
                            className="title link"
                            href={`/product-detail/${elm.id}`}
                          >
                            {elm.name}
                          </Link>

                          {/* Dynamic variant text */}
                          {getVariantText(elm) && (
                            <div className="meta-variant">
                              {getVariantText(elm)}
                            </div>
                          )}

                          <div className="price fw-6">
                            TK {elm.price?.toFixed(2)}
                          </div>
                          <div className="tf-mini-cart-btns">
                            <div className="wg-quantity small">
                              <span
                                className="btn-quantity minus-btn"
                                onClick={() =>
                                  setQuantity(elm.id, elm.quantity - 1)
                                }
                              >
                                -
                              </span>
                              <input
                                type="number"
                                name="number"
                                value={elm.quantity}
                                min={1}
                                onChange={(e) =>
                                  setQuantity(
                                    elm.id,
                                    parseInt(e.target.value) || 1
                                  )
                                }
                              />
                              <span
                                className="btn-quantity plus-btn"
                                onClick={() =>
                                  setQuantity(elm.id, elm.quantity + 1)
                                }
                              >
                                +
                              </span>
                            </div>
                            <div
                              className="tf-mini-cart-remove"
                              style={{ cursor: "pointer" }}
                              onClick={() => removeItem(elm.id)}
                            >
                              Remove
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {!cartProducts.length && (
                      <div className="container">
                        <div className="row align-items-center mt-5 mb-5">
                          <div className="col-12 fs-18">
                            Your shop cart is empty
                          </div>
                          <div className="col-12 mt-3">
                            <Link
                              href={`/shop-default`}
                              className="tf-btn btn-fill animate-hover-btn radius-3 w-100 justify-content-center"
                            >
                              Explore Products!
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="tf-mini-cart-bottom">
                <div className="tf-mini-cart-bottom-wrap">
                  <div className="tf-cart-totals-discounts">
                    <div className="tf-cart-total">Subtotal</div>
                    <div className="tf-totals-total-value fw-6">
                      {totalPrice.toFixed(2)} TK
                    </div>
                  </div>
                  <div className="tf-cart-tax">
                    Taxes and <a href="#">shipping</a> calculated at checkout
                  </div>
                  <div className="tf-mini-cart-line" />
                  <div className="tf-cart-checkbox">
                    <div className="tf-checkbox-wrapp">
                      <input
                        className=""
                        type="checkbox"
                        id="CartDrawer-Form_agree"
                        name="agree_checkbox"
                        checked={agree}
                        onChange={(e) => {
                          setAgree(e.target.checked);
                          setError(false); // Clear error when checking
                        }}
                      />
                      <div>
                        <i className="icon-check" />
                      </div>
                    </div>
                    <label htmlFor="CartDrawer-Form_agree">
                      I agree with the{" "}
                      <a href="#" title="Terms of Service">
                        terms and conditions
                      </a>
                    </label>
                  </div>

                  {/* Error message */}
                  {error && (
                    <div className="text-danger mb-2">
                      Please agree to the terms and conditions
                    </div>
                  )}

                  <div className="tf-mini-cart-view-checkout">
                    <button
                      className="tf-btn btn-outline radius-3 link w-100 justify-content-center"
                      onClick={() => handleNavigation("/view-cart")}
                    >
                      View cart
                    </button>
                    <button
                      className="tf-btn btn-fill animate-hover-btn radius-3 w-100 justify-content-center"
                      onClick={() => handleNavigation("/checkout")}
                    >
                      <span>Check out</span>
                    </button>
                  </div>
                </div>
              </div>
              <div
                className="tf-mini-cart-tool-openable add-note"
                ref={addNoteRef}
              >
                <div
                  className="overplay tf-mini-cart-tool-close"
                  onClick={() => addNoteRef.current.classList.remove("open")}
                />
                <div className="tf-mini-cart-tool-content">
                  <label htmlFor="Cart-note" className="tf-mini-cart-tool-text">
                    <div className="icon">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={16}
                        height={18}
                        viewBox="0 0 16 18"
                        fill="currentColor"
                      >
                        <path d="M5.12187 16.4582H2.78952C2.02045 16.4582 1.39476 15.8325 1.39476 15.0634V2.78952C1.39476 2.02045 2.02045 1.39476 2.78952 1.39476H11.3634C12.1325 1.39476 12.7582 2.02045 12.7582 2.78952V7.07841C12.7582 7.46357 13.0704 7.77579 13.4556 7.77579C13.8407 7.77579 14.1529 7.46357 14.1529 7.07841V2.78952C14.1529 1.25138 12.9016 0 11.3634 0H2.78952C1.25138 0 0 1.25138 0 2.78952V15.0634C0 16.6015 1.25138 17.8529 2.78952 17.8529H5.12187C5.50703 17.8529 5.81925 17.5407 5.81925 17.1555C5.81925 16.7704 5.50703 16.4582 5.12187 16.4582Z" />
                        <path d="M15.3882 10.0971C14.5724 9.28136 13.2452 9.28132 12.43 10.0965L8.60127 13.9168C8.51997 13.9979 8.45997 14.0979 8.42658 14.2078L7.59276 16.9528C7.55646 17.0723 7.55292 17.1993 7.58249 17.3207C7.61206 17.442 7.67367 17.5531 7.76087 17.6425C7.84807 17.7319 7.95768 17.7962 8.07823 17.8288C8.19879 17.8613 8.32587 17.8609 8.44621 17.8276L11.261 17.0479C11.3769 17.0158 11.4824 16.9543 11.5675 16.8694L15.3882 13.0559C16.2039 12.2401 16.2039 10.9129 15.3882 10.0971ZM10.712 15.7527L9.29586 16.145L9.71028 14.7806L12.2937 12.2029L13.2801 13.1893L10.712 15.7527ZM14.4025 12.0692L14.2673 12.204L13.2811 11.2178L13.4157 11.0834C13.6876 10.8115 14.1301 10.8115 14.402 11.0834C14.6739 11.3553 14.6739 11.7977 14.4025 12.0692Z" />
                      </svg>
                    </div>
                    <span>Add Order Note</span>
                  </label>
                  <textarea
                    name="note"
                    id="Cart-note"
                    placeholder="How can we help you?"
                    defaultValue={""}
                  />
                  <div className="tf-cart-tool-btns justify-content-center">
                    <div
                      className="tf-mini-cart-tool-primary text-center w-100 fw-6 tf-mini-cart-tool-close "
                      onClick={() =>
                        addNoteRef.current.classList.remove("open")
                      }
                    >
                      Close
                    </div>
                  </div>
                </div>
              </div>
              <div
                className="tf-mini-cart-tool-openable add-gift"
                ref={addGiftRef}
              >
                <div
                  className="overplay tf-mini-cart-tool-close"
                  onClick={() => addGiftRef.current.classList.remove("open")}
                />
                <form
                  onSubmit={(e) => e.preventDefault()}
                  className="tf-product-form-addgift"
                >
                  <div className="tf-mini-cart-tool-content">
                    <div className="tf-mini-cart-tool-text">
                      <div className="icon">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width={24}
                          height={24}
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M4.65957 3.64545C4.65957 0.73868 7.89921 -0.995558 10.3176 0.617949L11.9997 1.74021L13.6818 0.617949C16.1001 -0.995558 19.3398 0.73868 19.3398 3.64545V4.32992H20.4286C21.9498 4.32992 23.1829 5.56311 23.1829 7.08416V9.10087C23.1829 9.61861 22.7632 10.0383 22.2454 10.0383H21.8528V20.2502C21.8528 20.254 21.8527 20.2577 21.8527 20.2614C21.8467 22.3272 20.1702 24 18.103 24H5.89634C3.82541 24 2.14658 22.3212 2.14658 20.2502V10.0384H1.75384C1.23611 10.0384 0.816406 9.61865 0.816406 9.10092V7.08421C0.816406 5.56304 2.04953 4.32992 3.57069 4.32992H4.65957V3.64545ZM6.53445 4.32992H11.0622V3.36863L9.27702 2.17757C8.10519 1.39573 6.53445 2.2357 6.53445 3.64545V4.32992ZM12.9371 3.36863V4.32992H17.4649V3.64545C17.4649 2.2357 15.8942 1.39573 14.7223 2.17756L12.9371 3.36863ZM3.57069 6.2048C3.08499 6.2048 2.69128 6.59851 2.69128 7.08421V8.16348H8.31067L8.3107 6.2048H3.57069ZM8.31071 10.0384V18.5741C8.31071 18.9075 8.48779 19.2158 8.77577 19.3838C9.06376 19.5518 9.4193 19.5542 9.70953 19.3901L11.9997 18.0953L14.2898 19.3901C14.58 19.5542 14.9356 19.5518 15.2236 19.3838C15.5115 19.2158 15.6886 18.9075 15.6886 18.5741V10.0383H19.9779V20.2137C19.9778 20.2169 19.9778 20.2201 19.9778 20.2233V20.2502C19.9778 21.2857 19.1384 22.1251 18.103 22.1251H5.89634C4.86088 22.1251 4.02146 21.2857 4.02146 20.2502V10.0384H8.31071ZM21.308 8.16344V7.08416C21.308 6.59854 20.9143 6.2048 20.4286 6.2048H15.6886V8.16344H21.308ZM13.8138 6.2048H10.1856V16.9672L11.5383 16.2024C11.8246 16.0405 12.1748 16.0405 12.461 16.2024L13.8138 16.9672V6.2048Z"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
              <div
                className="tf-mini-cart-tool-openable estimate-shipping"
                ref={addShipingRef}
              >
                <div
                  className="overplay tf-mini-cart-tool-close"
                  onClick={() => addShipingRef.current.classList.remove("open")}
                />
                <div className="tf-mini-cart-tool-content">
                  <div className="tf-mini-cart-tool-text">
                    <div className="icon">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={21}
                        height={15}
                        viewBox="0 0 21 15"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M0.441406 1.13155C0.441406 0.782753 0.724159 0.5 1.07295 0.5H12.4408C12.7896 0.5 13.0724 0.782753 13.0724 1.13155V2.91575H16.7859C18.8157 2.91575 20.5581 4.43473 20.5581 6.42296V11.8878C20.5581 12.2366 20.2753 12.5193 19.9265 12.5193H18.7542C18.4967 13.6534 17.4823 14.5 16.2703 14.5C15.0582 14.5 14.0439 13.6534 13.7864 12.5193H7.20445C6.94692 13.6534 5.93259 14.5 4.72054 14.5C3.50849 14.5 2.49417 13.6534 2.23664 12.5193H1.07295C0.724159 12.5193 0.441406 12.2366 0.441406 11.8878V1.13155ZM2.26988 11.2562C2.57292 10.1881 3.55537 9.40578 4.72054 9.40578C5.88572 9.40578 6.86817 10.1881 7.17121 11.2562H11.8093V1.76309H1.7045V11.2562H2.26988ZM13.0724 4.17884V6.68916H19.295V6.42296C19.295 5.2348 18.2252 4.17884 16.7859 4.17884H13.0724ZM19.295 7.95226H13.0724V11.2562H13.8196C14.1227 10.1881 15.1051 9.40578 16.2703 9.40578C17.4355 9.40578 18.4179 10.1881 18.7209 11.2562H19.295V7.95226ZM4.72054 10.6689C4.0114 10.6689 3.43652 11.2437 3.43652 11.9529C3.43652 12.662 4.0114 13.2369 4.72054 13.2369C5.42969 13.2369 6.00456 12.662 6.00456 11.9529C6.00456 11.2437 5.42969 10.6689 4.72054 10.6689ZM16.2703 10.6689C15.5611 10.6689 14.9863 11.2437 14.9863 11.9529C14.9863 12.662 15.5611 13.2369 16.2703 13.2369C16.9794 13.2369 17.5543 12.662 17.5543 11.9529C17.5543 11.2437 16.9794 10.6689 16.2703 10.6689Z"
                        />
                      </svg>
                    </div>
                    {/* <span className="fw-6">Estimate Shipping</span> */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
