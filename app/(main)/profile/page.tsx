"use client";

import React, { useState } from "react";
// FIXED: Updated import path to match your actual project structure
import { useAuth } from "@/app/(main)/components/authContext";
import {
  User, Package, MapPin, CreditCard, Settings,
  ChevronRight, LogOut, ShieldCheck, Heart, Mail,
  Clock, CheckCircle2, Truck, Plus
} from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("personal");

  const orders = [
    { id: "INV-8829", date: "Feb 12, 2026", status: "In Transit", total: 129.99, icon: Truck, color: "text-blue-500 bg-blue-50" },
    { id: "INV-8742", date: "Jan 28, 2026", status: "Delivered", total: 85.00, icon: CheckCircle2, color: "text-emerald-500 bg-emerald-50" }
  ];

  return (
    <div className="bg-[#fdf8f9] min-h-screen pt-4 md:pt-8 pb-20 font-sans">
      <div className="max-w-6xl mx-auto px-4">



        <div className="max-w-3xl mx-auto">
          <div className="flex justify-center mb-4">
            <h1 className="inline-block px-8 py-3 bg-white border-2 border-pink-100 rounded-full text-2xl font-serif font-bold text-[#D94F7A] shadow-sm">
              Profile Information
            </h1>
          </div>
          <div className="bg-white rounded-[2.5rem] p-6 md:p-10 border border-pink-50 shadow-sm min-h-[400px]">
            {activeTab === "personal" && (
              <div className="animate-in fade-in duration-500">
                <div className="bg-white p-6 rounded-[2rem] border border-pink-50 shadow-sm mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-pink-50 rounded-2xl flex items-center justify-center text-[#D94F7A]">
                      <User size={32} />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-900">{user?.name || "Guest User"}</p>
                      <p className="text-sm text-gray-500">{user?.email || "-"}</p>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-3 gap-3">
                    <Link href="/profile/orders" className="bg-white p-4 rounded-2xl text-center shadow-sm border border-gray-100">
                      <div className="flex items-center justify-center w-10 h-10 bg-gray-50 rounded-lg mx-auto text-pink-600"><Package size={18} /></div>
                      <p className="text-sm font-bold mt-3">Your Orders</p>
                    </Link>

                    <Link href="/wishlist" className="bg-white p-4 rounded-2xl text-center shadow-sm border border-gray-100">
                      <div className="flex items-center justify-center w-10 h-10 bg-gray-50 rounded-lg mx-auto text-pink-600"><Heart size={18} /></div>
                      <p className="text-sm font-bold mt-3">Your Wishlist</p>
                    </Link>

                    <Link href="/contact" className="bg-white p-4 rounded-2xl text-center shadow-sm border border-gray-100">
                      <div className="flex items-center justify-center w-10 h-10 bg-gray-50 rounded-lg mx-auto text-pink-600"><Mail size={18} /></div>
                      <p className="text-sm font-bold mt-3">Help & Support</p>
                    </Link>
                  </div>
                </div>

                {/* Zepto Cash & Gift Card removed per request */}

                <div className="bg-white rounded-2xl border border-gray-100">
                  {[
                    { label: "Your Wishlist", icon: Heart, href: "/wishlist" },
                    { label: "Help & Support", icon: Mail, href: "/contact" },
                    { label: "Saved Addresses", icon: MapPin, href: "/profile/addresses" },
                    { label: "Rewards", icon: ShieldCheck, href: "/rewards" },
                    { label: "Payment Management", icon: CreditCard, href: "/profile/payments" },
                    { label: "Settings", icon: Settings, href: "/profile/settings" },
                  ].map((it) => (
                    <Link key={it.label} href={it.href} className="flex items-center justify-between p-4 border-b last:border-b-0">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-pink-600"><it.icon size={18} /></div>
                        <p className="font-medium">{it.label}</p>
                      </div>
                      <ChevronRight size={18} className="text-gray-400" />
                    </Link>
                  ))}
                </div>

                <div className="p-4">
                  <button
                    onClick={logout}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm text-red-500 bg-white border border-red-50 mt-4"
                  >
                    <LogOut size={18} /> Logout
                  </button>
                </div>
              </div>
            )}

            {/* Orders are moved to the standalone /profile/orders page. */}
          </div>
        </div>
      </div>
    </div>
  );
}