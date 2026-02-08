"use client";
import React from "react";

export default function CancelOrderModal({ orderId, onConfirm, isLoading }) {
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm(orderId);
    }
    // Close modal
    const modalElement = document.getElementById("cancelOrderModal");
    if (modalElement && typeof window !== "undefined") {
      const bootstrap = require("bootstrap");
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) modal.hide();
    }
  };

  return (
    <div
      className="modal fade modalCentered"
      id="cancelOrderModal"
      tabIndex={-1}
      aria-labelledby="cancelOrderModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div style={{ position: "relative" }}>
            <span
              className="icon-close icon-close-popup"
              data-bs-dismiss="modal"
              aria-label="Close"
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                cursor: "pointer",
                zIndex: 10,
              }}
            />
          </div>
          <div className="modal-body" style={{ padding: "40px 30px 30px 30px" }}>
            <div className="text-center mb-4">
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  backgroundColor: "#fff3cd",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#ff9800"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              </div>
              <h5 className="mb-3 fw-6">Are you sure?</h5>
              <p className="text-muted" style={{ fontSize: "15px" }}>
                Do you really want to cancel this order? This action cannot be undone.
              </p>
              {orderId && (
                <p className="text-muted" style={{ fontSize: "13px" }}>
                  Order ID: <span className="fw-6">#{orderId}</span>
                </p>
              )}
            </div>
          </div>
          <div
            className="modal-footer"
            style={{
              borderTop: "1px solid #dee2e6",
              padding: "20px 30px",
              display: "flex",
              gap: "10px",
              justifyContent: "center",
            }}
          >
            <button
              type="button"
              className="tf-btn btn-outline-dark radius-3"
              data-bs-dismiss="modal"
              disabled={isLoading}
              style={{ minWidth: "120px" }}
            >
              <span>No, Keep It</span>
            </button>
            <button
              type="button"
              className="tf-btn btn-fill animate-hover-btn radius-3"
              onClick={handleConfirm}
              disabled={isLoading}
              style={{
                minWidth: "120px",
                backgroundColor: "#dc3545",
                borderColor: "#dc3545",
              }}
            >
              <span>{isLoading ? "Cancelling..." : "Yes, Cancel"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
