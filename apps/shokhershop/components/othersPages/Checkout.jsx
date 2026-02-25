"use client";
import { useContextElement } from "@/context/Context";
import { useFirebaseAuth } from "@/lib/firebase-auth-provider";
import { getImageUrl } from "@/lib/getImageUrl";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Checkout() {
  const { cartProducts, setCartProducts, user, isLoadingUser } = useContextElement();
  const { user: firebaseUser, isLoaded: isAuthLoaded, isSignedIn } = useFirebaseAuth();
  const router = useRouter();
  const baseUrl = '/api';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [couponCode, setCouponCode] = useState("");
  const [coupon, setCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [formData, setFormData] = useState({
    // Billing Address
    billingFirstName: "",
    billingLastName: "",
    billingCity: "",
    billingAddress: "",
    billingPhone: "",
    billingEmail: "",
    billingState: "Dhaka",
    billingZip: "",
    // Shipping Address
    shippingFirstName: "",
    shippingLastName: "",
    shippingCity: "",
    shippingAddress: "",
    shippingPhone: "",
    shippingState: "Dhaka",
    shippingZip: "",
    // Toggle
    sameAsShipping: true,
  });

  // Check authentication and redirect if needed
  useEffect(() => {
    if (isAuthLoaded && !isSignedIn) {
      // Redirect to login with callback to return to checkout
      router.push("/login?redirect_url=/checkout");
    }
  }, [isAuthLoaded, isSignedIn, router]);

  // Pre-fill form with user data from Firebase
  useEffect(() => {
    if (firebaseUser) {
      const nameParts = (firebaseUser.displayName || "").split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";
      setFormData(prev => ({
        ...prev,
        billingFirstName: firstName,
        billingLastName: lastName,
        billingEmail: firebaseUser.email || "",
        shippingFirstName: firstName,
        shippingLastName: lastName,
      }));
    }
  }, [firebaseUser]);

  // Calculate total price of products
  const totalPrice = cartProducts.reduce(
    (sum, product) => sum + product.price * product.quantity,
    0
  );

  // Calculate delivery charge based on area
  const [deliveryCharge, setDeliveryCharge] = useState(80);
  const handleDeliveryAreaChange = (e) => {
    const area = e.target.value;
    if (area === "inside_dhaka") {
      setDeliveryCharge(80);
    } else if (area === "outside_dhaka") {
      setDeliveryCharge(200);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Generate image source
  const getImageSrc = (product) => {
    const imagePath =
      product.images?.[0]?.path ||
      product.imgSrc ||
      null;
    return getImageUrl(imagePath);
  };

  // Get variant text
  const getVariantText = (product) => {
    const formatColor = (color) =>
      color ? color.charAt(0).toUpperCase() + color.slice(1).toLowerCase() : "";
    const color = product.specifications?.color
      ? formatColor(product.specifications.color)
      : "";
    const size = product.specifications?.size
      ? product.specifications.size.toUpperCase()
      : "";

    if (color && size) return `${color}, ${size}`;
    if (color) return color;
    if (size) return size;
    return "";
  };

  // Coupon discount calculation
  // Firestore coupon fields: type (PERCENTAGE/FIXED), amount, minimum, maximum
  const couponDiscount = coupon
    ? coupon.type === "PERCENTAGE"
      ? Math.min(
          (totalPrice * coupon.amount) / 100,
          coupon.maximum || Infinity
        )
      : Math.min(coupon.amount, totalPrice)
    : 0;

  const grandTotal = totalPrice + deliveryCharge - couponDiscount;

  // Apply coupon
  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }

    setCouponLoading(true);
    setCouponError("");
    try {
      const response = await fetch(
        `/api/coupons?code=${encodeURIComponent(couponCode.trim())}`
      );
      const result = await response.json();

      if (!response.ok || result.status !== "success") {
        setCouponError(result.message || "Invalid coupon code");
        setCoupon(null);
        return;
      }

      const couponData = result.data;

      // Check minimum amount (Firestore field: minimum)
      const minAmount = couponData.minimum || couponData.minAmount || 0;
      if (minAmount && totalPrice < minAmount) {
        setCouponError(
          `Minimum order amount is ৳${minAmount} for this coupon`
        );
        setCoupon(null);
        return;
      }

      setCoupon(couponData);
      setCouponError("");
    } catch (err) {
      setCouponError("Failed to validate coupon");
      setCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate authentication
    if (!isSignedIn) {
      setError("You must be logged in to place an order");
      router.push("/login?redirect_url=/checkout");
      return;
    }

    // Validate terms agreement
    if (!formData.agreeToTerms) {
      setError("You must agree to the terms and conditions");
      return;
    }

    // Validate cart is not empty
    if (cartProducts.length === 0) {
      setError("Your cart is empty");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Prepare addresses
      const billingAddressData = {
        name: `${formData.billingFirstName} ${formData.billingLastName}`,
        address: formData.billingAddress,
        city: formData.billingCity,
        state: formData.billingState,
        country: "Bangladesh",
        zip: formData.billingZip,
        phone: formData.billingPhone,
      };

      const shippingAddressData = formData.sameAsShipping
        ? billingAddressData
        : {
            name: `${formData.shippingFirstName} ${formData.shippingLastName}`,
            address: formData.shippingAddress,
            city: formData.shippingCity,
            state: formData.shippingState,
            country: "Bangladesh",
            zip: formData.shippingZip,
            phone: formData.shippingPhone,
          };

      const orderData = {
        order: {
          userId: firebaseUser?.uid,
          deliveryCharge: deliveryCharge,
          ...(coupon ? { couponId: coupon.id, discount: couponDiscount } : {}),
        },
        items: cartProducts.map((product) => ({
          quantity: product.quantity,
          productId: product.id,
        })),
        shippingAddress: shippingAddressData,
        billingAddress: formData.sameAsShipping ? undefined : billingAddressData,
      };

      // Send request to API
      const response = await fetch(`${baseUrl}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to place order");
      }

      const result = await response.json();
      const newOrderId = result.data?.id;
      // Clear cart on success
      setCartProducts([]);
      router.push(newOrderId ? `/payment-confirmation?orderId=${newOrderId}` : "/my-account-orders");
    } catch (err) {
      setError(err.message || "An error occurred during checkout");
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking authentication or user
  if (!isAuthLoaded || isLoadingUser) {
    return (
      <section className="flat-spacing-11">
        <div className="container">
          <div className="text-center py-5">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading checkout...</p>
          </div>
        </div>
      </section>
    );
  }

  // If not authenticated, show message (should redirect via useEffect)
  if (!isSignedIn) {
    return (
      <section className="flat-spacing-11">
        <div className="container">
          <div className="text-center py-5">
            <p>Redirecting to sign in...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="flat-spacing-11">
      <div className="container">
        <div className="tf-page-cart-wrap layout-2">
          {/* Left Column - Billing & Shipping Details */}
          <div className="tf-page-cart-item">
            <h5 className="fw-5 mb_20">Billing details</h5>
            <form onSubmit={handleSubmit} className="form-checkout">
              <div className="box grid-2">
                <fieldset className="fieldset">
                  <label htmlFor="billing-first-name">First Name *</label>
                  <input
                    required
                    type="text"
                    id="billing-first-name"
                    name="billingFirstName"
                    value={formData.billingFirstName}
                    onChange={handleInputChange}
                  />
                </fieldset>
                <fieldset className="fieldset">
                  <label htmlFor="billing-last-name">Last Name *</label>
                  <input
                    required
                    type="text"
                    id="billing-last-name"
                    name="billingLastName"
                    value={formData.billingLastName}
                    onChange={handleInputChange}
                  />
                </fieldset>
              </div>

              <fieldset className="box fieldset">
                <label htmlFor="billing-city">Town/City *</label>
                <input
                  required
                  type="text"
                  id="billing-city"
                  name="billingCity"
                  value={formData.billingCity}
                  onChange={handleInputChange}
                />
              </fieldset>

              <fieldset className="box fieldset">
                <label htmlFor="billing-address">Address *</label>
                <input
                  required
                  type="text"
                  id="billing-address"
                  name="billingAddress"
                  value={formData.billingAddress}
                  onChange={handleInputChange}
                />
              </fieldset>

              <div className="box grid-2">
                <fieldset className="fieldset">
                  <label htmlFor="billing-zip">Zip/Postal Code *</label>
                  <input
                    required
                    type="text"
                    id="billing-zip"
                    name="billingZip"
                    value={formData.billingZip}
                    onChange={handleInputChange}
                  />
                </fieldset>
                <fieldset className="fieldset">
                  <label htmlFor="billing-phone">Phone Number *</label>
                  <input
                    required
                    type="tel"
                    id="billing-phone"
                    name="billingPhone"
                    value={formData.billingPhone}
                    onChange={handleInputChange}
                  />
                </fieldset>
              </div>

              <fieldset className="box fieldset">
                <label htmlFor="billing-email">Email *</label>
                <input
                  required
                  type="email"
                  id="billing-email"
                  name="billingEmail"
                  value={formData.billingEmail}
                  onChange={handleInputChange}
                  autoComplete="email"
                />
              </fieldset>

              {/* Shipping Same as Billing Toggle */}
              <div className="box-checkbox fieldset-radio mb_20">
                <input
                  type="checkbox"
                  id="same-as-shipping"
                  className="tf-check"
                  name="sameAsShipping"
                  checked={formData.sameAsShipping}
                  onChange={handleInputChange}
                />
                <label htmlFor="same-as-shipping" className="text_black-2">
                  Shipping address is the same as billing address
                </label>
              </div>

              {/* Shipping Address Section - Only show if different */}
              {!formData.sameAsShipping && (
                <>
                  <h5 className="fw-5 mb_20 mt-4">Shipping details</h5>

                  <div className="box grid-2">
                    <fieldset className="fieldset">
                      <label htmlFor="shipping-first-name">First Name *</label>
                      <input
                        required={!formData.sameAsShipping}
                        type="text"
                        id="shipping-first-name"
                        name="shippingFirstName"
                        value={formData.shippingFirstName}
                        onChange={handleInputChange}
                      />
                    </fieldset>
                    <fieldset className="fieldset">
                      <label htmlFor="shipping-last-name">Last Name *</label>
                      <input
                        required={!formData.sameAsShipping}
                        type="text"
                        id="shipping-last-name"
                        name="shippingLastName"
                        value={formData.shippingLastName}
                        onChange={handleInputChange}
                      />
                    </fieldset>
                  </div>

                  <fieldset className="box fieldset">
                    <label htmlFor="shipping-city">Town/City *</label>
                    <input
                      required={!formData.sameAsShipping}
                      type="text"
                      id="shipping-city"
                      name="shippingCity"
                      value={formData.shippingCity}
                      onChange={handleInputChange}
                    />
                  </fieldset>

                  <fieldset className="box fieldset">
                    <label htmlFor="shipping-address">Address *</label>
                    <input
                      required={!formData.sameAsShipping}
                      type="text"
                      id="shipping-address"
                      name="shippingAddress"
                      value={formData.shippingAddress}
                      onChange={handleInputChange}
                    />
                  </fieldset>

                  <div className="box grid-2">
                    <fieldset className="fieldset">
                      <label htmlFor="shipping-zip">Zip/Postal Code *</label>
                      <input
                        required={!formData.sameAsShipping}
                        type="text"
                        id="shipping-zip"
                        name="shippingZip"
                        value={formData.shippingZip}
                        onChange={handleInputChange}
                      />
                    </fieldset>
                    <fieldset className="fieldset">
                      <label htmlFor="shipping-phone">Phone Number *</label>
                      <input
                        required={!formData.sameAsShipping}
                        type="tel"
                        id="shipping-phone"
                        name="shippingPhone"
                        value={formData.shippingPhone}
                        onChange={handleInputChange}
                      />
                    </fieldset>
                  </div>
                </>
              )}

              {/* Delivery Area Selection */}
              <div className="box fieldset mt-3">
                <label htmlFor="deliveryArea">Delivery Area *</label>
                <select
                  required
                  id="deliveryArea"
                  name="deliveryArea"
                  value={formData.deliveryArea}
                  onChange={handleDeliveryAreaChange}
                  className="form-control w-100"
                  style={{ height: "48px" }}
                >
                  <option value="inside_dhaka">Inside Dhaka</option>
                  <option value="outside_dhaka">Outside Dhaka</option>
                </select>
              </div>

              <fieldset className="box fieldset">
                <label htmlFor="note">Order notes (optional)</label>
                <textarea
                  id="note"
                  name="note"
                  value={formData.note}
                  onChange={handleInputChange}
                />
              </fieldset>

              {/* Error message display */}
              {error && <div className="alert alert-danger mt-3">{error}</div>}
            </form>
          </div>

          {/* Right Column - Order Summary */}
          <div className="tf-page-cart-footer">
            <div className="tf-cart-footer-inner">
              <h5 className="fw-5 mb_20">Your order</h5>
              <form
                onSubmit={handleSubmit}
                className="tf-page-cart-checkout widget-wrap-checkout"
              >
                <ul className="wrap-checkout-product">
                  {cartProducts.map((elm, i) => (
                    <li key={i} className="checkout-product-item">
                      <figure className="img-product">
                        <Image
                          alt="product"
                          src={getImageSrc(elm)}
                          width={60}
                          height={84}
                        />
                        <span className="quantity">{elm.quantity}</span>
                      </figure>
                      <div className="content">
                        <div className="info">
                          <p className="name">{elm.name}</p>
                          {getVariantText(elm) && (
                            <div className="meta-variant">
                              {getVariantText(elm)}
                            </div>
                          )}
                        </div>
                        <span className="price">
                          {(elm.price * elm.quantity).toFixed(2)} TK
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>

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
                          style={{ width: "fit-content" }}
                        >
                          Explore Products!
                        </Link>
                      </div>
                    </div>
                  </div>
                )}

                <div className="coupon-box">
                  <input
                    type="text"
                    placeholder="Discount code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={couponLoading}
                    className="tf-btn btn-sm radius-3 btn-fill btn-icon animate-hover-btn"
                  >
                    {couponLoading ? "..." : "Apply"}
                  </button>
                </div>
                {couponError && (
                  <p className="text-danger small mt-1">{couponError}</p>
                )}
                {coupon && (
                  <p className="text-success small mt-1">
                    Coupon applied! You save ৳{couponDiscount.toFixed(2)}
                  </p>
                )}

                {/* Order Totals */}
                <div className="order-totals">
                  <div className="d-flex justify-content-between pb_10">
                    <span>Subtotal:</span>
                    <span>{totalPrice.toFixed(2)} TK</span>
                  </div>
                  <div className="d-flex justify-content-between pb_10">
                    <span>Delivery Charge:</span>
                    <span>{deliveryCharge} TK</span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="d-flex justify-content-between pb_10">
                      <span>Discount:</span>
                      <span className="text-success">
                        -{couponDiscount.toFixed(2)} TK
                      </span>
                    </div>
                  )}
                  <div className="d-flex justify-content-between line pb_20">
                    <h6 className="fw-5">Total</h6>
                    <h6 className="total fw-5">{grandTotal.toFixed(2)} TK</h6>
                  </div>
                </div>

                <div className="wd-check-payment">
                  <div className="fieldset-radio mb_20">
                    <input
                      required
                      type="radio"
                      name="payment"
                      id="delivery"
                      className="tf-check"
                      defaultChecked
                    />
                    <label htmlFor="delivery">Cash on delivery</label>
                  </div>

                  <p className="text_black-2 mb_20">
                    Your personal data will be used to process your order,
                    support your experience throughout this website, and for
                    other purposes described in our{" "}
                    <Link
                      href={`/privacy-policy`}
                      className="text-decoration-underline"
                    >
                      privacy policy
                    </Link>
                    .
                  </p>

                  <div className="box-checkbox fieldset-radio mb_20">
                    <input
                      required
                      type="checkbox"
                      id="check-agree"
                      className="tf-check"
                      name="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={handleInputChange}
                    />
                    <label htmlFor="check-agree" className="text_black-2">
                      I have read and agree to the website{" "}
                      <Link
                        href={`/terms-conditions`}
                        className="text-decoration-underline"
                      >
                        terms and conditions
                      </Link>
                      .
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="tf-btn radius-3 btn-fill btn-icon animate-hover-btn justify-content-center"
                  disabled={loading || cartProducts.length === 0}
                >
                  {loading ? "Processing..." : "Place order"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
