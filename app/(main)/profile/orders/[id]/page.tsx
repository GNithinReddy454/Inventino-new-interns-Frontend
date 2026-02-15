import React from "react";
import Link from "next/link";
import { Truck, CheckCircle2 } from "lucide-react";

const ORDERS = [
  { id: "INV-8829", date: "Feb 12, 2026", status: "In Transit", total: 129.99, items: [{ name: "Gold Pendant", qty: 1, price: 129.99 }], icon: Truck, color: "text-blue-500 bg-blue-50" },
  { id: "INV-8742", date: "Jan 28, 2026", status: "Delivered", total: 85.0, items: [{ name: "Silver Ring", qty: 1, price: 85.0 }], icon: CheckCircle2, color: "text-emerald-500 bg-emerald-50" },
];

export default function OrderDetails({ params }: { params: { id: string } }) {
  const id = params.id;
  const order = ORDERS.find((o) => o.id === id);

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold">Order not found</h2>
          <p className="text-gray-500 mt-2">We couldn't find an order with id {id}</p>
          <Link href="/profile/orders" className="inline-block mt-4 text-pink-600">Back to orders</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#fdf8f9] min-h-screen pt-20 md:pt-28 pb-20 font-sans">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-[2.5rem] p-6 md:p-10 border border-pink-50 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-serif font-bold">Order {order.id}</h1>
            <Link href="/profile/orders" className="text-sm text-gray-500">Back to Orders</Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="col-span-2">
              <div className="p-5 border border-gray-100 rounded-2xl">
                <p className="text-sm text-gray-400">Placed on</p>
                <p className="font-bold">{order.date}</p>
                <p className="text-sm text-gray-400 mt-3">Status</p>
                <p className="font-black uppercase {order.color}">{order.status}</p>
              </div>
            </div>
            <div>
              <div className="p-5 border border-gray-100 rounded-2xl text-right">
                <p className="text-sm text-gray-400">Total</p>
                <p className="font-black text-gray-900">${order.total.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {order.items.map((it, idx) => (
              <div key={idx} className="p-4 border border-gray-100 rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-bold">{it.name}</p>
                  <p className="text-sm text-gray-500">Quantity: {it.qty}</p>
                </div>
                <p className="font-black">${it.price.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
