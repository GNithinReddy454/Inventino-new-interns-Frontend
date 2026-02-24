"use client";

import React from "react";
import { useAuth } from "@/app/(main)/components/authContext";
import { User, Package, MapPin, CreditCard, Settings } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const { user, logout } = useAuth();

  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "JD";

  const menuItems = [
    { label: "Profile Info", icon: User, href: "/profile", active: true },
    { label: "My Orders", icon: Package, href: "/profile/orders" },
    { label: "Saved Addresses", icon: MapPin, href: "/profile/addresses" },
    { label: "Payment Methods", icon: CreditCard, href: "/profile/payments" },
    { label: "Settings", icon: Settings, href: "/profile/settings" },
  ];

  const dob =
    user?.dobDay && user?.dobMonth && user?.dobYear
      ? `${user.dobMonth} ${user.dobDay}, ${user.dobYear}`
      : "—";

  return (
    <div style={{ background: "#fdf8f9", minHeight: "100vh", paddingBottom: 80, fontFamily: "Roboto, sans-serif" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "24px 16px" }}>

        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111", marginBottom: 24 }}>Profile Settings</h1>

        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #fce7f3", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>

          {/* Responsive wrapper — row on desktop, column on mobile */}
          <div className="profile-layout">

            {/* ── Sidebar ── */}
            <div className="profile-sidebar">
              <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#D94F7A", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 24, fontWeight: 700, marginBottom: 10, flexShrink: 0 }}>
                {initials}
              </div>
              <p style={{ fontWeight: 600, fontSize: 14, color: "#111", textAlign: "center" }}>{user?.name || "John Doe"}</p>
              <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 2, marginBottom: 20, textAlign: "center" }}>{user?.email || "john.doe@example.com"}</p>
              <nav style={{ width: "100%", display: "flex", flexDirection: "column", gap: 4 }}>
                {menuItems.map((item) => (
                  <Link key={item.label} href={item.href} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "9px 12px", borderRadius: 8,
                    fontSize: 13, fontWeight: 500, textDecoration: "none",
                    background: item.active ? "#D94F7A" : "transparent",
                    color: item.active ? "#fff" : "#6b7280",
                  }}>
                    <item.icon size={14} />
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* ── Personal Info ── */}
            <div style={{ flex: 1, padding: "28px 24px", minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                <h2 style={{ fontSize: 15, fontWeight: 600, color: "#111" }}>Personal Information</h2>
                <Link href="/profile/edit" style={{ padding: "6px 14px", borderRadius: 8, border: "1.5px solid #D94F7A", color: "#D94F7A", fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
                  Edit Profile
                </Link>
              </div>

              <div className="info-grid">
                {[
                  { label: "Full Name", value: user?.name || "—" },
                  { label: "Email Address", value: user?.email || "—" },
                  { label: "Phone Number", value: user?.phone || "—" },
                  { label: "Date of Birth", value: dob },
                  { label: "Gender", value: user?.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : "—" },
                  { label: "Member Since", value: user?.memberSince || "—" },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#9ca3af", marginBottom: 4 }}>{label}</p>
                    <p style={{ fontSize: 13, fontWeight: 500, color: "#1f2937" }}>{value}</p>
                  </div>
                ))}
              </div>

              <hr style={{ margin: "24px 0", borderColor: "#fce7f3" }} />

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button onClick={logout} style={{ padding: "9px 22px", borderRadius: 8, background: "#D94F7A", color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                  Logout
                </button>
                <button style={{ padding: "9px 22px", borderRadius: 8, background: "transparent", color: "#6b7280", border: "1.5px solid #e5e7eb", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
                  Delete Account
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Responsive styles */}
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
        @media (max-width: 640px) {
          .profile-layout {
            flex-direction: column;
          }
          .profile-sidebar {
            width: 100%;
            border-right: none;
            border-bottom: 1px solid #fce7f3;
            padding: 20px;
          }
          .info-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
        }
      `}</style>
    </div>
  );
}