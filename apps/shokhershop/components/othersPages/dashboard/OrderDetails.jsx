"use client";
import React, { useEffect } from "react";
import Image from "next/image";
import { getImageUrl } from "@/lib/getImageUrl";

export default function OrderDetails({ order }) {
  useEffect(() => {
    const tabs = () => {
      document.querySelectorAll(".widget-tabs").forEach((widgetTab) => {
        const titles = widgetTab.querySelectorAll(
          ".widget-menu-tab .item-title"
        );

        titles.forEach((title, index) => {
          title.addEventListener("click", () => {
            // Remove active class from all menu items
            titles.forEach((item) => item.classList.remove("active"));
            // Add active class to the clicked item
            title.classList.add("active");

            // Remove active class from all content items
            const contentItems = widgetTab.querySelectorAll(
              ".widget-content-tab > *"
            );
            contentItems.forEach((content) =>
              content.classList.remove("active")
            );

            // Add active class and fade-in effect to the matching content item
            const contentActive = contentItems[index];
            contentActive.classList.add("active");
            contentActive.style.display = "block";
            contentActive.style.opacity = 0;
            setTimeout(() => (contentActive.style.opacity = 1), 0);

            // Hide all siblings' content
            contentItems.forEach((content, idx) => {
              if (idx !== index) {
                content.style.display = "none";
              }
            });
          });
        });
      });
    };

    // Call the function to initialize the tabs
    tabs();

    // Clean up event listeners when the component unmounts
    return () => {
      document
        .querySelectorAll(".widget-menu-tab .item-title")
        .forEach((title) => {
          title.removeEventListener("click", () => {});
        });
    };
  }, []);

  if (!order) {
    return <div>Loading order details...</div>;
  }

  // Helper functions
  const getFirstItemImage = () => {
    const firstItem = order.items?.[0];
    if (!firstItem) return "/images/products/brown.jpg";

    // Check for productImageUrl from order items (new format)
    if (firstItem.productImageUrl) {
      return getImageUrl(firstItem.productImageUrl);
    }

    const product = firstItem.product || firstItem.variableProduct;
    if (product?.images?.[0]?.path) {
      return getImageUrl(product.images[0].path);
    }
    return "/images/products/brown.jpg";
  };

  const getFirstItemName = () => {
    const firstItem = order.items?.[0];
    if (!firstItem) return "N/A";
    return firstItem.product?.name || firstItem.variableProduct?.name || "N/A";
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-US", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      PENDING: "badge-warning",
      PROCESSING: "badge-info",
      DISPATCHED: "badge-primary",
      DELIVERED: "badge-success",
      CANCELLED: "badge-danger",
    };
    return statusMap[status] || "badge-secondary";
  };

  const getStatusLabel = (status) => {
    const labels = {
      PENDING: "Pending",
      PROCESSING: "In Progress",
      DISPATCHED: "Dispatched",
      DELIVERED: "Delivered",
      CANCELLED: "Cancelled",
    };
    return labels[status] || status;
  };

  const getPaymentMethodLabel = (method) => {
    const labels = {
      COD: "Cash on Delivery",
      BKASH: "bKash",
      SSLCOMMERZ: "SSL Commerce",
    };
    return labels[method] || "Cash on Delivery";
  };

  // Build timeline based on order status
  const getOrderTimeline = () => {
    const timeline = [
      { status: "PENDING", label: "Order Placed", date: order.createdAt },
    ];

    const statusOrder = ["PENDING", "PROCESSING", "DISPATCHED", "DELIVERED"];
    const currentIndex = statusOrder.indexOf(order.status);

    if (currentIndex >= 1) {
      timeline.push({
        status: "PROCESSING",
        label: "Processing",
        date: order.updatedAt,
      });
    }
    if (currentIndex >= 2) {
      timeline.push({
        status: "DISPATCHED",
        label: "Out for Delivery",
        date: order.updatedAt,
      });
    }
    if (currentIndex >= 3) {
      timeline.push({
        status: "DELIVERED",
        label: "Delivered",
        date: order.updatedAt,
      });
    }

    return timeline.reverse();
  };

  const getItemImage = (item) => {
    // Check for productImageUrl from order items (new format)
    if (item.productImageUrl) {
      return getImageUrl(item.productImageUrl);
    }

    const product = item.product || item.variableProduct;
    if (product?.images?.[0]?.path) {
      return getImageUrl(product.images[0].path);
    }
    return "/images/products/brown.jpg";
  };

  const getItemName = (item) => {
    return item.product?.name || item.variableProduct?.name || "Unknown Product";
  };

  const getItemPrice = (item) => {
    return item.product?.price || item.variableProduct?.price || 0;
  };

  const getItemSpecs = (item) => {
    if (!item.variableProduct?.specifications) return null;
    const specs = item.variableProduct.specifications;
    const parts = [];
    if (specs.size) parts.push(`Size: ${specs.size}`);
    if (specs.color) parts.push(`Color: ${specs.color}`);
    return parts.length > 0 ? parts.join(", ") : null;
  };

  return (
    <div className="wd-form-order">
      <div className="order-head">
        <figure className="img-product">
          <Image
            alt="product"
            src={getFirstItemImage()}
            width="720"
            height="1005"
          />
        </figure>
        <div className="content">
          <div className={`badge ${getStatusBadgeClass(order.status)}`}>
            {getStatusLabel(order.status)}
          </div>
          <h6 className="mt-8 fw-5">Order #{order.id.slice(0, 8)}</h6>
        </div>
      </div>
      <div className="tf-grid-layout md-col-2 gap-15">
        <div className="item">
          <div className="text-2 text_black-2">Item</div>
          <div className="text-2 mt_4 fw-6">{getFirstItemName()}</div>
        </div>
        <div className="item">
          <div className="text-2 text_black-2">Courier</div>
          <div className="text-2 mt_4 fw-6">
            {getPaymentMethodLabel(order.transaction?.paymentMethod)}
          </div>
        </div>
        <div className="item">
          <div className="text-2 text_black-2">Start Time</div>
          <div className="text-2 mt_4 fw-6">{formatDate(order.createdAt)}</div>
        </div>
        <div className="item">
          <div className="text-2 text_black-2">Address</div>
          <div className="text-2 mt_4 fw-6">
            {order.shippingAddress
              ? `${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zip}`
              : "N/A"}
          </div>
        </div>
      </div>
      <div className="widget-tabs style-has-border widget-order-tab">
        <ul className="widget-menu-tab">
          <li className="item-title active">
            <span className="inner">Order History</span>
          </li>
          <li className="item-title">
            <span className="inner">Item Details</span>
          </li>
          <li className="item-title">
            <span className="inner">Courier</span>
          </li>
          <li className="item-title">
            <span className="inner">Receiver</span>
          </li>
        </ul>
        <div className="widget-content-tab">
          <div className="widget-content-inner active">
            <div className="widget-timeline">
              <ul className="timeline">
                {getOrderTimeline().map((event, index) => (
                  <li key={index}>
                    <div
                      className={`timeline-badge ${
                        index < 2 ? "success" : ""
                      }`}
                    />
                    <div className="timeline-box">
                      <a className="timeline-panel" href="#">
                        <div className="text-2 fw-6">{event.label}</div>
                        <span>{formatDate(event.date)}</span>
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="widget-content-inner">
            {order.items?.map((item, index) => (
              <div key={index} className={index > 0 ? "mt_20" : ""}>
                <div className="order-head">
                  <figure className="img-product">
                    <Image
                      alt="product"
                      src={getItemImage(item)}
                      width="720"
                      height="1005"
                    />
                  </figure>
                  <div className="content">
                    <div className="text-2 fw-6">{getItemName(item)}</div>
                    <div className="mt_4">
                      <span className="fw-6">Price :</span> ৳{getItemPrice(item).toFixed(2)}
                    </div>
                    <div className="mt_4">
                      <span className="fw-6">Quantity :</span> {item.quantity}
                    </div>
                    {getItemSpecs(item) && (
                      <div className="mt_4">
                        <span className="fw-6">{getItemSpecs(item)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <ul className="mt_20">
              <li className="d-flex justify-content-between text-2">
                <span>Subtotal</span>
                <span className="fw-6">৳{order.total?.toFixed(2)}</span>
              </li>
              <li className="d-flex justify-content-between text-2 mt_4">
                <span>Delivery Charge</span>
                <span className="fw-6">৳{order.deliveryCharge?.toFixed(2)}</span>
              </li>
              {order.itemsTotalDiscount > 0 && (
                <li className="d-flex justify-content-between text-2 mt_4">
                  <span>Item Discounts</span>
                  <span className="fw-6 text-danger">
                    -৳{order.itemsTotalDiscount?.toFixed(2)}
                  </span>
                </li>
              )}
              {order.couponAppliedDiscount > 0 && (
                <li className="d-flex justify-content-between text-2 mt_4 pb_8 line">
                  <span>Coupon Discount ({order.coupon?.code})</span>
                  <span className="fw-6 text-danger">
                    -৳{order.couponAppliedDiscount?.toFixed(2)}
                  </span>
                </li>
              )}
              <li className="d-flex justify-content-between text-2 mt_8">
                <span>Order Total</span>
                <span className="fw-6">৳{order.netTotal?.toFixed(2)}</span>
              </li>
            </ul>
          </div>
          <div className="widget-content-inner">
            <p>
              Our courier service is dedicated to providing fast, reliable, and
              secure delivery solutions tailored to meet your needs. Whether
              you're sending documents, parcels, or larger shipments, our team
              ensures that your items are handled with the utmost care and
              delivered on time. With a commitment to customer satisfaction,
              real-time tracking, and a wide network of routes, we make it easy
              for you to send and receive packages both locally and
              internationally. Choose our service for a seamless and efficient
              delivery experience.
            </p>
          </div>
          <div className="widget-content-inner">
            <p className="text-2 text_success">
              Thank you Your order has been received
            </p>
            <ul className="mt_20">
              <li>
                Order Number : <span className="fw-7">#{order.id.slice(0, 8)}</span>
              </li>
              <li>
                Date : <span className="fw-7">{formatDate(order.createdAt)}</span>
              </li>
              <li>
                Total : <span className="fw-7">৳{order.netTotal?.toFixed(2)}</span>
              </li>
              <li>
                Payment Methods :
                <span className="fw-7">
                  {getPaymentMethodLabel(order.transaction?.paymentMethod)}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
