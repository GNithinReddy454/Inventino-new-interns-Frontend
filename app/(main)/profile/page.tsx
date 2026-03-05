"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/app/(main)/components/authContext";
import {
  User,
  Package,
  MapPin,
  CreditCard,
  Settings,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { withAuth } from "@/app/components/hoc/withAuth";
import { userService } from "@/services/user.service";
import { useRouter } from "next/navigation";

interface ApiUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

function ProfilePage() {
  const { logout } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  /* ── Fetch profile on mount ─────────────────────────────────────────── */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await userService.getProfile();
        if (res?.data) {
          setProfile(res.data);
        }
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  /* ── Delete account ─────────────────────────────────────────────────── */
  const handleDeleteAccount = async () => {
    try {
      setDeleting(true);
      await userService.deleteAccount();
      logout();
      router.push("/login");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to delete account.");
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  /* ── Derived values ─────────────────────────────────────────────────── */
  const initials = profile?.name
    ? profile.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "—";

  const menuItems = [
    { label: "Profile Info", icon: User, href: "/profile", active: true },
    { label: "My Orders", icon: Package, href: "/profile/orders" },
    { label: "Saved Addresses", icon: MapPin, href: "/profile/addresses" },
    { label: "Payment Methods", icon: CreditCard, href: "/profile/payments" },
    { label: "Settings", icon: Settings, href: "/profile/settings" },
  ];

  return (
    <div
      style={{
        background: "#fdf8f9",
        minHeight: "100vh",
        paddingBottom: 80,
        fontFamily: "Roboto, sans-serif",
      }}
    >
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "24px 16px" }}>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: "#111",
            marginBottom: 24,
          }}
        >
          Profile Settings
        </h1>

        {/* ── API Error Banner ── */}
        {error && (
          <div
            style={{
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: 8,
              padding: "10px 16px",
              marginBottom: 16,
              fontSize: 13,
              color: "#dc2626",
            }}
          >
            ⚠️ {error}
          </div>
        )}

        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            border: "1px solid #fce7f3",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            overflow: "hidden",
          }}
        >
          <div className="profile-layout">
            {/* ── Sidebar ── */}
            <div className="profile-sidebar">
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: "50%",
                  background: "#D94F7A",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: 24,
                  fontWeight: 700,
                  marginBottom: 10,
                  flexShrink: 0,
                }}
              >
                {loading ? (
                  <Loader2
                    size={24}
                    style={{ animation: "spin 1s linear infinite" }}
                  />
                ) : (
                  initials
                )}
              </div>
              <p
                style={{
                  fontWeight: 600,
                  fontSize: 14,
                  color: "#111",
                  textAlign: "center",
                }}
              >
                {loading ? "Loading..." : profile?.name || "—"}
              </p>
              <p
                style={{
                  fontSize: 11,
                  color: "#9ca3af",
                  marginTop: 2,
                  marginBottom: 20,
                  textAlign: "center",
                }}
              >
                {loading ? "" : profile?.email || "—"}
              </p>
              <nav
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                }}
              >
                {menuItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "9px 12px",
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 500,
                      textDecoration: "none",
                      background: item.active ? "#D94F7A" : "transparent",
                      color: item.active ? "#fff" : "#6b7280",
                    }}
                  >
                    <item.icon size={14} />
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* ── Personal Info ── */}
            <div style={{ flex: 1, padding: "28px 24px", minWidth: 0 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 24,
                }}
              >
                <h2 style={{ fontSize: 15, fontWeight: 600, color: "#111" }}>
                  Personal Information
                </h2>
                <Link
                  href="/profile/edit"
                  style={{
                    padding: "6px 14px",
                    borderRadius: 8,
                    border: "1.5px solid #D94F7A",
                    color: "#D94F7A",
                    fontSize: 12,
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  Edit Profile
                </Link>
              </div>

              {/* ── Loading skeleton ── */}
              {loading ? (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 16 }}
                >
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      style={{
                        height: 40,
                        background: "#f3f4f6",
                        borderRadius: 8,
                        animation: "pulse 1.5s ease-in-out infinite",
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="info-grid">
                  {[
                    { label: "Full Name", value: profile?.name || "—" },
                    { label: "Email Address", value: profile?.email || "—" },
                    { label: "Phone Number", value: profile?.phone || "—" },
                    { label: "Role", value: profile?.role || "—" },
                    {
                      label: "Email Verified",
                      value: profile?.isEmailVerified
                        ? "✅ Verified"
                        : "❌ Not Verified",
                    },
                    { label: "Member Since", value: memberSince },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          color: "#9ca3af",
                          marginBottom: 4,
                        }}
                      >
                        {label}
                      </p>
                      <p
                        style={{
                          fontSize: 13,
                          fontWeight: 500,
                          color: "#1f2937",
                        }}
                      >
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <hr style={{ margin: "24px 0", borderColor: "#fce7f3" }} />

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button
                  onClick={logout}
                  style={{
                    padding: "9px 22px",
                    borderRadius: 8,
                    background: "#D94F7A",
                    color: "#fff",
                    border: "none",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Logout
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={deleting || loading}
                  style={{
                    padding: "9px 22px",
                    borderRadius: 8,
                    background: "transparent",
                    color: "#6b7280",
                    border: "1.5px solid #e5e7eb",
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: "pointer",
                    opacity: deleting || loading ? 0.6 : 1,
                  }}
                >
                  {deleting ? "Deleting..." : "Delete Account"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Delete confirmation modal ── */}
      {showDeleteConfirm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: 32,
              maxWidth: 380,
              width: "90%",
              boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
            }}
          >
            <h3
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "#111",
                marginBottom: 10,
              }}
            >
              Delete Account?
            </h3>
            <p
              style={{
                fontSize: 13,
                color: "#6b7280",
                lineHeight: 1.6,
                marginBottom: 24,
              }}
            >
              This action is <strong>permanent</strong>. Your account and all
              data will be deleted immediately. Are you sure?
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  borderRadius: 8,
                  border: "1.5px solid #e5e7eb",
                  background: "#fff",
                  color: "#374151",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  borderRadius: 8,
                  border: "none",
                  background: "#ef4444",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Styles */}
      <style>{`
        .profile-layout {
          display: flex;
          flex-direction: row;
          align-items: stretch;
        }
        .profile-sidebar {
          width: 220px;
          flex-shrink: 0;
          border-right: 1px solid #fce7f3;
          padding: 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px 48px;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
        @media (max-width: 640px) {
          .profile-layout { flex-direction: column; }
          .profile-sidebar { width: 100%; border-right: none; border-bottom: 1px solid #fce7f3; padding: 20px; }
          .info-grid { grid-template-columns: 1fr; gap: 16px; }
        }
      `}</style>
    </div>
  );
}

export default withAuth(ProfilePage);
