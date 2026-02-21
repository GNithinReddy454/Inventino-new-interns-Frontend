"use client";

import React, { useState } from "react";
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

  return (
    <div className="bg-background min-h-screen pt-4 md:pt-8 pb-20 font-sans">
      <div className="max-w-6xl mx-auto px-4">

        <div className="max-w-3xl mx-auto">
          <div className="flex justify-center mb-4">
            <h1 className="inline-block px-8 py-3 bg-card border-2 border-border rounded-full text-2xl font-serif font-bold text-primary-dark shadow-sm">
              Profile Information
            </h1>
          </div>
          
          <div className="bg-card rounded-[2.5rem] p-6 md:p-10 border border-border shadow-sm min-h-[400px]">
            {activeTab === "personal" && (
              <div className="animate-in fade-in duration-500">
                <div className="bg-card p-6 rounded-[2rem] border border-border shadow-sm mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center text-primary-dark">
                      <User size={32} />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-foreground">{user?.name || "Guest User"}</p>
                      <p className="text-sm text-muted-foreground">{user?.email || "-"}</p>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-3 gap-3">
                    <Link href="/profile/orders" className="bg-card p-4 rounded-2xl text-center shadow-sm border border-border hover:border-primary/50 transition-colors">
                      <div className="flex items-center justify-center w-10 h-10 bg-accent rounded-lg mx-auto text-primary-dark"><Package size={18} /></div>
                      <p className="text-sm font-bold mt-3">Your Orders</p>
                    </Link>

                    <Link href="/wishlist" className="bg-card p-4 rounded-2xl text-center shadow-sm border border-border hover:border-primary/50 transition-colors">
                      <div className="flex items-center justify-center w-10 h-10 bg-accent rounded-lg mx-auto text-primary-dark"><Heart size={18} /></div>
                      <p className="text-sm font-bold mt-3">Your Wishlist</p>
                    </Link>

                    <Link href="/contact" className="bg-card p-4 rounded-2xl text-center shadow-sm border border-border hover:border-primary/50 transition-colors">
                      <div className="flex items-center justify-center w-10 h-10 bg-accent rounded-lg mx-auto text-primary-dark"><Mail size={18} /></div>
                      <p className="text-sm font-bold mt-3">Help & Support</p>
                    </Link>
                  </div>
                </div>

                <div className="bg-card rounded-2xl border border-border overflow-hidden">
                  {[
                    { label: "Your Wishlist", icon: Heart, href: "/wishlist" },
                    { label: "Help & Support", icon: Mail, href: "/contact" },
                    { label: "Saved Addresses", icon: MapPin, href: "/profile/addresses" },
                    { label: "Rewards", icon: ShieldCheck, href: "/rewards" },
                    { label: "Payment Management", icon: CreditCard, href: "/profile/payments" },
                    { label: "Settings", icon: Settings, href: "/profile/settings" },
                  ].map((it) => (
                    <Link key={it.label} href={it.href} className="flex items-center justify-between p-4 border-b border-border last:border-b-0 hover:bg-accent/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center text-primary-dark"><it.icon size={18} /></div>
                        <p className="font-medium text-foreground">{it.label}</p>
                      </div>
                      <ChevronRight size={18} className="text-muted-foreground" />
                    </Link>
                  ))}
                </div>

                <div className="pt-6">
                  <button
                    onClick={logout}
                    className="w-full flex items-center justify-center gap-3 px-4 py-4 rounded-2xl font-bold text-sm text-destructive bg-card border border-destructive/20 hover:bg-destructive/5 transition-colors shadow-sm"
                  >
                    <LogOut size={18} /> Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}