"use client";

import { useState, useEffect } from "react";
import { useContextElement } from "@/context/Context";
import toast from "react-hot-toast";

export default function AccountAddress() {
  const { user } = useContextElement();
  const [activeAdd, setActiveAdd] = useState(false);
  const [activeEdit, setActiveEdit] = useState(false);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);

  const emptyAddress = {
    firstName: "",
    lastName: "",
    company: "",
    address: "",
    city: "",
    country: "Bangladesh",
    zip: "",
    phone: "",
    isDefault: false,
  };
  const [formData, setFormData] = useState(emptyAddress);

  // Load addresses from user data
  useEffect(() => {
    if (user?.addresses) {
      setAddresses(user.addresses);
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const saveAddresses = async (updatedAddresses) => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addresses: updatedAddresses }),
      });
      if (!response.ok) throw new Error("Failed to save address");
      setAddresses(updatedAddresses);
      return true;
    } catch (error) {
      toast.error("Failed to save address");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async () => {
    const newAddress = { ...formData };
    let updated = [...addresses];
    if (newAddress.isDefault) {
      updated = updated.map((a) => ({ ...a, isDefault: false }));
    }
    updated.push(newAddress);

    const success = await saveAddresses(updated);
    if (success) {
      setFormData(emptyAddress);
      setActiveAdd(false);
      toast.success("Address added successfully");
    }
  };

  const handleEditAddress = (index) => {
    setEditingIndex(index);
    setFormData(addresses[index]);
    setActiveEdit(true);
    setActiveAdd(false);
  };

  const handleUpdateAddress = async () => {
    let updated = [...addresses];
    if (formData.isDefault) {
      updated = updated.map((a) => ({ ...a, isDefault: false }));
    }
    updated[editingIndex] = { ...formData };

    const success = await saveAddresses(updated);
    if (success) {
      setFormData(emptyAddress);
      setActiveEdit(false);
      setEditingIndex(-1);
      toast.success("Address updated successfully");
    }
  };

  const handleDeleteAddress = async (index) => {
    const updated = addresses.filter((_, i) => i !== index);
    const success = await saveAddresses(updated);
    if (success) {
      toast.success("Address deleted successfully");
    }
  };

  const renderAddressForm = (isEdit) => (
    <form
      className="show-form-address wd-form-address"
      onSubmit={(e) => e.preventDefault()}
      style={{ display: "block" }}
    >
      <div className="title">
        {isEdit ? "Edit address" : "Add a new address"}
      </div>
      <div className="box-field grid-2-lg">
        <div className="tf-field style-1">
          <input
            className="tf-field-input tf-input"
            placeholder=" "
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
          />
          <label className="tf-field-label fw-4 text_black-2">First name</label>
        </div>
        <div className="tf-field style-1">
          <input
            className="tf-field-input tf-input"
            placeholder=" "
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
          />
          <label className="tf-field-label fw-4 text_black-2">Last name</label>
        </div>
      </div>
      <div className="box-field">
        <div className="tf-field style-1">
          <input
            className="tf-field-input tf-input"
            placeholder=" "
            type="text"
            name="company"
            value={formData.company}
            onChange={handleInputChange}
          />
          <label className="tf-field-label fw-4 text_black-2">Company</label>
        </div>
      </div>
      <div className="box-field">
        <div className="tf-field style-1">
          <input
            className="tf-field-input tf-input"
            placeholder=" "
            type="text"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            required
          />
          <label className="tf-field-label fw-4 text_black-2">Address</label>
        </div>
      </div>
      <div className="box-field">
        <div className="tf-field style-1">
          <input
            className="tf-field-input tf-input"
            placeholder=" "
            type="text"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            required
          />
          <label className="tf-field-label fw-4 text_black-2">City</label>
        </div>
      </div>
      <div className="box-field">
        <label className="mb_10 fw-4 text-start d-block text_black-2">
          Country/Region
        </label>
        <div className="select-custom">
          <select
            className="tf-select w-100"
            name="country"
            value={formData.country}
            onChange={handleInputChange}
          >
            <option value="Bangladesh">Bangladesh</option>
            <option value="India">India</option>
            <option value="United States">United States</option>
            <option value="United Kingdom">United Kingdom</option>
            <option value="Canada">Canada</option>
            <option value="Australia">Australia</option>
          </select>
        </div>
      </div>
      <div className="box-field">
        <div className="tf-field style-1">
          <input
            className="tf-field-input tf-input"
            placeholder=" "
            type="text"
            name="zip"
            value={formData.zip}
            onChange={handleInputChange}
          />
          <label className="tf-field-label fw-4 text_black-2">
            Postal/ZIP code
          </label>
        </div>
      </div>
      <div className="box-field">
        <div className="tf-field style-1">
          <input
            className="tf-field-input tf-input"
            placeholder=" "
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            required
          />
          <label className="tf-field-label fw-4 text_black-2">Phone</label>
        </div>
      </div>
      <div className="box-field text-start">
        <div className="box-checkbox fieldset-radio d-flex align-items-center gap-8">
          <input
            type="checkbox"
            id={isEdit ? "check-edit-address" : "check-new-address"}
            className="tf-check"
            name="isDefault"
            checked={formData.isDefault}
            onChange={handleInputChange}
          />
          <label
            htmlFor={isEdit ? "check-edit-address" : "check-new-address"}
            className="text_black-2 fw-4"
          >
            Set as default address.
          </label>
        </div>
      </div>
      <div className="d-flex align-items-center justify-content-center gap-20">
        <button
          type="button"
          className="tf-btn btn-fill animate-hover-btn"
          disabled={loading}
          onClick={isEdit ? handleUpdateAddress : handleAddAddress}
        >
          {loading
            ? "Saving..."
            : isEdit
              ? "Update address"
              : "Add address"}
        </button>
        <span
          className="tf-btn btn-fill animate-hover-btn btn-hide-address"
          onClick={() => {
            isEdit ? setActiveEdit(false) : setActiveAdd(false);
            setFormData(emptyAddress);
            setEditingIndex(-1);
          }}
        >
          Cancel
        </span>
      </div>
    </form>
  );

  return (
    <div className="my-account-content account-address">
      <div className="text-center widget-inner-address">
        <button
          className="tf-btn btn-fill animate-hover-btn btn-address mb_20"
          onClick={() => {
            setFormData(emptyAddress);
            setActiveAdd(true);
            setActiveEdit(false);
          }}
        >
          Add a new address
        </button>

        {activeAdd && renderAddressForm(false)}

        {addresses.length === 0 && !activeAdd && (
          <p className="text-muted">No addresses saved yet.</p>
        )}

        {addresses.map((addr, index) => (
          <div key={index} className="mb_20">
            <h6 className="mb_10">
              {addr.isDefault ? "Default" : `Address ${index + 1}`}
            </h6>
            <p>
              {addr.firstName} {addr.lastName}
            </p>
            {addr.company && <p>{addr.company}</p>}
            <p>{addr.address}</p>
            <p>
              {addr.city}
              {addr.zip ? `, ${addr.zip}` : ""}
            </p>
            <p>{addr.country}</p>
            <p className="mb_10">{addr.phone}</p>
            <div className="d-flex gap-10 justify-content-center">
              <button
                className="tf-btn btn-fill animate-hover-btn justify-content-center btn-edit-address"
                onClick={() => handleEditAddress(index)}
              >
                <span>Edit</span>
              </button>
              <button
                className="tf-btn btn-outline animate-hover-btn justify-content-center"
                onClick={() => handleDeleteAddress(index)}
                disabled={loading}
              >
                <span>Delete</span>
              </button>
            </div>
            {activeEdit && editingIndex === index && renderAddressForm(true)}
          </div>
        ))}
      </div>
    </div>
  );
}
