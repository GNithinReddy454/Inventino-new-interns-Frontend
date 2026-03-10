"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  ArrowLeft,
  CheckCircle2,
  Home,
  Briefcase,
  Globe,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { addressService } from "@/services/address.service";
import type { SavedAddress, AddressType, AddressFormData } from "@/types/address";

/* ── Chevron icon for selects ──────────────────────────────────────────────── */
const Chevron = () => (
  <svg
    className="select-chevron"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

/* ── Reusable Field wrapper ────────────────────────────────────────────────── */
function Field({
  label,
  required,
  hint,
  span2,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  span2?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div style={span2 ? { gridColumn: "1 / -1" } : {}}>
      <label className="form-label">
        {label}
        {required && <span className="form-label-req">*</span>}
        {!required && <span className="form-label-opt">(Optional)</span>}
      </label>
      {children}
      {hint && <p className="form-hint">{hint}</p>}
    </div>
  );
}

/* ── Section heading ───────────────────────────────────────────────────────── */
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontSize: 13.5,
        fontWeight: 600,
        color: "#111827",
        marginBottom: 16,
      }}
    >
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: "#D94F7A",
          display: "inline-block",
          flexShrink: 0,
        }}
      />
      {children}
    </h2>
  );
}

/* ── Page ──────────────────────────────────────────────────────────────────── */
export default function AddressesPage() {
  const [showForm, setShowForm] = useState(false);
  const [setAsDefault, setSetAsDefault] = useState(false);
  const [selectedType, setSelectedType] = useState<AddressType>("Home");
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingAddress, setEditingAddress] = useState<SavedAddress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const empty: AddressFormData = {
    fullName: "",
    phone: "",
    email: "",
    street: "",
    apartment: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    landmark: "",
  };
  const [form, setForm] = useState<AddressFormData>(empty);
  const set = (id: keyof AddressFormData, v: string) => setForm((p) => ({ ...p, [id]: v }));

  /* ── Fetch addresses on mount ─────────────────────────────────────────── */
  useEffect(() => {
    fetchAddresses();
  }, []);

  async function fetchAddresses() {
    try {
      setLoading(true);
      setError(null);
      const response = await addressService.getAddresses();
      setAddresses(response?.data ?? []);
    } catch (err: any) {
      setError("Failed to load addresses. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  /* ── Open edit form ───────────────────────────────────────────────────── */
  function openEdit(addr: SavedAddress) {
    setEditingAddress(addr);
    setSelectedType((addr.addressType as AddressType) ?? "Home");
    setSetAsDefault(addr.isDefault);
    setForm({
      fullName: addr.fullName ?? "",
      phone: addr.phone ?? "",
      email: addr.email ?? "",
      street: addr.street ?? "",
      apartment: "",
      city: addr.city ?? "",
      state: addr.state ?? "",
      pincode: addr.pincode ?? "",
      country: addr.country ?? "India",
      landmark: "",
    });
    setShowForm(true);
  }

  /* ── Reset form & close ───────────────────────────────────────────────── */
  function closeForm() {
    setShowForm(false);
    setEditingAddress(null);
    setForm(empty);
    setSelectedType("Home");
    setSetAsDefault(false);
  }

  /* ── Submit: add or update ────────────────────────────────────────────── */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const payload = {
      fullName: form.fullName,
      phone: form.phone,
      email: form.email,
      street: form.street,
      city: form.city,
      state: form.state,
      pincode: form.pincode,
      country: form.country,
      isDefault: setAsDefault,
      addressType: selectedType,
    };

    try {
      if (editingAddress) {
        await addressService.updateAddress(editingAddress._id, payload);
      } else {
        await addressService.addAddress(payload);
      }
      await fetchAddresses();
      closeForm();
    } catch (err: any) {
      setError(
        editingAddress
          ? "Failed to update address. Please try again."
          : "Failed to add address. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  /* ── Delete ───────────────────────────────────────────────────────────── */
  async function handleDelete(id: string) {
    setDeletingId(id);
    setError(null);
    try {
      await addressService.deleteAddress(id);
      setAddresses((prev) => prev.filter((a) => a._id !== id));
    } catch (err: any) {
      setError("Failed to delete address. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div
      style={{
        background: "#fdf8f9",
        minHeight: "100vh",
        paddingBottom: 80,
        fontFamily: "'Roboto', sans-serif",
      }}
    >
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 16px" }}>
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 24,
          }}
        >
          {showForm ? (
            <button
              type="button"
              onClick={closeForm}
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "#fff",
                border: "1px solid #fce7f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#D94F7A",
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                flexShrink: 0,
                cursor: "pointer",
              }}
            >
              <ArrowLeft size={17} />
            </button>
          ) : (
            <Link
              href="/profile"
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "#fff",
                border: "1px solid #fce7f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#D94F7A",
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                flexShrink: 0,
              }}
            >
              <ArrowLeft size={17} />
            </Link>
          )}
          <div>
            <h1
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "#111827",
                lineHeight: 1.3,
              }}
            >
              {showForm
                ? editingAddress
                  ? "Edit Address"
                  : "Add New Address"
                : "Saved Addresses"}
            </h1>
            <p style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>
              {showForm
                ? "Fill in the details below to save your delivery address"
                : "Manage your saved delivery addresses"}
            </p>
          </div>
        </div>

        {/* ── Global error banner ─────────────────────────────────────────── */}
        {error && (
          <div
            style={{
              marginBottom: 16,
              padding: "10px 14px",
              borderRadius: 10,
              background: "#FEF2F2",
              border: "1px solid #FECACA",
              color: "#DC2626",
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}

        {!showForm ? (
          /* ── Address list ──────────────────────────────────────────────── */
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <button
              onClick={() => setShowForm(true)}
              style={{
                width: "100%",
                padding: 20,
                border: "2px dashed #f5c6d8",
                borderRadius: 16,
                background: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                color: "#D94F7A",
                fontFamily: "inherit",
                cursor: "pointer",
                fontSize: 13.5,
                fontWeight: 600,
              }}
            >
              <span
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  background: "#fff5f8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Plus size={18} />
              </span>
              Add New Address
            </button>

            {loading ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  padding: "40px 0",
                  color: "#D94F7A",
                }}
              >
                <Loader2 size={28} style={{ animation: "spin 1s linear infinite" }} />
                <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))",
                  gap: 16,
                }}
              >
                {addresses.map((addr) => (
                  <div
                    key={addr._id}
                    style={{
                      background: "#fff",
                      padding: 20,
                      borderRadius: 16,
                      border: "1px solid #fce7f0",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                      position: "relative",
                      opacity: deletingId === addr._id ? 0.5 : 1,
                      transition: "opacity 0.2s",
                    }}
                  >
                    {addr.isDefault && (
                      <span
                        style={{
                          position: "absolute",
                          top: 14,
                          right: 14,
                          fontSize: 11,
                          fontWeight: 600,
                          color: "#059669",
                          background: "#ecfdf5",
                          borderRadius: 99,
                          padding: "2px 8px",
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <CheckCircle2 size={11} /> Default
                      </span>
                    )}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        marginBottom: 10,
                      }}
                    >
                      <span
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 10,
                          background: "#fff5f8",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#D94F7A",
                        }}
                      >
                        {addr.addressType === "Home" ? (
                          <Home size={15} />
                        ) : addr.addressType === "Office" ? (
                          <Briefcase size={15} />
                        ) : (
                          <Globe size={15} />
                        )}
                      </span>
                      <div>
                        <p
                          style={{
                            fontWeight: 600,
                            fontSize: 13.5,
                            color: "#111827",
                          }}
                        >
                          {addr.addressType}
                        </p>
                        <p style={{ fontSize: 12, color: "#6B7280" }}>
                          {addr.fullName}
                        </p>
                      </div>
                    </div>
                    <p
                      style={{
                        fontSize: 12,
                        color: "#6B7280",
                        lineHeight: 1.6,
                        marginBottom: 14,
                      }}
                    >
                      {addr.street}
                      <br />
                      {addr.city}
                      {addr.state ? `, ${addr.state}` : ""} {addr.pincode}
                      {addr.country ? (
                        <>
                          <br />
                          {addr.country}
                        </>
                      ) : null}
                    </p>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={() => openEdit(addr)}
                        style={{
                          flex: 1,
                          padding: "7px 0",
                          borderRadius: 8,
                          border: "1px solid #E5E7EB",
                          background: "#F9FAFB",
                          color: "#374151",
                          fontSize: 12.5,
                          fontWeight: 600,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 5,
                          cursor: "pointer",
                          fontFamily: "inherit",
                        }}
                      >
                        <Edit2 size={12} /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(addr._id)}
                        disabled={deletingId === addr._id}
                        style={{
                          padding: "7px 10px",
                          borderRadius: 8,
                          border: "none",
                          background: "#FEF2F2",
                          color: "#EF4444",
                          cursor: deletingId === addr._id ? "not-allowed" : "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {deletingId === addr._id ? (
                          <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} />
                        ) : (
                          <Trash2 size={15} />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* ── Add / Edit address form ────────────────────────────────────── */
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              border: "1px solid #fce7f0",
              boxShadow: "0 2px 12px rgba(217,79,122,0.06)",
              overflow: "hidden",
            }}
          >
            <form onSubmit={handleSubmit}>
              {/* Address Type */}
              <div
                style={{
                  padding: "24px 24px 20px",
                  borderBottom: "1px solid #f3f4f6",
                }}
              >
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#374151",
                    marginBottom: 12,
                  }}
                >
                  Address Type
                </p>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: 12,
                  }}
                >
                  {(["Home", "Office", "Other"] as AddressType[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setSelectedType(t)}
                      style={{
                        padding: "10px 0",
                        borderRadius: 8,
                        border: `1.5px solid ${selectedType === t ? "#D94F7A" : "#E5E7EB"}`,
                        background: selectedType === t ? "#D94F7A" : "#fff",
                        color: selectedType === t ? "#fff" : "#6B7280",
                        fontSize: 13.5,
                        fontWeight: 500,
                        fontFamily: "inherit",
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Contact Information */}
              <div
                style={{
                  padding: "20px 24px",
                  borderBottom: "1px solid #f3f4f6",
                }}
              >
                <SectionTitle>Contact Information</SectionTitle>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 16,
                  }}
                >
                  <Field label="Full Name" required>
                    <input
                      className="input-basic"
                      placeholder="John Doe"
                      value={form.fullName}
                      onChange={(e) => set("fullName", e.target.value)}
                      required
                    />
                  </Field>
                  <Field label="Phone Number" required>
                    <input
                      className="input-basic"
                      type="tel"
                      placeholder="+91 98456 71230"
                      value={form.phone}
                      onChange={(e) => set("phone", e.target.value)}
                      required
                    />
                  </Field>
                  <Field
                    label="Email Address"
                    required
                    span2
                    hint="We'll send order updates to this email"
                  >
                    <input
                      className="input-basic"
                      type="email"
                      placeholder="john.doe@example.com"
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                      required
                    />
                  </Field>
                </div>
              </div>

              {/* Address Details */}
              <div
                style={{
                  padding: "20px 24px",
                  borderBottom: "1px solid #f3f4f6",
                }}
              >
                <SectionTitle>Address Details</SectionTitle>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 16 }}
                >
                  <Field label="Street Address" required>
                    <input
                      className="input-basic"
                      placeholder="78 Jubilee Hills"
                      value={form.street}
                      onChange={(e) => set("street", e.target.value)}
                      required
                    />
                  </Field>

                  <Field label="Apartment, Suite, Unit, Building">
                    <input
                      className="input-basic"
                      placeholder="Apartment 4B, Floor 2"
                      value={form.apartment}
                      onChange={(e) => set("apartment", e.target.value)}
                    />
                  </Field>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 16,
                    }}
                  >
                    <Field label="City" required>
                      <input
                        className="input-basic"
                        placeholder="Hyderabad"
                        value={form.city}
                        onChange={(e) => set("city", e.target.value)}
                        required
                      />
                    </Field>
                    <Field label="State / Province" required>
                      <div className="select-wrapper">
                        <select
                          className="input-select"
                          value={form.state}
                          onChange={(e) => set("state", e.target.value)}
                          required
                        >
                          <option value="" disabled>
                            Select State
                          </option>
                          <option value="NY">New York</option>
                          <option value="CA">California</option>
                          <option value="TX">Texas</option>
                          <option value="FL">Florida</option>
                          <option value="IL">Illinois</option>
                          <option value="Telangana">Telangana</option>
                          <option value="Maharashtra">Maharashtra</option>
                          <option value="Karnataka">Karnataka</option>
                          <option value="Tamil Nadu">Tamil Nadu</option>
                          <option value="Delhi">Delhi</option>
                        </select>
                        <Chevron />
                      </div>
                    </Field>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 16,
                    }}
                  >
                    <Field label="ZIP / Postal Code" required>
                      <input
                        className="input-basic"
                        placeholder="500033"
                        value={form.pincode}
                        onChange={(e) => set("pincode", e.target.value)}
                        required
                      />
                    </Field>
                    <Field label="Country" required>
                      <div className="select-wrapper">
                        <select
                          className="input-select"
                          value={form.country}
                          onChange={(e) => set("country", e.target.value)}
                        >
                          <option value="India">India</option>
                          <option value="United States">United States</option>
                          <option value="United Kingdom">United Kingdom</option>
                          <option value="Canada">Canada</option>
                          <option value="Australia">Australia</option>
                        </select>
                        <Chevron />
                      </div>
                    </Field>
                  </div>

                  <Field
                    label="Landmark"
                    hint="Add a nearby landmark to help delivery partners locate easily"
                  >
                    <input
                      className="input-basic"
                      placeholder="Near Central Park, opposite City Hall"
                      value={form.landmark}
                      onChange={(e) => set("landmark", e.target.value)}
                    />
                  </Field>
                </div>
              </div>

              {/* Additional Options */}
              <div
                style={{
                  padding: "20px 24px",
                  borderBottom: "1px solid #f3f4f6",
                }}
              >
                <SectionTitle>Additional Options</SectionTitle>
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    padding: "12px 14px",
                    borderRadius: 10,
                    background: "#EFF6FF",
                    border: "1px solid #BFDBFE",
                    marginBottom: 14,
                  }}
                >
                  <div
                    style={{
                      width: 3,
                      borderRadius: 2,
                      background: "#60A5FA",
                      alignSelf: "stretch",
                      flexShrink: 0,
                    }}
                  />
                  <div>
                    <p
                      style={{
                        fontSize: 12.5,
                        fontWeight: 600,
                        color: "#1D4ED8",
                      }}
                    >
                      Default Address
                    </p>
                    <p
                      style={{
                        fontSize: 12,
                        color: "#3B82F6",
                        marginTop: 2,
                        lineHeight: 1.5,
                      }}
                    >
                      Setting this as your default address will automatically
                      select it for checkout. You can change this anytime.
                    </p>
                  </div>
                </div>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 9,
                    cursor: "pointer",
                  }}
                >
                  <div
                    onClick={() => setSetAsDefault(!setAsDefault)}
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: 4,
                      border: `2px solid ${setAsDefault ? "#D94F7A" : "#D1D5DB"}`,
                      background: setAsDefault ? "#D94F7A" : "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      transition: "all 0.15s",
                    }}
                  >
                    {setAsDefault && (
                      <svg
                        viewBox="0 0 10 8"
                        fill="none"
                        width="10"
                        height="10"
                      >
                        <path
                          d="M1 4l3 3 5-6"
                          stroke="white"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                  <span style={{ fontSize: 13, color: "#4B5563" }}>
                    Set as default delivery address
                  </span>
                </label>
              </div>

              {/* Buttons */}
              <div style={{ padding: "20px 24px", display: "flex", gap: 12 }}>
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={submitting}
                  style={{
                    flex: 1,
                    height: 46,
                    borderRadius: 10,
                    border: "1.5px solid #D94F7A",
                    background: "#fff",
                    color: "#D94F7A",
                    fontSize: 14,
                    fontWeight: 600,
                    fontFamily: "inherit",
                    cursor: submitting ? "not-allowed" : "pointer",
                    opacity: submitting ? 0.6 : 1,
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    flex: 1,
                    height: 46,
                    borderRadius: 10,
                    border: "none",
                    background: "#D94F7A",
                    color: "#fff",
                    fontSize: 14,
                    fontWeight: 600,
                    fontFamily: "inherit",
                    cursor: submitting ? "not-allowed" : "pointer",
                    boxShadow: "0 4px 14px rgba(217,79,122,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    opacity: submitting ? 0.8 : 1,
                  }}
                >
                  {submitting && (
                    <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                  )}
                  {submitting
                    ? editingAddress
                      ? "Updating..."
                      : "Saving..."
                    : editingAddress
                    ? "Update Address"
                    : "Save Address"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}