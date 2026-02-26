"use client";
import React from "react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useContextElement } from "@/context/Context";
import toast from "react-hot-toast";
import CancelOrderModal from "@/components/modals/CancelOrderModal";
export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const { user, isLoadingUser } = useContextElement();
  const userId = user?.id;

  useEffect(() => {
    if (isLoadingUser) return;

    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/orders/user/${userId}?limit=1000`
        );
        const data = await response.json();
        if (!response.ok) {
          console.error('Failed to fetch orders:', response.status, data?.message, data?.error);
          setOrders([]);
          return;
        }
        setOrders(data.data || []);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userId, isLoadingUser]);

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
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "CANCELLED" }),
      });

      if (response.ok) {
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
      toast.error("Failed to cancel order. Please try again.");
    } finally {
      setCancellingOrderId(null);
      setOrderToCancel(null);
    }
  };

  const parseDate = (ts) => {
    if (!ts) return "N/A";
    if (ts._seconds) return new Date(ts._seconds * 1000).toLocaleDateString();
    const d = new Date(ts);
    return isNaN(d.getTime()) ? "N/A" : d.toLocaleDateString();
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
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center">
                  <div className="spinner-border spinner-border-sm me-2" role="status" />
                  Loading orders...
                </td>
              </tr>
            ) : orders.length > 0 ? (
              orders.map((order) => (
                <tr key={order?.id} className="tf-order-item">
                  <td>#{order?.id?.slice(-6)}</td>
                  <td>{parseDate(order?.createdAt)}</td>
                  <td>
                    <span className={`badge ${
                      order?.status === "DELIVERED" ? "bg-success" :
                      order?.status === "CANCELLED" ? "bg-danger" :
                      order?.status === "PROCESSING" ? "bg-info" :
                      order?.status === "DISPATCHED" ? "bg-primary" :
                      "bg-warning text-dark"
                    }`}>
                      {order?.status}
                    </span>
                  </td>
                  <td>৳{order?.netTotal?.toFixed(2) || "0.00"}</td>
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
