"use client";
import React, { use } from "react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useContextElement } from "@/context/Context";
import toast from "react-hot-toast";
import CancelOrderModal from "@/components/modals/CancelOrderModal";
export default function Orders() {
  //get orders from API
  const [orders, setOrders] = useState([]);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const { user } = useContextElement();
  const userId = user?.id;
  console.log("User ID:", userId);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(
          `${baseUrl}/orders/user/${userId}?limit=1000`
        );
        const data = await response.json();
        const result = data.data;
        console.log("Fetched orders:", result);
        setOrders(result);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, [userId, baseUrl]);
  console.log("Orders:", orders);

  const openCancelModal = (orderId) => {
    setOrderToCancel(orderId);
    if (typeof window !== "undefined") {
      const modalElement = document.getElementById("cancelOrderModal");
      if (modalElement) {
        const bootstrap = require("bootstrap");
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
      }
    }
  };

  const handleCancelOrder = async (orderId) => {
    setCancellingOrderId(orderId);
    try {
      const response = await fetch(`${baseUrl}/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "CANCELLED" }),
      });

      if (response.ok) {
        // Update the order status in the local state
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId ? { ...order, status: "CANCELLED" } : order
          )
        );
        toast.success("Order cancelled successfully");
      } else {
        const errorData = await response.json();
        toast.error(`Failed to cancel order: ${errorData.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast.error("Failed to cancel order. Please try again.");
    } finally {
      setCancellingOrderId(null);
      setOrderToCancel(null);
    }
  };

  return (
    <div className="my-account-content account-order">
      <div className="wrap-account-order">
        <table>
          <thead>
            <tr>
              <th className="fw-6">Order</th>
              <th className="fw-6">Date</th>
              <th className="fw-6">Status</th>
              <th className="fw-6">Total</th>
              <th className="fw-6">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? (
              orders.map((order) => (
                <tr key={order?.id} className="tf-order-item">
                  <td>#{order?.id}</td>
                  <td>{new Date(order?.createdAt).toLocaleDateString()}</td>
                  <td>{order?.status}</td>
                  <td>{order?.netTotal?.toFixed(2)}</td>
                  <td>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "nowrap", alignItems: "center" }}>
                      <Link
                        href={`/my-account-orders-details/${order?.id}`}
                        className="tf-btn btn-fill animate-hover-btn rounded-0 justify-content-center"
                        style={{ minWidth: "fit-content" }}
                      >
                        <span>View</span>
                      </Link>
                      {order?.status === "PENDING" && (
                        <button
                          onClick={() => openCancelModal(order?.id)}
                          disabled={cancellingOrderId === order?.id}
                          className="tf-btn btn-outline-dark animate-hover-btn rounded-0 justify-content-center"
                          style={{
                            opacity: cancellingOrderId === order?.id ? 0.6 : 1,
                            cursor: cancellingOrderId === order?.id ? "not-allowed" : "pointer",
                            minWidth: "fit-content",
                            whiteSpace: "nowrap"
                          }}
                        >
                          <span>
                            {cancellingOrderId === order?.id ? "Cancelling..." : "Cancel"}
                          </span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <CancelOrderModal
        orderId={orderToCancel}
        onConfirm={handleCancelOrder}
        isLoading={cancellingOrderId === orderToCancel}
      />
    </div>
  );
}
