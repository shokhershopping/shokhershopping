"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function Register() {
  const { signUp, isLoaded, setActive } = useSignUp();
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: ""
  });
  const [verifying, setVerifying] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLoaded) return;

    setLoading(true);
    setError("");

    try {
      await signUp.create({
        emailAddress: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
      });

      await signUp.prepareEmailAddressVerification({
        strategy: "email_code"
      });

      setVerifying(true);
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.errors?.[0]?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!isLoaded) return;

    setLoading(true);
    setError("");

    try {
      const result = await signUp.attemptEmailAddressVerification({
        code
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });

        // Close modal
        const modalElement = document.getElementById("register");
        const bootstrap = require("bootstrap");
        const modal = bootstrap.Modal.getInstance(modalElement);
        if (modal) modal.hide();

        router.push("/my-account");
      }
    } catch (err) {
      console.error("Verification error:", err);
      setError(err.errors?.[0]?.message || "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal modalCentered fade form-sign-in modal-part-content"
      id="register"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="header">
            <div className="demo-title">{verifying ? "Verify Email" : "Register"}</div>
            <span
              className="icon-close icon-close-popup"
              data-bs-dismiss="modal"
            />
          </div>
          <div className="tf-login-form">
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            {verifying ? (
              <form onSubmit={handleVerify} className="">
                <p className="mb_15">We've sent a verification code to {formData.email}</p>
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
                    Verification Code *
                  </label>
                </div>
                <div className="bottom">
                  <div className="w-100">
                    <button
                      type="submit"
                      className="tf-btn btn-fill animate-hover-btn radius-3 w-100 justify-content-center"
                      disabled={loading || !code}
                    >
                      <span>{loading ? "Verifying..." : "Verify Email"}</span>
                    </button>
                  </div>
                  <div className="w-100">
                    <button
                      type="button"
                      onClick={() => setVerifying(false)}
                      className="btn-link fw-6 w-100 link"
                    >
                      Back to registration
                      <i className="icon icon-arrow1-top-left" />
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="">
                <div className="tf-field style-1">
                  <input
                    className="tf-field-input tf-input"
                    placeholder=" "
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                  <label className="tf-field-label" htmlFor="">
                    First name
                  </label>
                </div>
                <div className="tf-field style-1">
                  <input
                    className="tf-field-input tf-input"
                    placeholder=" "
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                  <label className="tf-field-label" htmlFor="">
                    Last name
                  </label>
                </div>
                <div className="tf-field style-1">
                  <input
                    className="tf-field-input tf-input"
                    placeholder=" "
                    type="email"
                    autoComplete="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  <label className="tf-field-label" htmlFor="">
                    Email *
                  </label>
                </div>
                <div className="tf-field style-1">
                  <input
                    className="tf-field-input tf-input"
                    placeholder=" "
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    autoComplete="new-password"
                  />
                  <label className="tf-field-label" htmlFor="">
                    Password *
                  </label>
                </div>
                <div className="bottom">
                  <div className="w-100">
                    <button
                      type="submit"
                      className="tf-btn btn-fill animate-hover-btn radius-3 w-100 justify-content-center"
                      disabled={loading}
                    >
                      <span>{loading ? "Creating account..." : "Register"}</span>
                    </button>
                  </div>
                  <div className="w-100">
                    <a
                      href="#login"
                      data-bs-toggle="modal"
                      className="btn-link fw-6 w-100 link"
                    >
                      Already have an account? Log in here
                      <i className="icon icon-arrow1-top-left" />
                    </a>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
