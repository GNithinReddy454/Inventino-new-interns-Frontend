"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/app/(main)/components/authContext";
import {
  User,
  Package,
  MapPin,
  CreditCard,
  Settings,
  Loader2,
  Camera,
  ChevronDown,
  LogOut,
  Trash2,
  Edit2,
  X,
} from "lucide-react";
import { withAuth } from "@/app/components/hoc/withAuth";
import { userService } from "@/services/user.service";
import { useRouter } from "next/navigation";

// Types
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

// Helper to extract error message
const getErrorMessage = (err: unknown): string => {
  if (err && typeof err === "object" && "response" in err) {
    const error = err as { response?: { data?: { message?: string } } };
    return error.response?.data?.message || "Request failed";
  }
  if (err instanceof Error) return err.message;
  return "Unknown error";
};

function ProfilePage() {
  const { logout } = useAuth();
  const router = useRouter();

  // Profile state
  const [profile, setProfile] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Editable fields (local state for editing)
  const [editableName, setEditableName] = useState("");
  const [editableLocation, setEditableLocation] = useState("");
  const [editableGender, setEditableGender] = useState("");

  // Avatar preview
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Edit mode
  const [isEditing, setIsEditing] = useState(false);

  // Fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await userService.getProfile();
        if (res?.data) {
          setProfile(res.data);
          setEditableName(res.data.name);
        }
      } catch (err: unknown) {
        setError(getErrorMessage(err) || "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Derived values
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

  // Handlers
  const handleUpdateProfile = async () => {
    try {
      setError(null);
      setSuccess(null);
      // Only name is sent to the backend
      await userService.updateProfile({ name: editableName });
      // Refresh profile data
      const refreshed = await userService.getProfile();
      if (refreshed?.data) {
        setProfile(refreshed.data);
      }
      setSuccess("Profile updated successfully!");
      // Exit edit mode
      setIsEditing(false);
    } catch (err: unknown) {
      setError(getErrorMessage(err) || "Failed to update profile.");
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setDeleting(true);
      await userService.deleteAccount();
      logout();
      router.push("/login");
    } catch (err: unknown) {
      setError(getErrorMessage(err) || "Failed to delete account.");
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const triggerFileInput = () => fileInputRef.current?.click();

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const toggleEdit = () => {
    if (isEditing) {
      // Cancel editing – revert changes
      setEditableName(profile?.name || "");
      setEditableLocation("");
      setEditableGender("");
      setSuccess(null);
      setError(null);
    }
    setIsEditing(!isEditing);
  };

  const menuItems = [
    { label: "Profile Info", icon: User, href: "/profile", active: true },
    { label: "My Orders", icon: Package, href: "/profile/orders" },
    { label: "Saved Addresses", icon: MapPin, href: "/profile/addresses" },
    { label: "Payment Methods", icon: CreditCard, href: "/profile/payments" },
    { label: "Settings", icon: Settings, href: "/profile/settings" },
  ];

  return (
    <div className="bg-[#fdf8f9] min-h-screen pb-20 font-sans">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Profile Settings</h1>

        {/* Success Banner */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-5 flex items-center justify-between">
            <span>✓ {success}</span>
            <button onClick={() => setSuccess(null)} className="text-green-700 hover:text-green-900">
              <X size={16} />
            </button>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-5 flex items-center justify-between">
            <span>⚠️ {error}</span>
            <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900">
              <X size={16} />
            </button>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-pink-100 shadow-sm overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Sidebar */}
            <div className="md:w-64 border-r border-pink-100 p-6">
              <div className="flex flex-col items-center mb-6">
                <div className="relative">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Profile"
                      className="w-20 h-20 rounded-full object-cover border-2 border-pink-200"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                      {loading ? <Loader2 className="animate-spin" size={24} /> : initials}
                    </div>
                  )}
                  <button
                    onClick={triggerFileInput}
                    className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-pink-600 border-2 border-white flex items-center justify-center text-white hover:bg-pink-700 transition-colors"
                  >
                    <Camera size={14} />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </div>
                <p className="font-semibold text-gray-900 mt-3">
                  {loading ? "Loading..." : profile?.name}
                </p>
                <p className="text-xs text-gray-400">{profile?.email}</p>
              </div>

              <nav className="space-y-1">
                {menuItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      item.active
                        ? "bg-pink-600 text-white"
                        : "text-gray-600 hover:bg-pink-50 hover:text-pink-600"
                    }`}
                  >
                    <item.icon size={16} />
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Main content */}
            <div className="flex-1 p-6">
              {/* Personal Information Section */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
                  <button
                    onClick={toggleEdit}
                    className="flex items-center gap-2 px-4 py-2 bg-pink-50 text-pink-600 rounded-lg text-sm font-semibold hover:bg-pink-100 transition-colors"
                  >
                    {isEditing ? (
                      <>
                        <X size={16} /> Cancel
                      </>
                    ) : (
                      <>
                        <Edit2 size={16} /> Edit Info
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                      Full Name <span className="text-red-400">*</span>
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        className="w-full rounded-lg border border-pink-100 bg-pink-50/40 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200"
                        value={editableName}
                        onChange={(e) => setEditableName(e.target.value)}
                        placeholder="Your full name"
                      />
                    ) : (
                      <p className="px-4 py-2.5 text-sm text-gray-800 bg-gray-50 rounded-lg">
                        {profile?.name || "—"}
                      </p>
                    )}
                  </div>

                  {/* Email (read-only) */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                      Email Address <span className="text-red-400">*</span>
                    </label>
                    <p className="px-4 py-2.5 text-sm text-gray-500 bg-gray-100 rounded-lg">
                      {profile?.email || "—"}
                    </p>
                  </div>

                  {/* Phone (read-only) */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                      Phone Number
                    </label>
                    <p className="px-4 py-2.5 text-sm text-gray-500 bg-gray-100 rounded-lg">
                      {profile?.phone || "—"}
                    </p>
                  </div>

                  {/* Location – UI only (editable but no backend) */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                      Location
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        className="w-full rounded-lg border border-pink-100 bg-pink-50/40 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200"
                        value={editableLocation}
                        onChange={(e) => setEditableLocation(e.target.value)}
                        placeholder="City, Country"
                      />
                    ) : (
                      <p className="px-4 py-2.5 text-sm text-gray-800 bg-gray-50 rounded-lg">
                        {editableLocation || "—"}
                      </p>
                    )}
                  </div>

                  {/* Gender – UI only (editable but no backend) */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                      Gender
                    </label>
                    {isEditing ? (
                      <div className="relative">
                        <select
                          className="w-full rounded-lg border border-pink-100 bg-pink-50/40 px-4 py-2.5 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-pink-200"
                          value={editableGender}
                          onChange={(e) => setEditableGender(e.target.value)}
                        >
                          <option value="">Select gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                          <option value="prefer-not">Prefer not to say</option>
                        </select>
                        <ChevronDown
                          size={14}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                        />
                      </div>
                    ) : (
                      <p className="px-4 py-2.5 text-sm text-gray-800 bg-gray-50 rounded-lg">
                        {editableGender
                          ? editableGender.charAt(0).toUpperCase() + editableGender.slice(1)
                          : "—"}
                      </p>
                    )}
                  </div>

                  {/* Member Since */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                      Member Since
                    </label>
                    <p className="px-4 py-2.5 text-sm text-gray-500 bg-gray-100 rounded-lg">
                      {memberSince}
                    </p>
                  </div>
                </div>

                {/* Update Profile Button – only visible in edit mode */}
                {isEditing && (
                  <div className="mt-6 flex gap-3">
                    <button
                      onClick={handleUpdateProfile}
                      className="px-6 py-2.5 bg-pink-600 text-white text-sm font-semibold rounded-lg hover:bg-pink-700 transition-colors"
                    >
                      Update Profile
                    </button>
                  </div>
                )}
              </div>

              {/* Account Actions */}
              <div className="border-t border-pink-100 pt-6 mt-6 flex flex-wrap gap-3">
                <button
                  onClick={logout}
                  className="px-6 py-2.5 bg-pink-600 text-white text-sm font-semibold rounded-lg hover:bg-pink-700 transition-colors"
                >
                  <LogOut size={16} className="inline mr-2" /> Logout
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={deleting || loading}
                  className="px-6 py-2.5 border border-gray-300 text-gray-600 text-sm font-semibold rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  <Trash2 size={16} className="inline mr-2" />
                  {deleting ? "Deleting..." : "Delete Account"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Account?</h3>
            <p className="text-sm text-gray-500 mb-6">
              This action is permanent. Your account and all data will be deleted immediately.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default withAuth(ProfilePage);