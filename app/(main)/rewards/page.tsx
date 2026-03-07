"use client";

import React, { useState } from "react";
import {
  Trophy,
  Gift,
  Star,
  History,
  ArrowLeft,
  ChevronRight,
  Zap,
  ShoppingBag,
  Sparkles,
  Percent,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";

export default function RewardsPage() {
  const [activeTab, setActiveTab] = useState("earn");

  const rewards = [
    {
      id: 1,
      title: "10% OFF Coupon",
      points: 500,
      desc: "Get 10% discount on your next purchase",
      code: "GIFT10",
    },
    {
      id: 2,
      title: "Free Shipping",
      points: 300,
      desc: "Valid for all orders above ₹999",
      code: "SHIPFREE",
    },
    {
      id: 3,
      title: "₹500 Gift Voucher",
      points: 2000,
      desc: "Can be used on any jewelry collection",
      code: "VOUCH500",
    },
  ];

  const history = [
    {
      id: 1,
      action: "Purchased Diamond Ring",
      points: "+450",
      date: "Feb 12, 2026",
    },
    {
      id: 2,
      action: "Redeemed 10% Coupon",
      points: "-500",
      date: "Jan 28, 2026",
    },
    { id: 3, action: "Daily Login Bonus", points: "+10", date: "Feb 15, 2026" },
  ];

  return (
    <div className="bg-[#fdf8f9] min-h-screen pt-4 md:pt-8 pb-20 font-sans">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/profile"
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-pink-600 shadow-sm border border-pink-50 hover:bg-pink-50 transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-serif font-bold text-[#D94F7A]">
            My Rewards
          </h1>
        </div>

        {/* Points Summary Card */}
        <div className="bg-gradient-to-br from-[#D94F7A] to-[#C0426A] rounded-[2.5rem] p-8 text-white shadow-xl shadow-pink-100 mb-8 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-pink-100 text-sm font-bold uppercase tracking-wider mb-1">
                  Available Points
                </p>
                <h2 className="text-5xl font-black mb-4">1,250</h2>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full w-fit">
                  <Star size={16} className="text-yellow-300 fill-yellow-300" />
                  <span className="text-sm font-bold">Gold Member</span>
                </div>
              </div>
              <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                <Trophy size={32} />
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/20">
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs font-bold text-pink-100">
                  750 points until Platinum
                </p>
                <p className="text-xs font-bold text-pink-100">62%</p>
              </div>
              <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full"
                  style={{ width: "62%" }}
                ></div>
              </div>
            </div>
          </div>
          {/* Decorative Background Circles */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-pink-400/20 rounded-full blur-3xl"></div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-1.5 bg-white rounded-2xl border border-pink-50 mb-8 max-w-sm mx-auto">
          <button
            onClick={() => setActiveTab("earn")}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === "earn" ? "bg-[#D94F7A] text-white shadow-sm" : "text-gray-500 hover:text-pink-600"}`}
          >
            Redeem
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === "history" ? "bg-[#D94F7A] text-white shadow-sm" : "text-gray-500 hover:text-pink-600"}`}
          >
            History
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "earn" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {rewards.map((reward) => (
              <div
                key={reward.id}
                className="bg-white p-6 rounded-[2rem] border border-pink-50 shadow-sm group hover:border-pink-200 transition-all"
              >
                <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center text-[#D94F7A] mb-4 group-hover:scale-110 transition-transform">
                  <Gift size={24} />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{reward.title}</h3>
                <p className="text-sm text-gray-500 mb-4 h-10">{reward.desc}</p>
                <div className="flex items-center justify-between pt-4 border-t border-pink-50">
                  <div className="flex items-center gap-1.5 text-pink-600 font-bold">
                    <Sparkles size={16} />
                    <span>{reward.points} Points</span>
                  </div>
                  <Button className="bg-[#D94F7A] hover:bg-[#C0426A] text-white rounded-xl h-10 font-bold px-6">
                    Redeem
                  </Button>
                </div>
              </div>
            ))}

            {/* Refer Section */}
            <div className="md:col-span-2 mt-4 bg-pink-50/50 rounded-[2rem] p-8 border border-dashed border-pink-200 flex flex-col md:flex-row items-center gap-6">
              <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center text-pink-600 shrink-0">
                <Zap size={40} className="fill-pink-600" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  Refer & Earn More!
                </h3>
                <p className="text-sm text-gray-600">
                  Invite your friends and earn 500 points for every successful
                  purchase they make.
                </p>
              </div>
              <Button
                variant="outline"
                className="border-pink-200 text-pink-600 hover:bg-white h-12 px-8 rounded-xl font-bold"
              >
                Share Link
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-[2rem] border border-pink-50 overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
            {history.map((item, idx) => (
              <div
                key={item.id}
                className={`flex items-center justify-between p-6 ${idx !== history.length - 1 ? "border-b border-pink-50" : ""}`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.points.startsWith("+") ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}
                  >
                    {item.points.startsWith("+") ? (
                      <Zap size={18} />
                    ) : (
                      <ShoppingBag size={18} />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">
                      {item.action}
                    </p>
                    <p className="text-xs text-gray-500 font-medium">
                      {item.date}
                    </p>
                  </div>
                </div>
                <p
                  className={`font-black ${item.points.startsWith("+") ? "text-emerald-500" : "text-red-500"}`}
                >
                  {item.points}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
