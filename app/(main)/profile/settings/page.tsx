"use client";
import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/store";

// Account actions
import {
  setField as setAccountField,
  showSavedBanner as showAccountBanner,
  hideSavedBanner as hideAccountBanner,
} from "@/redux/accountslice";

// Notifications actions
import { toggleNotification } from "@/redux/notificationslice";

// Security actions
import {
  setField as setSecurityField,
  setErrors as setSecurityErrors,
  submitSuccess as securitySubmitSuccess,
  hideSavedBanner as hideSecurityBanner,
} from "@/redux/securityslice";

// Appearance actions
import {
  setTheme,
  setAccentColor,
  setReducedMotion,
  showSavedBanner as showAppearanceBanner,
  hideSavedBanner as hideAppearanceBanner,
} from "@/redux/appearanceslice";

// ── Inline SVG Icons ──────────────────────────────────────────────────────
interface IconProps {
  size?: number;
}

const Icons = {
  User: ({ size = 18 }: IconProps) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Bell: ({ size = 18 }: IconProps) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  Shield: ({ size = 18 }: IconProps) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  Palette: ({ size = 18 }: IconProps) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
      <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
      <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
      <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
    </svg>
  ),
  Eye: ({ size = 16 }: IconProps) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  EyeOff: ({ size = 16 }: IconProps) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ),
  Camera: ({ size = 16 }: IconProps) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  ),
  Sun: ({ size = 16 }: IconProps) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  ),
  Moon: ({ size = 16 }: IconProps) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  ),
  Laptop: ({ size = 16 }: IconProps) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  ),
  Monitor: ({ size = 16 }: IconProps) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  ),
  Check: ({ size = 14 }: IconProps) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Menu: ({ size = 20 }: IconProps) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  ),
  X: ({ size = 20 }: IconProps) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  ChevronDown: ({ size = 13 }: IconProps) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
};

// ── Shared UI components ──────────────────────────────────────────────────

interface ToggleProps {
  enabled: boolean;
  onChange: (v: boolean) => void;
  accentColor: string;
}
function Toggle({ enabled, onChange, accentColor }: ToggleProps) {
  return (
    <button
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      style={{
        width: 46,
        height: 24,
        borderRadius: 12,
        background: enabled ? accentColor : "#E5E7EB",
        border: "none",
        cursor: "pointer",
        position: "relative",
        flexShrink: 0,
        transition: "background 0.22s",
        padding: 0,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 3,
          left: enabled ? 23 : 3,
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: "white",
          boxShadow: "0 1px 4px rgba(0,0,0,0.18)",
          transition: "left 0.22s",
        }}
      />
    </button>
  );
}

interface PasswordFieldProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showPwd: boolean;
  toggleShow: () => void;
  error?: string;
  hint?: string;
}
function PasswordField({
  label,
  value,
  onChange,
  showPwd,
  toggleShow,
  error,
  hint,
}: PasswordFieldProps) {
  return (
    <div>
      <label className="form-label">
        {label} <span className="form-label-req">*</span>
      </label>
      <div style={{ position: "relative" }}>
        <input
          className={`input-basic${error ? " input-error" : ""}`}
          type={showPwd ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder="••••••••"
          style={{ paddingRight: 42 }}
        />
        <button
          type="button"
          onClick={toggleShow}
          style={{
            position: "absolute",
            right: 12,
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#9ca3af",
            display: "flex",
            alignItems: "center",
            padding: 0,
          }}
        >
          {showPwd ? <Icons.EyeOff /> : <Icons.Eye />}
        </button>
      </div>
      {hint && !error && <p className="form-hint">{hint}</p>}
      {error && (
        <p className="form-hint" style={{ color: "#ef4444" }}>
          {error}
        </p>
      )}
    </div>
  );
}

function SuccessBanner({ message }: { message: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        background: "#f0fdf4",
        border: "1px solid #bbf7d0",
        borderRadius: 8,
        padding: "10px 14px",
        marginTop: 16,
      }}
    >
      <Icons.Check size={14} />
      <span
        style={{
          fontSize: 13,
          color: "#16a34a",
          fontWeight: 500,
          fontFamily: "'Roboto', sans-serif",
        }}
      >
        {message}
      </span>
    </div>
  );
}

function Card({
  children,
  style = {},
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: 14,
        padding: "22px 22px",
        marginBottom: 18,
        boxShadow: "0 1px 10px rgba(217,79,122,0.06)",
        border: "1px solid #fce8f0",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function SectionTitle({
  icon: Icon,
  children,
}: {
  icon?: React.ComponentType<IconProps>;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontSize: 15,
        fontWeight: 700,
        color: "#111827",
        marginBottom: 18,
        fontFamily: "'Roboto', sans-serif",
      }}
    >
      {Icon && <Icon size={17} />}
      {children}
    </div>
  );
}

// ── Tab sections ──────────────────────────────────────────────────────────

function AccountTab() {
  const dispatch = useAppDispatch();

  // ✅ Pull from auth (logged-in user) as the source of truth
  const authUser = useAppSelector((s) => s.auth?.user);
  const account = useAppSelector((s) => s.account);

  // ✅ Editable fields: prefer account slice values (user may have edited them),
  //    but fall back to auth data so the page is populated on first load
  const displayName = account.name || authUser?.name || "";
  const displayEmail = account.email || authUser?.email || "";
  const displayPhone = account.phone || authUser?.phone || "";
  const displayLocation = "";

  // ✅ Avatar initial from auth name (always reflects login user)
  const avatarInitial = (authUser?.name || account.name || "?")
    .charAt(0)
    .toUpperCase();

  const save = () => {
    dispatch(showAccountBanner());
    setTimeout(() => dispatch(hideAccountBanner()), 3000);
  };

  return (
    <div>
      {/* Profile header card */}
      <Card
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div style={{ position: "relative", flexShrink: 0 }}>
          <div
            style={{
              width: 76,
              height: 76,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #D94F7A, #9B59B6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 26,
              fontWeight: 700,
              color: "white",
              border: "3px solid white",
              boxShadow: "0 4px 16px rgba(217,79,122,0.3)",
            }}
          >
            {avatarInitial}
          </div>
          <button
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              width: 26,
              height: 26,
              borderRadius: "50%",
              background: "#D94F7A",
              border: "2px solid white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "white",
            }}
          >
            <Icons.Camera size={13} />
          </button>
        </div>
        <div>
          {/* ✅ Always shows the logged-in user's name from auth */}
          <p
            style={{
              fontSize: 17,
              fontWeight: 700,
              color: "#111827",
              margin: "0 0 2px",
            }}
          >
            {authUser?.name || account.name || "User"}
          </p>
          <p className="form-hint" style={{ margin: "0 0 8px" }}>
            {authUser?.email || account.email || ""}
          </p>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "#D94F7A",
              background: "#D94F7A15",
              padding: "3px 10px",
              borderRadius: 20,
            }}
          >
            Premium Member
          </span>
        </div>
      </Card>

      {/* Personal information form */}
      <Card>
        <SectionTitle>Personal Information</SectionTitle>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
            gap: 16,
          }}
        >
          <div>
            <label className="form-label">
              Full Name <span className="form-label-req">*</span>
            </label>
            <input
              className="input-basic"
              value={displayName}
              placeholder="Your full name"
              onChange={(e) =>
                dispatch(setAccountField({ name: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="form-label">
              Email Address <span className="form-label-req">*</span>
            </label>
            <input
              className="input-basic"
              type="email"
              value={displayEmail}
              placeholder="you@example.com"
              onChange={(e) =>
                dispatch(setAccountField({ email: e.target.value }))
              }
            />
            <p className="form-hint">Used for login and order updates</p>
          </div>
          <div>
            <label className="form-label">
              Phone Number <span className="form-label-opt">(optional)</span>
            </label>
            <input
              className="input-basic"
              type="tel"
              value={displayPhone}
              placeholder="+91 00000 00000"
              onChange={(e) =>
                dispatch(setAccountField({ phone: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="form-label">
              Location <span className="form-label-opt">(optional)</span>
            </label>
            <input
              className="input-basic"
              value={displayLocation}
              placeholder="City, Country"
              onChange={(e) =>
                dispatch(setAccountField({ location: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="form-label">
              Gender <span className="form-label-opt">(optional)</span>
            </label>
            <div className="select-wrapper">
              <select
                className={`input-select${!account.gender ? " placeholder-active" : ""}`}
                value={account.gender}
                onChange={(e) =>
                  dispatch(setAccountField({ gender: e.target.value }))
                }
              >
                <option value="" disabled>
                  Select gender
                </option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer-not">Prefer not to say</option>
              </select>
              <span className="select-chevron">
                <Icons.ChevronDown size={13} />
              </span>
            </div>
          </div>
        </div>
        <div style={{ marginTop: 22 }}>
          <button
            className="save-btn"
            style={{
              display: "inline-flex",
              alignItems: "center",
              background: "#D94F7A",
              color: "white",
              border: "none",
              borderRadius: 8,
              padding: "0 20px",
              height: 44,
              fontSize: 13.5,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "'Roboto', sans-serif",
            }}
            onClick={save}
          >
            Update Account
          </button>
        </div>
        {account.savedBanner && (
          <SuccessBanner message="Account updated successfully!" />
        )}
      </Card>
    </div>
  );
}

function NotificationsTab({ accentColor }: { accentColor: string }) {
  const dispatch = useAppDispatch();
  const items = useAppSelector((s) => s.notifications.items);

  return (
    <div>
      <Card>
        <SectionTitle icon={Icons.Bell}>Notification Preferences</SectionTitle>
        <p className="form-hint" style={{ marginTop: -10, marginBottom: 16 }}>
          Choose what updates you'd like to receive.
        </p>
        <div>
          {items.map((item) => (
            <div key={item.id} className="notif-row">
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#111827",
                    margin: "0 0 3px",
                  }}
                >
                  {item.title}
                </p>
                <p className="form-hint" style={{ margin: 0 }}>
                  {item.desc}
                </p>
              </div>
              <Toggle
                accentColor={accentColor}
                enabled={item.enabled}
                onChange={() => dispatch(toggleNotification(item.id))}
              />
            </div>
          ))}
        </div>
      </Card>

      <Card
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          flexWrap: "wrap",
          background: "#fff5f8",
          border: "1px solid #f5c6d8",
        }}
      >
        <span style={{ fontSize: 24 }}>📱</span>
        <div style={{ flex: 1, minWidth: 160 }}>
          <p
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "#111827",
              margin: "0 0 3px",
            }}
          >
            Push Notifications
          </p>
          <p className="form-hint" style={{ margin: 0 }}>
            Enable browser notifications for real-time updates
          </p>
        </div>
        <button
          style={{
            display: "inline-flex",
            alignItems: "center",
            background: "white",
            color: accentColor,
            border: `1.5px solid ${accentColor}`,
            borderRadius: 8,
            padding: "0 20px",
            height: 44,
            fontSize: 13.5,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "'Roboto', sans-serif",
          }}
        >
          Enable
        </button>
      </Card>
    </div>
  );
}

function SecurityTab({ accentColor }: { accentColor: string }) {
  const dispatch = useAppDispatch();
  const security = useAppSelector((s) => s.security);

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const pwdStrength = (() => {
    const p = security.newPwd;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][pwdStrength];
  const strengthColor = ["", "#ef4444", "#f59e0b", "#3b82f6", "#22c55e"][
    pwdStrength
  ];

  const handleSubmit = () => {
    const errs: { current?: string; newPwd?: string; confirm?: string } = {};
    if (!security.current) errs.current = "Current password is required.";
    if (!security.newPwd || security.newPwd.length < 8)
      errs.newPwd = "Must be at least 8 characters.";
    if (security.newPwd !== security.confirm)
      errs.confirm = "Passwords do not match.";
    dispatch(setSecurityErrors(errs));
    if (Object.keys(errs).length) return;
    dispatch(securitySubmitSuccess());
    setTimeout(() => dispatch(hideSecurityBanner()), 3000);
  };

  const btnStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    background: accentColor,
    color: "white",
    border: "none",
    borderRadius: 8,
    padding: "0 20px",
    height: 44,
    fontSize: 13.5,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "'Roboto', sans-serif",
  };

  return (
    <div>
      <Card>
        <SectionTitle icon={Icons.Shield}>Change Password</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <PasswordField
            label="Current Password"
            value={security.current}
            onChange={(e) =>
              dispatch(setSecurityField({ current: e.target.value }))
            }
            showPwd={showCurrent}
            toggleShow={() => setShowCurrent((v) => !v)}
            error={security.errors.current}
          />

          <PasswordField
            label="New Password"
            value={security.newPwd}
            onChange={(e) =>
              dispatch(setSecurityField({ newPwd: e.target.value }))
            }
            showPwd={showNew}
            toggleShow={() => setShowNew((v) => !v)}
            error={security.errors.newPwd}
            hint="Min 8 chars — include uppercase, number & symbol for a strong password"
          />

          {security.newPwd && (
            <div>
              <div style={{ display: "flex", gap: 5, marginBottom: 5 }}>
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: 4,
                      borderRadius: 4,
                      background: i <= pwdStrength ? strengthColor : "#f5c6d8",
                      transition: "background 0.25s",
                    }}
                  />
                ))}
              </div>
              <p
                className="form-hint"
                style={{ color: strengthColor ?? undefined }}
              >
                {strengthLabel}
              </p>
            </div>
          )}

          <PasswordField
            label="Confirm New Password"
            value={security.confirm}
            onChange={(e) =>
              dispatch(setSecurityField({ confirm: e.target.value }))
            }
            showPwd={showConfirm}
            toggleShow={() => setShowConfirm((v) => !v)}
            error={security.errors.confirm}
          />
        </div>
        {security.savedBanner && (
          <SuccessBanner message="Password changed successfully!" />
        )}
        <div style={{ marginTop: 20 }}>
          <button className="save-btn" style={btnStyle} onClick={handleSubmit}>
            Change Password
          </button>
        </div>
      </Card>

      <Card>
        <SectionTitle>Active Sessions</SectionTitle>
        {[
          {
            device: "Windows PC",
            location: "Mumbai, India",
            time: "Active Now",
            current: true,
          },
          {
            device: "iPhone 15",
            location: "Pune, India",
            time: "2 hours ago",
            current: false,
          },
        ].map((s, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "13px 0",
              borderTop: i > 0 ? "1px solid #fce8f0" : "none",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: "#fff5f8",
                  border: "1px solid #fce8f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#D94F7A",
                }}
              >
                <Icons.Monitor size={18} />
              </div>
              <div>
                <p
                  style={{
                    fontSize: 13.5,
                    fontWeight: 600,
                    color: "#111827",
                    margin: "0 0 2px",
                  }}
                >
                  {s.device}
                </p>
                <p className="form-hint" style={{ margin: 0 }}>
                  {s.location}
                </p>
              </div>
            </div>
            {s.current ? (
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#22c55e",
                  background: "#f0fdf4",
                  padding: "4px 12px",
                  borderRadius: 20,
                  border: "1px solid #bbf7d0",
                }}
              >
                ● Active Now
              </span>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <p className="form-hint" style={{ margin: 0 }}>
                  {s.time}
                </p>
                <button className="revoke-btn">Revoke</button>
              </div>
            )}
          </div>
        ))}
      </Card>
    </div>
  );
}

function AppearanceTab() {
  const dispatch = useAppDispatch();
  const appearance = useAppSelector((s) => s.appearance);
  const { theme, accentColor, reducedMotion, savedBanner } = appearance;

  const accentOptions = [
    { color: "#D94F7A", label: "Rose" },
    { color: "#4F46E5", label: "Indigo" },
    { color: "#059669", label: "Emerald" },
    { color: "#D97706", label: "Amber" },
  ];

  const save = () => {
    dispatch(showAppearanceBanner());
    setTimeout(() => dispatch(hideAppearanceBanner()), 3000);
  };

  const btnStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    background: accentColor,
    color: "white",
    border: "none",
    borderRadius: 8,
    padding: "0 20px",
    height: 44,
    fontSize: 13.5,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "'Roboto', sans-serif",
  };

  return (
    <div>
      <Card>
        <SectionTitle icon={Icons.Palette}>Theme Mode</SectionTitle>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {(
            [
              { id: "light", label: "Light", Icon: Icons.Sun },
              { id: "dark", label: "Dark", Icon: Icons.Moon },
              { id: "system", label: "System", Icon: Icons.Laptop },
            ] as const
          ).map(({ id, label, Icon }) => (
            <button
              key={id}
              className={`theme-card${theme === id ? " tc-active" : ""}`}
              onClick={() => dispatch(setTheme(id))}
            >
              <Icon size={18} />
              {label}
              {theme === id && (
                <span
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: accentColor,
                  }}
                />
              )}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <SectionTitle>Interface Colour</SectionTitle>
        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            marginBottom: 12,
          }}
        >
          {accentOptions.map(({ color, label }) => (
            <button
              key={color}
              title={label}
              onClick={() => dispatch(setAccentColor(color))}
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: color,
                border: "3px solid white",
                outline:
                  accentColor === color
                    ? `3px solid ${color}`
                    : "3px solid transparent",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transform: accentColor === color ? "scale(1.15)" : "scale(1)",
                boxShadow:
                  accentColor === color ? `0 4px 12px ${color}55` : "none",
                transition: "all 0.18s",
              }}
            >
              {accentColor === color && <Icons.Check size={13} />}
            </button>
          ))}
        </div>
        <p className="form-hint">
          Selected:{" "}
          <strong style={{ color: accentColor }}>
            {accentOptions.find((c) => c.color === accentColor)?.label}
          </strong>
        </p>
      </Card>

      <Card>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <div>
            <p
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "#111827",
                margin: "0 0 3px",
              }}
            >
              Reduced Motion
            </p>
            <p className="form-hint" style={{ margin: 0 }}>
              Minimize animations throughout the site for accessibility
            </p>
          </div>
          <Toggle
            accentColor={accentColor}
            enabled={reducedMotion}
            onChange={(v) => dispatch(setReducedMotion(v))}
          />
        </div>
      </Card>

      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <button className="save-btn" style={btnStyle} onClick={save}>
          Save Appearance
        </button>
      </div>
      {savedBanner && <SuccessBanner message="Appearance saved!" />}
    </div>
  );
}

// ── Root settings page ────────────────────────────────────────────────────
interface TabDef {
  id: string;
  label: string;
  Icon: React.ComponentType<IconProps>;
}

function SettingsInner() {
  const accentColor = useAppSelector((s) => s.appearance.accentColor);
  const [activeTab, setActiveTab] = useState("account");
  // ✅ Single state for mobile sidebar — only used on mobile
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const tabs: TabDef[] = [
    { id: "account", label: "Account Settings", Icon: Icons.User },
    { id: "notifications", label: "Notifications", Icon: Icons.Bell },
    { id: "security", label: "Password & Security", Icon: Icons.Shield },
    { id: "appearance", label: "Appearance", Icon: Icons.Palette },
  ];

  const selectTab = (id: string) => {
    setActiveTab(id);
    setSidebarOpen(false);
  };

  return (
    <>
      <style>{`
        .s-tab {
          width: 100%; display: flex; align-items: center; gap: 10px;
          padding: 11px 14px; border-radius: 10px; border: none;
          cursor: pointer; font-family: 'Roboto', sans-serif;
          font-size: 13.5px; font-weight: 500; text-align: left;
          color: #6b7280; background: white;
          transition: background 0.15s, color 0.15s; letter-spacing: 0.2px;
        }
        .s-tab:hover:not(.s-tab-active) { background: #fff0f5; color: #D94F7A; }
        .s-tab.s-tab-active {
          background: ${accentColor}; color: white; font-weight: 600;
          box-shadow: 0 4px 12px rgba(217,79,122,0.28);
        }
        .save-btn:hover  { opacity: 0.87; }
        .save-btn:active { transform: scale(0.98); }
        .revoke-btn {
          font-size: 12px; font-weight: 600; color: #ef4444;
          background: #fef2f2; border: none; border-radius: 6px;
          padding: 4px 10px; cursor: pointer; font-family: 'Roboto', sans-serif;
        }
        .revoke-btn:hover { background: #fee2e2; }
        .theme-card {
          flex: 1 1 88px; min-height: 72px; border-radius: 10px;
          border: 1.5px solid #f5c6d8; background: #fff5f8;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 6px;
          cursor: pointer; color: #9ca3af;
          font-family: 'Roboto', sans-serif; font-size: 13px; font-weight: 500;
          transition: all 0.18s;
        }
        .theme-card.tc-active {
          border-color: ${accentColor}; background: white;
          color: ${accentColor}; box-shadow: 0 4px 14px rgba(217,79,122,0.15);
        }
        .theme-card:hover:not(.tc-active) { border-color: ${accentColor}88; color: ${accentColor}; }
        .notif-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 16px 0; }
        .notif-row + .notif-row { border-top: 1px solid #fce8f0; }

        /* ── Sidebar layout ── */
        /* Desktop: show the sidebar, hide mobile overlay and top bar */
        .s-sidebar        { width: 224px; flex-shrink: 0; display: flex; flex-direction: column; gap: 4px; }
        .s-mobile-topbar  { display: none; }
        .s-mobile-overlay { display: none; }

        /* Mobile: hide desktop sidebar, show topbar and overlay when open */
        @media (max-width: 768px) {
          .s-root          { flex-direction: column !important; padding: 0 !important; }
          .s-sidebar        { display: none !important; }
          .s-mobile-topbar  { display: flex !important; }
          .s-mobile-overlay {
            display: flex;
            flex-direction: column;
            position: fixed; inset: 0; z-index: 50;
            background: white; padding: 24px 20px;
            overflow-y: auto; gap: 4px;
            /* hidden by default, shown when .open */
            transform: translateX(-100%);
            transition: transform 0.25s ease;
          }
          .s-mobile-overlay.open { transform: translateX(0); }
          .s-main { padding: 16px !important; }
        }

        .fade-in { animation: sfi 0.25s ease; }
        @keyframes sfi { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(145deg, #fff5f8 0%, #f5f0ff 100%)",
          fontFamily: "'Roboto', sans-serif",
        }}
      >
        {/* ✅ Mobile top bar — only visible on mobile via CSS */}
        <div
          className="s-mobile-topbar"
          style={{
            alignItems: "center",
            justifyContent: "space-between",
            padding: "13px 16px",
            background: "white",
            borderBottom: "1px solid #fce8f0",
            boxShadow: "0 1px 8px rgba(217,79,122,0.07)",
            position: "sticky",
            top: 0,
            zIndex: 40,
          }}
        >
          <span
            style={{
              fontSize: 17,
              fontWeight: 700,
              color: accentColor,
              fontFamily: "'Roboto', sans-serif",
            }}
          >
            Settings
          </span>
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            style={{
              background: "#fff0f5",
              border: "none",
              borderRadius: 8,
              padding: "7px 9px",
              cursor: "pointer",
              color: accentColor,
              display: "flex",
            }}
          >
            {sidebarOpen ? <Icons.X /> : <Icons.Menu />}
          </button>
        </div>

        {/* ✅ Mobile sidebar overlay — slides in from left on mobile only */}
        <div className={`s-mobile-overlay${sidebarOpen ? " open" : ""}`}>
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#9ca3af",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 12,
            }}
          >
            Menu
          </p>
          {tabs.map(({ id, label, Icon }) => (
            <button
              key={id}
              className={`s-tab${activeTab === id ? " s-tab-active" : ""}`}
              onClick={() => selectTab(id)}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        <div
          className="s-root"
          style={{
            display: "flex",
            maxWidth: 1060,
            margin: "0 auto",
            padding: "30px 20px",
            gap: 20,
            alignItems: "flex-start",
          }}
        >
          {/* ✅ Desktop sidebar — single sidebar, hidden on mobile via CSS */}
          <div className="s-sidebar">
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#9ca3af",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                paddingBottom: 14,
                marginBottom: 8,
                borderBottom: "1px solid #fce8f0",
              }}
            >
              Menu
            </p>
            {tabs.map(({ id, label, Icon }) => (
              <button
                key={id}
                className={`s-tab${activeTab === id ? " s-tab-active" : ""}`}
                onClick={() => selectTab(id)}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>

          {/* Main content */}
          <div
            className="s-main fade-in"
            key={activeTab}
            style={{ flex: 1, minWidth: 0, padding: "0 2px" }}
          >
            {activeTab === "account" && <AccountTab />}
            {activeTab === "notifications" && (
              <NotificationsTab accentColor={accentColor} />
            )}
            {activeTab === "security" && (
              <SecurityTab accentColor={accentColor} />
            )}
            {activeTab === "appearance" && <AppearanceTab />}
          </div>
        </div>
      </div>
    </>
  );
}

export default function SettingsPage() {
  return <SettingsInner />;
}
