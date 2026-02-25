"use client";
import React, { useState, useEffect } from "react";
import { useContextElement } from "@/context/Context";
import { useFirebaseAuth } from "@/lib/firebase-auth-provider";
import toast from "react-hot-toast";

export default function AccountEdit() {
  const { user } = useContextElement();
  const { user: firebaseUser, updatePassword: fbUpdatePassword } = useFirebaseAuth();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  // Pre-fill form with user data
  useEffect(() => {
    if (user) {
      const nameParts = (user.name || "").split(" ");
      setFormData({
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" ") || "",
        email: user.email || "",
      });
    } else if (firebaseUser) {
      const nameParts = (firebaseUser.displayName || "").split(" ");
      setFormData({
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" ") || "",
        email: firebaseUser.email || "",
      });
    }
  }, [user, firebaseUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user && !firebaseUser) {
      toast.error("Please sign in to update your profile");
      return;
    }

    // Validate password fields if user is trying to change password
    const isChangingPassword = passwords.newPassword || passwords.confirmPassword;
    if (isChangingPassword) {
      if (!passwords.currentPassword) {
        toast.error("Please enter your current password");
        return;
      }
      if (passwords.newPassword !== passwords.confirmPassword) {
        toast.error("New passwords do not match");
        return;
      }
      if (passwords.newPassword.length < 6) {
        toast.error("New password must be at least 6 characters");
        return;
      }
    }

    setLoading(true);
    try {
      // Update profile name in Firestore
      const userId = user?.id || firebaseUser?.uid;
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();

      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: fullName }),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      // Update password if requested
      if (isChangingPassword && fbUpdatePassword) {
        try {
          await fbUpdatePassword(passwords.currentPassword, passwords.newPassword);
          setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
          toast.success("Password updated successfully");
        } catch (pwError) {
          toast.error(pwError.message || "Failed to update password");
        }
      }

      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="my-account-content account-edit">
      <div className="">
        <form onSubmit={handleSubmit} className="" id="form-password-change">
          <div className="tf-field style-1 mb_15">
            <input
              className="tf-field-input tf-input"
              placeholder=" "
              type="text"
              id="property1"
              required
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
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
              required
              id="property2"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
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
              required
              id="property3"
              name="email"
              value={formData.email}
              disabled
            />
            <label
              className="tf-field-label fw-4 text_black-2"
              htmlFor="property3"
            >
              Email
            </label>
          </div>
          <h6 className="mb_20">Password Change</h6>
          <div className="tf-field style-1 mb_30">
            <input
              className="tf-field-input tf-input"
              placeholder=" "
              type="password"
              autoComplete="current-password"
              id="property4"
              name="currentPassword"
              value={passwords.currentPassword}
              onChange={handlePasswordChange}
            />
            <label
              className="tf-field-label fw-4 text_black-2"
              htmlFor="property4"
            >
              Current password
            </label>
          </div>
          <div className="tf-field style-1 mb_30">
            <input
              className="tf-field-input tf-input"
              placeholder=" "
              type="password"
              id="property5"
              autoComplete="new-password"
              name="newPassword"
              value={passwords.newPassword}
              onChange={handlePasswordChange}
            />
            <label
              className="tf-field-label fw-4 text_black-2"
              htmlFor="property5"
            >
              New password
            </label>
          </div>
          <div className="tf-field style-1 mb_30">
            <input
              className="tf-field-input tf-input"
              placeholder=" "
              type="password"
              id="property6"
              autoComplete="new-password"
              name="confirmPassword"
              value={passwords.confirmPassword}
              onChange={handlePasswordChange}
            />
            <label
              className="tf-field-label fw-4 text_black-2"
              htmlFor="property6"
            >
              Confirm password
            </label>
          </div>
          <div className="mb_20">
            <button
              type="submit"
              className="tf-btn w-100 radius-3 btn-fill animate-hover-btn justify-content-center"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
