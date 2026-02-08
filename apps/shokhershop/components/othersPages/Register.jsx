"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSignUp, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function Register() {
  const { signUp, isLoaded, setActive } = useSignUp();
  const { isLoaded: isAuthLoaded, userId } = useAuth();
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

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthLoaded && userId) {
      router.push("/my-account");
    }
  }, [isAuthLoaded, userId, router]);

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
      setError(err.errors?.[0]?.message || "Registration failed. Please try again.");
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
        router.push("/my-account");
      }
    } catch (err) {
      console.error("Verification error:", err);
      setError(err.errors?.[0]?.message || "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <section className="flat-spacing-10">
        <div className="container">
          <div className="form-register-wrap">
            <div className="flat-title align-items-start gap-0 mb_30 px-0">
              <h5 className="mb_18">Verify Your Email</h5>
              <p className="text_black-2">
                We've sent a verification code to {formData.email}. Please enter it below.
              </p>
            </div>
            <div>
              <form onSubmit={handleVerify} className="">
                {error && (
                  <div className="alert alert-danger mb_15" role="alert">
                    {error}
                  </div>
                )}
                <div className="tf-field style-1 mb_15">
                  <input
                    className="tf-field-input tf-input"
                    placeholder=" "
                    type="text"
                    id="verification-code"
                    name="code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                  />
                  <label
                    className="tf-field-label fw-4 text_black-2"
                    htmlFor="verification-code"
                  >
                    Verification Code *
                  </label>
                </div>
                <div className="mb_20">
                  <button
                    type="submit"
                    className="tf-btn w-100 radius-3 btn-fill animate-hover-btn justify-content-center"
                    disabled={loading || !code}
                  >
                    {loading ? "Verifying..." : "Verify Email"}
                  </button>
                </div>
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setVerifying(false)}
                    className="tf-btn btn-line"
                  >
                    Back to registration
                    <i className="icon icon-arrow1-top-left" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="flat-spacing-10">
      <div className="container">
        <div className="form-register-wrap">
          <div className="flat-title align-items-start gap-0 mb_30 px-0">
            <h5 className="mb_18">Register</h5>
            <p className="text_black-2">
              Sign up for early Sale access plus tailored new arrivals, trends
              and promotions. To opt out, click unsubscribe in our emails
            </p>
          </div>
          <div>
            {error && (
              <div className="alert alert-danger mb_15" role="alert">
                {error}
              </div>
            )}
            <form
              onSubmit={handleSubmit}
              className=""
              id="register-form"
            >
              <div className="tf-field style-1 mb_15">
                <input
                  className="tf-field-input tf-input"
                  placeholder=" "
                  type="text"
                  id="property1"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
                <label
                  className="tf-field-label fw-4 text_black-2"
                  htmlFor="property1"
                >
                  First name
                </label>
              </div>
              <div className="tf-field style-1 mb_15">
                <input
                  className="tf-field-input tf-input"
                  placeholder=" "
                  type="text"
                  id="property2"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
                <label
                  className="tf-field-label fw-4 text_black-2"
                  htmlFor="property2"
                >
                  Last name
                </label>
              </div>
              <div className="tf-field style-1 mb_15">
                <input
                  className="tf-field-input tf-input"
                  placeholder=" "
                  type="email"
                  autoComplete="email"
                  id="property3"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <label
                  className="tf-field-label fw-4 text_black-2"
                  htmlFor="property3"
                >
                  Email *
                </label>
              </div>
              <div className="tf-field style-1 mb_30">
                <input
                  className="tf-field-input tf-input"
                  placeholder=" "
                  type="password"
                  id="property4"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                />
                <label
                  className="tf-field-label fw-4 text_black-2"
                  htmlFor="property4"
                >
                  Password *
                </label>
              </div>
              <div className="mb_20">
                <button
                  type="submit"
                  className="tf-btn w-100 radius-3 btn-fill animate-hover-btn justify-content-center"
                  disabled={loading}
                >
                  {loading ? "Creating account..." : "Register"}
                </button>
              </div>
              <div className="text-center">
                <Link href={`/login`} className="tf-btn btn-line">
                  Already have an account? Log in here
                  <i className="icon icon-arrow1-top-left" />
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
