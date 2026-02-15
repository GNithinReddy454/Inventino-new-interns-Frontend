"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle2, Truck } from "lucide-react";

const orders = [
  { id: "INV-8829", date: "Feb 12, 2026", status: "In Transit", total: 129.99, icon: Truck, color: "text-blue-500 bg-blue-50" },
  { id: "INV-8742", date: "Jan 28, 2026", status: "Delivered", total: 85.0, icon: CheckCircle2, color: "text-emerald-500 bg-emerald-50" },
];

export default function OrdersPage() {
  return (
    <div className="bg-[#fdf8f9] min-h-screen pt-20 md:pt-28 pb-20 font-sans">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-[2.5rem] p-6 md:p-10 border border-pink-50 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-serif font-bold">My Orders</h1>
            <Link href="/profile" className="text-sm text-gray-500">Back to Profile</Link>
          </div>

          <div className="space-y-4">
            {orders.map((order) => (
              <Link key={order.id} href={`/profile/orders/${order.id}`} className="block">
                <div className="p-5 border border-gray-100 rounded-[2rem] flex items-center justify-between gap-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${order.color}`}><order.icon size={22} /></div>
                    <div>
                      <p className="font-bold text-gray-900">{order.id}</p>
                      <p className="text-[12px] text-gray-400">{order.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-gray-900">${order.total.toFixed(2)}</p>
                    <p className="text-[10px] uppercase mt-1 font-bold {order.color}">{order.status}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
