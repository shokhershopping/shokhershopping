"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function PaymentConfirmation() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`);
        if (response.ok) {
          const result = await response.json();
          setOrder(result.data);
        }
      } catch (error) {
        // Silently handle fetch error
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <section className="flat-spacing-11">
        <div className="container">
          <div className="text-center py-5">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!orderId || !order) {
    return (
      <section className="flat-spacing-11">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-6 text-center">
              <h5 className="fw-5 mb_20">Order Confirmation</h5>
              <div className="tf-page-cart-checkout">
                <div className="mb_20">
                  <i
                    className="icon-check"
                    style={{ fontSize: "48px", color: "#28a745" }}
                  ></i>
                </div>
                <p className="mb_20">
                  Your order has been placed successfully!
                </p>
                <Link
                  href="/my-account-orders"
                  className="tf-btn w-100 btn-fill animate-hover-btn radius-3 justify-content-center"
                >
                  <span>View My Orders</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const orderDate = order.createdAt
    ? new Date(order.createdAt._seconds * 1000).toLocaleDateString("en-GB")
    : new Date().toLocaleDateString("en-GB");

  const shippingAddress = order.shippingAddress || {};

  return (
    <section className="flat-spacing-11">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-6">
            <div className="text-center mb_20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="64"
                height="64"
                fill="#28a745"
                viewBox="0 0 16 16"
              >
                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" />
              </svg>
              <h5 className="fw-5 mt-3">Order Confirmed!</h5>
              <p className="text-muted">
                Thank you for your order. Your order ID is{" "}
                <strong>#{order.id?.slice(-8).toUpperCase()}</strong>
              </p>
            </div>
            <div className="tf-page-cart-checkout">
              <div className="d-flex align-items-center justify-content-between mb_15">
                <div className="fs-18">Date</div>
                <p>{orderDate}</p>
              </div>
              <div className="d-flex align-items-center justify-content-between mb_15">
                <div className="fs-18">Payment method</div>
                <p>{order.transaction?.method || "Cash on delivery"}</p>
              </div>
              <div className="d-flex align-items-center justify-content-between mb_15">
                <div className="fs-18">Name</div>
                <p>{shippingAddress.name || "-"}</p>
              </div>
              <div className="d-flex align-items-center justify-content-between mb_15">
                <div className="fs-18">Address</div>
                <p>
                  {[shippingAddress.address, shippingAddress.city]
                    .filter(Boolean)
                    .join(", ") || "-"}
                </p>
              </div>
              <div className="d-flex align-items-center justify-content-between mb_15">
                <div className="fs-18">Phone</div>
                <p>{shippingAddress.phone || "-"}</p>
              </div>
              {order.deliveryCharge > 0 && (
                <div className="d-flex align-items-center justify-content-between mb_15">
                  <div className="fs-18">Delivery Charge</div>
                  <p>৳{order.deliveryCharge} BDT</p>
                </div>
              )}
              {order.discount > 0 && (
                <div className="d-flex align-items-center justify-content-between mb_15">
                  <div className="fs-18">Discount</div>
                  <p className="text-success">-৳{order.discount} BDT</p>
                </div>
              )}
              <div className="d-flex align-items-center justify-content-between mb_24">
                <div className="fs-22 fw-6">Total</div>
                <span className="total-value">
                  ৳{Number(order.total || 0).toFixed(2)} BDT
                </span>
              </div>
              <div className="d-flex gap-10">
                <Link
                  href="/shop"
                  className="tf-btn w-100 btn-outline animate-hover-btn rounded-0 justify-content-center"
                >
                  <span>Continue Shopping</span>
                </Link>
                <Link
                  href="/my-account-orders"
                  className="tf-btn w-100 btn-fill animate-hover-btn radius-3 justify-content-center"
                >
                  <span>View Orders</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
