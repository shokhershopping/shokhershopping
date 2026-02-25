"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useFirebaseAuth } from "@/lib/firebase-auth-provider";
import { useRouter, useSearchParams } from "next/navigation";

export default function Login() {
  const { signIn, isLoaded, isSignedIn } = useFirebaseAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("/my-account");
    }
  }, [isLoaded, isSignedIn, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLoaded) return;

    setLoading(true);
    setError("");

    try {
      await signIn(email, password);

      // Check for redirect URL in query params
      const redirectUrl = searchParams.get("redirect_url") || "/my-account";
      router.push(redirectUrl);
    } catch (err) {
      setError(err.message || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flat-spacing-10">
      <div className="container">
        <div className="form-register-wrap">
          <div className="flat-title align-items-start gap-0 mb_30 px-0">
            <h5 className="mb_18">Log in</h5>
            <p className="text_black-2">
              Welcome back! Sign in to access your account
            </p>
          </div>
          <div>
            {error && (
              <div className="alert alert-danger mb_15" role="alert">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="">
              <div className="tf-field style-1 mb_15">
                <input
                  className="tf-field-input tf-input"
                  placeholder=" "
                  type="email"
                  id="login-email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
                <label
                  className="tf-field-label fw-4 text_black-2"
                  htmlFor="login-email"
                >
                  Email *
                </label>
              </div>
              <div className="tf-field style-1 mb_15">
                <input
                  className="tf-field-input tf-input"
                  placeholder=" "
                  type="password"
                  id="login-password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <label
                  className="tf-field-label fw-4 text_black-2"
                  htmlFor="login-password"
                >
                  Password *
                </label>
              </div>
              <div className="mb_15">
                <a
                  href="#forgotPassword"
                  data-bs-toggle="modal"
                  className="btn-link link"
                >
                  Forgot your password?
                </a>
              </div>
              <div className="mb_20">
                <button
                  type="submit"
                  className="tf-btn w-100 radius-3 btn-fill animate-hover-btn justify-content-center"
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Log in"}
                </button>
              </div>
              <div className="text-center">
                <Link href={`/register`} className="tf-btn btn-line">
                  New customer? Create your account
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
