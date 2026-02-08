"use client";
import React, { useState } from "react";
import { useSignIn } from "@clerk/nextjs";

export default function ResetPass() {
  const { signIn, isLoaded } = useSignIn();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState("email"); // email, code, success
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRequestReset = async (e) => {
    e.preventDefault();
    if (!isLoaded) return;

    setLoading(true);
    setError("");

    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });

      setStep("code");
    } catch (err) {
      console.error("Reset request error:", err);
      setError(err.errors?.[0]?.message || "Failed to send reset email.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!isLoaded) return;

    setLoading(true);
    setError("");

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code: code,
        password: password,
      });

      if (result.status === "complete") {
        setStep("success");
      }
    } catch (err) {
      console.error("Password reset error:", err);
      setError(err.errors?.[0]?.message || "Password reset failed.");
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
    setCode("");
    setPassword("");
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
              {step === "code" && "Enter reset code"}
              {step === "success" && "Password reset successful"}
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
                    Enter your email address and we'll send you a code to reset
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
                      <span>{loading ? "Sending..." : "Send reset code"}</span>
                    </button>
                  </div>
                </div>
              </form>
            )}

            {step === "code" && (
              <form onSubmit={handleResetPassword} className="">
                <div>
                  <p className="mb_15">
                    We've sent a reset code to {email}. Enter the code and your
                    new password below.
                  </p>
                </div>
                <div className="tf-field style-1">
                  <input
                    className="tf-field-input tf-input"
                    placeholder=" "
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                  />
                  <label className="tf-field-label" htmlFor="">
                    Reset Code *
                  </label>
                </div>
                <div className="tf-field style-1">
                  <input
                    className="tf-field-input tf-input"
                    placeholder=" "
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                  <label className="tf-field-label" htmlFor="">
                    New Password *
                  </label>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => setStep("email")}
                    className="btn-link link"
                  >
                    Back
                  </button>
                </div>
                <div className="bottom">
                  <div className="w-100">
                    <button
                      type="submit"
                      className="tf-btn btn-fill animate-hover-btn radius-3 w-100 justify-content-center"
                      disabled={loading}
                    >
                      <span>{loading ? "Resetting..." : "Reset password"}</span>
                    </button>
                  </div>
                </div>
              </form>
            )}

            {step === "success" && (
              <div className="">
                <div className="mb_20">
                  <p>Your password has been reset successfully!</p>
                </div>
                <div className="bottom">
                  <div className="w-100">
                    <a
                      href="#login"
                      data-bs-toggle="modal"
                      className="tf-btn btn-fill animate-hover-btn radius-3 w-100 justify-content-center"
                    >
                      <span>Log in with new password</span>
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
