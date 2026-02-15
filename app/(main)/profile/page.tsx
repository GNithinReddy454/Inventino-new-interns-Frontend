"use client";

import React, { useState } from "react";
// FIXED: Updated import path to match your actual project structure
import { useAuth } from "@/app/(main)/components/authContext";
import { 
  User, Package, MapPin, CreditCard, Settings, 
  ChevronRight, LogOut, ShieldCheck, Heart, Mail, 
  Clock, CheckCircle2, Truck 
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
    <div className="bg-[#fdf8f9] min-h-screen pt-20 md:pt-28 pb-20 font-sans">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* MOBILE HEADER */}
        <div className="bg-white p-6 rounded-[2rem] border border-pink-50 shadow-sm mb-6 md:hidden flex items-center gap-4">
          <div className="w-16 h-16 bg-pink-50 rounded-2xl flex items-center justify-center text-[#D94F7A]">
            <User size={30} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 leading-tight">{user?.name || "Guest User"}</h2>
            <p className="text-xs text-gray-400 font-medium">{user?.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
          <div className="lg:col-span-1">
            <div className="flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
              {[
                { id: "personal", label: "Personal Info", icon: User },
                { id: "orders", label: "My Orders", icon: Package },
                { id: "addresses", label: "Addresses", icon: MapPin },
                { id: "settings", label: "Settings", icon: Settings },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl font-bold text-sm transition-all whitespace-nowrap lg:w-full ${
                    activeTab === item.id 
                    ? "bg-[#D94F7A] text-white shadow-lg shadow-pink-100" 
                    : "bg-white text-gray-500 border border-gray-50 lg:border-none"
                  }`}
                >
                  <item.icon size={18} /> {item.label}
                </button>
              ))}
              <button 
                onClick={logout}
                className="flex items-center gap-3 px-5 py-3.5 rounded-2xl font-bold text-sm text-red-500 bg-white border border-red-50 lg:mt-4 lg:w-full"
              >
                <LogOut size={18} /> Logout
              </button>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-white rounded-[2.5rem] p-6 md:p-10 border border-pink-50 shadow-sm min-h-[400px]">
              {activeTab === "personal" && (
                <div className="animate-in fade-in duration-500">
                  <h2 className="text-2xl font-serif font-bold text-gray-900 mb-8">Personal Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1 p-5 bg-gray-50 rounded-2xl border border-gray-100">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#D94F7A]">Full Name</p>
                      <p className="font-bold text-gray-800">{user?.name || "Not provided"}</p>
                    </div>
                    <div className="space-y-1 p-5 bg-gray-50 rounded-2xl border border-gray-100">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#D94F7A]">Email Address</p>
                      <p className="font-bold text-gray-800">{user?.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "orders" && (
                <div className="animate-in fade-in duration-500 space-y-6">
                  <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6">Recent Orders</h2>
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="p-5 border border-gray-100 rounded-[2rem] flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${order.color}`}><order.icon size={22} /></div>
                          <div>
                            <p className="font-bold text-gray-900">{order.id}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{order.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-none pt-4 md:pt-0">
                          <p className="font-black text-gray-900">${order.total.toFixed(2)}</p>
                          <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${order.color}`}>{order.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}