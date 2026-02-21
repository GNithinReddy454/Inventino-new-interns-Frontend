"use client";

import React, { useState, useRef } from "react";
import { useAuth } from "@/app/(main)/components/authContext";
import { User, Package, MapPin, CreditCard, Settings, Camera } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1));
const YEARS = Array.from({ length: 80 }, (_, i) => String(new Date().getFullYear() - i));

const Chevron = () => (
  <svg className="select-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export default function EditProfilePage() {
  const { user, updateUser } = useAuth();
  const router = useRouter();

  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "JD";

  const [form, setForm] = useState({
    fullName:    user?.name        || "",
    phone:       user?.phone       || "",
    email:       user?.email       || "",
    dobDay:      user?.dobDay      || "",
    dobMonth:    user?.dobMonth    || "",
    dobYear:     user?.dobYear     || "",
    gender:      user?.gender      || "male",
    memberSince: user?.memberSince || "December 2025",
  });

  const [saved, setSaved] = useState(false);

  /* ── Profile photo state ─────────────────────────────────────────────── */
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    user?.photoUrl || null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Only allow image files
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => fileInputRef.current?.click();
  /* ─────────────────────────────────────────────────────────────────────── */

  const menuItems = [
    { label: "Profile Info",    icon: User,       href: "/profile",          active: true },
    { label: "My Orders",       icon: Package,    href: "/profile/orders"               },
    { label: "Saved Addresses", icon: MapPin,     href: "/profile/addresses"            },
    { label: "Payment Methods", icon: CreditCard, href: "/profile/payments"             },
    { label: "Settings",        icon: Settings,   href: "/profile/settings"             },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      name: form.fullName, email: form.email, phone: form.phone,
      dobDay: form.dobDay, dobMonth: form.dobMonth, dobYear: form.dobYear,
      gender: form.gender, memberSince: form.memberSince,
      ...(photoPreview ? { photoUrl: photoPreview } : {}),
    });
    setSaved(true);
    setTimeout(() => router.push("/profile"), 800);
  };

  /* Avatar shown in both sidebar + form center */
  const AvatarCircle = ({ size }: { size: number }) => (
    photoPreview ? (
      <img
        src={photoPreview}
        alt="Profile"
        style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", display: "block" }}
      />
    ) : (
      <div style={{ width: size, height: size, borderRadius: "50%", background: "#D94F7A", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: size * 0.3, fontWeight: 700 }}>
        {initials}
      </div>
    )
  );

  return (
    <div style={{ background: "#fdf8f9", minHeight: "100vh", paddingBottom: 80, fontFamily: "Roboto, sans-serif" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "24px 16px" }}>
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #fce7f3", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
          <div className="profile-layout">

            {/* ── Sidebar ─────────────────────────────────────────────── */}
            <div className="profile-sidebar">
              <AvatarCircle size={72} />
              <p style={{ fontWeight: 600, fontSize: 14, color: "#111", textAlign: "center", marginTop: 10 }}>{user?.name || "John Doe"}</p>
              <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 2, marginBottom: 20, textAlign: "center" }}>{user?.email || "john.doe@example.com"}</p>
              <nav style={{ width: "100%", display: "flex", flexDirection: "column", gap: 4 }}>
                {menuItems.map((item) => (
                  <Link key={item.label} href={item.href} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 8, fontSize: 13, fontWeight: 500, textDecoration: "none", background: item.active ? "#D94F7A" : "transparent", color: item.active ? "#fff" : "#6b7280" }}>
                    <item.icon size={14} /> {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* ── Form area ───────────────────────────────────────────── */}
            <div style={{ flex: 1, padding: "28px 24px", minWidth: 0 }}>

              {/* ── Avatar with upload ──────────────────────────────── */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 24 }}>
                <div style={{ position: "relative" }}>
                  <AvatarCircle size={72} />

                  {/* Camera button → triggers hidden file input */}
                  <button
                    type="button"
                    onClick={triggerFileInput}
                    title="Upload photo"
                    style={{ position: "absolute", bottom: -2, right: -2, width: 26, height: 26, borderRadius: "50%", background: "#D94F7A", border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 1px 4px rgba(0,0,0,0.15)" }}
                  >
                    <Camera size={12} color="#fff" />
                  </button>

                  {/* Hidden file input — accepts jpg/png/webp */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handlePhotoChange}
                    style={{ display: "none" }}
                  />
                </div>

                {/* "Change Profile" button also opens file picker */}
                <button
                  type="button"
                  onClick={triggerFileInput}
                  style={{ marginTop: 10, fontSize: 11, fontWeight: 600, color: "#D94F7A", border: "1.5px solid #D94F7A", background: "transparent", padding: "5px 14px", borderRadius: 8, cursor: "pointer", fontFamily: "inherit" }}
                >
                  Change Profile
                </button>

                {/* Show selected filename */}
                {photoPreview && (
                  <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 5 }}>
                    Photo selected ✓
                  </p>
                )}
              </div>

              {saved && (
                <div style={{ background: "#ecfdf5", border: "1px solid #6ee7b7", borderRadius: 8, padding: "10px 16px", marginBottom: 20, fontSize: 13, color: "#065f46", fontWeight: 500 }}>
                  ✓ Profile saved! Redirecting...
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                {/* Full Name + Phone */}
                <div className="form-row">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <label className="form-label">Full Name <span className="form-label-req">*</span></label>
                    <input className="input-basic" type="text" placeholder="John Doe" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <label className="form-label">Phone Number</label>
                    <input className="input-basic" type="tel" placeholder="+1 (555) 000-0000" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="form-label">Email Address <span className="form-label-req">*</span></label>
                  <input className="input-basic" type="email" placeholder="john.doe@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                  <p className="form-hint">✓ We'll send order updates to this email</p>
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="form-label">Date Of Birth</label>
                  <div className="dob-row">
                    {[
                      { val: form.dobDay,   key: "dobDay",   opts: DAYS,   placeholder: "Select Date"  },
                      { val: form.dobMonth, key: "dobMonth", opts: MONTHS, placeholder: "Select Month" },
                      { val: form.dobYear,  key: "dobYear",  opts: YEARS,  placeholder: "Select Year"  },
                    ].map(({ val, key, opts, placeholder }) => (
                      <div key={key} className="select-wrapper" style={{ flex: 1 }}>
                        <select className={`input-select${!val ? " placeholder-active" : ""}`} value={val} onChange={(e) => setForm({ ...form, [key]: e.target.value })}>
                          <option value="">{placeholder}</option>
                          {opts.map((o) => <option key={o} value={o}>{o}</option>)}
                        </select>
                        <Chevron />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Gender */}
                <div>
                  <label className="form-label">Gender</label>
                  <div style={{ display: "flex", gap: 24 }}>
                    {["male", "female"].map((g) => (
                      <label key={g} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: "#374151" }}>
                        <input type="radio" name="gender" value={g} checked={form.gender === g} onChange={() => setForm({ ...form, gender: g })} style={{ accentColor: "#D94F7A", width: 16, height: 16 }} />
                        {g.charAt(0).toUpperCase() + g.slice(1)}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Member Since */}
                <div>
                  <label className="form-label">Member Since</label>
                  <input className="input-disabled" type="text" value={form.memberSince} readOnly style={{ width: "50%" }} />
                </div>

                {/* Buttons */}
                <div style={{ display: "flex", gap: 12, paddingTop: 8, flexWrap: "wrap" }}>
                  <button type="submit" style={{ padding: "10px 32px", borderRadius: 8, background: "#D94F7A", color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 3px 10px rgba(217,79,122,0.25)" }}>
                    Save Changes
                  </button>
                  <Link href="/profile" style={{ padding: "10px 32px", borderRadius: 8, border: "1.5px solid #e5e7eb", color: "#6b7280", fontSize: 13, fontWeight: 500, textDecoration: "none", display: "flex", alignItems: "center" }}>
                    Cancel
                  </Link>
                </div>

              </form>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .profile-layout { display: flex; flex-direction: row; align-items: stretch; }
        .profile-sidebar { width: 220px; flex-shrink: 0; border-right: 1px solid #fce7f3; padding: 24px; display: flex; flex-direction: column; align-items: center; }
        .form-row { display: flex; gap: 16px; }
        .dob-row { display: flex; gap: 12px; }
        @media (max-width: 640px) {
          .profile-layout { flex-direction: column; }
          .profile-sidebar { width: 100%; border-right: none; border-bottom: 1px solid #fce7f3; padding: 20px; }
          .form-row { flex-direction: column; }
          .dob-row { flex-direction: column; }
        }
      `}</style>
    </div>
  );
}
