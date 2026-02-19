"use client";
import React, { useState } from "react";
import { useFirebaseAuth } from "@/lib/firebase-auth-provider";

export default function ResetPass() {
  const { resetPassword, isLoaded } = useFirebaseAuth();

  const [email, setEmail] = useState("");
  const [step, setStep] = useState("email"); // email, success
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRequestReset = async (e) => {
    e.preventDefault();
    if (!isLoaded) return;

    setLoading(true);
    setError("");

    try {
      await resetPassword(email);
      setStep("success");
    } catch (err) {
      console.error("Reset request error:", err);
      setError(err.message || "Failed to send reset email.");
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    const modalElement = document.getElementById("forgotPassword");
    const bootstrap = require("bootstrap");
    const modal = bootstrap.Modal.getInstance(modalElement);
    if (modal) modal.hide();

    // Reset state
    setEmail("");
    setStep("email");
    setError("");
  };

  return (
    <div
      className="modal modalCentered fade form-sign-in modal-part-content"
      id="forgotPassword"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="header">
            <div className="demo-title">
              {step === "email" && "Reset your password"}
              {step === "success" && "Check your email"}
            </div>
            <span
              className="icon-close icon-close-popup"
              data-bs-dismiss="modal"
              onClick={closeModal}
            />
          </div>
          <div className="tf-login-form">
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            {step === "email" && (
              <form onSubmit={handleRequestReset} className="">
                <div>
                  <p>
                    Enter your email address and we'll send you a link to reset
                    your password.
                  </p>
                </div>
                <div className="tf-field style-1">
                  <input
                    className="tf-field-input tf-input"
                    placeholder=" "
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <label className="tf-field-label" htmlFor="">
                    Email *
                  </label>
                </div>
                <div>
                  <a
                    href="#login"
                    data-bs-toggle="modal"
                    className="btn-link link"
                  >
                    Cancel
                  </a>
                </div>
                <div className="bottom">
                  <div className="w-100">
                    <button
                      type="submit"
                      className="tf-btn btn-fill animate-hover-btn radius-3 w-100 justify-content-center"
                      disabled={loading}
                    >
                      <span>{loading ? "Sending..." : "Send reset link"}</span>
                    </button>
                  </div>
                </div>
              </form>
            )}

            {step === "success" && (
              <div className="">
                <div className="mb_20">
                  <p>
                    We've sent a password reset link to {email}. Please check
                    your email and follow the instructions to reset your password.
                  </p>
                </div>
                <div className="bottom">
                  <div className="w-100">
                    <a
                      href="#login"
                      data-bs-toggle="modal"
                      className="tf-btn btn-fill animate-hover-btn radius-3 w-100 justify-content-center"
                      onClick={closeModal}
                    >
                      <span>Back to login</span>
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
